import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { AppError, type NoteRef, type NoteDocument, type SaveResult } from '../shared/contracts';
import { Store } from './store';
const MAX_BYTES = 2 * 1024 * 1024;
export const hashText = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');
export function contained(root: string, target: string) {
  const relative = path.relative(root, target);
  return relative !== '' && !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative);
}
function identity(text: string) {
  const header = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
  const ids = [...header.matchAll(/^study_id:\s*([\w-]+)\s*$/gm)];
  const subjects = [...header.matchAll(/^study_subject:\s*([\w-]+)\s*$/gm)];
  return { id: ids.length === 1 ? ids[0][1] : null, subjectId: subjects.length === 1 ? subjects[0][1] : null, header };
}
export class Vault {
  constructor(readonly store: Store) {}
  root() {
    const root = this.store.setting('vault');
    if (!root) throw new AppError('VAULT_REQUIRED', 'Escolha uma pasta de notas primeiro.');
    try { const canonical = fs.realpathSync.native(root); if (!fs.statSync(canonical).isDirectory()) throw Error(); return canonical; }
    catch { throw new AppError('VAULT_MISSING', 'A pasta de notas não está disponível. Localize-a novamente.'); }
  }
  selectRoot(directory: string) {
    const root = fs.realpathSync.native(directory);
    if (!fs.statSync(root).isDirectory()) throw new AppError('INVALID_VAULT', 'Escolha uma pasta.');
    const old = this.store.setting('vault');
    if (old && path.resolve(old).toLowerCase() !== root.toLowerCase() && Number(this.store.db.prepare('SELECT COUNT(*) AS n FROM notes').get()?.n) > 0) throw new AppError('VAULT_IN_USE', 'Este MVP usa um vault por banco. Volte à pasta já vinculada para preservar suas referências.');
    this.store.setSetting('vault', root); this.store.audit('vault.select', null, 'ok'); return root;
  }
  resolve(relative: string, creating = false): string {
    const root = this.root();
    if (!relative || /[\\:\0]/.test(relative) || path.isAbsolute(relative) || relative.split('/').some(p => !p || p === '.' || p === '..') || !relative.endsWith('.md')) throw new AppError('INVALID_PATH', 'Caminho de nota inválido.');
    const target = path.resolve(root, relative);
    if (!contained(root, target)) throw new AppError('FORBIDDEN_PATH', 'A nota precisa estar dentro do vault.');
    let cursor = root;
    for (const piece of relative.split('/')) {
      cursor = path.join(cursor, piece);
      if (!fs.existsSync(cursor)) { if (creating) continue; throw new AppError('NOTE_MISSING', 'Arquivo de nota ausente. Seu rascunho permanece recuperável.'); }
      if (fs.lstatSync(cursor).isSymbolicLink()) throw new AppError('FORBIDDEN_PATH', 'Links simbólicos não são permitidos nas notas do vault.');
      if (!contained(root, fs.realpathSync.native(cursor))) throw new AppError('FORBIDDEN_PATH', 'Caminho fora do vault.');
    }
    return target;
  }
  readFile(relative: string) {
    const file = this.resolve(relative);
    if (!fs.statSync(file).isFile() || fs.statSync(file).size > MAX_BYTES) throw new AppError('NOTE_SIZE', 'A nota deve ser um arquivo Markdown de até 2 MiB.');
    const bytes = fs.readFileSync(file);
    try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
    catch { throw new AppError('NOTE_ENCODING', 'A nota precisa estar em UTF-8. O arquivo original foi preservado.'); }
  }
  list(subjectId: string): NoteRef[] {
    this.store.requireSubject(subjectId);
    return this.store.db.prepare('SELECT id,subject_id AS subjectId,path,title,hash,revision FROM notes WHERE subject_id=? ORDER BY rowid').all(subjectId) as NoteRef[];
  }
  ref(id: string): NoteRef {
    const ref = this.store.db.prepare('SELECT id,subject_id AS subjectId,path,title,hash,revision FROM notes WHERE id=?').get(id) as NoteRef | undefined;
    if (!ref) throw new AppError('NOT_FOUND', 'Nota não encontrada.');
    return ref;
  }
  verify(text: string, ref: Pick<NoteRef, 'id' | 'subjectId'>) {
    const meta = identity(text);
    if (meta.id !== ref.id || meta.subjectId !== ref.subjectId) throw new AppError('NOTE_IDENTITY', 'Os campos study_id e study_subject devem manter a identidade da nota. O buffer foi preservado.');
    if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) throw new AppError('NOTE_SIZE', 'A nota ultrapassa 2 MiB.');
  }
  open(id: string): NoteDocument {
    const ref = this.ref(id); const text = this.readFile(ref.path); this.verify(text, ref); const hash = hashText(text);
    if (ref.hash !== hash) {
      this.store.db.prepare('UPDATE notes SET hash=?,revision=revision+1 WHERE id=?').run(hash, id); ref.hash = hash; ref.revision++;
    }
    const draft = this.store.db.prepare('SELECT text,base_hash AS baseHash FROM drafts WHERE note_id=?').get(id) as NoteDocument['draft'];
    return { ref, text, hash, draft: draft ?? null };
  }
  create(input: { subjectId: string; title: string }) {
    this.store.requireSubject(input.subjectId);
    const id = randomUUID(), relative = `${input.subjectId}/${id}.md`;
    const target = this.resolve(relative, true);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    this.resolve(relative, true);
    const text = `---\nstudy_id: ${id}\nstudy_subject: ${input.subjectId}\n---\n# ${input.title.replace(/[\r\n]/g, ' ')}\n\n`;
    fs.writeFileSync(target, text, { flag: 'wx', encoding: 'utf8' });
    this.store.db.prepare('INSERT INTO notes(id,subject_id,path,title,hash,revision) VALUES(?,?,?,?,?,1)').run(id, input.subjectId, relative, input.title, hashText(text));
    this.store.audit('note.create', id, 'ok'); return this.open(id);
  }
  import(subjectId: string, selected: string) {
    this.store.requireSubject(subjectId);
    const root = this.root();
    const relative = path.relative(root, selected).split(path.sep).join('/');
    this.resolve(relative); let text = this.readFile(relative);
    const meta = identity(text);
    if ((!meta.id || !meta.subjectId) && /^(study_id|study_subject):/m.test(meta.header)) throw new AppError('NOTE_IDENTITY', 'Identidade incompleta ou duplicada; confira o frontmatter antes de importar.');
    const id = meta.id ?? randomUUID();
    if (!/^[0-9a-f-]{36}$/i.test(id) || meta.subjectId && meta.subjectId !== subjectId) throw new AppError('NOTE_IDENTITY', 'Esta nota já está vinculada a outra matéria ou possui ID inválido.');
    const previous = this.store.db.prepare('SELECT path FROM notes WHERE id=?').get(id);
    if (previous && previous.path !== relative) throw new AppError('DUPLICATE_ID', 'Outra nota usa este ID. O arquivo não foi alterado.');
    if (previous) return this.open(id);
    if (!meta.id) {
      const eol = text.includes('\r\n') ? '\r\n' : '\n';
      const fields = `study_id: ${id}${eol}study_subject: ${subjectId}${eol}`;
      const bom = text.startsWith('\uFEFF') ? '\uFEFF' : '';
      const body = text.slice(bom.length);
      const withMeta = bom + (body.startsWith('---' + eol) ? '---' + eol + fields + body.slice(3 + eol.length) : '---' + eol + fields + '---' + eol + body);
      this.replace(relative, text, withMeta); text = withMeta;
    }
    const title = text.match(/^# (.+)$/m)?.[1]?.trim().slice(0, 160) ?? path.basename(relative, '.md');
    this.store.db.prepare('INSERT INTO notes(id,subject_id,path,title,hash,revision) VALUES(?,?,?,?,?,1)').run(id, subjectId, relative, title, hashText(text));
    this.store.audit('note.import', id, 'ok'); return this.open(id);
  }
  draft(input: { id: string; text: string; hash: string }) {
    this.ref(input.id);
    this.store.db.prepare('INSERT INTO drafts(note_id,text,base_hash,updated_at) VALUES(?,?,?,?) ON CONFLICT(note_id) DO UPDATE SET text=excluded.text,base_hash=excluded.base_hash,updated_at=excluded.updated_at').run(input.id, input.text, input.hash, Date.now());
    return null;
  }
  archive(name: string, text: string) {
    const dir = path.join(this.store.directory, 'recovery'); fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${name}-${hashText(text)}.md`);
    if (!fs.existsSync(file)) fs.writeFileSync(file, text, { flag: 'wx', encoding: 'utf8' });
  }
  replace(relative: string, original: string, text: string) {
    const target = this.resolve(relative);
    const temp = path.join(path.dirname(target), `.study-${randomUUID()}.tmp`);
    const fd = fs.openSync(temp, 'wx');
    try {
      fs.writeFileSync(fd, text, 'utf8'); fs.fsyncSync(fd);
    } finally { fs.closeSync(fd); }
    try {
      if (hashText(this.readFile(relative)) !== hashText(original)) throw new AppError('CONFLICT', 'O arquivo mudou durante o salvamento. Conserve as duas versões.');
      this.archive('previous', original);
      this.resolve(relative); fs.renameSync(temp, target);
    } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
  }
  save(input: { id: string; text: string; hash: string }): SaveResult {
    this.draft(input);
    const ref = this.ref(input.id); this.verify(input.text, ref);
    const external = this.open(input.id);
    if (external.hash !== input.hash) { this.store.audit('note.save', input.id, 'conflict'); return { state: 'conflict', external }; }
    this.replace(ref.path, external.text, input.text);
    this.store.transaction(() => {
      this.store.db.prepare('UPDATE notes SET hash=?,revision=revision+1 WHERE id=?').run(hashText(input.text), input.id);
      this.store.db.prepare('DELETE FROM drafts WHERE note_id=?').run(input.id);
      this.store.audit('note.save', input.id, 'ok');
    });
    return { state: 'saved', document: this.open(input.id) };
  }
  discard(id: string) {
    const doc = this.open(id);
    if (doc.draft) this.archive('draft', doc.draft.text);
    this.store.db.prepare('DELETE FROM drafts WHERE note_id=?').run(id); return this.open(id);
  }
}
