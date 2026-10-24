import { useState } from 'react';
import { BALANCE, POLICIES } from '../shared/economy';
import { CROPS, type CropId, type GameAction, type GameState } from '../shared/game';
import { enough, formatAmount as n } from '../shared/amount';
import { Icon } from './Icon';

const until = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return s < 90 ? `${s} s` : `${Math.ceil(s / 60)} min`; };
function Locked({ title, text }: { title: string; text: string }) { return <div className="minigame-locked"><Icon kind="target"/><h2>{title}</h2><p>{text}</p></div>; }

/** Horta: what to plant, when to harvest; a flower pays more by staying planted. Ripe plants wait forever. */
export function GardenPanel({ state, busy, execute }: { state: GameState; busy: boolean; execute(a: GameAction): void }) {
  const [seed, setSeed] = useState<CropId>('wheat'), g = state.garden;
  if (!g.unlocked) return <section className="minigame-panel"><span className="game-kicker">HORTA / LIGADA AOS COLETORES</span><h1>Horta do vale</h1><Locked title="Ainda fechada" text={`Abre com ${BALANCE.gardenUnlock.count} Coletores e fica aberta para sempre, inclusive depois de um novo ciclo.`}/></section>;
  return <section className="minigame-panel garden-panel"><span className="game-kicker">HORTA / LIGADA AOS COLETORES</span><h1>Horta do vale</h1>
    <p className="minigame-lead">Cada semente custa um minuto de produção (agora {n(g.seedCost)}). Colher dá um ganho na hora; deixar a flor plantada rende enquanto ela fica. Uma planta madura espera o tempo que precisar.</p>
    <div className="seed-choice" role="group" aria-label="Semente">{(Object.keys(CROPS) as CropId[]).map(id => <button key={id} aria-pressed={seed === id} onClick={() => setSeed(id)}><strong>{CROPS[id].name}</strong><small>{Math.round(CROPS[id].seconds / g.growth / 60 * 10) / 10} min · {CROPS[id].harvest}{CROPS[id].growing ? ` ${CROPS[id].growing}` : ''}</small></button>)}</div>
    <div className="garden-plots">{state.plots.map(plot => { const ripe = plot.crop && state.now >= plot.readyAt, share = plot.crop ? Math.min(1, (state.now - plot.plantedAt) / Math.max(1, plot.readyAt - plot.plantedAt)) : 0; return <div key={plot.id} className={`garden-plot ${ripe ? 'ripe' : ''} ${plot.crop ?? 'empty'}`}>
      <span className="bed-number">{String(plot.id).padStart(2, '0')}</span><strong>{plot.crop ? CROPS[plot.crop].name : 'Terra livre'}</strong>
      <small>{plot.crop ? ripe ? 'Pronta para colher' : `Cresce · ${until(plot.readyAt - state.now)}` : 'Escolha uma semente acima'}</small>
      {plot.crop && <progress max={1} value={share} aria-label={`Crescimento do canteiro ${plot.id}`}/>}
      <button className={plot.crop && ripe ? 'primary' : ''} disabled={busy || Boolean(plot.crop && !ripe) || !plot.crop && !enough(state.coins, g.seedCost)} aria-label={plot.crop ? `Colher canteiro ${plot.id}` : `Plantar ${CROPS[seed].name} no canteiro ${plot.id}`} onClick={() => execute(plot.crop ? { kind: 'harvest', plot: plot.id } : { kind: 'plant', plot: plot.id, crop: seed })}>{plot.crop ? ripe ? 'Colher' : 'Crescendo' : 'Plantar'}</button>
    </div>; })}</div>
    <p className="minigame-foot">{g.dew ? `${g.dew} flor${g.dew > 1 ? 'es' : ''}-de-orvalho plantada${g.dew > 1 ? 's' : ''}: +${g.dew * BALANCE.dewBonus * 100}% de produção.` : 'Nenhuma flor-de-orvalho plantada.'} Mais dois canteiros chegam com a Terra fértil.</p>
  </section>;
}

