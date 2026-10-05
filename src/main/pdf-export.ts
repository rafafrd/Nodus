import { app, BrowserWindow, session,nativeImage } from 'electron';
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
import { exportImage } from './export-images';
import { exportDestination } from './export-destination';
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
  chooseDestination(selected:string){const canonical=exportDestination(selected);this.store.transaction(()=>{this.store.setSetting('pdfDestination',canonical);this.store.audit('pdf:destination',null,'ok');});return canonical;}
  async export(raw: PdfExportInput): Promise<PdfExportResult> {
    const input = pdfExportInput.parse(raw);
    if (this.busy) throw new AppError('EXPORT_BUSY', 'Uma exportação já está em andamento. Aguarde terminar.');
    this.busy = true;
    try {
      const root=this.root(input.source === 'vault'?{source:'vault'}:{source:'project',projectId:input.projectId}),selected=exportFolder(root,input.folder);
      let book;
      if(input.source==='vault'&&input.noteId){const document=this.vault.open(input.noteId),body=document.text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,'');book={title:document.ref.title,notes:[{path:document.ref.path.split(path.sep).join('/'),title:document.ref.title,body}],skipped:0};}
      else book=collectExportNotes(selected);
      if (input.source === 'vault' && input.folder) book.title = this.label(input.folder);
      if(input.title)book.title=input.title;
      const warnings:string[]=[];let imageCount=0,imageBytes=0;
      const image=(notePath:string,source:string)=>{if(!input.includeImages)return null;try{if(++imageCount>50)throw new AppError('EXPORT_IMAGE','Limite de 50 imagens.');const png=exportImage(selected,notePath,source,bytes=>{const image=nativeImage.createFromBuffer(bytes);if(image.isEmpty())throw new AppError('EXPORT_IMAGE','Imagem inválida.');return image.toPNG();});imageBytes+=png.length;if(imageBytes>12*1024*1024)throw new AppError('EXPORT_IMAGE','Imagens acima de 12 MiB no total.');return`data:image/png;base64,${png.toString('base64')}`;}catch{if(warnings.length<20)warnings.push(`Imagem omitida na nota ${notePath.slice(0,160)}. Use PNG/JPEG local dentro da origem, até 2 MiB e 4 megapixels.`);return null;}};
      const html = exportDocument(book,image), isolated = session.fromPartition(`pdf-export-${randomUUID()}`);
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
        const destination=input.destination==='selected'?this.store.setting('pdfDestination'):app.getPath('downloads');if(!destination)throw new AppError('EXPORT_FOLDER','Escolha a pasta de destino primeiro.');if(input.destination==='selected')exportDestination(destination);
        const target = savePdfOutput(this.store,destination, book.title, pdf);
        return { state:'saved', path:target, notes:book.notes.length, bytes:pdf.length, skipped:book.skipped,warnings };
      } finally { if (timeout) clearTimeout(timeout); if (!print.isDestroyed()) print.destroy(); isolated.protocol.unhandle('nodus-pdf'); await isolated.clearStorageData().catch(() => {}); }
    } finally { this.busy = false; }
  }
}
