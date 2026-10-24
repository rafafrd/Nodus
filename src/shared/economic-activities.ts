import { D, dec, integer, type Amount } from './amount';
import { production, effectFactor } from './economy';
import type { Economy, EconomicContext } from './economy-types';
/** Minigame rewards measured in minutes of production. Study, streaks and the character build never enter
 * this formula (GAM-06): the game is independent of study. */
export function minutesOfProduction(minutes:number,floor:Amount,e:Economy,c:EconomicContext,performance=1):Amount {
 return integer(D.max(dec(floor),dec(production(e,c)).mul(minutes)).mul(performance).mul(effectFactor('active',e,c)));
}
