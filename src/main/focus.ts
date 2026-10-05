import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import { Store } from './store';
import { AppError, type FocusSession, type FocusState } from '../shared/contracts';
type Active = { id: string; subjectId: string; segmentId: string; anchor: number; elapsedAtAnchor: number; lastCheckpoint: number };
export class Focus {
  private active: Active | null = null;
  constructor(readonly store: Store, readonly monotonic = () => performance.now(), readonly wall = () => Date.now()) {
    this.store.transaction(() => {
      const running = this.store.db.prepare("SELECT id,checkpoint_at FROM focus_sessions WHERE state='running'").all();
      for (const row of running) {
        this.store.db.prepare("UPDATE focus_sessions SET state='paused' WHERE id=?").run(row.id);
        this.store.db.prepare('UPDATE focus_segments SET ended_at=? WHERE session_id=? AND ended_at IS NULL').run(row.checkpoint_at, row.id);
        this.store.setSetting(`focusRecovery:${row.id}`, '1'); this.store.audit('focus.recover', String(row.id), 'paused');
      }
    });
  }
  private session(id: string): FocusSession {
    const row = this.store.db.prepare('SELECT id,subject_id AS subjectId,duration_ms AS durationMs,elapsed_ms AS elapsedMs,state FROM focus_sessions WHERE id=?').get(id) as Omit<FocusSession, 'recovered'> | undefined;
    if (!row) throw new AppError('NOT_FOUND', 'Sessão não encontrada.');
    let elapsed = row.elapsedMs;
    if (this.active?.id === id) elapsed = Math.min(row.durationMs, this.active.elapsedAtAnchor + Math.max(0, Math.round(this.monotonic() - this.active.anchor)));
    return { ...row, elapsedMs: elapsed, recovered: this.store.setting(`focusRecovery:${id}`) === '1' };
  }
  get(subjectId: string): FocusState {
    this.store.requireSubject(subjectId);
    const row = this.store.db.prepare('SELECT id FROM focus_sessions WHERE subject_id=? ORDER BY rowid DESC LIMIT 1').get(subjectId);
    return { session: row ? this.session(String(row.id)) : null, activeOwner: this.active ? this.store.requireSubject(this.active.subjectId) : null };
  }
  start(subjectId: string, minutes: number) {
    this.store.requireSubject(subjectId);
    if (this.active) throw new AppError('FOCUS_ACTIVE', 'Pause ou encerre a sessão ativa antes de iniciar outra.');
    const previous = this.get(subjectId).session;
    if (previous && ['running', 'paused'].includes(previous.state)) throw new AppError('FOCUS_ACTIVE', 'Retome ou encerre a sessão anterior desta matéria.');
    const id = randomUUID();
    this.store.transaction(() => {
      this.store.db.prepare("INSERT INTO focus_sessions(id,subject_id,duration_ms,elapsed_ms,state,checkpoint_at) VALUES(?,?,?,0,'paused',?)").run(id, subjectId, minutes * 60000, this.wall());
      this.store.audit('focus.start', id, 'ok');
    });
    this.resume(id); return this.get(subjectId);
  }
  private resume(id: string) {
    if (this.active) throw new AppError('FOCUS_ACTIVE', 'Outra sessão está ativa.');
    const session = this.session(id);
    if (session.state !== 'paused') throw new AppError('FOCUS_STATE', 'Somente uma sessão pausada pode ser retomada.');
    const segmentId = randomUUID(), anchor = this.monotonic();
    this.store.transaction(() => {
      this.store.db.prepare("UPDATE focus_sessions SET state='running',checkpoint_at=? WHERE id=?").run(this.wall(), id);
      this.store.db.prepare('INSERT INTO focus_segments(id,session_id,started_at) VALUES(?,?,?)').run(segmentId, id, this.wall());
      this.store.setSetting(`focusRecovery:${id}`, '0'); this.store.audit('focus.resume', id, 'ok');
    });
    this.active = { id, subjectId: session.subjectId, segmentId, anchor, elapsedAtAnchor: session.elapsedMs, lastCheckpoint: anchor };
  }
  private checkpoint(end?: 'paused' | 'completed' | 'ended') {
    const active = this.active; if (!active) return;
    const session = this.session(active.id); const wall = this.wall();
    this.store.transaction(() => {
      this.store.db.prepare('UPDATE focus_sessions SET elapsed_ms=?,checkpoint_at=?,state=? WHERE id=?').run(session.elapsedMs, wall, end ?? 'running', active.id);
      this.store.db.prepare('UPDATE focus_segments SET duration_ms=?,ended_at=? WHERE id=?').run(session.elapsedMs - active.elapsedAtAnchor, end ? wall : null, active.segmentId);
      if (end) this.store.audit(`focus.${end}`, active.id, 'ok');
    });
    if (end) this.active = null; else active.lastCheckpoint = this.monotonic();
  }
  tick() {
    if (!this.active) return;
    const session = this.session(this.active.id);
    if (session.elapsedMs >= session.durationMs) this.checkpoint('completed');
    else if (this.monotonic() - this.active.lastCheckpoint >= 5000) this.checkpoint();
  }
  act(input: { subjectId: string; id: string; action: 'pause' | 'resume' | 'finish' }) {
    const session = this.session(input.id);
    if (session.subjectId !== input.subjectId) throw new AppError('INVALID_REFERENCE', 'A sessão pertence a outra matéria.');
    if (input.action === 'resume') this.resume(session.id);
    else if (input.action === 'pause') {
      if (this.active?.id !== session.id) throw new AppError('FOCUS_STATE', 'Esta sessão não está ativa.');
      this.checkpoint('paused');
    } else {
      if (!['running', 'paused'].includes(session.state)) throw new AppError('FOCUS_STATE', 'A sessão já foi encerrada.');
      if (this.active?.id === session.id) this.checkpoint('ended');
      else { this.store.db.prepare("UPDATE focus_sessions SET state='ended',checkpoint_at=? WHERE id=?").run(this.wall(), session.id); this.store.audit('focus.ended', session.id, 'ok'); }
    }
    return this.get(input.subjectId);
  }
  pauseActive() { if (this.active) this.checkpoint('paused'); }
}
