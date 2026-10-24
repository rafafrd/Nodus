import { useEffect, useRef, useState } from 'react';
import type { z } from 'zod';
import { CityScene, type Place } from './CityScene';
import type { GameAction, GameState, gameInput } from '../shared/game';
import { add, dec, formatAmount, integer } from '../shared/amount';
import { Icon } from './Icon';
import { AnimatedNumber, useSurfaceMotion } from './motion';
import { usePreferences } from './preferences';
import { CorePanel, StorePanel, FlashLight, flashRule } from './Observatory';
import { GardenPanel, CouncilPanel, MemoryPanel } from './GameMinigames';
import { AchievementsPanel, LegacyPanel, ProfilePanel } from './GamePanels';
import { GameTicker } from './GameTicker';
import { playCue } from './gameSound';
import './game.css';
import './idle.css';

type Tab = 'observatory' | 'garden' | 'council' | 'memory' | 'achievements' | 'legacy' | 'profile';
const TABS: [Tab, Parameters<typeof Icon>[0]['kind'], string][] = [['observatory', 'engine', 'Observatório'], ['garden', 'tree', 'Horta'], ['council', 'person', 'Conselho'], ['memory', 'memory', 'Memória'], ['achievements', 'target', 'Conquistas'], ['legacy', 'orbit', 'Legado'], ['profile', 'person', 'Perfil']];
const PLACE_TAB: Record<Place, Tab> = { engine: 'observatory', farm: 'garden', shop: 'council', plaza: 'memory', mine: 'observatory', forest: 'observatory', mill: 'observatory' };
// Clicks are counted locally and sent as one authoritative batch at most every 500 ms.
const CLICK_FLUSH_MS = 500;

