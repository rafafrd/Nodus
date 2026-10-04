import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { Vault } from '../src/main/vault';
import { gameInput, type GameAction } from '../src/shared/game';

test('economia real: replay, saldo, maturação, cooldown, venda e reinício conservam registros', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/game-test-')); let db = new Store(dir); let now = 1000000; let game = new Game(db, () => now);
  const act = (action: GameAction) => game.act({ operationId: randomUUID(), action });
  try {
    assert.equal(game.get().coins, 60);
    const plant = { operationId: randomUUID(), action: { kind: 'plant', plot: 1, crop: 'wheat' } as const };
    assert.equal(game.act(plant).state.coins, 58); assert.equal(game.act(plant).replayed, true); assert.equal(game.get().coins, 58);
    assert.throws(() => game.act({ ...plant, action: { kind: 'gather', resource: 'stone' } }), /outra ação/);
    const before = JSON.stringify(game.get());
    assert.throws(() => act({ kind: 'buy', item: 'cottage' }), /suficientes/);
    assert.throws(() => act({ kind: 'harvest', plot: 1 }), /pronto/);
    assert.throws(() => act({ kind: 'plant', plot: 6, crop: 'wheat' }), /Desbloqueie/);
    assert.throws(() => act({ kind: 'sell', resource: 'stone', quantity: 1 }), /quantidade/);
    assert.equal(JSON.stringify(game.get()), before);
    now += 45000; const harvest = { operationId: randomUUID(), action: { kind: 'harvest', plot: 1 } as const };
    assert.equal(game.act(harvest).state.inventory.wheat, 1); assert.equal(game.act(harvest).state.inventory.wheat, 1);
    act({ kind: 'sell', resource: 'wheat', quantity: 1 }); assert.equal(game.get().inventory.wheat, 0);
    act({ kind: 'gather', resource: 'stone' }); assert.throws(() => act({ kind: 'gather', resource: 'wood' }), /coleta/);
    now += 1500; act({ kind: 'gather', resource: 'wood' }); assert.equal(game.get().inventory.wood, 1);
    const saved = game.get(); db.close(); db = new Store(dir); game = new Game(db, () => now); assert.deepEqual(game.get(), saved);
    const sum = db.db.prepare('SELECT sum(coins) coins,sum(xp) xp FROM game_ledger').get(); assert.equal(sum?.coins, saved.coins); assert.equal(sum?.xp, saved.xp);
    assert.throws(() => gameInput.parse({ operationId: randomUUID(), action: { kind: 'gather', resource: 'stone', coins: 1000 } }));
    assert.throws(() => gameInput.parse({ operationId: randomUUID(), action: { kind: 'sell', resource: 'wood', quantity: -1 } }));
    const noChange = game.get(); db.db.exec("CREATE TRIGGER fail_game_event BEFORE INSERT ON audit_events WHEN NEW.action LIKE 'game.%' BEGIN SELECT RAISE(ABORT,'forced failure'); END");
    now += 1500; assert.throws(() => act({ kind: 'gather', resource: 'stone' }), /forced failure/); assert.equal(game.get().coins, noChange.coins); assert.equal(game.get().inventory.stone, noChange.inventory.stone);
  } finally { db.close(); }
});

test('moinho preserva produção fracionária na redistribuição e não credita tempo duas vezes', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/game-passive-')); const db = new Store(dir); let now = 1000000; const game = new Game(db, () => now);
  const act = (action: GameAction) => game.act({ operationId: randomUUID(), action });
  try {
    for (let i = 0; i < 4; i++) { now += 1500; act({ kind: 'gather', resource: 'stone' }); }
    act({ kind: 'buy', item: 'windmill' }); const initial = game.get().coins;
    now += 15000; act({ kind: 'respec', build: { focus: 1, review: 0, planning: 0, practice: 0 } }); assert.equal(game.get().coins, initial + 1);
    now += 60000; assert.equal(game.get().coins, initial + 6); assert.equal(game.get().coins, initial + 6);
    const old = game.get(); assert.throws(() => act({ kind: 'respec', build: { focus: 2, review: 0, planning: 0, practice: 0 } }), /pontos/); assert.deepEqual(game.get(), old);
    now += 300000; act({ kind: 'respec', build: { focus: 0, review: 1, planning: 0, practice: 0 } }); assert.equal(game.get().coins, initial + 31); assert.equal(game.get().className, 'Erudito');
    now -= 10000; assert.equal(game.get().coins, initial + 31); now += 10 * 24 * 3600000; const capped = game.get().coins; assert.equal(game.get().coins, capped);
  } finally { db.close(); }
});

