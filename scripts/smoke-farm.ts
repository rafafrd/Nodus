import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {_electron as electron} from 'playwright';
import {prepareFixture} from './test-fixture';
import {Store} from '../src/main/store';
import {Game} from '../src/main/game';
import {dec,sub,formatAmount} from '../src/shared/amount';
import type {GameState} from '../src/shared/game';

const f=prepareFixture('farm-windows'),data=path.join(f.dir,'data'),evidence='.local/evidence/farm-projects';fs.mkdirSync(evidence,{recursive:true});
const source=fs.readFileSync(path.join(f.root,f.noteA.ref.path));
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const launch=()=>electron.launch({executablePath:path.resolve('release/win-unpacked/App Estudos.exe'),args:[`--user-data-dir=${data}`],env});
let app=await launch(),page=await app.firstWindow();const errors:string[]=[],checks:string[]=[],screenshots:string[]=[];
function listen(){page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));}listen();
async function ready(){await page.locator('.game-shell[aria-busy=false]').waitFor();}
async function city(){await page.getByTestId('version').waitFor();await page.getByRole('button',{name:'Entrar na cidade',exact:true}).click();await page.getByTestId('city-canvas').waitFor();await page.waitForFunction(()=>document.querySelector('[data-testid=city-canvas]')?.getAttribute('data-ready')==='true');}
async function state():Promise<GameState>{const r=await page.evaluate(()=>window.desktop.getGame());assert.ok(r.ok);return r.value;}
async function shot(name:string){const file=path.join(evidence,name+'.png');await page.screenshot({path:file});screenshots.push(file);console.log('CAPTURE '+name);}
async function reopen(){app=await launch();page=await app.firstWindow();listen();await city();}
try{
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1440,1000));await city();await shot('next-depot');
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1040,760));await shot('compact-project');await page.getByRole('combobox',{name:'Skin da cidade',exact:true}).selectOption('original');await ready();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1440,1000));
 assert.ok(await page.getByRole('button',{name:'Construir Depósito',exact:true}).isDisabled());
 await page.getByRole('button',{name:'Buscar Madeira',exact:true}).click();await page.getByRole('heading',{name:'Bosque dos viajantes',exact:true}).waitFor();await page.getByRole('button',{name:'Coletar madeira →',exact:true}).click();await ready();assert.equal((await state()).inventory.wood,1);
 await page.getByRole('button',{name:'Fechar detalhes do local',exact:true}).click();await app.close();
 // Explicit materials fixture accelerates the visual journey. This is not proof
 // of player time: prices are paid through the real renderer/main transaction.
 const seed=new Store(data),raw=JSON.parse(String(seed.db.prepare('SELECT state FROM game_player').get()!.state));raw.inventory={wood:45,stone:45,wheat:10,carrot:5};seed.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(raw));seed.close();
 await reopen();await page.getByRole('button',{name:'Construir Depósito',exact:true}).click();await ready();await page.locator('.construction-complete').waitFor();await shot('depot-complete');assert.equal((await state()).inventory.wood,35);
 await page.getByRole('combobox',{name:'Próximo posto',exact:true}).selectOption('mine-post');await ready();assert.equal((await state()).farm.objective!.id,'mine-post');await shot('choose-mine');
 await page.getByRole('button',{name:'Construir Posto da mina',exact:true}).click();await ready();const started=Date.now();await shot('mine-complete');
 await page.getByRole('button',{name:'Construir Posto do bosque',exact:true}).click();await ready();assert.equal((await state()).farm.objective,null);await shot('all-projects');
 for(const skin of ['original','cyberpunk','newyork']){
  await page.getByRole('combobox',{name:'Skin da cidade',exact:true}).selectOption(skin);await ready();await page.locator(`canvas[data-skin=${skin}]`).waitFor();
  await page.waitForFunction(skin=>document.querySelector('canvas')?.getAttribute('data-farm-projects')===`${skin}-depot,${skin}-forest-post,${skin}-mine-post`,skin);await shot('projects-'+skin);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Centralizar cidade',exact:true}).click();await page.locator('canvas[data-camera=idle]').waitFor();await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.farm-stocks summary').click();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1040,760));await shot('compact-stocks');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 while(Date.now()-started<65000){await page.waitForTimeout(Math.min(15000,65000-(Date.now()-started)));console.log('Estoque: '+Math.round((Date.now()-started)/1000)+'s reais Windows');}
 await page.getByRole('button',{name:'Recolher Posto do bosque',exact:true}).waitFor();const before=await state();assert.ok(before.farm.stations['forest-post'].stock>=1);await shot('stocks-ready');
 await page.getByRole('button',{name:'Recolher Posto do bosque',exact:true}).click();await ready();const collect=await state();assert.equal(collect.inventory.wood,before.inventory.wood+before.farm.stations['forest-post'].stock);assert.equal(collect.xp,before.xp);assert.equal(collect.economy.gathered,before.economy.gathered);assert.equal(collect.coins,before.coins);
 await page.getByRole('button',{name:'Recolher Posto da mina',exact:true}).click();await ready();checks.push('Projetos completos pela UI, custos reais, escolha de ordem, três skins, compacta e um minuto real de produção/recolhimento sem XP');
 await page.getByRole('button',{name:'Ver em Produção →',exact:true}).click();await page.locator('.economy-workspace').waitFor();await page.getByRole('button',{name:'Comprar 1 Coletores',exact:true}).click();await ready();const installed=await state();assert.equal(installed.economy.producers.collectors,1);assert.ok((await page.locator('.economy-target').textContent())?.includes(formatAmount(installed.economy.producersView.find(v=>v.id==='collectors')!.cost)));await shot('reinvestment');
 await page.getByRole('button',{name:'Motor',exact:true}).click();const first=await state();await page.getByRole('button',{name:'Gerar Produção',exact:true}).click();await ready();const pulsed=await state();assert.equal(pulsed.engine.remaining,sub(first.engine.remaining,first.engine.power));await shot('motor-floor');
 await app.close();const advanced=new Store(data),game=new Game(advanced),r=JSON.parse(String(advanced.db.prepare('SELECT state FROM game_player').get()!.state));
 r.economy.producers.collectors=1000;r.engine.level=10;r.economy.lifetime=1234567;advanced.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(r));
 const quote=game.get();assert.ok(dec(quote.engine.budget).gt(1200));assert.ok(dec(quote.engine.power).gt(64));const capped=JSON.parse(String(advanced.db.prepare('SELECT state FROM game_player').get()!.state));capped.economy.motorDay=new Date().toLocaleDateString('sv-SE');capped.economy.motorEarned=sub(quote.engine.budget,2);
 // Explicit offline/full-stock seed exercises the packaged main settlement.
 for(const id of ['forest-post','mine-post'])capped.farm.stations[id].settledAt=Date.now()-30*86400000;
 advanced.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(capped));advanced.close();await reopen();await page.locator('.farm-stocks summary').click();assert.equal((await state()).farm.stations['forest-post'].stock,200);await shot('offline-full');
 await page.getByRole('button',{name:'Recolher Posto do bosque',exact:true}).click();await ready();assert.equal((await state()).farm.stations['forest-post'].stock,0);
 await page.getByRole('button',{name:'Motor',exact:true}).click();assert.equal((await state()).engine.power,2);await shot('motor-last-pulse');await page.getByRole('button',{name:'Gerar Produção',exact:true}).click();await ready();assert.equal((await state()).engine.remaining,0);assert.ok(await page.getByRole('button',{name:'Gerar Produção',exact:true}).isDisabled());await shot('motor-rest');
 await page.getByRole('button',{name:'Cuidar dos cultivos →',exact:true}).click();await page.getByRole('heading',{name:'Sua fazenda',exact:true}).waitFor();await page.getByRole('button',{name:'Plantar canteiro 1',exact:true}).click();await ready();assert.equal((await state()).plots[0].crop,'wheat');
 const saved=await state();await app.close();await reopen();const restored=await state();assert.deepEqual(restored.farm.built,saved.farm.built);assert.deepEqual(restored.inventory,saved.inventory);assert.equal(restored.plots[0].crop,'wheat');assert.equal(restored.economy.motorEarned,saved.economy.motorEarned);assert.ok(dec(restored.engine.remaining).lte(restored.engine.budget));assert.deepEqual(fs.readFileSync(path.join(f.root,f.noteA.ref.path)),source);assert.deepEqual(errors,[]);
 checks.push('Reinvestimento existente, motor/floors/último ganho/descanso/alternativas, offline cheio, reinício, cultivo manual e Markdown intacto');
 fs.writeFileSync(path.join(evidence,'windows.json'),JSON.stringify({at:new Date().toISOString(),platform:process.platform,packaged:true,fixture:'isolated materials/advanced/offline fixtures; not human progression',checks,errors,screenshots},null,2));console.log(checks.join('\n'));
}catch(error){await shot('failure').catch(()=>{});throw error;}finally{await app.close().catch(()=>{});}
