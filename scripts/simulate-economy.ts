import fs from 'node:fs';
import { D, dec, amount, integer, add, sub, type Amount } from '../src/shared/amount';
import { PRODUCERS, UPGRADES, ACHIEVEMENTS, freshEconomy, emptyContext, producerCost, breakdown, upgradeReady, achievementReady, prestigeGain, BALANCE } from '../src/shared/economy';
import { activityReward } from '../src/shared/economic-activities';
export function simulate(studyMinutes=45,days=7) {
 const e=freshEconomy(),c=emptyContext();let balance:Amount=60,carry=new D(0);const marks:Record<string,number>={},checkpoints:unknown[]=[];
 const earn=(value:Amount)=>{balance=add(balance,value);e.lifetime=add(e.lifetime,value);e.cycleEarned=add(e.cycleEarned,value);};
 const record=(name:string,minute:number)=>{marks[name]??=minute;};
 for(let minute=0;minute<=days*1440;minute++){
  c.now=minute*60000;const rate=dec(breakdown(e,c).final);if(minute){const earned=rate.plus(carry);earn(integer(earned));carry=earned.mod(1);}
  const active=minute>0&&(minute-1)%1440<studyMinutes;
  if(active){
   const day=String(Math.floor((minute-1)/1440));if(e.study.lastDay!==day){e.study.lastDay=day;e.study.dayMinutes=0;}
   e.focusMinutes++;e.study.dayMinutes++;
   if(e.study.dayMinutes===BALANCE.consistencyThresholdMinutes){e.study.streak++;e.studyDays++;}
   earn(activityReward('focus',BALANCE.focusFloorPerMinute,e,c));
  }
  for(const a of ACHIEVEMENTS)if(!e.achievements.includes(a.id)&&achievementReady(a,e,c))e.achievements.push(a.id);
  if(active||minute===0){
   // Greedy positive marginal ROI; no clicking, no perfect future knowledge.
   for(let purchase=0;purchase<6;purchase++){
    const current=dec(breakdown(e,c).final);let best:{kind:'producer'|'upgrade';id:string;cost:Amount;roi:ReturnType<typeof dec>}|undefined;
    const consider=(kind:'producer'|'upgrade',id:string,cost:Amount,gain:Amount)=>{if(dec(cost).lte(balance)&&dec(gain).gt(0)){const roi=dec(cost).div(gain);if(!best||roi.lt(best.roi))best={kind,id,cost,roi};}};
    for(const p of PRODUCERS){if(dec(e.lifetime).lt(p.unlock)||(e.producers[p.id]??0)>=BALANCE.maxUnits)continue;const cost=producerCost(p,e);if(dec(cost).gt(balance))continue;e.producers[p.id]++;const gain=amount(dec(breakdown(e,c).final).minus(current));e.producers[p.id]--;consider('producer',p.id,cost,gain);}
    for(const u of UPGRADES){if(e.upgrades.includes(u.id)||!upgradeReady(u,e)||dec(u.cost).gt(balance))continue;e.upgrades.push(u.id);const gain=amount(dec(breakdown(e,c).final).minus(current));e.upgrades.pop();consider('upgrade',u.id,u.cost,gain);}
    if(!best)break;balance=sub(balance,best.cost);
    if(best.kind==='producer'){e.producers[best.id]++;record('first-installation',minute);if(best.id===PRODUCERS[1].id)record('second-family',minute);if(e.producers.collectors>=10)record('ten-first-family',minute);if(e.producers.collectors>=100)record('hundred-first-family',minute);}
    else {e.upgrades.push(best.id);if(UPGRADES.find(u=>u.id===best!.id)?.category==='tier')record('first-tier',minute);}
   }
  }
  if(dec(prestigeGain(e)).gte(1))record('first-prestige',minute);
  if([1,5,30,60,480,1440,10080].includes(minute))checkpoints.push({minute,studyMinutesPerDay:studyMinutes,balance,lifetime:e.lifetime,ratePerMinute:breakdown(e,c).final,units:Object.values(e.producers).reduce((a,b)=>a+b,0),families:Object.values(e.producers).filter(Boolean).length,upgrades:e.upgrades.length,prestigeGain:prestigeGain(e)});
 }
 const marginalROI=PRODUCERS.map(p=>{const old=dec(breakdown(e,c).final);e.producers[p.id]++;const gain=dec(breakdown(e,c).final).minus(old);e.producers[p.id]--;return{id:p.id,cost:producerCost(p,e),gainPerMinute:amount(gain),paybackMinutes:gain.gt(0)?amount(dec(producerCost(p,e)).div(gain)):null};});
 return{balanceVersion:BALANCE.version,model:'deterministic greedy ROI, one study session/day, no motor/events/reviews/prestige reset; formula model, not human playtime',studyMinutes,days,marks,checkpoints,marginalROI};
}
if(process.argv[1]?.endsWith('simulate-economy.ts')){
 fs.mkdirSync('.local/evidence',{recursive:true});const minutes=Number(process.argv[2]??45),result=simulate(minutes);fs.writeFileSync(`.local/evidence/balance-${minutes}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({studyMinutes:minutes,marks:result.marks,checkpoints:result.checkpoints},null,2));
}
