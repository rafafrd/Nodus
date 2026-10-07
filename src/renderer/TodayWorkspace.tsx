import { useEffect, useRef, useState } from 'react';
import type { TodayState } from '../shared/study';
import { Icon } from './Icon';
import { useSurfaceMotion } from './motion';
import { Avatar, usePreferences } from './preferences';
import { LegacyTodayWorkspace } from './LegacyTodayWorkspace';
function EditorialTodayWorkspace({activeArea,openSubject,review,search}:{activeArea:boolean;openSubject(id:string):Promise<void>;review():void;search():void}) {
  const [data,setData]=useState<TodayState|null>(null),[error,setError]=useState(''),[revision,setRevision]=useState(0);const host=useRef<HTMLDivElement>(null);useSurfaceMotion(host, String(revision),activeArea);
  useEffect(()=>{if(!activeArea)return;let stopped=false;async function load(){const r=await window.desktop.today();if(stopped)return;if(r.ok){setData(r.value);setError('');}else setError(r.message);}void load().catch(()=>setError('Não foi possível consultar o dia.'));const timer=setInterval(()=>void load().catch(()=>{}),15000);return()=>{stopped=true;clearInterval(timer);};},[activeArea,revision]);
  const {value:profile}=usePreferences();
  const last=data?.subjects.find(s=>s.id===data.lastSubjectId);
  return <div className="study-workspace today-workspace" data-area-ready="true" ref={host}>
    <header className="dashboard-header"><div className="dashboard-identity"><Avatar profile={profile}/><div><span className="eyebrow">NODUS / VISÃO DO DIA</span><h1>Hoje</h1><p>{profile.name||'Seu espaço de estudo'} <span className="meta-dot">·</span> Notas, material e próximos passos</p></div></div><div className="dashboard-date"><time>{new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</time><button onClick={()=>setRevision(n=>n+1)}><Icon kind="refresh"/> Atualizar Hoje</button></div></header>
    {error&&<p role="alert">{error}</p>}{!data&&!error&&<p className="study-muted" role="status">Consultando seu dia…</p>}
    <div className="today-stats">
      <div><small>01 / FOCO HOJE</small><strong>{data?Math.floor(data.focusMs/60000):'—'}<span> min</span></strong><p>Tempo registrado, sem pausas.</p></div>
      <div><small>02 / REVISÕES PENDENTES</small><strong>{data?.due??'—'}<span> cartões</span></strong><button onClick={review}>Abrir revisões <Icon kind="arrow"/></button></div>
      <div><small>03 / CHECKLIST ABERTO</small><strong>{data?.tasks.length??'—'}<span> tarefas</span></strong><p>Próximas ações nas suas matérias.</p></div>
      <div><small>04 / ACERVO</small><strong>{data?.subjects.length??'—'}<span> matérias</span></strong><button onClick={search}>Buscar no acervo <kbd>Ctrl K</kbd></button></div>
    </div>
    <div className="dashboard-columns"><section><div className="study-section-heading"><h2>Próximos passos</h2><span>{data?.tasks.length??0} em aberto</span></div>{data&&!data.tasks.length&&<p className="dashboard-empty">Seu checklist está livre. Adicione uma tarefa na mesa de uma matéria.</p>}<div className="today-tasks">{data?.tasks.map((task,index)=><button key={task.id} onClick={()=>void openSubject(task.subjectId)}><span className="row-index">{String(index+1).padStart(2,'0')}</span><span><strong>{task.text}</strong><small>{task.subject} · {task.total?`${task.done}/${task.total} etapas`:'Sem etapas ainda'}</small></span><Icon kind="arrow"/></button>)}</div></section>
      <section className="dashboard-resume"><div className="study-section-heading"><h2>Em andamento</h2><span>MESA</span></div><div className="resume-sheet"><span className="eyebrow">CONTINUAR DE ONDE PAROU</span><Icon kind="book"/><h3>{last?.name??'Sua primeira matéria'}</h3><p>{last?'Volte às suas notas, ao material e à próxima etapa.':'Crie uma matéria para organizar seus estudos.'}</p><button onClick={()=>last?void openSubject(last.id):search()}>{last?'Retomar mesa':'Encontrar uma ação'} <Icon kind="arrow"/></button></div></section></div>
    <section><div className="study-section-heading"><h2>Suas matérias</h2><span>{data?.subjects.length??0} no acervo</span></div><div className="today-subjects">{data?.subjects.map((s,index)=><button key={s.id} onClick={()=>void openSubject(s.id)}><span className="subject-card-meta"><span>{String(index+1).padStart(2,'0')} / MATÉRIA</span><Icon kind="book"/></span><strong>{s.name}</strong><span className="subject-card-action">Abrir mesa <Icon kind="arrow"/></span></button>)}</div>{data&&!data.subjects.length&&<p className="dashboard-empty">Nenhuma matéria ainda. Use a busca para criar a primeira.</p>}</section>
    <footer className="dashboard-foot"><span>ARQUIVOS LOCAIS / SEU ESPAÇO PESSOAL</span><button onClick={search}>Busca e ações <kbd>Ctrl K</kbd></button></footer>
  </div>;
}

export function TodayWorkspace(props: Parameters<typeof EditorialTodayWorkspace>[0]) {
  const {value}=usePreferences();
  return value.theme === 'editorial' ? <EditorialTodayWorkspace {...props}/> : <LegacyTodayWorkspace {...props}/>;
}
