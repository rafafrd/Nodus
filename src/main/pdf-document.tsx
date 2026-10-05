import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ExportBook } from './export-notes';
export const PDF_CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
const css = `
@page { size:A4; margin:20mm 17mm 22mm; background:#000; @bottom-center { content:counter(page); color:#aaa; font:9pt 'Segoe UI',sans-serif; } }
* { box-sizing:border-box; } html,body { background:#000; color:#ecece8; margin:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
body { font:11pt/1.7 'Segoe UI',Arial,sans-serif; overflow-wrap:anywhere; }
h1,h2,h3,h4 { break-after:avoid; line-height:1.3; } h1 { font:30pt/1.25 Georgia,serif; color:#f5f3e9; margin:0 0 20pt; } h2 { font-size:18pt; margin:24pt 0 12pt; color:#d2bc8a; } h3 { font-size:13pt; margin:18pt 0 8pt; } h4 { font-size:11pt; }
p,li { orphans:3; widows:3; } p { margin:0 0 13pt; } li { margin:4pt 0; } ul,ol { padding-left:20pt; }
.cover { min-height:220mm; display:flex; flex-direction:column; justify-content:center; break-after:page; } .eyebrow { color:#d2bc8a; font-size:9pt; letter-spacing:2pt; margin-bottom:28pt; } .cover h1 { font-size:44pt; margin:0 0 24pt; } .subtitle { color:#aaa; font-size:12pt; } .cover-rule { width:45mm; border:0; border-top:1px solid #d2bc8a; margin:30pt 0; }
.contents { break-after:page; } .contents h1 { font-size:28pt; } .contents ol { padding:0; list-style:none; } .contents li { display:flex; gap:14pt; padding:12pt 0; border-bottom:1px solid #333; break-inside:avoid; } .contents a { color:inherit; text-decoration:none; } .contents small { display:block; color:#aaa; font-size:9pt; } .number { color:#d2bc8a; font:10pt Consolas,monospace; min-width:24pt; }
.note { break-before:page; } .note-path { color:#aaa; font:9pt/1.5 Consolas,monospace; padding-bottom:10pt; border-bottom:1px solid #333; margin-bottom:22pt; } .note-heading { font-size:28pt; }
strong { color:#fff; } em { color:#ddd; } blockquote { border-left:2pt solid #d2bc8a; margin:18pt 0; padding:4pt 16pt; color:#ccc; }
code { font:9.5pt/1.6 Consolas,monospace; color:#e9d8ae; white-space:pre-wrap; overflow-wrap:anywhere; } pre { background:#121212; border:1px solid #333; padding:12pt; white-space:pre-wrap; overflow-wrap:anywhere; } pre code { font-size:9pt; color:#e8e8e8; } hr { border:0; border-top:1px solid #444; margin:24pt 0; }
table { width:100%; border-collapse:collapse; table-layout:fixed; font-size:9.5pt; margin:18pt 0; } thead { display:table-header-group; } tr { break-inside:avoid; } th,td { border:1px solid #444; padding:8pt; vertical-align:top; } th { background:#171717; color:#d2bc8a; text-align:left; } .image-label { color:#aaa; font-size:10pt; } .note-link { text-decoration:underline; text-decoration-color:#777; } input[type=checkbox] { accent-color:#d2bc8a; }
`;
export function exportDocument(book: ExportBook,image?:(notePath:string,source:string)=>string|null) {
  return '<!doctype html>' + renderToStaticMarkup(<html lang="pt-BR"><head><meta charSet="utf-8"/><meta httpEquiv="Content-Security-Policy" content={PDF_CSP}/><title>{book.title}</title><style>{css}</style></head><body>
    <section className="cover"><span className="eyebrow">NODUS / CADERNO DE ESTUDOS</span><h1>{book.title}</h1><hr className="cover-rule"/><p className="subtitle">{book.notes.length} {book.notes.length === 1 ? 'nota' : 'notas'} · Arquivos salvos da pasta e subpastas</p></section>
    <nav className="contents" aria-label="Sumário"><span className="eyebrow">SEU CADERNO</span><h1>Sumário</h1><ol>{book.notes.map((note, i) => <li key={note.path}><span className="number">{String(i + 1).padStart(2, '0')}</span><a href={`#note-${i}`}><strong>{note.title}</strong><small>{note.path}</small></a></li>)}</ol></nav>
    {book.notes.map((note, i) => <section className="note" key={note.path} id={`note-${i}`}><p className="note-path">{String(i + 1).padStart(2, '0')} / {note.path}</p><h1 className="note-heading">{note.title}</h1><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ a: ({ children }) => <span className="note-link">{children}</span>, img: ({ alt,src }) => {const data=src?image?.(note.path,src):null;return data?<figure style={{margin:'18pt 0',breakInside:'avoid'}}><img src={data} alt={alt??''} style={{maxWidth:'100%',maxHeight:'200mm',objectFit:'contain'}}/>{alt&&<figcaption className="image-label">{alt}</figcaption>}</figure>:<span className="image-label">[Imagem: {alt || 'sem descrição'}]</span>;} }}>{note.body.replace(/^# [^\r\n]+(?:\r?\n|$)/, '')}</ReactMarkdown></section>)}
  </body></html>);
}
