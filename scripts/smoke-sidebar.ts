import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';

// Isolated fixture, real Windows executable, SQLite/vault and validated IPC.
const fixture = prepareFixture('sidebar'), data = path.join(fixture.dir,'data');
const store = new Store(data), vault = new Vault(store);
const saved = vault.save({id:fixture.noteA.ref.id,hash:fixture.noteA.hash,text:fixture.noteA.text.split('# Nota A')[0]+'# Nota A\n\n## Um espaço para pensar\n\nOrganize suas notas e consulte o material ao lado. Recolha o menu para dedicar toda a largura ao estudo.\n\n### Transformações lineares\n\n- Identifique a base do espaço.\n- Observe a imagem de cada vetor.\n- Conecte a geometria à representação matricial.\n\n> Concentração também depende do espaço.\n'});
assert.equal(saved.state,'saved'); if(saved.state==='saved')fixture.noteA=saved.document;
for(const title of ['Matrizes','Vetores','Geometria'])vault.create({subjectId:fixture.a.id,title});
store.close();
const sourceFiles=[path.join(fixture.root,fixture.noteA.ref.path),fixture.pdfA];
const originals=sourceFiles.map(file=>fs.readFileSync(file));
fs.mkdirSync('.local/evidence',{recursive:true});
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
async function launch(){return electron.launch({executablePath:path.resolve('release/win-unpacked/App Estudos.exe'),args:[`--user-data-dir=${data}`],env});}
let app=await launch(),page=await app.firstWindow();const errors:string[]=[],checks:string[]=[],screenshots:string[]=[];
function listen(){page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));}listen();
async function prefs(){const r=await page.evaluate(()=>window.desktop.getPreferences());assert.ok(r.ok);return r.value;}
async function idle(){await page.locator('.area-stage[data-motion=idle]').waitFor();}
async function shot(name:string){const file=`.local/evidence/sidebar-${name}.png`;await page.screenshot({path:file});screenshots.push(file);console.log(`CAPTURE ${name}`);}
async function toggle(collapsed:boolean,keyboard=false){const button=page.getByRole('button',{name:collapsed?'Recolher menu lateral':'Expandir menu lateral',exact:true});if(keyboard){await button.focus();await page.keyboard.press('Enter');}else await button.click();await page.waitForFunction(value=>document.querySelector('.nodus-shell')?.getAttribute('data-sidebar-collapsed')===String(value),collapsed);await page.getByRole('button',{name:collapsed?'Expandir menu lateral':'Recolher menu lateral',exact:true}).waitFor({state:'visible'});}
async function size(){return page.locator('.workspace-body').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,width:r.width,right:r.right};});}
async function close(){const closed=new Promise<void>(resolve=>app.once('close',()=>resolve()));await page.getByRole('button',{name:'Fechar janela',exact:true}).click();await closed;}
try{
  await page.getByRole('heading',{name:'Nota A',exact:true}).waitFor();await idle();
  await page.setViewportSize({width:1440,height:940});
  await page.getByRole('button',{name:'Leitura',exact:true}).click();await page.mouse.move(900,850);
  const module=page.locator('.rail-module').first();
  const resting=await module.evaluate(el=>getComputedStyle(el,'::before').opacity);assert.equal(resting,'0');await shot('expanded');
  await page.getByRole('button',{name:'Voltar aos estudos',exact:true}).hover();
  const line=await module.evaluate(el=>{const style=getComputedStyle(el,'::before'),r=el.getBoundingClientRect(),icon=el.querySelector('svg')!.getBoundingClientRect();return {opacity:style.opacity,gap:icon.left-r.left-parseFloat(style.left)-parseFloat(style.width),top:parseFloat(style.top)};});
  assert.equal(line.opacity,'1');assert.ok(line.gap>=12);assert.ok(line.top>=6);await shot('hover');
  await page.mouse.move(900,850);await page.getByRole('button',{name:'Voltar aos estudos',exact:true}).focus();assert.equal(await module.evaluate(el=>getComputedStyle(el,'::before').opacity),'1');
  checks.push(`Linha oculta em repouso; hover/foco visíveis com ${line.gap}px antes do ícone.`);
  await page.getByRole('button',{name:'Dividir com PDF',exact:true}).focus();await page.keyboard.press('Enter');await idle();await page.locator('canvas[data-rendered-page="2"]').waitFor();
  await page.getByRole('button',{name:'Dividir com Grafo',exact:true}).focus();await page.keyboard.press('Enter');await idle();await page.getByTestId('graph-canvas').waitFor();
  await page.getByRole('button',{name:'Nova aba',exact:true}).click();await idle();await page.getByRole('button',{name:'Abrir início',exact:true}).click();await idle();await page.keyboard.press('Control+1');await idle();
  await page.getByRole('separator',{name:'Largura das colunas',exact:true}).press('Shift+ArrowRight');
  await page.waitForFunction(async()=>{const r=await window.desktop.getPreferences();return r.ok&&r.value.workspaceTabs.tabs[0].columnSplit===55;});
  const tabs=(await prefs()).workspaceTabs,expanded=await size();await toggle(true,true);const collapsed=await size();
  assert.equal(await page.getByRole('navigation',{name:'Áreas do Nodus'}).count(),0);assert.ok(Math.abs(collapsed.x)<1&&collapsed.width-expanded.width>=187);
  assert.deepEqual((await prefs()).workspaceTabs,tabs);assert.equal(await page.getByRole('button',{name:'Expandir menu lateral'}).getAttribute('aria-expanded'),'false');await shot('collapsed-three');
  await page.keyboard.press('Control+2');await idle();await page.keyboard.press('Control+1');await idle();await toggle(false);assert.deepEqual((await prefs()).workspaceTabs,tabs);
  await page.getByRole('button',{name:'Dividir com Vídeo',exact:true}).focus();await page.keyboard.press('Enter');await idle();await toggle(true);
  await page.setViewportSize({width:1040,height:760});await idle();
  const geometry=await page.locator('.area-layer[aria-hidden=false]').evaluateAll(elements=>elements.map(el=>{const r=el.getBoundingClientRect();return {area:(el as HTMLElement).dataset.area,x:r.x,width:r.width,right:r.right,bottom:r.bottom};}));
  for(const pane of geometry)assert.ok(pane.width>400&&pane.right<=1040&&pane.bottom<=760);await shot('compact-four');
  checks.push('Menu inteiro oculto, 188px liberados, reabertura por Enter/clique; duas abas e divisores conservados, três/quatro painéis e viewport1040×760.');
  // Verify the collapsed layout in all existing themes through the real IPC.
  for(const theme of ['olive','graphite','midnight','editorial'] as const){const r=await page.evaluate(theme=>window.desktop.updatePreferences({theme}),theme);assert.ok(r.ok);assert.equal(await page.locator('#nodus-sidebar').isVisible(),false);assert.ok((await size()).width>=1039);await toggle(false);assert.equal(await page.locator('#nodus-sidebar').isVisible(),true);await toggle(true);}
  await page.emulateMedia({reducedMotion:'reduce'});await toggle(false);await toggle(true);
  const beforeClose=(await prefs()).workspaceTabs;await close();app=await launch();page=await app.firstWindow();listen();await page.getByTestId('version').waitFor();await idle();
  assert.equal((await prefs()).sidebarCollapsed,true);assert.deepEqual((await prefs()).workspaceTabs,beforeClose);assert.equal(await page.locator('#nodus-sidebar').isVisible(),false);await page.locator('canvas[data-rendered-page="2"]').waitFor();await shot('restart');
  await toggle(false,true);assert.equal(await page.locator('#nodus-sidebar').isVisible(),true);
  const db=new Store(data);db.db.exec("CREATE TRIGGER sidebar_ui_fail BEFORE INSERT ON audit_events WHEN NEW.action='preferences.update' BEGIN SELECT RAISE(FAIL,'fixture'); END;");db.close();
  await page.getByRole('button',{name:'Recolher menu lateral',exact:true}).click();await page.getByText('Não foi possível salvar a posição do menu lateral. Tente novamente.',{exact:true}).first().waitFor();
  assert.equal((await prefs()).sidebarCollapsed,false);assert.equal(await page.locator('#nodus-sidebar').isVisible(),true);const recovered=new Store(data);recovered.db.exec('DROP TRIGGER sidebar_ui_fail');recovered.close();await toggle(true);
  for(let i=0;i<sourceFiles.length;i++)assert.deepEqual(fs.readFileSync(sourceFiles[i]),originals[i]);assert.deepEqual(errors,[]);
  checks.push('Quatro temas, movimento reduzido, restart/PDF2 e fontes intactas; falha SQLite real conserva menu aberto e permite retry; nenhum pageerror.');
  fs.writeFileSync('.local/evidence/sidebar-results.json',JSON.stringify({date:new Date().toISOString(),checks,line,expanded,collapsed,geometry,beforeClose,screenshots,errors},null,2));console.log(checks.join('\n'));
}catch(error){await shot('failure').catch(()=>{});throw error;}finally{const cleanup=new Store(data);cleanup.db.exec('DROP TRIGGER IF EXISTS sidebar_ui_fail');cleanup.close();await app.close().catch(()=>{});}