export default function GameView({ onClose, activeArea, keyboardActive = true, registerFlush }: { activeArea: boolean; keyboardActive?: boolean; registerFlush?(fn: (() => Promise<boolean>) | null): void; onClose(): void; onExplorer(): void }) {
  const [state, setState] = useState<GameState | null>(null), [message, setMessage] = useState(''), [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('observatory'), [place, setPlace] = useState<Place>('engine'), [busy, setBusy] = useState(false), [sceneReady, setSceneReady] = useState(false);
  const [pendingClicks, setPendingClicks] = useState(0), clicks = useRef({ pending: 0, inFlight: 0 });
  const guard = useRef(false), epoch = useRef(0), retry = useRef<z.infer<typeof gameInput> | null>(null);
  const queue = useRef<z.infer<typeof gameInput>[]>([]), running = useRef<Promise<void> | null>(null), mounted = useRef(true), stage = useRef<HTMLElement>(null);
  const volume = usePreferences().value.gameVolume, sound = useRef(volume); sound.current = volume;
  const seen = useRef({ flash: '', unlocks: 0, achievements: -1 });
  useSurfaceMotion(stage, tab, activeArea);
  // Polling reports whether the city is actually on screen: only watched time brings a Lampejo closer.
  useEffect(() => {
    if (!activeArea) return;
    let stopped = false;
    async function refresh() { if (guard.current) return; const token = epoch.current; try { const r = await window.desktop.getGame({ watching: !document.hidden }); if (!stopped && token === epoch.current) { if (r.ok) setState(r.value); else setError(r.message); } } catch { if (!stopped) setError('Não foi possível carregar sua cidade. Tente novamente.'); } }
    void refresh(); const timer = setInterval(refresh, 1000); return () => { stopped = true; clearInterval(timer); };
  }, [activeArea]);
  useEffect(() => {
    if (!state) return;
    const s = seen.current, unlocks = state.economy.unlocks.length, achievements = state.economy.achievements.length;
    if (state.flash && state.flash.id !== s.flash) { s.flash = state.flash.id; playCue('flash', sound.current); }
    if (s.achievements >= 0 && (achievements > s.achievements || unlocks > s.unlocks)) playCue('unlock', sound.current);
    s.unlocks = unlocks; s.achievements = achievements;
  }, [state]);
  function drain(): Promise<void> {
    if (running.current) return running.current;
    guard.current = true; epoch.current++; setBusy(true);
    const task = (async () => { while (queue.current.length) { const input = queue.current[0];
      try { const r = await window.desktop.gameAction(input); if (!mounted.current) return;
        if (input.action.kind === 'core-click') { clicks.current.inFlight -= input.action.count; setPendingClicks(clicks.current.pending + clicks.current.inFlight); }
        if (r.ok) { setState(r.value.state); const kind = input.action.kind; if (!r.value.replayed && (kind === 'producer-buy' || kind === 'economy-upgrade' || kind === 'permanent-upgrade')) playCue('buy', sound.current); if (!r.value.replayed && kind === 'flash-catch') playCue('catch', sound.current); setMessage(kind === 'core-click' ? '' : r.value.message); } else setError(r.message);
        queue.current.shift(); retry.current = null; }
      catch { retry.current = input; setError('A resposta não chegou. Repita a tentativa para conferir.'); break; }
    } })().finally(() => { guard.current = false; running.current = null; if (mounted.current) setBusy(false); if (queue.current.length && !retry.current) void drain(); }); running.current = task; return task;
  }
  function execute(action: GameAction, existing?: z.infer<typeof gameInput>) { if (existing) { retry.current = null; setError(''); return drain(); } if (retry.current) return Promise.resolve(); setError(''); queue.current.push({ operationId: crypto.randomUUID(), action }); return drain(); }
  function flushClicks() { const c = clicks.current; if (!c.pending || retry.current) return Promise.resolve(); const count = Math.min(40, c.pending); c.pending -= count; c.inFlight += count; queue.current.push({ operationId: crypto.randomUUID(), action: { kind: 'core-click', count } }); return drain(); }
  useEffect(() => { const timer = setInterval(() => void flushClicks(), CLICK_FLUSH_MS); return () => clearInterval(timer); }, []);
  useEffect(() => { mounted.current = true; registerFlush?.(async () => { while (clicks.current.pending && !retry.current) await flushClicks(); await drain(); return !queue.current.length && !retry.current && !clicks.current.pending; }); return () => { mounted.current = false; registerFlush?.(null); }; }, []);
  function press() { clicks.current.pending++; setPendingClicks(clicks.current.pending + clicks.current.inFlight); playCue('click', sound.current, Math.min(7, Math.floor(clicks.current.pending / 6))); }
  // Space or Enter on the focused core button is native; no global key listener competes with the rest of the app.
  useEffect(() => { if (!keyboardActive) clicks.current.pending && void flushClicks(); }, [keyboardActive]);
  function select(next: Place) { setPlace(next); setTab(PLACE_TAB[next]); setMessage(''); setError(''); }
  const shownCoins = state ? add(state.coins, integer(dec(state.engine.power).mul(pendingClicks))) : undefined;
  return <div className="game-shell clean-game idle-game" data-tab={tab} data-skin={state?.skin ?? 'original'} data-atmosphere={state?.atmosphere ?? 'golden'} aria-busy={busy} data-area-ready={Boolean(error) || Boolean(state && sceneReady)}>
    <header className="game-header" data-hairline><button className="game-back" onClick={onClose}>← <span>Voltar à mesa</span></button><div className="game-brand"><span className="game-brand-mark"><Icon kind="city"/></span><div>NODUS / OBSERVATÓRIO<small>UM NÚMERO QUE CRESCE COM VOCÊ</small></div></div>
      <div className="game-wallet"><span className="wallet-coin"><Icon kind="coin"/></span><AnimatedNumber value={shownCoins} testId="game-coins"/><small>CENTELHAS</small><span className="wallet-rule"/><span className="num wallet-rate">{state ? formatAmount(dec(state.economy.rate).div(60).toDecimalPlaces(1).toString()) : '—'}</span><small>POR SEGUNDO</small><span className="wallet-rule"/><AnimatedNumber value={state?.xp} testId="game-xp"/><small>XP</small></div></header>
    {state && <GameTicker state={state}/>}
    <div className="game-layout"><nav className="game-nav" aria-label="Jogo"><span className="game-nav-caption">VALE SERENO</span>{TABS.map(([id, icon, name]) => { const locked = id === 'garden' && !state?.garden.unlocked || id === 'council' && !state?.council.unlocked; return <button key={id} aria-label={name} className={tab === id ? 'selected' : ''} aria-current={tab === id ? 'page' : undefined} data-locked={locked || undefined} onClick={() => { setTab(id); setMessage(''); setError(''); }}><Icon kind={icon}/><span>{name}</span></button>; })}<div className="game-nav-bottom"><span className="connection connected"/> PROGRESSO LOCAL</div></nav>
      <main className="game-stage" ref={stage}>
        {state && <div className="city-scene-host" hidden={tab !== 'observatory'}><CityScene state={state} selected={place} onSelect={select} active={activeArea && tab === 'observatory'} onReady={() => setSceneReady(true)}/></div>}
        {!state ? <div className="game-loading">Abrindo o observatório…</div>
          : tab === 'observatory' ? <div className="observatory">
            <CorePanel state={state} unconfirmed={pendingClicks} press={press}/>
            <StorePanel state={state} busy={busy} execute={a => void execute(a)}/>
            <div className="observatory-sky"><FlashLight state={state} catchIt={id => void execute({ kind: 'flash-catch', id })}/></div>
            {state.economy.returnReport && <div className="economy-return" role="status"><p>{Math.floor(state.economy.returnReport.elapsedMs / 3600000)} h {Math.floor(state.economy.returnReport.elapsedMs / 60000) % 60} min fora · <strong className="num">+{formatAmount(state.economy.returnReport.credited)}</strong> centelhas produzidas{state.economy.returnReport.capped ? ' (limite de ausência aplicado)' : ''}</p><button aria-label="Dispensar resumo de retorno" disabled={busy} onClick={() => void execute({ kind: 'dismiss-return' })}>×</button></div>}
            <p className="observatory-rule">{state.economy.focusActive ? 'Foco ativo: nenhum Lampejo aparece até a sessão parar.' : flashRule}</p>
          </div>
          : tab === 'garden' ? <GardenPanel state={state} busy={busy} execute={a => void execute(a)}/>
          : tab === 'council' ? <CouncilPanel state={state} busy={busy} execute={a => void execute(a)}/>
          : tab === 'memory' ? <MemoryPanel state={state} busy={busy} execute={a => void execute(a)}/>
          : tab === 'achievements' ? <AchievementsPanel state={state}/>
          : tab === 'legacy' ? <LegacyPanel state={state} busy={busy} execute={a => void execute(a)}/>
          : <ProfilePanel state={state} busy={busy} execute={a => void execute(a)}/>}
        <div className="game-notice" aria-live="polite">{error ? <span className="game-error">{error}{retry.current && <button disabled={busy} onClick={() => retry.current && execute(retry.current.action, retry.current)}>Repetir tentativa</button>}</span> : message && <span>{message}</span>}</div>
      </main>
    </div>
  </div>;
}
