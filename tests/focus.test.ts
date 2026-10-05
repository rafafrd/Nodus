import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Store } from '../src/main/store';
import { Focus } from '../src/main/focus';
test('segmentos usam tempo monotônico, pausa exclui intervalo e recuperação não conta tempo fechado', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/focus-test-')); let store = new Store(dir);
  let mono = 0, wall = 100000; const clocks = [() => mono, () => wall] as const;
  try {
    const a = store.createSubject({ name: 'A', color: 'sage' }), b = store.createSubject({ name: 'B', color: 'blue' });
    let focus = new Focus(store, ...clocks); const start = focus.start(a.id, 1).session!;
    mono += 4000; wall -= 10000; assert.equal(focus.get(a.id).session?.elapsedMs, 4000);
    assert.throws(() => focus.act({ subjectId: b.id, id: start.id, action: 'pause' }), /outra matéria/);
    focus.act({ subjectId: a.id, id: start.id, action: 'pause' }); mono += 9000; assert.equal(focus.get(a.id).session?.elapsedMs, 4000);
    focus.act({ subjectId: a.id, id: start.id, action: 'resume' }); mono += 6000; focus.tick();
    assert.equal(focus.get(a.id).session?.elapsedMs, 10000); assert.equal(focus.get(a.id).session?.id, start.id);
    store.close(); mono += 30000; wall += 60000; store = new Store(dir); focus = new Focus(store, ...clocks);
    assert.equal(focus.get(a.id).session?.elapsedMs, 10000); assert.equal(focus.get(a.id).session?.state, 'paused'); assert.equal(focus.get(a.id).session?.recovered, true);
    focus.act({ subjectId: a.id, id: start.id, action: 'resume' }); mono += 60000; focus.tick();
    assert.equal(focus.get(a.id).session?.elapsedMs, 60000); assert.equal(focus.get(a.id).session?.state, 'completed');
    const sum = store.db.prepare('SELECT SUM(duration_ms) AS total FROM focus_segments WHERE session_id=?').get(start.id)?.total; assert.equal(sum, 60000);
    assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM focus_sessions').get()?.n, 1);
  } finally { store.close(); }
});