/** Conselho: three seats of decreasing strength, six policies with a cost, swaps limited by deliberations. */
export function CouncilPanel({ state, busy, execute }: { state: GameState; busy: boolean; execute(a: GameAction): void }) {
  const c = state.council;
  if (!c.unlocked) return <section className="minigame-panel"><span className="game-kicker">CONSELHO / LIGADO ÀS OFICINAS</span><h1>Conselho da cidade</h1><Locked title="Ainda sem quórum" text={`Toma posse com ${BALANCE.councilUnlock.count} Oficinas e continua depois de um novo ciclo.`}/></section>;
  const percent = (delta: number, seat: number) => `${delta > 0 ? '+' : '−'}${Math.round(Math.abs(delta) * BALANCE.councilSeats[seat] * 100)}%`;
  const label: Record<string, string> = { production: 'produção', click: 'clique', cost: 'custo das instalações', eventChance: 'frequência de Lampejos', garden: 'velocidade da Horta', achievement: 'peso das conquistas' };
  return <section className="minigame-panel council-panel"><span className="game-kicker">CONSELHO / LIGADO ÀS OFICINAS</span><h1>Conselho da cidade</h1>
    <p className="minigame-lead">Três cadeiras, da mais forte à mais discreta. Cada pauta tem um custo; trocar uma pauta gasta uma deliberação, e esvaziar uma cadeira é grátis.</p>
    <p className="council-deliberations" role="status"><strong className="num">{c.deliberations}</strong> de {BALANCE.deliberationsMax} deliberações{c.nextDeliberationAt ? ` · próxima em ${until(c.nextDeliberationAt - state.now)}` : ''}</p>
    <div className="council-seats">{c.seats.map((current, seat) => <fieldset key={seat} className="council-seat"><legend>Cadeira {seat + 1} · {Math.round(BALANCE.councilSeats[seat] * 100)}%</legend>
      {POLICIES.map(policy => { const here = current === policy.id, elsewhere = !here && c.seats.includes(policy.id); return <button key={policy.id} aria-pressed={here} disabled={busy || elsewhere || (!here && c.deliberations < 1)} onClick={() => execute({ kind: 'council-seat', seat, policy: here ? null : policy.id })}>
        <strong>{policy.name}</strong><small>{policy.effects.map(e => `${percent(e.delta, seat)} ${label[e.kind]}`).join(', ')}</small></button>; })}
    </fieldset>)}</div>
  </section>;
}

/** Memória de Conceitos: no time limit; the reward is minutes of production, computed by the main process. */
export function MemoryPanel({ state, busy, execute }: { state: GameState; busy: boolean; execute(a: GameAction): void }) {
  const round = state.round, [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>(round?.difficulty ?? 'easy');
  return <section className="minigame-panel memory-stage"><div className="memory-heading"><span className="game-kicker">MEMÓRIA / SEM LIMITE DE TEMPO</span><h1>Memória de Conceitos</h1><p>Conceito e definição, conceito e exemplo, fórmula e situação. Jogue no seu ritmo.</p><label className="game-select">Dificuldade<select aria-label="Dificuldade da memória" disabled={Boolean(round && !round.completed)} value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}><option value="easy">Leve · 3 pares</option><option value="normal">Normal · 6 pares</option><option value="hard">Desafio · 9 pares</option></select></label></div>
    {round ? <><div className="memory-stats"><span>{round.cards.filter(c => c.matched).length / 2} / {round.cards.length / 2} pares</span><span>{round.attempts} tentativas</span><span>Sequência ×{round.combo}</span></div>
      <div className={`memory-board ${round.cards.length > 12 ? 'memory-hard' : ''}`}>{round.cards.map(card => <button key={card.id} className={`memory-card ${card.label ? 'revealed' : ''} ${card.matched ? 'matched' : ''}`} aria-label={`Carta ${card.id + 1}${card.label ? `: ${card.label}` : ', fechada'}`} disabled={busy || card.matched || round.completed || round.selected.length < 2 && round.selected.includes(card.id)} onClick={() => execute({ kind: 'flip', roundId: round.id, card: card.id })}><small>{String(card.id + 1).padStart(2, '0')}</small><span>{card.label ?? '✧'}</span>{card.matched && <b>PAR</b>}</button>)}</div>
      {round.completed && <div className="round-complete" role="status"><span>RODADA CONCLUÍDA</span><p>+{n(round.coins)} centelhas · +{round.xp} XP · melhor sequência ×{round.maxCombo}</p><button className="primary" disabled={busy} onClick={() => execute({ kind: 'start-round', difficulty })}>Jogar nova rodada →</button></div>}</>
      : <div className="memory-start"><span><Icon kind="memory"/></span><h2>Encontre os pares.</h2><p>Recompensa em minutos de produção: Leve 3, Normal 6, Desafio 9.</p><button className="primary" disabled={busy} onClick={() => execute({ kind: 'start-round', difficulty })}>Começar rodada →</button></div>}
  </section>;
}
