import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { AIM_ARENA, AIM_LEVELS, aimPoints, aimScore, gameInput, type GameAction } from '../src/shared/game';
import { dec } from '../src/shared/amount';

let seed = 7;
const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const setup = (prefix: string) => { const dir = fs.mkdtempSync(path.resolve(`.local/${prefix}-`)); const db = new Store(dir); let now = Date.UTC(2026, 9, 24, 12); const clock = { get now() { return now; }, set now(v) { now = v; } }; const game = new Game(db, () => now, random); return { db, game, clock, act: (action: GameAction) => game.act({ operationId: randomUUID(), action }) }; };

test('mira: pontos por distância ao centro, precisão com cliques no vazio e sequência', () => {
  assert.deepEqual([aimPoints(0, 0), aimPoints(.4, -.4), aimPoints(.41, 0), aimPoints(0, -.75), aimPoints(.9, .2)], [300, 300, 100, 100, 50]);
  const targets = Array.from({ length: 4 }, (_, i) => ({ x: 100, y: 100, at: i * 500, life: 500, size: 80 }));
  const perfect = aimScore(targets, targets.map((t, i) => ({ target: i, t: t.at + 10, dx: 0, dy: 0 })), 0);
  assert.deepEqual([perfect.accuracy, perfect.grade, perfect.maxCombo], [1, 'SS', 4]);
  const mixed = aimScore(targets, [{ target: 0, t: 0, dx: 0, dy: 0 }, { target: 2, t: 0, dx: .5, dy: 0 }, { target: 3, t: 0, dx: 0, dy: .9 }], 1);
  assert.deepEqual(mixed.counts, [1, 1, 1, 1]); assert.equal(mixed.maxCombo, 2); assert.equal(mixed.accuracy, Math.floor(450 / 1500 * 10000) / 10000);
});

test('mira: rodada gerada pelo main, término só depois do último quadrado, acertos validados e recompensa por precisão', () => {
  const { db, game, clock, act } = setup('game-aim');
  try {
    const start = act({ kind: 'aim-start', difficulty: 'hard' }).state.aim.active!;
    const spec = AIM_LEVELS.hard; assert.equal(start.targets.length, spec.targets);
    for (const [i, t] of start.targets.entries()) {
      assert.ok(t.x - t.size / 2 >= 0 && t.x + t.size / 2 <= AIM_ARENA.width && t.y - t.size / 2 >= 0 && t.y + t.size / 2 <= AIM_ARENA.height, 'quadrado inteiro dentro da arena');
      assert.equal(t.at, AIM_ARENA.leadMs + i * spec.gapMs);
    }
    const end = Math.max(...start.targets.map(t => t.at + t.life));
    const hits = start.targets.map((t, i) => ({ target: i, t: t.at + 100, dx: 0, dy: 0 }));
    const finish = { kind: 'aim-finish' as const, roundId: start.id, hits, misclicks: 0 };
    clock.now += end - 1; assert.throws(() => act(finish), /ainda não terminou/);
    clock.now += 1;
    assert.throws(() => act({ ...finish, hits: [hits[0], hits[0]] }), /não corresponde/, 'mesmo quadrado duas vezes');
    assert.throws(() => act({ ...finish, hits: [{ ...hits[1], t: start.targets[1].at + start.targets[1].life + 151 }] }), /não corresponde/, 'acerto depois de o quadrado sair');
    assert.throws(() => act({ ...finish, hits: [{ target: 60, t: 0, dx: 0, dy: 0 }] }), /não corresponde/);
    assert.throws(() => gameInput.parse({ operationId: randomUUID(), action: { ...finish, hits: [{ ...hits[0], dx: 1.2 }] } }));
    const before = dec(game.get().coins), xp = game.get().xp;
    const done = act(finish).state;
    assert.equal(done.aim.active, null); assert.equal(done.aim.last!.grade, 'SS'); assert.equal(done.aim.best.hard, 1);
    assert.equal(done.economy.aimRounds, 1); assert.equal(done.economy.aimPerfect, 1);
    assert.ok(dec(done.coins).minus(before).gte(30), 'piso de 10 × multiplicador'); assert.equal(done.xp - xp, 6 * 3 + 5);
    assert.throws(() => act(finish), /não está ativa/, 'a rodada paga uma vez');

    // A sloppy round pays less and never beats the best accuracy already recorded.
    const second = act({ kind: 'aim-start', difficulty: 'hard' }).state.aim.active!;
    clock.now += end;
    const half = second.targets.slice(0, 18).map((t, i) => ({ target: i, t: t.at, dx: .6, dy: 0 }));
    const sloppy = act({ kind: 'aim-finish', roundId: second.id, hits: half, misclicks: 4 }).state;
    assert.ok(sloppy.aim.last!.accuracy < .2); assert.equal(sloppy.aim.best.hard, 1); assert.equal(sloppy.economy.aimPerfect, 1);
    assert.ok(dec(sloppy.aim.last!.coins).lt(done.aim.last!.coins));
    assert.equal(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'aim:%'").get()!.n, 2);

    // Starting over replaces a round left halfway; the old one cannot be finished.
    const left = act({ kind: 'aim-start', difficulty: 'easy' }).state.aim.active!;
    const fresh = act({ kind: 'aim-start', difficulty: 'expert' }).state.aim.active!;
    clock.now += 60000;
    assert.throws(() => act({ kind: 'aim-finish', roundId: left.id, hits: [], misclicks: 0 }), /não está ativa/);
    const zero = act({ kind: 'aim-finish', roundId: fresh.id, hits: [], misclicks: 0 }).state;
    assert.equal(zero.aim.last!.accuracy, 0); assert.equal(zero.aim.last!.coins, 0);
    assert.ok(zero.economy.achievementsView.find(a => a.id === 'aimrounds-1')!.unlocked);
  } finally { db.close(); }
});
