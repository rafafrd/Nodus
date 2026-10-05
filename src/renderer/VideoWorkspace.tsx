import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { gsap } from 'gsap';
import type { Subject } from '../shared/contracts';
import type { StudyVideo, VideoPlayerState, videoLayoutInput } from '../shared/videos';
import type { z } from 'zod';
import { Icon } from './Icon';
import { MotionDialog } from './MotionDialog';
import { useReducedMotion } from './motion';
import './videos.css';
type Mode = 'inline' | 'cinema' | 'pip';
type Options = { subject: Subject | null; shown: boolean; selectedId: string | null; select(id: string | null): Promise<void>; returnToVideo(video: StudyVideo): Promise<void>; onError(message: string): void };
export function useVideos(options: Options) {
  const [items, setItems] = useState<StudyVideo[]>([]), [video, setVideo] = useState<StudyVideo | null>(null);
  const [owner, setOwner] = useState(''), [mode, setMode] = useState<Mode>('inline'), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [state, setState] = useState<VideoPlayerState>({ id: null, state: 'closed', message: '' });
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const current = useRef(options); current.current = options;
  const priorMode = useRef<Mode>('inline'), currentMode = useRef(mode); currentMode.current = mode;
  const mutating = useRef(false);
  useEffect(() => {
    let canceled = false; setItems([]); setError('');
    if (options.subject) void window.desktop.listVideos({ subjectId: options.subject.id }).then(r => { if (canceled) return; if (r.ok) setItems(r.value); else current.current.onError(r.message); });
    return () => { canceled = true; };
  }, [options.subject?.id]);
  useEffect(() => window.desktop.onVideoPlayer(value => { setState(value); if (value.state === 'closed') { setVideo(null); setMode('inline'); } }), []);
  useEffect(() => { if (video && mode === 'inline' && (!options.shown || video.subjectId !== options.subject?.id)) setMode('pip'); }, [options.shown, options.subject?.id, video, mode]);
  const escape = useCallback(() => { if (currentMode.current === 'cinema') setMode(priorMode.current); }, []);
  useEffect(() => window.desktop.onVideoEscape(escape), [escape]);
  useEffect(() => { function key(event: globalThis.KeyboardEvent) { if (event.key === 'Escape' && currentMode.current === 'cinema' && !document.querySelector('dialog[open]')) { event.preventDefault(); escape(); } } window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [escape]);
  function cinema() { if (mode !== 'cinema') { priorMode.current = mode; setMode('cinema'); } else escape(); }
  async function close() { const r = await window.desktop.closeVideoPlayer(); if (!r.ok) current.current.onError(r.message); }
  async function open(item: StudyVideo) {
    if (mutating.current) return; mutating.current = true; setBusy(true);
    try {
      const r = await window.desktop.openVideoPlayer({ subjectId: item.subjectId, id: item.id });
      if (!r.ok) { current.current.onError(r.message); return; }
      setVideo(item); if (current.current.subject?.id === item.subjectId) setOwner(current.current.subject.name); setState(r.value); setMode('inline');
      if (current.current.subject?.id === item.subjectId) await current.current.select(item.id);
    } finally { mutating.current = false; setBusy(false); }
  }
  async function add(url: string, title: string) {
    const subjectId = current.current.subject?.id; if (!subjectId || mutating.current) return false;
    mutating.current = true; setBusy(true); setError('');
    try {
      const r = await window.desktop.addVideo({ subjectId, url, title });
      if (!r.ok) { setError(r.message); return false; }
      if (current.current.subject?.id === subjectId) { setItems(v => v.some(item => item.id === r.value.id) ? v : [r.value, ...v]); await current.current.select(r.value.id); }
      return true;
    } finally { mutating.current = false; setBusy(false); }
  }
  async function remove(item: StudyVideo) {
    if (mutating.current) return; mutating.current = true; setBusy(true);
    try { const r = await window.desktop.removeVideo({ subjectId: item.subjectId, id: item.id }); if (!r.ok) current.current.onError(r.message); else { setItems(v => v.filter(i => i.id !== item.id)); if (current.current.selectedId === item.id) await current.current.select(null); } }
    finally { mutating.current = false; setBusy(false); }
  }
  async function returnToDesk() { if (!video) return; await current.current.returnToVideo(video); setMode('inline'); }
  return { items, video, owner, mode, state, slot, busy, error, selectedId: options.selectedId, setSlot, open, add, remove, cinema, escape, close, returnToDesk, pip: () => setMode('pip') };
}
type Controller = ReturnType<typeof useVideos>;
export function VideoLibrary({ controller: v }: { controller: Controller }) {
  const [adding, setAdding] = useState(false), [url, setUrl] = useState(''), [title, setTitle] = useState('');
  async function submit(event: FormEvent) { event.preventDefault(); if (await v.add(url, title)) { setAdding(false); setUrl(''); setTitle(''); } }
  const selected = v.items.find(item => item.id === v.selectedId);
  return <div className="video-library">
    <div className="video-library-heading"><span><Icon kind="video"/> VÍDEOS DESTA MATÉRIA <small>{v.items.length}</small></span><button aria-label="Salvar link do YouTube" onClick={() => setAdding(true)}><Icon kind="plus"/> Link</button></div>
    <div className="video-inline-slot" ref={v.setSlot} data-testid="video-inline-slot"><div className="video-placeholder"><Icon kind="video"/><strong>{selected?.title ?? 'Uma aula, perto das suas notas.'}</strong><p>Salve um link e abra o player para assistir.</p>{selected && <button className="primary" disabled={v.busy} onClick={() => v.open(selected)}><Icon kind="play"/> Abrir player</button>}{!selected && <button onClick={() => setAdding(true)}>+ Adicionar vídeo</button>}</div></div>
    <nav className="video-list" aria-label="Vídeos salvos">{v.items.map(item => <div key={item.id} className={v.selectedId === item.id ? 'selected' : ''}><button disabled={v.busy} onClick={() => v.open(item)} aria-label={`Assistir ${item.title}`}><Icon kind="play"/><span><strong>{item.title}</strong><small>YouTube{item.startSeconds ? ` · início em ${Math.floor(item.startSeconds / 60)}:${String(item.startSeconds % 60).padStart(2, '0')}` : ''}</small></span></button><button className="video-remove" disabled={v.busy} onClick={() => v.remove(item)} aria-label={`Remover link ${item.title}`} title="Remover link salvo"><Icon kind="close"/></button></div>)}</nav>
    <p className="video-network-hint">Os links ficam no PC. Abrir o player conecta ao YouTube e requer internet.</p>
    {adding && <MotionDialog title="Salvar vídeo do YouTube" close={() => setAdding(false)}>{requestClose => <form onSubmit={submit}><label>Link do YouTube<input autoFocus required maxLength={2048} type="text" aria-label="Link do YouTube" placeholder="https://www.youtube.com/watch?v=…" value={url} onChange={e => setUrl(e.target.value)}/></label><label>Título para seus estudos<input maxLength={160} aria-label="Título do vídeo" placeholder="Ex.: Aula de álgebra" value={title} onChange={e => setTitle(e.target.value)}/></label><p className="video-dialog-hint">Links de vídeos, Shorts e transmissões. O tempo inicial do link é conservado.</p>{v.error && <p role="alert">{v.error}</p>}<div className="dialog-buttons"><button type="button" onClick={requestClose}>Cancelar</button><button type="submit" className="primary" disabled={v.busy}>Salvar link</button></div></form>}</MotionDialog>}
  </div>;
}
type Rect = { x: number; y: number; width: number; height: number };
const HEADER = 44, FOOTER = 28;
function clampPip(position: { x: number; y: number }, size: { width: number; height: number }) {
  return { x: Math.round(Math.min(Math.max(12, position.x), Math.max(12, innerWidth - size.width - 12))), y: Math.round(Math.min(Math.max(12, position.y), Math.max(12, innerHeight - size.height - 12))) };
}
export function VideoSurface({ controller: v }: { controller: Controller }) {
  const surface = useRef<HTMLDivElement>(null), frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion(), latest = useRef(v); latest.current = v;
  const [viewport, setViewport] = useState({ width: innerWidth, height: innerHeight }), [revision, setRevision] = useState(0);
  const [pipPosition, setPipPosition] = useState({ x: innerWidth - 444, y: innerHeight - 336 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const drag = useRef<{ x: number; y: number; left: number; top: number; id: number } | null>(null);
  const tween = useRef<gsap.core.Tween | null>(null), previousVideo = useRef<string | null>(null);
  const pendingLayout = useRef<z.infer<typeof videoLayoutInput> | null>(null), sending = useRef(false), lastLayout = useRef('');
  const blocked = useRef(false); blocked.current = dialogOpen;
  const sendBounds = useCallback(() => {
    const el = frame.current, state = latest.current; if (!el || !state.video) return;
    const rect = el.getBoundingClientRect();
    const layout = { visible: !blocked.current && state.state.state === 'ready', x: Math.max(0, Math.round(rect.x)), y: Math.max(0, Math.round(rect.y)), width: Math.max(0, Math.round(rect.width)), height: Math.max(0, Math.round(rect.height)) };
    const key = JSON.stringify(layout); if (key === lastLayout.current) return;
    lastLayout.current = key; pendingLayout.current = layout;
    if (sending.current) return; sending.current = true;
    void (async () => { try { while (pendingLayout.current) { const input = pendingLayout.current; pendingLayout.current = null; const r = await window.desktop.layoutVideoPlayer(input); if (!r.ok) console.error(r.message); } } finally { sending.current = false; } })();
  }, []);
  useEffect(() => {
    function resize() { setViewport({ width: innerWidth, height: innerHeight }); setRevision(r => r + 1); }
    const observer = new MutationObserver(() => setDialogOpen(!!document.querySelector('dialog[open]'))); observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
    const resizeObserver = new ResizeObserver(() => setRevision(r => r + 1)); if (v.slot) resizeObserver.observe(v.slot);
    window.addEventListener('resize', resize);
    document.addEventListener('scroll', resize, true);
    return () => { observer.disconnect(); resizeObserver.disconnect(); window.removeEventListener('resize', resize); document.removeEventListener('scroll', resize, true); };
  }, [v.slot]);
  useLayoutEffect(() => {
    const el = surface.current; if (!el || !v.video) return;
    let rect: Rect;
    if (v.mode === 'inline' && v.slot) {
      const r = v.slot.getBoundingClientRect(), parent = v.slot.parentElement!.getBoundingClientRect();
      // A native child view cannot inherit CSS clipping from a scrolling panel.
      if (r.y < parent.y - 1 || r.bottom > parent.bottom + 1 || r.width < 202 || r.height < 272) { v.pip(); return; }
      rect = { x: r.x, y: r.y, width: r.width, height: r.height };
    }
    else if (v.mode === 'cinema') {
      const width = Math.min(viewport.width - 96, (viewport.height - 120 - HEADER - FOOTER) * 16 / 9), height = width * 9 / 16 + HEADER + FOOTER;
      rect = { x: (viewport.width - width) / 2, y: (viewport.height - height) / 2, width, height };
    } else { const width = Math.min(432, viewport.width - 24), height = width * 9 / 16 + HEADER + FOOTER; const position = clampPip(pipPosition, { width, height }); rect = { ...position, width, height }; }
    tween.current?.kill();
    const fresh = previousVideo.current !== v.video.id; previousVideo.current = v.video.id;
    if (reduced || drag.current || fresh) { gsap.set(el, { ...rect, opacity: 1 }); el.dataset.motion = 'idle'; sendBounds(); }
    else { el.dataset.motion = 'moving'; tween.current = gsap.to(el, { ...rect, duration: .48, ease: 'power3.inOut', onUpdate: sendBounds, onComplete: () => { el.dataset.motion = 'idle'; sendBounds(); } }); }
    return () => { tween.current?.kill(); };
  }, [v.mode, v.video?.id, v.slot, viewport.width, viewport.height, revision, pipPosition.x, pipPosition.y, reduced, sendBounds]);
  useLayoutEffect(() => { lastLayout.current = ''; sendBounds(); }, [v.state.state, dialogOpen, sendBounds]);
  useEffect(() => {
    if (!v.video || v.mode !== 'inline' || !v.slot) return;
    let raf = 0;
    function followPanel() {
      const el = surface.current, slot = latest.current.slot;
      if (el && slot && el.dataset.motion === 'idle') {
        const rect = slot.getBoundingClientRect(), parent = slot.parentElement!.getBoundingClientRect();
        if (rect.y < parent.y - 1 || rect.bottom > parent.bottom + 1) { latest.current.pip(); return; }
        const actual = el.getBoundingClientRect();
        if (Math.abs(actual.x - rect.x) + Math.abs(actual.y - rect.y) + Math.abs(actual.width - rect.width) + Math.abs(actual.height - rect.height) > .5) { gsap.set(el, { x: rect.x, y: rect.y, width: rect.width, height: rect.height }); sendBounds(); }
      }
      raf = requestAnimationFrame(followPanel);
    }
    raf = requestAnimationFrame(followPanel); return () => cancelAnimationFrame(raf);
  }, [v.video?.id, v.mode, v.slot, sendBounds]);
  useEffect(() => {
    if (v.mode !== 'cinema' || !v.video) return;
    const shell = document.querySelector('.area-stage') as HTMLElement, rail = document.querySelector('.activity-rail') as HTMLElement;
    shell.inert = true; rail.inert = true;
    surface.current?.querySelector<HTMLButtonElement>('[data-cinema-exit]')?.focus();
    return () => { shell.inert = false; rail.inert = false; };
  }, [v.mode, !!v.video]);
  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (v.mode !== 'pip' || event.button !== 0) return;
    const rect = surface.current!.getBoundingClientRect(); tween.current?.kill();
    drag.current = { x: event.clientX, y: event.clientY, left: rect.x, top: rect.y, id: event.pointerId }; event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const d = drag.current; if (!d) return;
    const rect = surface.current!.getBoundingClientRect(), pos = clampPip({ x: d.left + event.clientX - d.x, y: d.top + event.clientY - d.y }, rect);
    gsap.set(surface.current, pos); sendBounds();
  }
  function pointerEnd(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    const rect = surface.current!.getBoundingClientRect(); drag.current = null; setPipPosition({ x: rect.x, y: rect.y });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function moveKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (v.mode !== 'pip' || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault(); const step = event.shiftKey ? 40 : 12, rect = surface.current!.getBoundingClientRect();
    setPipPosition(clampPip(event.key === 'Home' ? { x: viewport.width - rect.width - 12, y: viewport.height - rect.height - 12 } : { x: rect.x + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0), y: rect.y + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0) }, rect));
  }
  if (!v.video) return null;
  return <>
    {v.mode === 'cinema' && <div className="video-cinema-shade" aria-hidden="true"/>}
    <div className={`video-surface video-${v.mode}`} ref={surface} role={v.mode === 'cinema' ? 'dialog' : 'region'} aria-modal={v.mode === 'cinema' ? true : undefined} aria-label={v.mode === 'cinema' ? 'Cinema' : v.mode === 'pip' ? 'Vídeo flutuante' : 'Player do YouTube'} data-mode={v.mode} data-video-id={v.video.id}>
      <header className="video-surface-header"><button className="video-drag-title" aria-label={v.mode === 'pip' ? 'Mover vídeo flutuante' : 'Vídeo em reprodução'} title={v.mode === 'pip' ? 'Arraste ou use as setas; Home reposiciona' : v.video.title} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onKeyDown={moveKey}><Icon kind="video"/><span>{v.video.title}</span></button><div className="video-surface-actions">
        {v.mode !== 'inline' && <button onClick={v.returnToDesk} aria-label="Voltar vídeo à mesa" title="Voltar à mesa"><Icon kind="collapse"/></button>}
        <button data-cinema-exit onClick={v.cinema} aria-label={v.mode === 'cinema' ? 'Sair do cinema' : 'Modo cinema'} title={v.mode === 'cinema' ? 'Sair do cinema · Esc' : 'Modo cinema'}><Icon kind={v.mode === 'cinema' ? 'collapse' : 'cinema'}/></button>
        {v.mode !== 'pip' && <button onClick={v.pip} aria-label="Vídeo em PiP" title="Player flutuante"><Icon kind="pip"/></button>}
        <button onClick={v.close} aria-label="Fechar player" title="Fechar player, conservar link"><Icon kind="close"/></button>
      </div></header>
      <div className="video-native-frame" ref={frame} data-testid="video-native-frame">{v.state.state !== 'ready' && <div className="video-loading" role="status"><Icon kind="video"/><p>{v.state.message}</p>{v.state.state === 'error' && <button onClick={() => v.open(v.video!)}>Tentar novamente</button>}</div>}</div>
      <footer className="video-surface-footer"><span>YouTube <span>· {v.owner}</span></span><small>{v.mode === 'cinema' ? 'Esc para voltar' : v.mode === 'pip' ? 'Arraste pelo título' : 'Cinema / PiP'}</small></footer>
    </div>
  </>;
}
