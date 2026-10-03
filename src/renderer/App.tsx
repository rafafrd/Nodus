import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { NoteEditor } from './NoteEditor';
import type { Subject, NoteRef, Desk, Material } from '../shared/contracts';
import { useNote } from './useNote';
import { Ambient } from './Ambient';
import { PdfPane } from './PdfPane';
import { FocusPanel } from './FocusPanel';
import { ChecklistPanel } from './ChecklistPanel';
import { Icon as Mark } from './Icon';
import './styles.css';
const GameView = lazy(() => import('./GameView'));
function Modal({ title, children, close }: { title: string; children: ReactNode; close(): void }) {
  const element = useRef<HTMLDialogElement>(null);
  useEffect(() => { element.current?.showModal(); }, []);
  return <dialog ref={element} onCancel={close} aria-label={title}><div className="dialog-title"><h2>{title}</h2><button onClick={close} aria-label="Fechar diálogo">×</button></div>{children}</dialog>;
}
export function App() {
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
  const [focusOwner, setFocusOwner] = useState<string | null>(null);
  const [readingOnly, setReadingOnly] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const note = useNote(setError);
  const latest = useRef({ note, active, desk }); latest.current = { note, active, desk };
  const sequence = useRef(0);
  const workspace = useRef<HTMLDivElement>(null);
  useEffect(() => { if (note.doc) setNotes(n => n.map(v => v.id === note.doc!.ref.id ? note.doc!.ref : v)); }, [note.doc?.ref.id, note.doc?.ref.title]);
  useEffect(() => window.desktop.onStorageError(setError), []);
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    async function poll() { const r = await window.desktop.getFocus({ subjectId: active!.id }); if (!stopped && r.ok) setFocusOwner(r.value.activeOwner?.name ?? null); }
    void poll(); const timer = setInterval(poll, 1000); return () => { stopped = true; clearInterval(timer); };
  }, [active?.id]);
  useEffect(() => {
    void window.desktop.version().then(r => setVersion(r.ok ? `v${r.value.version}` : r.message)).catch(() => setError('Não foi possível iniciar o desktop.'));
    void window.desktop.bootstrap().then(r => {
      if (!r.ok) { setError(r.message); return; }
      setSubjects(r.value.subjects); setVault(r.value.vault);
      const subject = r.value.subjects.find(s => s.id === r.value.activeSubjectId) ?? r.value.subjects[0];
      if (subject) void select(subject);
    });
    return window.desktop.onBeforeClose(() => { void (async () => { if (await latest.current.note.stash()) { const r = await window.desktop.finishClose(); if (!r.ok) setError(r.message); } })(); });
  }, []);
  useEffect(() => {
    if (!active || !workspace.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stopped = false; let cleanup = () => {};
    void import('gsap').then(({ gsap }) => {
      if (stopped) return;
      const context = gsap.context(() => { gsap.fromTo('.panel', { opacity: 0.6, y: 6 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, clearProps: 'transform,opacity' }); }, workspace);
      cleanup = () => context.revert();
    });
    return () => { stopped = true; cleanup(); };
  }, [active?.id]);
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void latest.current.note.save(); }
      if (event.key === 'Escape') setReadingOnly(false);
      if (event.altKey && ['1', '2', '3'].includes(event.key)) { event.preventDefault(); setReadingOnly(false); void checkpoint({ tool: event.key === '1' ? 'focus' : event.key === '2' ? 'checklist' : 'both' }); }
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
    setActive(subject); setDesk(d.value); setNotes(n.value); setMaterials(m.value); setSearch(''); latest.current.note.clear();
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
  function newModal(value: typeof modal) { setName(value === 'rename' ? active?.name ?? '' : ''); setModal(value); }
  async function chooseVault() { const r = await window.desktop.chooseVault(); if (r.ok && r.value) setVault(r.value); else if (!r.ok) setError(r.message); }
  async function open(id: string) {
    if (!await note.stash()) return;
    const subjectId = active?.id; const r = await window.desktop.openNote({ id });
    if (r.ok && latest.current.active?.id === subjectId) { note.load(r.value); await checkpoint({ noteId: id }); } else if (!r.ok) setError(r.message);
  }
  async function importNote() {
    if (!active || !await note.stash()) return;
    const subjectId = active.id; const r = await window.desktop.importNote({ subjectId });
    if (r.ok && r.value && latest.current.active?.id === subjectId) { note.load(r.value); const list = await window.desktop.listNotes({ subjectId }); if (list.ok) setNotes(list.value); await checkpoint({ noteId: r.value.ref.id }); } else if (!r.ok) setError(r.message);
  }
  async function chooseMaterial(replaceId?: string) {
    if (!active) return;
    const subjectId = active.id; const r = await window.desktop.chooseMaterial({ subjectId, replaceId });
    if (r.ok && r.value && latest.current.active?.id === subjectId) { setMaterials(m => replaceId ? m.map(v => v.id === replaceId ? r.value! : v) : [...m, r.value!]); setMaterialGeneration(v => v + 1); await checkpoint({ materialId: r.value.id, page: 1 }); } else if (!r.ok) setError(r.message);
  }
  const material = materials.find(m => m.id === desk?.materialId);
  const visibleNotes = notes.filter(n => n.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const words = useMemo(() => { const body = note.text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim(); return body ? body.split(/\s+/u).length : 0; }, [note.text]);
  async function enterCity() {
    if (!await note.stash()) return;
    if (active) {
      const current = await window.desktop.getFocus({ subjectId: active.id });
      if (!current.ok) { setError(current.message); return; }
      if (current.value.activeOwner) {
        const owner = await window.desktop.getFocus({ subjectId: current.value.activeOwner.id });
        if (!owner.ok) { setError(owner.message); return; }
        if (owner.value.session?.state === 'running') {
          const paused = await window.desktop.actFocus({ subjectId: owner.value.activeOwner!.id, id: owner.value.session.id, action: 'pause' });
          if (!paused.ok) { setError(paused.message); return; }
        }
      }
    }
    setGameOpen(true);
  }
  if (gameOpen) return <Suspense fallback={<div className="game-loading">Abrindo sua vila…</div>}><GameView onClose={() => setGameOpen(false)}/></Suspense>;
  return <div className={`app-shell ${readingOnly ? 'reading-only' : ''}`}>
    <aside className="sidebar"><div className="brand"><span className="brand-mark"><Mark/></span><div>APP ESTUDOS<small>SEU ESPAÇO DE ESTUDO</small></div></div>
      <div className="section-label">SUAS MATÉRIAS <button onClick={() => newModal('subject')} aria-label="Nova matéria">+</button></div>
      <nav aria-label="Matérias" className="subject-list">{subjects.map((s, i) => <button key={s.id} aria-label={s.name} aria-current={active?.id === s.id ? 'page' : undefined} className={`subject ${active?.id === s.id ? 'active' : ''}`} data-color={s.color} onClick={() => select(s)}><span className="subject-dot"/><span>{s.name}</span><small>{String(i + 1).padStart(2, '0')}</small></button>)}{subjects.length === 0 && <p className="sidebar-hint">Crie uma matéria para começar.</p>}</nav>
      {active && <><div className="section-label"><span>SEU CADERNO <small>{notes.length}</small></span><button onClick={() => newModal('note')} disabled={!vault} aria-label="Nova nota">+</button></div><div className="search-wrap"><Mark kind="search"/><input className="search" aria-label="Buscar notas" placeholder="Encontrar uma nota…" value={search} onChange={e => setSearch(e.target.value)}/></div><nav aria-label="Notas" className="notes-list">{visibleNotes.map(n => <button className={note.doc?.ref.id === n.id ? 'active' : ''} key={n.id} aria-label={n.title} aria-current={note.doc?.ref.id === n.id ? 'page' : undefined} onClick={() => open(n.id)}><Mark kind="note"/><span>{n.title}</span><span className="note-indicator"/></button>)}{visibleNotes.length === 0 && <div className="notes-empty"><p>{search ? 'Nenhuma nota encontrada.' : 'Seu caderno começa com uma ideia.'}</p>{search && <button onClick={() => setSearch('')}>Limpar busca</button>}</div>}</nav><button className="text-button import" onClick={importNote} disabled={!vault}>+ Importar Markdown</button></>}
      <button className="city-entry" aria-label="Entrar na cidade" onClick={() => void enterCity()}><span>⌂</span><span>Seu mundo<small>Cidade · farm · aventuras</small></span><span>↗</span></button><div className="sidebar-bottom"><button className="vault-button" onClick={chooseVault}><span className={`connection ${vault ? 'connected' : ''}`}/><span>{vault ? 'Pasta de notas vinculada' : 'Escolher pasta de notas'}<small>{vault ? 'Arquivos locais · Markdown' : 'Escolha seu vault'}</small></span><span>↗</span></button><div className="sidebar-caption">Seu material permanece no computador.</div></div>
    </aside>
    <div className="main-column"><header className="workspace-header"><Ambient/><div className="header-top"><div className="eyebrow"><span className="connection connected"/> MESA DE ESTUDO <span className="breadcrumb-divider">/</span><span className="header-context">{active ? 'Seu espaço, retomado.' : 'Bem-vindo ao seu espaço.'}</span></div><span className="local-label"><span className="connection connected"/> LOCAL</span></div><div className="header-main"><div><div className="heading-row"><h1>{active?.name ?? 'Um lugar para continuar.'}</h1>{active && <button className="text-button rename" onClick={() => newModal('rename')} aria-label={`Renomear ${active.name}`} title="Renomear matéria">↗</button>}</div><p>{active ? <><span>{notes.length} {notes.length === 1 ? 'nota' : 'notas'}</span><span className="meta-dot">·</span><span>{materials.length} {materials.length === 1 ? 'material' : 'materiais'}</span><span className="header-description">Tudo no lugar. Continue de onde parou.</span></> : 'Organize o essencial. Dê espaço às suas ideias.'}</p></div>{active && <div className="workspace-view-controls"><button className={`reading-toggle ${desk?.tool === 'both' ? 'selected' : ''}`} onClick={() => { setReadingOnly(false); void checkpoint({ tool: desk?.tool === 'both' ? 'checklist' : 'both' }); }} aria-label="Grade de módulos" aria-pressed={desk?.tool === 'both'} title="Grade de módulos · Alt+3"><Mark kind="layout"/> Módulos</button><button className={`reading-toggle ${readingOnly ? 'selected' : ''}`} onClick={() => setReadingOnly(v => !v)} aria-pressed={readingOnly} aria-label={readingOnly ? 'Voltar à mesa' : 'Só caderno'} title={readingOnly ? 'Voltar à mesa · Esc' : 'Expandir caderno'}><Mark kind={readingOnly ? 'collapse' : 'expand'}/><span>{readingOnly ? 'Voltar à mesa' : 'Só caderno'}</span></button></div>}</div></header>
      {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Fechar aviso">×</button></div>}
      {loading && <div className="loading-line" role="status">Abrindo mesa…</div>}
      {!active ? <section className="welcome"><div className="welcome-copy"><span className="eyebrow">SEU ESPAÇO DE ESTUDO</span><h2>Uma mesa.<br/><em>Suas ideias.</em></h2><p>Notas, material e próximos passos, lado a lado.<br/>Crie uma matéria para montar sua primeira mesa.</p><button className="primary" onClick={() => newModal('subject')}>+ Criar primeira matéria <Mark kind="arrow"/></button><div className="welcome-foot"><span><b>01</b> Organize</span><span><b>02</b> Estude</span><span><b>03</b> Retome</span></div></div><div className="welcome-modules"><div><span>01</span><Mark kind="note"/><strong>Caderno</strong><p>Guarde e desenvolva suas ideias.</p></div><div><span>02</span><Mark kind="book"/><strong>Material</strong><p>Consulte seu PDF enquanto estuda.</p></div><div><span>03</span><Mark kind="focus"/><strong>Foco</strong><p>Um tempo reservado para continuar.</p></div><div><span>04</span><Mark kind="check"/><strong>Próximos passos</strong><p>Uma etapa de cada vez.</p></div></div></section> : <div className={`desk ${desk?.tool === 'both' ? 'module-grid' : ''}`} ref={workspace} style={{ gridTemplateColumns: `${desk?.split ?? 55}fr 6px ${100 - (desk?.split ?? 55)}fr` }}>
        <section className="panel note-panel"><div className="panel-header"><span className="panel-caption"><span className="panel-index">01</span><Mark kind="note"/> CADERNO</span><div className="panel-actions"><button onClick={() => newModal('note')} disabled={!vault}>+ Nova nota</button>{note.doc && <button className="save-button" onClick={note.save} aria-label="Salvar nota" title="Ctrl+S">Salvar <kbd>Ctrl S</kbd><Mark kind="arrow"/></button>}</div></div>
          {note.doc ? <><div className="note-title"><h2>{note.doc.ref.title}</h2><div className="note-meta"><span className={note.conflict ? 'warning-text' : ''} role="status">{note.status}</span><div className="segmented"><button className={!desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: false })}>Editar</button><button className={desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: true })}>Leitura</button></div></div></div>
            {note.doc.draft && !note.conflict && <div className="draft-banner">Rascunho recuperado <button onClick={note.useFile}>Usar versão do arquivo</button></div>}
            {note.conflict && <div className="conflict-box"><strong>Arquivo alterado fora do app</strong><p>Sua edição foi preservada. Confira a versão externa antes de continuar.</p><details><summary>Ver versão externa</summary><pre>{note.conflict.text}</pre></details><button onClick={note.useFile}>Usar versão do arquivo</button><button onClick={note.keepMine}>Conservar minha edição para revisão</button></div>}
            <NoteEditor key={note.doc.ref.id} title={note.doc.ref.title} text={note.text} onChange={note.change} preview={desk?.preview ?? false}/><div className="note-foot"><span><span className={`connection ${note.text === note.doc.text && !note.conflict ? 'connected' : ''}`}/>{note.conflict ? 'Revisão necessária' : note.text === note.doc.text ? 'Arquivo atualizado' : 'Edição em andamento'}</span><span>{words} palavras <span className="meta-dot">·</span> ~{Math.max(1, Math.ceil(words / 200))} min de leitura</span></div> </> : <div className="panel-empty"><Mark kind="note"/><h2>Ideias que ficam.</h2><p>{vault ? 'Crie uma nota ou importe um Markdown deste vault.' : 'Escolha uma pasta de notas para guardar seus arquivos.'}</p><button className="primary" onClick={vault ? () => newModal('note') : chooseVault}>{vault ? '+ Criar nota' : 'Escolher pasta de notas'}</button></div>}
        </section>
        <div className="divider"><input type="range" min="30" max="75" value={desk?.split ?? 55} aria-label="Largura do caderno" onChange={e => checkpoint({ split: Number(e.target.value) })}/></div>
        <div className="right-column"><section className="panel document-panel"><div className="panel-header"><span className="panel-caption"><span className="panel-index">02</span><Mark kind="book"/> MATERIAL</span><button onClick={() => chooseMaterial()}>Abrir PDF ↗</button></div>{materials.length > 0 && <select aria-label="Documento ativo" value={desk?.materialId ?? ''} onChange={e => checkpoint({ materialId: e.target.value || null, page: 1 })}><option value="">Escolher documento</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>}{material && desk ? <PdfPane key={`${material.id}:${materialGeneration}`} material={material} page={desk.page} onPage={page => checkpoint({ page })} onLocate={() => chooseMaterial(material.id)}/> : <div className="panel-empty"><Mark kind="book"/><h3>Seu material, à mão.</h3><p>Abra um PDF para consultar junto das notas.</p><button onClick={() => chooseMaterial()}>+ Selecionar documento</button></div>}</section>
          {desk?.tool !== 'none' && <section className="panel tool-panel"><div className="panel-header"><span className="panel-caption"><span className="panel-index">{desk?.tool === 'focus' ? '03' : '04'}</span><Mark kind={desk?.tool === 'focus' ? 'focus' : 'check'}/>{desk?.tool === 'focus' ? 'FOCO' : 'PRÓXIMOS PASSOS'}</span><button onClick={() => checkpoint({ tool: desk?.tool === 'both' ? 'focus' : 'none' })} aria-label={desk?.tool === 'both' ? 'Fechar módulo checklist' : 'Fechar ferramenta'}>×</button></div>{desk?.tool === 'focus' ? <FocusPanel key={active.id} subjectId={active.id} onError={setError}/> : <ChecklistPanel key={active.id} subjectId={active.id} nextStepId={desk?.nextStepId ?? null} onNext={nextStepId => checkpoint({ nextStepId })} onError={setError}/>}</section>}
        </div>
        {desk?.tool === 'both' && <section className="panel focus-module"><div className="panel-header"><span className="panel-caption"><span className="panel-index">03</span><Mark kind="focus"/> FOCO</span><button aria-label="Fechar módulo foco" onClick={() => checkpoint({ tool: 'checklist' })}>×</button></div><FocusPanel key={active.id} subjectId={active.id} onError={setError}/></section>}
      </div>}
      {active && <div className="tool-dock" aria-label="Ferramentas"><span className="dock-caption">MÓDULOS</span><button className={desk?.tool === 'focus' ? 'selected' : ''} aria-label="Abrir foco" aria-pressed={desk?.tool === 'focus'} title="Foco · Alt+1" onClick={() => checkpoint({ tool: desk?.tool === 'focus' ? 'none' : 'focus' })}><Mark kind="focus"/> Foco <kbd>1</kbd></button><span className="dock-separator"/><button className={desk?.tool === 'checklist' ? 'selected' : ''} aria-label="Abrir checklist" aria-pressed={desk?.tool === 'checklist'} title="Checklist · Alt+2" onClick={() => checkpoint({ tool: desk?.tool === 'checklist' ? 'none' : 'checklist' })}><Mark kind="check"/> Checklist <kbd>2</kbd></button><span className="dock-separator"/><button className={desk?.tool === 'both' ? 'selected' : ''} aria-label="Abrir todos os módulos" aria-pressed={desk?.tool === 'both'} title="Todos os módulos · Alt+3" onClick={() => checkpoint({ tool: 'both' })}><Mark kind="layout"/> Todos <kbd>3</kbd></button></div>}
      <footer className="statusbar"><span><span className="connection connected"/> {focusOwner ? `Foco em ${focusOwner}` : vault ? 'Arquivos locais' : 'Escolha sua pasta de notas'} · {subjects.length} matérias</span><span>SEU ESPAÇO PESSOAL <span data-testid="version">{version}</span></span></footer>
    </div>
    {modal && <Modal title={modal === 'note' ? 'Nova nota' : modal === 'rename' ? 'Renomear matéria' : 'Nova matéria'} close={() => setModal(null)}><form onSubmit={submit}><label>{modal === 'note' ? 'Título da nota' : 'Nome da matéria'}<input autoFocus required maxLength={modal === 'note' ? 160 : 120} aria-label={modal === 'note' ? 'Título da nota' : 'Nome da matéria'} value={name} onChange={e => setName(e.target.value)}/></label>{modal === 'subject' && <label>Cor<select value={color} onChange={e => setColor(e.target.value)}><option value="sage">Sálvia</option><option value="blue">Azul</option><option value="rose">Rosa</option><option value="amber">Âmbar</option></select></label>}<div className="dialog-buttons"><button type="button" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="primary">{modal === 'note' ? 'Criar nota' : modal === 'rename' ? 'Salvar nome' : 'Criar matéria'}</button></div></form></Modal>}
  </div>;
}
