import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { Vault } from '../src/main/vault';
import { PRODUCERS, producerCost, BALANCE } from '../src/shared/economy';
import { dec } from '../src/shared/amount';
import { gameInput, type GameAction } from '../src/shared/game';

test('produção real: custo crescente, liquidação antes da compra, limite offline, replay, ledger e rollback',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/economy-'));let db=new Store(dir),now=1000000,game=new Game(db,()=>now);
 const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
 try{
  const buy={operationId:randomUUID(),action:{kind:'producer-buy' as const,producer:'collectors' as const,quantity:1 as const}};
  const first=game.act(buy).state;assert.equal(first.coins,5);assert.equal(first.economy.producers.collectors,1);
  const rate=Number(first.economy.rate);assert.ok(rate>=7.2&&rate<7.3,'Coletor: 7,2 por minuto antes do índice de descoberta');
  assert.equal(game.act(buy).replayed,true);assert.equal(game.get().economy.producers.collectors,1);
  assert.throws(()=>act({kind:'producer-buy',producer:'workshops',quantity:1}),/desbloquear/);
  assert.throws(()=>act({kind:'economy-upgrade',id:'collectors-2'}),/requisitos/);
  now+=30000;assert.equal(game.get().coins,5+Math.floor(30*rate/60));
  now+=10*24*3600000;const settled=game.get();assert.ok(Number(settled.coins)<=8+7*24*60*Number(settled.economy.rate)+1,'ausência rende no máximo 7 dias');assert.equal(settled.economy.returnReport!.capped,true);assert.equal(game.get().coins,settled.coins);
  const cost=producerCost(PRODUCERS[0],settled.economy,10),oldCoins=settled.coins;
  const many=act({kind:'producer-buy',producer:'collectors',quantity:10}).state;
  assert.equal(many.economy.producers.collectors,11);assert.equal(many.coins,Number(oldCoins)-Number(cost));
  act({kind:'economy-upgrade',id:'collectors-1'});assert.ok(Number(game.get().economy.rate)>Number(many.economy.rate)*1.9);
  assert.throws(()=>act({kind:'economy-upgrade',id:'collectors-1'}),/adquirida/);
  assert.throws(()=>act({kind:'economy-upgrade',id:'bogus'}),/desconhecida/);
  const passiveRows=Number(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'production:%'").get()!.n);for(let i=0;i<20;i++){now+=1000;game.get();}
  assert.ok(Number(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'production:%'").get()!.n)-passiveRows<=1,'20 liquidações compartilham no máximo um novo minuto de ledger');assert.equal(db.db.prepare('SELECT sum(coins) coins FROM game_ledger').get()!.coins,game.get().coins);
  const preserved=game.get();db.db.exec("CREATE TRIGGER reject_economy BEFORE INSERT ON audit_events WHEN NEW.action='game.producer-buy' BEGIN SELECT RAISE(ABORT,'forced economy rollback'); END");
  assert.throws(()=>act({kind:'producer-buy',producer:'collectors',quantity:1}),/rollback/);assert.deepEqual(game.get(),preserved);db.db.exec('DROP TRIGGER reject_economy');
  db.close();db=new Store(dir);game=new Game(db,()=>now);assert.deepEqual(game.get(),preserved);
  now-=60000;assert.equal(game.get().coins,preserved.coins,'relógio que volta não credita nem retira');
  assert.throws(()=>gameInput.parse({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:1000}}));
  assert.throws(()=>gameInput.parse({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:1,price:0}}));
 }finally{db.close();}
});

test('prestígio opcional e permanente: prévia, replay, rollback, restart, minijogos e fontes de estudo conservados',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/prestige-'));let db=new Store(dir),now=1000000,game=new Game(db,()=>now);const vaultRoot=path.join(dir,'vault');fs.mkdirSync(vaultRoot);
 const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
 try{
  const subject=db.createSubject({name:'Fonte preservada',color:'sage'}),vault=new Vault(db);vault.selectRoot(vaultRoot);const note=vault.create({subjectId:subject.id,title:'Nota original'});vault.draft({id:note.ref.id,hash:note.hash,text:note.text+'\nRascunho intacto.'});const original=fs.readFileSync(path.join(vaultRoot,note.ref.path));
  act({kind:'producer-buy',producer:'collectors',quantity:1});
  // Fixture: journey total and a few owned families set directly in the saved JSON.
  const fixtureState=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));fixtureState.economy.lifetime=BALANCE.prestigeBase;fixtureState.economy.producers.collectors=10;fixtureState.economy.producers.workshops=5;const fixtureCoins=Number(game.get().coins);db.db.prepare('UPDATE game_player SET coins=?,state=?').run('100000',JSON.stringify(fixtureState));db.db.prepare("INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES('fixture','Fixture',?,0,'{}',?,5)").run(String(100000-fixtureCoins),now);
  act({kind:'plant',plot:1,crop:'dew'});act({kind:'council-seat',seat:0,policy:'short-route'});act({kind:'skin',value:'cyberpunk'});
  const old=game.get();assert.equal(old.economy.prestigeGain,1);assert.ok(old.economy.achievements.length>=2);assert.ok(old.owned.includes('fields'),'marcos da vila acompanham o total produzido');
  assert.throws(()=>act({kind:'prestige',expectedCycles:0,expectedGain:99}),/ganho mudou/);assert.deepEqual(game.get(),old);
  const prestige={operationId:randomUUID(),action:{kind:'prestige' as const,expectedCycles:0,expectedGain:1}};
  db.db.exec("CREATE TRIGGER reject_prestige BEFORE INSERT ON audit_events WHEN NEW.action='game.prestige' BEGIN SELECT RAISE(ABORT,'forced prestige rollback'); END");assert.throws(()=>game.act(prestige),/rollback/);assert.deepEqual(game.get(),old);db.db.exec('DROP TRIGGER reject_prestige');
  const next=game.act(prestige).state;assert.equal(next.coins,0);assert.equal(next.economy.prestige,1);assert.equal(next.economy.tokens,1);assert.equal(next.economy.producers.collectors,0);assert.equal(next.economy.prestigeGain,0);assert.equal(next.xp,old.xp);assert.deepEqual(next.owned,old.owned);assert.deepEqual(next.plots,old.plots);assert.deepEqual(next.council.seats,old.council.seats);assert.equal(next.garden.unlocked,true);assert.equal(next.skin,'cyberpunk');assert.ok(old.economy.achievements.every(a=>next.economy.achievements.includes(a)));
  assert.equal(game.act(prestige).replayed,true);assert.equal(game.get().economy.prestige,1);
  act({kind:'permanent-upgrade',id:'legacy-tools'});assert.equal(game.get().economy.tokens,0);assert.equal(game.get().engine.power,2);
  assert.throws(()=>act({kind:'permanent-upgrade',id:'city-charter'}),/insígnias/);assert.throws(()=>act({kind:'permanent-upgrade',id:'legacy-tools'}),/adquirida/);
  const saved=game.get();db.close();db=new Store(dir);game=new Game(db,()=>now);assert.deepEqual(game.get(),saved);assert.deepEqual(fs.readFileSync(path.join(vaultRoot,note.ref.path)),original);assert.equal(new Vault(db).open(note.ref.id).draft!.text,note.text+'\nRascunho intacto.');assert.equal(db.requireSubject(subject.id).name,subject.name);
  assert.ok(dec(db.db.prepare('SELECT sum(coins) coins FROM game_ledger').get()!.coins as string).eq(game.get().coins));
 }finally{db.close();}
});
