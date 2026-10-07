import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AppError, type Subject, type Bootstrap } from '../shared/contracts';
export class Store {
  readonly db: DatabaseSync;
  constructor(readonly directory: string, readonly targetVersion = 6) {
    fs.mkdirSync(directory, { recursive: true });
    this.db = new DatabaseSync(path.join(directory, 'study.sqlite'));
    this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    const version = Number(this.db.prepare('PRAGMA user_version').get()?.user_version);
    if (version > targetVersion) throw new AppError('SCHEMA_NEWER', 'Este banco precisa de uma versão mais nova do aplicativo.');
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
    if (version < 2) this.transaction(() => this.db.exec(`
      CREATE TABLE game_player(id INTEGER PRIMARY KEY CHECK(id=1), coins INTEGER NOT NULL CHECK(coins>=0), xp INTEGER NOT NULL CHECK(xp>=0), state TEXT NOT NULL);
      CREATE TABLE game_ledger(id INTEGER PRIMARY KEY, source TEXT NOT NULL UNIQUE, action TEXT NOT NULL, coins INTEGER NOT NULL, xp INTEGER NOT NULL, resources TEXT NOT NULL, at INTEGER NOT NULL, rule_version INTEGER NOT NULL);
      CREATE TABLE game_operations(id TEXT PRIMARY KEY, request TEXT NOT NULL, message TEXT NOT NULL);
      CREATE TABLE game_rounds(id TEXT PRIMARY KEY, state TEXT NOT NULL);
      PRAGMA user_version=2;
    `));
    if (version < 3) this.transaction(() => this.db.exec(`
      CREATE TABLE game_challenges(id TEXT PRIMARY KEY, state TEXT NOT NULL);
      CREATE TABLE project_folders(id TEXT PRIMARY KEY, root TEXT NOT NULL UNIQUE, name TEXT NOT NULL);
      CREATE TABLE project_drafts(project_id TEXT NOT NULL REFERENCES project_folders(id), path TEXT NOT NULL, text TEXT NOT NULL, base_hash TEXT NOT NULL, PRIMARY KEY(project_id,path));
      PRAGMA user_version=3;
    `));
    if (version < 4) this.transaction(() => this.db.exec(`
      CREATE TABLE videos(id TEXT PRIMARY KEY,subject_id TEXT NOT NULL REFERENCES subjects(id),title TEXT NOT NULL,youtube_id TEXT NOT NULL,start_seconds INTEGER NOT NULL DEFAULT 0,url TEXT NOT NULL,UNIQUE(subject_id,youtube_id));
      ALTER TABLE desks ADD COLUMN video_id TEXT REFERENCES videos(id);
      ALTER TABLE desks ADD COLUMN material_view TEXT NOT NULL DEFAULT 'pdf';
      PRAGMA user_version=4;
    `));
    if (version < 5) this.transaction(() => this.db.exec(`
      CREATE TABLE flashcards(id TEXT PRIMARY KEY,subject_id TEXT NOT NULL REFERENCES subjects(id),note_id TEXT REFERENCES notes(id),question TEXT NOT NULL,answer TEXT NOT NULL,excerpt TEXT NOT NULL,due_at INTEGER NOT NULL,interval_days REAL NOT NULL DEFAULT 0,reviews INTEGER NOT NULL DEFAULT 0,version INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE card_reviews(id TEXT PRIMARY KEY,card_id TEXT NOT NULL REFERENCES flashcards(id),request TEXT NOT NULL,rating TEXT NOT NULL,at INTEGER NOT NULL);
      CREATE TABLE pdf_marks(id TEXT PRIMARY KEY,subject_id TEXT NOT NULL REFERENCES subjects(id),material_id TEXT NOT NULL REFERENCES materials(id),note_id TEXT REFERENCES notes(id),fingerprint TEXT NOT NULL,page INTEGER NOT NULL,x REAL NOT NULL,y REAL NOT NULL,width REAL NOT NULL,height REAL NOT NULL,color TEXT NOT NULL,comment TEXT NOT NULL);
      CREATE TABLE video_moments(id TEXT PRIMARY KEY,subject_id TEXT NOT NULL REFERENCES subjects(id),video_id TEXT NOT NULL REFERENCES videos(id),seconds INTEGER NOT NULL,text TEXT NOT NULL);
      CREATE TABLE note_links(id TEXT PRIMARY KEY,subject_id TEXT NOT NULL REFERENCES subjects(id),source_id TEXT NOT NULL REFERENCES notes(id),target_id TEXT NOT NULL REFERENCES notes(id),label TEXT NOT NULL,UNIQUE(source_id,target_id));
      CREATE INDEX flashcards_due ON flashcards(due_at);
      PRAGMA user_version=5;
    `));
    if (version < 6 && targetVersion >= 6) this.transaction(() => this.db.exec(`
      ALTER TABLE game_player RENAME TO game_player_v5;
      CREATE TABLE game_player(id INTEGER PRIMARY KEY CHECK(id=1), coins TEXT NOT NULL CHECK(length(coins)<=1100 AND substr(coins,1,1)<>'-'), xp INTEGER NOT NULL CHECK(xp>=0), state TEXT NOT NULL);
      INSERT INTO game_player SELECT id,CAST(coins AS TEXT),xp,state FROM game_player_v5;
      DROP TABLE game_player_v5;
      ALTER TABLE game_ledger RENAME TO game_ledger_v5;
      CREATE TABLE game_ledger(id INTEGER PRIMARY KEY, source TEXT NOT NULL UNIQUE, action TEXT NOT NULL, coins TEXT NOT NULL CHECK(length(coins)<=1101), xp INTEGER NOT NULL, resources TEXT NOT NULL, at INTEGER NOT NULL, rule_version INTEGER NOT NULL);
      INSERT INTO game_ledger SELECT id,source,action,CAST(coins AS TEXT),xp,resources,at,rule_version FROM game_ledger_v5;
      DROP TABLE game_ledger_v5;
      CREATE TABLE economic_receipts(source TEXT PRIMARY KEY,kind TEXT NOT NULL,amount TEXT NOT NULL,at INTEGER NOT NULL,version INTEGER NOT NULL);
      PRAGMA user_version=6;
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
