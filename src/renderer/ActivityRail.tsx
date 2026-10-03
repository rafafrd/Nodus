import { Icon } from './Icon';
export type Area = 'study' | 'explorer' | 'city';
export function ActivityRail({ active, navigate, pending }: { active: Area; navigate(area: Area): void; pending: boolean }) {
  return <nav className="activity-rail" aria-label="Áreas do Nodus" aria-busy={pending}>
    <span className="rail-brand" title="Nodus"><Icon/></span>
    {([['study', 'book', 'Estudos', 'Voltar aos estudos'], ['explorer', 'folder', 'Explorer', 'Abrir Explorer'], ['city', 'city', 'Cidade', 'Entrar na cidade']] as const).map(([area, icon, title, label]) =>
      <button key={area} aria-label={label} aria-current={active === area ? 'page' : undefined} className={active === area ? 'selected' : ''} onPointerEnter={() => { if (area === 'explorer') void import('./ProjectWorkspace'); if (area === 'city') void import('./GameView'); }} onFocus={() => { if (area === 'explorer') void import('./ProjectWorkspace'); if (area === 'city') void import('./GameView'); }} onClick={() => navigate(area)}><Icon kind={icon}/><span>{title}</span></button>)}
    <span className="rail-local" title="Perfil local"><span className="connection connected"/>Local</span>
  </nav>;
}
