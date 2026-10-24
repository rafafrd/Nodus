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
import { BALANCE, PRODUCERS, UPGRADES, PERMANENT, ACHIEVEMENTS, producerCost, efficiencyIndex } from '../src/shared/economy';
import { STUDY_XP } from '../src/main/economic-study';
import type { GameAction } from '../src/shared/game';

test('estudo concede XP e conquistas, nunca centelhas nem produção; minutos monotônicos, pausa, revisão e rollback',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-study-'));const db=new Store(dir);let wall=Date.UTC(2026,9,7,12),mono=0;
 const game=new Game(db,()=>wall),focus=new Focus(db,()=>mono,()=>wall),study=new Study(db,()=>wall),subject=db.createSubject({name:'Estudo demonstrativo',color:'sage'});
 try{
  game.act({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:1}});const before=game.get(),rate=before.economy.rate;
  const start=focus.start(subject.id,25).session!;wall+=61000;mono+=61000;focus.tick();
  const minute=game.get();assert.equal(minute.economy.focusMinutes,1);assert.equal(minute.xp,STUDY_XP.focusMinute);
  const passive=Math.floor(61*Number(rate)/60);assert.ok(Number(minute.coins)<=Number(before.coins)+passive+1,'só a produção do tempo corrido entra; o Foco não paga centelhas');
  assert.equal(game.get().xp,minute.xp,'consultar de novo não repete XP');
  focus.act({subjectId:subject.id,id:start.id,action:'pause'});wall+=3600000;mono+=3600000;assert.equal(game.get().economy.focusMinutes,1);
  focus.act({subjectId:subject.id,id:start.id,action:'resume'});wall+=9*60000;mono+=9*60000;focus.tick();const ten=game.get();assert.equal(ten.economy.focusMinutes,10);assert.equal(ten.economy.study.streak,1);assert.equal(ten.xp,10*STUDY_XP.focusMinute);
  focus.act({subjectId:subject.id,id:start.id,action:'pause'});
  const studyAchievements=ten.economy.achievements.filter(id=>ACHIEVEMENTS.find(a=>a.id===id)?.study);assert.ok(studyAchievements.length>=2,'conquistas de estudo continuam sendo concedidas');
  const withoutStudy={...ten.economy,achievements:ten.economy.achievements.filter(id=>!studyAchievements.includes(id))};assert.equal(efficiencyIndex(ten.economy),efficiencyIndex(withoutStudy),'conquistas de estudo não entram no índice de produção');
  const card=study.create({subjectId:subject.id,noteId:null,question:'Uma ideia?',answer:'Um conceito.',excerpt:''}),review={operationId:randomUUID(),subjectId:subject.id,id:card.id,version:0,rating:'good' as const};study.review(review);study.review(review);
  const reviewed=game.get();assert.equal(reviewed.economy.reviews,1);assert.equal(reviewed.xp,ten.xp+STUDY_XP.review);
  study.review({...review,operationId:randomUUID(),version:1,rating:'easy'});assert.equal(game.get().economy.reviews,1,'avaliação antecipada não repete o ganho');
  const receipts=db.db.prepare("SELECT amount FROM economic_receipts WHERE kind IN ('focus','review')").all().map(r=>String(r.amount));assert.ok(receipts.length>=2&&receipts.every(v=>v==='0'),'recibos novos registram zero centelhas');
  const next=study.create({subjectId:subject.id,noteId:null,question:'Outra?',answer:'Sim.',excerpt:''});study.review({...review,id:next.id,operationId:randomUUID()});
  db.db.exec("CREATE TRIGGER reject_reward BEFORE INSERT ON audit_events WHEN NEW.action='game.study-xp' BEGIN SELECT RAISE(ABORT,'xp rollback'); END");assert.throws(()=>game.get(),/rollback/);
  assert.equal(Number(db.db.prepare('SELECT xp FROM game_player').get()!.xp),reviewed.xp);assert.equal(study.cards().find(v=>v.id===next.id)!.reviews,1,'falha do jogo preserva a revisão acadêmica');
  db.db.exec('DROP TRIGGER reject_reward');assert.equal(game.get().economy.reviews,2);assert.equal(game.get().economy.studyDays,1);
 }finally{db.close();}
});

test('compras100/MAX autoritativas: custo exato, replay, desconto e saldo insuficiente conservado',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-bulk-')),db=new Store(dir),now=1000000,game=new Game(db,()=>now);
 try{
  const raw=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));raw.economy.lifetime='1e12';db.db.prepare('UPDATE game_player SET coins=?,state=?').run('1000000000',JSON.stringify(raw));
  const before=game.get(),quote=before.economy.producersView.find(p=>p.id==='collectors')!.cost100,input={operationId:randomUUID(),action:{kind:'producer-buy' as const,producer:'collectors',quantity:100 as const}};
  const bought=game.act(input).state;assert.equal(bought.economy.producers.collectors,100);assert.equal(bought.coins,add(before.coins,dec(quote).neg().toString()));assert.equal(game.act(input).replayed,true);
  const changed=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));changed.economy.activeEvents=[{id:randomUUID(),type:'logistics',foundAt:now,startedAt:now,endsAt:now+360000}];db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(changed));
  const discounted=game.get(),max=discounted.economy.producersView.find(p=>p.id==='collectors')!;assert.ok(dec(max.cost).lt(producerCost(PRODUCERS[0],bought.economy)),'efeito salvo das regras 2 continua até terminar');
  const maxed=game.act({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:'max'}}).state;assert.equal(maxed.economy.producers.collectors,100+max.max);assert.equal(maxed.coins,add(discounted.coins,dec(max.costMax).neg().toString()));
  assert.equal(maxed.economy.producersView.find(p=>p.id==='collectors')!.max,0);assert.throws(()=>game.act({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:'max'}}),/suficiente/);assert.deepEqual(game.get(),maxed);
 }finally{db.close();}
});

