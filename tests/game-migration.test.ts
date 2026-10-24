import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { RULES_V2_BACKUP, rollbackRulesV3 } from '../src/main/game-migration';
import { dec, integer } from '../src/shared/amount';
import { PRODUCERS, breakdown, emptyContext, normalizeEconomy } from '../src/shared/economy';
import { BALANCE_V2 } from '../src/shared/economy-balance';

// Identified fixture: the JSON shape GAM-05 (rules v2) saved in game_player.state, with every system in use.
function rulesV2Profile(now: number, challengeId: string) {
  return { skin: 'cyberpunk', atmosphere: 'night', owned: ['windmill', 'fountain', 'pickaxe'], build: { focus: 2, review: 1, planning: 0, practice: 0 }, gatheredAt: now - 5000, passiveAt: now, passiveCarry: 0, roundId: null,
    inventory: { wheat: 3, carrot: 1, stone: 20, wood: 15 }, plots: [{ id: 1, crop: 'wheat', plantedAt: now - 1000, readyAt: now + 44000 }, { id: 2, crop: null, plantedAt: 0, readyAt: 0 }, { id: 3, crop: null, plantedAt: 0, readyAt: 0 }, { id: 4, crop: null, plantedAt: 0, readyAt: 0 }],
    engine: { level: 6, clicks: 420, lastClickAt: now - 60000 }, challengeId,
    farm: { built: ['depot', 'forest-post'], target: 'mine-post', stations: { 'forest-post': { stock: 37, carryMs: 1000, settledAt: now }, 'mine-post': { stock: 0, carryMs: 0, settledAt: now } } },
    economy: { version: 2, producers: { collectors: 30, workshops: 5 }, upgrades: ['collectors-1', 'collectors-2', 'pulse-1'], achievements: ['units-collectors-1', 'units-collectors-10', 'clicks-100', 'focusminutes-10'], lifetime: '4e12', cycleEarned: '4e12', prestige: 0, tokens: 0, cycles: 0, permanent: [],
      harvested: 12, gathered: 80, challenges: 3, perfect: 1, rounds: 2, focusMinutes: 30, reviews: 4, studyDays: 2, events: 1, combos: 0, memoryPerfect: 0,
      study: { focus: {}, reviewCursor: 0, baselineAt: now - 86400000, lastDay: '', streak: 0, dayMinutes: 0, dayReviews: 0, builds: [] },
      signals: [{ id: randomUUID(), type: 'alignment', foundAt: now }, { id: randomUUID(), type: 'cache', foundAt: now }], activeEvents: [], nextSignalAt: now + 1000, eventSerial: 2, unlocks: ['collectors', 'workshops'], motorDay: '2026-10-22', motorEarned: 800 } };
}

