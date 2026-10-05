import { useEffect, useRef } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
export function ProjectEditor({ text, onChange, onSave, busy }: { busy: boolean; text: string; onChange(text: string): void; onSave(): void }) {
  const editability = useRef(new Compartment()), syncing = useRef(false);
  const host = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null), live = useRef({ onChange, onSave }); live.current = { onChange, onSave };
  useEffect(() => { if (!host.current) return; const editor = new EditorView({ parent: host.current, state: EditorState.create({ doc: text, extensions: [
    EditorState.lineSeparator.of(text.includes('\r\n') ? '\r\n' : '\n'), editability.current.of([EditorState.readOnly.of(busy), EditorView.editable.of(!busy)]), lineNumbers(), history(), keymap.of([{ key: 'Mod-s', run: () => { live.current.onSave(); return true; } }, ...defaultKeymap, ...historyKeymap]),
    EditorView.contentAttributes.of({ 'aria-label': 'Conteúdo do arquivo' }),
    EditorView.theme({ '&': { height: '100%', color: '#deded7', backgroundColor: '#141917' }, '.cm-content': { fontFamily: 'Consolas, monospace', fontSize: '14px', lineHeight: '1.8', padding: '24px 0' }, '.cm-gutters': { color: '#697a70', backgroundColor: '#141917', border: 'none', paddingRight: '16px' }, '.cm-scroller': { overflow: 'auto' }, '&.cm-focused': { outline: 'none' }, '.cm-cursor': { borderLeftColor: '#dbc793' } }, { dark: true }),
    EditorView.updateListener.of(u => { if (u.docChanged && !syncing.current) live.current.onChange(u.state.sliceDoc()); }),
  ] }) }); view.current = editor; return () => { view.current = null; editor.destroy(); }; }, []);
  useEffect(() => { const v = view.current; if (v && v.state.sliceDoc() !== text) { syncing.current = true; try { v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } }); } finally { syncing.current = false; } } }, [text]);
  useEffect(() => { view.current?.dispatch({ effects: editability.current.reconfigure([EditorState.readOnly.of(busy), EditorView.editable.of(!busy)]) }); }, [busy]);
  return <div className="project-editor" ref={host}/>;
}
