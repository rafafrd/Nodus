import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron, type Page } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Projects } from '../src/main/projects';
const f = prepareFixture('engine-explorer'), data = path.join(f.dir, 'data'), root = path.join(f.dir, 'atelier-demo'), other = path.join(f.dir, 'caderno-demo');
fs.mkdirSync(path.join(root, 'src'), { recursive: true }); fs.mkdirSync(other);
const source = '\uFEFF// Fixture fictícia — nenhum projeto pessoal\r\nexport const valor = 1;\r\n';
const file = path.join(root, 'src/main.ts'); fs.writeFileSync(file, source); fs.writeFileSync(path.join(other, 'README.md'), '# Projeto demonstrativo\n\nSegundo projeto local.\n');
const setup = new Store(data), projects = new Projects(setup); projects.chooseRoot(root); projects.chooseRoot(other); const id = projects.catalog().projects[0].id; setup.close();
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const reports: string[] = []; const ref = { projectId: id, path: 'src/main.ts' }; let retained = '';
async function game(p: Page) { const r = await p.evaluate(() => window.desktop.getGame()); if (!r.ok) throw Error(r.message); return r.value; }
async function ready(p: Page) { await p.locator('.game-shell[aria-busy="false"]').waitFor(); }
async function shot(p: Page, name: string) { await p.screenshot({ path: `.local/evidence/engine-explorer-${name}.png` }); }
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${data}`], env }); const p = await app.firstWindow(); const errors: string[] = []; p.on('pageerror', e => errors.push(e.message));
  try {
    await p.getByRole('heading', { name: 'Nota A', exact: true, level: 2 }).waitFor();
    await p.getByRole('button', { name: 'Abrir Explorer', exact: true }).click(); await p.getByRole('button', { name: 'Projeto atelier-demo', exact: true }).waitFor();
    if (!pass) {
      await p.getByRole('button', { name: 'Projeto atelier-demo', exact: true }).click(); await p.getByRole('button', { name: 'Pasta src', exact: true }).click(); await p.getByRole('button', { name: 'Arquivo src/main.ts', exact: true }).click();
      const editor = p.getByRole('textbox', { name: 'Conteúdo do arquivo', exact: true }); await editor.click(); await editor.press('Control+Home'); await editor.press('ArrowDown'); await editor.press('End'); await editor.press('ArrowLeft'); await editor.press('Backspace'); await p.keyboard.insertText('2'); await editor.press('Control+s');
      await p.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor(); assert.equal(fs.readFileSync(file, 'utf8'), source.replace('= 1;', '= 2;'));
      await editor.press('Control+End'); await p.keyboard.insertText('// Edição local');
      const external = fs.readFileSync(file, 'utf8') + '// Edição externa\r\n'; fs.writeFileSync(file, external);
      await p.getByText('Arquivo alterado fora do app', { exact: true }).waitFor(); await p.getByText('Ver versão externa', { exact: true }).click(); assert.equal(await p.locator('.conflict-box pre').textContent(), external); await shot(p, 'conflict');
      await p.getByRole('button', { name: 'Conservar minha edição para revisão', exact: true }).click(); await p.getByRole('button', { name: 'Salvar arquivo', exact: true }).click(); await p.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor(); assert.ok(fs.readFileSync(file, 'utf8').endsWith('// Edição local'));
      await p.getByRole('button', { name: 'Projeto caderno-demo', exact: true }).click(); await p.getByRole('button', { name: 'Arquivo README.md', exact: true }).click(); assert.equal(await p.locator('.project-tabs > div').count(), 2); await shot(p, 'editor');
      await p.getByRole('button', { name: 'Aba src/main.ts', exact: true }).click(); await editor.press('Control+End'); await editor.press('Enter'); await p.keyboard.insertText('// Retomada após fechar');
      const doc = await p.evaluate(r => window.desktop.openProjectFile(r), ref); assert.ok(doc.ok); retained = (doc.ok ? doc.value.text : '') + '\r\n// Retomada após fechar';
      // Close through the native window event immediately after typing, before debounce.
      await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close()); await p.waitForEvent('close'); reports.push('Dois projetos reais, árvore/abas, UTF-8 BOM+CRLF, edição seletiva/Ctrl+S, conflito externo, revisão explícita e fechamento imediato com rascunho aprovados.');
    } else {
      await p.getByRole('button', { name: 'Aba src/main.ts', exact: true }).waitFor(); const d = await p.evaluate(r => window.desktop.openProjectFile(r), ref); assert.ok(d.ok && d.value.draft?.text === retained); await p.getByText('Rascunho recuperado', { exact: false }).first().waitFor();
      await shot(p, 'resumed');
      // Real UI events with no IPC mock/delay: first mutation owns the file decision.
      await p.evaluate(() => { document.querySelector<HTMLButtonElement>('[aria-label="Salvar arquivo"]')!.click(); document.querySelector<HTMLButtonElement>('.draft-banner button')!.click(); });
      await p.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor(); assert.equal(fs.readFileSync(file, 'utf8'), retained);
      let editor = p.getByRole('textbox', { name: 'Conteúdo do arquivo', exact: true }); await editor.press('Control+End'); await editor.press('Enter'); await p.keyboard.insertText('// Edição a descartar');
      await p.getByRole('button', { name: 'Voltar aos estudos', exact: true }).click(); await p.getByRole('button', { name: 'Abrir Explorer', exact: true }).click(); await p.locator('.draft-banner button').waitFor();
      await p.evaluate(() => { document.querySelector<HTMLButtonElement>('.draft-banner button')!.click(); document.querySelector<HTMLButtonElement>('[aria-label="Salvar arquivo"]')!.click(); });
      await p.getByRole('status').filter({ hasText: 'Arquivo atualizado' }).waitFor(); assert.equal(fs.readFileSync(file, 'utf8'), retained); const discarded = await p.evaluate(r => window.desktop.openProjectFile(r), ref); assert.ok(discarded.ok && discarded.value.draft === null);
      const recovery = fs.readdirSync(path.join(data, 'project-recovery')).map(name => fs.readFileSync(path.join(data, 'project-recovery', name), 'utf8')); assert.ok(recovery.some(text => text.includes('Edição a descartar')));
      editor = p.getByRole('textbox', { name: 'Conteúdo do arquivo', exact: true }); await editor.press('Control+End'); await editor.press('Enter'); await p.keyboard.insertText('// Novo rascunho após decisões'); retained += '\r\n// Novo rascunho após decisões';
      reports.push('Save/Usar arquivo em eventos rápidos nos dois sentidos: operação inicial conservada, sem gravação após descarte; rascunho descartado arquivado em recovery e novo buffer preservado. Sem mock/atraso de IPC.');
      await p.getByRole('button', { name: 'Entrar na cidade', exact: true }).click(); await p.locator('canvas[data-ready=true]').waitFor(); await ready(p);
      assert.equal((await game(p)).coins, 60); await p.getByRole('button', { name: 'Gerar Produção', exact: true }).click(); await ready(p); assert.equal((await game(p)).coins, 61);
      await p.getByRole('button', { name: 'Melhorar motor', exact: true }).click(); await ready(p); assert.equal((await game(p)).engine.level, 1); assert.equal((await game(p)).coins, 36);
      await p.waitForTimeout(310); await p.getByRole('button', { name: 'Gerar Produção', exact: true }).click(); await ready(p); assert.equal((await game(p)).coins, 39); await shot(p, 'engine');
      await p.getByRole('button', { name: 'Oficina', exact: true }).click(); await p.getByRole('button', { name: /Sincronizar o motor/ }).click();
      for (let i = 0; i < 36; i++) { await ready(p); await p.getByTestId('qte-key').waitFor(); const key = await p.getByTestId('qte-key').textContent(); await p.keyboard.press(key!); await p.waitForFunction(async stage=>{const r=await window.desktop.getGame();return r.ok&&r.value.challenge?.stage===stage;},i+1); }
      await ready(p); assert.equal((await game(p)).challenge?.coins, 240); await shot(p, 'qte');
      await p.getByRole('button', { name: /Calibrar a válvula/ }).click();
      for (let i = 0; i < 36; i++) { await ready(p); await p.getByTestId('skill-track').waitFor(); await p.waitForFunction(() => { const e = document.querySelector<HTMLElement>('[data-testid=skill-track]'); return e && Math.abs(Number(e.dataset.position) - Number(e.dataset.target)) < 3; }); await p.getByRole('button', { name: 'Calibrar válvula', exact: true }).click(); await p.waitForFunction(async stage=>{const r=await window.desktop.getGame();return r.ok&&r.value.challenge?.stage===stage;},i+1); }
      await ready(p); const s = await game(p); assert.equal(s.challenge?.hits, 36); assert.equal(s.challenge?.coins, 300); await shot(p, 'skillcheck');
      await p.setViewportSize({ width: 1040, height: 760 }); await p.emulateMedia({ reducedMotion: 'reduce' }); await shot(p, 'compact'); assert.ok(await p.locator('.game-footer').isVisible());
      await p.getByRole('button', { name: 'Abrir Explorer', exact: true }).click(); await p.getByRole('button', { name: 'Aba src/main.ts', exact: true }).waitFor(); const restored = await p.evaluate(r => window.desktop.openProjectFile(r), ref); assert.ok(restored.ok && restored.value.draft?.text === retained);
      await p.getByRole('button', { name: 'Voltar aos estudos', exact: true }).click(); await p.getByRole('heading', { name: 'Nota A', exact: true, level: 2 }).waitFor(); await p.locator('canvas[data-rendered-page="2"]').waitFor(); await shot(p, 'study-return');
      reports.push('Reabertura/rascunho e troca de vistas aprovadas. Motor 1→3 moedas por pulso/upgrade25; QTE real teclado36/36 +240/60; skillcheck real timing36/36 +300/60; viewport1040×760 e reduced-motion; mesa/PDF retornam.');
    }
    assert.deepEqual(errors, []);
  } catch (e) { if (!p.isClosed()) await shot(p, 'failure').catch(() => {}); throw e; } finally { await app.close().catch(() => {}); }
}
fs.writeFileSync('.local/evidence/engine-explorer-results.json', JSON.stringify({ date: '2026-10-03', packaged: true, fixture: f.dir, reports, nativeFolderDialog: 'não automatizado; raízes registradas via serviço real na fixture', externalEditor: 'não verificado' }, null, 2)); console.log(reports.join('\n'));
