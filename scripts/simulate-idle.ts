import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/main/store';
import {Game} from '../src/main/game';
import {UPGRADES} from '../src/shared/economy';
import {dec,type Amount} from '../src/shared/amount';
import type {GameAction,GameState} from '../src/shared/game';

// GAM-06 balance model: the real Game + SQLite from an empty profile, driven by a controlled main clock.
// active: an attentive player who clicks 4 times/s, keeps the garden planted with Trigo-luz, fills the
//   Council seats once, catches every Lampejo and buys the cheapest affordable useful item at once.
// idle: leaves the city on screen and only buys. Both are formula models, not human playtime or retention.
// The "before" run of GAM-06 used the previous rules (motor, gather, signals); its JSON is kept as evidence.
const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8)??'after';
const minutes=Number(process.argv.find(a=>a.startsWith('--minutes='))?.slice(10)??60);
const mode=process.argv.find(a=>a.startsWith('--mode='))?.slice(7)==='idle'?'idle':'active';
const out=path.resolve('.local/evidence/gam-06');fs.mkdirSync(out,{recursive:true});
const dir=fs.mkdtempSync(path.resolve('.local/idle-sim-')),db=new Store(dir),start=Date.UTC(2026,9,23,13);let now=start;
const game=new Game(db,()=>now,()=>.5);
type Purchase={second:number;kind:string;id:string;cost:Amount;ratePerSecond:number};
const purchases:Purchase[]=[],samples:{second:number;coins:number;ratePerSecond:number;clickGain:number;lifetime:number}[]=[];
let clickIncome=0,passiveIncome=0,otherIncome=0,clicks=0,events=0,prestigeAt:number|null=null;
// A decision is a choice that changes how the city grows: an upgrade, a new family, a Lampejo, a Council seat.
const decisions:{second:number;what:string}[]=[];
const act=(action:GameAction)=>game.act({operationId:randomUUID(),action});
const coins=(s:GameState)=>dec(s.coins).toNumber();
const rate=(s:GameState)=>dec(s.economy.rate).div(60).toNumber();
function tryAct(action:GameAction){try{return act(action);}catch{return null;}}
const cost=new Map(UPGRADES.map(u=>[u.id,dec(u.cost).toNumber()]));
try{
 let s=game.get({watching:true});
 for(let second=0;second<minutes*60;second++){
  now+=1000;const before=coins(s);s=game.get({watching:true});passiveIncome+=Math.max(0,coins(s)-before);
  if(mode==='active'){
   const r=tryAct({kind:'core-click',count:4});if(r){clickIncome+=dec(r.state.engine.lastGain??0).toNumber();clicks+=4;s=r.state;}
   const c0=coins(s);
   if(s.flash){const caught=tryAct({kind:'flash-catch',id:s.flash.id});if(caught){s=caught.state;events++;decisions.push({second,what:'lampejo'});}}
   if(s.garden.unlocked)for(const plot of s.plots){if(plot.crop&&now>=plot.readyAt){const h=tryAct({kind:'harvest',plot:plot.id});if(h)s=h.state;}else if(!plot.crop&&dec(s.coins).gte(dec(s.garden.seedCost).mul(4))){const p=tryAct({kind:'plant',plot:plot.id,crop:'wheat'});if(p)s=p.state;}}
   if(s.council.unlocked)(['extended-shift','short-route','watchful-sky'] as const).forEach((policy,seat)=>{if(!s.council.seats[seat]&&s.council.deliberations>0){const c=tryAct({kind:'council-seat',seat,policy});if(c){s=c.state;decisions.push({second,what:'conselho'});}}});
   otherIncome+=Math.max(0,coins(s)-c0);
  }
  for(let guard=0;guard<20;guard++){
   const options:{action:GameAction;kind:string;id:string;cost:number}[]=[];
   for(const p of s.economy.producersView)if(p.unlocked)options.push({action:{kind:'producer-buy',producer:p.id,quantity:1},kind:'producer',id:p.id,cost:dec(p.cost).toNumber()});
   for(const u of s.economy.upgradesView)if(u.unlocked&&!u.owned)options.push({action:{kind:'economy-upgrade',id:u.id},kind:'upgrade',id:u.id,cost:cost.get(u.id)!});
   const best=options.filter(o=>o.cost<=coins(s)).sort((a,b)=>a.cost-b.cost)[0];if(!best)break;
   const firstOfFamily=best.kind==='producer'&&!s.economy.producers[best.id];const r=tryAct(best.action);if(!r)break;s=r.state;if(best.kind==='upgrade'||firstOfFamily)decisions.push({second,what:best.id});purchases.push({second,kind:best.kind,id:best.id,cost:best.cost,ratePerSecond:rate(s)});
  }
  if(prestigeAt===null&&dec(s.economy.prestigeGain).gte(1))prestigeAt=second;
  if(second%10===0)samples.push({second,coins:coins(s),ratePerSecond:rate(s),clickGain:dec(s.engine.power).toNumber(),lifetime:dec(s.economy.lifetime).toNumber()});
 }
 const gaps=purchases.map((p,i)=>p.second-(i?purchases[i-1].second:0));
 const windows=[[0,10],[10,30],[30,60],[60,120],[120,240],[240,480]].filter(([a])=>a<minutes).map(([a,b])=>{const inWindow=purchases.filter(p=>p.second>=a*60&&p.second<b*60),g=inWindow.map(p=>gaps[purchases.indexOf(p)]).sort((x,y)=>x-y);return{window:`${a}-${b} min`,purchases:inWindow.length,perTenMinutes:+(inWindow.length/((Math.min(b,minutes)-a)/10)).toFixed(1),medianGapSeconds:g.length?g[Math.floor(g.length/2)]:null,maxGapSeconds:g.length?g.at(-1):null};});
 const early=purchases.filter(p=>p.second<30*60).map(p=>gaps[purchases.indexOf(p)]);
 const decisionGaps=decisions.map((d,i)=>d.second-(i?decisions[i-1].second:0)),firstHalf=decisions.map((d,i)=>({...d,gap:decisionGaps[i]})).filter(d=>d.second<30*60).map(d=>d.gap).sort((a,b)=>a-b);
 const decisionSummary={first30:{count:firstHalf.length,medianGapSeconds:firstHalf.length?firstHalf[Math.floor(firstHalf.length/2)]:null,maxGapSeconds:firstHalf.length?firstHalf.at(-1):null},total:decisions.length};
 const report={label,mode,at:new Date().toISOString(),minutes,model:mode==='active'?'Game real + SQLite, relógio controlado; 4 cliques/s; Trigo-luz plantado quando o saldo cobre 4 sementes; Conselho preenchido uma vez; todo Lampejo pego; compra o item útil mais barato que couber no saldo. Modelo de fórmula, não tempo humano.':'Game real + SQLite, relógio controlado; cidade na tela, sem cliques nem minijogos; compra o item útil mais barato que couber no saldo. Modelo de fórmula, não tempo humano.',
  firstPurchaseSeconds:purchases[0]?.second??null,purchases:purchases.length,windows,decisions:decisionSummary,decisionLog:decisions,longestGapFirst30:early.length?Math.max(...early):null,prestigeAtSeconds:prestigeAt,clicks,events,income:{click:Math.round(clickIncome),passive:Math.round(passiveIncome),other:Math.round(otherIncome)},final:{coins:coins(s),ratePerSecond:rate(s),lifetime:s.economy.lifetime,clickGain:s.engine.power,prestigeGain:s.economy.prestigeGain},purchaseLog:purchases,samples};
 fs.writeFileSync(path.join(out,`simulation-${label}-${mode}.json`),JSON.stringify(report,null,2));
 console.log(JSON.stringify({mode,firstPurchaseSeconds:report.firstPurchaseSeconds,purchases:report.purchases,decisions:decisionSummary,windows,longestGapFirst30:report.longestGapFirst30,prestigeAtSeconds:prestigeAt,clicks,events,income:report.income,final:report.final},null,2));
}finally{db.close();}
