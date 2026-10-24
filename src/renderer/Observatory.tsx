import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { PRODUCERS, UPGRADES, SIGNALS, BALANCE } from '../shared/economy';
import { dec, enough, formatAmount as n, type Amount } from '../shared/amount';
import type { GameAction, GameState } from '../shared/game';
import { Icon } from './Icon';
import { AnimatedNumber, distance, duration, ease, usePulse, useReducedMotion } from './motion';

type Quantity = 1 | 10 | 100 | 'max';
const perSecond = (perMinute: Amount) => n(dec(perMinute).div(60).toDecimalPlaces(dec(perMinute).lt(600) ? 1 : 0).toString());
/** Seconds until a cost is affordable at the current production; null when nothing is produced yet. */
function waitFor(cost: Amount, state: GameState) { const missing = dec(cost).minus(state.coins); if (missing.lte(0)) return 0; const rate = dec(state.economy.rate).div(60); return rate.gt(0) ? Math.ceil(missing.div(rate).toNumber()) : null; }
const clock = (seconds: number) => seconds < 90 ? `${seconds} s` : seconds < 5400 ? `${Math.round(seconds / 60)} min` : `${Math.round(seconds / 3600)} h`;

/** The core: a click is sent in batches, the number on screen is the main process's quote. */
export function CorePanel({ state, unconfirmed, press }: { state: GameState; unconfirmed: number; press(x: number, y: number): void }) {
  const button = useRef<HTMLButtonElement>(null), wheel = useRef<HTMLSpanElement>(null), layer = useRef<HTMLDivElement>(null), turn = useRef(0), reduced = useReducedMotion();
  useEffect(() => () => { gsap.killTweensOf([button.current, wheel.current]); }, []);
  function click(event: React.MouseEvent<HTMLButtonElement>) {
    const rect = button.current!.getBoundingClientRect(), x = event.clientX ? event.clientX - rect.left : rect.width / 2, y = event.clientY ? event.clientY - rect.top : rect.height / 2;
    press(x, y);
    if (reduced) return;
    turn.current += 24; gsap.killTweensOf(button.current);
    gsap.fromTo(button.current, { scale: .96 }, { scale: 1, duration: duration.micro, ease: ease.out, clearProps: 'transform' });
    gsap.to(wheel.current, { rotation: turn.current, duration: duration.ui, ease: ease.out, overwrite: true });
    // A small pool of floating numbers; each one is removed when its tween ends.
    const host = layer.current; if (!host || host.childElementCount > 12) return;
    const label = document.createElement('span'); label.className = 'core-float num'; label.textContent = `+${n(state.engine.power)}`; label.style.left = `${x}px`; label.style.top = `${y}px`; host.append(label);
    gsap.fromTo(label, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -distance.panel * 3, duration: duration.hero, ease: ease.soft, onComplete: () => label.remove() });
  }
  const active = state.economy.activeEvents.filter(e => (e.endsAt ?? 0) > state.now);
  return <section className="core-panel" aria-label="Núcleo">
    <span className="game-kicker">NÚCLEO</span>
    <div className="core-button-wrap"><button ref={button} className="core-button" aria-label="Clicar no núcleo" onClick={click}><span ref={wheel} className="core-wheel"><Icon kind="engine"/></span></button><div ref={layer} className="core-float-layer" aria-hidden="true"/></div>
    <dl className="core-stats">
      <div><dt>Por clique</dt><dd className="num" data-testid="core-power">+{n(state.engine.power)}</dd></div>
      <div><dt>Por segundo</dt><dd className="num" data-testid="production-rate">{perSecond(state.economy.rate)}</dd></div>
      <div><dt>Cliques</dt><dd className="num">{n(state.engine.clicks + unconfirmed)}</dd></div>
    </dl>
    {active.length > 0 && <ul className="core-effects" aria-label="Efeitos ativos">{active.map(e => <li key={e.id}><strong>{SIGNALS.find(s => s.id === e.type)?.name ?? e.type}</strong><span className="num">{Math.max(0, Math.ceil(((e.endsAt ?? 0) - state.now) / 1000))} s</span></li>)}</ul>}
    {state.nextDecor && <p className="core-next">Próximo marco da vila: <strong>{state.nextDecor.name}</strong> em {n(state.nextDecor.at)} produzidas na jornada.</p>}
  </section>;
}

function UpgradeCard({ id, state, busy, execute }: { id: string; state: GameState; busy: boolean; execute(a: GameAction): void }) {
  const u = UPGRADES.find(v => v.id === id)!, affordable = enough(state.coins, u.cost), wait = waitFor(u.cost, state);
  return <button className={`upgrade-chip ${affordable ? 'affordable' : ''}`} disabled={busy || !affordable} aria-label={`Comprar melhoria ${u.name}`} title={u.description} onClick={() => execute({ kind: 'economy-upgrade', id })}>
    <span className="upgrade-chip-kind">{u.category === 'click' ? 'CLIQUE' : u.category === 'tier' ? 'FAMÍLIA' : u.category === 'synergy' ? 'SINERGIA' : 'REDE'}</span>
    <strong>{u.name}</strong><small>{u.description.split('.')[0]}.</small>
    <span className="num upgrade-chip-cost">{n(u.cost)}{!affordable && wait !== null && <em> · {clock(wait)}</em>}</span>
  </button>;
}

