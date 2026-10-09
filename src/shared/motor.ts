import {D,dec,integer,sub,type Amount} from './amount';
import {BALANCE} from './economy-balance';
import {enginePower} from './game';

// The renderer only displays this quote. Main supplies the installed rate,
// permanent pulse effects and persisted spent amount; events are excluded there.
export function motorQuote(referenceRate:Amount,level:number,multiplier:number,spent:Amount){
 const budget=integer(D.max(BALANCE.motorBudgetPerDay,dec(referenceRate).mul(BALANCE.motorRateBudgetMinutes)).ceil());
 const remaining=integer(D.max(0,dec(sub(budget,spent))));
 const base=enginePower(level)*multiplier;
 const cap=D.max(BALANCE.pulseMaximum,dec(referenceRate).mul(BALANCE.motorRatePulseCapMinutes));
 const pulse=D.max(base,dec(referenceRate).mul(base).div(BALANCE.motorRatePulseDivisor));
 return {power:integer(D.min(cap,pulse,dec(remaining))),budget,remaining,referenceRate};
}
