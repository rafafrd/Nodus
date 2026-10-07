import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import { Store } from '../src/main/store';
import { Projects } from '../src/main/projects';
import { UserPreferences } from '../src/main/preferences';
import { Checklist } from '../src/main/checklist';
import { Study } from '../src/main/study';

// Explicit demonstration data, prepared by preview-frontend; never a personal profile.
const fixture = process.argv.find(arg => arg.startsWith('--fixture='))?.slice('--fixture='.length);
assert.ok(fixture, 'Passe o diretório da fixture de preview-frontend');
const directory = path.resolve(fixture), data = path.join(directory, 'data');
assert.equal(path.dirname(directory),path.resolve('.local'));
assert.ok(path.basename(directory).startsWith('frontend-preview-'), 'Use somente a fixture isolada de preview-frontend');
assert.ok(fs.existsSync(path.join(data,'study.sqlite')), 'A fixture deve existir antes da prova');
const store = new Store(data), projects = new Projects(store), prefs = new UserPreferences(store), study = new Study(store);
const subjects = store.bootstrap().subjects, subject = subjects[0];
const note = study.catalog().notes.find(n => n.subjectId === subject.id)!;
const names = ['Atlas de estudos', 'Laboratório de algoritmos', 'Caderno de física', 'Experimentos web', 'Notas de leitura'];
for (const name of names) {
  const root = path.join(directory, name); fs.mkdirSync(root, { recursive:true });
  fs.writeFileSync(path.join(root, 'README.md'), `# ${name}\n\nProjeto demonstrativo — nenhum arquivo pessoal.\n`);
  projects.chooseRoot(root);
}
const catalog = projects.catalog();
prefs.update({ name:'Perfil demonstrativo', theme:'editorial', featuredProjectIds:catalog.projects.slice(0,2).map(p => p.id) });
const checklist = new Checklist(store);
checklist.create(subjects[1].id, 'Implementar busca binária e comparar custos');
checklist.create(subjects[2].id, 'Revisar as leis de Newton');
study.create({ subjectId:subject.id, noteId:note.id, question:'O que as colunas de uma matriz representam?', answer:'O destino dos vetores da base na transformação linear.', excerpt:'As colunas da matriz mostram o destino dos vetores da base.' });
store.close();
const originalNote = fs.readFileSync(path.join(directory,'vault',note.path));
const file = path.join(directory,names[0],'README.md'), originalFile=fs.readFileSync(file);
const env={...process.env}; delete env.ELECTRON_RUN_AS_NODE;
const packaged=process.argv.includes('--packaged');
async function launch() { return electron.launch({ executablePath:packaged?path.resolve('release/win-unpacked/App Estudos.exe'):electronPath, args:[...(packaged?[]:['.']),`--user-data-dir=${data}`], env }); }
let app=await launch(), page=await app.firstWindow();
const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
async function ready(area:string) { await page.waitForFunction(target=>document.querySelector(`[data-area="${target}"]`)?.getAttribute('aria-hidden')==='false'&&document.querySelector('[data-testid=area-stage]')?.getAttribute('data-motion')==='idle',area); }
async function shot(name:string) { await page.screenshot({path:`.local/evidence/editorial-${name}.png`}); }
async function dimensions(width:number,height:number) { await app.evaluate(({BrowserWindow},size)=>BrowserWindow.getAllWindows()[0].setContentSize(size.width,size.height),{width,height}); await page.waitForFunction(size=>innerWidth===size.width&&innerHeight===size.height,{width,height}); }
try {
  await page.getByRole('heading',{name:subject.name,exact:true}).waitFor();
  await page.locator('canvas[data-rendered-page="2"]').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'editorial');
  await shot('desk');
  await page.getByRole('button',{name:'Abrir Hoje',exact:true}).click(); await ready('home');
  await page.getByRole('heading',{name:'Hoje',exact:true}).waitFor();
  await page.getByText('Implementar busca binária e comparar custos',{exact:true}).waitFor();
  await shot('today');
  await page.getByRole('button',{name:'Abrir Explorer',exact:true}).click(); await ready('explorer');
  await page.getByRole('heading',{name:'Projetos principais',exact:true}).waitFor();
  assert.equal(await page.locator('.featured .project-card').count(),2);
  assert.equal(await page.locator('.secondary .project-card').count(),3);
  await shot('projects');
  await page.getByRole('button',{name:`Tornar principal ${names[2]}`,exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.featured .project-card').length===3);
  await page.getByRole('button',{name:`Tornar secundário ${names[2]}`,exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.featured .project-card').length===2);
  await page.getByRole('button',{name:`Explorar ${names[0]}`,exact:true}).click();
  await page.getByRole('button',{name:'Arquivo README.md',exact:true}).click();
  const editor=page.getByRole('textbox',{name:'Conteúdo do arquivo',exact:true}); await editor.waitFor();
  await editor.click(); await page.keyboard.press('Control+End'); await page.keyboard.insertText('\nRascunho demonstrativo preservado.');
  await page.getByRole('button',{name:'Visão geral dos projetos',exact:true}).click();
  await page.getByRole('heading',{name:'Projetos principais',exact:true}).waitFor();
  await page.getByRole('button',{name:'Aba README.md',exact:true}).click();
  await editor.waitFor(); assert.ok((await editor.innerText()).includes('Rascunho demonstrativo preservado.'));
  await page.getByRole('button',{name:'Abrir configurações',exact:true}).click(); await ready('settings');
  await page.getByRole('button',{name:'Aparência',exact:true}).click();
  await shot('appearance');
  await page.getByRole('button',{name:/^Oliva/}).click(); await page.waitForFunction(()=>document.documentElement.dataset.theme==='olive');
  await page.getByRole('button',{name:'Abrir Hoje',exact:true}).click(); await ready('home');
  await page.getByRole('heading',{name:'Seu dia, com espaço para estudar.',exact:true}).waitFor(); await shot('original-theme');
  await page.getByRole('button',{name:'Abrir configurações',exact:true}).click(); await ready('settings');
  await page.getByRole('button',{name:/^Editorial/}).click(); await page.waitForFunction(()=>document.documentElement.dataset.theme==='editorial');
  await page.getByRole('button',{name:'Abrir revisões',exact:true}).first().click(); await ready('review');
  await page.getByRole('button',{name:'Revelar resposta',exact:true}).waitFor(); await shot('review');
  await page.getByRole('button',{name:'Abrir grafo',exact:true}).click(); await ready('graph');
  await page.locator('.graph-node-label').first().waitFor(); await shot('graph');
  await page.getByRole('button',{name:'Entrar na cidade',exact:true}).click(); await ready('city');
  await page.locator('canvas[data-ready=true]').waitFor(); await shot('city');
  await dimensions(1040,760);
  await page.getByRole('button',{name:'Abrir Hoje',exact:true}).click(); await ready('home'); await shot('compact-today');
  await page.getByRole('button',{name:'Abrir Explorer',exact:true}).click(); await ready('explorer');
  await page.getByRole('button',{name:'Visão geral dos projetos',exact:true}).click(); await shot('compact-projects');
  await page.getByRole('button',{name:'Abrir configurações',exact:true}).click(); await ready('settings'); await shot('compact-appearance');
  for(const selector of ['.settings-workspace','.settings-themes']) { const bounds=await page.locator(selector).boundingBox(); assert.ok(bounds&&bounds.x+bounds.width<=1040); }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Abrir Hoje',exact:true}).click(); await ready('home');
  await page.getByRole('button',{name:'Retomar mesa',exact:false}).click(); await ready('study');
  await page.locator('canvas[data-rendered-page="2"]').waitFor(); await shot('compact-desk');
  assert.deepEqual(fs.readFileSync(path.join(directory,'vault',note.path)),originalNote);
  assert.deepEqual(fs.readFileSync(file),originalFile);
  await app.close(); app=await launch(); page=await app.firstWindow(); page.on('pageerror',e=>errors.push(e.message));
  await page.getByRole('heading',{name:subject.name,exact:true}).waitFor();
  const persisted=await page.evaluate(()=>window.desktop.getPreferences()); assert.ok(persisted.ok&&persisted.value.theme==='editorial'&&persisted.value.featuredProjectIds.length===2);
  await page.getByRole('button',{name:'Abrir Explorer',exact:true}).click(); await ready('explorer');
  const recovered=page.getByRole('textbox',{name:'Conteúdo do arquivo',exact:true}); await recovered.waitFor(); assert.ok((await recovered.innerText()).includes('Rascunho demonstrativo preservado.'));
  await page.keyboard.press('Control+s'); await page.getByRole('status').filter({hasText:'Salvo no arquivo'}).waitFor();
  assert.ok(fs.readFileSync(file,'utf8').includes('Rascunho demonstrativo preservado.'));
  await page.getByRole('button',{name:'Visão geral dos projetos',exact:true}).click(); await shot('reopened-projects');
  assert.equal(await page.locator('.featured .project-card').count(),2);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('.local/evidence/editorial-results.json',JSON.stringify({at:new Date().toISOString(),platform:process.platform,packaged,fixture:directory,checks:['Dashboard/mesa/PDF/revisão/grafo/ajustes reais','2 principais/3 secundários, reclassificação e restart','Oliva conserva dashboard anterior','1040×760 sem overflow horizontal dos ajustes','Movimento reduzido e retomada da mesa','Markdown original intacto; rascunho de projeto recuperado/salvo após restart'],errors,result:'passed'},null,2));
  console.log('Editorial: UI real, temas, classificação, compacto, fontes e restart aprovados; capturas editorial-*.png.');
} catch(error) { await shot('failure').catch(()=>{}); throw error; } finally { await app.close(); }
