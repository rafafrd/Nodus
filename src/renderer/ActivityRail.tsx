import { Icon } from './Icon';
import { Avatar, usePreferences } from './preferences';
export type Area = 'study' | 'explorer' | 'city' | 'settings';
export function ActivityRail({ active, navigate, pending }: { active: Area; navigate(area: Area): void; pending: boolean }) {
  const { value } = usePreferences();
  return <nav className="activity-rail" aria-label="Áreas do Nodus" aria-busy={pending}>
    <span className="rail-brand" title="Nodus"><Icon/></span>
    {([['study', 'book', 'Estudos', 'Voltar aos estudos'], ['explorer', 'folder', 'Explorer', 'Abrir Explorer'], ['city', 'city', 'Cidade', 'Entrar na cidade']] as const).map(([area, icon, title, label]) =>
      <button key={area} aria-label={label} aria-current={active === area ? 'page' : undefined} className={active === area ? 'selected' : ''} onPointerEnter={() => { if (area === 'explorer') void import('./ProjectWorkspace'); if (area === 'city') void import('./GameView'); }} onFocus={() => { if (area === 'explorer') void import('./ProjectWorkspace'); if (area === 'city') void import('./GameView'); }} onClick={() => navigate(area)}><Icon kind={icon}/><span>{title}</span></button>)}
    <button className={`rail-settings ${active === 'settings' ? 'selected' : ''}`} aria-label="Abrir configurações" aria-current={active === 'settings' ? 'page' : undefined} onClick={() => navigate('settings')}><Icon kind="settings"/><span>Ajustes</span></button>
    <button className="rail-profile" aria-label="Ver perfil" title={value.name || 'Seu perfil local'} onClick={() => navigate('settings')}><Avatar profile={value}/><span>{value.name || 'Local'}</span></button>
  </nav>;
}
