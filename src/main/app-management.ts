import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '../shared/contracts';
import { folderInput, type AppManagement } from '../shared/preferences';
import { Store } from './store';
export class AppManagementService {
  constructor(readonly store: Store) {}
  get(): AppManagement {
    const count = (table: string) => Number(this.store.db.prepare(`SELECT count(*) n FROM ${table}`).get()!.n);
    const databaseBytes = ['study.sqlite', 'study.sqlite-wal', 'study.sqlite-shm'].reduce((sum, file) => { try { return sum + fs.statSync(path.join(this.store.directory, file)).size; } catch { return sum; } }, 0);
    return { dataDirectory: this.store.directory, vault: this.store.setting('vault'), databaseBytes, counts: { subjects: count('subjects'), notes: count('notes'), materials: count('materials'), videos: count('videos'), projects: count('project_folders'), drafts: count('drafts') + count('project_drafts') } };
  }
  folder(input: unknown) {
    const { folder } = folderInput.parse(input), target = folder === 'data' ? this.store.directory : this.store.setting('vault');
    if (!target || !path.isAbsolute(target)) throw new AppError('FOLDER_UNAVAILABLE', 'Esta pasta ainda não foi configurada.');
    try { const canonical = fs.realpathSync.native(target); if (!fs.statSync(canonical).isDirectory()) throw Error(); return canonical; }
    catch { throw new AppError('FOLDER_UNAVAILABLE', 'A pasta não está disponível. Confira o disco antes de tentar novamente.'); }
  }
}
