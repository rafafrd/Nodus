import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron, type Page } from 'playwright';
import { prepareFixture,noteTitle } from './test-fixture';
import { Store } from '../src/main/store';
import { Projects } from '../src/main/projects';
import { UserPreferences } from '../src/main/preferences';
const fixture = prepareFixture('smooth-ui'), data = path.join(fixture.dir, 'data'), root = path.join(fixture.dir, 'atelier-demo');
fs.mkdirSync(path.join(root, 'src'), { recursive: true });
const source = '\uFEFF// Projeto fictício de validação\r\nexport const valor = 1;\r\n';
const file = path.join(root, 'src/main.ts'); fs.writeFileSync(file, source);
fs.writeFileSync(path.join(root, 'config.json'), '{"name":"fixture","enabled":true}\n');
const store = new Store(data), projects = new Projects(store); const catalog = projects.chooseRoot(root); const projectId = catalog.view.projectId!;
// Editorial (the default theme) shows Explorer code in one ink by design; syntax colors are checked in Oliva.
new UserPreferences(store).update({ theme: 'olive' }); store.close();
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const packaged = process.argv.includes('--packaged');
const app = await electron.launch({ executablePath: path.resolve(packaged ? 'release/win-unpacked/App Estudos.exe' : 'node_modules/electron/dist/electron.exe'), args: [...(packaged ? [] : ['.']), `--user-data-dir=${data}`], env, recordVideo: { dir: path.join(fixture.dir, 'video'), size: { width: 1424, height: 900 } } });
const page = await app.firstWindow(), errors: string[] = [], reports: string[] = []; page.on('pageerror', e => errors.push(e.message));
const shot = (name: string) => page.screenshot({ path: `.local/evidence/smooth-ui-${name}.png` });
async function settled(area: string) { await page.waitForFunction(area => document.querySelector('[data-testid=area-stage]')?.getAttribute('data-motion') === 'idle' && document.querySelector(`[data-area="${area}"]`)?.getAttribute('aria-hidden') === 'false', area); }
async function game() { const r = await page.evaluate(() => window.desktop.getGame()); if (!r.ok) throw Error(r.message); return r.value; }
try {
  await noteTitle(page,'Nota A'); await settled('study');
  await shot('study');
  await page.getByRole('button', {name:'Nova matéria',exact:true}).click(); await page.getByRole('dialog',{name:'Nova matéria',exact:true}).waitFor(); await page.getByRole('textbox',{name:'Nome da matéria'}).fill('Somente prévia de diálogo'); await page.waitForTimeout(280); await shot('dialog'); await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({state:'hidden'});
  // UI-04 replaced the desk grid with workspace panes: adding one keeps the editor DOM (area motion itself is in smoke-motion).
  await page.locator('.note-panel .cm-content').evaluate(el => el.setAttribute('data-preserved-editor','fixture'));
  await page.getByRole('button',{name:'Dividir com PDFs',exact:true}).click(); await settled('pdf'); await page.locator('canvas[data-rendered-page="2"]').waitFor();
  assert.equal(await page.locator('[data-preserved-editor=fixture]').count(),1);
  await page.getByRole('button',{name:'Leitura',exact:true}).click(); await page.getByRole('article',{name:'Prévia da nota'}).waitFor(); await page.waitForTimeout(360); await shot('reading'); await page.getByRole('button',{name:'Editar',exact:true}).click();
  await page.getByRole('button',{name:'Abrir foco',exact:true}).click(); await page.getByRole('button',{name:'Iniciar foco',exact:true}).click(); await page.getByRole('button',{name:'Fechar painel suspenso',exact:true}).click();
  await page.getByRole('button', { name: 'Abrir Explorer', exact: true }).click(); await settled('explorer');
  const focusInExplorer=await page.evaluate(subjectId=>window.desktop.getFocus({subjectId}),fixture.a.id); assert.ok(focusInExplorer.ok && focusInExplorer.value.session?.state==='running');
  await page.getByRole('button',{name:'Voltar aos estudos',exact:true}).click(); await settled('study');
  await page.getByRole('button', { name: 'Abrir Explorer', exact: true }).click(); await settled('explorer');
  await page.getByRole('button', { name: 'Projeto atelier-demo', exact: true }).click(); await page.getByRole('button', { name: 'Pasta src', exact: true }).click(); await page.getByRole('button', { name: 'Arquivo src/main.ts', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Conteúdo do arquivo', exact: true }); await editor.click(); await editor.press('Control+End'); await editor.press('Enter'); await page.keyboard.insertText('// Rascunho real entre áreas');
  const retained = source + '\r\n// Rascunho real entre áreas';
  const separator = page.getByRole('separator', { name: 'Largura do Explorer' }); await separator.focus(); await separator.press('ArrowRight'); assert.equal(await separator.getAttribute('aria-valuenow'), '270');
  await separator.press('Home'); assert.equal(await separator.getAttribute('aria-valuenow'), '190'); await separator.press('End'); assert.equal(await separator.getAttribute('aria-valuenow'), '400'); await separator.press('Home'); await separator.press('ArrowRight');
  const handle=await separator.boundingBox(); assert.ok(handle); const start=Number(await separator.getAttribute('aria-valuenow')); await page.mouse.move(handle.x+handle.width/2,handle.y+40); await page.mouse.down(); await page.mouse.move(handle.x+handle.width/2+120,handle.y+40,{steps:8}); await page.mouse.up(); const dragged=Number(await separator.getAttribute('aria-valuenow')); assert.ok(Math.abs(dragged-start-120)<=4,'arraste '+start+'->'+dragged);
  await page.getByRole('button', { name: 'Abrir pasta src na árvore' }).click(); assert.ok(await page.getByRole('button', { name: 'Arquivo src/main.ts' }).isVisible());
  const highlighted = await editor.locator('span').evaluateAll(nodes => [...new Set(nodes.map(n => getComputedStyle(n).color))]); assert.ok(highlighted.length > 2, 'sintaxe precisa ter cores distintas: ' + highlighted.join(' | ')); await shot('explorer');
  const canvasBefore = await page.locator('[data-area=city] canvas').count(); assert.equal(canvasBefore, 0);
  await page.getByRole('button', { name: 'Entrar na cidade', exact: true }).click(); await settled('city'); await page.locator('canvas[data-testid=city-canvas][data-ready=true]').waitFor();
  const draft = await page.evaluate(ref => window.desktop.openProjectFile(ref), { projectId, path: 'src/main.ts' }); assert.ok(draft.ok && draft.value.draft?.text === retained);
  await page.locator('canvas[data-testid=city-canvas][data-ready=true]').evaluate(el => el.setAttribute('data-preserved-canvas', 'fixture'));
  // Sample the wallet every frame from before the click: the tween can end before a polled read.
  await page.evaluate(`(() => { const s = []; window.__wallet = s; const t0 = performance.now(); const tick = () => { s.push(document.querySelector('[data-testid=game-coins]')?.textContent ?? ''); if (performance.now() - t0 < 2000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); })()`);
  const before = await game(); await page.getByRole('button', { name: 'Comprar 1 Coletores', exact: true }).click(); await page.locator('.game-shell[aria-busy=false]').waitFor(); const bought = await game(); assert.equal(bought.economy.producers.collectors, 1); assert.ok(Number(bought.coins) < Number(before.coins)); assert.match(await page.locator('.game-notice').textContent() ?? '', /^Coletores ×1/);
  await page.waitForTimeout(2100); const walletFrames = (await page.evaluate(() => (window as never as { __wallet: string[] }).__wallet)).map(v => Number(v.replaceAll('.','').replace(',','.'))); assert.ok(walletFrames.some(v=>v>Number(bought.coins)&&v<Number(before.coins)),'carteira deve pintar valores intermediários: '+walletFrames.join(',')); await page.waitForFunction(() => { const wallet=document.querySelector('[data-testid=game-coins]'); return wallet?.textContent === Number(wallet?.getAttribute('data-value')).toLocaleString('pt-BR'); }); await page.waitForTimeout(700); await shot('city');
  const focusInCity=await page.evaluate(subjectId=>window.desktop.getFocus({subjectId}),fixture.a.id); assert.ok(focusInCity.ok && focusInCity.value.session?.state==='paused');
  // Inspect real rendered camera values throughout a tween; no synthetic clock.
  await page.getByRole('button', { name: 'Visitar moinho', exact: true }).dispatchEvent('click');
  const camera: { x: number; z: number; moving: string | undefined }[] = [];
  for (let i = 0; i < 12; i++) { camera.push(await page.locator('canvas[data-testid=city-canvas][data-ready=true]').evaluate(el => { const d = (el as HTMLElement).dataset; return { x: Number(d.targetX), z: Number(d.targetZ), moving: d.camera }; })); await page.waitForTimeout(60); }
  assert.ok(camera.some(v => v.moving === 'moving')); assert.ok(new Set(camera.map(v => v.z)).size > 5, 'câmera deve renderizar posições intermediárias');
  await page.getByRole('button', { name: 'Visitar mina', exact: true }).dispatchEvent('click'); await page.waitForTimeout(100); await page.getByRole('button', { name: 'Visitar núcleo', exact: true }).dispatchEvent('click'); await page.waitForFunction(() => document.querySelector('canvas[data-testid=city-canvas][data-ready=true]')?.getAttribute('data-camera') === 'idle');
  assert.ok(Math.abs(await page.locator('canvas[data-testid=city-canvas][data-ready=true]').evaluate(el => Number((el as HTMLElement).dataset.targetX)) - 1.74) < .01);
  await shot('camera');
  await page.getByRole('button', {name:'Visitar bosque',exact:true}).dispatchEvent('click'); await page.waitForTimeout(130); await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(70); const stopped=await page.locator('canvas[data-testid=city-canvas][data-ready=true]').evaluate(el=>({x:el.getAttribute('data-target-x'),z:el.getAttribute('data-target-z')})); await page.waitForTimeout(140); assert.deepEqual(await page.locator('canvas[data-testid=city-canvas][data-ready=true]').evaluate(el=>({x:el.getAttribute('data-target-x'),z:el.getAttribute('data-target-z')})),stopped); await page.emulateMedia({reducedMotion:'no-preference'});
  // Interrupt an area transition from the persistent rail, including return to its origin.
  await page.getByRole('button', { name: 'Abrir Explorer', exact: true }).click(); await page.waitForTimeout(90); await page.getByRole('button', { name: 'Voltar aos estudos', exact: true }).click(); await page.waitForTimeout(90); await page.getByRole('button', { name: 'Entrar na cidade', exact: true }).click(); await settled('city');
  assert.equal(await page.locator('canvas[data-preserved-canvas=fixture]').count(), 1);
  const layers = await page.locator('.area-layer').evaluateAll(nodes => nodes.map(el => ({ area: (el as HTMLElement).dataset.area, inert: (el as HTMLElement).inert, opacity: Number(getComputedStyle(el).opacity), hidden: el.getAttribute('aria-hidden') })));
  assert.deepEqual(layers.filter(v => !v.inert).map(v => v.area), ['city']); assert.ok(layers.every(v => v.area === 'city' ? v.opacity === 1 : v.opacity === 0));
  await page.getByRole('button', { name: 'Abrir Explorer', exact: true }).click(); await page.waitForTimeout(80); await page.keyboard.press('Control+s'); await page.waitForFunction(() => document.querySelector('[data-area=explorer] [role=status]')?.textContent?.includes('Salvo no arquivo')); assert.equal(fs.readFileSync(file,'utf8'),retained); await page.emulateMedia({ reducedMotion: 'reduce' }); await settled('explorer');
  // UI-07 clears the transform at the end (clearProps), so no displacement is left: 'none'.
  assert.equal(await page.locator('.area-layer[data-area=explorer]').evaluate(el => getComputedStyle(el).transform), 'none');
  await editor.press('Control+s'); await page.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor(); assert.equal(fs.readFileSync(file, 'utf8'), retained);
  await page.setViewportSize({ width: 1040, height: 760 }); await shot('compact-explorer');
  await page.getByRole('button', { name: 'Entrar na cidade', exact: true }).click(); await settled('city'); await page.getByRole('button', { name: 'Visitar moinho', exact: true }).dispatchEvent('click'); await page.waitForTimeout(80); assert.equal(await page.locator('canvas[data-testid=city-canvas][data-ready=true]').getAttribute('data-camera'), 'idle'); await shot('compact-city');
  await page.getByRole('button', { name: 'Voltar aos estudos', exact: true }).click(); await settled('study'); await noteTitle(page,'Nota A'); await shot('compact-study');
  reports.push('Diálogo com Escape; nova janela PDF conserva o DOM do editor; foco continua no Explorer e pausa na cidade; Ctrl+S funciona durante a transição sem esperar seu término.');
  reports.push('Rail estável; rascunho real preservado entre áreas; BOM/CRLF e Ctrl+S íntegros; sintaxe colorida, caminho clicável e largura por mouse/teclado 190–400.');
  reports.push('Carteira com valores intermediários reais após compra, até convergir ao saldo confirmado.');
  reports.push('Compra pelo main com aviso do resultado; câmera com posições intermediárias e retarget, canvas conservado entre áreas; cliques rápidos terminam com uma área interativa e sem opacity presa.');
  reports.push('Câmera interrompida por preferência dinâmica permanece parada.');
  reports.push('Movimento reduzido alterado durante transição finaliza estado; câmera reduzida imediata; 1040×760/retorno ao caderno, sem erros de renderer.');
  assert.deepEqual(errors, []);
  fs.writeFileSync('.local/evidence/smooth-ui-results.json', JSON.stringify({ date: new Date().toISOString(), packaged, fixture: fixture.dir, reports, camera, layers, nativeDialog: 'não automatizado' }, null, 2));
} catch (error) { await shot('failure').catch(() => {}); throw error; }
finally { const video = page.video(); await app.close(); if (video) await video.saveAs('.local/evidence/smooth-ui-motion.webm'); }
console.log(reports.join('\n'));
