import { useEffect, useRef, useState } from 'react';
import { NoteEditor } from './NoteEditor';
import type { Subject, NoteRef } from '../shared/contracts';
import { useNote } from './useNote';
export function App() {
  const [version, setVersion] = useState('Inicializando…');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [active, setActive] = useState<Subject | null>(null);
  const [notes, setNotes] = useState<NoteRef[]>([]);
  const [vault, setVault] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const note = useNote(setError);
  const ref = useRef(note); ref.current = note;
  useEffect(() => {
    window.desktop.version().then(r => setVersion(r.ok ? `Versão ${r.value.version}` : r.message));
    window.desktop.bootstrap().then(r => { if (r.ok) { setSubjects(r.value.subjects); setVault(r.value.vault); } else setError(r.message); });
    return window.desktop.onBeforeClose(() => { void (async () => { if (await ref.current.stash()) await window.desktop.finishClose(); })(); });
  }, []);
  async function create() { const r = await window.desktop.createSubject({ name, color: 'sage' }); if (r.ok) { setSubjects(s => [...s, r.value]); setName(''); await select(r.value); } else setError(r.message); }
  async function rename(id: string) { const r = await window.desktop.renameSubject({ id, name }); if (r.ok) { setSubjects(s => s.map(v => v.id === id ? r.value : v)); if (active?.id === id) setActive(r.value); } else setError(r.message); }
  async function select(subject: Subject) { if (!await note.stash()) return; setActive(subject); note.clear(); const r = await window.desktop.listNotes({ subjectId: subject.id }); if (r.ok) setNotes(r.value); else setError(r.message); }
  async function chooseVault() { const r = await window.desktop.chooseVault(); if (r.ok && r.value) setVault(r.value); else if (!r.ok) setError(r.message); }
  async function createNote() {
    if (!active || !await note.stash()) return;
    const r = await window.desktop.createNote({ subjectId: active.id, title });
    if (r.ok) { note.load(r.value); setNotes(n => [...n, r.value.ref]); setTitle(''); } else setError(r.message);
  }
  async function open(id: string) { if (!await note.stash()) return; const r = await window.desktop.openNote({ id }); if (r.ok) note.load(r.value); else setError(r.message); }
  async function importNote() { if (!active || !await note.stash()) return; const r = await window.desktop.importNote({ subjectId: active.id }); if (r.ok && r.value) { note.load(r.value); const list = await window.desktop.listNotes({ subjectId: active.id }); if (list.ok) setNotes(list.value); } else if (!r.ok) setError(r.message); }
  return <main style={{ background: '#0c1014', color: '#dedfd8', minHeight: '100vh', padding: 32, fontFamily: 'Segoe UI' }}>
    <h1>Seu espaço de estudo</h1><p data-testid="version">{version}</p><button onClick={chooseVault}>{vault ? 'Pasta de notas vinculada' : 'Escolher pasta de notas'}</button>
    <input aria-label="Nome da matéria" value={name} onChange={e => setName(e.target.value)}/><button onClick={create}>Criar matéria</button>
    {subjects.map(s => <div key={s.id}><button onClick={() => select(s)}>{s.name}</button><button onClick={() => rename(s.id)}>Renomear {s.name}</button></div>)}
    {active && <><h2>{active.name}</h2><input aria-label="Título da nota" value={title} onChange={e => setTitle(e.target.value)}/><button onClick={createNote} disabled={!vault}>Criar nota</button><button onClick={importNote} disabled={!vault}>Importar Markdown</button>{notes.map(n => <button key={n.id} onClick={() => open(n.id)}>{n.title}</button>)}</>}
    {error && <p role="alert">{error}<button onClick={() => setError('')}>Fechar aviso</button></p>}
    {note.doc && <><p role="status">{note.status}</p><button onClick={note.save}>Salvar nota</button>{note.doc.draft && <button onClick={note.useFile}>Usar versão do arquivo</button>}
      {note.conflict && <aside><h3>Arquivo alterado fora do app</h3><p>Seu texto continua no editor. Confira a versão externa antes de escolher.</p><details><summary>Ver versão externa</summary><pre>{note.conflict.text}</pre></details><button onClick={note.useFile}>Usar versão do arquivo</button><button onClick={note.keepMine}>Conservar minha edição para revisão</button></aside>}
      <NoteEditor key={note.doc.ref.id} text={note.text} onChange={note.change}/></>}
  </main>;
}
