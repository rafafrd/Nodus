import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/main/store';
import {Game} from '../src/main/game';
import {Backups} from '../src/main/backups';
import {Focus} from '../src/main/focus';
import {dec,add,sub} from '../src/shared/amount';
import {gameInput,type GameAction} from '../src/shared/game';
import {FARM_PROJECTS} from '../src/shared/farm';
import {PRODUCERS} from '../src/shared/economy';
import {motorQuote} from '../src/shared/motor';

function fixture(){
  fs.mkdirSync('.local',{recursive:true});const dir=fs.mkdtempSync(path.resolve('.local/farm-test-'));
  let now=Date.UTC(2026,9,9,12),store=new Store(dir),game=new Game(store,()=>now);
  const raw=()=>JSON.parse(String(store.db.prepare('SELECT state FROM game_player').get()!.state));
  const seed=(edit:(s:ReturnType<typeof raw>)=>void)=>{const s=raw();edit(s);store.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(s));};
  const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
  const materials=()=>seed(s=>{s.inventory={wood:45,stone:45,wheat:10,carrot:5};});
  const all=()=>{materials();for(const p of FARM_PROJECTS)act({kind:'farm-build',project:p.id});};
  return {dir,get store(){return store;},get game(){return game;},get now(){return now;},advance:(ms:number)=>now+=ms,raw,seed,act,materials,all,restart:()=>{store.close();store=new Store(dir);game=new Game(store,()=>now);},close:()=>store.close()};
}
test('construções: custos reais, faltantes, ordem livre, recibos, duplicata e rollback atômico',()=>{
 const f=fixture();try{
  assert.equal(f.game.get().farm.objective!.id,'depot');assert.equal(f.game.get().farm.objective!.progress,0);
  const before=f.raw();assert.throws(()=>f.act({kind:'farm-build',project:'depot'}),/quantidade/);assert.deepEqual(f.raw(),before);
  assert.throws(()=>f.act({kind:'farm-build',project:'mine-post'}),/depósito/);
  f.materials();f.seed(s=>s.inventory.stone=4);assert.throws(()=>f.act({kind:'farm-build',project:'depot'}),/quantidade/);assert.equal(f.game.get().inventory.wood,45);
  f.materials();const input={operationId:randomUUID(),action:{kind:'farm-build' as const,project:'depot' as const}};
  const depot=f.game.act(input).state;assert.equal(depot.inventory.wood,35);assert.equal(depot.inventory.stone,40);assert.equal(depot.coins,60);assert.equal(depot.xp,0);
  assert.equal(f.game.act(input).replayed,true);assert.deepEqual(f.game.get().inventory,depot.inventory);
  assert.throws(()=>f.act(input.action),/já faz/);assert.throws(()=>f.game.act({...input,action:{kind:'farm-build',project:'mine-post'}}),/outra ação/);
  f.act({kind:'farm-target',project:'mine-post'});assert.equal(f.game.get().farm.objective!.id,'mine-post');
  f.store.db.exec("CREATE TRIGGER fail_farm BEFORE INSERT ON audit_events WHEN NEW.action='game.farm-build' BEGIN SELECT RAISE(ABORT,'forced rollback'); END");
  const snapshot=f.raw(),ledger=f.store.db.prepare('SELECT count(*) n FROM game_ledger').get()!.n;
  assert.throws(()=>f.act({kind:'farm-build',project:'mine-post'}),/forced rollback/);assert.deepEqual(f.raw(),snapshot);assert.equal(f.store.db.prepare('SELECT count(*) n FROM game_ledger').get()!.n,ledger);
  f.store.db.exec('DROP TRIGGER fail_farm');f.act({kind:'farm-build',project:'mine-post'});assert.equal(f.game.get().farm.objective!.id,'forest-post');
  f.act({kind:'farm-build',project:'forest-post'});const complete=f.game.get();assert.deepEqual(complete.inventory,{wood:0,stone:0,wheat:0,carrot:0});assert.equal(complete.farm.objective,null);assert.ok(complete.farm.reinvestment);
  for(const action of [{kind:'farm-build',project:'bad'},{kind:'farm-collect',station:'depot'},{kind:'farm-build',project:'depot',cost:0},{kind:'farm-collect',station:'forest-post',stock:200}])assert.throws(()=>gameInput.parse({operationId:randomUUID(),action}));
 }finally{f.close();}
});
test('postos: frações, cap, offline, pausa sem backlog, regressão, replay, reinício e recolhimento sem XP',()=>{
 const f=fixture();try{
  f.all();f.advance(30000);assert.equal(f.game.get().farm.stations['forest-post'].carryMs,30000);
  f.restart();assert.equal(f.game.get().farm.stations['forest-post'].carryMs,30000);f.advance(30000);
  const first=f.game.get();assert.equal(first.farm.stations['forest-post'].stock,1);assert.equal(first.farm.stations['mine-post'].stock,1);
  assert.equal(first.coins,60);assert.equal(first.xp,0);assert.equal(first.economy.gathered,0);
  const input={operationId:randomUUID(),action:{kind:'farm-collect' as const,station:'forest-post' as const}};
  const collect=f.game.act(input).state;assert.equal(collect.inventory.wood,1);assert.equal(collect.farm.stations['forest-post'].stock,0);assert.equal(collect.xp,0);assert.equal(collect.coins,60);
  assert.equal(f.game.act(input).replayed,true);assert.throws(()=>f.act(input.action),/vazio/);
  f.store.db.exec("CREATE TRIGGER fail_collect BEFORE INSERT ON audit_events WHEN NEW.action='game.farm-collect' BEGIN SELECT RAISE(ABORT,'collect rollback'); END");
  const untouched=f.raw();assert.throws(()=>f.act({kind:'farm-collect',station:'mine-post'}),/collect rollback/);assert.deepEqual(f.raw(),untouched);f.store.db.exec('DROP TRIGGER fail_collect');
  f.advance(90000);const later=f.game.act(input);assert.equal(later.state.farm.stations['forest-post'].stock,1);assert.equal(later.state.farm.stations['forest-post'].carryMs,30000);f.restart();assert.equal(f.raw().farm.stations['forest-post'].stock,1);
  f.advance(-30000);assert.equal(f.game.get().farm.stations['forest-post'].carryMs,30000);f.advance(30000);assert.equal(f.game.get().farm.stations['forest-post'].stock,1);f.advance(30000);assert.equal(f.game.get().farm.stations['forest-post'].stock,2);
  f.advance(30*86400000);const full=f.game.get();assert.equal(full.farm.stations['forest-post'].stock,200);assert.equal(full.farm.stations['forest-post'].carryMs,0);f.advance(86400000);f.act(input.action);
  assert.equal(f.game.get().inventory.wood,201);assert.equal(f.game.get().farm.stations['forest-post'].stock,0);f.advance(59999);assert.equal(f.game.get().farm.stations['forest-post'].stock,0);f.advance(1);assert.equal(f.game.get().farm.stations['forest-post'].stock,1);
  f.seed(s=>s.inventory.stone=Number.MAX_SAFE_INTEGER);const state=f.raw();assert.throws(()=>f.act({kind:'farm-collect',station:'mine-post'}),/limite/);assert.deepEqual(f.raw(),state);
 }finally{f.close();}
});
test('perfil antigo vazio, backup real e prestígio preservam projetos e inventário',()=>{
 const f=fixture();try{
  f.seed(s=>{delete s.farm;s.passiveAt-=86400000;s.owned=['pickaxe'];s.inventory.wood=17;});f.restart();const legacy=f.game.get();assert.deepEqual(legacy.farm.built,[]);assert.equal(legacy.farm.stations['forest-post'].stock,0);assert.equal(legacy.inventory.wood,17);assert.ok(legacy.owned.includes('pickaxe'));
  f.all();f.advance(90500);const saved=f.game.get();const docs=path.join(f.dir,'documents');fs.mkdirSync(docs);const backups=new Backups(f.store,docs),snapshot=backups.create(),restored=backups.restore(snapshot.id),copy=new Store(restored.profile);
  try{assert.deepEqual(new Game(copy,()=>f.now).get().farm,saved.farm);assert.equal(copy.db.prepare('PRAGMA user_version').get()!.user_version,7);}finally{copy.close();}
  f.seed(s=>{s.economy.lifetime='1e12';s.economy.cycleEarned='1e12';s.economy.producers.collectors=1;});
  const preview=f.game.get(),prestige=f.act({kind:'prestige',expectedCycles:preview.economy.cycles,expectedGain:preview.economy.prestigeGain}).state;
  assert.deepEqual(prestige.farm.built,saved.farm.built);assert.deepEqual(prestige.farm.stations,saved.farm.stations);assert.deepEqual(prestige.inventory,saved.inventory);assert.deepEqual(prestige.owned,saved.owned);
  f.advance(29500);assert.equal(f.game.get().farm.stations['forest-post'].stock,2);
 }finally{f.close();}
});
test('motor escala com produção instalada e legado; eventos, dia regressivo, valores grandes e replay',()=>{
 const f=fixture();try{
  assert.equal(f.game.get().engine.power,1);assert.equal(f.game.get().engine.budget,1200);
  const extreme=motorQuote('1e100',10,1,0);assert.equal(motorQuote('1e100',10,1,sub(extreme.budget,2)).power,2);
  f.seed(s=>{s.economy.producers.collectors=1000;s.engine.level=10;});const installed=f.game.get();assert.ok(dec(installed.engine.budget).gt(1200));assert.ok(dec(installed.engine.power).gt(64));
  f.seed(s=>s.economy.activeEvents=[{id:randomUUID(),type:'alignment',foundAt:f.now,endsAt:f.now+300000}]);const event=f.game.get();assert.ok(dec(event.passiveCoins).gt(installed.passiveCoins));assert.equal(event.engine.budget,installed.engine.budget);assert.equal(event.engine.power,installed.engine.power);
  f.seed(s=>{s.economy.permanent=['shared-knowledge'];});assert.ok(dec(f.game.get().engine.budget).gt(installed.engine.budget));
  f.seed(s=>{s.economy.activeEvents=[];s.economy.producers[PRODUCERS.at(-1)!.id]=1;});
  const large=f.game.get();assert.equal(typeof large.engine.budget,'string');assert.equal(typeof large.engine.power,'string');
  f.seed(s=>{s.economy.motorDay=new Date(f.now).toLocaleDateString('sv-SE');s.economy.motorEarned=sub(large.engine.budget,2);});
  const before=f.game.get(),input={operationId:randomUUID(),action:{kind:'engine-click' as const}},edge=f.game.act(input).state;
  assert.equal(edge.coins,add(before.coins,2));assert.equal(edge.engine.lastGain,2);assert.equal(edge.engine.remaining,0);assert.equal(edge.engine.power,0);assert.equal(f.game.act(input).replayed,true);
  f.advance(-86400000);assert.equal(f.game.get().engine.remaining,0);f.advance(2*86400000);const nextDay=f.game.get();assert.equal(nextDay.engine.remaining,nextDay.engine.budget);
 }finally{f.close();}
});
test('estudo opcional acelera Produção sem criar cultivos nem alterar a taxa dos postos',()=>{
 const f=fixture();try{
  f.all();let mono=0;const focus=new Focus(f.store,()=>mono,()=>f.now),subject=f.store.createSubject({name:'Fixture de estudo',color:'sage'});
  focus.start(subject.id,1);f.advance(60000);mono+=60000;focus.tick();const studied=f.game.get();assert.equal(studied.economy.focusMinutes,1);assert.ok(dec(studied.coins).gt(60));assert.equal(studied.farm.stations['forest-post'].stock,1);assert.equal(studied.inventory.wheat,0);assert.equal(studied.economy.harvested,0);assert.equal(studied.xp,0);
 }finally{f.close();}
});
