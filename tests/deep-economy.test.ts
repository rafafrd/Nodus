import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { Focus } from '../src/main/focus';
import { Study } from '../src/main/study';
import { dec, add } from '../src/shared/amount';
import { BALANCE, PRODUCERS, UPGRADES, PERMANENT, ACHIEVEMENTS, producerCost } from '../src/shared/economy';
import type { GameAction } from '../src/shared/game';
test('partidas salvas de Oficina v2 e Memória anterior conservam regras de recompensa após expansão',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-saved-games-')),db=new Store(dir),now=1000000,game=new Game(db,()=>now),challengeId=randomUUID(),roundId=randomUUID();
 try{
  const raw=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));raw.economy.producers.collectors=100;raw.challengeId=challengeId;raw.roundId=roundId;db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(raw));
  db.db.prepare('INSERT INTO game_challenges VALUES(?,?)').run(challengeId,JSON.stringify({id:challengeId,version:2,kind:'qte',pace:'normal',status:'active',stage:35,hits:35,misses:0,sequence:Array(36).fill('A'),targets:Array(36).fill(50),stepAt:now,readyAt:now,stepMs:1500,zone:14,coins:0,xp:0}));
  const legacy=game.act({operationId:randomUUID(),action:{kind:'qte-input',challengeId,key:'A'}}).state;assert.equal(legacy.challenge!.coins,300);assert.equal(legacy.challenge!.xp,60);
  db.db.prepare('INSERT INTO game_rounds VALUES(?,?)').run(roundId,JSON.stringify({id:roundId,difficulty:'easy',cards:Array.from({length:6},(_,id)=>({id,pair:Math.floor(id/2),text:'Fixture',matched:id<4})),selected:[],attempts:2,combo:2,maxCombo:2,completed:false,coins:0,xp:0,startedAt:now}));
  for(const card of [4,5])game.act({operationId:randomUUID(),action:{kind:'flip',roundId,card}});
  assert.equal(game.get().round!.coins,34);assert.equal(game.get().round!.xp,29);
 }finally{db.close();}
});
test('motor secundário conserva cliques/XP/replay após orçamento e informa o ganho real do último pulso',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-motor-')),db=new Store(dir);let now=Date.UTC(2026,9,7,12);const game=new Game(db,()=>now);
 try{
  const raw=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));raw.engine.level=10;raw.economy.motorDay=new Date(now).toLocaleDateString('sv-SE');raw.economy.motorEarned=1198;db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(raw));
  const input={operationId:randomUUID(),action:{kind:'engine-click' as const}};const edge=game.act(input).state;assert.equal(edge.coins,62);assert.equal(edge.engine.lastGain,2);assert.equal(edge.engine.power,0);assert.equal(game.act(input).replayed,true);
  const next=game.act({operationId:randomUUID(),action:{kind:'engine-click'}}).state;assert.equal(next.coins,62);assert.equal(next.engine.clicks,2);assert.equal(next.engine.lastGain,0);
  now+=86400000;assert.equal(game.get().engine.power,21);assert.equal(game.get().economy.motorEarned,1200);
 }finally{db.close();}
});
test('estudo real: minutos monotônicos, pausa, revisão devida, replay, consistência e rollback econômico',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-study-'));const db=new Store(dir);let wall=Date.UTC(2026,9,7,12),mono=0;
 const game=new Game(db,()=>wall),focus=new Focus(db,()=>mono,()=>wall),study=new Study(db,()=>wall),subject=db.createSubject({name:'Estudo demonstrativo',color:'sage'});
 try{
  const start=focus.start(subject.id,25).session!;wall+=61000;mono+=61000;focus.tick();const minute=game.get();assert.equal(minute.economy.focusMinutes,1);assert.equal(minute.coins,84);assert.equal(minute.xp,0);assert.equal(game.get().coins,84);
  focus.act({subjectId:subject.id,id:start.id,action:'pause'});wall+=3600000;mono+=3600000;assert.equal(game.get().coins,84);
  focus.act({subjectId:subject.id,id:start.id,action:'resume'});wall+=9*60000;mono+=9*60000;focus.tick();assert.equal(game.get().economy.focusMinutes,10);assert.equal(game.get().economy.study.streak,1);
  focus.act({subjectId:subject.id,id:start.id,action:'pause'});
  const card=study.create({subjectId:subject.id,noteId:null,question:'Uma ideia?',answer:'Um conceito.',excerpt:''}),review={operationId:randomUUID(),subjectId:subject.id,id:card.id,version:0,rating:'good' as const};study.review(review);study.review(review);
  const reviewed=game.get();assert.equal(reviewed.economy.reviews,1);assert.equal(reviewed.xp,0);assert.equal(game.get().coins,reviewed.coins);
  study.review({...review,operationId:randomUUID(),version:1,rating:'easy'});assert.equal(game.get().economy.reviews,1,'avaliação antecipada não multiplica Produção');
  const next=study.create({subjectId:subject.id,noteId:null,question:'Outra?',answer:'Sim.',excerpt:''});study.review({...review,id:next.id,operationId:randomUUID()});
  db.db.exec("CREATE TRIGGER reject_reward BEFORE INSERT ON audit_events WHEN NEW.action='game.study-reward' BEGIN SELECT RAISE(ABORT,'reward rollback'); END");assert.throws(()=>game.get(),/rollback/);
  assert.equal(db.db.prepare('SELECT coins FROM game_player').get()!.coins,String(reviewed.coins));assert.equal(study.cards().find(v=>v.id===next.id)!.reviews,1,'falha da economia preserva revisão acadêmica');
  db.db.exec('DROP TRIGGER reject_reward');assert.equal(game.get().economy.reviews,2);assert.equal(game.get().economy.studyDays,1);
 }finally{db.close();}
});
test('sinais persistentes: proteção de Foco, ativação única e expiração offline pela taxa correta',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-signals-'));let db=new Store(dir),now=1000000,game=new Game(db,()=>now,()=>0);const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
 try{
  act({kind:'producer-buy',producer:'collectors',quantity:1});const baseline=game.get();now+=45*60000;let state=game.get();assert.equal(state.economy.signals.length,1);
  const event=state.economy.signals[0],subject=db.createSubject({name:'Foco de teste',color:'sage'}),focus=new Focus(db,()=>0,()=>now);const session=focus.start(subject.id,25).session!;
  assert.throws(()=>act({kind:'activate-signal',id:event.id}),/guardado/);assert.equal(game.get().economy.signals[0].id,event.id);focus.act({subjectId:subject.id,id:session.id,action:'pause'});
  const input={operationId:randomUUID(),action:{kind:'activate-signal' as const,id:event.id}};state=game.act(input).state;assert.equal(game.act(input).replayed,true);assert.equal(state.economy.events,1);assert.ok(dec(state.economy.rate).gt(baseline.economy.rate));
  const before=state.coins,rateBefore=Number(state.economy.rate);now+=10*60000;state=game.get();assert.equal(state.economy.activeEvents.length,0);
  // One five-minute signal, then five minutes at the previous underlying rate.
  assert.ok(dec(state.coins).minus(before).lte(rateBefore*5+rateBefore/3*5+1));
  const saved=game.get();db.close();db=new Store(dir);game=new Game(db,()=>now,()=>0);assert.deepEqual(game.get(),saved);assert.throws(()=>act({kind:'activate-signal',id:event.id}),/guardado/);
 }finally{db.close();}
});

