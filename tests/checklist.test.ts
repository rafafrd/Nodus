import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Store } from '../src/main/store';
import { Checklist } from '../src/main/checklist';
import { Desks } from '../src/main/desk';
test('etapas preservam IDs, conclusão e retomada; referência cruzada não grava', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/checklist-test-')); let store = new Store(dir);
  try {
    const a = store.createSubject({ name: 'A', color: 'sage' }), b = store.createSubject({ name: 'B', color: 'blue' }); let list = new Checklist(store); let desks = new Desks(store);
    const task = list.create(a.id, 'Tarefa A'); const one = list.add({ subjectId: a.id, taskId: task.id, text: 'Etapa 1' }); const two = list.add({ subjectId: a.id, taskId: task.id, text: 'Etapa 2' });
    list.create(b.id, 'Tarefa sem etapas'); list.update({ subjectId: a.id, id: one.id, done: true }); list.update({ subjectId: a.id, id: one.id, done: false });
    list.update({ subjectId: a.id, id: two.id, text: 'Renomeada', done: true }); desks.save({ subjectId: a.id, nextStepId: two.id });
    const before = list.list(a.id); assert.throws(() => list.update({ subjectId: b.id, id: two.id, done: false }), /pertencer/); assert.deepEqual(list.list(a.id), before);
    assert.throws(() => desks.save({ subjectId: b.id, nextStepId: two.id }), /pertencer/);
    store.close(); store = new Store(dir); list = new Checklist(store); desks = new Desks(store);
    assert.deepEqual(list.list(a.id), before); assert.equal(list.list(b.id)[0].steps.length, 0); assert.equal(desks.get(a.id).nextStepId, two.id);
    assert.equal(list.list(a.id)[0].steps[1].id, two.id);
  } finally { store.close(); }
});
