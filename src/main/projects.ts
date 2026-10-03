import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { Store } from './store';
import { AppError } from '../shared/contracts';
import { PROJECT_TEXT_LIMIT, projectFileInput, projectTreeInput, projectWriteInput, projectViewInput, type ProjectCatalog, type ProjectDocument, type ProjectTree, type ProjectSave, type ProjectView, type ProjectFileRef } from '../shared/projects';
import type { z } from 'zod';

const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const equalPath = (a: string, b: string) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
const inside = (root: string, file: string) => { const relative = path.relative(root, file); return !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep); };
export class Projects {
  constructor(readonly store: Store) {}
  private record(id: string) { const row = this.store.db.prepare('SELECT id,root,name FROM project_folders WHERE id=?').get(id) as { id: string; root: string; name: string } | undefined; if (!row) throw new AppError('NOT_FOUND', 'Projeto não encontrado.'); return row; }
  chooseRoot(selected: string) {
    const root = fs.realpathSync.native(selected); if (!fs.statSync(root).isDirectory() || equalPath(root, path.parse(root).root)) throw new AppError('INVALID_PROJECT', 'Escolha uma pasta de projeto.');
    const prior = this.store.db.prepare('SELECT id FROM project_folders WHERE root=?').get(root);
    const id = prior ? String(prior.id) : randomUUID();
    this.store.transaction(() => {
      if (!prior) { if (Number(this.store.db.prepare('SELECT count(*) n FROM project_folders').get()!.n) >= 40) throw new AppError('LIMIT', 'Limite de 40 projetos neste perfil.'); this.store.db.prepare('INSERT INTO project_folders(id,root,name) VALUES(?,?,?)').run(id, root, path.basename(root)); }
      const view = this.catalog().view; this.store.setSetting('projectView', JSON.stringify({ ...view, projectId: id })); this.store.audit('project.select', id, 'ok');
    }); return this.catalog();
  }
  private resolve(id: string, relative: string) {
    const { root } = this.record(id);
    try {
      if (fs.lstatSync(root).isSymbolicLink() || !equalPath(fs.realpathSync.native(root), root)) throw new AppError('UNSAFE_PATH', 'A pasta do projeto mudou de destino. Selecione-a novamente.');
      let current = root;
      for (const part of relative ? relative.split('/') : []) { current = path.join(current, part); if (fs.lstatSync(current).isSymbolicLink()) throw new AppError('UNSAFE_PATH', 'Links e junctions não são abertos pelo Explorer.'); }
      const canonical = fs.realpathSync.native(current); if (!inside(root, canonical)) throw new AppError('UNSAFE_PATH', 'Arquivo fora do projeto.');
      if (path.relative(root, canonical).split(path.sep).some(part => part.toLowerCase() === '.git')) throw new AppError('UNSAFE_PATH', 'Metadados Git não são editados pelo Explorer.'); return canonical;
    } catch (e) { if (e instanceof AppError) throw e; throw new AppError('NOT_FOUND', 'Pasta ou arquivo indisponível. Seu rascunho permanece preservado.'); }
  }
  catalog(): ProjectCatalog {
    const projects = (this.store.db.prepare('SELECT id,name FROM project_folders ORDER BY rowid').all() as { id: string; name: string }[]).map(p => { let available = false; try { available = fs.statSync(this.resolve(p.id, '')).isDirectory(); } catch {} return { ...p, available }; });
    const parsed = projectViewInput.safeParse(JSON.parse(this.store.setting('projectView') ?? 'null'));
    return { projects, view: parsed.success ? parsed.data : { projectId: projects[0]?.id ?? null, tabs: [], active: null } };
  }
  view(raw: ProjectView) { const input = projectViewInput.parse(raw); if (input.projectId) this.record(input.projectId); for (const ref of input.tabs) this.record(ref.projectId); if (input.active && !input.tabs.some(t => t.projectId === input.active!.projectId && t.path === input.active!.path)) throw new AppError('INVALID_VIEW', 'A aba ativa precisa estar aberta.'); this.store.transaction(() => this.store.setSetting('projectView', JSON.stringify(input))); return input; }
  tree(raw: z.infer<typeof projectTreeInput>): ProjectTree {
    const input = projectTreeInput.parse(raw), folder = this.resolve(input.projectId, input.path); if (!fs.statSync(folder).isDirectory()) throw new AppError('NOT_DIRECTORY', 'Escolha uma pasta.');
    const entries: ProjectTree['entries'] = [], directory = fs.opendirSync(folder); let truncated = false;
    try { let entry: fs.Dirent | null; while ((entry = directory.readSync())) { if (entry.name.toLowerCase() === '.git' || entry.name === 'node_modules') continue; if (entries.length >= 500) { truncated = true; break; } entries.push({ name: entry.name, path: input.path ? `${input.path}/${entry.name}` : entry.name, kind: entry.isSymbolicLink() ? 'link' : entry.isDirectory() ? 'directory' : 'file' }); } } finally { directory.closeSync(); }
    entries.sort((a, b) => Number(b.kind === 'directory') - Number(a.kind === 'directory') || a.name.localeCompare(b.name, 'pt-BR')); return { entries, truncated };
  }
  private bytes(file: string) { const fd = fs.openSync(file, 'r'); try { const stat = fs.fstatSync(fd); if (!stat.isFile() || stat.size > PROJECT_TEXT_LIMIT) throw new AppError('FILE_LIMIT', 'Abra um arquivo de texto de até 1 MiB.'); const buffer = Buffer.alloc(PROJECT_TEXT_LIMIT + 1); let size = 0, count = 0; while (size < buffer.length && (count = fs.readSync(fd, buffer, size, buffer.length - size, null))) size += count; if (size > PROJECT_TEXT_LIMIT) throw new AppError('FILE_LIMIT', 'Abra um arquivo de texto de até 1 MiB.'); const bytes = buffer.subarray(0, size); if (bytes.includes(0)) throw new AppError('BINARY_FILE', 'Este arquivo não é texto UTF-8 compatível.'); try { new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); } catch { throw new AppError('ENCODING', 'Este editor trabalha com texto UTF-8. O arquivo não foi alterado.'); } return bytes; } finally { fs.closeSync(fd); } }
  open(raw: ProjectFileRef): ProjectDocument {
    const input = projectFileInput.parse(raw); this.record(input.projectId);
    const row = this.store.db.prepare('SELECT text,base_hash FROM project_drafts WHERE project_id=? AND path=?').get(input.projectId, input.path);
    const draft = row ? { text: String(row.text), baseHash: String(row.base_hash) } : null;
    try { const bytes = this.bytes(this.resolve(input.projectId, input.path)); return { ...input, text: bytes.toString('utf8'), hash: hash(bytes), draft, missing: false }; }
    catch (e) { if (e instanceof AppError && e.code === 'NOT_FOUND' && draft) return { ...input, text: '', hash: null, draft, missing: true }; throw e; }
  }
  draft(raw: z.infer<typeof projectWriteInput>) {
    const input = projectWriteInput.parse(raw); this.record(input.projectId); if (Buffer.byteLength(input.text, 'utf8') > PROJECT_TEXT_LIMIT) throw new AppError('FILE_LIMIT', 'Rascunho excede 1 MiB.');
    this.store.transaction(() => this.store.db.prepare('INSERT INTO project_drafts(project_id,path,text,base_hash) VALUES(?,?,?,?) ON CONFLICT(project_id,path) DO UPDATE SET text=excluded.text,base_hash=excluded.base_hash').run(input.projectId, input.path, input.text, input.hash));
  }
  private recovery(text: string | Buffer) { const directory = path.join(this.store.directory, 'project-recovery'); fs.mkdirSync(directory, { recursive: true }); fs.writeFileSync(path.join(directory, randomUUID() + '.txt'), text, { flag: 'wx' }); }
  save(raw: z.infer<typeof projectWriteInput>): ProjectSave {
    const input = projectWriteInput.parse(raw), ref = { projectId: input.projectId, path: input.path }; this.draft(input); const current = this.open(ref); if (current.missing || !current.hash) throw new AppError('NOT_FOUND', 'Arquivo indisponível; rascunho preservado.');
    if (current.hash !== input.hash) return { state: 'conflict', external: current };
    const target = this.resolve(input.projectId, input.path), original = this.bytes(target), temporary = path.join(path.dirname(target), `.nodus-${randomUUID()}.tmp`);
    this.recovery(original);
    try {
      fs.writeFileSync(temporary, input.text, { flag: 'wx', mode: fs.statSync(target).mode & 0o777 });
      const checked = this.resolve(input.projectId, input.path);
      if (!equalPath(target, checked) || hash(this.bytes(checked)) !== input.hash) return { state: 'conflict', external: this.open(ref) };
      fs.renameSync(temporary, target);
      this.store.transaction(() => { this.store.db.prepare('DELETE FROM project_drafts WHERE project_id=? AND path=?').run(input.projectId, input.path); this.store.audit('project.save', input.projectId, 'ok'); });
      return { state: 'saved', document: this.open(ref) };
    } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  discard(raw: ProjectFileRef): ProjectDocument {
    const input = projectFileInput.parse(raw), current = this.open(input); if (current.missing) throw new AppError('NOT_FOUND', 'Arquivo indisponível; rascunho preservado.'); if (current.draft) this.recovery(current.draft.text);
    this.store.transaction(() => { this.store.db.prepare('DELETE FROM project_drafts WHERE project_id=? AND path=?').run(input.projectId, input.path); this.store.audit('project.draft-discard', input.projectId, 'ok'); }); return this.open(input);
  }
}
