import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { Vault } from '../src/main/vault';
import { PRODUCERS, producerCost, BALANCE } from '../src/shared/economy';
import { gameInput, type GameAction } from '../src/shared/game';

test('produção real: custo crescente, taxa antiga, limite offline, replay, cadeia e rollback',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/economy-'));let db=new Store(dir),now=1000000,game=new Game(db,()=>now);
 const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
 try{
  const buy={operationId:randomUUID(),action:{kind:'producer-buy' as const,producer:'collectors' as const,quantity:1 as const}};
  assert.equal(game.act(buy).state.coins,20);assert.equal(game.act(buy).state.economy.producers.collectors,1);assert.equal(game.get().economy.rate,3.006);
  assert.equal(game.act(buy).replayed,true);assert.equal(game.get().economy.producers.collectors,1);
  assert.throws(()=>act({kind:'producer-buy',producer:'workshops',quantity:1}),/desbloquear/);
  assert.throws(()=>act({kind:'economy-upgrade',id:'collectors-2'}),/requisitos/);
  now+=30000;assert.equal(game.get().coins,21);assert.equal(game.get().coins,21);
  for(let i=0;i<30;i++){now+=300;act({kind:'engine-click'});}const before=game.get();assert.ok(Number(before.coins)>=47);
  now+=10000;const next=act({kind:'producer-buy',producer:'collectors',quantity:1}).state;
  const earned=Number(db.db.prepare("SELECT sum(coins) n FROM game_ledger WHERE action='Produção automática da cidade'").get()?.n);
  assert.equal(earned,2,'tempo anterior à compra continua a 3 moedas/min');assert.equal(next.economy.rate,6.012);
  now+=10*24*3600000;const settled=game.get();assert.ok(Number(settled.coins)-Number(next.coins)<=7*24*60*Number(next.economy.rate)+1);assert.equal(game.get().coins,settled.coins);
  const rate=Number(game.get().economy.rate);const cost=producerCost(PRODUCERS[0],game.get().economy,10);const oldCoins=game.get().coins,carry=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state)).passiveCarry;
  now+=500;const many=act({kind:'producer-buy',producer:'collectors',quantity:10}).state;
  assert.equal(many.economy.producers.collectors,12);assert.equal(many.coins,Number(oldCoins)-Number(cost)+Math.floor((500*rate+carry)/60000));
  act({kind:'economy-upgrade',id:'collectors-1'});assert.ok(Number(game.get().economy.rate)>rate*2);
  assert.throws(()=>act({kind:'economy-upgrade',id:'collectors-1'}),/adquirida/);
  assert.throws(()=>act({kind:'economy-upgrade',id:'bogus'}),/desconhecida/);
  const passiveRows=Number(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'production:%'").get()!.n);for(let i=0;i<20;i++){now+=1000;game.get();}
  assert.ok(Number(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'production:%'").get()!.n)-passiveRows<=1,'20 liquidações compartilham no máximo um novo minuto de ledger');assert.equal(db.db.prepare('SELECT sum(coins) coins FROM game_ledger').get()!.coins,game.get().coins);
  const preserved=game.get();db.db.exec("CREATE TRIGGER reject_economy BEFORE INSERT ON audit_events WHEN NEW.action='game.producer-buy' BEGIN SELECT RAISE(ABORT,'forced economy rollback'); END");
  assert.throws(()=>act({kind:'producer-buy',producer:'collectors',quantity:1}),/rollback/);assert.deepEqual(game.get(),preserved);db.db.exec('DROP TRIGGER reject_economy');
  db.close();db=new Store(dir);game=new Game(db,()=>now);assert.deepEqual(game.get(),preserved);
  assert.throws(()=>gameInput.parse({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:1000}}));
  assert.throws(()=>gameInput.parse({operationId:randomUUID(),action:{kind:'producer-buy',producer:'collectors',quantity:1,price:0}}));
 }finally{db.close();}
});

test('prestígio opcional e permanente: prévia, replay, rollback, restart e fontes de estudo conservadas',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/prestige-'));let db=new Store(dir),now=1000000,game=new Game(db,()=>now);const vaultRoot=path.join(dir,'vault');fs.mkdirSync(vaultRoot);
 const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
 try{
  const subject=db.createSubject({name:'Fonte preservada',color:'sage'}),vault=new Vault(db);vault.selectRoot(vaultRoot);const note=vault.create({subjectId:subject.id,title:'Nota original'});vault.draft({id:note.ref.id,hash:note.hash,text:note.text+'\nRascunho intacto.'});const original=fs.readFileSync(path.join(vaultRoot,note.ref.path));
  act({kind:'producer-buy',producer:'collectors',quantity:1});now+=7*24*3600000;game.get();
  const fixtureState=JSON.parse(String(db.db.prepare('SELECT state FROM game_player').get()!.state));fixtureState.economy.lifetime=BALANCE.prestigeBase;db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(fixtureState));
  act({kind:'buy',item:'windmill'});act({kind:'buy',item:'cottage'});act({kind:'plant',plot:1,crop:'wheat'});act({kind:'gather',resource:'stone'});act({kind:'skin',value:'cyberpunk'});
  const old=game.get();assert.equal(old.economy.prestigeGain,1);assert.ok(old.economy.achievements.length>=2);
  assert.throws(()=>act({kind:'prestige',expectedCycles:0,expectedGain:99}),/ganho mudou/);assert.deepEqual(game.get(),old);
  const prestige={operationId:randomUUID(),action:{kind:'prestige' as const,expectedCycles:0,expectedGain:1}};
  db.db.exec("CREATE TRIGGER reject_prestige BEFORE INSERT ON audit_events WHEN NEW.action='game.prestige' BEGIN SELECT RAISE(ABORT,'forced prestige rollback'); END");assert.throws(()=>game.act(prestige),/rollback/);assert.deepEqual(game.get(),old);db.db.exec('DROP TRIGGER reject_prestige');
  const next=game.act(prestige).state;assert.equal(next.coins,0);assert.equal(next.economy.prestige,1);assert.equal(next.economy.tokens,1);assert.equal(next.economy.producers.collectors,0);assert.equal(next.economy.prestigeGain,0);assert.equal(next.xp,old.xp);assert.deepEqual(next.build,old.build);assert.deepEqual(next.owned,old.owned);assert.deepEqual(next.inventory,old.inventory);assert.deepEqual(next.plots,old.plots);assert.equal(next.skin,'cyberpunk');assert.ok(old.economy.achievements.every(a=>next.economy.achievements.includes(a)));
  assert.equal(game.act(prestige).replayed,true);assert.equal(game.get().economy.prestige,1);
  act({kind:'permanent-upgrade',id:'legacy-tools'});assert.equal(game.get().economy.tokens,0);assert.equal(game.get().engine.power,2);
  assert.throws(()=>act({kind:'permanent-upgrade',id:'city-charter'}),/insígnias/);assert.throws(()=>act({kind:'permanent-upgrade',id:'legacy-tools'}),/adquirida/);
  const saved=game.get();db.close();db=new Store(dir);game=new Game(db,()=>now);assert.deepEqual(game.get(),saved);assert.deepEqual(fs.readFileSync(path.join(vaultRoot,note.ref.path)),original);assert.equal(new Vault(db).open(note.ref.id).draft!.text,note.text+'\nRascunho intacto.');assert.equal(db.requireSubject(subject.id).name,subject.name);
  const ledger=db.db.prepare('SELECT sum(coins) coins FROM game_ledger').get();assert.equal(ledger!.coins,game.get().coins);
 }finally{db.close();}
});