test('regras 2 → 3: backup em arquivo e no banco, conversão por minutos de produção, prestígio intacto, reversão exata', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/game-rules-v3-')), now = Date.UTC(2026, 9, 23, 12), challengeId = randomUUID();
  let db = new Store(dir);
  const profile = rulesV2Profile(now, challengeId);
  db.db.prepare('INSERT INTO game_player(id,coins,xp,state) VALUES(1,?,?,?)').run('4000', 340, JSON.stringify(profile));
  db.db.prepare('INSERT INTO game_challenges(id,state) VALUES(?,?)').run(challengeId, JSON.stringify({ id: challengeId, kind: 'qte', status: 'active', stage: 3, version: 3 }));
  const original = db.db.prepare('SELECT coins,xp,state FROM game_player').get();
  try {
    const game = new Game(db, () => now, () => .5), s = game.get();
    // Backups: a full database file before converting, and the exact old row inside the transaction.
    const files = fs.readdirSync(path.join(dir, 'backups')).filter(f => f.startsWith('antes-regras-jogo-v3-'));
    assert.equal(files.length, 1);
    const copy = new DatabaseSync(path.join(dir, 'backups', files[0]), { readOnly: true });
    try { assert.equal(JSON.parse(String(copy.prepare('SELECT state FROM game_player').get()!.state)).economy.version, 2); } finally { copy.close(); }
    assert.deepEqual(JSON.parse(db.setting(RULES_V2_BACKUP)!), { ...original });
    // What survives as is.
    assert.equal(s.economy.version, 3); assert.equal(s.economy.producers.collectors, 30); assert.equal(s.economy.producers.workshops, 5);
    for (const id of ['collectors-1', 'collectors-2', 'pulse-1', 'pulse-2']) assert.ok(s.economy.upgrades.includes(id), id);
    assert.ok(profile.economy.achievements.every(id => s.economy.achievements.includes(id)));
    assert.equal(s.skin, 'cyberpunk'); assert.equal(s.atmosphere, 'night'); assert.equal(s.xp, 340); assert.deepEqual(s.build, profile.build); assert.equal(s.engine.clicks, 420);
    assert.equal(s.plots[0].crop, 'wheat'); assert.ok(['windmill', 'fountain', 'pickaxe'].every(id => s.owned.includes(id as never)));
    assert.deepEqual(s.farm.built.slice(0, 2), ['depot', 'forest-post']); assert.equal(s.farm.stations['forest-post'].stock, 0);
    // What is converted: materials, station stock and stored signals become credit; the bank keeps its minutes of production.
    const ledger = db.db.prepare("SELECT coins,resources FROM game_ledger WHERE source='migration:rules-v3'").get()!, detail = JSON.parse(String(ledger.resources));
    assert.equal(detail.materials.wood, 15 + 37); assert.equal(detail.signals, 2);
    // Recomputed independently: production of the saved profile under the v2 and v3 catalogues.
    const quiet = { ...normalizeEconomy(structuredClone(profile.economy) as never, now), activeEvents: [] }, context = { ...emptyContext(), clicks: 420, now };
    const v2 = PRODUCERS.map((p, i) => ({ ...p, base: BALANCE_V2.installationCosts[i], rate: BALANCE_V2.installationRates[i] }));
    const oldRate = dec(breakdown(quiet, context, v2).final), k = dec(breakdown(quiet, context).final).div(oldRate), materials = 3 * 4 + 1 * 8 + 20 * 3 + 52 * 2;
    assert.equal(detail.ratio, k.toSignificantDigits(12).toString());
    const extra = integer(dec(materials).plus(oldRate.mul(5 + 10)));
    assert.equal(String(s.coins), String(integer(dec(4000).plus(extra).mul(k))), 'o saldo guarda os mesmos minutos de produção: saldo ÷ taxa antes = saldo ÷ taxa depois');
    assert.equal(s.economy.prestigeGain, 2, 'as 2 insígnias que a fórmula antiga dava continuam disponíveis');
    assert.equal(JSON.parse(String(db.db.prepare('SELECT state FROM game_challenges WHERE id=?').get(challengeId)!.state)).status, 'failed');
    const raw = JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));
    for (const gone of ['inventory', 'gatheredAt', 'challengeId']) assert.equal(gone in raw && raw[gone] !== null, false, gone);
    assert.equal(raw.economy.motorDay, undefined); assert.deepEqual(raw.economy.signals, []);
    // Reopening never converts twice.
    db.close(); db = new Store(dir); const again = new Game(db, () => now, () => .5).get();
    assert.deepEqual(again, game.get.call(new Game(db, () => now, () => .5))); assert.equal(Number(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source='migration:rules-v3'").get()!.n), 1);
    // Documented rollback: the exact row comes back and the next start converts again from it.
    rollbackRulesV3(db);
    assert.deepEqual(db.db.prepare('SELECT coins,xp,state FROM game_player').get(), original); assert.equal(db.setting(RULES_V2_BACKUP), null);
    assert.equal(Number(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source='migration:rules-v3'").get()!.n), 0);
    assert.equal(new Game(db, () => now, () => .5).get().economy.version, 3);
    assert.throws(() => { rollbackRulesV3(db); rollbackRulesV3(db); }, /cópia/);
  } finally { db.close(); }
});

test('perfil v2 sem produção mantém o saldo e conversão falha não grava nada', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/game-rules-v3-empty-')), now = Date.UTC(2026, 9, 23, 12);
  const db = new Store(dir), profile = rulesV2Profile(now, randomUUID());
  profile.economy.producers = { collectors: 0, workshops: 0 }; profile.economy.lifetime = '500'; profile.economy.cycleEarned = '500'; profile.economy.signals = []; profile.inventory = { wheat: 0, carrot: 0, stone: 0, wood: 0 }; profile.farm.stations['forest-post'].stock = 0; profile.farm.stations['forest-post'].carryMs = 0;
  db.db.prepare('INSERT INTO game_player(id,coins,xp,state) VALUES(1,?,?,?)').run('77', 0, JSON.stringify(profile));
  try {
    db.db.exec("CREATE TRIGGER reject_rules BEFORE INSERT ON audit_events WHEN NEW.action='game.rules-v3' BEGIN SELECT RAISE(ABORT,'forced conversion rollback'); END");
    const before = db.db.prepare('SELECT coins,xp,state FROM game_player').get();
    assert.throws(() => new Game(db, () => now), /rollback/);
    assert.deepEqual(db.db.prepare('SELECT coins,xp,state FROM game_player').get(), before); assert.equal(db.setting(RULES_V2_BACKUP), null);
    db.db.exec('DROP TRIGGER reject_rules');
    const s = new Game(db, () => now).get(); assert.equal(s.coins, 77); assert.equal(s.economy.lifetime, 500);
    assert.equal(BALANCE_V2.installationRates.length, 16);
  } finally { db.close(); }
});
