import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { _electron as electron, type Page } from 'playwright';
import electronPath from 'electron';
import { prepareFixture } from './test-fixture';
import { MEMORY_PAIRS, SHOP, type GameState } from '../src/shared/game';
import { Store } from '../src/main/store';

// Isolated fixture; all earnings below come from actual UI actions/server rules.
// No injected wallet, clock, hidden board or renderer mock is used.
const f = prepareFixture('game-journey'), data = path.join(f.dir, 'data');
const packaged = process.argv.includes('--packaged'), stage = packaged ? 'verified' : 'dev';
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const reports: string[] = [], roundIds: string[] = [];
let final: GameState, deskBefore: unknown;
const file = path.join(f.root, ...f.noteA.ref.path.split('/')), canonical = fs.readFileSync(file, 'utf8');
const pending = canonical + '\nRascunho preservado durante a visita à cidade.\n';
fs.mkdirSync('.local/evidence', { recursive: true });
async function state(page: Page) { const r = await page.evaluate(() => window.desktop.getGame()); if (!r.ok) throw Error(r.message); return r.value; }
async function ready(page: Page) { await page.locator('.game-shell[aria-busy="false"]').waitFor(); }
async function shot(page: Page, name: string) { await ready(page); await page.screenshot({ path: `.local/evidence/game-${stage}-${name}.png` }); }
const meanings = new Map<string, number>(MEMORY_PAIRS.flatMap((pair, i) => pair.map(label => [label, i] as [string, number])));
async function solve(page: Page, difficulty: 'easy' | 'normal' | 'hard') {
  await page.getByRole('button', { name: 'Memória', exact: true }).click();
  await page.getByRole('combobox', { name: 'Dificuldade da memória' }).selectOption(difficulty);
  await page.getByRole('button', { name: /Começar rodada|Jogar nova rodada/ }).click(); await ready(page);
  const seen = new Map<number, number>(); let snapshot = await state(page);
  assert.equal(snapshot.round?.difficulty, difficulty);
  assert.ok(snapshot.round?.cards.every(c => c.label === null));
  roundIds.push(snapshot.round!.id);
  for (let flips = 0; flips < 130; flips++) {
    const round = snapshot.round!; if (round.completed) { reports.push(`Memória ${difficulty}: ${round.attempts} tentativas, ${round.coins} moedas, ${round.xp} XP, rodada ${round.id}.`); return snapshot; }
    for (const card of round.cards) if (card.label !== null) { const meaning = meanings.get(card.label); assert.notEqual(meaning, undefined); seen.set(card.id, meaning!); }
    const available = round.cards.filter(c => !c.matched);
    let choice: number | undefined;
    if (round.selected.length === 1) {
      const first = round.selected[0]; choice = available.find(c => c.id !== first && seen.has(first) && seen.get(c.id) === seen.get(first))?.id;
      choice ??= available.find(c => c.id !== first && !seen.has(c.id))?.id;
      choice ??= available.find(c => c.id !== first)?.id;
    } else {
      choice = available.find(c => seen.has(c.id) && available.some(other => other.id !== c.id && seen.get(other.id) === seen.get(c.id)))?.id;
      choice ??= available.find(c => !seen.has(c.id))?.id;
      choice ??= available[0]?.id;
    }
    assert.notEqual(choice, undefined);
    await page.getByRole('button', { name: new RegExp(`^Carta ${choice! + 1}(?:,|:)`) }).click(); await ready(page); snapshot = await state(page);
    // Only the labels revealed by the same public flow available to a player.
    for (const card of snapshot.round!.cards) if (card.label !== null) seen.set(card.id, meanings.get(card.label)!);
    if (flips === 5 && difficulty === 'hard') await shot(page, 'memory');
  }
  throw Error('O jogador não conseguiu terminar a rodada.');
}
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: packaged ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(packaged ? [] : ['.']), `--user-data-dir=${data}`], env });
  const page = await app.firstWindow(), errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  try {
    await page.getByRole('heading', { name: 'Nota A', exact: true, level: 2 }).waitFor();
    if (!pass) {
      await page.getByRole('textbox', { name: 'Conteúdo da nota' }).fill(pending);
      await page.keyboard.press('Alt+1');
      await page.getByRole('button', { name: 'Iniciar foco', exact: true }).click();
      deskBefore = await page.evaluate(subjectId => window.desktop.openDesk({ subjectId }), f.a.id);
    }
    await page.getByRole('button', { name: 'Entrar na cidade', exact: true }).click();
    await page.locator('canvas[data-ready=true]').waitFor(); await ready(page);
    const focus = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id);
    assert.ok(focus.ok && focus.value.session?.state === 'paused'); assert.equal(fs.readFileSync(file, 'utf8'), canonical);
    if (!pass) {
      assert.equal((await state(page)).coins, 60); assert.equal((await state(page)).xp, 0);
      await page.getByRole('button', { name: 'Visitar fazenda', exact: true }).click();
      for (let i = 1; i <= 4; i++) { await page.getByRole('button', { name: `Plantar canteiro ${i}`, exact: true }).click(); await ready(page); }
      assert.equal((await state(page)).coins, 52); await shot(page, 'planted');
      const immature = await page.evaluate(operationId => window.desktop.gameAction({ operationId, action: { kind: 'harvest', plot: 1 } }), randomUUID()); assert.ok(!immature.ok && immature.code === 'NOT_READY');
      const injected = await page.evaluate(operationId => window.desktop.gameAction({ operationId, action: { kind: 'buy', item: 'cottage', coins: -1 } } as never), randomUUID()); assert.ok(!injected.ok && injected.code === 'INVALID_ARGUMENT');
      const insufficient = await page.evaluate(operationId => window.desktop.gameAction({ operationId, action: { kind: 'buy', item: 'cottage' } }), randomUUID()); assert.ok(!insufficient.ok && insufficient.code === 'INSUFFICIENT_COINS'); assert.equal((await state(page)).coins, 52);
      await page.getByRole('button', { name: 'Visitar mina', exact: true }).click(); await page.getByRole('button', { name: /Explorar mina/ }).click(); await ready(page);
      assert.equal((await state(page)).inventory.stone, 1);
      const cooldown = await page.evaluate(operationId => window.desktop.gameAction({ operationId, action: { kind: 'gather', resource: 'wood' } }), randomUUID()); assert.ok(!cooldown.ok && cooldown.code === 'COOLDOWN');
      await page.getByRole('button', { name: 'Visitar bosque', exact: true }).click(); await page.getByRole('button', { name: /Coletar madeira/ }).click(); await ready(page); assert.equal((await state(page)).inventory.wood, 1);
      await solve(page, 'easy');
      await page.getByRole('button', { name: 'Mercado', exact: true }).click(); await page.getByRole('button', { name: 'Comprar Moinho', exact: true }).click(); await ready(page);
      assert.ok((await state(page)).owned.includes('windmill'));
      await solve(page, 'normal'); await solve(page, 'hard');
      await page.getByRole('button', { name: 'Vila', exact: true }).click(); await page.locator('canvas[data-ready=true]').waitFor(); await page.getByRole('button', { name: 'Visitar fazenda', exact: true }).click();
      const due = Math.max(...(await state(page)).plots.map(p => p.readyAt));
      if (Date.now() < due) { console.log('Aguardando crescimento real dos cultivos.'); await page.waitForTimeout(Math.min(45000, due - Date.now() + 1100)); }
      for (let i = 1; i <= 4; i++) { await page.getByRole('button', { name: `Colher canteiro ${i}`, exact: true }).click(); await ready(page); }
      assert.equal((await state(page)).inventory.wheat, 4);
      await page.getByRole('button', { name: 'Mercado', exact: true }).click(); await page.getByRole('button', { name: 'Vender Trigo', exact: true }).click(); await ready(page); assert.equal((await state(page)).inventory.wheat, 0);
      // Fund the current real catalog through genuine rounds; never inject a wallet.
      const ownedBefore = (await state(page)).owned;
      const shoppingCost = SHOP.filter(item => !ownedBefore.includes(item.id)).reduce((sum, item) => sum + item.cost, 0);
      for (let rounds = 0; rounds < 20 && (await state(page)).coins < shoppingCost; rounds++) await solve(page, 'hard');
      assert.ok((await state(page)).coins >= shoppingCost, 'saldo obtido pelas rodadas deve cobrir as compras');
      await page.getByRole('button', { name: 'Mercado', exact: true }).click();
      for (const item of SHOP.filter(v => v.id !== 'windmill')) { await page.getByRole('button', { name: `Comprar ${item.name}`, exact: true }).click(); await ready(page); }
      assert.deepEqual([...(await state(page)).owned].sort(), SHOP.map(item => item.id).sort()); assert.equal((await state(page)).plots.length, 6); await shot(page, 'shop');
      const noRepeat = await page.evaluate(operationId => window.desktop.gameAction({ operationId, action: { kind: 'buy', item: 'windmill' } }), randomUUID()); assert.ok(!noRepeat.ok && noRepeat.code === 'ALREADY_OWNED');
      await page.getByRole('button', { name: 'Personagem', exact: true }).click(); await page.getByRole('button', { name: 'Aumentar Prática', exact: true }).click(); await page.getByRole('button', { name: 'Salvar build · grátis', exact: true }).click(); await ready(page); assert.equal((await state(page)).className, 'Explorador'); await shot(page, 'build');
      await page.getByRole('button', { name: 'Redistribuir todos os pontos', exact: true }).click(); await ready(page); assert.equal((await state(page)).className, 'Viajante');
      await page.getByRole('button', { name: 'Vila', exact: true }).click(); await page.locator('canvas[data-ready=true]').waitFor(); await page.getByRole('button', { name: 'Visitar mina', exact: true }).click();
      const stock = (await state(page)).inventory.stone; await page.getByRole('button', { name: /Explorar mina/ }).click(); await ready(page); assert.equal((await state(page)).inventory.stone, stock + 2);
      await page.getByRole('button', { name: 'Visitar fazenda', exact: true }).click();
      await page.getByRole('combobox', { name: 'Tipo de cultivo' }).selectOption('carrot');
      for (let i = 1; i <= 6; i++) { await page.getByRole('button', { name: `Plantar canteiro ${i}`, exact: true }).click(); await ready(page); }
      // Real operation replay over preload/IPC: a repeated respec cannot create a second ledger entry.
      const operationId = randomUUID(), build = (await state(page)).build;
      const replay = await page.evaluate(async input => ({ first: await window.desktop.gameAction(input), second: await window.desktop.gameAction(input) }), { operationId, action: { kind: 'respec' as const, build } });
      assert.ok(replay.first.ok && replay.second.ok && replay.second.value.replayed);
      await page.getByRole('button', { name: 'Aproximar cidade', exact: true }).click(); await page.getByRole('button', { name: 'Centralizar cidade', exact: true }).click();
      await shot(page, 'city');
      await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 1040, height: 760 });
      await shot(page, 'compact'); const footer = await page.locator('.game-footer').boundingBox(); assert.ok(footer && footer.y + footer.height <= 760);
      // An unfinished normal round survives a full executable restart, including its first revealed card.
      await page.getByRole('button', { name: 'Memória', exact: true }).click(); await page.getByRole('combobox', { name: 'Dificuldade da memória' }).selectOption('normal'); await page.getByRole('button', { name: /Jogar nova rodada/ }).click(); await ready(page);
      await page.getByRole('button', { name: 'Carta 1, fechada', exact: true }).click(); await ready(page); final = await state(page);
      reports.push(`Plantio real, espera de maturação, quatro colheitas/venda, mina/bosque, ${SHOP.length} compras, picareta dobrada, seis canteiros, build/respec, replay e rejeições IPC aprovados.`);
    } else {
      const restored = await state(page); assert.ok(restored.coins >= final.coins + 4); assert.equal(restored.xp, final.xp); assert.deepEqual(restored.inventory, final.inventory); assert.deepEqual(restored.owned, final.owned); assert.deepEqual(restored.build, final.build); assert.deepEqual(restored.plots, final.plots); assert.deepEqual(restored.round, final.round);
      await page.getByRole('button', { name: 'Memória', exact: true }).click(); assert.equal(await page.getByRole('combobox', { name: 'Dificuldade da memória' }).inputValue(), 'normal'); await shot(page, 'resumed-memory');
      await page.getByRole('button', { name: /Voltar à mesa/ }).click(); await page.getByRole('heading', { name: 'Nota A', exact: true, level: 2 }).waitFor();
      await page.getByRole('textbox', { name: 'Conteúdo da nota' }).press('Control+End');
      await page.getByText('Rascunho preservado durante a visita à cidade.', { exact: true }).waitFor();
      const resumedNote = await page.evaluate(id => window.desktop.openNote({ id }), f.noteA.ref.id); assert.ok(resumedNote.ok && resumedNote.value.draft?.text === pending);
      assert.deepEqual(await page.evaluate(subjectId => window.desktop.openDesk({ subjectId }), f.a.id), deskBefore);
      const restoredFocus = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id); assert.deepEqual(restoredFocus, focus);
      await page.getByRole('button', { name: 'Salvar nota', exact: true }).click(); await page.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor(); assert.equal(fs.readFileSync(file, 'utf8'), pending);
      await page.locator('canvas[data-rendered-page="2"]').waitFor(); await page.screenshot({ path: `.local/evidence/game-${stage}-study-return.png` });
      reports.push('Executável fechado/reaberto: carteira/XP/itens/build/cultivos/rodada preservados e +4 moedas ou mais de produção passiva com tempo real fechado. Mesa, Markdown, PDF/página/divisão e foco pausado retomados; rascunho salvo sem perder a fonte.');
    }
    assert.deepEqual(errors, []);
  } catch (error) { await page.screenshot({ path: `.local/evidence/game-${stage}-failure.png` }).catch(() => {}); throw error; }
  finally { await app.close(); }
  if (!pass) {
    const inspect = new Store(data), cursor = JSON.parse(String(inspect.db.prepare('SELECT state FROM game_player WHERE id=1').get()!.state)).passiveAt; inspect.close();
    const wait = Math.max(0, cursor + 61000 - Date.now()); console.log(`App fechado: aguardando ${Math.ceil(wait / 1000)}s para provar produção passiva real.`);
    if (wait) await new Promise(resolve => setTimeout(resolve, Math.min(60000, wait)));
  }
}
const db = new Store(data);
assert.equal(db.db.prepare("SELECT count(*) AS n FROM game_ledger WHERE source LIKE 'round:%'").get()!.n, roundIds.length);
const total = db.db.prepare('SELECT sum(coins) AS coins,sum(xp) AS xp FROM game_ledger').get()!;
const actual = db.db.prepare('SELECT coins,xp FROM game_player WHERE id=1').get()!; assert.deepEqual(total, actual); db.close();
reports.push('Ledger concilia carteira/XP e existe uma única recompensa por rodada concluída. Sem erros de renderer.');
fs.writeFileSync(`.local/evidence/game-${stage}-results.json`, JSON.stringify({ fixture: f.dir, date: new Date().toISOString(), packaged, reports, final: final!, rounds: roundIds }, null, 2));
console.log(JSON.stringify({ fixture: f.dir, packaged, reports }, null, 2));
