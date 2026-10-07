import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { NoteEditor } from './NoteEditor';
import type { Subject, NoteRef, Desk, Material } from '../shared/contracts';
import { useNote } from './useNote';
import { PdfPane } from './PdfPane';
import { Icon as Mark } from './Icon';
import { ActivityRail } from './ActivityRail';
import { usePreferences } from './preferences';
import { WorkspaceFrame } from './WorkspaceFrame';
import { SuspendedTools } from './SuspendedTools';
import type { WorkspaceArea, WorkspaceLayout } from '../shared/workspace';
import { AreaStage, useSurfaceMotion } from './motion';
import { MotionDialog } from './MotionDialog';
import { useVideos, VideoLibrary, VideoSurface } from './VideoWorkspace';
import { CommandPalette,type Command } from './CommandPalette';
import { TodayWorkspace } from './TodayWorkspace';
import { FlashcardsWorkspace,type CardSource } from './FlashcardsWorkspace';
import type { SearchHit } from '../shared/study';
import './study.css';
import './refinement.css';
import './styles.css';
import './themes.css';
import './settings.css';
import './editorial.css';
import './workspace.css';
import { EditorialBackdrop } from './EditorialBackdrop';
const SettingsWorkspace = lazy(() => import('./SettingsWorkspace'));
const GameView = lazy(() => import('./GameView'));
const ProjectWorkspace = lazy(() => import('./ProjectWorkspace'));
const GraphWorkspace = lazy(() => import('./GraphWorkspace'));
export function App() {
  const {value:preferences,update:updatePreferences}=usePreferences();
  const [layout,setLayout]=useState<WorkspaceLayout>(preferences.workspaceLayout),layoutRef=useRef(layout);layoutRef.current=layout;
  const [focused,setFocused]=useState(0),focusedRef=useRef(0),[browseOpen,setBrowseOpen]=useState(false),[toolOpen,setToolOpen]=useState<'focus'|'checklist'|null>(null);
  const layoutSave=useRef(Promise.resolve(true)),gameFlush=useRef<(()=>Promise<boolean>)|null>(null);
  function saveLayout(next:WorkspaceLayout){layoutRef.current=next;setLayout(next);const saving=updatePreferences({workspaceLayout:next});layoutSave.current=saving;void saving.then(ok=>{if(!ok)setError('Não foi possível salvar o layout. Tente novamente.');});return saving;}
  function resize(sizes:number[]){const next={...layoutRef.current,sizes};layoutRef.current=next;setLayout(next);}
  function focusPane(area:string){const index=layoutRef.current.panes.indexOf(area as WorkspaceArea);if(index<0)return;focusedRef.current=index;setFocused(index);visibleArea.current=area as WorkspaceArea;setCurrentArea(area as WorkspaceArea);}
  function closePane(index:number){const current=layoutRef.current,next={panes:current.panes.filter((_,i)=>i!==index),sizes:current.sizes.filter((_,i)=>i!==index)};const sum=next.sizes.reduce((a,b)=>a+b,0);next.sizes=next.sizes.map(n=>n/sum*100);const priorFocus=next.panes.indexOf(current.panes[focusedRef.current]);const focus=priorFocus>=0?priorFocus:Math.min(index,next.panes.length-1);void saveLayout(next);focusedRef.current=focus;setFocused(focus);visibleArea.current=next.panes[focus];setCurrentArea(next.panes[focus]);}
  function singlePane(){const area=layoutRef.current.panes[focusedRef.current];void saveLayout({panes:[area],sizes:[100]});focusedRef.current=0;setFocused(0);}
  const shown=(area:WorkspaceArea)=>layout.panes.includes(area);

  const [version, setVersion] = useState('Inicializando…');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [active, setActive] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<NoteRef[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialGeneration, setMaterialGeneration] = useState(0);
  const [desk, setDesk] = useState<Desk | null>(null);
  const [vault, setVault] = useState<string | null>(null);
  const [modal, setModal] = useState<'subject' | 'rename' | 'note' | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('sage');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentArea, setCurrentArea] = useState<WorkspaceArea>(layout.panes[0]), [visited, setVisited] = useState<WorkspaceArea[]>([...new Set(['study' as const,...layout.panes])]);
  const gameOpen = shown('city'), explorerOpen = shown('explorer'), settingsOpen = shown('settings');
  const destination = useRef({area:layout.panes[0],index:0}), visibleArea = useRef<WorkspaceArea>(layout.panes[0]), navigating = useRef(false);
  const [navigationPending, setNavigationPending] = useState(false);
  const [palette,setPalette]=useState(false),[cardSource,setCardSource]=useState<CardSource|null>(null),[requestedProject,setRequestedProject]=useState<{id:string;nonce:string}|null>(null);
  const projectFlush = useRef<(() => Promise<boolean>) | null>(null);
  const area = useRef({ gameOpen, explorerOpen, settingsOpen,currentArea }); area.current = { gameOpen, explorerOpen, settingsOpen,currentArea };
  const note = useNote(setError);
  const latest = useRef({ note, active, desk }); latest.current = { note, active, desk };
  const sequence = useRef(0);
  const workspace = useRef<HTMLDivElement>(null);
  useSurfaceMotion(workspace, active?.id ?? "empty", currentArea === 'study');
  const videos = useVideos({ subject: active, shown: shown('video'), selectedId: desk?.videoId ?? null, select: videoId => checkpoint({ videoId }), returnToVideo: async video => { const subject = subjects.find(s => s.id === video.subjectId); if (subject && subject.id !== latest.current.active?.id) await select(subject); await checkpoint({ videoId: video.id, materialView: 'video' }); await navigate('video'); }, onError: setError });
  useEffect(() => { if (note.doc) setNotes(n => n.map(v => v.id === note.doc!.ref.id ? note.doc!.ref : v)); }, [note.doc?.ref.id, note.doc?.ref.title]);
  useEffect(() => window.desktop.onStorageError(setError), []);
  useEffect(() => {
    void window.desktop.version().then(r => setVersion(r.ok ? `v${r.value.version}` : r.message)).catch(() => setError('Não foi possível iniciar o desktop.'));
    void window.desktop.bootstrap().then(r => {
      if (!r.ok) { setError(r.message); return; }
      setSubjects(r.value.subjects); setVault(r.value.vault);
      const subject = r.value.subjects.find(s => s.id === r.value.activeSubjectId) ?? r.value.subjects[0];
      if (subject) void select(subject);
    });
    return window.desktop.onBeforeClose(() => { void (async () => { if (await layoutSave.current && await latest.current.note.stash() && (!projectFlush.current || await projectFlush.current()) && (!gameFlush.current || await gameFlush.current())) { const r = await window.desktop.finishClose(); if (!r.ok) setError(r.message); } })(); });
  }, []);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if(document.querySelector('.video-cinema')||document.querySelector('dialog[open]'))return;
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setPalette(true);return;}
      if(event.altKey&&['1','2'].includes(event.key)){event.preventDefault();setToolOpen(event.key==='1'?'focus':'checklist');return;}
      if(event.key==='Escape'){setToolOpen(null);setBrowseOpen(false);}
      if (area.current.currentArea!=='study') return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void latest.current.note.save(); }

    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);
  async function select(subject: Subject) {
    const token = ++sequence.current;
    if (!await latest.current.note.stash()) return;
    setLoading(true);
    const [d, n, m] = await Promise.all([window.desktop.openDesk({ subjectId: subject.id }), window.desktop.listNotes({ subjectId: subject.id }), window.desktop.listMaterials({ subjectId: subject.id })]);
    if (token !== sequence.current) return;
    setLoading(false);
    if (!d.ok || !n.ok || !m.ok) { setError(!d.ok ? d.message : !n.ok ? n.message : !m.ok ? m.message : 'Erro ao abrir mesa'); return; }
    setActive(subject); setDesk(d.value); setNotes(n.value); setMaterials(m.value); setSearch('');setBrowseOpen(false); latest.current.note.clear();
    latest.current.active = subject; latest.current.desk = d.value;
    if (d.value.noteId) { const r = await window.desktop.openNote({ id: d.value.noteId }); if (token === sequence.current) { if (r.ok) latest.current.note.load(r.value); else setError(r.message); } }
  }
  async function checkpoint(patch: Partial<Omit<Desk, 'subjectId'>>) {
    const subject = latest.current.active; if (!subject) return;
    const r = await window.desktop.saveDesk({ subjectId: subject.id, ...patch });
    if (r.ok && latest.current.active?.id === subject.id) { setDesk(r.value); latest.current.desk = r.value; } else if (!r.ok) setError(r.message);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (modal === 'note') {
      if (!active || !await note.stash()) return;
      const r = await window.desktop.createNote({ subjectId: active.id, title: name });
      if (!r.ok) { setError(r.message); return; }
      note.load(r.value); setNotes(n => [...n, r.value.ref]); await checkpoint({ noteId: r.value.ref.id, preview: false });
    } else if (modal === 'rename') {
      if (!active) return;
      const r = await window.desktop.renameSubject({ id: active.id, name });
      if (!r.ok) { setError(r.message); return; }
      setSubjects(s => s.map(v => v.id === active.id ? r.value : v)); setActive(r.value);
    } else {
      const r = await window.desktop.createSubject({ name, color: color as 'sage' });
      if (!r.ok) { setError(r.message); return; }
      setSubjects(s => [...s, r.value]); await select(r.value);
    }
    setModal(null); setName('');
  }
  const deferredModal=useRef<'subject'|'note'|null>(null);
  function newModal(value: typeof modal) { setName(value === 'rename' ? active?.name ?? '' : ''); setModal(value); }
  async function chooseVault() { const r = await window.desktop.chooseVault(); if (r.ok && r.value) setVault(r.value); else if (!r.ok) setError(r.message); }
  async function open(id: string) {
    if (!await note.stash()) return;
    const subjectId = latest.current.active?.id; const r = await window.desktop.openNote({ id });
    if (r.ok && latest.current.active?.id === subjectId) { note.load(r.value);setBrowseOpen(false); await checkpoint({ noteId: id }); } else if (!r.ok) setError(r.message);
  }
  async function importNote() {
    if (!active || !await note.stash()) return;
    const subjectId = active.id; const r = await window.desktop.importNote({ subjectId });
    if (r.ok && r.value && latest.current.active?.id === subjectId) { note.load(r.value); const list = await window.desktop.listNotes({ subjectId }); if (list.ok) setNotes(list.value); await checkpoint({ noteId: r.value.ref.id }); } else if (!r.ok) setError(r.message);
  }
  async function chooseMaterial(replaceId?: string) {
    if (!active) return;
    const subjectId = active.id; const r = await window.desktop.chooseMaterial({ subjectId, replaceId });
    if (r.ok && r.value && latest.current.active?.id === subjectId) { setMaterials(m => replaceId ? m.map(v => v.id === replaceId ? r.value! : v) : [...m, r.value!]); setMaterialGeneration(v => v + 1); await checkpoint({ materialId: r.value.id, page: 1, materialView: 'pdf' }); } else if (!r.ok) setError(r.message);
  }
  const material = materials.find(m => m.id === desk?.materialId);
  const visibleNotes = notes.filter(n => n.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const words = useMemo(() => { const body = note.text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim(); return body ? body.split(/\s+/u).length : 0; }, [note.text]);
  async function pauseForCity() {
    if (active) {
      const current = await window.desktop.getFocus({ subjectId: active.id });
      if (!current.ok) { setError(current.message); return false; }
      if (current.value.activeOwner) {
        const owner = await window.desktop.getFocus({ subjectId: current.value.activeOwner.id });
        if (!owner.ok) { setError(owner.message); return false; }
        if (owner.value.session?.state === 'running') {
          const paused = await window.desktop.actFocus({ subjectId: owner.value.activeOwner!.id, id: owner.value.session.id, action: 'pause' });
          if (!paused.ok) { setError(paused.message); return false; }
        }
      }
    }
    return true;
  }
  async function navigate(next:WorkspaceArea,index=focusedRef.current) {
    const present=layoutRef.current.panes.indexOf(next);destination.current={area:next,index:present>=0?present:index};if(navigating.current)return;
    navigating.current=true;setNavigationPending(true);
    try{while(destination.current.area!==visibleArea.current||destination.current.index!==focusedRef.current||!layoutRef.current.panes.includes(destination.current.area)){
      const request=destination.current,target=request.area;
      if(!await latest.current.note.stash()||projectFlush.current&&!await projectFlush.current())break;
      if(target==='city')await import('./GameView');if(target==='explorer')await import('./ProjectWorkspace');if(target==='graph')await import('./GraphWorkspace');if(target==='settings')await import('./SettingsWorkspace');
      if(destination.current!==request)continue;if(target==='city'&&!await pauseForCity())break;
      const prior=layoutRef.current;let panes=[...prior.panes],sizes=[...prior.sizes];if(request.index>=panes.length){if(panes.length>=3)break;panes.push(target);sizes=panes.map(()=>100/panes.length);}else panes[request.index]=target;
      if(new Set(panes).size!==panes.length)break;
      setVisited(v=>v.includes(target)?v:[...v,target]);visibleArea.current=target;focusedRef.current=request.index;setFocused(request.index);setCurrentArea(target);setBrowseOpen(false);
      await saveLayout({panes,sizes});
    }}catch{setError('Não foi possível trocar de módulo. Seus rascunhos foram mantidos.');}finally{navigating.current=false;setNavigationPending(false);}
  }
  async function jump(subjectId:string,noteId?:string) {const subject=subjects.find(s=>s.id===subjectId);if(!subject)throw Error('Matéria ausente');await navigate('study');if(latest.current.active?.id!==subjectId)await select(subject);if(latest.current.active?.id!==subjectId)throw Error('Mesa não aberta');if(noteId)await open(noteId);}
  async function hit(item:SearchHit){if(item.kind==='project'){setRequestedProject({id:item.id,nonce:crypto.randomUUID()});await navigate('explorer');return;}await jump(item.subjectId!,item.kind==='note'?item.id:undefined);if(item.kind==='video'){const r=await window.desktop.studyCatalog();if(!r.ok)throw Error(r.message);const video=r.value.videos.find(v=>v.id===item.id);if(!video)throw Error('Vídeo ausente');await checkpoint({videoId:video.id,materialView:'video'});await navigate('video');await videos.open(video);}}
  async function command(value:Command){if(value==='new-subject'||value==='new-note'){await navigate('study');if(value==='new-note'&&(!latest.current.active||!vault)){setError('Escolha uma matéria e uma pasta de notas para criar a nota.');return;}deferredModal.current=value==='new-note'?'note':'subject';}else await navigate(value);}
  async function createCard(excerpt:string){if(!note.doc||!active)return;setCardSource({noteId:note.doc.ref.id,subjectId:active.id,title:note.doc.ref.title,excerpt:excerpt.slice(0,2000),nonce:crypto.randomUUID()});await navigate('review');}
  const study=<div className="app-shell clean-study" data-area-ready="true">
    <aside className="sidebar" hidden={!browseOpen}><button className="browse-close" aria-label="Fechar acervo" onClick={()=>setBrowseOpen(false)}>×</button><div className="brand"><span className="brand-mark"><Mark/></span><div>APP ESTUDOS<small>SEU ESPAÇO DE ESTUDO</small></div></div>
      <div className="section-label">SUAS MATÉRIAS <button onClick={() => newModal('subject')} aria-label="Nova matéria"><Mark kind="plus"/></button></div>
      <nav aria-label="Matérias" className="subject-list">{subjects.map((s, i) => <button key={s.id} aria-label={s.name} aria-current={active?.id === s.id ? 'page' : undefined} className={`subject ${active?.id === s.id ? 'active' : ''}`} data-color={s.color} onClick={() => select(s)}><span className="subject-dot"/><span>{s.name}</span><small>{String(i + 1).padStart(2, '0')}</small></button>)}{subjects.length === 0 && <p className="sidebar-hint">Crie uma matéria para começar.</p>}</nav>
      {active && <><div className="section-label"><span>SEU CADERNO <small>{notes.length}</small></span><button onClick={() => newModal('note')} disabled={!vault} aria-label="Nova nota"><Mark kind="plus"/></button></div><div className="search-wrap"><Mark kind="search"/><input className="search" aria-label="Buscar notas" placeholder="Encontrar uma nota…" value={search} onChange={e => setSearch(e.target.value)}/></div><nav aria-label="Notas" className="notes-list">{visibleNotes.map(n => <button className={note.doc?.ref.id === n.id ? 'active' : ''} key={n.id} aria-label={n.title} aria-current={note.doc?.ref.id === n.id ? 'page' : undefined} onClick={() => open(n.id)}><Mark kind="note"/><span>{n.title}</span><span className="note-indicator"/></button>)}{visibleNotes.length === 0 && <div className="notes-empty"><p>{search ? 'Nenhuma nota encontrada.' : 'Seu caderno começa com uma ideia.'}</p>{search && <button onClick={() => setSearch('')}>Limpar busca</button>}</div>}</nav><button className="text-button import" onClick={importNote} disabled={!vault}>+ Importar Markdown</button></>}
      <div className="sidebar-bottom"><button className="vault-button" onClick={chooseVault}><span className={`connection ${vault ? 'connected' : ''}`}/><span>{vault ? 'Pasta de notas vinculada' : 'Escolher pasta de notas'}<small>{vault ? 'Arquivos locais · Markdown' : 'Escolha seu vault'}</small></span><span>↗</span></button><div className="sidebar-caption">Seu material permanece no computador.</div></div>
    </aside>
    <div className="main-column"><header className="workspace-header"><div className="clean-heading"><div><small>CADERNO / {active?'ESTUDO LOCAL':'COMEÇAR'}</small><h1>{active?.name??'Seu espaço de estudo'}</h1></div><div><button onClick={()=>setBrowseOpen(v=>!v)} aria-expanded={browseOpen} aria-label="Abrir acervo">Acervo</button>{active&&<button className="text-button" onClick={()=>newModal('rename')} aria-label={`Renomear ${active.name}`}>Renomear</button>}<button onClick={()=>newModal('subject')} aria-label="Nova matéria">+ Matéria</button></div></div></header>
      {error&&<div className="error-banner" role="alert"><span>{error}</span><button onClick={()=>setError('')} aria-label="Fechar aviso">×</button></div>}
      {loading&&<div className="loading-line" role="status">Abrindo caderno…</div>}
      {!active?<section className="welcome"><h2>Um lugar para continuar.</h2><p>Crie uma matéria e abra uma nota. Acrescente outros módulos quando precisar.</p><button className="primary" onClick={()=>newModal('subject')}>Criar primeira matéria</button><button onClick={chooseVault}>Escolher pasta de notas</button></section>:<div className="desk" ref={workspace}>
<section className="panel note-panel" data-motion-panel="note"><div className="panel-header"><span className="panel-caption"><span className="panel-index">01</span><Mark kind="note"/> CADERNO</span><div className="panel-actions"><button onClick={() => newModal('note')} disabled={!vault}>+ Nova nota</button>{note.doc && <button className="save-button" onClick={note.save} aria-label="Salvar nota" title="Ctrl+S">Salvar <kbd>Ctrl S</kbd><Mark kind="arrow"/></button>}</div></div>
          {note.doc ? <><div className="note-title"><h2>{note.doc.ref.title}</h2><div className="note-meta"><span className={note.conflict ? 'warning-text' : ''} role="status">{note.status}</span><div className="segmented"><button className={!desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: false })}>Editar</button><button className={desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: true })}>Leitura</button></div></div></div>
            {note.doc.draft && !note.conflict && <div className="draft-banner">Rascunho recuperado <button onClick={note.useFile}>Usar versão do arquivo</button></div>}
            {note.conflict && <div className="conflict-box"><strong>Arquivo alterado fora do app</strong><p>Sua edição foi preservada. Confira a versão externa antes de continuar.</p><details><summary>Ver versão externa</summary><pre>{note.conflict.text}</pre></details><button onClick={note.useFile}>Usar versão do arquivo</button><button onClick={note.keepMine}>Conservar minha edição para revisão</button></div>}
            <NoteEditor key={note.doc.ref.id} title={note.doc.ref.title} text={note.text} onChange={note.change} preview={desk?.preview ?? false} onCard={excerpt=>void createCard(excerpt)}/><div className="note-foot"><span><span className={`connection ${note.text === note.doc.text && !note.conflict ? 'connected' : ''}`}/>{note.conflict ? 'Revisão necessária' : note.text === note.doc.text ? 'Arquivo atualizado' : 'Edição em andamento'}</span><span>{words} palavras <span className="meta-dot">·</span> ~{Math.max(1, Math.ceil(words / 200))} min de leitura</span></div> </> : <div className="panel-empty"><Mark kind="note"/><h2>Ideias que ficam.</h2><p>{vault ? 'Crie uma nota ou importe um Markdown deste vault.' : 'Escolha uma pasta de notas para guardar seus arquivos.'}</p><button className="primary" onClick={vault ? () => newModal('note') : chooseVault}>{vault ? '+ Criar nota' : 'Escolher pasta de notas'}</button></div>}
        </section>
      </div>}
    </div>
    {modal && <MotionDialog title={modal === 'note' ? 'Nova nota' : modal === 'rename' ? 'Renomear matéria' : 'Nova matéria'} close={() => setModal(null)}>{requestClose => <form onSubmit={submit}><label>{modal === 'note' ? 'Título da nota' : 'Nome da matéria'}<input autoFocus required maxLength={modal === 'note' ? 160 : 120} aria-label={modal === 'note' ? 'Título da nota' : 'Nome da matéria'} value={name} onChange={e => setName(e.target.value)}/></label>{modal === 'subject' && <label>Cor<select value={color} onChange={e => setColor(e.target.value)}><option value="sage">Sálvia</option><option value="blue">Azul</option><option value="rose">Rosa</option><option value="amber">Âmbar</option></select></label>}<div className="dialog-buttons"><button type="button" onClick={requestClose}>Cancelar</button><button type="submit" className="primary">{modal === 'note' ? 'Criar nota' : modal === 'rename' ? 'Salvar nome' : 'Criar matéria'}</button></div></form>}</MotionDialog>}
  </div>;
  const materialHeader=(name:string)=><div className="panel-header"><h1>{name}</h1><div><select aria-label={`Matéria do ${name}`} value={active?.id??''} onChange={e=>{const subject=subjects.find(s=>s.id===e.target.value);if(subject)void select(subject);}}><option value="" disabled>Escolha uma matéria</option>{subjects.map(subject=><option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>{name==='PDF'&&<button onClick={()=>chooseMaterial()}>Abrir PDF ↗</button>}</div></div>;
  const pdfModule=<section className="panel material-module" data-area-ready="true">{materialHeader('PDF')}{active?<>
{materials.length > 0 && <select aria-label="Documento ativo" value={desk?.materialId ?? ''} onChange={e => checkpoint({ materialId: e.target.value || null, page: 1 })}><option value="">Escolher documento</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>}{material && desk ? <PdfPane key={`${material.id}:${materialGeneration}`} material={material} noteId={desk.noteId} onNote={id=>void jump(active.id,id)} page={desk.page} onPage={page => checkpoint({ page })} onLocate={() => chooseMaterial(material.id)}/> : <div className="panel-empty"><Mark kind="book"/><h3>Seu material, à mão.</h3><p>Abra um PDF para consultar junto das notas.</p><button onClick={() => chooseMaterial()}>+ Selecionar documento</button></div>}
  </>:<div className="panel-empty"><p>Crie uma matéria no Caderno para vincular material.</p><button onClick={()=>void navigate('study')}>Abrir Caderno</button></div>}</section>;
  const videoModule=<section className="panel material-module" data-area-ready="true">{materialHeader('Vídeo')}{active?<VideoLibrary controller={videos}/>:<div className="panel-empty"><p>Escolha uma matéria para guardar suas aulas.</p><button onClick={()=>void navigate('study')}>Abrir Caderno</button></div>}</section>;
  return <div className="nodus-shell"><EditorialBackdrop/><ActivityRail active={currentArea==='pdf'||currentArea==='video'?'study':currentArea} navigate={area=>void navigate(area)} pending={navigationPending} search={()=>setPalette(true)}/><WorkspaceFrame layout={layout} focused={focused} pending={navigationPending} cinema={videos.mode==='cinema'} choose={(area,index)=>void navigate(area,index)} close={closePane} single={singlePane} resize={resize} saveSizes={()=>void saveLayout(layoutRef.current)} focus={focusPane} tools={<SuspendedTools subjectId={active?.id??null} nextStepId={desk?.nextStepId??null} onNext={nextStepId=>void checkpoint({nextStepId})} onError={setError} version={version} cinema={videos.mode==='cinema'} opened={toolOpen} open={setToolOpen}/>}><AreaStage active={currentArea} visible={layout.panes} sizes={layout.sizes}>
    <div className="area-layer" data-area="study">{study}</div>
    {visited.includes('pdf')&&<div className="area-layer" data-area="pdf">{pdfModule}</div>}
    {visited.includes('video')&&<div className="area-layer" data-area="video">{videoModule}</div>}
    {visited.includes('home')&&<div className="area-layer" data-area="home"><TodayWorkspace activeArea={shown('home')&&videos.mode!=='cinema'} openSubject={id=>jump(id)} review={()=>void navigate('review')} search={()=>setPalette(true)}/></div>}
    {visited.includes('review')&&<div className="area-layer" data-area="review"><FlashcardsWorkspace activeArea={shown('review')&&videos.mode!=='cinema'} source={cardSource} clearSource={()=>setCardSource(null)} openNote={jump}/></div>}
    {visited.includes('graph')&&<div className="area-layer" data-area="graph"><Suspense fallback={<div className="area-loading">Conectando suas ideias…</div>}><GraphWorkspace activeArea={shown('graph')&&videos.mode!=='cinema'} initialSubjectId={active?.id??null} openNote={(subjectId,id)=>jump(subjectId,id)}/></Suspense></div>}
    {visited.includes('explorer') && <div className="area-layer" data-area="explorer"><Suspense fallback={<div className="area-loading">Retomando projetos…</div>}><ProjectWorkspace keyboardActive={currentArea==='explorer'} activeArea={explorerOpen && videos.mode !== 'cinema'} requestedProject={requestedProject} registerFlush={fn => { projectFlush.current = fn; }}/></Suspense></div>}
    {visited.includes('city') && <div className="area-layer" data-area="city"><Suspense fallback={<div className="area-loading">Preparando Vale Sereno…</div>}><GameView activeArea={gameOpen && videos.mode !== 'cinema'} keyboardActive={currentArea==='city'} registerFlush={fn=>{gameFlush.current=fn;}} onClose={() => void navigate('study')} onExplorer={() => void navigate('explorer')}/></Suspense></div>}
    {visited.includes('settings') && <div className="area-layer" data-area="settings"><Suspense fallback={<div className="area-loading">Abrindo configurações…</div>}><SettingsWorkspace activeArea={settingsOpen && videos.mode !== 'cinema'} navigate={area => void navigate(area)}/></Suspense></div>}
  </AreaStage></WorkspaceFrame><VideoSurface controller={videos}/>{palette&&<CommandPalette close={()=>{setPalette(false);if(deferredModal.current){newModal(deferredModal.current);deferredModal.current=null;}}} onHit={hit} onCommand={command}/>} {error && currentArea !== 'study' && <div className="navigation-error" role="alert">{error}<button aria-label="Fechar aviso da navegação" onClick={() => setError('')}><Mark kind="close"/></button></div>}</div>;
}
