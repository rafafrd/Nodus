import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { NoteEditor } from './NoteEditor';
import { noteTitle, setNoteTitle, captureMarkdown, type NoteCapture } from '../shared/note-content';
import type { Subject, NoteRef, Desk, Material } from '../shared/contracts';
import { useNote } from './useNote';
import { PdfPane } from './PdfPane';
import { Icon as Mark } from './Icon';
import { ActivityRail } from './ActivityRail';
import { usePreferences } from './preferences';
import { WorkspaceFrame } from './WorkspaceFrame';
import { SuspendedTools } from './SuspendedTools';
import { activeWorkspace, updateWorkspace, moduleName, MAX_WORKSPACE_TABS, type WorkspaceArea, type WorkspaceTabs } from '../shared/workspace';
import { AreaStage, useSurfaceMotion } from './motion';
import { MotionDialog } from './MotionDialog';
import { useVideos, VideoLibrary, VideoSurface } from './VideoWorkspace';
import { CommandPalette,type Command } from './CommandPalette';
import { HomeWorkspace } from './HomeWorkspace';
import { FlashcardsWorkspace,type CardSource } from './FlashcardsWorkspace';
import type { ActivityLaunch } from './ActivitiesWorkspace';
import type { ActivityType,SourceContext } from '../shared/study-activity';
import type { SearchHit } from '../shared/study';
import './study.css';
import './refinement.css';
import './styles.css';
import './themes.css';
import './settings.css';
import './editorial.css';
import './workspace.css';
import './notes-ux.css';
import { EditorialBackdrop } from './EditorialBackdrop';
import {StudySculpture} from './StudySculpture';
import {ContentShelf,type ContentChoice} from './ContentShelf';
import './experience.css';
import './home.css';
import './white.css';
const SettingsWorkspace = lazy(() => import('./SettingsWorkspace'));
const GameView = lazy(() => import('./GameView'));
const ProjectWorkspace = lazy(() => import('./ProjectWorkspace'));
const GraphWorkspace = lazy(() => import('./GraphWorkspace'));
export function App() {
  const {value:preferences,update:updatePreferences,busy:preferencesBusy}=usePreferences();
  const [session,setSession]=useState<WorkspaceTabs>(preferences.workspaceTabs),sessionRef=useRef(session);sessionRef.current=session;
  const layout=activeWorkspace(session);
  const [activityLaunch,setActivityLaunch]=useState<ActivityLaunch|null>(null);
  function launchActivity(type:ActivityType|null,source?:{kind:'note'|'pdf'|'video';id:string}){if(!active)return;setActivityLaunch({subjectId:active.id,type,source,nonce:crypto.randomUUID()});void navigate('review');}
  async function openActivitySource(subjectId:string,context:SourceContext){const owner=subjects.find(s=>s.id===subjectId);if(!owner)return;if(context.source.kind==='note'){await jump(subjectId,context.source.id);return;}if(active?.id!==subjectId)await select(owner);if(context.source.kind==='pdf'){await checkpoint({materialId:context.source.id,page:context.chunk.location.kind==='page'?context.chunk.location.page:1});await navigate('pdf');}else{await checkpoint({videoId:context.source.id,materialView:'video'});await navigate('video');}}
  const [browseOpen,setBrowseOpen]=useState(false),[toolOpen,setToolOpen]=useState<'focus'|'checklist'|null>(null),[dragged,setDragged]=useState<WorkspaceArea|null>(null);
  const navigationQueue=useRef(Promise.resolve()),navigationCount=useRef(0),gameFlush=useRef<(()=>Promise<boolean>)|null>(null);
  function applySession(next:WorkspaceTabs){sessionRef.current=next;setSession(next);setCurrentArea(activeWorkspace(next).focused);}
  async function saveSession(next:WorkspaceTabs){const ok=await updatePreferences({workspaceTabs:next});if(!ok)setError('Não foi possível salvar as abas. A configuração anterior continua no disco.');return ok;}
  function resize(axis:'columnSplit'|'rowSplit',value:number){const current=sessionRef.current;applySession(updateWorkspace(current,{...activeWorkspace(current),[axis]:value}));}
  function focusPane(area:string){const current=sessionRef.current,tab=activeWorkspace(current);if(navigationCount.current||!tab.panes.includes(area as WorkspaceArea)||tab.focused===area)return;applySession(updateWorkspace(current,{...tab,focused:area as WorkspaceArea}));}
  function closePane(area:WorkspaceArea){return transition(current=>{const tab=activeWorkspace(current);if(tab.panes.length===1)return current;const panes=tab.panes.filter(item=>item!==area);return updateWorkspace(current,{...tab,panes,focused:panes.includes(tab.focused)?tab.focused:panes[0]});});}
  const shown=(area:WorkspaceArea)=>layout.panes.includes(area);

  const [version, setVersion] = useState('Inicializando…');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [active, setActive] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<NoteRef[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialGeneration, setMaterialGeneration] = useState(0);
  const [desk, setDesk] = useState<Desk | null>(null);
  const [vault, setVault] = useState<string | null>(null);
  const [contentOpen,setContentOpen]=useState(false),[videoAddRequest,setVideoAddRequest]=useState<string|null>(null);
  const [modal, setModal] = useState<'subject' | 'rename' | null>(null);
  const [name, setName] = useState('');
  const [notice,setNotice]=useState(''),[linking,setLinking]=useState(false),[linkTarget,setLinkTarget]=useState('');
  const quickGuard=useRef(false),quickAfterSubject=useRef(false),captureGuard=useRef(false);
  const [color, setColor] = useState('sage');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  function toggleSidebar(){void updatePreferences({sidebarCollapsed:!preferences.sidebarCollapsed}).then(ok=>{if(!ok)setError('Não foi possível salvar a posição do menu lateral. Tente novamente.');});}
  const [loading, setLoading] = useState(false);
  const [currentArea, setCurrentArea] = useState<WorkspaceArea>(layout.focused), [visited, setVisited] = useState<WorkspaceArea[]>([...new Set(['study' as const,...layout.panes])]);
  const gameOpen = shown('city'), explorerOpen = shown('explorer'), settingsOpen = shown('settings');
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
    return window.desktop.onBeforeClose(() => { void (async () => { await navigationQueue.current; if (await saveSession(sessionRef.current) && await latest.current.note.stash() && (!projectFlush.current || await projectFlush.current()) && (!gameFlush.current || await gameFlush.current())) { const r = await window.desktop.finishClose(); if (!r.ok) setError(r.message); } })(); });
  }, []);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if(document.querySelector('.video-cinema')||document.querySelector('dialog[open]'))return;
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setPalette(true);return;}
      if(event.ctrlKey||event.metaKey){
        if(event.key.toLowerCase()==='t'){event.preventDefault();void newTab();return;}
        if(event.key.toLowerCase()==='w'){event.preventDefault();void closeTab(sessionRef.current.activeTabId);return;}
        if(event.key==='Tab'){event.preventDefault();const current=sessionRef.current,index=current.tabs.findIndex(tab=>tab.id===current.activeTabId);void selectTab(current.tabs[(index+(event.shiftKey?-1:1)+current.tabs.length)%current.tabs.length].id);return;}
        if(/^[1-9]$/.test(event.key)){event.preventDefault();const tabs=sessionRef.current.tabs,tab=event.key==='9'?tabs.at(-1):tabs[Number(event.key)-1];if(tab)void selectTab(tab.id);return;}
      }
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
    if (modal === 'rename') {
      if (!active) return;
      const r = await window.desktop.renameSubject({ id: active.id, name });
      if (!r.ok) { setError(r.message); return; }
      setSubjects(s => s.map(v => v.id === active.id ? r.value : v)); setActive(r.value);
    } else {
      const r = await window.desktop.createSubject({ name, color: color as 'sage' });
      if (!r.ok) { setError(r.message); return; }
      setSubjects(s => [...s, r.value]); await select(r.value);
      if(quickAfterSubject.current){quickAfterSubject.current=false;await quickNote();}
    }
    setModal(null); setName('');
  }
  const deferredModal=useRef<'subject'|null>(null);
  function newModal(value: typeof modal) {
    const show=()=>{setName(value==='rename'?latest.current.active?.name??'':'');setModal(value);};
    if(value&&activeWorkspace(sessionRef.current).focused!=='study')void navigate('study').then(()=>{if(activeWorkspace(sessionRef.current).focused==='study')show();});else show();
  }
  async function chooseVault() { const r = await window.desktop.chooseVault(); if (r.ok && r.value) setVault(r.value); else if (!r.ok) setError(r.message); }
  async function open(id: string) {
    if (!await note.stash()) return;
    const subjectId = latest.current.active?.id; const r = await window.desktop.openNote({ id });
    if (r.ok && latest.current.active?.id === subjectId) { note.load(r.value);setNotes(items=>[r.value.ref,...items.filter(n=>n.id!==id)]);setBrowseOpen(false); await checkpoint({ noteId: id }); } else if (!r.ok) setError(r.message);
  }
  async function setupNotes(){const r=await window.desktop.setupVault();if(!r.ok){setError(r.message);return false;}setVault(r.value);return true;}
  async function quickNote(){
    if(quickGuard.current)return;quickGuard.current=true;
    try{
      await navigate('study');if(activeWorkspace(sessionRef.current).focused!=='study')return;
      if(!vault&&!await setupNotes())return;
      if(!latest.current.active){quickAfterSubject.current=true;newModal('subject');return;}
      if(!await latest.current.note.stash())return;
      const subjectId=latest.current.active.id,r=await window.desktop.createNote({subjectId});
      if(!r.ok){setError(r.message);return;}
      await navigate('study');if(latest.current.active?.id!==subjectId)return;
      latest.current.note.load(r.value);setNotes(v=>[r.value.ref,...v]);await checkpoint({noteId:r.value.ref.id,preview:false});setBrowseOpen(false);
    }finally{quickGuard.current=false;}
  }
  async function moveNote(subjectId:string){
    const saved=await latest.current.note.save();if(!saved)return;
    const r=await window.desktop.moveNote({id:saved.ref.id,subjectId,hash:saved.hash});
    if(!r.ok){setError(r.message);return;}if(r.value.state==='conflict'){latest.current.note.load({...r.value.external,draft:{text:saved.text,baseHash:saved.hash}});setError('Arquivo alterado. Confira as duas versões antes de mover.');return;}
    latest.current.note.load(r.value.document);await select(subjects.find(s=>s.id===subjectId)!);latest.current.note.load(r.value.document);await checkpoint({noteId:saved.ref.id,preview:false});setNotice('Nota movida. Referências e histórico conservados.');
  }
  async function capture(c:NoteCapture){
    if(captureGuard.current)return;captureGuard.current=true;try{
    if(!await latest.current.note.stash())return;
    if(latest.current.active?.id!==c.subjectId){const owner=subjects.find(s=>s.id===c.subjectId);if(!owner)return;await select(owner);}
    let current=latest.current.note.snapshot().doc;
    if(!current){if(!vault&&!await setupNotes())return;const r=await window.desktop.createNote({subjectId:c.subjectId,title:c.source.title.slice(0,160)});if(!r.ok){setError(r.message);return;}current=r.value;latest.current.note.load(current);setNotes(v=>[current!.ref,...v]);await checkpoint({noteId:current.ref.id,preview:false});}
    latest.current.note.change(latest.current.note.snapshot().text+captureMarkdown(c));
    if(!activeWorkspace(sessionRef.current).panes.includes('study'))await showPane('study');
    await checkpoint({preview:false});setNotice('Trecho adicionado à nota com a origem. Salve quando terminar.');
    }finally{captureGuard.current=false;}
  }
  async function sourceLink(url:string){
    const match=url.match(/^nodus-source:(pdf|video)\/([\w-]+)\?(.*)$/);if(!match)return;
    const params=new URLSearchParams(match[3]),catalog=await window.desktop.studyCatalog();if(!catalog.ok){setError(catalog.message);return;}
    if(match[1]==='video'){const video=catalog.value.videos.find(v=>v.id===match[2]);if(!video){setError('Vídeo de origem ausente.');return;}const owner=subjects.find(s=>s.id===video.subjectId);if(owner&&owner.id!==latest.current.active?.id)await select(owner);await checkpoint({videoId:video.id,materialView:'video'});await showPane('video');await videos.open(video,Number(params.get('seconds'))||0);}
    else{let owner:Subject|undefined,material:Material|undefined;for(const subject of subjects){const list=await window.desktop.listMaterials({subjectId:subject.id});if(list.ok){material=list.value.find(m=>m.id===match[2]);if(material){owner=subject;break;}}}if(!owner||!material){setError('PDF de origem ausente.');return;}if(owner.id!==latest.current.active?.id)await select(owner);const bytes=await window.desktop.readMaterial({id:material.id});if(!bytes.ok){setError(bytes.message);return;}const digest=await crypto.subtle.digest('SHA-256',new Uint8Array(bytes.value)),hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');if(params.get('version')&&params.get('version')!==hash)setNotice('Este PDF mudou desde a captura. O trecho original continua na sua nota.');await checkpoint({materialId:material.id,page:Number(params.get('page'))||1});await showPane('pdf');}
  }
  async function linkNote(e:FormEvent){e.preventDefault();if(!active||!note.doc||!linkTarget)return;const r=await window.desktop.saveNoteLink({subjectId:active.id,sourceId:note.doc.ref.id,targetId:linkTarget,label:'Relaciona'});if(!r.ok){setError(r.message);return;}setLinking(false);setNotice('Conexão salva. Abra Conexões para explorar suas notas.');}
  async function importNote() {
    if (!active || !await note.stash()) return;
    const subjectId = active.id; const result=await window.desktop.importNotes({subjectId});
    if(!result.ok){setError(result.message);return;}if(!result.value)return;
    setNotice(`${result.value.notes.length} notas importadas. ${result.value.failed.map(f=>f.name+': '+f.message).join(' · ')}`);
    const r={ok:true as const,value:result.value.notes[0]??null};
    if (r.value && latest.current.active?.id === subjectId) { note.load(r.value); const list = await window.desktop.listNotes({ subjectId }); if (list.ok) setNotes(list.value); await checkpoint({ noteId: r.value.ref.id }); }
  }
  async function chooseMaterial(replaceId?: string) {
    if (!active) return;
    const subjectId = active.id; const r = await window.desktop.chooseMaterial({ subjectId, replaceId });
    if (r.ok && r.value && latest.current.active?.id === subjectId) { setMaterials(m => replaceId ? m.map(v => v.id === replaceId ? r.value! : v) : [...m, r.value!]); setMaterialGeneration(v => v + 1); await checkpoint({ materialId: r.value.id, page: 1, materialView: 'pdf' }); return true; } else if (!r.ok) setError(r.message);return false;
  }
  const material = materials.find(m => m.id === desk?.materialId);
  const visibleNotes = notes.filter(n => n.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  async function chooseContent(choice:ContentChoice){
    try{if(choice==='write'){await quickNote();return;}if(!latest.current.active)return;
      if(choice==='markdown'){if(!vault&&!await setupNotes())return;await navigate('study');await importNote();}
      else if(choice==='pdf'){if(await chooseMaterial())await navigate('pdf');}
      else {await navigate('video');setVideoAddRequest(crypto.randomUUID());}
    }catch(e){setError(e instanceof Error?e.message:'Não foi possível adicionar o conteúdo.');}
  }
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
  function transition(reduce:(current:WorkspaceTabs)=>WorkspaceTabs){
    navigationCount.current++;setNavigationPending(true);
    const task=navigationQueue.current.then(async()=>{
      const current=sessionRef.current,next=reduce(current);if(next===current)return;
      if(!await latest.current.note.stash()||projectFlush.current&&!await projectFlush.current()||gameFlush.current&&!await gameFlush.current())return;
      const tab=activeWorkspace(next);
      await Promise.all(tab.panes.map(async target=>{if(target==='city')await import('./GameView');if(target==='explorer')await import('./ProjectWorkspace');if(target==='graph')await import('./GraphWorkspace');if(target==='settings')await import('./SettingsWorkspace');}));
      if(tab.panes.includes('city')&&!activeWorkspace(current).panes.includes('city')&&!await pauseForCity())return;
      if(!await saveSession(next))return;
      setVisited(value=>[...new Set([...value,...tab.panes])]);applySession(next);setBrowseOpen(false);setToolOpen(null);
    }).catch(()=>setError('Não foi possível trocar de aba ou módulo. Seus rascunhos foram mantidos.')).finally(()=>{navigationCount.current--;if(!navigationCount.current)setNavigationPending(false);});
    navigationQueue.current=task;return task;
  }
  function navigate(area:WorkspaceArea){return transition(current=>{const tab=activeWorkspace(current);return updateWorkspace(current,{...tab,panes:[area],focused:area});});}
  function addPane(area:WorkspaceArea){return transition(current=>{const tab=activeWorkspace(current);if(tab.panes.includes(area))return updateWorkspace(current,{...tab,focused:area});if(tab.panes.length>=4)return current;return updateWorkspace(current,{...tab,panes:[...tab.panes,area],focused:area});});}
  function showPane(area:WorkspaceArea){return activeWorkspace(sessionRef.current).panes.length>=4&&!activeWorkspace(sessionRef.current).panes.includes(area)?navigate(area):addPane(area);}
  function selectTab(id:string){return transition(current=>current.activeTabId===id||!current.tabs.some(tab=>tab.id===id)?current:{...current,activeTabId:id});}
  function newTab(){return transition(current=>{if(current.tabs.length>=MAX_WORKSPACE_TABS)return current;const id=crypto.randomUUID();return {activeTabId:id,tabs:[...current.tabs,{id,panes:['study'],focused:'study',columnSplit:50,rowSplit:50}]};});}
  function closeTab(id:string){return transition(current=>{if(current.tabs.length===1)return current;const index=current.tabs.findIndex(tab=>tab.id===id);if(index<0)return current;const tabs=current.tabs.filter(tab=>tab.id!==id);return {tabs,activeTabId:current.activeTabId===id?tabs[Math.min(index,tabs.length-1)].id:current.activeTabId};});}
  async function jump(subjectId:string,noteId?:string) {if(noteId){const r=await window.desktop.openNote({id:noteId});if(!r.ok)throw Error(r.message);subjectId=r.value.ref.subjectId;}const subject=subjects.find(s=>s.id===subjectId);if(!subject)throw Error('Matéria ausente');await navigate('study');if(latest.current.active?.id!==subjectId)await select(subject);if(latest.current.active?.id!==subjectId)throw Error('Mesa não aberta');if(noteId)await open(noteId);}
  async function hit(item:SearchHit){if(item.kind==='project'){setRequestedProject({id:item.id,nonce:crypto.randomUUID()});await navigate('explorer');return;}await jump(item.subjectId!,item.kind==='note'?item.id:undefined);if(item.kind==='video'){const r=await window.desktop.studyCatalog();if(!r.ok)throw Error(r.message);const video=r.value.videos.find(v=>v.id===item.id);if(!video)throw Error('Vídeo ausente');await checkpoint({videoId:video.id,materialView:'video'});await navigate('video');await videos.open(video);}}
  async function command(value:Command){if(value==='new-subject'||value==='new-note'){await navigate('study');if(value==='new-note'){await quickNote();}else deferredModal.current='subject';}else await navigate(value);}
  async function createCard(excerpt:string){if(!note.doc||!active)return;setCardSource({noteId:note.doc.ref.id,subjectId:active.id,title:note.doc.ref.title,excerpt:excerpt.slice(0,2000),nonce:crypto.randomUUID()});await navigate('review');}
  const study=<div className="app-shell clean-study" data-area-ready="true">
    <aside className="sidebar" hidden={!browseOpen}><button className="browse-close" aria-label="Fechar acervo" onClick={()=>setBrowseOpen(false)}>×</button><div className="brand"><span className="brand-mark"><Mark kind="book"/></span><div>Seu acervo<small>MATÉRIAS E NOTAS</small></div></div>
      <div className="section-label">SUAS MATÉRIAS <button onClick={() => newModal('subject')} aria-label="Nova matéria"><Mark kind="plus"/></button></div>
      <nav aria-label="Matérias" className="subject-list">{subjects.map((s, i) => <button key={s.id} aria-label={s.name} aria-current={active?.id === s.id ? 'page' : undefined} className={`subject ${active?.id === s.id ? 'active' : ''}`} data-color={s.color} onClick={() => select(s)}><span className="subject-dot"/><span>{s.name}</span><small>{String(i + 1).padStart(2, '0')}</small></button>)}{subjects.length === 0 && <p className="sidebar-hint">Crie uma matéria para começar.</p>}</nav>
      {active && <><div className="section-label"><span>SEU CADERNO <small>{notes.length}</small></span><button onClick={() => void quickNote()} disabled={!vault} aria-label="Nova nota"><Mark kind="plus"/></button></div><div className="search-wrap"><Mark kind="search"/><input className="search" aria-label="Buscar notas" placeholder="Encontrar uma nota…" value={search} onChange={e => setSearch(e.target.value)}/></div><nav aria-label="Notas" className="notes-list">{visibleNotes.map(n => <button className={note.doc?.ref.id === n.id ? 'active' : ''} key={n.id} aria-label={n.title} aria-current={note.doc?.ref.id === n.id ? 'page' : undefined} onClick={() => open(n.id)}><Mark kind="note"/><span>{n.title}<small>{n.id===note.doc?.ref.id?'Aberta agora':'Nota Markdown · local'}</small></span><span className="note-indicator"/></button>)}{visibleNotes.length === 0 && <div className="notes-empty"><p>{search ? 'Nenhuma nota encontrada.' : 'Escreva uma ideia ou importe notas. As mais recentes aparecem primeiro.'}</p>{search && <button onClick={() => setSearch('')}>Limpar busca</button>}</div>}</nav><button className="text-button import" onClick={importNote} disabled={!vault}>Importar notas Markdown</button></>}
      <div className="sidebar-bottom"><button className="vault-button" onClick={chooseVault}><span className={`connection ${vault ? 'connected' : ''}`}/><span>{vault ? 'Pasta de notas vinculada' : 'Escolher pasta de notas'}<small>{vault ? 'Arquivos locais · Markdown' : 'Escolha seu vault'}</small></span><span>↗</span></button><div className="sidebar-caption">Seu material permanece no computador.</div></div>
    </aside>
    <div className="main-column"><header className="workspace-header"><div className="clean-heading"><div><small>CADERNO / {active?'ESTUDO LOCAL':'COMEÇAR'}</small><h1>{active?.name??'Seu espaço de estudo'}</h1></div><div><button onClick={()=>setBrowseOpen(v=>!v)} aria-expanded={browseOpen} aria-label="Abrir acervo">Minhas notas</button>{active&&<button className="text-button" onClick={()=>newModal('rename')} aria-label={`Renomear ${active.name}`}>Renomear</button>}{active&&<details className="study-practice-actions"><summary>Prática</summary><div><button onClick={()=>launchActivity('quiz')}>Criar questionário</button><button onClick={()=>launchActivity('flashcards')}>Criar flashcards</button><button onClick={()=>launchActivity(null)}>Minhas atividades</button></div></details>}<button onClick={()=>newModal('subject')} aria-label="Nova matéria">+ Matéria</button></div></div></header>
      {error&&<div className="error-banner" role="alert"><span>{error}</span><button onClick={()=>setError('')} aria-label="Fechar aviso">×</button></div>}
      {notice&&<div className="note-notice" role="status"><span>{notice}</span><button aria-label="Fechar confirmação" onClick={()=>setNotice('')}>×</button></div>}{loading&&<div className="loading-line" role="status">Abrindo caderno…</div>}
      {!active?<section className="welcome experience-welcome"><StudySculpture active={shown('study')&&videos.mode!=='cinema'}/><div className="welcome-copy"><span className="eyebrow">SEU PRIMEIRO PASSO</span><h2>Comece pela sua primeira ideia.</h2><p>Escolha onde guardar suas notas, dê um nome à matéria e comece a escrever.</p><ol className="welcome-steps"><li data-complete={Boolean(vault)}><strong>1. Guardar suas notas</strong><p>{vault?'Pasta pronta. Seus arquivos ficam no computador.':'Use uma pasta em Documentos ou escolha uma que já utiliza.'}</p>{!vault&&<><button className="primary" onClick={()=>void setupNotes()}>Preparar pasta de notas</button><button onClick={chooseVault}>Escolher outra pasta</button></>}</li><li><strong>2. Criar uma matéria</strong><p>Por exemplo: Matemática, Inglês ou Programação.</p><button disabled={!vault} onClick={()=>newModal('subject')}>Criar primeira matéria</button></li><li><strong>3. Escrever ou trazer material</strong><p>As ações Nova nota, PDFs e Aulas ficam disponíveis na matéria.</p></li></ol></div></section>:<div className="desk" ref={workspace}>
<section className="panel note-panel" data-motion-panel="note"><div className="panel-header"><span className="panel-caption"><span className="panel-index">01</span><Mark kind="note"/> CADERNO</span><div className="panel-actions"><button onClick={() => void quickNote()} disabled={!vault}>+ Nova nota</button>{note.doc && <button className="save-button" onClick={note.save} aria-label="Salvar nota" title="Ctrl+S">Salvar <kbd>Ctrl S</kbd><Mark kind="arrow"/></button>}</div></div>
          {note.doc ? <><div className="note-title"><div className="note-identity"><label className="note-title-label" htmlFor="note-title-input">Título da nota</label><input id="note-title-input" aria-label="Título da nota" value={noteTitle(note.text,note.doc.ref.title)} maxLength={160} onChange={e=>note.change(setNoteTitle(note.text,e.target.value))}/><label>Guardar em <select aria-label="Matéria da nota" value={note.doc.ref.subjectId} onChange={e=>void moveNote(e.target.value)}>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div><div className="note-meta"><span className={note.conflict ? 'warning-text' : ''} role="status">{note.status}</span><div className="segmented"><button className={!desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: false })}>Editar</button><button className={desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: true })}>Leitura</button></div></div></div>
            {note.doc.draft && !note.conflict && <div className="draft-banner">Rascunho recuperado <button onClick={note.useFile}>Usar versão do arquivo</button></div>}
            {note.conflict && <div className="conflict-box"><strong>Arquivo alterado fora do app</strong><p>Sua edição foi preservada. Confira a versão externa antes de continuar.</p><details><summary>Ver versão externa</summary><pre>{note.conflict.text}</pre></details><button onClick={note.useFile}>Usar versão do arquivo</button><button onClick={note.keepMine}>Conservar minha edição para revisão</button></div>}
            <NoteEditor key={note.doc.ref.id} title={note.doc.ref.title} text={note.text} onChange={note.change} preview={desk?.preview ?? false} onCard={excerpt=>void createCard(excerpt)} onLink={()=>{setLinkTarget('');setLinking(true);}} onSource={url=>void sourceLink(url)}/><div className="note-foot"><span><span className={`connection ${note.text === note.doc.text && !note.conflict ? 'connected' : ''}`}/>{note.conflict ? 'Revisão necessária' : note.text === note.doc.text ? 'Arquivo atualizado' : 'Edição em andamento'}</span><span>{words} palavras <span className="meta-dot">·</span> ~{Math.max(1, Math.ceil(words / 200))} min de leitura</span></div> </> : <div className="panel-empty"><Mark kind="note"/><h2>Ideias que ficam.</h2><p>{vault ? 'Escreva agora ou importe suas notas Markdown.' : 'Escolha uma pasta de notas para guardar seus arquivos.'}</p><button className="primary" onClick={vault ? () => void quickNote() : chooseVault}>{vault ? '+ Criar nota' : 'Escolher pasta de notas'}</button></div>}
        </section>
      </div>}
    </div>
    {modal && <MotionDialog title={modal === 'rename' ? 'Renomear matéria' : 'Nova matéria'} close={() => setModal(null)}>{requestClose => <form onSubmit={submit}><label>Nome da matéria<input autoFocus required maxLength={120} aria-label="Nome da matéria" value={name} onChange={e => setName(e.target.value)}/></label>{modal === 'subject' && <label>Cor<select value={color} onChange={e => setColor(e.target.value)}><option value="sage">Sálvia</option><option value="blue">Azul</option><option value="rose">Rosa</option><option value="amber">Âmbar</option></select></label>}<div className="dialog-buttons"><button type="button" onClick={requestClose}>Cancelar</button><button type="submit" className="primary">{modal === 'rename' ? 'Salvar nome' : 'Criar matéria'}</button></div></form>}</MotionDialog>}
  </div>;
  const materialHeader=(name:string)=><div className="panel-header"><h1>{name==='PDF'?'PDFs':name==='Vídeo'?'Aulas':name}</h1><div><select aria-label={`Matéria do ${name}`} value={active?.id??''} onChange={e=>{const subject=subjects.find(s=>s.id===e.target.value);if(subject)void select(subject);}}><option value="" disabled>Escolha uma matéria</option>{subjects.map(subject=><option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>{name==='PDF'&&<><button onClick={()=>chooseMaterial()}>Adicionar PDF</button>{material&&<button onClick={()=>launchActivity('quiz',{kind:'pdf',id:material.id})}>Praticar este material</button>}</>}</div></div>;
  const pdfModule=<section className="panel material-module" data-area-ready="true">{materialHeader('PDF')}{active?<>
{materials.length > 0 && <select aria-label="Documento ativo" value={desk?.materialId ?? ''} onChange={e => checkpoint({ materialId: e.target.value || null, page: 1 })}><option value="">Escolher documento</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>}{material && desk ? <PdfPane key={`${material.id}:${materialGeneration}`} material={material} noteId={desk.noteId} onNote={id=>void jump(active.id,id)} page={desk.page} onPage={page => checkpoint({ page })} onLocate={() => chooseMaterial(material.id)} onCapture={c=>void capture(c)}/> : <div className="panel-empty"><Mark kind="book"/><h3>Seu material, à mão.</h3><p>Abra um PDF para consultar junto das notas.</p><button onClick={() => chooseMaterial()}>+ Selecionar documento</button></div>}
  </>:<div className="panel-empty"><p>Crie uma matéria no Caderno para vincular material.</p><button onClick={()=>void navigate('study')}>Abrir Caderno</button></div>}</section>;
  const videoModule=<section className="panel material-module" data-area-ready="true">{materialHeader('Vídeo')}{active?<VideoLibrary controller={videos} addRequest={videoAddRequest} onCapture={c=>void capture(c)} onPractice={id=>launchActivity('quiz',{kind:'video',id})}/>:<div className="panel-empty"><p>Escolha uma matéria para guardar suas aulas.</p><button onClick={()=>void navigate('study')}>Abrir Caderno</button></div>}</section>;
  const pane=(area:WorkspaceArea,content:ReactNode)=><div key={area} className={`area-layer ${layout.focused===area?'pane-focused':''}`} data-area={area} role="region" aria-label={`Janela ${moduleName(area)}`}>
    <header className="workspace-pane-bar"><span>{moduleName(area)}</span><div>{layout.panes.length>1&&<><button aria-label={`Ampliar ${moduleName(area)}`} title="Ocupar esta aba" disabled={navigationPending} onClick={()=>void navigate(area)}><Mark kind="expand"/></button><button aria-label={`Fechar janela ${moduleName(area)}`} disabled={navigationPending} onClick={()=>void closePane(area)}>×</button></>}</div></header><div className="workspace-pane-content">{content}</div>
  </div>;
  return <div className="nodus-shell" data-sidebar-collapsed={preferences.sidebarCollapsed}><EditorialBackdrop/><ActivityRail subjects={subjects} subjectId={active?.id??null} selectSubject={id=>{const s=subjects.find(s=>s.id===id);if(s)void select(s);}} addContent={()=>setContentOpen(true)} newSubject={()=>newModal('subject')} newNote={()=>void quickNote()} browse={()=>{void navigate('study').then(()=>setBrowseOpen(true));}} active={currentArea} panes={layout.panes} navigate={area=>void navigate(area)} add={area=>void addPane(area)} drag={setDragged} pending={navigationPending} search={()=>setPalette(true)}/><WorkspaceFrame sidebarCollapsed={preferences.sidebarCollapsed} sidebarPending={preferencesBusy} toggleSidebar={toggleSidebar} session={session} layout={layout} pending={navigationPending} cinema={videos.mode==='cinema'} dragged={dragged} endDrag={()=>setDragged(null)} add={area=>void addPane(area)} selectTab={id=>void selectTab(id)} newTab={()=>void newTab()} closeTab={id=>void closeTab(id)} resize={resize} saveSizes={()=>void saveSession(sessionRef.current)} focus={focusPane} tools={<SuspendedTools subjectId={active?.id??null} nextStepId={desk?.nextStepId??null} onNext={nextStepId=>void checkpoint({nextStepId})} onError={setError} version={version} cinema={videos.mode==='cinema'} opened={toolOpen} open={setToolOpen}/>}><AreaStage active={currentArea} layout={layout}>
    {pane('study',study)}
    {visited.includes('pdf')&&pane('pdf',pdfModule)}
    {visited.includes('video')&&pane('video',videoModule)}
    {visited.includes('home')&&pane('home',<HomeWorkspace activeArea={shown('home')&&videos.mode!=='cinema'} navigate={area=>void navigate(area)} openSubject={id=>jump(id)} review={()=>void navigate('review')} search={()=>setPalette(true)} newSubject={()=>{void navigate('study').then(()=>newModal('subject'));}} newNote={()=>void quickNote()} addContent={()=>setContentOpen(true)} openTask={async id=>{await jump(id);setToolOpen('checklist');}}/>)}
    {visited.includes('review')&&pane('review',<FlashcardsWorkspace activeArea={shown('review')&&videos.mode!=='cinema'} source={cardSource} clearSource={()=>setCardSource(null)} openNote={jump} activityLaunch={activityLaunch} activeSubjectId={active?.id??null} openActivitySource={openActivitySource}/>)}
    {visited.includes('graph')&&pane('graph',<Suspense fallback={<div className="area-loading">Conectando suas ideias…</div>}><GraphWorkspace activeArea={shown('graph')&&videos.mode!=='cinema'} initialSubjectId={active?.id??null} openNote={(subjectId,id)=>jump(subjectId,id)}/></Suspense>)}
    {visited.includes('explorer')&&pane('explorer',<Suspense fallback={<div className="area-loading">Retomando projetos…</div>}><ProjectWorkspace keyboardActive={currentArea==='explorer'} activeArea={explorerOpen && videos.mode !== 'cinema'} requestedProject={requestedProject} registerFlush={fn => { projectFlush.current = fn; }}/></Suspense>)}
    {visited.includes('city')&&pane('city',<Suspense fallback={<div className="area-loading">Preparando Vale Sereno…</div>}><GameView activeArea={gameOpen && videos.mode !== 'cinema'} keyboardActive={currentArea==='city'} registerFlush={fn=>{gameFlush.current=fn;}} onClose={() => void navigate('study')} onExplorer={() => void navigate('explorer')}/></Suspense>)}
    {visited.includes('settings')&&pane('settings',<Suspense fallback={<div className="area-loading">Abrindo configurações…</div>}><SettingsWorkspace activeArea={settingsOpen && videos.mode !== 'cinema'} navigate={area => void navigate(area)}/></Suspense>)}
  </AreaStage></WorkspaceFrame><VideoSurface controller={videos}/>{contentOpen&&<ContentShelf subject={active?.name??null} vault={Boolean(vault)} close={()=>setContentOpen(false)} choose={choice=>void chooseContent(choice)}/>}{linking&&<MotionDialog title="Relacionar com outra nota" close={()=>setLinking(false)}>{requestClose=><form onSubmit={linkNote}><label>Nota relacionada<select required aria-label="Nota relacionada" value={linkTarget} onChange={e=>setLinkTarget(e.target.value)}><option value="">Escolha uma nota</option>{notes.filter(n=>n.id!==note.doc?.ref.id).map(n=><option key={n.id} value={n.id}>{n.title}</option>)}</select></label>{notes.length<2&&<p>Crie outra nota nesta matéria para fazer uma conexão.</p>}<div className="dialog-buttons"><button type="button" onClick={requestClose}>Cancelar</button><button className="primary" disabled={!linkTarget}>Conectar notas</button></div></form>}</MotionDialog>}{palette&&<CommandPalette close={()=>{setPalette(false);if(deferredModal.current){newModal(deferredModal.current);deferredModal.current=null;}}} onHit={hit} onCommand={command}/>} {error && currentArea !== 'study' && <div className="navigation-error" role="alert">{error}<button aria-label="Fechar aviso da navegação" onClick={() => setError('')}><Mark kind="close"/></button></div>}</div>;
}
