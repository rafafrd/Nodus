import { Icon } from './Icon';
import { Avatar, usePreferences } from './preferences';
import { MODULE_DRAG_TYPE, type WorkspaceArea } from '../shared/workspace';
export type Area = 'home' | 'study' | 'review' | 'graph' | 'explorer' | 'city' | 'settings';
const groups = [
  { name: 'Estudo', items: [['study','book','Caderno','Voltar aos estudos'],['pdf','note','PDF','Abrir PDF'],['video','play','Vídeo','Abrir Vídeo'],['review','memory','Revisão','Abrir revisões'],['graph','orbit','Grafo','Abrir grafo']] },
  { name: 'Espaço pessoal', items: [['home','focus','Hoje','Abrir Hoje'],['explorer','folder','Explorer','Abrir Explorer'],['city','city','Cidade','Entrar na cidade'],['settings','settings','Ajustes','Abrir configurações']] },
] as const;
export function ActivityRail({ active, panes, navigate, add, drag, pending, search }: {
  active: WorkspaceArea; panes: WorkspaceArea[]; navigate(area: WorkspaceArea): void; add(area: WorkspaceArea): void;
  drag(area: WorkspaceArea | null): void; pending: boolean; search(): void;
}) {
  const { value } = usePreferences();
  function preload(area: WorkspaceArea) { if (area === 'explorer') void import('./ProjectWorkspace'); if (area === 'city') void import('./GameView'); }
  return <nav className="activity-rail module-sidebar" aria-label="Áreas do Nodus" aria-busy={pending}>
    <div className="rail-identity"><span className="rail-brand" title="Nodus"><Icon/></span><span>Nodus<small>ESPAÇO DE TRABALHO</small></span></div>
    <button className="rail-search" aria-label="Abrir busca global" title="Busca global · Ctrl+K" onClick={search}><Icon kind="search"/><span>Buscar</span><kbd>Ctrl K</kbd></button>
    <div className="rail-modules">
      {groups.map(group => <section className="rail-group" key={group.name} aria-label={group.name}><h2>{group.name}</h2>
        {group.items.map(([area, icon, title, label]) => <div key={area} className={`rail-module ${active === area ? 'selected' : ''}`}>
          <button aria-label={label} aria-current={active === area ? 'page' : undefined} disabled={pending} draggable={!pending}
            onDragStart={event => { event.dataTransfer.setData(MODULE_DRAG_TYPE, area); event.dataTransfer.effectAllowed = 'copy'; drag(area); }} onDragEnd={() => drag(null)}
            onPointerEnter={() => preload(area)} onFocus={() => preload(area)} onClick={() => navigate(area)}><Icon kind={icon}/><span>{title}</span>{panes.includes(area) && <i className="rail-open-marker" title="Aberto nesta aba"/>}</button>
          <button className="rail-module-add" aria-label={`Dividir com ${title}`} title={`Adicionar ${title} à divisão`} disabled={pending || panes.length >= 4 || panes.includes(area)} onClick={() => add(area)}>+</button>
        </div>)}
      </section>)}
    </div>
    <p className="rail-drag-hint">Clique para abrir.<br/>Arraste para dividir.</p>
    <button className="rail-profile" aria-label="Ver perfil" title={value.name || 'Seu perfil local'} onClick={() => navigate('settings')}><Avatar profile={value}/><span>{value.name || 'Perfil local'}<small>NO SEU COMPUTADOR</small></span></button>
  </nav>;
}
