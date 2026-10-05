import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Store } from '../src/main/store';
import { subjectInput } from '../src/shared/contracts';
test('SQLite real preserva IDs, relações, migração e rollback após reinicialização', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'study-store-test-'));
  let store = new Store(dir);
  try {
    const a = store.createSubject(subjectInput.parse({ name: 'Matemática', color: 'sage' }));
    const b = store.createSubject(subjectInput.parse({ name: 'Física', color: 'blue' }));
    const desk = store.db.prepare('SELECT * FROM desks WHERE subject_id=?').get(a.id);
    store.renameSubject({ id: a.id, name: 'Álgebra' });
    assert.deepEqual(store.db.prepare('SELECT * FROM desks WHERE subject_id=?').get(a.id), desk);
    assert.throws(() => subjectInput.parse({ name: '', color: 'sage', arbitrary: true }));
    assert.throws(() => store.transaction(() => { store.db.prepare('UPDATE subjects SET name=? WHERE id=?').run('Corrompido', a.id); throw Error('Falha controlada'); }));
    store.close(); store = new Store(dir);
    assert.equal(store.requireSubject(a.id).name, 'Álgebra');
    assert.equal(store.requireSubject(b.id).name, 'Física');
    assert.equal(store.db.prepare('PRAGMA user_version').get()?.user_version, 1);
    assert.equal(store.bootstrap().subjects.length, 2);
  } finally { store.close(); assert.equal(path.dirname(dir), os.tmpdir()); assert.ok(path.basename(dir).startsWith('study-store-test-')); fs.rmSync(dir, { recursive: true, force: true }); }
});
