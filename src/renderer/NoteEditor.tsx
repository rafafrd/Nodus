import { useEffect, useRef, useState } from 'react';
import { editableNote, noteParts, noteTemplates, type NoteTemplate } from '../shared/note-content';
import { Annotation, EditorState, StateField } from '@codemirror/state';
import { Decoration, EditorView, keymap, WidgetType, type DecorationSet } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatSelection, type EditKind } from '../shared/markdown';
import { Icon } from './Icon';
import { useSurfaceMotion } from './motion';
const syncNote=Annotation.define<boolean>();
class SourceLink extends WidgetType {
  constructor(readonly label:string,readonly url:string,readonly open:(url:string)=>void){super();}
  eq(other:SourceLink){return this.label===other.label&&this.url===other.url;}
  toDOM(){const button=document.createElement('button');button.type='button';button.className='note-source-link';button.textContent=this.label;button.title='Abrir material de origem';button.addEventListener('click',()=>this.open(this.url));return button;}
}
function sourceLinks(open:(url:string)=>void){
  const decorations=(state:EditorState)=>Decoration.set([...state.doc.toString().matchAll(/^Fonte: \[([^\]\r\n]+)\]\((nodus-source:[^)\s]+)\)/gm)].map(match=>Decoration.replace({widget:new SourceLink(match[1],match[2],open)}).range(match.index+7,match.index+match[0].length)));
  const field=StateField.define<DecorationSet>({create:decorations,update:(value,transaction)=>transaction.docChanged?decorations(transaction.state):value,provide:value=>EditorView.decorations.from(value)});
  return [field,EditorView.atomicRanges.of(view=>view.state.field(field))];
}
const theme = EditorView.theme({
  '&': { color: 'var(--theme-text)', backgroundColor: 'transparent', height: '100%' },
  '.cm-content': { fontFamily: 'Consolas, monospace', fontSize: '14px', lineHeight: '1.9', padding: '25px 0' },
  '.cm-gutters': { backgroundColor: 'transparent', color: '#829279', border: 'none', paddingRight: '9px' },
  '.cm-cursor': { borderLeftColor: '#bfd09c' }, '.cm-scroller': { overflow: 'auto' },
  '&.cm-focused': { outline: 'none' }, '.cm-activeLine': { backgroundColor: '#ffffff04' },
}, { dark: true });
export function NoteEditor({ text, onChange, preview = true, title,onCard,onLink,onSource }: { text: string; onChange(text: string): void; preview?: boolean; title?: string;onCard?(excerpt:string):void;onLink?():void;onSource?(url:string):void }) {
  const [raw,setRaw]=useState(false);
  const currentText=useRef(text);currentText.current=text;
  const visible=raw?text:editableNote(text).body;
  const host = useRef<HTMLDivElement>(null), columns = useRef<HTMLDivElement>(null);
  useSurfaceMotion(columns, String(preview));
  const view = useRef<EditorView | null>(null);
  const callback = useRef(onChange); callback.current = onChange;
  const sourceCallback=useRef(onSource);sourceCallback.current=onSource;
  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({ parent: host.current, state: EditorState.create({ doc: visible, extensions: [EditorState.lineSeparator.of(text.includes('\r\n') ? '\r\n' : '\n'), markdown(), history(), EditorView.lineWrapping, keymap.of([...defaultKeymap, ...historyKeymap]), theme,...(raw?[]:sourceLinks(url=>sourceCallback.current?.(url))),
      EditorView.contentAttributes.of({ 'aria-label': 'Conteúdo da nota' }),
      EditorView.updateListener.of(update => { if (update.docChanged&&update.transactions.some(t=>t.annotation(syncNote)!==true)) callback.current((raw?'':editableNote(currentText.current).prefix)+update.state.sliceDoc()); }),
    ] }) });
    view.current = editor;
    if(title==='Sem título'&&!preview){editor.focus();editor.dispatch({selection:{anchor:editor.state.doc.length}});}
    return () => { view.current = null; editor.destroy(); };
  }, [raw]);
  useEffect(() => { const v = view.current; if (v && v.state.sliceDoc() !== visible) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: visible },annotations:syncNote.of(true) }); }, [visible]);
  function format(kind: EditKind) {
    const v = view.current; if (!v) return;
    const { from, to } = v.state.selection.main;
    const edit = formatSelection(v.state.doc.toString(), from, to, kind);
    v.dispatch({ changes: { from, to, insert: edit.insert } }); v.focus();
  }
  const body = text.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const leadingTitle = body.match(/^# ([^\r\n]+)(?:\r?\n|$)/);
  const previewText = leadingTitle?.[1].trim() === title ? body.replace(/^#[^\r\n]+(?:\r?\n|$)/, '') : body;
  function template(id:NoteTemplate){const v=view.current;if(!v)return;const value=noteTemplates.find(t=>t.id===id)?.text??'';const eol=noteParts(currentText.current).eol;v.dispatch({changes:{from:v.state.doc.length,insert:(v.state.doc.length?eol+eol:'')+value.replaceAll('\n',eol)}});v.focus();}
  return <div className={`note-editor ${raw?'raw-note-source':'body-note-source'}`}><div className="note-quick-actions"><button type="button" onClick={()=>format('bold')} title="Negrito">Negrito</button><button type="button" onClick={()=>format('bullet')} title="Lista">Lista</button>{onCard&&<button type="button" onClick={()=>{const v=view.current;if(!v)return;const {from,to}=v.state.selection.main;onCard(v.state.sliceDoc(from,to)||body.slice(0,2000));}}>Criar cartão do trecho</button>}{onLink&&<button type="button" onClick={onLink}>Relacionar nota</button>}<details><summary>Usar modelo</summary><div>{noteTemplates.filter(t=>t.id!=='blank').map(t=><button type="button" key={t.id} onClick={()=>template(t.id)}>{t.name}</button>)}</div></details></div><details className="format-disclosure"><summary>Mais formatação e fonte</summary><div className="format-toolbar" role="toolbar" aria-label="Formatação da nota">
    {([['bold', 'Negrito'], ['italic', 'Itálico'], ['heading', 'Título'], ['bullet', 'Lista'], ['check', 'Checklist'], ['link', 'Link'], ['code', 'Código'], ['table', 'Tabela']] as [EditKind, string][]).map(([kind, label]) => <button key={kind} type="button" aria-label={label} title={label} onClick={() => format(kind)}><Icon kind={kind}/></button>)}
    {onCard&&<button type="button" aria-label="Criar flashcard do trecho" title="Criar flashcard do trecho selecionado" onClick={()=>{const v=view.current;if(!v)return;const {from,to}=v.state.selection.main;onCard(v.state.sliceDoc(from,to)||body.slice(0,2000));}}><Icon kind="memory"/></button>}
    <button type="button" aria-pressed={raw} onClick={()=>setRaw(v=>!v)}>{raw?'Ocultar metadados':'Ver fonte completa'}</button>
  </div></details><div ref={columns} className={`editor-columns ${preview ? 'reading-preview' : 'source-only'}`}><div ref={host} className="editor-source"/>{preview && <article className="markdown-preview" aria-label="Prévia da nota"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={url=>url.startsWith('nodus-source:')?url:''} components={{ a: ({ children,href }) => href?.startsWith('nodus-source:')?<button className="note-source-link" onClick={()=>onSource?.(href)}>{children}</button>:<span className="note-link">{children}</span>, img: ({ alt }) => <span>[Imagem: {alt}]</span> }}>{previewText}</ReactMarkdown></article>}</div></div>;
}
