import { D, dec, integer, type Amount } from './amount';
import { BALANCE } from './economy-balance';
import { production, effectFactor } from './economy';
import type { Economy, EconomicContext } from './economy-types';
export type ActivityKind='focus'|'review'|'memory'|'office'|'harvest'|'gather';
// A common economic contract. Academic XP and scoring stay in their own domain.
export function activityReward(kind:ActivityKind,floor:Amount,e:Economy,c:EconomicContext,performance=1,units=1):Amount {
 const minutes=kind==='focus'?BALANCE.focusRateMinutes:kind==='review'?BALANCE.reviewRateMinutes:BALANCE.activeRateMinutes[kind];
 const specialization=kind==='focus'?c.build.focus:kind==='review'||kind==='memory'?c.build.review:c.build.practice;
 const consistency=1+Math.min(BALANCE.consistencyCap,e.study.streak*BALANCE.consistencyPerDay);
 const bonus=1+Math.min(BALANCE.maxBuildBonus,specialization*BALANCE.buildPerPoint);
 return integer(D.max(dec(floor),dec(production(e,c.millRate,c)).mul(minutes)).mul(performance).mul(units).mul(consistency).mul(bonus).mul(effectFactor('active',e,c)));
}
