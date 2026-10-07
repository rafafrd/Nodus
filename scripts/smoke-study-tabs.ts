import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
import { Projects } from '../src/main/projects';
import type { WorkspaceTabs } from '../src/shared/workspace';

// Named, isolated fixtures use the real vault, SQLite, renderer and validated IPC.
const fixture = prepareFixture('study-tabs'), data = path.join(fixture.dir, 'data');
const store = new Store(data), vault = new Vault(store);
const saved = vault.save({ id: fixture.noteA.ref.id, hash: fixture.noteA.hash, text: fixture.noteA.text.split('# Nota A')[0] + '# Nota A\n\n## Transformações lineares\n\nUma transformação preserva a soma de vetores e a multiplicação por um escalar. A matriz registra como cada vetor da base se transforma.\n\n### Antes de calcular\n\n- Identifique a base do espaço.\n- Aplique a transformação aos vetores da base.\n- Organize as imagens nas colunas da matriz.\n\n> A geometria dá sentido à conta.\n\n| Conceito | Leitura |\n| --- | --- |\n| Vetor | Direção e comprimento |\n| Matriz | Representação da transformação |\n| Determinante | Mudança de área |\n\n### Próxima investigação\n\nConecte esta nota a Matrizes e explore os exemplos do PDF.\n' });
assert.equal(saved.state, 'saved'); if (saved.state === 'saved') fixture.noteA = saved.document;
for (const title of ['Matrizes', 'Geometria', 'Vetores', 'Determinantes']) vault.create({ subjectId: fixture.a.id, title });
const projectRoot = path.join(fixture.dir, 'Projeto de estudo'); fs.mkdirSync(projectRoot);
const projectFile = path.join(projectRoot, 'README.md'); fs.writeFileSync(projectFile, '# Projeto de estudo\n\nFonte da fixture.\n');
new Projects(store).chooseRoot(projectRoot); const projectId = new Projects(store).catalog().projects[0].id;
store.close();
const originals = [path.join(fixture.root, fixture.noteA.ref.path), path.join(fixture.root, fixture.noteB.ref.path), fixture.pdfA, fixture.pdfB, projectFile].map(file => ({ file, bytes: fs.readFileSync(file) }));
fs.mkdirSync('.local/evidence', { recursive: true });
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
async function launch() { return electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${data}`], env }); }
let app = await launch(), page = await app.firstWindow(); const errors: string[] = [], checks: string[] = [], screenshots: string[] = [];
function listen() { page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message)); }
listen();
async function idle() { await page.locator('.activity-rail[aria-busy=false]').waitFor(); await page.locator('.area-stage[data-motion=idle]').waitFor(); }
async function prefs(): Promise<WorkspaceTabs> { const result = await page.evaluate(() => window.desktop.getPreferences()); assert.ok(result.ok); return result.value.workspaceTabs; }
async function shot(name: string) { const file = `.local/evidence/study-tabs-${name}.png`; await page.screenshot({ path: file }); screenshots.push(file); console.log(`CAPTURE ${name}`); }
async function add(name: string) { await page.getByRole('button', { name: `Dividir com ${name}`, exact: true }).focus(); await page.keyboard.press('Enter'); await idle(); }
async function single(name: string) { await page.getByRole('button', { name, exact: true }).click(); await idle(); }
async function drag(name: string, capture?: string) {
  const source = await page.getByRole('button', { name, exact: true }).boundingBox(), target = await page.locator('.workspace-body').boundingBox(); assert.ok(source && target);
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2); await page.mouse.down();
  await page.mouse.move(source.x + source.width / 2 + 12, source.y + source.height / 2, { steps: 3 });
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
  await page.locator('.workspace-drop-preview').waitFor(); if (capture) await shot(capture);
  const nativeVisible = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].contentView.children.some(view => 'webContents' in view && (view as any).webContents.getURL().startsWith('https://www.youtube-nocookie.com/embed/') && view.getVisible()));
  assert.equal(nativeVisible, false, 'View nativa não intercepta a prévia de arraste');
  await page.mouse.up(); await page.locator('.workspace-drop-preview').waitFor({ state: 'hidden' }); await idle();
}
async function bounds() {
  return page.locator('.area-layer[aria-hidden=false]').evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { area: (element as HTMLElement).dataset.area, x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }; }));
}
async function closeWindow() { const closed = new Promise<void>(resolve => app.once('close', () => resolve())); await page.getByRole('button', { name: 'Fechar janela', exact: true }).click(); await closed; }
try {
  await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor(); await idle();
  assert.equal(await page.getByRole('combobox', { name: /^Módulo / }).count(), 0); assert.equal(await page.locator('.workspace-add').count(), 0);
  assert.equal(await page.locator('.rail-module>button[draggable=true]').count(), 9);
  assert.equal(await page.getByRole('tab').count(), 1); assert.equal((await prefs()).tabs[0].panes.length, 1);
  await page.getByRole('button', { name: 'Leitura', exact: true }).click(); await shot('single');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Conteúdo da nota', exact: true }); await editor.click(); await editor.press('Control+End'); await page.keyboard.insertText('\nRascunho entre abas preservado.');
  await drag('Abrir PDF', 'drag-preview'); await page.locator('canvas[data-rendered-page="2"]').waitFor();
  await add('Vídeo');
  await page.getByRole('button', { name: 'Salvar link do YouTube', exact: true }).click();
  await page.getByRole('textbox', { name: 'Link do YouTube', exact: true }).fill('https://www.youtube.com/watch?v=M7lc1UVf-VE');
  await page.getByRole('textbox', { name: 'Título do vídeo', exact: true }).fill('Aula de demonstração · YouTube');
  await page.getByRole('button', { name: 'Salvar link', exact: true }).click(); await page.getByRole('button', { name: 'Abrir player', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Leitura', exact: true }).click();
  let geometry = await bounds(); const left = geometry.find(item => item.area === 'study')!, top = geometry.find(item => item.area === 'pdf')!, bottom = geometry.find(item => item.area === 'video')!;
  assert.ok(left.height > top.height * 1.9 && Math.abs(top.x - bottom.x) < 1 && bottom.y > top.y); await shot('three');
  checks.push('Nove subitens laterais, nenhum seletor no topo; arraste real com prévia e teclado adicionam janelas; três painéis com esquerda inteira.');
  await drag('Abrir grafo'); await page.getByTestId('graph-canvas').waitFor(); await shot('four');
  assert.equal((await prefs()).tabs[0].panes.length, 4); assert.equal(await page.getByRole('button', { name: 'Dividir com Hoje', exact: true }).isDisabled(), true);
  await drag('Abrir Hoje', 'limit'); assert.equal((await prefs()).tabs[0].panes.length, 4);
  await drag('Abrir PDF'); assert.equal((await prefs()).tabs[0].focused, 'pdf'); assert.equal((await prefs()).tabs[0].panes.length, 4);
  const column = page.getByRole('separator', { name: 'Largura das colunas', exact: true }); await column.focus(); await column.press('Shift+ArrowRight');
  const row = page.getByRole('separator', { name: 'Altura das linhas', exact: true }), rb = await row.boundingBox(); assert.ok(rb);
  await page.mouse.move(rb.x + rb.width * .8, rb.y + 4); await page.mouse.down(); await page.mouse.move(rb.x + rb.width * .8, rb.y + 36, { steps: 8 }); await page.mouse.up();
  await page.waitForFunction(async () => { const r = await window.desktop.getPreferences(); return r.ok && r.value.workspaceTabs.tabs[0].columnSplit > 50 && r.value.workspaceTabs.tabs[0].rowSplit > 50; });
  const firstId = (await prefs()).activeTabId; const splitTab = (await prefs()).tabs[0]; await shot('resized');
  await page.setViewportSize({ width: 1040, height: 760 }); await idle();
  geometry = await bounds(); assert.equal(geometry.length, 4); for (const pane of geometry) assert.ok(pane.width > 250 && pane.height > 240 && pane.right <= 1040 && pane.bottom <= 760);
  const graphAction = await page.getByRole('button', { name: 'Mostrar notas e relações', exact: true }).boundingBox(); const graphPane = geometry.find(pane => pane.area === 'graph')!; assert.ok(graphAction && graphAction.x >= graphPane.x && graphAction.x + graphAction.width <= graphPane.right + 1);
  await shot('compact'); await page.setViewportSize({ width: 1440, height: 940 });
  await page.keyboard.press('Control+t'); await idle(); assert.equal(await page.getByRole('tab').count(), 2);
  await single('Abrir Hoje'); const secondId = (await prefs()).activeTabId;
  await page.keyboard.press('Control+1'); await idle(); assert.equal((await prefs()).activeTabId, firstId); assert.deepEqual((await prefs()).tabs[0], splitTab);
  await page.keyboard.press('Control+Tab'); await idle(); assert.equal((await prefs()).activeTabId, secondId);
  await page.getByRole('tab', { selected: true }).press('ArrowLeft'); await idle(); assert.equal((await prefs()).activeTabId, firstId);
  await page.getByRole('button', { name: 'Fechar janela Grafo', exact: true }).click(); await idle(); assert.equal((await prefs()).tabs[0].panes.length, 3);
  await add('Grafo'); await single('Abrir revisões');
  assert.deepEqual((await prefs()).tabs[0].panes, ['review']); assert.deepEqual((await prefs()).tabs[1].panes, ['home']);
  await page.getByRole('button', { name: 'Voltar aos estudos', exact: true }).click(); await idle(); await add('PDF'); await add('Vídeo');
  await page.getByRole('button', { name: 'Ampliar PDF', exact: true }).click(); await idle(); assert.deepEqual((await prefs()).tabs[0].panes, ['pdf']);
  await single('Voltar aos estudos'); await add('PDF'); await add('Vídeo'); await page.keyboard.press('Control+t'); await idle(); await single('Abrir grafo');
  await page.keyboard.press('Control+w'); await idle(); assert.equal(await page.getByRole('tab').count(), 2);
  await page.keyboard.press('Control+1'); await idle(); await add('Grafo');
  await page.waitForFunction(() => { const pane = document.querySelector('[data-area=graph]')!.getBoundingClientRect(), controls = document.querySelector('.clean-graph>header>div')!.getBoundingClientRect(), canvas = document.querySelector('.graph-canvas-host')!.getBoundingClientRect(); return controls.right <= pane.right && canvas.right <= pane.right; });
  await page.waitForTimeout(150); await shot('tabs');
  checks.push('Grade 2×2, limite de quatro e foco sem duplicação; divisores por mouse/setas; viewport 1040×760; abas por clique/setas/Ctrl+T/W/Tab/1 e isolamento da composição.');
  // The Electron player continues to be a single isolated guest across workspace tabs.
  if (!process.argv.includes('--no-network')) {
    await page.getByRole('button', { name: 'Ampliar Vídeo', exact: true }).click(); await idle();
    await page.getByRole('button', { name: 'Abrir player', exact: true }).click(); await page.locator('.video-loading').waitFor({ state: 'hidden', timeout: 45000 });
    const guest = await app.evaluate(({ webContents }) => webContents.getAllWebContents().find(w => w.getURL().startsWith('https://www.youtube-nocookie.com/embed/'))?.id); assert.ok(guest);
    await page.waitForFunction(() => document.querySelector('.video-surface')?.getAttribute('data-mode') === 'inline');
    const playerLeft=await page.locator('.video-surface').evaluate(el=>el.getBoundingClientRect().left);
    await page.getByRole('button',{name:'Recolher menu lateral',exact:true}).click();
    await page.locator('.nodus-shell[data-sidebar-collapsed=true]').waitFor();
    await page.waitForFunction(left=>document.querySelector('.video-surface')!.getBoundingClientRect().left<left-70,playerLeft);
    assert.equal(await app.evaluate(({webContents},id)=>webContents.fromId(id)?.id,guest),guest);
    await page.getByRole('button',{name:'Expandir menu lateral',exact:true}).click();
    await page.locator('.nodus-shell[data-sidebar-collapsed=false]').waitFor();
    await page.waitForFunction(left=>Math.abs(document.querySelector('.video-surface')!.getBoundingClientRect().left-left)<2,playerLeft);
    await add('PDF');
    const divider = await page.getByRole('separator', { name: 'Largura das colunas', exact: true }).boundingBox(); assert.ok(divider);
    await page.mouse.move(divider.x + 4, divider.y + divider.height * .7); await page.mouse.down(); await page.locator('.workspace-frame[data-resizing=true]').waitFor();
    await page.waitForFunction(() => !!document.querySelector('.workspace-frame[data-resizing=true]'));
    await page.waitForTimeout(120);
    assert.equal(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].contentView.children.some(view => 'webContents' in view && (view as any).webContents.getURL().startsWith('https://www.youtube-nocookie.com/embed/') && view.getVisible())), false);
    await page.mouse.move(divider.x + 20, divider.y + divider.height * .7, { steps: 4 }); await page.mouse.up();
    await drag('Voltar aos estudos', 'player-drag');
    assert.equal(await app.evaluate(({ webContents }, id) => webContents.fromId(id)?.id, guest), guest);
    await page.keyboard.press('Control+2'); await idle(); await page.locator('.video-surface[data-mode=pip]').waitFor();
    const continued = await app.evaluate(({ webContents }, id) => webContents.fromId(id)?.id, guest); assert.equal(continued, guest);
    await page.getByRole('button', { name: 'Fechar player', exact: true }).click();
    await page.keyboard.press('Control+1'); await idle(); await single('Voltar aos estudos'); await add('PDF'); await add('Vídeo'); await add('Grafo');
    checks.push('Player oficial real carrega inline, não intercepta drag/resize e conserva o mesmo WebContents ao trocar de aba/PiP.');
  }
  // Drafts in Explorer and notes survive hiding their area and process restart.
  await page.keyboard.press('Control+2'); await idle(); await single('Abrir Explorer');
  await page.getByRole('button', { name: 'Explorar Projeto de estudo', exact: true }).click(); await page.getByRole('button', { name: 'Arquivo README.md', exact: true }).click();
  const projectEditor = page.getByRole('textbox', { name: 'Conteúdo do arquivo', exact: true }); await projectEditor.click(); await projectEditor.press('Control+End'); await page.keyboard.insertText('\nRascunho do projeto entre abas.');
  await page.keyboard.press('Control+1'); await idle();
  await page.getByRole('button', { name: 'Abrir foco', exact: true }).click(); await page.getByRole('button', { name: 'Iniciar foco', exact: true }).click(); await page.getByRole('button', { name: 'Pausar foco', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Fechar painel suspenso', exact: true }).click(); await page.mouse.move(90,90);
  const beforeClose = await prefs(); await closeWindow(); app = await launch(); page = await app.firstWindow(); listen(); await page.getByTestId('version').waitFor(); await idle();
  assert.deepEqual(await prefs(), beforeClose); await page.locator('canvas[data-rendered-page="2"]').waitFor();
  const draft = await page.evaluate(id => window.desktop.openNote({ id }), fixture.noteA.ref.id); assert.ok(draft.ok && draft.value.draft?.text.includes('Rascunho entre abas preservado.'));
  const projectDraft = await page.evaluate(ref => window.desktop.openProjectFile(ref), { projectId, path: 'README.md' }); assert.ok(projectDraft.ok && projectDraft.value.draft?.text.includes('Rascunho do projeto entre abas.'));
  const focus = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), fixture.a.id); assert.ok(focus.ok && focus.value.session?.state === 'paused' && !focus.value.session.recovered);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.keyboard.press('Control+2'); await idle(); await page.keyboard.press('Control+1'); await idle(); assert.equal(await page.locator('.area-stage').getAttribute('data-motion'), 'idle'); await shot('restart');
  for (const source of originals) assert.deepEqual(fs.readFileSync(source.file), source.bytes); assert.deepEqual(errors, []);
  checks.push('Reinício conserva abas/divisores/foco, PDF2, rascunhos de nota/projeto e foco pausado; todas as fontes intactas; movimento reduzido; nenhum pageerror.');
  fs.writeFileSync('.local/evidence/study-tabs-results.json', JSON.stringify({ date: new Date().toISOString(), fixture: fixture.dir, checks, beforeClose, geometry, screenshots, errors }, null, 2)); console.log(checks.join('\n'));
} catch (error) { await shot('failure').catch(() => {}); fs.writeFileSync('.local/evidence/study-tabs-failure.txt', String(error)); throw error; }
finally { await app.close().catch(() => {}); }
