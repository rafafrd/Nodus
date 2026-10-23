import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/main/store';
import {Game} from '../src/main/game';
import {dec,type Amount} from '../src/shared/amount';
import type {GameAction,GameState} from '../src/shared/game';

// GAM-06 audit: the real Game + SQLite from an empty profile, driven by a controlled main clock.
// Player model (documented in GAME_DESIGN.md): an attentive player who clicks 4 times/s whenever a
// click pays, keeps the other free actions going, and buys the cheapest affordable useful item
// as soon as it can. It is a formula model, not human playtime or retention.
const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8)??'before';
const minutes=Number(process.argv.find(a=>a.startsWith('--minutes='))?.slice(10)??60);
// active: the attentive player above; idle: never clicks or collects, only buys (the player who leaves the city open).
const mode=process.argv.find(a=>a.startsWith('--mode='))?.slice(7)==='idle'?'idle':'active';
const out=path.resolve('.local/evidence/gam-06');fs.mkdirSync(out,{recursive:true});
const dir=fs.mkdtempSync(path.resolve('.local/idle-sim-')),db=new Store(dir),start=Date.UTC(2026,9,23,13);let now=start;
const game=new Game(db,()=>now,()=>.5);
type Purchase={second:number;kind:string;id:string;cost:Amount;ratePerSecond:number};
const purchases:Purchase[]=[],samples:{second:number;coins:number;ratePerSecond:number;clickGain:number}[]=[];
let clickIncome=0,passiveIncome=0,otherIncome=0,clicks=0,events=0;
const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
const coins=(s:GameState)=>dec(s.coins).toNumber();
const rate=(s:GameState)=>dec(s.economy.rate).div(60).toNumber();
function tryAct(action:GameAction){try{return act(action);}catch{return null;}}
try{
 let s=game.get();
 for(let second=0;second<minutes*60;second++){
  const before=coins(s);
  // Passive income is whatever arrived since the last step before any action.
  s=game.get();passiveIncome+=Math.max(0,coins(s)-before);
  if(mode==='idle')now+=1000;else{
  // 1. Clicks that pay.
  for(let i=0;i<4;i++){if(dec(s.engine.power).lte(0))break;const r=tryAct({kind:'engine-click'});if(!r)break;clickIncome+=dec(r.state.engine.lastGain??0).toNumber();clicks++;s=r.state;now+=250;}
  if(dec(s.engine.power).lte(0))now+=1000; // the second still passes when there is nothing to click
  // 2. Free actions that keep paying.
  const c0=coins(s);
  for(const plot of s.plots){if(plot.crop&&now>=plot.readyAt){const r=tryAct({kind:'harvest',plot:plot.id});if(r)s=r.state;}else if(!plot.crop&&coins(s)>=10){const r=tryAct({kind:'plant',plot:plot.id,crop:'wheat'});if(r)s=r.state;}}
  if(dec(s.engine.power).lte(0)&&now-s.gatheredAt>=1500){const r=tryAct({kind:'gather',resource:second%2?'wood':'stone'});if(r)s=r.state;}
  for(const signal of s.economy.signals){const r=tryAct({kind:'activate-signal',id:signal.id});if(r){s=r.state;events++;}}
  otherIncome+=Math.max(0,coins(s)-c0);}
  // 3. Cheapest affordable useful purchase, repeated while something is affordable.
  for(let guard=0;guard<20;guard++){
   const options:{action:GameAction;kind:string;id:string;cost:number}[]=[];
   for(const p of s.economy.producersView)if(p.unlocked)options.push({action:{kind:'producer-buy',producer:p.id,quantity:1},kind:'producer',id:p.id,cost:dec(p.cost).toNumber()});
   for(const u of s.economy.upgradesView)if(u.unlocked&&!u.owned){const cost=Number((await import('../src/shared/economy')).UPGRADES.find(x=>x.id===u.id)!.cost);options.push({action:{kind:'economy-upgrade',id:u.id},kind:'upgrade',id:u.id,cost});}
   if(mode==='active'&&s.engine.upgradeCost!==null)options.push({action:{kind:'engine-upgrade'},kind:'engine',id:'engine',cost:s.engine.upgradeCost});
   if(!s.owned.includes('windmill'))options.push({action:{kind:'buy',item:'windmill'},kind:'shop',id:'windmill',cost:75});
   const best=options.filter(o=>o.cost<=coins(s)).sort((a,b)=>a.cost-b.cost)[0];if(!best)break;
   const r=tryAct(best.action);if(!r)break;s=r.state;purchases.push({second,kind:best.kind,id:best.id,cost:best.cost,ratePerSecond:rate(s)});
  }
  if(second%10===0)samples.push({second,coins:coins(s),ratePerSecond:rate(s),clickGain:dec(s.engine.power).toNumber()});
 }
 const gaps=purchases.map((p,i)=>p.second-(i?purchases[i-1].second:0));
 const windows=[[0,10],[10,30],[30,60]].filter(([a])=>a<minutes).map(([a,b])=>{const inWindow=purchases.filter(p=>p.second>=a*60&&p.second<b*60),g=inWindow.map(p=>gaps[purchases.indexOf(p)]).sort((x,y)=>x-y);return{window:`${a}-${b} min`,purchases:inWindow.length,perTenMinutes:+(inWindow.length/((b-a)/10)).toFixed(1),medianGapSeconds:g.length?g[Math.floor(g.length/2)]:null,maxGapSeconds:g.length?g.at(-1):null};});
 const longest=gaps.reduce((m,g,i)=>g>m.gap?{gap:g,endsAt:purchases[i].second}:m,{gap:0,endsAt:0});
 const report={label,mode,at:new Date().toISOString(),minutes,model:'Game real + SQLite, relógio controlado; 4 cliques/s quando o clique paga; plantio/colheita de trigo, coleta a cada 1,5 s quando o motor zera, sinais ativados ao aparecer; compra o item útil mais barato que couber no saldo. Modelo de fórmula, não tempo humano.',
  firstPurchaseSeconds:purchases[0]?.second??null,purchases:purchases.length,windows,longestGap:longest,clicks,events,income:{click:Math.round(clickIncome),passive:Math.round(passiveIncome),other:Math.round(otherIncome)},final:{coins:coins(s),ratePerSecond:rate(s),lifetime:s.economy.lifetime,clickGain:s.engine.power,clickBudgetRemaining:s.engine.remaining},purchaseLog:purchases,samples};
 fs.writeFileSync(path.join(out,`simulation-${label}-${mode}.json`),JSON.stringify(report,null,2));
 console.log(JSON.stringify({firstPurchaseSeconds:report.firstPurchaseSeconds,purchases:report.purchases,windows,longestGap:longest,clicks,events,income:report.income,final:report.final},null,2));
}finally{db.close();}
