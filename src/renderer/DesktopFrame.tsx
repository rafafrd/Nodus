import { useEffect, useState, type ReactNode } from 'react';
import type { WindowState } from '../shared/window';
import './desktop.css';
export function DesktopFrame({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WindowState>({ maximized: false, minimized: false, fullscreen: false }), [error, setError] = useState('');
  useEffect(() => { const remove = window.desktop.onWindowState(setState); void window.desktop.getWindowState().then(r => { if (r.ok) setState(r.value); }); return remove; }, []);
  async function command(action: 'minimize' | 'toggle-maximize' | 'close') {
    try { const r = await window.desktop.controlWindow({ action }); if (r.ok) { setState(r.value); setError(''); } else setError(r.message); }
    catch { setError('Não foi possível controlar a janela. Tente novamente.'); }
  }
  return <div className="desktop-frame"><header className="desktop-titlebar" data-testid="titlebar"><div className="desktop-drag"><span className="desktop-emblem" aria-hidden="true">N</span><strong>Nodus</strong><span className="desktop-caption">ESPAÇO PESSOAL / LOCAL</span></div><div className="window-buttons"><button aria-label="Minimizar janela" title="Minimizar" onClick={() => void command('minimize')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg></button><button aria-label={state.maximized ? 'Restaurar janela' : 'Maximizar janela'} title={state.maximized ? 'Restaurar' : 'Maximizar'} onClick={() => void command('toggle-maximize')}><svg viewBox="0 0 16 16" aria-hidden="true">{state.maximized ? <path d="M5 5V3h8v8h-2M3 5h8v8H3z"/> : <path d="M3 3h10v10H3z"/>}</svg></button><button className="window-close" aria-label="Fechar janela" title="Fechar" onClick={() => void command('close')}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8"/></svg></button></div></header><div className="desktop-content">{children}</div>{error && <div className="window-error" role="alert">{error}</div>}</div>;
}
