import { useEffect, useState } from 'react';
import { NoteEditor } from './NoteEditor';
import type { Subject } from '../shared/contracts';
export function App() {
  const [version, setVersion] = useState('Inicializando…');
  const [text, setText] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { window.desktop.bootstrap().then(r => r.ok ? setSubjects(r.value.subjects) : setError(r.message)); }, []);
  async function create() { const r = await window.desktop.createSubject({ name, color: 'sage' }); if (r.ok) { setSubjects(s => [...s, r.value]); setName(''); } else setError(r.message); }
  async function rename(id: string) { const r = await window.desktop.renameSubject({ id, name }); if (r.ok) setSubjects(s => s.map(v => v.id === id ? r.value : v)); else setError(r.message); }
  useEffect(() => { window.desktop.version().then(r => setVersion(r.ok ? `Versão ${r.value.version}` : r.message)).catch(() => setVersion('Falha ao iniciar o desktop.')); }, []);
  return <main style={{ background: '#0c1014', color: '#dedfd8', minHeight: '100vh', padding: 48, fontFamily: 'Segoe UI' }}><h1>Seu espaço de estudo</h1><p data-testid="version">{version}</p><input aria-label="Nome da matéria" value={name} onChange={e => setName(e.target.value)}/><button onClick={create}>Criar matéria</button>{subjects.map(s => <div key={s.id}>{s.name}<button onClick={() => rename(s.id)}>Renomear {s.name}</button></div>)}{error && <p role="alert">{error}</p>}<NoteEditor text={text} onChange={setText}/></main>;
}
