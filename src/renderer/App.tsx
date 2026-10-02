import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { NoteEditor } from './NoteEditor';
import type { Subject, NoteRef, Desk, Material } from '../shared/contracts';
import { useNote } from './useNote';
import { Ambient } from './Ambient';
import { PdfPane } from './PdfPane';
import { FocusPanel } from './FocusPanel';
import { ChecklistPanel } from './ChecklistPanel';
import './styles.css';
function Mark({ kind = 'orbit' }: { kind?: 'orbit' | 'note' | 'book' | 'focus' | 'check' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{kind === 'orbit' ? <><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/></> : kind === 'note' ? <><path d="M6 3h9l3 3v15H6zM14 3v5h4M9 12h6M9 16h5"/></> : kind === 'book' ? <><path d="M3 5c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 1-2-1-5-2-9-1zM12 7v14"/></> : kind === 'focus' ? <><circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6"/></> : <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/></>}</svg>;
}
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
  const note = useNote(setError);
  const latest = useRef({ note, active, desk }); latest.current = { note, active, desk };
  const sequence = useRef(0);
  const workspace = useRef<HTMLDivElement>(null);
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
    function key(event: KeyboardEvent) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void latest.current.note.save(); } }
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
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark"><Mark/></span><div>APP ESTUDOS<small>ESPAÇO PESSOAL / MVP</small></div></div>
      <div className="section-label">SUAS MATÉRIAS <button onClick={() => newModal('subject')} aria-label="Nova matéria">+</button></div>
      <nav aria-label="Matérias" className="subject-list">{subjects.map((s, i) => <button key={s.id} aria-label={s.name} aria-current={active?.id === s.id ? 'page' : undefined} className={`subject ${active?.id === s.id ? 'active' : ''}`} data-color={s.color} onClick={() => select(s)}><span className="subject-dot"/><span>{s.name}</span><small>{String(i + 1).padStart(2, '0')}</small></button>)}{subjects.length === 0 && <p className="sidebar-hint">Crie uma matéria para começar.</p>}</nav>
      {active && <><div className="section-label">NOTAS <button onClick={() => newModal('note')} disabled={!vault} aria-label="Nova nota">+</button></div><input className="search" aria-label="Buscar notas" placeholder="Buscar nesta matéria…" value={search} onChange={e => setSearch(e.target.value)}/><nav aria-label="Notas" className="notes-list">{notes.filter(n => n.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(n => <button className={note.doc?.ref.id === n.id ? 'active' : ''} key={n.id} onClick={() => open(n.id)}><Mark kind="note"/><span>{n.title}</span></button>)}</nav><button className="text-button import" onClick={importNote} disabled={!vault}>+ Importar Markdown</button></>}
      <div className="sidebar-bottom"><button className="vault-button" onClick={chooseVault}><span className={`connection ${vault ? 'connected' : ''}`}/><span>{vault ? 'Pasta de notas vinculada' : 'Escolher pasta de notas'}<small>{vault ? 'Arquivos locais · Markdown' : 'Escolha seu vault'}</small></span><span>↗</span></button><div className="sidebar-caption">Seu material permanece no computador.</div></div>
    </aside>
    <div className="main-column"><header className="workspace-header"><Ambient/><div className="eyebrow"><span className="connection connected"/> MESA DE ESTUDO <span className="local-label">LOCAL</span></div><div className="heading-row"><h1>{active?.name ?? 'Um lugar para continuar.'}</h1>{active && <button className="text-button" onClick={() => newModal('rename')} aria-label={`Renomear ${active.name}`}>Renomear ↗</button>}</div><p>{active ? 'Abra seu material. Escolha o próximo passo. Retome de onde parou.' : 'Organize o essencial, sem perder de vista o que está estudando.'}</p></header>
      {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Fechar aviso">×</button></div>}
      {loading && <div className="loading-line" role="status">Abrindo mesa…</div>}
      {!active ? <section className="welcome"><div className="welcome-symbol"><Mark/></div><span className="eyebrow">COMECE PELO ESSENCIAL</span><h2>Seu próximo passo<br/>fica aqui.</h2><p>Uma matéria, suas notas e o material aberto.<br/>Um espaço tranquilo para estudar e retomar.</p><button className="primary" onClick={() => newModal('subject')}>+ Criar primeira matéria</button><div className="welcome-foot"><span>01 / ORGANIZAR</span><span>02 / ESTUDAR</span><span>03 / RETOMAR</span></div></section> : <div className="desk" ref={workspace} style={{ gridTemplateColumns: `${desk?.split ?? 55}fr 16px ${100 - (desk?.split ?? 55)}fr` }}>
        <section className="panel note-panel"><div className="panel-header"><span className="panel-caption"><Mark kind="note"/> CADERNO</span><div className="panel-actions"><button onClick={() => newModal('note')} disabled={!vault}>+ Nova nota</button>{note.doc && <button className="save-button" onClick={note.save} title="Ctrl+S">Salvar nota ↗</button>}</div></div>
          {note.doc ? <><div className="note-title"><h2>{note.doc.ref.title}</h2><div className="note-meta"><span className={note.conflict ? 'warning-text' : ''} role="status">{note.status}</span><div className="segmented"><button className={!desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: false })}>Editar</button><button className={desk?.preview ? 'selected' : ''} onClick={() => checkpoint({ preview: true })}>Leitura</button></div></div></div>
            {note.doc.draft && !note.conflict && <div className="draft-banner">Rascunho recuperado <button onClick={note.useFile}>Usar versão do arquivo</button></div>}
            {note.conflict && <div className="conflict-box"><strong>Arquivo alterado fora do app</strong><p>Sua edição foi preservada. Confira a versão externa antes de continuar.</p><details><summary>Ver versão externa</summary><pre>{note.conflict.text}</pre></details><button onClick={note.useFile}>Usar versão do arquivo</button><button onClick={note.keepMine}>Conservar minha edição para revisão</button></div>}
            <NoteEditor key={note.doc.ref.id} text={note.text} onChange={note.change} preview={desk?.preview ?? false}/></> : <div className="panel-empty"><Mark kind="note"/><h2>Ideias que ficam.</h2><p>{vault ? 'Crie uma nota ou importe um Markdown deste vault.' : 'Escolha uma pasta de notas para guardar seus arquivos.'}</p><button className="primary" onClick={vault ? () => newModal('note') : chooseVault}>{vault ? '+ Criar nota' : 'Escolher pasta de notas'}</button></div>}
        </section>
        <div className="divider"><input type="range" min="30" max="75" value={desk?.split ?? 55} aria-label="Largura do caderno" onChange={e => checkpoint({ split: Number(e.target.value) })}/></div>
        <div className="right-column"><section className="panel document-panel"><div className="panel-header"><span className="panel-caption"><Mark kind="book"/> MATERIAL</span><button onClick={() => chooseMaterial()}>Abrir PDF ↗</button></div>{materials.length > 0 && <select aria-label="Documento ativo" value={desk?.materialId ?? ''} onChange={e => checkpoint({ materialId: e.target.value || null, page: 1 })}><option value="">Escolher documento</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>}{material && desk ? <PdfPane key={`${material.id}:${materialGeneration}`} material={material} page={desk.page} onPage={page => checkpoint({ page })} onLocate={() => chooseMaterial(material.id)}/> : <div className="panel-empty"><Mark kind="book"/><h3>Seu material, à mão.</h3><p>Abra um PDF para consultar junto das notas.</p><button onClick={() => chooseMaterial()}>+ Selecionar documento</button></div>}</section>
          {desk?.tool !== 'none' && <section className="panel tool-panel"><div className="panel-header"><span className="panel-caption"><Mark kind={desk?.tool === 'focus' ? 'focus' : 'check'}/>{desk?.tool === 'focus' ? 'FOCO' : 'PRÓXIMOS PASSOS'}</span><button onClick={() => checkpoint({ tool: 'none' })} aria-label="Fechar ferramenta">×</button></div>{desk?.tool === 'focus' ? <FocusPanel key={active.id} subjectId={active.id} onError={setError}/> : <ChecklistPanel key={active.id} subjectId={active.id} nextStepId={desk?.nextStepId ?? null} onNext={nextStepId => checkpoint({ nextStepId })} onError={setError}/>}</section>}
        </div>
      </div>}
      {active && <div className="tool-dock" aria-label="Ferramentas"><button className={desk?.tool === 'focus' ? 'selected' : ''} onClick={() => checkpoint({ tool: desk?.tool === 'focus' ? 'none' : 'focus' })}><Mark kind="focus"/> Abrir foco</button><button className={desk?.tool === 'checklist' ? 'selected' : ''} onClick={() => checkpoint({ tool: desk?.tool === 'checklist' ? 'none' : 'checklist' })}><Mark kind="check"/> Abrir checklist</button></div>}
      <footer className="statusbar"><span><span className="connection connected"/> {focusOwner ? `Foco em ${focusOwner}` : vault ? 'Vault local' : 'Vault não escolhido'} · {subjects.length} matérias</span><span>MD + SQLITE <span data-testid="version">{version}</span></span></footer>
    </div>
    {modal && <Modal title={modal === 'note' ? 'Nova nota' : modal === 'rename' ? 'Renomear matéria' : 'Nova matéria'} close={() => setModal(null)}><form onSubmit={submit}><label>{modal === 'note' ? 'Título da nota' : 'Nome da matéria'}<input autoFocus required maxLength={modal === 'note' ? 160 : 120} aria-label={modal === 'note' ? 'Título da nota' : 'Nome da matéria'} value={name} onChange={e => setName(e.target.value)}/></label>{modal === 'subject' && <label>Cor<select value={color} onChange={e => setColor(e.target.value)}><option value="sage">Sálvia</option><option value="blue">Azul</option><option value="rose">Rosa</option><option value="amber">Âmbar</option></select></label>}<div className="dialog-buttons"><button type="button" onClick={() => setModal(null)}>Cancelar</button><button type="submit" className="primary">{modal === 'note' ? 'Criar nota' : modal === 'rename' ? 'Salvar nome' : 'Criar matéria'}</button></div></form></Modal>}
  </div>;
}