function ProducerRow({ id, state, quantity, busy, execute }: { id: string; state: GameState; quantity: Quantity; busy: boolean; execute(a: GameAction): void }) {
  const p = PRODUCERS.find(v => v.id === id)!, v = state.economy.producersView.find(x => x.id === id)!, row = useRef<HTMLElement>(null);
  const q = quantity === 'max' ? v.max : quantity, cost = quantity === 'max' ? (v.max ? v.costMax : v.cost) : quantity === 100 ? v.cost100 : quantity === 10 ? v.cost10 : v.cost;
  const affordable = q > 0 && enough(state.coins, cost), wait = waitFor(cost, state);
  usePulse(row, v.count, 'ok');
  const each = v.count ? v.individual : dec(p.rate).toString();
  return <article ref={row} data-pulse="" className={`store-row ${affordable ? 'affordable' : ''}`}>
    <span className={`store-emblem visual-${p.visual}`} aria-hidden="true">{String(p.order + 1).padStart(2, '0')}</span>
    <div className="store-copy"><strong>{p.name}</strong><small>+{perSecond(each)}/s cada · {v.count ? `${v.share.toFixed(0)}% da produção` : p.location}</small></div>
    <span className="store-count num" data-testid={`count-${id}`}>{v.count}</span>
    <button className="primary store-buy" aria-label={`Comprar ${q || 1} ${p.name}`} disabled={busy || !affordable} onClick={() => execute({ kind: 'producer-buy', producer: id, quantity })}><span className="num">{n(cost)}</span><small>{affordable ? `×${q}` : wait === null ? 'sem produção' : wait ? `em ${clock(wait)}` : `×${q || 1}`}</small></button>
  </article>;
}

/** The store reveals what is within reach: owned families, the next one as a silhouette, upgrades sorted by price. */
export function StorePanel({ state, busy, execute }: { state: GameState; busy: boolean; execute(a: GameAction): void }) {
  const [quantity, setQuantity] = useState<Quantity>(1), e = state.economy;
  const unlocked = PRODUCERS.filter(p => e.producersView.find(v => v.id === p.id)!.unlocked), next = PRODUCERS.find(p => !e.producersView.find(v => v.id === p.id)!.unlocked);
  const upgrades = UPGRADES.filter(u => { const v = e.upgradesView.find(x => x.id === u.id)!; return v.unlocked && !v.owned; }).sort((a, b) => dec(a.cost).cmp(b.cost));
  return <section className="store-panel" aria-label="Loja">
    <header><span className="game-kicker">LOJA</span><div className="store-quantity" role="group" aria-label="Quantidade de compra">{([1, 10, 100, 'max'] as const).map(q => <button key={q} aria-pressed={quantity === q} onClick={() => setQuantity(q)}>{q === 'max' ? 'máx' : `×${q}`}</button>)}</div></header>
    {upgrades.length > 0 && <div className="store-upgrades" aria-label="Melhorias disponíveis">{upgrades.slice(0, 6).map(u => <UpgradeCard key={u.id} id={u.id} state={state} busy={busy} execute={execute}/>)}{upgrades.length > 6 && <small className="store-more">+{upgrades.length - 6} melhorias depois destas</small>}</div>}
    <div className="store-list">{unlocked.map(p => <ProducerRow key={p.id} id={p.id} state={state} quantity={quantity} busy={busy} execute={execute}/>)}
      {next && <article className="store-row locked" aria-label="Próxima instalação"><span className="store-emblem" aria-hidden="true">??</span><div className="store-copy"><strong>???</strong><small>Aparece com {n(next.unlock)} produzidas na jornada</small></div><progress max={1} value={Math.min(1, dec(e.lifetime).div(next.unlock).toNumber())} aria-label="Progresso até a próxima instalação"/></article>}
    </div>
  </section>;
}

/** A Lampejo over the city: authoritative timing from the main process, local countdown for display only. */
export function FlashLight({ state, catchIt }: { state: GameState; catchIt(id: string): void }) {
  const flash = state.flash, ref = useRef<HTMLButtonElement>(null), reduced = useReducedMotion(), offset = useRef(0), [left, setLeft] = useState(1);
  useEffect(() => { offset.current = state.now - Date.now(); }, [state.now]);
  useEffect(() => { if (!flash) return; const tick = () => setLeft(Math.max(0, (flash.expiresAt - (Date.now() + offset.current)) / (flash.expiresAt - flash.appearedAt))); tick(); const timer = setInterval(tick, 250); return () => clearInterval(timer); }, [flash?.id]);
  useLayoutEffect(() => { const el = ref.current; if (!el || reduced) return; const tween = gsap.fromTo(el, { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: duration.panel, ease: ease.out, clearProps: 'transform' }); return () => { tween.kill(); }; }, [flash?.id, reduced]);
  if (!flash || left <= 0) return null;
  return <button ref={ref} className="flash-light" data-testid="flash-light" style={{ left: `${flash.x * 100}%`, top: `${flash.y * 100}%`, ['--left' as string]: left }} aria-label="Pegar o Lampejo" onClick={() => catchIt(flash.id)}><span aria-hidden="true"/></button>;
}

export const flashRule = `Lampejos só aparecem com a Cidade visível e fora do Foco, a cada ${BALANCE.flashWatchMinMs / 60000}–${BALANCE.flashWatchMaxMs / 60000} minutos observando.`;
