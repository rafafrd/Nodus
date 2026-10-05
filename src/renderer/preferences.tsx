import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Preferences } from '../shared/preferences';
import { PHOTO_LIMIT } from '../shared/preferences';
import type { Result } from '../shared/contracts';
const EVENT = 'nodus:appearance';
export function motionPreference() {
  const system = matchMedia('(prefers-reduced-motion: reduce)');
  return { get matches() { return document.documentElement.dataset.animations === 'off' || system.matches; }, addEventListener(_event: string, fn: () => void) { system.addEventListener('change', fn); window.addEventListener(EVENT, fn); }, removeEventListener(_event: string, fn: () => void) { system.removeEventListener('change', fn); window.removeEventListener(EVENT, fn); } };
}
function appearance(value: Preferences) { document.documentElement.dataset.theme = value.theme; document.documentElement.dataset.animations = value.animations ? 'on' : 'off'; window.dispatchEvent(new Event(EVENT)); }
type PreferencesContextValue = { value: Preferences; busy: boolean; error: string; update(input: Parameters<typeof window.desktop.updatePreferences>[0]): Promise<boolean>; photo(file: File): Promise<boolean>; removePhoto(): Promise<boolean> };
const PreferencesContext = createContext<PreferencesContextValue | null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<Preferences | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [retry, setRetry] = useState(0);
  const mutating = useRef(false);
  useEffect(() => { let stopped = false; setError(''); void window.desktop.getPreferences().then(r => { if (stopped) return; if (r.ok) { appearance(r.value); setValue(r.value); } else setError(r.message); }).catch(() => { if (!stopped) setError('Não foi possível carregar as configurações. Tente novamente.'); }); return () => { stopped = true; }; }, [retry]);
  useLayoutEffect(() => { if (value) appearance(value); }, [value?.theme, value?.animations]);
  async function mutate(action: () => Promise<Result<Preferences>>) {
    if (mutating.current) return false; mutating.current = true; setBusy(true); setError('');
    try { const r = await action(); if (!r.ok) { setError(r.message); return false; } setValue(r.value); return true; }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível salvar. As configurações anteriores foram conservadas.'); return false; }
    finally { mutating.current = false; setBusy(false); }
  }
  if (!value) return <div className="preferences-loading" role="status">{error || 'Preparando seu espaço…'}{error && <button onClick={() => setRetry(n => n + 1)}>Tentar novamente</button>}</div>;
  return <PreferencesContext.Provider value={{ value, error, busy, update: input => mutate(() => window.desktop.updatePreferences(input)), photo: file => mutate(async () => { if (!file.size || file.size > PHOTO_LIMIT) throw Error('Escolha PNG ou JPEG de até 5 MB.'); return window.desktop.setProfilePhoto({ bytes: new Uint8Array(await file.arrayBuffer()) }); }), removePhoto: () => mutate(() => window.desktop.removeProfilePhoto()) }}>{children}</PreferencesContext.Provider>;
}
export function usePreferences() { const value = useContext(PreferencesContext); if (!value) throw Error('Configurações não carregadas.'); return value; }
export function Avatar({ profile, className = '' }: { profile: Preferences; className?: string }) {
  const initials = profile.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('pt-BR') || 'N';
  return <span className={`profile-avatar ${className}`}>{profile.photo ? <img src={profile.photo} alt="Foto do perfil"/> : <span aria-hidden="true">{initials}</span>}</span>;
}