test('compras100/MAX autoritativas: custo exato, replay, desconto e saldo insuficiente conservado',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-bulk-')),db=new Store(dir),now=1000000,game=new Game(db,()=>now);
 try{
  const raw=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));raw.economy.lifetime='1e12';db.db.prepare('UPDATE game_player SET coins=?,state=?').run('1000000000',JSON.stringify(raw));
  const before=game.get(),quote=before.economy.producersView.find(p=>p.id==='collectors')!.cost100,input={operationId:randomUUID(),action:{kind:'producer-buy' as const,producer:'collectors',quantity:100 as const}};
  const bought=game.act(input).state;assert.equal(bought.economy.producers.collectors,100);assert.equal(bought.coins,add(before.coins,dec(quote).neg().toString()));assert.equal(game.act(input).replayed,true);
  const changed=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));changed.economy.activeEvents=[{id:randomUUID(),type:'logistics',foundAt:now,startedAt:now,endsAt:now+360000}];db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(changed));
  const discounted=game.get(),max=discounted.economy.producersView.find(p=>p.id==='collectors')!;assert.ok(dec(max.cost).lt(producerCost(PRODUCERS[0],bought.economy)));
  const maxed=game.act({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:'max'}}).state;assert.equal(maxed.economy.producers.collectors,100+max.max);assert.equal(maxed.coins,add(discounted.coins,dec(max.costMax).neg().toString()));
  assert.equal(maxed.economy.producersView.find(p=>p.id==='collectors')!.max,0);assert.throws(()=>game.act({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:'max'}}),/suficiente/);assert.deepEqual(game.get(),maxed);
 }finally{db.close();}
});

