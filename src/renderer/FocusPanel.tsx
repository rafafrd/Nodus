import { useEffect, useState } from 'react';
import type { FocusState } from '../shared/contracts';
import { Icon } from './Icon';
export function FocusPanel({ subjectId, onError }: { subjectId: string; onError(message: string): void }) {
  const [state, setState] = useState<FocusState>({ session: null, activeOwner: null }); const [minutes, setMinutes] = useState(25);
  useEffect(() => {
    let stopped = false;
    async function load() { const r = await window.desktop.getFocus({ subjectId }); if (!stopped) { if (r.ok) setState(r.value); else onError(r.message); } }
    void load(); const timer = setInterval(load, 500); return () => { stopped = true; clearInterval(timer); };
  }, [subjectId]);
  async function start() { const r = await window.desktop.startFocus({ subjectId, minutes }); if (r.ok) setState(r.value); else onError(r.message); }
  async function act(action: 'pause' | 'resume' | 'finish') { if (!state.session) return; const r = await window.desktop.actFocus({ subjectId, id: state.session.id, action }); if (r.ok) setState(r.value); else onError(r.message); }
  const session = state.session; const open = session && ['paused', 'running'].includes(session.state);
  const seconds = Math.ceil(Math.max(0, (session ? session.durationMs - session.elapsedMs : minutes * 60000)) / 1000);
  const progress = session ? Math.min(1, session.elapsedMs / session.durationMs) : 0;
  return <div className="focus-body"><div className="focus-row"><div className="focus-orbit" aria-hidden="true"><svg viewBox="0 0 72 72"><circle className="focus-track" cx="36" cy="36" r="30"/><circle className="focus-progress" cx="36" cy="36" r="30" strokeDasharray={Math.PI * 60} strokeDashoffset={Math.PI * 60 * (1 - progress)}/></svg><Icon kind="focus"/></div><div className="focus-reading"><div className="focus-time-line"><span className="focus-clock" data-testid="focus-clock" role="timer" aria-live="off">{String(Math.floor(seconds / 60)).padStart(2, '0')}<span>:</span>{String(seconds % 60).padStart(2, '0')}</span><span className="focus-state">{session?.state === 'running' ? 'EM FOCO' : session?.state === 'paused' ? 'PAUSADO' : session?.state === 'completed' ? 'CONCLUÍDO' : session?.state === 'ended' ? 'ENCERRADO' : 'SEU TEMPO'}</span></div><p className="focus-detail">{session ? `${Math.round(session.elapsedMs / 1000)}s ativos · ${session.durationMs / 60000} min escolhidos` : 'Uma coisa de cada vez. No seu ritmo.'}</p></div></div>
    {session?.recovered && <p className="recovery-hint">Sessão recuperada no último checkpoint. O intervalo fechado não foi contado.</p>}
    {state.activeOwner && state.activeOwner.id !== subjectId && <p className="recovery-hint">Foco em andamento: {state.activeOwner.name}</p>}
    {!open && <div className="focus-presets" aria-label="Durações sugeridas">{[15, 25, 50].map(value => <button key={value} aria-pressed={minutes === value} onClick={() => setMinutes(value)}>{value} min</button>)}</div>}
    <div className="focus-actions">{!open ? <><label>Minutos<input type="number" min="1" max="480" aria-label="Minutos de foco" value={minutes} onChange={e => setMinutes(Number(e.target.value))}/></label><button className="primary" disabled={Boolean(state.activeOwner)} onClick={start}>Iniciar foco</button></> : <><button className="primary" disabled={session?.state === 'paused' && Boolean(state.activeOwner)} onClick={() => act(session!.state === 'running' ? 'pause' : 'resume')}>{session?.state === 'running' ? 'Pausar foco' : 'Retomar foco'}</button><button onClick={() => act('finish')}>Encerrar foco</button></>}</div>
  </div>;
}
