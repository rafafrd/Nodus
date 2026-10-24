import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AIM_ARENA, AIM_LEVELS, aimPoints, type AimHit, type AimLevel, type AimTarget, type GameAction, type GameState } from '../shared/game';
import { formatAmount as n } from '../shared/amount';
import { BALANCE } from '../shared/economy';
import { Icon } from './Icon';
import { usePreferences } from './preferences';
import { useReducedMotion } from './motion';
import { playCue } from './gameSound';

type Play = { id: string; difficulty: AimLevel; targets: AimTarget[]; t0: number; end: number };
type Mark = { key: number; x: number; y: number; label: string; kind: string };
const LEVELS = Object.keys(AIM_LEVELS) as AimLevel[];
const percent = (value: number) => `${(value * 100).toFixed(2).replace('.', ',')}%`;

/** Mira: the main process draws the squares and pays by precision; this panel only measures where each click landed. */
export function AimPanel({ state, busy, active, execute }: { state: GameState; busy: boolean; active: boolean; execute(a: GameAction): void }) {
  const aim = state.aim, [level, setLevel] = useState<AimLevel>(aim.last?.difficulty ?? 'easy');
  const [play, setPlay] = useState<Play | null>(null), [elapsed, setElapsed] = useState(0), [marks, setMarks] = useState<Mark[]>([]), [interrupted, setInterrupted] = useState(false);
  const hits = useRef<AimHit[]>([]), hit = useRef(new Set<number>()), misclicks = useRef(0), combo = useRef(0), expired = useRef(0), mark = useRef(0), requested = useRef<string | null>(null);
  const arena = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), [box, setBox] = useState({ width: 0, height: 0 });
  const volume = usePreferences().value.gameVolume, reduced = useReducedMotion();
  // The round starts on the frame its squares arrive from the main process, so the countdown is never shortened.
  useEffect(() => {
    const next = aim.active;
    if (requested.current === null || !next || next.id === requested.current) return;
    requested.current = null; hits.current = []; hit.current = new Set(); misclicks.current = 0; combo.current = 0; expired.current = 0; setMarks([]); setInterrupted(false);
    setPlay({ ...next, t0: performance.now(), end: Math.max(...next.targets.map(t => t.at + t.life)) }); setElapsed(0);
  }, [aim.active?.id]);
  // Leaving the area or hiding the window ends the round without paying; the main process replaces it on the next start.
  useEffect(() => { if (play && (!active || document.hidden)) { setPlay(null); setInterrupted(true); } }, [active, play]);
  useEffect(() => { const leave = () => document.hidden && setPlay(p => { if (p) setInterrupted(true); return null; }); document.addEventListener('visibilitychange', leave); return () => document.removeEventListener('visibilitychange', leave); }, []);
  useEffect(() => {
    if (!play) return;
    let frame = 0;
    const tick = () => {
      const now = performance.now() - play.t0; setElapsed(now);
      // A square that leaves without a click is a miss and breaks the sequence.
      while (expired.current < play.targets.length && play.targets[expired.current].at + play.targets[expired.current].life < now) {
        const i = expired.current++, t = play.targets[i]; if (hit.current.has(i)) continue;
        combo.current = 0; addMark(t.x, t.y, '×', 'miss'); playCue('miss', volume);
      }
      if (now >= play.end + 120) { execute({ kind: 'aim-finish', roundId: play.id, hits: hits.current, misclicks: misclicks.current }); setPlay(null); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [play]);
  useLayoutEffect(() => {
    const el = stage.current; if (!el) return;
    // The arena keeps the 5:3 ratio of the main process's coordinates and fills the space it has.
    const fit = () => { const w = el.clientWidth, h = el.clientHeight, ratio = AIM_ARENA.width / AIM_ARENA.height; setBox(w / h > ratio ? { width: h * ratio, height: h } : { width: w, height: w / ratio }); };
    fit(); const observer = new ResizeObserver(fit); observer.observe(el); return () => observer.disconnect();
  }, [Boolean(play)]);
  function addMark(x: number, y: number, label: string, kind: string) { const key = ++mark.current; setMarks(m => [...m.slice(-11), { key, x, y, label, kind }]); setTimeout(() => setMarks(m => m.filter(v => v.key !== key)), 520); }
  function start() { requested.current = aim.active?.id ?? ''; setInterrupted(false); execute({ kind: 'aim-start', difficulty: level }); }
  function strike(event: React.PointerEvent<HTMLSpanElement>, index: number) {
    event.stopPropagation(); if (!play || hit.current.has(index)) return;
    const rect = event.currentTarget.getBoundingClientRect(), half = rect.width / 2, clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const dx = clamp((event.clientX - rect.left - half) / half), dy = clamp((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)), points = aimPoints(dx, dy), t = play.targets[index];
    hit.current.add(index); hits.current.push({ target: index, t: Math.round(performance.now() - play.t0), dx: Math.round(dx * 1000) / 1000, dy: Math.round(dy * 1000) / 1000 });
    combo.current++; addMark(t.x + dx * t.size / 2, t.y + dy * t.size / 2, String(points), `p${points}`); playCue('hit', volume, points === 300 ? 0 : points === 100 ? -3 : -6);
  }
  function emptyClick(event: React.PointerEvent<HTMLDivElement>) {
    if (!play || elapsed < AIM_ARENA.leadMs) return;
    const rect = event.currentTarget.getBoundingClientRect();
    misclicks.current++; combo.current = 0; addMark((event.clientX - rect.left) / rect.width * AIM_ARENA.width, (event.clientY - rect.top) / rect.height * AIM_ARENA.height, '·', 'misclick'); playCue('miss', volume, -5);
  }
  const at = (x: number, y: number) => ({ left: `${x / AIM_ARENA.width * 100}%`, top: `${y / AIM_ARENA.height * 100}%` });
  if (play) {
    const done = hits.current.length, scored = hits.current.reduce((s, h) => s + aimPoints(h.dx, h.dy), 0), judged = expired.current + hits.current.filter(h => h.target >= expired.current).length;
    const live = judged + misclicks.current ? scored / (300 * (judged + misclicks.current)) : null, countdown = Math.ceil((AIM_ARENA.leadMs - elapsed) / 1000);
    return <section className="minigame-panel aim-panel aim-playing" aria-label="Rodada da Mira">
      <div className="aim-hud"><span><small>PRECISÃO</small><strong className="num">{live === null ? '—' : percent(live)}</strong></span><span><small>SEQUÊNCIA</small><strong className="num">×{combo.current}</strong></span><span><small>ACERTOS</small><strong className="num">{done} / {play.targets.length}</strong></span><span><small>NÍVEL</small><strong>{AIM_LEVELS[play.difficulty].name}</strong></span><button onClick={() => { setPlay(null); setInterrupted(true); }}>Sair da rodada</button></div>
      <div className="aim-stage" ref={stage}><div className="aim-arena" ref={arena} style={{ width: box.width, height: box.height }} onPointerDown={emptyClick} data-testid="aim-arena" data-elapsed={Math.round(elapsed)}>
        {countdown > 0 && <span className="aim-countdown" aria-live="assertive">{countdown}</span>}
        {play.targets.map((t, i) => { if (hit.current.has(i) || elapsed < t.at || elapsed > t.at + t.life) return null; const progress = (elapsed - t.at) / t.life, size = { width: `${t.size / AIM_ARENA.width * 100}%`, height: `${t.size / AIM_ARENA.height * 100}%` };
          return <span key={i} className="aim-target" data-testid="aim-target" data-index={i} style={{ ...at(t.x, t.y), ...size, opacity: reduced ? 1 : Math.min(1, progress * 8) }} onPointerDown={event => strike(event, i)}>
            {/* The closing square is the countdown of this target: it keeps shrinking with reduced motion, because it is information, not decoration. */}
            <i className="aim-approach" style={{ transform: `translate(-50%,-50%) scale(${3 - 2 * progress})` }}/><b>{(i % 9) + 1}</b></span>; })}
        {marks.map(m => <span key={m.key} className={`aim-mark ${m.kind}`} style={at(m.x, m.y)} aria-hidden="true">{m.label}</span>)}
      </div></div>
      <p className="aim-hint">Clique o mais perto possível do centro antes que o quadrado externo feche. Clique no vazio conta contra a precisão.</p>
    </section>;
  }
  const last = aim.last;
  return <section className="minigame-panel aim-panel"><span className="game-kicker">MIRA / PRECISÃO</span><h1>Mira</h1>
    <p className="minigame-lead">Quadrados aparecem pela arena e somem sozinhos. Acerte o centro antes que o quadrado externo feche: centro vale 300, meio 100 e borda 50. Clicar no vazio derruba a precisão. Precisa de mouse ou toque.</p>
    <div className="aim-levels" role="radiogroup" aria-label="Dificuldade da Mira">{LEVELS.map(id => { const spec = AIM_LEVELS[id], best = aim.best[id]; return <button key={id} role="radio" aria-checked={level === id} onClick={() => setLevel(id)}>
      <strong>{spec.name}</strong><small>{spec.targets} quadrados · {(spec.lifeMs / 1000).toFixed(2).replace('.', ',')} s cada</small><small>Recompensa até {BALANCE.activeRateMinutes.aim * spec.multiplier} min de produção</small><em>{best === undefined ? 'Sem recorde' : `Recorde ${percent(best)}`}</em></button>; })}</div>
    <div className="aim-start"><button className="primary" disabled={busy} onClick={start}><Icon kind="aim"/> Começar rodada {AIM_LEVELS[level].name} →</button><span>A rodada dura cerca de {Math.round((AIM_ARENA.leadMs + (AIM_LEVELS[level].targets - 1) * AIM_LEVELS[level].gapMs + AIM_LEVELS[level].lifeMs) / 1000)} s, com contagem de 3 s.</span></div>
    {interrupted && <p className="aim-note" role="status">Rodada interrompida: nada foi pago. Comece outra quando quiser.</p>}
    {last && !interrupted && <div className="aim-result" role="status" data-testid="aim-result"><span className={`aim-grade grade-${last.grade.toLowerCase()}`}>{last.grade}</span>
      <dl><div><dt>Precisão</dt><dd className="num">{percent(last.accuracy)}</dd></div><div><dt>300</dt><dd className="num">{last.counts[0]}</dd></div><div><dt>100</dt><dd className="num">{last.counts[1]}</dd></div><div><dt>50</dt><dd className="num">{last.counts[2]}</dd></div><div><dt>Perdidos</dt><dd className="num">{last.counts[3]}</dd></div><div><dt>No vazio</dt><dd className="num">{last.misclicks}</dd></div><div><dt>Maior sequência</dt><dd className="num">×{last.maxCombo}</dd></div></dl>
      <p>Última rodada ({AIM_LEVELS[last.difficulty].name}): +{n(last.coins)} centelhas · +{last.xp} XP</p></div>}
  </section>;
}
