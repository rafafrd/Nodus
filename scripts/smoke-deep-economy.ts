import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { _electron as electron } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { UserPreferences } from '../src/main/preferences';
import { dec } from '../src/shared/amount';
import { ACHIEVEMENTS } from '../src/shared/economy';
import type { GameState } from '../src/shared/game';
const f=prepareFixture('deep-production'),data=path.join(f.dir,'data'),db=new Store(data),game=new Game(db);
// Explicit advanced DEMONSTRATION seed. It is not evidence of human progression.
const raw=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));raw.economy.lifetime='1e12';
db.db.prepare('UPDATE game_player SET coins=?,state=?').run('1000000000000',JSON.stringify(raw));db.db.prepare('INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,?)').run('fixture-demo','Perfil de demonstração avançado','999999999940',0,'{}',Date.now(),4);
const act=(action:Parameters<Game['act']>[0]['action'])=>game.act({operationId:randomUUID(),action});
for(const [id,count] of [['collectors',50],['workshops',25],['warehouses',10],['powerplants',5],['observatories',1],['spectral-labs',1]] as const)for(let i=0;i<count;i++)act({kind:'producer-buy',producer:id,quantity:1});
for(const id of ['collectors-1','collectors-2','collectors-3','workshops-1','workshops-2','link-collectors-1','network-1'])act({kind:'economy-upgrade',id});
act({kind:'skin',value:'cyberpunk'});new UserPreferences(db).update({theme:'editorial',editorialBackground:false});
const demo=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));
demo.economy.signals=['alignment','resonance','cache'].map(type=>({id:randomUUID(),type,...(type==='resonance'?{producer:'collectors'}:{}),foundAt:Date.now()}));
demo.passiveAt=Date.now()-8*3600000;db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(demo));
const source=fs.readFileSync(path.join(f.root,f.noteA.ref.path));db.close();fs.mkdirSync('.local/evidence',{recursive:true});
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const packaged=process.argv.includes('--packaged');
async function launch(){return electron.launch({executablePath:path.resolve(packaged?'release/win-unpacked/App Estudos.exe':'node_modules/electron/dist/electron.exe'),args:[...(packaged?[]:['.']),`--user-data-dir=${data}`],env});}
let app=await launch(),page=await app.firstWindow();page.setDefaultTimeout(20000);const errors:string[]=[],checks:string[]=[];page.on('pageerror',e=>errors.push(e.message));
async function idle(){await page.locator('.area-stage[data-motion=idle]').waitFor();}
async function state():Promise<GameState>{const r=await page.evaluate(()=>window.desktop.getGame());assert.ok(r.ok);return r.value;}
async function shot(name:string){if(await page.locator('dialog').isVisible())await page.waitForFunction(()=>{const dialog=document.querySelector('dialog');return !dialog||Number(getComputedStyle(dialog).opacity)>.99;});await page.screenshot({path:`.local/evidence/deep-${name}.png`});}
async function ready(){await page.locator('.game-shell[aria-busy=false]').waitFor();}
try{
 await page.getByTestId('version').waitFor();await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].setSize(1440,1000);});
 await page.getByRole('button',{name:'Entrar na cidade',exact:true}).click();await idle();await page.getByTestId('city-canvas').waitFor();await page.waitForFunction(()=>document.querySelector('[data-testid=city-canvas]')?.getAttribute('data-ready')==='true');
 const objects=await page.getByTestId('city-canvas').getAttribute('data-installation-objects');assert.ok(Number(objects)<130);await shot('city');await page.getByRole('button',{name:'Explorar distrito produtivo',exact:true}).click();await page.locator('canvas[data-camera=idle]').waitFor();await shot('district');
 for(const skin of ['newyork','original','cyberpunk']){await page.getByRole('combobox',{name:'Skin da cidade',exact:true}).selectOption(skin);await ready();await page.locator(`canvas[data-skin=${skin}]`).waitFor();await shot(`district-${skin}`);assert.equal(await page.getByTestId('city-canvas').getAttribute('data-installation-objects'),objects);}
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Explorar distrito produtivo',exact:true}).click();await page.waitForTimeout(80);assert.equal(await page.getByTestId('city-canvas').getAttribute('data-camera'),'idle');await page.emulateMedia({reducedMotion:'no-preference'});checks.push(`Distrito nas três skins e movimento reduzido, ${objects} objetos independente das unidades`);
 if(!process.argv.includes('--visual-only')){
 await page.getByRole('button',{name:'Produção',exact:true}).click();await page.getByRole('heading',{name:'Uma hipótese que cresce.',exact:true}).waitFor();await shot('installations');
 await page.getByRole('combobox',{name:'Quantidade de produtores',exact:true}).selectOption('10');const before=await state();await page.getByRole('button',{name:'Comprar 10 Armazéns',exact:true}).click();await ready();assert.equal((await state()).economy.producers.warehouses,before.economy.producers.warehouses+10);
 await page.getByRole('combobox',{name:'Quantidade de produtores',exact:true}).selectOption('100');const bulk=await state();await page.getByRole('button',{name:'Comprar 100 Coletores',exact:true}).click();await ready();assert.equal((await state()).economy.producers.collectors,bulk.economy.producers.collectors+100);
 await page.getByRole('combobox',{name:'Quantidade de produtores',exact:true}).selectOption('max');const maxBefore=await state(),max=maxBefore.economy.producersView.find(p=>p.id==='warehouses')!.max;assert.ok(max>0);await page.getByRole('button',{name:'Comprar max Armazéns',exact:true}).click();await ready();assert.equal((await state()).economy.producers.warehouses,maxBefore.economy.producers.warehouses+max);
 await page.locator('.economy-breakdown summary').first().click();await page.locator('.economy-breakdown').first().scrollIntoViewIfNeeded();await shot('breakdown');
 await page.getByRole('button',{name:'Melhorias',exact:true}).click();await shot('upgrades');assert.ok(await page.locator('.technology-grid article').count()<100,'catálogo progressivo');
 await page.getByRole('button',{name:'Descobertas',exact:true}).click();await shot('achievements');await page.getByRole('combobox',{name:'Filtro de conquistas'}).selectOption('secret');assert.equal(await page.locator('.achievement-grid article').count(),(await state()).economy.achievements.filter(id=>ACHIEVEMENTS.some(a=>a.id===id&&a.secret)).length);
 await page.getByRole('button',{name:/^Sinais/}).click();await shot('signals');checks.push('Compras ×10/×100/MAX pela UI, breakdown, melhorias progressivas e segredos ocultos');
 const focusBefore=await state();const focus=await page.evaluate(subjectId=>window.desktop.startFocus({subjectId,minutes:1}),f.a.id);assert.ok(focus.ok);
 await page.getByRole('button',{name:'Ativar Alinhamento orbital',exact:true}).first().waitFor();await page.waitForFunction(()=>document.querySelector('.deep-economy .technology-grid button')?.hasAttribute('disabled'));await shot('focus-signals');
 for(let i=0;i<4;i++){await page.waitForTimeout(15500);console.log(`Foco real Windows: ${(i+1)*15}s`);}
 const focused=await state();assert.equal(focused.economy.focusMinutes,focusBefore.economy.focusMinutes+1);assert.equal(focused.xp,focusBefore.xp);checks.push('Um minuto real monotônico de Foco no Electron gera Produção sem XP; sinais guardados');
 await page.getByRole('button',{name:'Ativar Alinhamento orbital',exact:true}).first().click();await ready();await page.getByRole('button',{name:'Ativar Ressonância local',exact:true}).first().click();await ready();assert.equal((await state()).economy.activeEvents.length,2);assert.ok((await state()).economy.combos>=1);await shot('combo');
 await page.getByRole('button',{name:'Motor',exact:true}).click();const clicks=(await state()).engine.clicks;await page.getByRole('button',{name:'Gerar Produção',exact:true}).click({clickCount:12,delay:0});await ready();assert.equal((await state()).engine.clicks,clicks+12);await shot('motor');
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1040,760));await page.getByRole('button',{name:'Produção',exact:true}).click();await page.getByRole('button',{name:'Instalações',exact:true}).click();await shot('compact');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1440,1000));await page.getByRole('button',{name:'Legado',exact:true}).click();await shot('legacy');const retained=await state();assert.ok(dec(retained.economy.prestigeGain).gte(1));
 await page.getByRole('button',{name:'Revisar novo ciclo',exact:true}).click();await shot('prestige-confirm');await page.getByRole('button',{name:'Continuar neste ciclo',exact:true}).click();assert.equal((await state()).economy.cycles,retained.economy.cycles);
 await page.getByRole('button',{name:'Revisar novo ciclo',exact:true}).click();await page.getByRole('checkbox',{name:'Entendi quais partes da economia serão reiniciadas.'}).check();await page.getByRole('button',{name:'Confirmar novo ciclo',exact:true}).click();await ready();const reset=await state();assert.equal(reset.economy.cycles,retained.economy.cycles+1);assert.equal(reset.coins,0);assert.equal(reset.xp,retained.xp);assert.equal(reset.economy.focusMinutes,retained.economy.focusMinutes);assert.ok(Object.values(reset.economy.producers).every(n=>n===0));assert.deepEqual(reset.economy.signals,retained.economy.signals);await shot('new-cycle');
 const permanent=page.getByRole('button',{name:'Adquirir Ferramentas herdadas',exact:true});await permanent.click();await ready();const saved=await state();assert.ok(saved.economy.permanent.includes('legacy-tools'));checks.push('Combo, prévia/cancelamento/reset de prestígio e compra permanente pela UI');
 await app.close();app=await launch();page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));await page.getByTestId('version').waitFor();await page.getByRole('button',{name:'Entrar na cidade',exact:true}).click();await idle();const restored=await state();assert.deepEqual(restored.economy.producers,saved.economy.producers);assert.deepEqual(restored.economy.permanent,saved.economy.permanent);assert.equal(restored.economy.tokens,saved.economy.tokens);assert.equal(restored.engine.clicks,saved.engine.clicks);assert.equal(restored.skin,'cyberpunk');assert.equal(restored.xp,saved.xp);assert.equal(restored.economy.focusMinutes,saved.economy.focusMinutes);assert.deepEqual(fs.readFileSync(path.join(f.root,f.noteA.ref.path)),source);assert.deepEqual(errors,[]);
 checks.push('Motor sem intervalo, janela compacta, reinicialização e fonte Markdown intacta');fs.writeFileSync('.local/evidence/deep-results.json',JSON.stringify({at:new Date().toISOString(),platform:process.platform,packaged,fixture:f.dir,checks,errors},null,2));
 }else{assert.deepEqual(errors,[]);fs.writeFileSync('.local/evidence/deep-skins-results.json',JSON.stringify({at:new Date().toISOString(),platform:process.platform,packaged,checks,errors},null,2));}console.log(checks.join('\n'));
}catch(error){await shot('failure').catch(()=>{});throw error;}finally{await app.close();}
