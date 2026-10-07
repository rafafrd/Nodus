import test from 'node:test';
import assert from 'node:assert/strict';
import { add, dec, amount } from '../src/shared/amount';
import { freshEconomy, PRODUCERS, producerCost, maxAffordable, breakdown, emptyContext, upgradeReady, UPGRADES } from '../src/shared/economy';
test('fatia de quatro famílias: lotes telescópicos/MAX, efeitos e saldo inteiro grande',()=>{
 const e=freshEconomy(),c=emptyContext();
 for(const p of PRODUCERS.slice(0,4)){
  e.producers[p.id]=17;const bulk=producerCost(p,e,100,c);let split:number|string=0;
  for(let i=0;i<100;i++){split=add(split,producerCost(p,e,1,c));e.producers[p.id]++;}
  assert.equal(String(split),String(bulk));e.producers[p.id]=17;
  assert.equal(maxAffordable(p,e,bulk,c),100);
  assert.equal(maxAffordable(p,e,amount(dec(bulk).minus(1)),c),99);
 }
 e.producers.collectors=25;const before=breakdown(e,c);assert.ok(upgradeReady(UPGRADES[0],e));e.upgrades.push('collectors-1');
 const after=breakdown(e,c);assert.equal(dec(after.families[0].total).div(before.families[0].total).toString(),'2');
 assert.ok(dec(after.final).gte(before.final));
 e.upgrades.push('link-collectors-1');const linked=breakdown(e,c);assert.ok(dec(linked.families[0].total).gt(after.families[0].total));
 e.activeEvents.push({id:'fixture-event',type:'alignment',foundAt:0,startedAt:0,endsAt:300000});assert.equal(dec(breakdown(e,c).final).div(linked.final).toString(),'3');e.activeEvents=[];
 e.achievements.push('lifetime-1000');assert.ok(dec(breakdown(e,c).achievement).gt(1));
 const large=producerCost(PRODUCERS[0],{...e,producers:{...e.producers,collectors:9000}},1000,c);assert.ok(typeof large==='string');assert.ok(dec(large).isFinite());
 assert.equal(add('1'+'0'.repeat(100),1),'1'+'0'.repeat(99)+'1');
 const custom={...PRODUCERS[0],id:'seventeenth',base:'1e50',rate:'1e40'};
 e.producers.seventeenth=100;assert.equal(dec(breakdown({...e,achievements:[]},c,[custom]).final).toString(),'1e+42');
});
