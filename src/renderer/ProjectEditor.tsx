import { useEffect, useRef } from 'react';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
const colors = HighlightStyle.define([
  { tag: tags.keyword, color: '#c3add6' }, { tag: [tags.string, tags.special(tags.string)], color: '#c8cf9f' },
  { tag: [tags.number, tags.bool, tags.null], color: '#dfb88e' }, { tag: tags.comment, color: '#90a196', fontStyle: 'italic' },
  { tag: [tags.function(tags.variableName), tags.propertyName], color: '#e4d1a0' }, { tag: tags.typeName, color: '#9ebec5' },
  { tag: tags.heading, color: '#e4d1a0', fontWeight: '600' }, { tag: tags.link, color: '#a7c4c5' },
]);
function language(path: string) { const ext = path.split('.').at(-1)?.toLowerCase(); return ext === 'ts' || ext === 'tsx' ? javascript({ typescript: true, jsx: ext === 'tsx' }) : ext === 'js' || ext === 'jsx' ? javascript({ jsx: ext === 'jsx' }) : ext === 'json' ? json() : ext === 'css' ? css() : ext === 'html' || ext === 'htm' ? html() : ext === 'md' ? markdown() : []; }
export function ProjectEditor({ text, onChange, onSave, busy, path }: { path: string; busy: boolean; text: string; onChange(text: string): void; onSave(): void }) {
  const editability = useRef(new Compartment()), syncing = useRef(false);
  const host = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null), live = useRef({ onChange, onSave }); live.current = { onChange, onSave };
  useEffect(() => { if (!host.current) return; const editor = new EditorView({ parent: host.current, state: EditorState.create({ doc: text, extensions: [
    EditorState.lineSeparator.of(text.includes('\r\n') ? '\r\n' : '\n'), language(path), syntaxHighlighting(colors), editability.current.of([EditorState.readOnly.of(busy), EditorView.editable.of(!busy)]), lineNumbers(), history(), keymap.of([{ key: 'Mod-s', run: () => { live.current.onSave(); return true; } }, ...defaultKeymap, ...historyKeymap]),
    EditorView.contentAttributes.of({ 'aria-label': 'Conteúdo do arquivo' }),
    EditorView.theme({ '&': { height: '100%', color: 'var(--theme-text)', backgroundColor: 'var(--theme-editor)' }, '.cm-content': { fontFamily: 'Consolas, monospace', fontSize: '15px', lineHeight: '1.8', padding: '24px 0' }, '.cm-gutters': { color: '#8b9b90', backgroundColor: 'var(--theme-editor)', border: 'none', paddingRight: '16px' }, '.cm-scroller': { overflow: 'auto' }, '&.cm-focused': { outline: 'none' }, '.cm-cursor': { borderLeftColor: 'var(--theme-accent)' } }, { dark: true }),
    EditorView.updateListener.of(u => { if (u.docChanged && !syncing.current) live.current.onChange(u.state.sliceDoc()); }),
  ] }) }); view.current = editor; return () => { view.current = null; editor.destroy(); }; }, []);
  useEffect(() => { const v = view.current; if (v && v.state.sliceDoc() !== text) { syncing.current = true; try { v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } }); } finally { syncing.current = false; } } }, [text]);
  useEffect(() => { view.current?.dispatch({ effects: editability.current.reconfigure([EditorState.readOnly.of(busy), EditorView.editable.of(!busy)]) }); }, [busy]);
  return <div className="project-editor" ref={host}/>;
}
