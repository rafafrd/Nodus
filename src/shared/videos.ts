import { z } from 'zod';
import { AppError, idSchema } from './contracts';

export type StudyVideo = { id: string; subjectId: string; title: string; youtubeId: string; startSeconds: number; url: string };
export type VideoPlayerState = { id: string | null; state: 'closed' | 'loading' | 'ready' | 'error'; message: string };
export const videoAddInput = z.strictObject({ subjectId: idSchema, url: z.string().trim().min(1).max(2048), title: z.string().trim().max(160) });
export const videoRefInput = z.strictObject({ subjectId: idSchema, id: idSchema });
export const videoLayoutInput = z.strictObject({ visible: z.boolean(), x: z.number().int().min(0).max(20000), y: z.number().int().min(0).max(20000), width: z.number().int().min(0).max(20000), height: z.number().int().min(0).max(20000) });
export const youtubeIdInput = z.string().regex(/^[A-Za-z0-9_-]{11}$/);

function seconds(value: string | null): number {
  if (!value) return 0;
  let total: number;
  if (/^\d+$/.test(value)) total = Number(value);
  else {
    const parts = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
    if (!parts || !parts[1] && !parts[2] && !parts[3]) throw new AppError('INVALID_VIDEO', 'Tempo inicial do vídeo inválido.');
    total = Number(parts[1] ?? 0) * 3600 + Number(parts[2] ?? 0) * 60 + Number(parts[3] ?? 0);
  }
  if (!Number.isSafeInteger(total) || total < 0 || total > 86400) throw new AppError('INVALID_VIDEO', 'Tempo inicial deve ser de até 24 horas.');
  return total;
}
export function parseYoutubeLink(input: string) {
  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`); }
  catch { throw new AppError('INVALID_VIDEO', 'Cole um link de vídeo do YouTube.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new AppError('INVALID_VIDEO', 'Use um link HTTPS do YouTube.');
  let id = '';
  const parts = url.pathname.split('/').filter(Boolean);
  if (url.hostname === 'youtu.be' && parts.length === 1) id = parts[0];
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(url.hostname)) {
    if (url.pathname === '/watch' && url.searchParams.getAll('v').length === 1) id = url.searchParams.get('v')!;
    else if (parts.length === 2 && ['shorts', 'embed', 'live'].includes(parts[0])) id = parts[1];
  } else if (['www.youtube-nocookie.com', 'youtube-nocookie.com'].includes(url.hostname) && parts.length === 2 && parts[0] === 'embed') id = parts[1];
  if (!youtubeIdInput.safeParse(id).success) throw new AppError('INVALID_VIDEO', 'Este link não identifica um vídeo do YouTube.');
  const startSeconds = seconds(url.searchParams.get('t') ?? url.searchParams.get('start') ?? new URLSearchParams(url.hash.slice(1)).get('t'));
  return { youtubeId: id, startSeconds, url: `https://www.youtube.com/watch?v=${id}${startSeconds ? `&t=${startSeconds}s` : ''}` };
}
export const VIDEO_APP_ORIGIN = 'https://local.appestudos.desktop';
export function allowedVideoRequest(input: string) {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && ['youtube-nocookie.com', 'youtube.com', 'googlevideo.com', 'ytimg.com', 'ggpht.com', 'google.com', 'gstatic.com', 'doubleclick.net', 'googleadservices.com', 'googlesyndication.com'].some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
  } catch { return false; }
}
export function youtubeEmbedUrl(video: Pick<StudyVideo, 'youtubeId' | 'startSeconds'>) {
  const id = youtubeIdInput.parse(video.youtubeId), start = z.number().int().min(0).max(86400).parse(video.startSeconds);
  return `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&fs=0&rel=0&origin=${encodeURIComponent(VIDEO_APP_ORIGIN)}&start=${start}`;
}
