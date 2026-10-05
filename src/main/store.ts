import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AppError, type Subject, type Bootstrap } from '../shared/contracts';
export class Store {
  readonly db: DatabaseSync;
  constructor(readonly directory: string) {
    fs.mkdirSync(directory, { recursive: true });
    this.db = new DatabaseSync(path.join(directory, 'study.sqlite'));
    this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    const version = Number(this.db.prepare('PRAGMA user_version').get()?.user_version);
    if (version > 1) throw new AppError('SCHEMA_NEWER', 'Este banco precisa de uma versão mais nova do aplicativo.');
    if (version === 0) this.transaction(() => this.db.exec(`
      CREATE TABLE settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE subjects(id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL);
      CREATE TABLE notes(id TEXT PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), path TEXT NOT NULL UNIQUE, title TEXT NOT NULL, hash TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE drafts(note_id TEXT PRIMARY KEY REFERENCES notes(id), text TEXT NOT NULL, base_hash TEXT NOT NULL, updated_at INTEGER NOT NULL);
      CREATE TABLE materials(id TEXT PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), path TEXT NOT NULL, name TEXT NOT NULL);
      CREATE TABLE desks(subject_id TEXT PRIMARY KEY REFERENCES subjects(id), note_id TEXT REFERENCES notes(id), material_id TEXT REFERENCES materials(id), page INTEGER NOT NULL DEFAULT 1, split INTEGER NOT NULL DEFAULT 55, tool TEXT NOT NULL DEFAULT 'checklist', preview INTEGER NOT NULL DEFAULT 1, next_step_id TEXT);
      CREATE TABLE focus_sessions(id TEXT PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), duration_ms INTEGER NOT NULL, elapsed_ms INTEGER NOT NULL DEFAULT 0, state TEXT NOT NULL, checkpoint_at INTEGER NOT NULL);
      CREATE TABLE focus_segments(id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES focus_sessions(id), started_at INTEGER NOT NULL, ended_at INTEGER, duration_ms INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE tasks(id TEXT PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), text TEXT NOT NULL);
      CREATE TABLE steps(id TEXT PRIMARY KEY, task_id TEXT NOT NULL REFERENCES tasks(id), text TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE sync_operations(id TEXT PRIMARY KEY, note_id TEXT NOT NULL REFERENCES notes(id), revision INTEGER NOT NULL, hash TEXT NOT NULL, state TEXT NOT NULL, receipt TEXT);
      CREATE TABLE audit_events(id INTEGER PRIMARY KEY, at INTEGER NOT NULL, action TEXT NOT NULL, entity_id TEXT, outcome TEXT NOT NULL);
      PRAGMA user_version=1;
    `));
  }
  transaction<T>(action: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try { const value = action(); this.db.exec('COMMIT'); return value; }
    catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  audit(action: string, entityId: string | null, outcome: string) { this.db.prepare('INSERT INTO audit_events(at,action,entity_id,outcome) VALUES(?,?,?,?)').run(Date.now(), action, entityId, outcome); }
  setting(key: string): string | null { return this.db.prepare('SELECT value FROM settings WHERE key=?').get(key)?.value as string ?? null; }
  setSetting(key: string, value: string) { this.db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, value); }
  requireSubject(id: string) {
    const row = this.db.prepare('SELECT id,name,color FROM subjects WHERE id=?').get(id) as Subject | undefined;
    if (!row) throw new AppError('NOT_FOUND', 'Matéria não encontrada.');
    return row;
  }
  bootstrap(): Bootstrap { return { subjects: this.db.prepare('SELECT id,name,color FROM subjects ORDER BY rowid').all() as Subject[], vault: this.setting('vault'), activeSubjectId: this.setting('activeSubject') }; }
  createSubject(input: { name: string; color: string }): Subject {
    return this.transaction(() => {
      const id = randomUUID();
      this.db.prepare('INSERT INTO subjects(id,name,color) VALUES(?,?,?)').run(id, input.name, input.color);
      this.db.prepare('INSERT INTO desks(subject_id) VALUES(?)').run(id);
      this.audit('subject.create', id, 'ok');
      return this.requireSubject(id);
    });
  }
  renameSubject(input: { id: string; name: string }): Subject {
    return this.transaction(() => { this.requireSubject(input.id); this.db.prepare('UPDATE subjects SET name=? WHERE id=?').run(input.name, input.id); this.audit('subject.rename', input.id, 'ok'); return this.requireSubject(input.id); });
  }
  close() { this.db.close(); }
}
