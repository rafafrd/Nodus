import { randomUUID } from 'node:crypto';
import { Store } from './store';
import { AppError, type Step, type StudyTask } from '../shared/contracts';
export class Checklist {
  constructor(readonly store: Store) {}
  private task(id: string, subjectId: string) {
    const row = this.store.db.prepare('SELECT id,subject_id AS subjectId,text FROM tasks WHERE id=? AND subject_id=?').get(id, subjectId) as Omit<StudyTask, 'steps'> | undefined;
    if (!row) throw new AppError('INVALID_REFERENCE', 'A tarefa precisa pertencer a esta matéria.'); return row;
  }
  private steps(taskId: string): Step[] { return this.store.db.prepare('SELECT id,task_id AS taskId,text,done FROM steps WHERE task_id=? ORDER BY rowid').all(taskId).map(row => ({ ...row, done: Boolean(row.done) } as Step)); }
  list(subjectId: string): StudyTask[] { this.store.requireSubject(subjectId); return this.store.db.prepare('SELECT id,subject_id AS subjectId,text FROM tasks WHERE subject_id=? ORDER BY rowid').all(subjectId).map(row => ({ ...row, steps: this.steps(String(row.id)) } as StudyTask)); }
  create(subjectId: string, text: string): StudyTask {
    return this.store.transaction(() => {
      this.store.requireSubject(subjectId); const id = randomUUID(); this.store.db.prepare('INSERT INTO tasks(id,subject_id,text) VALUES(?,?,?)').run(id, subjectId, text);
      this.store.audit('task.create', id, 'ok'); return { id, subjectId, text, steps: [] };
    });
  }
  add(input: { subjectId: string; taskId: string; text: string }): Step {
    return this.store.transaction(() => {
      this.task(input.taskId, input.subjectId); const id = randomUUID();
      this.store.db.prepare('INSERT INTO steps(id,task_id,text,done) VALUES(?,?,?,0)').run(id, input.taskId, input.text);
      this.store.audit('step.create', id, 'ok'); return { id, taskId: input.taskId, text: input.text, done: false };
    });
  }
  update(input: { subjectId: string; id: string; text?: string; done?: boolean }): Step {
    return this.store.transaction(() => {
      const row = this.store.db.prepare('SELECT id,task_id AS taskId,text,done FROM steps WHERE id=?').get(input.id) as Step | undefined;
      if (!row) throw new AppError('NOT_FOUND', 'Etapa não encontrada.'); this.task(row.taskId, input.subjectId);
      const step = { ...row, text: input.text ?? row.text, done: input.done ?? Boolean(row.done) };
      this.store.db.prepare('UPDATE steps SET text=?,done=? WHERE id=?').run(step.text, Number(step.done), step.id);
      this.store.audit('step.update', step.id, 'ok'); return step;
    });
  }
}