test('efeitos sobrepostos contam combo, renovar prolonga e ausência integra cada trecho pela taxa correta',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-combos-'));let db=new Store(dir),now=1000000,game=new Game(db,()=>now);const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
 try{
  // Fixture: Horta open and two roots already ripe.
  const raw=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));raw.economy.producers.collectors=10;raw.economy.activeEvents=[{id:randomUUID(),type:'tide',foundAt:now,startedAt:now,endsAt:now+60000}];raw.plots[0]={id:1,crop:'carrot',plantedAt:0,readyAt:now};raw.plots[1]={id:2,crop:'carrot',plantedAt:0,readyAt:now};db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(raw));
  const tide=game.get();const amber=act({kind:'harvest',plot:1}).state;assert.equal(amber.economy.combos,1);const ends=amber.economy.activeEvents.find(e=>e.type==='amber')!.endsAt!;
  const longer=act({kind:'harvest',plot:2}).state;assert.equal(longer.economy.activeEvents.filter(e=>e.type==='amber').length,1);assert.equal(longer.economy.activeEvents.find(e=>e.type==='amber')!.endsAt,ends+5*60000);
  // Harvesting into an active Maré grants the combo achievement, so the rate is read after the harvests.
  const tideRate=Number(longer.economy.rate),base=tideRate/5,coins=Number(longer.coins);assert.ok(tideRate>=Number(tide.economy.rate));now+=20*86400000;const returned=game.get();
  assert.ok(Number(returned.coins)-coins<=tideRate+base*7*24*60+2,'um minuto de Maré e o resto pela taxa base');
  assert.equal(returned.economy.returnReport!.producedMs,7*86400000);assert.equal(returned.economy.returnReport!.capped,true);assert.equal(returned.economy.activeEvents.length,0);
  db.close();db=new Store(dir);game=new Game(db,()=>now);assert.deepEqual(game.get(),returned);
 }finally{db.close();}
});

test('SQLite v5→v6→regras 3 conserva saldo/XP/ledger, ganho antigo de prestígio e histórico; saldo acima de Number soma',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-migration-'));let db=new Store(dir,5);const state={inventory:{wheat:0,carrot:0,stone:0,wood:0},owned:[],plots:[],build:{focus:0,review:0,planning:0,practice:0},gatheredAt:0,passiveAt:1000000,passiveCarry:0,roundId:null,engine:{level:0,clicks:0,lastClickAt:0},challengeId:null,economy:{producers:{collectors:0,workshops:0,warehouses:0,powerplants:0,observatories:0},upgrades:['pulse-1'],achievements:['clicks-100'],lifetime:80000,cycleEarned:80000,harvested:0,gathered:0,challenges:0,perfect:0,rounds:0,prestige:0,tokens:0,cycles:0,permanent:[]}};
 db.db.prepare('INSERT INTO game_player VALUES(1,?,?,?)').run(123,456,JSON.stringify(state));db.db.prepare('INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,?)').run('legacy-fixture','Fixture v5',123,456,'{}',1000000,3);db.close();db=new Store(dir);let game=new Game(db,()=>1000000);
 try{
  const migrated=game.get();assert.equal(migrated.coins,123);assert.equal(migrated.xp,456);assert.equal(migrated.economy.prestigeGain,2);assert.ok(migrated.economy.upgrades.includes('pulse-1'));assert.equal(db.db.prepare("SELECT rule_version FROM game_ledger WHERE source='legacy-fixture'").get()!.rule_version,3);
  const old=game.act({operationId:randomUUID(),action:{kind:'prestige',expectedCycles:0,expectedGain:2}}).state;assert.equal(old.economy.prestige,2);assert.equal(old.economy.prestigeGain,0);assert.equal(old.xp,456);
  const huge='1'+'0'.repeat(100);db.db.prepare('UPDATE game_player SET coins=?').run(huge);game.act({operationId:randomUUID(),action:{kind:'core-click',count:1}});assert.equal(game.get().coins,add(huge,1),'o novo ciclo zera as melhorias de clique; o saldo enorme soma 1 exato');
  const saved=game.get();db.close();db=new Store(dir);game=new Game(db,()=>1000000);assert.deepEqual(game.get(),saved);assert.equal(db.db.prepare('PRAGMA user_version').get()!.user_version,8);
  assert.equal(PRODUCERS.length,16);assert.equal(UPGRADES.length+PERMANENT.length,313);assert.equal(ACHIEVEMENTS.filter(a=>a.secret).length,20);assert.ok(ACHIEVEMENTS.filter(a=>!a.secret).length>=250);assert.equal(BALANCE.version,3);
 }finally{db.close();}
});

test('retorno com relógio realista: resto de milissegundo não é cap e o relatório inclui descobertas da transação',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/deep-return-')),db=new Store(dir);let now=1000000;const game=new Game(db,()=>now++ ,()=>0);
 try{
  game.act({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:1}});now+=8*3600000+123;
  const returned=game.get(),report=returned.economy.returnReport!;assert.equal(report.capped,false);assert.ok(report.milestones>0);assert.ok(report.producedMs!<=report.elapsedMs);
  const next=game.get().economy.returnReport!;assert.deepEqual(next,report,'consultar não altera descobertas registradas no retorno');
 }finally{db.close();}
});
