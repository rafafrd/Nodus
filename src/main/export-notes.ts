import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '../shared/contracts';
export const EXPORT_LIMITS = { fileBytes: 2 * 1024 * 1024, totalBytes: 6 * 1024 * 1024, notes: 200, entries: 4000, depth: 16 };
export type ExportNote = { path: string; title: string; body: string };
export type ExportBook = { title: string; notes: ExportNote[]; skipped: number };
const auxiliary = (name: string) => name.startsWith('.') || ['node_modules', 'dist', 'release'].includes(name.toLowerCase());
const within = (root: string, file: string) => { const rel = path.relative(root, file); return !!rel && !path.isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + path.sep); };
function safePath(root: string, relative: string) {
  let cursor = root;
  for (const part of relative.split(path.sep)) {
    if (!part || part === '.' || part === '..' || /[:\0]/.test(part)) throw new AppError('EXPORT_PATH', 'Caminho de nota inválido.');
    cursor = path.join(cursor, part);
    if (fs.lstatSync(cursor).isSymbolicLink()) throw new AppError('EXPORT_PATH', 'A exportação não segue links ou junctions.');
    const canonical = fs.realpathSync.native(cursor);
    if (!within(root, canonical) || path.relative(root, canonical).split(path.sep).some(auxiliary)) throw new AppError('EXPORT_PATH', 'A nota precisa estar na pasta escolhida, fora de pastas auxiliares.');
  }
  return cursor;
}
export function exportFolder(root: string, relative: string) {
  if (relative.includes('\\') || path.isAbsolute(relative)) throw new AppError('EXPORT_PATH', 'Escolha uma pasta dentro da origem.');
  const folder = relative ? safePath(root, relative.split('/').join(path.sep)) : root;
  if (!fs.statSync(folder).isDirectory()) throw new AppError('EXPORT_FOLDER', 'Escolha uma pasta, não um arquivo.');
  return folder;
}
function walkExportFolder(root: string, onFolder: (relative: string) => void, onFile: (relative: string) => void) {
  let entries = 0, skipped = 0;
  function walk(relative: string, depth: number) {
    if (depth > EXPORT_LIMITS.depth) throw new AppError('EXPORT_LIMIT', 'A pasta ultrapassa 16 níveis. Escolha uma subpasta menor.');
    const directory = relative ? safePath(root, relative) : root;
    const handle = fs.opendirSync(directory);
    try { let entry: fs.Dirent | null; while ((entry = handle.readSync())) {
      if (++entries > EXPORT_LIMITS.entries) throw new AppError('EXPORT_LIMIT', 'A pasta tem muitos itens. Escolha uma origem menor.');
      if (auxiliary(entry.name) || entry.isSymbolicLink()) { skipped++; continue; }
      const next = path.join(relative, entry.name);
      if (entry.isDirectory()) { safePath(root, next); onFolder(next); walk(next, depth + 1); }
      else if (entry.isFile()) onFile(next);
    } } finally { handle.closeSync(); }
  }
  walk('', 0); return skipped;
}
export function exportFolders(root: string) {
  const folders = ['']; walkExportFolder(root, relative => folders.push(relative.split(path.sep).join('/')), () => {});
  return folders.sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}
function read(root: string, relative: string) {
  const file = safePath(root, relative), fd = fs.openSync(file, 'r');
  try {
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.size > EXPORT_LIMITS.fileBytes) throw new AppError('EXPORT_SIZE', 'Cada nota deve ter até 2 MiB. Nenhum arquivo original foi alterado.');
    const bytes = Buffer.alloc(EXPORT_LIMITS.fileBytes + 1); let length = 0;
    while (length < bytes.length) { const n = fs.readSync(fd, bytes, length, bytes.length - length, null); if (!n) break; length += n; }
    const after = fs.fstatSync(fd), current = fs.statSync(safePath(root, relative));
    if (after.dev !== current.dev || after.ino !== current.ino || before.size !== after.size || before.mtimeMs !== after.mtimeMs) throw new AppError('EXPORT_CHANGED', 'Uma nota mudou durante a leitura. Tente exportar novamente.');
    if (length > EXPORT_LIMITS.fileBytes) throw new AppError('EXPORT_SIZE', 'Uma nota ultrapassa 2 MiB.');
    try { const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, length)); if (text.includes('\0')) throw Error(); return { text, bytes: length }; }
    catch { throw new AppError('EXPORT_ENCODING', 'As notas da exportação precisam ser texto UTF-8 válido. Confira a pasta escolhida.'); }
  } finally { fs.closeSync(fd); }
}
export function collectExportNotes(selected: string): ExportBook {
  if (!path.isAbsolute(selected) || fs.lstatSync(selected).isSymbolicLink()) throw new AppError('EXPORT_FOLDER', 'Escolha uma pasta regular, sem link ou junction.');
  const root = fs.realpathSync.native(selected);
  if (!fs.statSync(root).isDirectory() || root === path.parse(root).root || root.split(path.sep).some(part => part.toLowerCase() === '.git')) throw new AppError('EXPORT_FOLDER', 'Escolha uma pasta de notas.');
  const files: string[] = [];
  const skipped = walkExportFolder(root, () => {}, relative => { if (/\.md$/i.test(relative)) { files.push(relative); if (files.length > EXPORT_LIMITS.notes) throw new AppError('EXPORT_LIMIT', 'Exporte até 200 notas por vez. Escolha uma subpasta menor.'); } });
  if (!files.length) throw new AppError('EXPORT_EMPTY', 'Esta pasta não contém notas Markdown (.md).');
  let total = 0;
  const notes = files.sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }) || (a < b ? -1 : 1)).map(relative => {
    const source = read(root, relative); total += source.bytes;
    if (total > EXPORT_LIMITS.totalBytes) throw new AppError('EXPORT_LIMIT', 'As notas ultrapassam 6 MiB no total. Escolha uma subpasta menor.');
    const body = source.text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
    const title = body.match(/^# ([^\r\n]+)(?:\r?\n|$)/m)?.[1].trim().replace(/[`*_]/g, '') || path.basename(relative, path.extname(relative));
    return { path: relative.split(path.sep).join('/'), title: title.slice(0, 200), body };
  });
  return { title: path.basename(root), notes, skipped };
}
