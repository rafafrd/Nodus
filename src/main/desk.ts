import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { z } from 'zod';
import { AppError, type Desk, type Material, deskInput } from '../shared/contracts';
import { Store } from './store';
export class Desks {
  constructor(readonly store: Store) {}
  get(subjectId: string): Desk {
    this.store.requireSubject(subjectId);
    const row = this.store.db.prepare('SELECT subject_id AS subjectId,note_id AS noteId,material_id AS materialId,page,split,tool,preview,next_step_id AS nextStepId FROM desks WHERE subject_id=?').get(subjectId);
    if (!row) throw new AppError('NOT_FOUND', 'Mesa não encontrada.');
    return { ...row, preview: Boolean(row.preview) } as Desk;
  }
  open(subjectId: string) { const desk = this.get(subjectId); this.store.setSetting('activeSubject', subjectId); return desk; }
  save(input: z.infer<typeof deskInput>): Desk {
    return this.store.transaction(() => {
      const desk = { ...this.get(input.subjectId), ...input };
      for (const [id, table] of [[desk.noteId, 'notes'], [desk.materialId, 'materials']] as const) {
        if (id && !this.store.db.prepare(`SELECT id FROM ${table} WHERE id=? AND subject_id=?`).get(id, input.subjectId)) throw new AppError('INVALID_REFERENCE', 'A referência precisa pertencer a esta matéria.');
      }
      if (desk.nextStepId && !this.store.db.prepare('SELECT steps.id FROM steps JOIN tasks ON tasks.id=steps.task_id WHERE steps.id=? AND tasks.subject_id=?').get(desk.nextStepId, input.subjectId)) throw new AppError('INVALID_REFERENCE', 'A próxima etapa precisa pertencer a esta matéria.');
      this.store.db.prepare('UPDATE desks SET note_id=?,material_id=?,page=?,split=?,tool=?,preview=?,next_step_id=? WHERE subject_id=?').run(desk.noteId, desk.materialId, desk.page, desk.split, desk.tool, Number(desk.preview), desk.nextStepId, desk.subjectId);
      return this.get(input.subjectId);
    });
  }
  listMaterials(subjectId: string): Material[] { this.store.requireSubject(subjectId); return this.store.db.prepare('SELECT id,subject_id AS subjectId,name FROM materials WHERE subject_id=? ORDER BY rowid').all(subjectId) as Material[]; }
  material(id: string) {
    const row = this.store.db.prepare('SELECT id,subject_id AS subjectId,path,name FROM materials WHERE id=?').get(id) as Material & { path: string } | undefined;
    if (!row) throw new AppError('NOT_FOUND', 'Documento não encontrado.'); return row;
  }
  read(id: string): Uint8Array {
    const material = this.material(id);
    let fd: number | undefined;
    try {
      if (fs.realpathSync.native(material.path) !== material.path) throw new AppError('PDF_UNAVAILABLE', 'O caminho do PDF mudou. Localize o arquivo novamente.');
      fd = fs.openSync(material.path, 'r'); const stat = fs.fstatSync(fd);
      if (!stat.isFile() || stat.size < 8 || stat.size > 100 * 1024 * 1024) throw new AppError('INVALID_PDF', 'O PDF deve ter até 100 MiB e conteúdo válido.');
      const bytes = Buffer.alloc(stat.size); let offset = 0;
      while (offset < bytes.length) { const n = fs.readSync(fd, bytes, offset, bytes.length - offset, offset); if (!n) throw new AppError('INVALID_PDF', 'O PDF mudou durante a leitura. Tente novamente.'); offset += n; }
      if (!bytes.subarray(0, 1024).includes(Buffer.from('%PDF-'))) throw new AppError('INVALID_PDF', 'Este arquivo não contém um PDF válido.');
      this.store.audit('material.read', id, 'ok'); return new Uint8Array(bytes);
    } catch (error) { if (error instanceof AppError) throw error; throw new AppError('PDF_UNAVAILABLE', 'PDF ausente ou indisponível. Localize o arquivo novamente.'); }
    finally { if (fd !== undefined) fs.closeSync(fd); }
  }
  choose(subjectId: string, selected: string, replaceId?: string): Material {
    this.store.requireSubject(subjectId);
    if (replaceId && this.material(replaceId).subjectId !== subjectId) throw new AppError('INVALID_REFERENCE', 'Documento de outra matéria.');
    const file = fs.realpathSync.native(selected);
    if (path.extname(file).toLowerCase() !== '.pdf' || !fs.statSync(file).isFile() || fs.statSync(file).size > 100 * 1024 * 1024) throw new AppError('INVALID_PDF', 'Escolha um PDF local de até 100 MiB.');
    const id = replaceId ?? randomUUID();
    this.store.transaction(() => {
      if (replaceId) this.store.db.prepare('UPDATE materials SET path=?,name=? WHERE id=?').run(file, path.basename(file), id);
      else this.store.db.prepare('INSERT INTO materials(id,subject_id,path,name) VALUES(?,?,?,?)').run(id, subjectId, file, path.basename(file));
      this.store.audit('material.select', id, 'ok');
    });
    return { id, subjectId, name: path.basename(file) };
  }
}
