import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Material } from '../shared/contracts';
import { Icon } from './Icon';
import { PdfAnnotations } from './PdfAnnotations';
GlobalWorkerOptions.workerSrc = workerUrl;
export function PdfPane({ material, page, onPage, onLocate,noteId,onNote }: { material: Material; page: number; onPage(page: number): void; onLocate(): void;noteId:string|null;onNote(id:string):void }) {
  const [fingerprint,setFingerprint]=useState('');
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState(''); const [rendered, setRendered] = useState(0); const [pageText, setPageText] = useState('');
  const [width, setWidth] = useState(400); const [input, setInput] = useState(String(page));
  const [height, setHeight] = useState(500); const [fitPage, setFitPage] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null); const host = useRef<HTMLDivElement>(null);
  const latest = useRef({ page, onPage }); latest.current = { page, onPage };
  useEffect(() => { const observer = new ResizeObserver(entries => { setWidth(entries[0].contentRect.width); setHeight(entries[0].contentRect.height); }); if (host.current) observer.observe(host.current); return () => observer.disconnect(); }, []);
  useEffect(() => {
    let stopped = false; let destroy = () => {}; setPdf(null); setError(''); setRendered(0);
    void (async () => {
      const response = await window.desktop.readMaterial({ id: material.id });
      if (stopped) return;
      if (!response.ok) { setError(response.message); return; }
      const digest=await crypto.subtle.digest('SHA-256',new Uint8Array(response.value));if(stopped)return;setFingerprint(Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join(''));
      const task = getDocument({ data: new Uint8Array(response.value), enableXfa: false, useWasm: false, maxImageSize: 16000000, cMapUrl: new URL('./pdf-assets/cmaps/', location.href).href, cMapPacked: true, standardFontDataUrl: new URL('./pdf-assets/standard_fonts/', location.href).href });
      destroy = () => { void task.destroy(); };
      try { const loaded = await task.promise; if (stopped) return; setPdf(loaded); if (latest.current.page > loaded.numPages) latest.current.onPage(loaded.numPages); }
      catch { if (!stopped) setError('Não foi possível ler este PDF. Ele pode estar inválido ou protegido por senha.'); }
    })().catch(() => { if (!stopped) setError('Não foi possível abrir o documento.'); });
    return () => { stopped = true; destroy(); };
  }, [material.id]);
  useEffect(() => { setInput(String(page)); }, [page]);
  useEffect(() => {
    if (!pdf || !canvas.current || width < 20 || page < 1 || page > pdf.numPages) return;
    let stopped = false; let cancel = () => {}; setRendered(0);
    void (async () => {
      try {
        const sheet = await pdf.getPage(page); if (stopped || !canvas.current) return;
        const basic = sheet.getViewport({ scale: 1 });
        const viewport = sheet.getViewport({ scale: Math.min(Math.max(8, width - 32) / basic.width, fitPage ? Math.max(8, height) / basic.height : Infinity, 4096 / basic.height, 1.5) });
        const element = canvas.current; const dpr = Math.min(devicePixelRatio, 1.5);
        element.width = Math.ceil(viewport.width * dpr); element.height = Math.ceil(viewport.height * dpr); element.style.width = `${viewport.width}px`; element.style.height = `${viewport.height}px`;
        const task = sheet.render({ canvas: element, canvasContext: element.getContext('2d')!, viewport, transform: [dpr, 0, 0, dpr, 0, 0] }); cancel = () => task.cancel(); await task.promise;
        if (stopped) return; setRendered(page);
        const text = await sheet.getTextContent(); if (!stopped) setPageText(text.items.map(item => 'str' in item ? item.str : '').join(' ').slice(0, 100000));
      } catch { if (!stopped) setError('Não foi possível renderizar esta página do PDF.'); }
    })();
    return () => { stopped = true; cancel(); };
  }, [pdf, page, width, height, fitPage]);
  function go(value: number) { if (pdf && Number.isInteger(value) && value >= 1 && value <= pdf.numPages) onPage(value); else setInput(String(page)); }
  return <div className="pdf-reader"><div className="pdf-controls"><button className="previous-page" aria-label="Página anterior" title="Página anterior" disabled={!pdf || page <= 1} onClick={() => go(page - 1)}><Icon kind="arrow"/></button><span className="page-number"><input type="number" min="1" max={pdf?.numPages ?? 1} aria-label="Página do PDF" value={input} onChange={e => setInput(e.target.value)} onBlur={() => go(Number(input))} onKeyDown={e => { if (e.key === 'Enter') go(Number(input)); }}/> / <span data-testid="pdf-pages">{pdf?.numPages ?? '—'}</span></span><button aria-label="Próxima página" title="Próxima página" disabled={!pdf || page >= pdf.numPages} onClick={() => go(page + 1)}><Icon kind="arrow"/></button><span className="pdf-control-divider"/><button className={fitPage ? 'selected' : ''} aria-label={fitPage ? 'Ajustar largura' : 'Ajustar página'} aria-pressed={fitPage} title={fitPage ? 'Ajustar à largura' : 'Ver a página inteira'} onClick={() => setFitPage(v => !v)}><Icon kind={fitPage ? 'collapse' : 'expand'}/></button><button aria-label="Localizar PDF" title="Localizar PDF" onClick={onLocate}><Icon kind="folder"/></button></div>
    <div ref={host} className="pdf-scroll">{error ? <div className="pdf-error" role="alert"><p>{error}</p><button onClick={onLocate}>Localizar arquivo novamente</button></div> : <><PdfAnnotations material={material} fingerprint={fingerprint} page={page} ready={rendered===page} noteId={noteId} onPage={onPage} onNote={onNote}><canvas ref={canvas} aria-label={`Página ${page} do PDF ${material.name}`} data-rendered-page={rendered}/></PdfAnnotations>{rendered === 0 && <p className="pdf-loading">Carregando página…</p>}<p className="sr-only" data-testid="pdf-text">{pageText}</p></>}</div>
  </div>;
}
