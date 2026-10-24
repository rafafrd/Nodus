import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, PERMANENT, BALANCE } from '../shared/economy';
import { add, dec, enough, formatAmount as n } from '../shared/amount';
import { CITY_SKINS, SKILLS, type Build, type GameAction, type GameState } from '../shared/game';
import { MotionDialog } from './MotionDialog';

/** Conquistas: game milestones feed the discovery index; study milestones are shown apart and never change production. */
export function AchievementsPanel({ state }: { state: GameState }) {
  const e = state.economy, [filter, setFilter] = useState<'next' | 'earned' | 'study' | 'secret'>('next');
  const game = ACHIEVEMENTS.filter(a => !a.secret && !a.study), earned = game.filter(a => e.achievements.includes(a.id));
  const ratio = (id: string, target: number | string) => Math.min(1, dec(e.achievementsView.find(v => v.id === id)!.progress).div(target).toNumber());
  // Achievements of removed activities (Oficina, coleta) stay visible once earned and are not listed as goals.
  const retired = new Set(['challenges', 'perfect', 'gathered']);
  const rows = filter === 'secret' ? ACHIEVEMENTS.filter(a => a.secret && e.achievements.includes(a.id)) : filter === 'earned' ? earned : filter === 'study' ? ACHIEVEMENTS.filter(a => a.study && !a.secret) : game.filter(a => !e.achievements.includes(a.id) && !retired.has(a.metric)).sort((a, b) => ratio(b.id, b.target) - ratio(a.id, a.target)).slice(0, 12);
  return <section className="minigame-panel achievements-panel"><span className="game-kicker">CONQUISTAS / ÍNDICE {e.index}</span><h1>Arquivo de descobertas</h1>
    <p className="minigame-lead">Cada conquista do jogo soma {BALANCE.achievementPerIndex * 100}% à produção pelo índice de descoberta. Conquistas de estudo continuam aqui, mas não alteram a produção: estudar não compra vantagem no jogo.</p>
    <label className="game-select">Mostrar<select aria-label="Filtro de conquistas" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}><option value="next">Próximas</option><option value="earned">Conquistadas ({earned.length}/{game.length})</option><option value="study">De estudo</option><option value="secret">Notas secretas encontradas</option></select></label>
    <div className="achievement-grid">{rows.map(a => { const v = e.achievementsView.find(x => x.id === a.id)!; return <article key={a.id} className={v.unlocked ? 'earned' : ''}><span>{v.unlocked ? '✓ CONQUISTADA' : a.study ? 'ESTUDO' : 'EM PROGRESSO'}</span><h2>{a.name}</h2><p>{a.description}</p><progress aria-label={`Progresso ${a.name}`} max={1} value={ratio(a.id, a.target)}/><small>{n(v.progress)} / {n(a.target)}</small></article>; })}</div>
    {!rows.length && <p className="economy-empty">Nada por aqui ainda.</p>}
  </section>;
}

