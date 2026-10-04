import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatSelection, type EditKind } from '../shared/markdown';
import { Icon } from './Icon';
import { useSurfaceMotion } from './motion';
const theme = EditorView.theme({
  '&': { color: 'var(--theme-text)', backgroundColor: 'transparent', height: '100%' },
  '.cm-content': { fontFamily: 'Consolas, monospace', fontSize: '14px', lineHeight: '1.9', padding: '25px 0' },
  '.cm-gutters': { backgroundColor: 'transparent', color: '#829279', border: 'none', paddingRight: '9px' },
  '.cm-cursor': { borderLeftColor: '#bfd09c' }, '.cm-scroller': { overflow: 'auto' },
  '&.cm-focused': { outline: 'none' }, '.cm-activeLine': { backgroundColor: '#ffffff04' },
}, { dark: true });
export function NoteEditor({ text, onChange, preview = true, title,onCard }: { text: string; onChange(text: string): void; preview?: boolean; title?: string;onCard?(excerpt:string):void }) {
  const host = useRef<HTMLDivElement>(null), columns = useRef<HTMLDivElement>(null);
  useSurfaceMotion(columns, String(preview));
  const view = useRef<EditorView | null>(null);
  const callback = useRef(onChange); callback.current = onChange;
  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({ parent: host.current, state: EditorState.create({ doc: text, extensions: [EditorState.lineSeparator.of(text.includes('\r\n') ? '\r\n' : '\n'), markdown(), history(), lineNumbers(), EditorView.lineWrapping, keymap.of([...defaultKeymap, ...historyKeymap]), theme,
      EditorView.contentAttributes.of({ 'aria-label': 'Conteúdo da nota' }),
      EditorView.updateListener.of(update => { if (update.docChanged) callback.current(update.state.sliceDoc()); }),
    ] }) });
    view.current = editor;
    return () => { view.current = null; editor.destroy(); };
  }, []);
  useEffect(() => { const v = view.current; if (v && v.state.sliceDoc() !== text) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } }); }, [text]);
  function format(kind: EditKind) {
    const v = view.current; if (!v) return;
    const { from, to } = v.state.selection.main;
    const edit = formatSelection(v.state.doc.toString(), from, to, kind);
    v.dispatch({ changes: { from, to, insert: edit.insert } }); v.focus();
  }
  const body = text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const leadingTitle = body.match(/^# ([^\r\n]+)(?:\r?\n|$)/);
  const previewText = leadingTitle?.[1].trim() === title ? body.replace(/^#[^\r\n]+(?:\r?\n|$)/, '') : body;
  return <div className="note-editor"><div className="format-toolbar" role="toolbar" aria-label="Formatação da nota">
    {([['bold', 'Negrito'], ['italic', 'Itálico'], ['heading', 'Título'], ['bullet', 'Lista'], ['check', 'Checklist'], ['link', 'Link'], ['code', 'Código'], ['table', 'Tabela']] as [EditKind, string][]).map(([kind, label]) => <button key={kind} type="button" aria-label={label} title={label} onClick={() => format(kind)}><Icon kind={kind}/></button>)}
    {onCard&&<button type="button" aria-label="Criar flashcard do trecho" title="Criar flashcard do trecho selecionado" onClick={()=>{const v=view.current;if(!v)return;const {from,to}=v.state.selection.main;onCard(v.state.sliceDoc(from,to)||body.slice(0,2000));}}><Icon kind="memory"/></button>}
  </div><div ref={columns} className={`editor-columns ${preview ? '' : 'source-only'}`}><div ref={host} className="editor-source"/>{preview && <article className="markdown-preview" aria-label="Prévia da nota"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ a: ({ children }) => <span className="note-link">{children}</span>, img: ({ alt }) => <span>[Imagem: {alt}]</span> }}>{previewText}</ReactMarkdown></article>}</div></div>;
}
