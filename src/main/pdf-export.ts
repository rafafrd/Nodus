import { app, BrowserWindow, session } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AppError } from '../shared/contracts';
import { pdfSourceInput, pdfExportInput, type PdfSource, type PdfFolder, type PdfExportInput, type PdfExportResult } from '../shared/pdf-export';
import { collectExportNotes, exportFolders, exportFolder } from './export-notes';
import { exportDocument, PDF_CSP } from './pdf-document';
import { savePdfOutput } from './export-output';
import { Store } from './store';
import { Vault } from './vault';
const URL = 'nodus-pdf://document/index.html';
export class PdfExporter {
  private busy = false;
  constructor(readonly store: Store, readonly vault: Vault) {}
  private root(raw: PdfSource) {
    const input = pdfSourceInput.parse(raw);
    const record = input.source === 'project' ? this.store.db.prepare('SELECT root FROM project_folders WHERE id=?').get(input.projectId) : null;
    if (input.source === 'project' && !record) throw new AppError('NOT_FOUND', 'Projeto não encontrado.');
    const selected = input.source === 'vault' ? this.store.setting('vault') : String(record!.root);
    if (!selected) throw new AppError('VAULT_REQUIRED', 'Escolha uma pasta de notas primeiro.');
    if (fs.lstatSync(selected).isSymbolicLink()) throw new AppError('EXPORT_FOLDER', 'A origem não pode ser um link ou junction.');
    const canonical = fs.realpathSync.native(selected);
    if (canonical.toLowerCase() !== path.resolve(selected).toLowerCase() || !fs.statSync(canonical).isDirectory() || canonical === path.parse(canonical).root || canonical.split(path.sep).some(part => part.toLowerCase() === '.git')) throw new AppError('EXPORT_FOLDER', 'A origem mudou ou não é uma pasta de notas válida. Confira a pasta no app.');
    return canonical;
  }
  private label(folder: string) {
    if (!folder) return 'Pasta inteira';
    const [first, ...rest] = folder.split('/');
    const subject = this.store.db.prepare('SELECT name FROM subjects WHERE id=?').get(first);
    return [subject ? String(subject.name) : first, ...rest].join(' / ');
  }
  folders(input: PdfSource): PdfFolder[] { return exportFolders(this.root(input)).map(folder => ({ path: folder, label: this.label(folder) })); }
  async export(raw: PdfExportInput): Promise<PdfExportResult> {
    const input = pdfExportInput.parse(raw);
    if (this.busy) throw new AppError('EXPORT_BUSY', 'Uma exportação já está em andamento. Aguarde terminar.');
    this.busy = true;
    try {
      const book = collectExportNotes(exportFolder(this.root(input.source === 'vault' ? {source:'vault'} : {source:'project',projectId:input.projectId}), input.folder));
      if (input.source === 'vault' && input.folder) book.title = this.label(input.folder);
      const html = exportDocument(book), isolated = session.fromPartition(`pdf-export-${randomUUID()}`);
      isolated.setPermissionRequestHandler((_wc, _permission, done) => done(false)); isolated.setPermissionCheckHandler(() => false);
      isolated.on('will-download', event => event.preventDefault());
      isolated.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (request, done) => done({ cancel: request.url !== URL }));
      isolated.protocol.handle('nodus-pdf', request => new Response(request.url === URL ? html : '', { status: request.url === URL ? 200 : 404, headers: { 'Content-Type':'text/html; charset=utf-8', 'Content-Security-Policy':PDF_CSP } }));
      const print = new BrowserWindow({ show:false, width:794, height:1123, webPreferences:{ session:isolated, sandbox:true, contextIsolation:true, nodeIntegration:false, nodeIntegrationInSubFrames:false, nodeIntegrationInWorker:false, webSecurity:true, webviewTag:false, javascript:false, disableDialogs:true } });
      print.webContents.setWindowOpenHandler(() => ({ action:'deny' }));
      print.webContents.on('will-navigate', event => event.preventDefault()); print.webContents.on('will-redirect', event => event.preventDefault());
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const pdf = await Promise.race([ (async () => { await print.loadURL(URL); return print.webContents.printToPDF({ pageSize:'A4', printBackground:true, preferCSSPageSize:true, generateTaggedPDF:true, generateDocumentOutline:true }); })(), new Promise<never>((_resolve, reject) => { timeout = setTimeout(() => reject(new AppError('EXPORT_TIMEOUT', 'A geração demorou demais. Escolha uma subpasta menor.')), 60_000); }) ]);
        if (!pdf.subarray(0,5).equals(Buffer.from('%PDF-')) || pdf.length > 32 * 1024 * 1024) throw new AppError('EXPORT_SIZE', 'O PDF não pôde ser preparado dentro do limite. Escolha uma subpasta menor.');
        const target = savePdfOutput(this.store, app.getPath('downloads'), book.title, pdf);
        return { state:'saved', path:target, notes:book.notes.length, bytes:pdf.length, skipped:book.skipped };
      } finally { if (timeout) clearTimeout(timeout); if (!print.isDestroyed()) print.destroy(); isolated.protocol.unhandle('nodus-pdf'); await isolated.clearStorageData().catch(() => {}); }
    } finally { this.busy = false; }
  }
}
