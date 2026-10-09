import { Icon } from './Icon';
import { Avatar, usePreferences } from './preferences';
import { MODULE_DRAG_TYPE, type WorkspaceArea } from '../shared/workspace';
import type { Subject } from '../shared/contracts';
export type Area = 'home' | 'study' | 'review' | 'graph' | 'explorer' | 'city' | 'settings';
const groups = [
  { name: 'Estudo', items: [['study','book','Caderno','Voltar aos estudos'],['pdf','note','PDFs','Abrir PDF'],['video','play','Aulas','Abrir Vídeo'],['review','memory','Revisão','Abrir revisões'],['graph','orbit','Conexões','Abrir grafo']] },
  { name: 'Espaço pessoal', items: [['home','city','Início','Abrir início'],['explorer','folder','Projetos','Abrir Explorer'],['city','city','Cidade','Entrar na cidade'],['settings','settings','Ajustes','Abrir configurações']] },
] as const;
export function ActivityRail({ active, panes, navigate, add, drag, pending, search,subjects,subjectId,selectSubject,newSubject,newNote,browse,addContent }: {
  subjects:Subject[];subjectId:string|null;selectSubject(id:string):void;newSubject():void;newNote():void;browse():void;addContent():void;
  active: WorkspaceArea; panes: WorkspaceArea[]; navigate(area: WorkspaceArea): void; add(area: WorkspaceArea): void;
  drag(area: WorkspaceArea | null): void; pending: boolean; search(): void;
}) {
  const { value } = usePreferences();
  function preload(area: WorkspaceArea) { if (area === 'explorer') void import('./ProjectWorkspace'); if (area === 'city') void import('./GameView'); }
  return <nav id="nodus-sidebar" className="activity-rail module-sidebar" hidden={value.sidebarCollapsed} aria-label="Áreas do Nodus" aria-busy={pending}>
    <div className="rail-identity"><span className="rail-brand" title="Nodus"><Icon/></span><span>Nodus<small>ESPAÇO DE TRABALHO</small></span></div>
    <button className="rail-search" aria-label="Abrir busca global" title="Busca global · Ctrl+K" onClick={search}><Icon kind="search"/><span>Buscar</span><kbd>Ctrl K</kbd></button>
    <div className="rail-subject"><label>Matéria atual<select aria-label="Matéria atual" value={subjectId??''} disabled={pending||!subjects.length} onChange={e=>selectSubject(e.target.value)}><option value="" disabled>Escolha uma matéria</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button onClick={newSubject} aria-label="Nova matéria pelo menu">+ Matéria</button><button className="primary" onClick={newNote} disabled={pending}>Nova nota</button><button className="rail-add-content" onClick={addContent} disabled={pending}><Icon kind="plus"/> Adicionar conteúdo</button>{subjectId&&<button onClick={browse}>Minhas notas</button>}</div>
    <div className="rail-modules">
      {groups.map(group => <section className="rail-group" key={group.name} aria-label={group.name}><h2>{group.name}</h2>
        {group.items.map(([area, icon, title, label]) => <div key={area} className={`rail-module ${active === area ? 'selected' : ''}`}>
          <button aria-label={label} aria-current={active === area ? 'page' : undefined} disabled={pending} draggable={!pending}
            onDragStart={event => { event.dataTransfer.setData(MODULE_DRAG_TYPE, area); event.dataTransfer.effectAllowed = 'copy'; drag(area); }} onDragEnd={() => drag(null)}
            onPointerEnter={() => preload(area)} onFocus={() => preload(area)} onClick={() => navigate(area)}><Icon kind={icon}/><span>{title}<small>{({study:'Escrever e organizar',pdf:'Ler e anotar',video:'Assistir e capturar',review:'Relembrar e praticar',graph:'Relacionar ideias',home:'Seu ponto de partida',explorer:'Arquivos de projetos',city:'Construir e explorar',settings:'Seu perfil e preferências'} as Record<string,string>)[area]}</small></span>{panes.includes(area) && <i className="rail-open-marker" title="Aberto nesta aba"/>}</button>
          <button className="rail-module-add" aria-label={`Dividir com ${title}`} title={`Adicionar ${title} à divisão`} disabled={pending || panes.length >= 4 || panes.includes(area)} onClick={() => add(area)}>+</button>
        </div>)}
      </section>)}
    </div>
    <details className="rail-navigation-help"><summary>Como navegar</summary><p>Escolha a matéria acima. Abra Caderno, PDFs ou Aulas para estudar. Use o + ao lado de uma área para trabalhar com duas na mesma tela. Sua edição fica preservada ao trocar de área.</p></details>
    <button className="rail-profile" aria-label="Ver perfil" title={value.name || 'Seu perfil local'} onClick={() => navigate('settings')}><Avatar profile={value}/><span>{value.name || 'Perfil local'}<small>NO SEU COMPUTADOR</small></span></button>
  </nav>;
}
