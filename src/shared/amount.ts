import Decimal from 'decimal.js';

// Formulae use 80 significant decimal digits; integer balances and ledger deltas
// use BigInt addition, so a small reward is never swallowed by a large balance.
export const D = Decimal.clone({ precision: 80, rounding: Decimal.ROUND_HALF_UP, maxE: 1200, minE: -1200 });
export type Amount = number | string;
export function dec(value: Amount | Decimal): Decimal {
  const n = new D(value);
  if (!n.isFinite() || Math.abs(n.e) > 1000) throw new Error('ECONOMY_RANGE: magnitude econômica fora do intervalo suportado.');
  return n;
}
export function amount(value: Amount | Decimal): Amount {
  const n = dec(value);
  const numeric=n.toNumber();
  return n.abs().lte(Number.MAX_SAFE_INTEGER)&&n.eq(new D(numeric)) ? numeric : n.toFixed();
}
export function integer(value: Amount | Decimal): Amount {
  const n = dec(value).floor();
  return n.abs().lte(Number.MAX_SAFE_INTEGER) ? n.toNumber() : n.toFixed(0);
}
export function add(a: Amount, b: Amount): Amount {
  const x = dec(a), y = dec(b);
  if (x.isInt() && y.isInt()) {
    const sum = BigInt(x.toFixed(0)) + BigInt(y.toFixed(0));
    return sum <= BigInt(Number.MAX_SAFE_INTEGER) && sum >= -BigInt(Number.MAX_SAFE_INTEGER) ? Number(sum) : sum.toString();
  }
  return amount(x.plus(y));
}
export const sub = (a: Amount, b: Amount): Amount => add(a, amount(dec(b).neg()));
export const enough = (a: Amount, b: Amount) => dec(a).gte(dec(b));
export function formatAmount(value: Amount = 0): string {
  const n = dec(value), magnitude = n.abs();
  if (magnitude.lt(1000)) return n.toNumber().toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const exponent = Math.floor(magnitude.log(10).toNumber() / 3) * 3;
  const suffix = ({3:'K',6:'M',9:'B',12:'T',15:'Q'} as Record<number,string>)[exponent];
  return `${n.div(new D(10).pow(exponent)).toDecimalPlaces(2).toString().replace('.', ',')}${suffix ?? `e${exponent}`}`;
}
