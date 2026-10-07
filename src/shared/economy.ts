import { D, dec, amount, integer, sub, type Amount } from './amount';
import { BALANCE } from './economy-balance';
import { PRODUCERS, UPGRADES, PERMANENT, ACHIEVEMENTS, SIGNALS } from './economy-content';
import type { Economy, EconomicContext, Effect, Producer, Upgrade, Achievement, Metric, Breakdown, FamilyBreakdown } from './economy-types';
export { PRODUCERS, UPGRADES, PERMANENT, ACHIEVEMENTS, SIGNALS, BALANCE };
export type { Economy, Upgrade, Achievement };
export type ProducerId = string;
const definitions=new Map([...UPGRADES,...PERMANENT].map(u=>[u.id,u]));
const eligibleAchievements=new Set(ACHIEVEMENTS.filter(a=>a.eligible).map(a=>a.id));
export const emptyContext = (millRate=0):EconomicContext => ({clicks:0,level:0,millRate,build:{focus:0,review:0,planning:0,practice:0},now:0});
export const freshEconomy = (now=0):Economy => ({version:BALANCE.version,producers:Object.fromEntries(PRODUCERS.map(p=>[p.id,0])),upgrades:[],achievements:[],lifetime:0,cycleEarned:0,harvested:0,gathered:0,challenges:0,perfect:0,rounds:0,prestige:0,tokens:0,cycles:0,permanent:[],focusMinutes:0,reviews:0,studyDays:0,events:0,combos:0,memoryPerfect:0,study:{focus:{},reviewCursor:0,baselineAt:now,lastDay:'',streak:0,dayMinutes:0,dayReviews:0,builds:[]},signals:[],activeEvents:[],nextSignalAt:now+BALANCE.signalEveryMs,eventSerial:0,unlocks:[]});
export function normalizeEconomy(raw:Partial<Economy>,now:number):Economy {const defaults=freshEconomy(now);return {...defaults,...raw,version:BALANCE.version,producers:{...defaults.producers,...raw.producers},study:{...defaults.study,...raw.study}};}
export const producerTotal=(e:Economy)=>Object.values(e.producers).reduce((a,b)=>a+b,0);
export function metricValue(metric:Metric,e:Economy,c:EconomicContext,producer?:string):Amount {
  if(metric==='clicks')return c.clicks;
  if(metric==='engine')return c.level;
  if(metric==='index')return efficiencyIndex(e);
  if(metric==='producers')return producer?(e.producers[producer]??0):producerTotal(e);
  if(metric==='upgrades')return e.upgrades.length;
  if(metric==='families')return Object.values(e.producers).filter(Boolean).length;
  if(metric==='synergies')return UPGRADES.filter(u=>u.category==='synergy'&&e.upgrades.includes(u.id)).length;
  if(metric==='builds')return e.study.builds.length;
  return e[metric];
}
export function upgradeReady(u:Upgrade,e:Economy,clicks=0,level=0) {const c={...emptyContext(),clicks,level};return u.conditions.every(condition=>'owned' in condition?e.upgrades.includes(condition.owned)||e.permanent.includes(condition.owned):dec(metricValue(condition.metric,e,c,condition.producer)).gte(condition.target));}
export function effects(e:Economy,c:EconomicContext):{effect:Effect;meta:boolean;event:boolean}[] {
  const result:{effect:Effect;meta:boolean;event:boolean}[]=[];
  for(const id of [...e.upgrades,...e.permanent]){const u=definitions.get(id);if(u)for(const effect of u.effects)result.push({effect,meta:Boolean(u.permanent),event:false});}
  for(const instance of e.activeEvents)if((instance.endsAt??0)>c.now){const signal=SIGNALS.find(s=>s.id===instance.type);if(signal)for(const effect of signal.effects)result.push({effect:signal.family&&instance.producer?{...effect,producer:instance.producer} as Effect:effect,meta:false,event:true});}
  return result;
}
export function effectFactor(kind:Effect['kind'],e:Economy,c=emptyContext(),producer?:string) {return effects(e,c).reduce((factor,{effect})=>effect.kind===kind&&'factor' in effect&&(!effect.producer||effect.producer===producer)?factor.mul(effect.factor):factor,new D(1));}
export function efficiencyIndex(e:Economy) {return e.achievements.filter(id=>eligibleAchievements.has(id)).length;}
export function breakdown(e:Economy,c=emptyContext(),catalog=PRODUCERS):Breakdown {
  const applied=effects(e,c),synergyBoost=applied.reduce((value,{effect})=>effect.kind==='synergyBoost'?value.mul(effect.factor):value,new D(1));let base=new D(c.millRate),specialized=new D(c.millRate),linked=new D(c.millRate);
  const families:FamilyBreakdown[]=catalog.map(p=>{
    const count=e.producers[p.id]??0,b=dec(p.rate).mul(count);let tier=new D(1),synergy=new D(1);const partners:string[]=[];
    for(const {effect} of applied){
      if(effect.kind==='production'&&effect.producer===p.id)tier=tier.mul(effect.factor);
      if(effect.kind==='perUnit'&&effect.producer===p.id)tier=tier.mul(new D(1).plus(new D(effect.perUnit).mul(count)));
      if(effect.kind==='synergy'&&effect.producer===p.id){synergy=synergy.mul(new D(1).plus(new D(effect.perUnit).mul(e.producers[effect.other]??0).mul(synergyBoost)));partners.push(effect.other);}
    }
    const value=b.mul(tier).mul(synergy);base=base.plus(b);specialized=specialized.plus(b.mul(tier));linked=linked.plus(value);
    return{id:p.id,base:amount(b),tiers:amount(tier),synergy:amount(synergy),total:amount(value),individual:count?amount(value.div(count)):0,share:0,level:BALANCE.visualMilestones.filter(n=>count>=n).length,activeUpgrades:e.upgrades.filter(id=>definitions.get(id)?.producer===p.id),partners};
  });
  const achievement=new D(1).plus(new D(efficiencyIndex(e)).mul(BALANCE.achievementPerIndex).mul(effectFactor('achievement',e,c)));
  const build=new D(1).plus(Math.min(BALANCE.maxBuildBonus,c.build.focus*BALANCE.buildPerPoint));
  let global=new D(1),event=new D(1),meta=new D(1).plus(dec(e.prestige).mul(BALANCE.prestigeBonus));
  for(const {effect,meta:isMeta,event:isEvent} of applied)if(effect.kind==='production'&&!effect.producer){if(isMeta)meta=meta.mul(effect.factor);else if(isEvent)event=event.mul(effect.factor);else global=global.mul(effect.factor);}
  const multiplier=achievement.mul(build).mul(global).mul(event).mul(meta),final=linked.mul(multiplier);
  for(const family of families){family.total=amount(dec(family.total).mul(multiplier));family.individual=amount(dec(family.individual).mul(multiplier));family.share=final.isZero()?0:dec(family.total).div(final).mul(100).toNumber();}
  const tierFactor=base.isZero()?new D(1):specialized.div(base),synergyFactor=specialized.isZero()?new D(1):linked.div(specialized);
  return{families,base:amount(base),specialized:amount(specialized),synergy:amount(synergyFactor),achievement:amount(achievement),build:amount(build),global:amount(global),event:amount(event),meta:amount(meta),final:amount(final),layers:[{name:'Especializações',factor:amount(tierFactor)},{name:'Sinergias',factor:amount(synergyFactor)},{name:'Índice de descoberta',factor:amount(achievement)},{name:'Build de Foco',factor:amount(build)},{name:'Rede global',factor:amount(global)},{name:'Sinais ativos',factor:amount(event)},{name:'Legado',factor:amount(meta)}]};
}
export function production(e:Economy,millRate:number,c=emptyContext(millRate)):Amount { return breakdown(e,c).final; }
export function costFactor(e:Economy,c=emptyContext(),producer?:string) {return effectFactor('cost',e,c,producer).mul(1-Math.min(.2,c.build.planning*.01));}
export function producerCost(p:Producer,e:Economy,quantity=1,c=emptyContext()):Amount {
  if(!Number.isSafeInteger(quantity)||quantity<0||(e.producers[p.id]??0)+quantity>BALANCE.maxUnits)throw new Error('Quantidade econômica inválida.');
  const owned=e.producers[p.id]??0,g=dec(p.growth),base=dec(p.base).mul(costFactor(e,c,p.id));
  // Cumulative rounded costs telescope exactly across split lots.
  const cumulative=(n:number)=>integer(base.mul(g.pow(n).minus(1)).div(g.minus(1)).ceil());
  return sub(cumulative(owned+quantity),cumulative(owned));
}
export function maxAffordable(p:Producer,e:Economy,balance:Amount,c=emptyContext()):number {
  let low=0,high=BALANCE.maxUnits-(e.producers[p.id]??0);
  while(low<high){const mid=Math.ceil((low+high)/2);if(dec(producerCost(p,e,mid,c)).lte(balance))low=mid;else high=mid-1;}
  return low;
}
export function pulseMultiplier(e:Economy) {return Math.min(BALANCE.pulseMaximum,effectFactor('pulse',e).toNumber());}
export const prestigeGain=(e:Economy):Amount=>integer(D.max(0,dec(e.lifetime).div(BALANCE.prestigeBase).pow(BALANCE.prestigeExponent).floor().minus(dec(e.prestige).minus(e.legacyPrestige??0))).plus(e.legacyCredit??0));
export const nextPrestigeAt=(e:Economy):Amount=>amount(dec(e.prestige).minus(e.legacyPrestige??0).plus(prestigeGain(e)).minus(e.legacyCredit??0).plus(1).pow(2).mul(BALANCE.prestigeBase));
export function achievementProgress(a:Achievement,e:Economy,clicks=0):Amount {return metricValue(a.metric,e,{...emptyContext(),clicks},a.producer);}
export function achievementReady(a:Achievement,e:Economy,c:EconomicContext) {
  if(dec(metricValue(a.metric,e,c,a.producer)).lt(a.target))return false;
  switch(a.condition){
    case 'all-builds':return e.study.builds.length>=4;
    case 'full-network':return PRODUCERS.every(p=>(e.producers[p.id]??0)>0);
    case 'no-pulse':return c.clicks===0;
    case 'comeback':return (e.returnReport?.elapsedMs??0)>=24*3600000;
    case 'symmetric':return new Set(Object.values(e.producers).filter(Boolean)).size===1&&Object.values(e.producers).filter(Boolean).length>=4;
    case 'late-night':return new Date(c.now).getHours()<5;
    case 'two-events':return e.activeEvents.length>=2;
    case 'many-discounts':return effectFactor('cost',e,c).lte(.65);
    case 'clean-run':return e.perfect>=5&&e.challenges===e.perfect;
    case 'old-and-new':return (e.producers[PRODUCERS[0].id]??0)>=100&&(e.producers[PRODUCERS.at(-1)!.id]??0)>=1;
    default:return true;
  }
}
export type EconomyView = Economy & {rate:Amount;multiplier:Amount;prestigeGain:Amount;nextPrestigeAt:Amount;offlineDays:number;index:number;breakdown:Breakdown;focusActive:boolean;activityQuotes:{gather:Amount;focusMinute:Amount;review:Amount};
  producersView:{id:string;count:number;cost:Amount;cost10:Amount;cost100:Amount;max:number;costMax:Amount;unlocked:boolean;rate:Amount;share:number;level:number;individual:Amount;activeUpgrades:string[];partners:string[]}[];
  upgradesView:{id:string;owned:boolean;unlocked:boolean}[];achievementsView:{id:string;unlocked:boolean;progress:Amount}[]};
