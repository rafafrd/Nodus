import { useCallback, useEffect, useRef, useState } from 'react';
import type { NoteDocument } from '../shared/contracts';
export function useNote(setError: (message: string) => void) {
  const [doc, setDoc] = useState<NoteDocument | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [conflict, setConflict] = useState<NoteDocument | null>(null);
  const current = useRef({ doc, text }); current.current = { doc, text };
  const hasDraft = useRef(false);
  const load = useCallback((document: NoteDocument) => {
    current.current = { doc: document, text: document.draft?.text ?? document.text };
    hasDraft.current = Boolean(document.draft);
    setDoc(document); setText(document.draft?.text ?? document.text);
    setStatus(document.draft ? 'Rascunho recuperado' : 'Salvo no arquivo');
    setConflict(document.draft && document.draft.baseHash !== document.hash ? document : null);
  }, []);
  async function stash() {
    const { doc, text } = current.current;
    if (!doc) return true;
    if (text === doc.text && !doc.draft) {
      if (hasDraft.current) {
        const discarded = await window.desktop.discardDraft({ id: doc.ref.id });
        if (!discarded.ok) { setError(discarded.message); return false; }
        hasDraft.current = false;
      }
      return true;
    }
    hasDraft.current = true;
    const result = await window.desktop.recoverDraft({ id: doc.ref.id, text, hash: doc.draft?.baseHash ?? doc.hash });
    if (!result.ok) { setError(result.message); setStatus('Erro ao preservar rascunho'); return false; }
    return true;
  }
  function change(value: string) {
    if (value === current.current.text) return;
    setText(value); current.current.text = value;
    setStatus(value === current.current.doc?.text ? 'Salvo no arquivo' : 'Edição pendente');
    void stash();
  }
  async function save() {
    const { doc, text } = current.current; if (!doc) return;
    setStatus('Salvando…');
    const result = await window.desktop.saveNote({ id: doc.ref.id, text, hash: doc.draft?.baseHash ?? doc.hash });
    if (!result.ok) { setError(result.message); setStatus('Erro ao salvar · rascunho preservado'); return; }
    if (result.value.state === 'conflict') { setConflict(result.value.external); setStatus('Conflito · duas versões preservadas'); return; }
    const saved = result.value.document;
    if (current.current.doc?.ref.id !== doc.ref.id) return null;
    if (current.current.text === text) load(saved);
    else { setDoc(saved); current.current.doc = saved; setStatus('Edição pendente'); await stash(); }
    return saved;
  }
  useEffect(() => {
    if (!doc) return;
    let stopped = false, pending = false;
    const timer = setInterval(async () => {
      if (pending) return; pending = true;
      try {
        const r = await window.desktop.openNote({ id: doc.ref.id });
        if (stopped || current.current.doc?.ref.id !== doc.ref.id) return;
        if (!r.ok) { setError(r.message); return; }
        if (r.value.hash !== current.current.doc.hash) {
          if (current.current.text !== current.current.doc.text || current.current.doc.draft) { setConflict(r.value); setStatus('Conflito · duas versões preservadas'); }
          else load(r.value);
        }
      } finally { pending = false; }
    }, 1500);
    return () => { stopped = true; clearInterval(timer); };
  }, [doc?.ref.id, load]);
  async function useFile() {
    if (!doc) return;
    const r = await window.desktop.discardDraft({ id: doc.ref.id });
    if (r.ok) load(r.value); else setError(r.message);
  }
  function keepMine() {
    if (!conflict) return;
    const next = { ...conflict, draft: null };
    setDoc(next); current.current.doc = next; setConflict(null); setStatus('Revisão manual · salve para confirmar'); void stash();
  }
  function clear() { current.current = { doc: null, text: '' }; hasDraft.current = false; setDoc(null); setText(''); setStatus(''); setConflict(null); }
  return { doc, text, status, conflict, load, stash, change, save, useFile, keepMine, clear,snapshot:()=>current.current };
}
