import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { _electron as electron, type ElectronApplication, type Page } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { UserPreferences } from '../src/main/preferences';
import type { GameState } from '../src/shared/game';

// GAM-06 journey on the packaged Windows app. Generated fixtures only; every game number below comes from
// real IPC and SQLite. Saved JSON is edited only to skip waiting (Lampejo timer, an earned economy) and is
// marked "fixture" where it happens. Also carries the shell checks of the retired smoke-city-progression.
const out = path.resolve('.local/evidence/gam-06/smoke'); fs.mkdirSync(out, { recursive: true });
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const checks: string[] = [], errors: string[] = [];
const f = prepareFixture('idle-game'), data = path.join(f.dir, 'data');
{ // Fixture: an earned economy (Horta and Conselho open), Editorial with animations.
  const store = new Store(data); let now = Date.now() - 30 * 60000; const game = new Game(store, () => now);
  const act = (action: never) => game.act({ operationId: randomUUID(), action });
  for (let i = 0; i < 30 * 60; i++) { now += 1000; act({ kind: 'core-click', count: 4 } as never); const s = game.get(); const p = s.economy.producersView.filter(v => v.unlocked).sort((a, b) => Number(a.cost) - Number(b.cost))[0]; if (p && Number(p.cost) <= Number(s.coins)) act({ kind: 'producer-buy', producer: p.id, quantity: 1 } as never); }
  assert.ok(game.get().garden.unlocked && game.get().council.unlocked, 'fixture abre Horta e Conselho jogando');
  new UserPreferences(store).update({ theme: 'editorial', animations: true, editorialBackground: true }); store.close();
}
const originals = fs.readdirSync(f.root).filter(n => n.endsWith('.md')).map(n => ({ file: path.join(f.root, n), bytes: fs.readFileSync(path.join(f.root, n)) }));
async function launch(dir = data) { return electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${dir}`], env }); }
let app: ElectronApplication = await launch(), page: Page = await app.firstWindow();
function listen() { page.setDefaultTimeout(30000); page.on('pageerror', e => errors.push(e.message)); }
listen();
async function state(): Promise<GameState> { const r = await page.evaluate(() => window.desktop.getGame()); assert.ok(r.ok); return r.value; }
async function idle() { await page.locator('.area-stage[data-motion=idle]').waitFor(); }
async function ready() { await page.locator('.game-shell[aria-busy=false]').waitFor(); }
// Polls the main process from the test side until the condition holds (IPC answers are asynchronous).
async function until(test: (s: GameState) => boolean, label: string) { for (let i = 0; i < 150; i++) { const s = await state(); if (test(s)) return s; await page.waitForTimeout(100); } throw new Error('Tempo esgotado: ' + label); }
async function rail(name: string) { await page.locator('#nodus-sidebar').getByRole('button', { name, exact: true }).click(); await idle(); }
async function tab(name: string) { await page.getByRole('navigation', { name: 'Jogo' }).getByRole('button', { name, exact: true }).click(); await ready(); }
async function shot(name: string) { await page.waitForTimeout(250); await page.screenshot({ path: path.join(out, name + '.png') }); }
// Fixture edit while the app runs: one atomic read-modify-write on the same SQLite file (WAL).
function patchState(change: (s: Record<string, any>) => void, dir = data) { const db = new DatabaseSync(path.join(dir, 'study.sqlite')); try { db.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE'); const raw = JSON.parse(String(db.prepare('SELECT state FROM game_player').get()!.state)); change(raw); db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(raw)); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } finally { db.close(); } }
async function dimensions(width: number, height: number) { await app.evaluate(({ BrowserWindow }, size) => { const w = BrowserWindow.getAllWindows()[0]; w.unmaximize(); w.setContentSize(size.width, size.height); }, { width, height }); await page.waitForFunction(size => innerWidth === size.width && innerHeight === size.height, { width, height }); }
try {
  await page.getByRole('textbox', { name: 'Título da nota', exact: true }).waitFor(); await dimensions(1440, 900);
  // Shell checks carried over from smoke-city-progression.
  assert.equal(await page.locator('.desktop-drag').evaluate(e => getComputedStyle(e).getPropertyValue('-webkit-app-region')), 'drag');
  await page.getByRole('button', { name: 'Maximizar janela', exact: true }).click(); await page.getByRole('button', { name: 'Restaurar janela', exact: true }).waitFor(); assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMaximized()), true);
  await page.getByRole('button', { name: 'Restaurar janela', exact: true }).click(); await page.getByRole('button', { name: 'Maximizar janela', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Minimizar janela', exact: true }).click(); await page.waitForFunction(() => document.querySelector('[data-testid=app-backdrop]')?.getAttribute('data-running') === 'false'); assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isMinimized()), true);
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].restore()); await page.waitForFunction(() => !document.hidden);
  const invalid = await page.evaluate(() => window.desktop.controlWindow({ action: 'arbitrary' } as never)); assert.ok(!invalid.ok && invalid.code === 'INVALID_ARGUMENT');
  checks.push('Janela: maximizar/restaurar/minimizar, região de arraste, fundo pausado minimizado e argumento inválido');
  const foreign = await app.evaluate(async ({ BrowserWindow }) => { const w = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } }); try { await w.loadURL('data:text/html,fixture'); return await w.webContents.executeJavaScript("Promise.all([['window:get'],['game:get',{watching:true}],['game:action',{operationId:'00000000-0000-4000-8000-000000000001',action:{kind:'core-click',count:40}}]].map(([channel,input])=>require('electron').ipcRenderer.invoke(channel,input)))"); } finally { w.destroy(); } });
  for (const r of foreign as { ok: boolean; code: string }[]) assert.deepEqual({ ok: r.ok, code: r.code }, { ok: false, code: 'FORBIDDEN' });
  const bad = await page.evaluate(() => Promise.all([window.desktop.getGame({ watching: 'yes' } as never), window.desktop.gameAction({ operationId: crypto.randomUUID(), action: { kind: 'core-click', count: 41 } } as never), window.desktop.gameAction({ operationId: crypto.randomUUID(), action: { kind: 'engine-click' } } as never)]));
  for (const r of bad) assert.equal(r.ok, false);
  checks.push('IPC do jogo: outro remetente negado; watching, lote de 41 cliques e ação antiga rejeitados pelo Zod');
  // Observatory: click batches, store, ticker, scene.
  await rail('Entrar na cidade'); await page.locator('.game-shell[data-area-ready=true]').waitFor(); await page.locator('canvas[data-testid=city-canvas][data-ready=true]').waitFor();
  await shot('observatorio');
  const before = await state(), core = page.getByRole('button', { name: 'Clicar no núcleo', exact: true });
  for (let i = 0; i < 20; i++) { await core.click(); await page.waitForTimeout(45); }
  assert.ok(await page.locator('.core-float').count() > 0, 'números flutuantes com animação ligada');
  const clicked = await until(s => s.engine.clicks >= before.engine.clicks + 20, '20 cliques confirmados'); assert.equal(clicked.engine.clicks - before.engine.clicks, 20, JSON.stringify({ before: before.engine.clicks, after: clicked.engine.clicks, recent: clicked.recent })); assert.ok(Number(clicked.economy.lifetime) > Number(before.economy.lifetime));
  assert.ok(await page.locator('.game-ticker-line').textContent());
  const family = clicked.economy.producersView.filter(v => v.unlocked).sort((a, b) => Number(a.cost) - Number(b.cost))[0];
  const name = (await import('../src/shared/economy')).PRODUCERS.find(p => p.id === family.id)!.name;
  await page.getByRole('button', { name: `Comprar 1 ${name}`, exact: true }).click({ timeout: 120000 }); await ready();
  assert.equal((await state()).economy.producers[family.id], family.count + 1);
  checks.push(`Núcleo: 20 cliques reais em lotes confirmados pelo main, números flutuantes, ticker; loja comprou ${name}`);
  // Lampejo: fixture shortens the watched time needed; it appears only while the city is on screen.
  patchState(s => { s.economy.watchNeedMs = 3000; s.economy.watchedMs = 0; });
  await page.getByTestId('flash-light').waitFor({ timeout: 15000 }); await shot('lampejo');
  const events = (await state()).economy.events; await page.getByTestId('flash-light').click(); await ready();
  await until(s => s.economy.events === events + 1, 'Lampejo pego');
  const boot = await page.evaluate(() => window.desktop.bootstrap()); assert.ok(boot.ok); const subjectId = boot.value.subjects[0].id;
  const focus = await page.evaluate(id => window.desktop.startFocus({ subjectId: id, minutes: 25 }), subjectId); assert.ok(focus.ok && focus.value.session?.state === 'running');
  patchState(s => { s.economy.watchNeedMs = 2000; s.economy.watchedMs = 0; });
  await page.waitForTimeout(6000); assert.equal(await page.getByTestId('flash-light').count(), 0, 'Foco ativo bloqueia o Lampejo');
  assert.match(await page.locator('.observatory-rule').textContent() ?? '', /Foco ativo/);
  await page.evaluate(([id, session]) => window.desktop.actFocus({ subjectId: id, id: session, action: 'pause' }), [subjectId, focus.value.session!.id] as const);
  await page.getByTestId('flash-light').waitFor({ timeout: 15000 });
  await rail('Abrir início'); patchState(s => { s.economy.flash = null; s.economy.watchNeedMs = 2000; s.economy.watchedMs = 0; }); await page.waitForTimeout(5000);
  await rail('Entrar na cidade'); await ready(); assert.equal((await state()).flash, null, 'tempo fora da cidade não conta');
  checks.push('Lampejo: surge com a cidade visível, pego pela UI uma vez; bloqueado durante o Foco e fora da área');
  // Minigames through the UI.
  await tab('Horta'); await page.getByRole('button', { name: 'Plantar Trigo-luz no canteiro 1', exact: true }).click({ timeout: 120000 }); await ready(); assert.equal((await state()).plots[0].crop, 'wheat'); await shot('horta');
  await tab('Conselho'); await page.locator('.council-seat').first().getByRole('button', { name: /Turno estendido/ }).click(); await ready();
  const seated = await state(); assert.equal(seated.council.seats[0], 'extended-shift'); assert.equal(seated.council.deliberations, 2); await shot('conselho');
  await tab('Memória'); await page.getByRole('button', { name: /Começar rodada/ }).click(); await ready(); assert.ok((await state()).round); await shot('memoria');
  for (const [t, file] of [['Conquistas', 'conquistas'], ['Legado', 'legado'], ['Perfil', 'perfil']] as const) { await tab(t); await shot(file); }
  checks.push('Horta plantada, Conselho com pauta e deliberação gasta, Memória iniciada, Conquistas/Legado/Perfil abertos');
  // Skins share the canvas; reduced motion leaves a static end state.
  await tab('Perfil'); for (const skin of ['cyberpunk', 'newyork', 'original'] as const) { await page.getByRole('combobox', { name: 'Skin da cidade' }).selectOption(skin); await ready(); await tab('Observatório'); await page.waitForFunction(s => document.querySelector('[data-testid=city-canvas]')?.getAttribute('data-skin') === s, skin); await shot('skin-' + skin); await tab('Perfil'); }
  await tab('Observatório'); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(300);
  const floats = await page.locator('.core-float').count(); await core.click(); await page.waitForTimeout(200); assert.equal(await page.locator('.core-float').count(), floats, 'sem número flutuante em movimento reduzido');
  assert.equal(await page.locator('.game-ticker-line').evaluate(e => getComputedStyle(e).animationName), 'none'); await page.emulateMedia({ reducedMotion: 'no-preference' });
  checks.push('Três skins no mesmo canvas; movimento reduzido sem números flutuantes nem animação do ticker');
  // Compact window: core and store side by side, nothing outside the viewport.
  await dimensions(1040, 760); await shot('compacta'); const coreBox = (await page.locator('.core-panel').boundingBox())!, storeBox = (await page.locator('.store-panel').boundingBox())!;
  assert.ok(coreBox.x + coreBox.width <= storeBox.x || coreBox.y + coreBox.height <= storeBox.y, 'núcleo e loja não se sobrepõem'); assert.ok(storeBox.y + storeBox.height <= 760);
  const sky = (await page.locator('.observatory-sky').boundingBox())!; assert.ok(sky.height >= 90, 'a cidade continua visível entre os painéis');
  for (const flash of await page.getByTestId('flash-light').all()) { const b = (await flash.boundingBox())!; assert.ok(b.y + b.height / 2 >= sky.y && b.y + b.height / 2 <= sky.y + sky.height, 'Lampejo dentro do céu'); }
  await dimensions(1440, 900);
  checks.push('Janela compacta 1040×760: núcleo e loja sem sobreposição');
  // Prestige from the UI (fixture: journey total at the base), permanent upgrade.
  patchState(s => { s.economy.lifetime = '1e12'; }); await tab('Legado'); await page.getByRole('button', { name: 'Revisar novo ciclo', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar neste ciclo', exact: true }).click(); assert.equal((await state()).economy.cycles, 0);
  await page.getByRole('button', { name: 'Revisar novo ciclo', exact: true }).click(); await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'Confirmar novo ciclo', exact: true }).click(); await ready();
  const reborn = await state(); assert.equal(reborn.economy.cycles, 1); assert.equal(reborn.coins, 0); assert.equal(reborn.garden.unlocked, true); assert.equal(reborn.council.seats[0], 'extended-shift');
  await page.getByRole('button', { name: 'Adquirir Ferramentas herdadas', exact: true }).click(); await until(s => s.economy.permanent.includes('legacy-tools'), 'melhoria permanente');
  checks.push('Prestígio pela UI (cancelar e confirmar), Horta/Conselho preservados, melhoria permanente');
  // Sound: muted from Settings, persisted.
  await rail('Abrir configurações'); await page.getByRole('button', { name: 'Aparência', exact: true }).click(); await page.getByRole('button', { name: 'Mudo', exact: true }).click();
  for (let i = 0; i < 100 && !(await page.evaluate(() => window.desktop.getPreferences().then(r => r.ok && r.value.gameVolume === 0))); i++) await page.waitForTimeout(100); await page.getByRole('switch', { name: 'Fundo animado', exact: true }).uncheck();
  checks.push('Som do jogo silenciado em Ajustes e salvo');
  // Close with clicks still pending and an active Focus session: both are kept.
  await rail('Entrar na cidade'); await tab('Observatório'); const focus2 = await page.evaluate(async id => { const prior = await window.desktop.getFocus({ subjectId: id }); if (prior.ok && prior.value.session?.state === 'paused') return window.desktop.actFocus({ subjectId: id, id: prior.value.session.id, action: 'resume' }); return window.desktop.startFocus({ subjectId: id, minutes: 25 }); }, subjectId); assert.ok(focus2.ok && focus2.value.session?.state === 'running');
  const clicksBefore = (await state()).engine.clicks; for (let i = 0; i < 6; i++) await core.click();
  const closed = new Promise<void>(resolve => app.once('close', () => resolve())); await page.getByRole('button', { name: 'Fechar janela', exact: true }).click(); await closed;
  app = await launch(); page = await app.firstWindow(); listen(); await page.getByTestId('version').waitFor();
  const after = await state(); assert.equal(after.engine.clicks, clicksBefore + 6, 'cliques pendentes enviados antes de fechar'); assert.equal(after.economy.cycles, 1); assert.equal(after.skin, 'original');
  const retained = await page.evaluate(async id => ({ focus: await window.desktop.getFocus({ subjectId: id }), prefs: await window.desktop.getPreferences() }), subjectId); assert.ok(retained.focus.ok && retained.prefs.ok);
  assert.equal(retained.focus.value.session?.state, 'paused'); assert.equal(retained.prefs.value.gameVolume, 0); assert.equal(retained.prefs.value.editorialBackground, false);
  for (const original of originals) assert.deepEqual(fs.readFileSync(original.file), original.bytes);
  checks.push('Fechar/reabrir: cliques pendentes gravados, Foco pausado, preferências e Markdown intactos');
  await app.close();
  // Rules v2 profile (identified fixture) converted by the packaged app, with the backup file.
  const legacy = prepareFixture('idle-game-v2'), legacyData = path.join(legacy.dir, 'data'), at = Date.now();
  { const store = new Store(legacyData); store.db.prepare('INSERT INTO game_player(id,coins,xp,state) VALUES(1,?,?,?)').run('4000', 340, JSON.stringify({ skin: 'cyberpunk', atmosphere: 'night', owned: ['windmill', 'fountain'], build: { focus: 2, review: 0, planning: 0, practice: 0 }, gatheredAt: at, passiveAt: at, passiveCarry: 0, roundId: null, inventory: { wheat: 3, carrot: 1, stone: 20, wood: 15 }, plots: [1, 2, 3, 4].map(id => ({ id, crop: null, plantedAt: 0, readyAt: 0 })), engine: { level: 6, clicks: 420, lastClickAt: at }, challengeId: null, farm: { built: ['depot'], target: 'forest-post', stations: { 'forest-post': { stock: 0, carryMs: 0, settledAt: at }, 'mine-post': { stock: 0, carryMs: 0, settledAt: at } } }, economy: { version: 2, producers: { collectors: 30, workshops: 5 }, upgrades: ['collectors-1'], achievements: ['units-collectors-1'], lifetime: 50000, cycleEarned: 50000, prestige: 0, tokens: 0, cycles: 0, permanent: [], harvested: 0, gathered: 0, challenges: 0, perfect: 0, rounds: 0, focusMinutes: 0, reviews: 0, studyDays: 0, events: 0, combos: 0, memoryPerfect: 0, study: { focus: {}, reviewCursor: 0, baselineAt: at, lastDay: '', streak: 0, dayMinutes: 0, dayReviews: 0, builds: [] }, signals: [{ id: randomUUID(), type: 'cache', foundAt: at }], activeEvents: [], nextSignalAt: at, eventSerial: 1, unlocks: ['collectors', 'workshops'], motorDay: '2026-10-22', motorEarned: 10 } })); store.close(); }
  app = await launch(legacyData); page = await app.firstWindow(); listen(); await page.getByRole('textbox', { name: 'Título da nota', exact: true }).waitFor(); await dimensions(1440, 900);
  await rail('Entrar na cidade'); await page.locator('.game-shell[data-area-ready=true]').waitFor();
  const converted = await state(); assert.equal(converted.economy.version, 3); assert.equal(converted.economy.producers.collectors, 30); assert.equal(converted.skin, 'cyberpunk'); assert.ok(converted.economy.upgrades.includes('pulse-2'));
  assert.ok(fs.readdirSync(path.join(legacyData, 'backups')).some(n => n.startsWith('antes-regras-jogo-v3-') && n.endsWith('.sqlite')), 'backup em arquivo antes de converter');
  await shot('perfil-v2-convertido');
  checks.push('Perfil das regras 2 convertido pelo app empacotado, com backup .sqlite e progresso preservado');
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ platform: process.platform, packaged: true, checks, errors }, null, 2)); console.log(checks.join('\n'));
} catch (error) { try { await shot('failure'); } catch { /* window may be gone */ } fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ checks, errors, error: String(error) }, null, 2)); throw error; } finally { await app.close().catch(() => {}); }
