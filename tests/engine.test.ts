import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { type GameAction } from '../src/shared/game';

test('motor real: potência/upgrade, cliques consecutivos, replay, insuficiência e perfil v2 conservados', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/engine-')); let db = new Store(dir), now = 1000, game = new Game(db, () => now);
  const act = (action: GameAction) => game.act({ operationId: randomUUID(), action });
  try {
    const pulse = { operationId: randomUUID(), action: { kind: 'engine-click' as const } }; assert.equal(game.act(pulse).state.coins, 61); assert.equal(game.act(pulse).state.coins, 61);
    assert.equal(act({ kind: 'engine-click' }).state.coins, 62); assert.equal(game.get().engine.clicks, 2);
    assert.equal(act({ kind: 'engine-upgrade' }).state.coins, 37); const next = act({ kind: 'engine-click' }).state; assert.equal(next.coins, 40); assert.equal(next.engine.power, 3);
    assert.throws(() => act({ kind: 'engine-upgrade' }), /suficientes/); assert.equal(game.get().engine.level, 1);
    for (let i = 0; i < 7; i++) { act({ kind: 'engine-click' }); } assert.equal(game.get().xp, 1);
    db.close(); db = new Store(dir); game = new Game(db, () => now); assert.equal(game.get().engine.clicks, 10); assert.equal(game.get().coins, 61);
    // Explicit artificial legacy-row fixture, not an integration earning proof.
    const row = db.db.prepare('SELECT state FROM game_player').get()!; const legacy = JSON.parse(String(row.state)); delete legacy.engine; delete legacy.challengeId;
    db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(legacy)); const preserved = game.get(); assert.equal(preserved.coins, 61); assert.equal(preserved.xp, 1); assert.equal(preserved.engine.level, 0);
  } finally { db.close(); }
});

test('Oficina contínua: 36 etapas, três fases, clock autoritativo, pausa, replay e rollback', () => {
  const dir=fs.mkdtempSync(path.resolve('.local/challenge-')),db=new Store(dir);let now=1000;const game=new Game(db,()=>now);
  const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
  try {
    let c=act({kind:'start-challenge',game:'qte',pace:'normal'}).state.challenge!;
    const start=now,initialWindow=c.stepMs;assert.equal(c.sequence.length,36);
    assert.equal(act({kind:'start-challenge',game:'skillcheck',pace:'normal'}).state.challenge!.id,c.id);
    assert.throws(()=>act({kind:'qte-input',challengeId:c.id,key:c.sequence[0]}),/Aguarde/);
    act({kind:'pause-challenge',challengeId:c.id});now+=60000;assert.equal(game.get().challenge!.stage,0);assert.equal(game.get().challenge!.status,'paused');
    c=act({kind:'resume-challenge',challengeId:c.id}).state.challenge!;
    for(let i=0;i<35;i++){c=game.get().challenge!;now=c.readyAt!+400;const next=act({kind:'qte-input',challengeId:c.id,key:c.sequence[c.stage]}).state.challenge!;assert.equal(next.readyAt,now);}
    c=game.get().challenge!;assert.ok(c.stepMs<initialWindow);now=c.readyAt!+400;
    const finish={operationId:randomUUID(),action:{kind:'qte-input' as const,challengeId:c.id,key:c.sequence[c.stage]}};
    db.db.exec("CREATE TRIGGER challenge_failure BEFORE UPDATE ON game_challenges BEGIN SELECT RAISE(ABORT,'forced rollback'); END;");assert.throws(()=>game.act(finish),/rollback/);assert.equal(game.get().challenge!.stage,35);assert.equal(game.get().coins,60);db.db.exec('DROP TRIGGER challenge_failure');
    const result=game.act(finish).state;assert.equal(result.challenge!.status,'completed');assert.equal(result.challenge!.hits,36);assert.equal(result.challenge!.coins,300);assert.equal(result.xp,60);assert.equal(game.act(finish).state.coins,result.coins);assert.equal(result.economy.challenges,1);assert.equal(result.economy.perfect,1);
    assert.ok(now-start-60000>=3500&&now-start-60000<60000);
    assert.equal(db.db.prepare('SELECT count(*) n FROM game_ledger WHERE source=?').get(`challenge:${c.id}`)!.n,1);
    c=act({kind:'start-challenge',game:'skillcheck',pace:'relaxed'}).state.challenge!;const skillStart=now,initialZone=c.zone;
    for(let i=0;i<36;i++){c=game.get().challenge!;now=c.readyAt!+c.targets[c.stage]/200*c.stepMs;act({kind:'skill-input',challengeId:c.id});}
    const skill=game.get();assert.equal(skill.challenge!.hits,36);assert.equal(skill.challenge!.coins,300);assert.ok(skill.challenge!.zone<initialZone);assert.ok(now-skillStart>=4500&&now-skillStart<90000);
    c=act({kind:'start-challenge',game:'qte',pace:'normal'}).state.challenge!;now=c.readyAt!+c.stepMs+1;assert.equal(game.get().challenge!.stage,1);assert.equal(game.get().challenge!.status,'active');
    for(let i=0;i<6;i++){c=game.get().challenge!;now=c.readyAt!;act({kind:'qte-input',challengeId:c.id,key:c.sequence[c.stage]==='A'?'D':'A'});}assert.equal(game.get().challenge!.status,'failed');
    assert.throws(()=>game.act({operationId:randomUUID(),action:{kind:'skill-input',challengeId:c.id,score:36}} as never));
  }finally{db.close();}
});

test('partida legada de três passos é retomada sem reset e conserva sua recompensa',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/legacy-challenge-')),db=new Store(dir);let now=1000;const game=new Game(db,()=>now);
 try{const start=game.act({operationId:randomUUID(),action:{kind:'start-challenge',game:'qte',pace:'normal'}}).state.challenge!;
 const old={...start,sequence:['A','S','D'],targets:[30,45,60],stepMs:2000};delete old.version;delete old.readyAt;db.db.prepare('UPDATE game_challenges SET state=? WHERE id=?').run(JSON.stringify(old),old.id);
 for(const key of ['A','S','D'] as const){now+=400;game.act({operationId:randomUUID(),action:{kind:'qte-input',challengeId:old.id,key}});}assert.equal(game.get().challenge!.coins,24);assert.equal(game.get().coins,84);
 }finally{db.close();}
});
