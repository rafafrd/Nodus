import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
import { Desks } from '../src/main/desk';
test('mesas isoladas restauram layout e rejeitam referências cruzadas em transação', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/desk-test-')); let store = new Store(path.join(dir, 'data'));
  try {
    fs.mkdirSync(path.join(dir, 'vault')); const vault = new Vault(store); vault.selectRoot(path.join(dir, 'vault'));
    const a = store.createSubject({ name: 'A', color: 'sage' }), b = store.createSubject({ name: 'B', color: 'blue' });
    const note = vault.create({ subjectId: a.id, title: 'A' }); let desks = new Desks(store);
    desks.save({ subjectId: a.id, noteId: note.ref.id, split: 66, tool: 'focus' }); desks.save({ subjectId: b.id, split: 40 });
    const prior = desks.get(b.id); assert.throws(() => desks.save({ subjectId: b.id, noteId: note.ref.id, split: 70 }), /pertencer/); assert.deepEqual(desks.get(b.id), prior);
    store.close(); store = new Store(path.join(dir, 'data')); desks = new Desks(store);
    assert.equal(desks.get(a.id).split, 66); assert.equal(desks.get(a.id).noteId, note.ref.id); assert.equal(desks.get(a.id).tool, 'focus'); assert.equal(desks.get(b.id).split, 40);
  } finally { store.close(); }
});
