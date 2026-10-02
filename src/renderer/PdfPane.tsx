import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Material } from '../shared/contracts';
GlobalWorkerOptions.workerSrc = workerUrl;
export function PdfPane({ material, page, onPage, onLocate }: { material: Material; page: number; onPage(page: number): void; onLocate(): void }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState(''); const [rendered, setRendered] = useState(0); const [pageText, setPageText] = useState('');
  const [width, setWidth] = useState(400); const [input, setInput] = useState(String(page));
  const canvas = useRef<HTMLCanvasElement>(null); const host = useRef<HTMLDivElement>(null);
  const latest = useRef({ page, onPage }); latest.current = { page, onPage };
  useEffect(() => { const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width)); if (host.current) observer.observe(host.current); return () => observer.disconnect(); }, []);
  useEffect(() => {
    let stopped = false; let destroy = () => {}; setPdf(null); setError(''); setRendered(0);
    void (async () => {
      const response = await window.desktop.readMaterial({ id: material.id });
      if (stopped) return;
      if (!response.ok) { setError(response.message); return; }
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
        const viewport = sheet.getViewport({ scale: Math.min((width - 28) / basic.width, 4096 / basic.height, 1.5) });
        const element = canvas.current; const dpr = Math.min(devicePixelRatio, 1.5);
        element.width = Math.ceil(viewport.width * dpr); element.height = Math.ceil(viewport.height * dpr); element.style.width = `${viewport.width}px`; element.style.height = `${viewport.height}px`;
        const task = sheet.render({ canvas: element, canvasContext: element.getContext('2d')!, viewport, transform: [dpr, 0, 0, dpr, 0, 0] }); cancel = () => task.cancel(); await task.promise;
        if (stopped) return; setRendered(page);
        const text = await sheet.getTextContent(); if (!stopped) setPageText(text.items.map(item => 'str' in item ? item.str : '').join(' ').slice(0, 100000));
      } catch { if (!stopped) setError('Não foi possível renderizar esta página do PDF.'); }
    })();
    return () => { stopped = true; cancel(); };
  }, [pdf, page, width]);
  function go(value: number) { if (pdf && Number.isInteger(value) && value >= 1 && value <= pdf.numPages) onPage(value); else setInput(String(page)); }
  return <div className="pdf-reader"><div className="pdf-controls"><button aria-label="Página anterior" disabled={!pdf || page <= 1} onClick={() => go(page - 1)}>←</button><span><input type="number" min="1" max={pdf?.numPages ?? 1} aria-label="Página do PDF" value={input} onChange={e => setInput(e.target.value)} onBlur={() => go(Number(input))} onKeyDown={e => { if (e.key === 'Enter') go(Number(input)); }}/> / <span data-testid="pdf-pages">{pdf?.numPages ?? '—'}</span></span><button aria-label="Próxima página" disabled={!pdf || page >= pdf.numPages} onClick={() => go(page + 1)}>→</button><button className="text-button" onClick={onLocate}>Localizar PDF</button></div>
    <div ref={host} className="pdf-scroll">{error ? <div className="pdf-error" role="alert"><p>{error}</p><button onClick={onLocate}>Localizar arquivo novamente</button></div> : <><canvas ref={canvas} aria-label={`Página ${page} do PDF ${material.name}`} data-rendered-page={rendered}/>{rendered === 0 && <p className="pdf-loading">Carregando página…</p>}<p className="sr-only" data-testid="pdf-text">{pageText}</p></>}</div>
  </div>;
}
