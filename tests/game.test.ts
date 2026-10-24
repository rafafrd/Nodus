import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { Vault } from '../src/main/vault';
import { Focus } from '../src/main/focus';
import { BALANCE } from '../src/shared/economy';
import { gameInput, type GameAction } from '../src/shared/game';
import { dec } from '../src/shared/amount';

const setup = (prefix: string, random = () => .5) => { const dir = fs.mkdtempSync(path.resolve(`.local/${prefix}-`)); const db = new Store(dir); let now = Date.UTC(2026, 9, 23, 12); const clock = { get now() { return now; }, set now(v) { now = v; } }; const game = new Game(db, () => now, random); return { dir, db, game, clock, act: (action: GameAction) => game.act({ operationId: randomUUID(), action }) }; };
// Fixture helper: edits the saved JSON directly to reach a later point of the game without playing it.
function patch(db: Store, change: (state: Record<string, any>) => void, coins?: string) { const raw = JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state)); change(raw); db.db.prepare('UPDATE game_player SET state=?' + (coins ? ',coins=?' : '')).run(...[JSON.stringify(raw), ...(coins ? [coins] : [])]); }

test('núcleo sem orçamento: lote validado pelo relógio do main, replay, ledger agregado e rollback', () => {
  const { db, game, clock, act } = setup('game-core');
  try {
    assert.equal(game.get().coins, 15);
    const click = { operationId: randomUUID(), action: { kind: 'core-click' as const, count: 10 } };
    const first = game.act(click).state; assert.equal(first.coins, 25); assert.equal(first.engine.clicks, 10);
    assert.equal(game.act(click).replayed, true); assert.equal(game.get().coins, 25);
    assert.throws(() => game.act({ ...click, action: { kind: 'core-click', count: 11 } }), /outra ação/);
    const burst = act({ kind: 'core-click', count: 40 }); assert.equal(burst.state.engine.lastGain, 30, 'balde de 40: 10 já usados');
    clock.now += 10; assert.equal(act({ kind: 'core-click', count: 40 }).state.engine.lastGain, 0, '10 ms não repõem um clique');
    clock.now += 400; assert.equal(act({ kind: 'core-click', count: 40 }).state.engine.lastGain, 10, '400 ms repõem 10 cliques');
    for (let i = 0; i < 300; i++) { clock.now += 1000; act({ kind: 'core-click', count: 20 }); }
    const many = game.get(); assert.ok(dec(many.coins).gte(25 + 30 + 10 + 300 * 20), 'o clique nunca deixa de pagar');
    assert.ok(Number(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'click:%'").get()!.n) <= 7, 'um registro de ledger por minuto de cliques');
    assert.equal(db.db.prepare('SELECT sum(coins) coins FROM game_ledger').get()!.coins, many.coins);
    for (const count of [0, 41, 1.5]) assert.throws(() => gameInput.parse({ operationId: randomUUID(), action: { kind: 'core-click', count } }));
    db.db.exec("CREATE TRIGGER reject_click BEFORE INSERT ON game_operations BEGIN SELECT RAISE(ABORT,'forced click rollback'); END");
    clock.now += 1000; assert.throws(() => act({ kind: 'core-click', count: 5 }), /rollback/); assert.equal(game.get().coins, many.coins); assert.equal(game.get().engine.clicks, many.engine.clicks);
  } finally { db.close(); }
});

test('clique escala com a produção: lentes somam parcela da produção por segundo e efeitos multiplicam', () => {
  const { db, game, act } = setup('game-click-scale');
  try {
    patch(db, s => { s.economy.producers.collectors = 50; s.economy.upgrades = ['lens-1', 'lens-2']; s.engine.clicks = 500; });
    const s = game.get(), perSecond = dec(s.economy.rate).div(60);
    assert.equal(String(s.engine.power), String(dec(1).plus(perSecond.mul(.02)).floor()));
    patch(db, st => { st.economy.activeEvents = [{ id: randomUUID(), type: 'spark', foundAt: 0, startedAt: 0, endsAt: Date.UTC(2027, 0, 1) }]; });
    assert.equal(String(game.get().engine.power), String(dec(1).plus(perSecond.mul(.02)).mul(200).floor()));
    assert.ok(act({ kind: 'core-click', count: 1 }).state.engine.lastGain);
  } finally { db.close(); }
});

test('Lampejo: só tempo assistido aproxima, nunca durante o Foco, expira sem punição e paga uma vez', () => {
  const { db, game, clock, act } = setup('game-flash', () => 0);
  try {
    act({ kind: 'producer-buy', producer: 'collectors', quantity: 1 });
    clock.now += 60 * 60000; assert.equal(game.get().flash, null, 'tempo sem a cidade na tela não conta');
    for (let i = 0; i < 240; i++) { clock.now += 1000; game.get({ watching: true }); }
    assert.equal(game.get({ watching: true }).flash, null);
    clock.now += 1000; let s = game.get({ watching: true }); assert.ok(s.flash, 'aparece após 4 min assistidos (sorteio mínimo da fixture)');
    clock.now += BALANCE.flashLifetimeMs + 800; s = game.get({ watching: true }); assert.equal(s.flash, null, 'some depois de 12 s'); const coins = s.coins;
    assert.ok(dec(s.coins).gte(coins));
    const subject = db.createSubject({ name: 'Foco', color: 'sage' }), focus = new Focus(db, () => 0, () => clock.now), session = focus.start(subject.id, 25).session!;
    for (let i = 0; i < 600; i++) { clock.now += 1000; s = game.get({ watching: true }); }
    assert.equal(s.flash, null, 'Foco ativo bloqueia o Lampejo'); assert.equal(s.economy.focusActive, true);
    focus.act({ subjectId: subject.id, id: session.id, action: 'pause' });
    for (let i = 0; i < 300 && !s.flash; i++) { clock.now += 1000; s = game.get({ watching: true }); }
    assert.ok(s.flash);
    const input = { operationId: randomUUID(), action: { kind: 'flash-catch' as const, id: s.flash!.id } };
    const caught = game.act(input).state; assert.equal(caught.flash, null); assert.equal(caught.economy.events, 1); assert.equal(game.act(input).replayed, true); assert.equal(game.get().economy.events, 1);
    assert.ok(caught.economy.activeEvents.some(e => e.type === 'tide'), 'sorteio 0 da fixture cai em Maré');
    assert.throws(() => act({ kind: 'flash-catch', id: randomUUID() }), /já passou/);
  } finally { db.close(); }
});

test('Horta: abre com 10 Coletores, semente custa um minuto, flor rende enquanto plantada, raiz fortalece o clique', () => {
  const { db, game, clock, act } = setup('game-garden');
  try {
    assert.throws(() => act({ kind: 'plant', plot: 1, crop: 'wheat' }), /Horta abre/);
    patch(db, s => { s.economy.producers.collectors = 10; }, '100000');
    let s = game.get(); assert.equal(s.garden.unlocked, true); const rate = dec(s.economy.rate);
    assert.equal(String(s.garden.seedCost), String(rate.ceil().gt(BALANCE.seedFloor) ? rate.floor() : BALANCE.seedFloor));
    s = act({ kind: 'plant', plot: 1, crop: 'dew' }).state; assert.ok(dec(s.economy.rate).gt(rate.mul(1.02)), 'flor plantada soma 3%');
    assert.throws(() => act({ kind: 'plant', plot: 1, crop: 'wheat' }), /plantado/);
    assert.throws(() => act({ kind: 'harvest', plot: 1 }), /pronto/);
    assert.throws(() => act({ kind: 'plant', plot: 5, crop: 'wheat' }), /Terra fértil/);
    act({ kind: 'plant', plot: 2, crop: 'carrot' }); act({ kind: 'plant', plot: 3, crop: 'wheat' });
    clock.now += 15 * 60000; const before = game.get();
    const wheat = act({ kind: 'harvest', plot: 3 }).state; assert.ok(dec(wheat.coins).gt(before.coins)); assert.equal(wheat.economy.harvested, 1);
    const carrot = act({ kind: 'harvest', plot: 2 }).state; assert.ok(carrot.economy.activeEvents.some(e => e.type === 'amber')); assert.ok(dec(carrot.engine.power).gte(dec(wheat.engine.power).mul(3).floor()));
    patch(db, st => { st.economy.producers.collectors = 0; st.economy.cycles = 1; });
    assert.equal(game.get().garden.unlocked, true, 'a Horta continua aberta depois de um novo ciclo');
  } finally { db.close(); }
});

test('Conselho: cadeiras com força decrescente, deliberações limitadas e regeneradas, pauta única', () => {
  const { db, game, clock, act } = setup('game-council');
  try {
    assert.throws(() => act({ kind: 'council-seat', seat: 0, policy: 'extended-shift' }), /Conselho abre/);
    patch(db, s => { s.economy.producers.workshops = 5; s.economy.producers.collectors = 10; });
    const base = game.get(); assert.equal(base.council.deliberations, 3);
    const first = act({ kind: 'council-seat', seat: 0, policy: 'extended-shift' }).state;
    assert.equal(dec(first.economy.rate).div(base.economy.rate).toDecimalPlaces(6).toString(), '1.2');
    assert.throws(() => act({ kind: 'council-seat', seat: 1, policy: 'extended-shift' }), /outra cadeira/);
    act({ kind: 'council-seat', seat: 1, policy: 'joint-effort' }); const third = act({ kind: 'council-seat', seat: 2, policy: 'short-route' }).state;
    assert.equal(third.council.deliberations, 0); assert.throws(() => act({ kind: 'council-seat', seat: 2, policy: 'rich-harvest' }), /deliberações/);
    assert.equal(act({ kind: 'council-seat', seat: 2, policy: null }).state.council.seats[2], null, 'esvaziar é grátis');
    clock.now += BALANCE.deliberationMs; assert.equal(game.get().council.deliberations, 1);
    clock.now += 10 * BALANCE.deliberationMs; assert.equal(game.get().council.deliberations, 3);
    assert.throws(() => gameInput.parse({ operationId: randomUUID(), action: { kind: 'council-seat', seat: 3, policy: 'short-route' } }));
    assert.throws(() => gameInput.parse({ operationId: randomUUID(), action: { kind: 'council-seat', seat: 0, policy: 'bogus' } }));
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

test('migração v1 para v6 conserva matéria, nota, mesa, rascunho e bytes do vault', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/game-migration-')), root = path.join(dir, 'vault'); fs.mkdirSync(root); let db = new Store(path.join(dir, 'data'), 5);
  try {
    const subject = db.createSubject({ name: 'Preservar', color: 'sage' }), vault = new Vault(db); vault.selectRoot(root); const note = vault.create({ subjectId: subject.id, title: 'Original' });
    vault.draft({ id: note.ref.id, hash: note.hash, text: note.text + '\nRascunho preservado.' }); const original = fs.readFileSync(path.join(root, note.ref.path), 'utf8');
    db.db.exec('DROP TABLE card_reviews; DROP TABLE flashcards; DROP TABLE pdf_marks; DROP TABLE video_moments; DROP TABLE note_links; ALTER TABLE desks DROP COLUMN video_id; ALTER TABLE desks DROP COLUMN material_view; DROP TABLE videos; DROP TABLE project_drafts; DROP TABLE project_folders; DROP TABLE game_challenges; DROP TABLE game_player; DROP TABLE game_ledger; DROP TABLE game_operations; DROP TABLE game_rounds; PRAGMA user_version=1;'); db.close(); db = new Store(path.join(dir, 'data'));
    assert.equal(db.db.prepare('PRAGMA user_version').get()?.user_version, 7); assert.equal(db.requireSubject(subject.id).name, 'Preservar'); assert.equal(new Vault(db).open(note.ref.id).draft!.text, note.text + '\nRascunho preservado.'); assert.equal(fs.readFileSync(path.join(root, note.ref.path), 'utf8'), original); assert.ok(db.db.prepare('SELECT subject_id FROM desks WHERE subject_id=?').get(subject.id));
    assert.equal(new Game(db).get().coins, 15);
  } finally { db.close(); }
});
