import type { ProjectRef } from '../shared/projects';
import { Icon } from './Icon';
import { usePreferences } from './preferences';

export function ProjectOverview({ projects, loading, choose, add }: { projects: ProjectRef[]; loading: boolean; choose(id: string): void; add(): void }) {
  const prefs = usePreferences();
  return <div className="project-overview">
    <header><div><span className="eyebrow">EXPLORER / ACERVO LOCAL</span><h1>Projetos</h1><p>{loading ? 'Retomando seus projetos…' : `${projects.length} pastas vinculadas · Escolha um projeto e abra um arquivo na árvore.`}</p></div><button onClick={add}><Icon kind="plus"/> Adicionar projeto</button></header>
    {prefs.error && <p role="alert">{prefs.error}</p>}
    {([true, false] as const).map(featured => {
      const group = projects.filter(p => prefs.value.featuredProjectIds.includes(p.id) === featured);
      return <section key={String(featured)}><div className="study-section-heading"><h2>{featured ? 'Projetos principais' : 'Projetos secundários'}</h2><span>{String(group.length).padStart(2, '0')} PROJETOS</span></div>
        <div className={`project-card-grid ${featured ? 'featured' : 'secondary'}`}>{group.map((project, index) => <article className="project-card" key={project.id}>
          <button className="project-card-open" aria-label={`Explorar ${project.name}`} onClick={() => choose(project.id)}><div className="project-card-drawing"><span>{String(index + 1).padStart(2, '0')}</span><Icon kind="folder"/><small>{project.available ? 'PASTA LOCAL' : 'INDISPONÍVEL'}</small></div><div className="project-card-heading"><h3>{project.name}</h3><Icon kind="arrow"/></div><p>{project.available ? 'Navegar arquivos e retomar o trabalho.' : 'Pasta ausente. Seus rascunhos estão preservados.'}</p></button>
          <footer><span>{featured ? 'PRINCIPAL' : 'SECUNDÁRIO'}</span><button disabled={prefs.busy} aria-label={`${featured ? 'Tornar secundário' : 'Tornar principal'} ${project.name}`} onClick={() => void prefs.update({ featuredProjectIds: featured ? prefs.value.featuredProjectIds.filter(id => id !== project.id) : [...prefs.value.featuredProjectIds, project.id] })}>{featured ? 'Tornar secundário' : 'Tornar principal'} <Icon kind="arrow"/></button></footer>
        </article>)}</div>
        {!group.length && <p className="dashboard-empty">{featured ? 'Marque como principal um projeto que merece mais atenção.' : 'Seus outros projetos aparecem aqui. Adicione uma pasta para começar.'}</p>}
      </section>;
    })}
    <footer className="dashboard-foot"><span>PASTAS LOCAIS / ARQUIVOS UTF-8</span><span>Ctrl S salva a aba ativa</span></footer>
  </div>;
}
