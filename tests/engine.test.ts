import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { type GameAction } from '../src/shared/game';

test('motor real: potência/upgrade, cooldown, replay, insuficiência e perfil v2 conservados', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/engine-')); let db = new Store(dir), now = 1000, game = new Game(db, () => now);
  const act = (action: GameAction) => game.act({ operationId: randomUUID(), action });
  try {
    const pulse = { operationId: randomUUID(), action: { kind: 'engine-click' as const } }; assert.equal(game.act(pulse).state.coins, 61); assert.equal(game.act(pulse).state.coins, 61);
    assert.throws(() => act({ kind: 'engine-click' }), /pulso/); assert.equal(game.get().engine.clicks, 1);
    assert.equal(act({ kind: 'engine-upgrade' }).state.coins, 36); now += 300; const next = act({ kind: 'engine-click' }).state; assert.equal(next.coins, 39); assert.equal(next.engine.power, 3);
    assert.throws(() => act({ kind: 'engine-upgrade' }), /suficientes/); assert.equal(game.get().engine.level, 1);
    for (let i = 0; i < 8; i++) { now += 300; act({ kind: 'engine-click' }); } assert.equal(game.get().xp, 1);
    db.close(); db = new Store(dir); game = new Game(db, () => now); assert.equal(game.get().engine.clicks, 10); assert.equal(game.get().coins, 63);
    // Explicit artificial legacy-row fixture, not an integration earning proof.
    const row = db.db.prepare('SELECT state FROM game_player').get()!; const legacy = JSON.parse(String(row.state)); delete legacy.engine; delete legacy.challengeId;
    db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(legacy)); const preserved = game.get(); assert.equal(preserved.coins, 63); assert.equal(preserved.xp, 1); assert.equal(preserved.engine.level, 0);
  } finally { db.close(); }
});

test('QTE e skillcheck: main calcula resultado, expiração, replay/prêmio único e rollback', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/challenge-')), db = new Store(dir); let now = 1000; const game = new Game(db, () => now);
  const act = (action: GameAction) => game.act({ operationId: randomUUID(), action });
  try {
    let c = act({ kind: 'start-challenge', game: 'qte', pace: 'normal' }).state.challenge!;
    assert.equal(act({ kind: 'start-challenge', game: 'skillcheck', pace: 'normal' }).state.challenge!.id, c.id);
    const wrong = c.sequence[0] === 'A' ? 'D' : 'A'; assert.equal(act({ kind: 'qte-input', challengeId: c.id, key: wrong }).state.challenge!.status, 'failed'); assert.equal(game.get().coins, 60);
    c = act({ kind: 'start-challenge', game: 'qte', pace: 'relaxed' }).state.challenge!; now += c.stepMs + 1; assert.equal(game.get().challenge!.status, 'failed'); assert.equal(game.get().coins, 60);
    c = act({ kind: 'start-challenge', game: 'qte', pace: 'normal' }).state.challenge!;
    for (let i = 0; i < 2; i++) { now += 400; act({ kind: 'qte-input', challengeId: c.id, key: c.sequence[i] }); }
    const finish = { operationId: randomUUID(), action: { kind: 'qte-input' as const, challengeId: c.id, key: c.sequence[2] } };
    db.db.exec("CREATE TRIGGER challenge_failure BEFORE UPDATE ON game_challenges BEGIN SELECT RAISE(ABORT,'forced rollback'); END;"); assert.throws(() => game.act(finish), /rollback/); assert.equal(game.get().coins, 60); assert.equal(game.get().challenge!.stage, 2); db.db.exec('DROP TRIGGER challenge_failure;');
    assert.equal(game.act(finish).state.coins, 84); assert.equal(game.act(finish).state.coins, 84); assert.equal(db.db.prepare('SELECT count(*) n FROM game_ledger WHERE source=?').get(`challenge:${c.id}`)!.n, 1);
    c = act({ kind: 'start-challenge', game: 'skillcheck', pace: 'relaxed' }).state.challenge!;
    for (let i = 0; i < 3; i++) { c = game.get().challenge!; now = c.stepAt + c.targets[i] / 200 * c.stepMs; act({ kind: 'skill-input', challengeId: c.id }); }
    const result = game.get(); assert.equal(result.challenge!.hits, 3); assert.equal(result.challenge!.coins, 36); assert.equal(result.coins, 120); assert.equal(result.xp, 27);
    assert.throws(() => game.act({ operationId: randomUUID(), action: { kind: 'skill-input', challengeId: c.id, score: 3 } } as never));
  } finally { db.close(); }
});