test('memória é calculada no main: pares, tentativas, combos, retomada e recompensa única por rodada', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/game-memory-')); let db = new Store(dir); let game = new Game(db); const act = (action: GameAction) => game.act({ operationId: randomUUID(), action });
  try {
    const state = act({ kind: 'start-round', difficulty: 'easy' }).state; const roundId = state.round!.id;
    assert.ok(state.round!.cards.every(c => c.label === null)); assert.equal(act({ kind: 'start-round', difficulty: 'hard' }).state.round!.id, roundId);
    const stored = JSON.parse(String(db.db.prepare('SELECT state FROM game_rounds WHERE id=?').get(roundId)?.state));
    const groups = new Map<number, number[]>(); for (const card of stored.cards) groups.set(card.pair, [...groups.get(card.pair) ?? [], card.id]);
    const pairs = [...groups.values()]; act({ kind: 'flip', roundId, card: pairs[0][0] });
    db.close(); db = new Store(dir); game = new Game(db); assert.equal(game.get().round!.selected[0], pairs[0][0]);
    act({ kind: 'flip', roundId, card: pairs[0][1] });
    for (const pair of pairs.slice(1, -1)) for (const card of pair) act({ kind: 'flip', roundId, card });
    const last = pairs.at(-1)!; act({ kind: 'flip', roundId, card: last[0] }); const finish = { operationId: randomUUID(), action: { kind: 'flip', roundId, card: last[1] } as const };
    const completed = game.act(finish).state; assert.ok(completed.round!.completed); assert.equal(completed.round!.attempts, 3); assert.equal(completed.round!.maxCombo, 3); assert.equal(game.act(finish).state.coins, completed.coins);
    assert.equal(db.db.prepare('SELECT count(*) n FROM game_ledger WHERE source=?').get(`round:${roundId}`)?.n, 1);
    const next = act({ kind: 'start-round', difficulty: 'normal' }).state.round!; assert.notEqual(next.id, roundId); assert.equal(next.cards.length, 12);
    assert.throws(() => act({ kind: 'flip', roundId, card: 0 }), /ativa/);
  } finally { db.close(); }
});

test('migração v1 para v4 conserva matéria, nota, mesa, rascunho e bytes do vault', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/game-migration-')), root = path.join(dir, 'vault'); fs.mkdirSync(root); let db = new Store(path.join(dir, 'data'));
  try {
    const subject = db.createSubject({ name: 'Preservar', color: 'sage' }), vault = new Vault(db); vault.selectRoot(root); const note = vault.create({ subjectId: subject.id, title: 'Original' });
    vault.draft({ id: note.ref.id, hash: note.hash, text: note.text + '\nRascunho preservado.' }); const original = fs.readFileSync(path.join(root, note.ref.path), 'utf8');
    db.db.exec('DROP TABLE card_reviews; DROP TABLE flashcards; DROP TABLE pdf_marks; DROP TABLE video_moments; DROP TABLE note_links; ALTER TABLE desks DROP COLUMN video_id; ALTER TABLE desks DROP COLUMN material_view; DROP TABLE videos; DROP TABLE project_drafts; DROP TABLE project_folders; DROP TABLE game_challenges; DROP TABLE game_player; DROP TABLE game_ledger; DROP TABLE game_operations; DROP TABLE game_rounds; PRAGMA user_version=1;'); db.close(); db = new Store(path.join(dir, 'data'));
    assert.equal(db.db.prepare('PRAGMA user_version').get()?.user_version, 5); assert.equal(db.requireSubject(subject.id).name, 'Preservar'); assert.equal(new Vault(db).open(note.ref.id).draft!.text, note.text + '\nRascunho preservado.'); assert.equal(fs.readFileSync(path.join(root, note.ref.path), 'utf8'), original); assert.ok(db.db.prepare('SELECT subject_id FROM desks WHERE subject_id=?').get(subject.id));
    assert.equal(new Game(db).get().coins, 60);
  } finally { db.close(); }
});