/** Legado: voluntary new cycle for insignias and permanent upgrades, with a review of what resets. */
export function LegacyPanel({ state, busy, execute }: { state: GameState; busy: boolean; execute(a: GameAction): void }) {
  const e = state.economy, b = e.breakdown, [confirm, setConfirm] = useState(false), [understood, setUnderstood] = useState(false);
  return <section className="minigame-panel legacy-panel"><span className="game-kicker">LEGADO / CICLO {e.cycles + 1}</span><h1>O próximo horizonte</h1>
    <div className="prestige-summary"><div><p>Troque este ciclo por insígnias: cada uma soma {Number(BALANCE.prestigeBonus) * 100}% à produção para sempre e compra melhorias permanentes.</p><strong className="num">+{n(e.prestigeGain)} <small>insígnias se recomeçar agora</small></strong><p>Próxima insígnia com {n(e.nextPrestigeAt)} produzidas na jornada (agora {n(e.lifetime)}).</p><button className="primary" disabled={busy || !enough(e.prestigeGain, 1)} onClick={() => { setUnderstood(false); setConfirm(true); }}>Revisar novo ciclo</button></div>
      <dl><dt>Recomeça</dt><dd>Centelhas, instalações, melhorias do ciclo e efeitos ativos.</dd><dt>Fica</dt><dd>Insígnias, melhorias permanentes, conquistas, cliques, Horta, Conselho, marcos da vila, skins, XP e nível.</dd></dl></div>
    <div className="economy-section-label"><span>{PERMANENT.length} MELHORIAS PERMANENTES</span><span className="num">{n(e.tokens)} insígnias</span></div>
    <div className="technology-grid">{PERMANENT.filter(u => e.permanent.includes(u.id) || !u.conditions.some(c => 'owned' in c && !e.permanent.includes(c.owned))).map(u => { const owned = e.permanent.includes(u.id), ready = u.conditions.every(c => 'owned' in c ? e.permanent.includes(c.owned) : c.metric === 'cycles' ? e.cycles >= Number(c.target) : true); return <article key={u.id} className={owned ? 'earned' : ''}><span className="technology-status">TODOS OS CICLOS</span><h2>{u.name}</h2><p>{u.description}</p><button aria-label={`Adquirir ${u.name}`} disabled={busy || owned || !ready || !enough(e.tokens, u.cost)} onClick={() => execute({ kind: 'permanent-upgrade', id: u.id })}>{owned ? '✓ Permanente' : `${n(u.cost)} insígnias · Adquirir`}</button></article>; })}</div>
    <details className="economy-breakdown"><summary>Por que produzo {n(dec(e.rate).div(60).toDecimalPlaces(1).toString())} por segundo?</summary><div className="breakdown-grid"><div><small>BASE</small><strong>{n(dec(b.base).div(60).toDecimalPlaces(1).toString())}/s</strong></div>{b.layers.map(layer => <div key={layer.name}><small>{layer.name.toUpperCase()}</small><strong>×{dec(layer.factor).toSignificantDigits(4).toString().replace('.', ',')}</strong></div>)}</div></details>
    {confirm && <MotionDialog title="Iniciar novo ciclo?" close={() => setConfirm(false)}>{close => <div className="prestige-confirm"><p>Você receberá <strong>{n(e.prestigeGain)} insígnias</strong>. Legado total: {n(add(e.prestige, e.prestigeGain))}.</p><p>Recomeçam <strong>{n(state.coins)} centelhas</strong>, instalações, melhorias do ciclo e efeitos ativos.</p><label><input type="checkbox" checked={understood} onChange={event => setUnderstood(event.target.checked)}/> Entendi o que recomeça.</label><div className="dialog-buttons"><button disabled={busy} onClick={close}>Continuar neste ciclo</button><button className="primary" disabled={busy || !understood || !enough(e.prestigeGain, 1)} onClick={() => { execute({ kind: 'prestige', expectedCycles: e.cycles, expectedGain: e.prestigeGain }); close(); }}>Confirmar novo ciclo</button></div></div>}</MotionDialog>}
  </section>;
}

/** Perfil: XP, level and class are cosmetic. Study grants XP; no point changes production. */
export function ProfilePanel({ state, busy, execute }: { state: GameState; busy: boolean; execute(a: GameAction): void }) {
  const [draft, setDraft] = useState<Build>({ ...state.build }), used = Object.values(draft).reduce((s, v) => s + v, 0);
  useEffect(() => setDraft({ ...state.build }), [state.build.focus, state.build.review, state.build.planning, state.build.practice]);
  return <section className="minigame-panel profile-panel"><span className="game-kicker">PERFIL / NÍVEL {state.level}</span><h1>{state.className}</h1>
    <p className="minigame-lead">XP vem de Foco, revisões, Horta, Memória e Lampejos. O nível dá pontos para a build, e a build decide a classe. Tudo aqui é cosmético; redistribuir é sempre gratuito.</p>
    <div className="game-xp-track" role="progressbar" aria-label="Progresso do nível" aria-valuenow={state.xp % 100} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${state.xp % 100}%` }}/></div>
    <p className="build-points">{state.level - used} pontos livres · {state.xp} XP</p>
    {SKILLS.map(skill => <div className="skill-row" key={skill.id}><div><strong>{skill.name}</strong><p>Classe: {skill.title}</p></div><div className="skill-controls"><button aria-label={`Diminuir ${skill.name}`} disabled={busy || draft[skill.id] === 0} onClick={() => setDraft(d => ({ ...d, [skill.id]: d[skill.id] - 1 }))}>−</button><b>{draft[skill.id]}</b><button aria-label={`Aumentar ${skill.name}`} disabled={busy || used >= state.level} onClick={() => setDraft(d => ({ ...d, [skill.id]: d[skill.id] + 1 }))}>+</button></div></div>)}
    <button className="primary build-save" disabled={busy} onClick={() => execute({ kind: 'respec', build: draft })}>Salvar build</button>
    <div className="profile-city"><label className="game-select">Cenário<select aria-label="Skin da cidade" value={state.skin} disabled={busy} onChange={event => execute({ kind: 'skin', value: event.target.value as GameState['skin'] })}>{CITY_SKINS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <div className="city-atmospheres" role="group" aria-label="Ambiente da vila">{([['golden', 'Dourado'], ['dawn', 'Amanhecer'], ['night', 'Noite']] as const).map(([value, title]) => <button key={value} disabled={busy} aria-pressed={state.atmosphere === value} onClick={() => execute({ kind: 'atmosphere', value })}>{title}</button>)}</div></div>
    <details className="game-journal"><summary>Atividade recente</summary>{state.recent.map((event, i) => <p key={`${event.at}:${i}`}><span>{event.action}</span><small className="num">{dec(event.coins).gt(0) ? '+' : ''}{n(event.coins)}</small></p>)}</details>
  </section>;
}
