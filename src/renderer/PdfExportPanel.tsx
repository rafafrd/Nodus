import { useEffect, useRef, useState } from 'react';
import type { PdfSource, PdfFolder, PdfExportResult } from '../shared/pdf-export';
import { Icon } from './Icon';
export function PdfExportPanel({ vault }: { vault: string | null }) {
  const [projects,setProjects] = useState<{id:string;name:string}[]>([]), [origin,setOrigin] = useState(vault ? 'vault' : ''), [folders,setFolders] = useState<PdfFolder[]>([]), [folder,setFolder] = useState('');
  const [loading,setLoading] = useState(false), [busy,setBusy] = useState(false), [error,setError] = useState(''), [result,setResult] = useState<PdfExportResult | null>(null);
  const guard = useRef(false);
  useEffect(() => { let stopped = false; void window.desktop.listProjects().then(r => { if (!stopped && r.ok) { setProjects(r.value.projects); if (!vault && r.value.projects.length) setOrigin(r.value.projects[0].id); } }); return () => { stopped = true; }; }, [vault]);
  const source: PdfSource | null = origin === 'vault' ? {source:'vault'} : origin ? {source:'project',projectId:origin} : null;
  useEffect(() => {
    let stopped = false; setFolder(''); setFolders([]); setError(''); setResult(null);
    if (!source) return;
    setLoading(true);
    void window.desktop.pdfExportFolders(source).then(r => { if (!stopped) { if (r.ok) setFolders(r.value); else setError(r.message); } }).catch(() => { if (!stopped) setError('Não foi possível consultar as pastas. Tente novamente.'); }).finally(() => { if (!stopped) setLoading(false); });
    return () => { stopped = true; };
  }, [origin]);
  async function run() {
    if (!source || guard.current) return; guard.current = true; setBusy(true); setError(''); setResult(null);
    try { const r = await window.desktop.exportFolderPdf({...source,folder}); if (r.ok) setResult(r.value); else setError(r.message); }
    catch { setError('Não foi possível concluir a exportação. As notas originais foram conservadas.'); }
    finally { guard.current = false; setBusy(false); }
  }
  return <section className="settings-export" aria-labelledby="export-title"><div className="settings-export-heading"><Icon kind="book"/><div><h3 id="export-title">Sua pasta, em um caderno PDF.</h3><p>Fundo preto, capa, sumário e notas formatadas para leitura.</p></div></div>
    <div className="settings-export-options"><label>Origem<select aria-label="Origem da exportação" value={origin} disabled={busy} onChange={event => setOrigin(event.target.value)}>{!origin && <option value="">Escolha uma origem</option>}{vault && <option value="vault">Pasta de notas</option>}{projects.map(project => <option value={project.id} key={project.id}>{project.name} · Explorer</option>)}</select></label><label>Pasta<select aria-label="Pasta para exportar" value={folder} disabled={busy || loading || !folders.length} onChange={event => {setFolder(event.target.value);setResult(null);setError('');}}>{folders.map(item => <option value={item.path} key={item.path}>{item.label}</option>)}</select></label></div>
    <p className="settings-export-hint">Inclui arquivos .md e subpastas. Salve suas notas antes de exportar. O PDF vai para Downloads; seus arquivos originais permanecem no lugar.</p>
    <button className="primary" disabled={busy || loading || !folders.length} onClick={() => void run()}><Icon kind="book"/>{busy ? 'Preparando PDF…' : loading ? 'Consultando pastas…' : 'Exportar pasta em PDF'}</button>
    {busy && <p role="status">Preparando o caderno. Você pode continuar usando o app.</p>}
    {error && <p className="settings-error" role="alert">{error}</p>}
    {result?.state === 'saved' && <div className="settings-export-result" role="status"><strong>PDF salvo em Downloads · {result.notes} {result.notes === 1 ? 'nota' : 'notas'}</strong><input aria-label="PDF exportado" value={result.path} readOnly/>{result.skipped > 0 && <small>Links e pastas auxiliares foram ignorados ({result.skipped} itens).</small>}</div>}
    {!vault && !projects.length && <p className="settings-footnote">Escolha uma pasta de notas em Estudos ou abra um projeto no Explorer para começar.</p>}
  </section>;
}
