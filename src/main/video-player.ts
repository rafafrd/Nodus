import { WebContentsView, session, type BrowserWindow } from 'electron';
import { allowedVideoRequest, VIDEO_APP_ORIGIN, youtubeEmbedUrl, type StudyVideo, type VideoPlayerState, type videoLayoutInput } from '../shared/videos';
import type { z } from 'zod';

// This surface has no preload, registered study protocol or app IPC authority.
export class VideoPlayer {
  private view: WebContentsView | null = null;
  private current: StudyVideo | null = null;
  private state: VideoPlayerState = { id: null, state: 'closed', message: '' };
  private readonly isolated = session.fromPartition('youtube-player');
  constructor(readonly window: BrowserWindow) {
    this.isolated.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    this.isolated.setPermissionCheckHandler(() => false);
    this.isolated.on('will-download', event => event.preventDefault());
    this.isolated.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => callback({ cancel: !allowedVideoRequest(details.url) }));
    window.on('closed', () => this.close());
    window.on('resize', () => { if (this.view) this.layout({ ...this.view.getBounds(), visible: this.view.getVisible() }); });
  }
  private publish(state: VideoPlayerState) { this.state = state; if (!this.window.isDestroyed()) this.window.webContents.send('player:state', state); }
  open(video: StudyVideo,seek = false): VideoPlayerState {
    if (!seek && this.current?.id === video.id && this.view && this.state.state !== 'error') return this.state;
    const url = youtubeEmbedUrl(video);
    this.dispose();
    const view = new WebContentsView({ webPreferences: { session: this.isolated, contextIsolation: true, sandbox: true, nodeIntegration: false, nodeIntegrationInSubFrames: false, nodeIntegrationInWorker: false, webSecurity: true, webviewTag: false, navigateOnDragDrop: false, disableDialogs: true } });
    this.view = view; this.current = video;
    view.setBackgroundColor('#070b09'); view.setVisible(false); this.window.contentView.addChildView(view);
    const wc = view.webContents;
    wc.setWebRTCIPHandlingPolicy('disable_non_proxied_udp');
    wc.setWindowOpenHandler(() => ({ action: 'deny' }));
    wc.on('will-navigate', event => event.preventDefault());
    wc.on('will-frame-navigate', event => { if (event.isMainFrame || !allowedVideoRequest(event.url)) event.preventDefault(); });
    wc.on('will-redirect', event => { if (event.isMainFrame || !allowedVideoRequest(event.url)) event.preventDefault(); });
    wc.on('before-input-event', (event, input) => { if (input.type === 'keyDown' && input.key === 'Escape') { event.preventDefault(); this.window.webContents.send('player:escape'); this.window.webContents.focus(); } });
    wc.on('render-process-gone', () => { if (this.view === view) this.publish({ id: video.id, state: 'error', message: 'O player foi interrompido. Tente abrir o vídeo novamente.' }); });
    this.publish({ id: video.id, state: 'loading', message: 'Conectando ao YouTube…' });
    void wc.loadURL(url, { httpReferrer: { url: `${VIDEO_APP_ORIGIN}/`, policy: 'strict-origin-when-cross-origin' } }).then(() => {
      if (this.view === view) this.publish({ id: video.id, state: 'ready', message: 'Player carregado. Use os controles do YouTube.' });
    }).catch(() => {
      if (this.view === view) this.publish({ id: video.id, state: 'error', message: 'Não foi possível conectar ao YouTube. Confira a internet e tente novamente.' });
    });
    return this.state;
  }
  layout(input: z.infer<typeof videoLayoutInput>) {
    const view = this.view; if (!view || this.window.isDestroyed()) return null;
    const [width, height] = this.window.getContentSize();
    const x = Math.min(input.x, width), y = Math.min(input.y, height);
    const bounds = { x, y, width: Math.max(0, Math.min(input.width, width - x)), height: Math.max(0, Math.min(input.height, height - y)) };
    view.setBounds(bounds); view.setVisible(input.visible && bounds.width >= 200 && bounds.height >= 200); return null;
  }
  remove(id: string) { if (this.current?.id === id) this.close(); }
  private dispose() {
    const view = this.view; this.view = null; this.current = null;
    if (view) { if (!this.window.isDestroyed()) this.window.contentView.removeChildView(view); if (!view.webContents.isDestroyed()) view.webContents.close({ waitForBeforeUnload: false }); }
  }
  close() {
    this.dispose();
    this.publish({ id: null, state: 'closed', message: '' }); return null;
  }
}