test('combos: dois sinais distintos multiplicam, duplicado permanece guardado, cache não duplica e ausência tem limite',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-combos-'));let db=new Store(dir),now=1000000,game=new Game(db,()=>now);const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
 try{
  act({kind:'producer-buy',producer:'collectors',quantity:1});const raw=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));
  raw.economy.signals=['alignment','resonance','alignment','cache'].map(type=>({id:randomUUID(),type,producer:type==='resonance'?'collectors':undefined,foundAt:now}));db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(raw));
  const baseline=game.get(),[alignment,resonance,duplicate,cache]=baseline.economy.signals;
  act({kind:'activate-signal',id:alignment.id});const aligned=game.get();act({kind:'activate-signal',id:resonance.id});const combo=game.get();assert.equal(combo.economy.activeEvents.length,2);assert.equal(combo.economy.combos,1);assert.ok(dec(combo.economy.rate).gte(dec(aligned.economy.rate).mul(5)));
  assert.throws(()=>act({kind:'activate-signal',id:duplicate.id}),/dois sinais|tipo/);assert.ok(game.get().economy.signals.some(s=>s.id===duplicate.id));
  const cacheInput={operationId:randomUUID(),action:{kind:'activate-signal' as const,id:cache.id}};game.act(cacheInput);const coins=game.get().coins;assert.ok(dec(coins).gt(combo.coins));assert.equal(game.act(cacheInput).replayed,true);assert.equal(game.get().coins,coins);
  now+=20*86400000;const returned=game.get();assert.equal(returned.economy.returnReport!.elapsedMs,20*86400000);assert.equal(returned.economy.returnReport!.producedMs,7*86400000);assert.equal(returned.economy.returnReport!.capped,true);assert.equal(returned.economy.activeEvents.length,0);assert.ok(returned.economy.signals.some(s=>s.id===duplicate.id));assert.equal(returned.economy.signals.length,24);
  db.close();db=new Store(dir);game=new Game(db,()=>now);assert.deepEqual(game.get(),returned);
 }finally{db.close();}
});
test('SQLite v5→v6 conserva saldo/XP/ledger, ganho antigo de prestígio e histórico de estudo; saldo acima de Number soma 1',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-migration-'));let db=new Store(dir,5);const state={inventory:{wheat:0,carrot:0,stone:0,wood:0},owned:[],plots:[],build:{focus:0,review:0,planning:0,practice:0},gatheredAt:0,passiveAt:1000000,passiveCarry:0,roundId:null,engine:{level:0,clicks:0,lastClickAt:0},challengeId:null,economy:{producers:{collectors:0,workshops:0,warehouses:0,powerplants:0,observatories:0},upgrades:['pulse-1'],achievements:['clicks-100'],lifetime:80000,cycleEarned:80000,harvested:0,gathered:0,challenges:0,perfect:0,rounds:0,prestige:0,tokens:0,cycles:0,permanent:[]}};
 db.db.prepare('INSERT INTO game_player VALUES(1,?,?,?)').run(123,456,JSON.stringify(state));db.db.prepare('INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,?)').run('legacy-fixture','Fixture v5',123,456,'{}',1000000,3);db.close();db=new Store(dir);let game=new Game(db,()=>1000000);
 try{
  const migrated=game.get();assert.equal(migrated.coins,123);assert.equal(migrated.xp,456);assert.equal(migrated.economy.prestigeGain,2);assert.ok(migrated.economy.upgrades.includes('pulse-1'));assert.equal(db.db.prepare('SELECT rule_version FROM game_ledger').get()!.rule_version,3);
  const old=game.act({operationId:randomUUID(),action:{kind:'prestige',expectedCycles:0,expectedGain:2}}).state;assert.equal(old.economy.prestige,2);assert.equal(old.economy.prestigeGain,0);assert.equal(old.xp,456);
  const huge='1'+'0'.repeat(100);db.db.prepare('UPDATE game_player SET coins=?').run(huge);game.act({operationId:randomUUID(),action:{kind:'engine-click'}});assert.equal(game.get().coins,add(huge,1));
  const saved=game.get();db.close();db=new Store(dir);game=new Game(db,()=>1000000);assert.deepEqual(game.get(),saved);assert.equal(db.db.prepare('PRAGMA user_version').get()!.user_version,6);
  assert.equal(PRODUCERS.length,16);assert.equal(UPGRADES.length+PERMANENT.length,305);assert.equal(ACHIEVEMENTS.filter(a=>a.secret).length,20);assert.ok(ACHIEVEMENTS.filter(a=>!a.secret).length>=250);assert.equal(BALANCE.version,2);
 }finally{db.close();}
});

test('retorno com relógio realista: resto de milissegundo não é cap, relatório inclui sinais e descobertas da transação',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-return-')),db=new Store(dir);let now=1000000;const game=new Game(db,()=>now++ ,()=>0);
 try{
  game.act({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:1}});now+=8*3600000+123;
  const returned=game.get(),report=returned.economy.returnReport!;assert.equal(report.capped,false);assert.ok(report.signals>0);assert.ok(report.milestones>0);assert.ok(report.producedMs!<=report.elapsedMs);
  const next=game.get().economy.returnReport!;assert.deepEqual(next,report,'consultar não altera descobertas registradas no retorno');
 }finally{db.close();}
});
