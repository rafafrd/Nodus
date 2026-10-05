import { randomUUID } from 'node:crypto';
import type { z } from 'zod';
import { AppError } from '../shared/contracts';
import { parseYoutubeLink, videoAddInput, videoRefInput, type StudyVideo } from '../shared/videos';
import { Store } from './store';
export class Videos {
  constructor(readonly store: Store) {}
  list(subjectId: string): StudyVideo[] {
    this.store.requireSubject(subjectId);
    return this.store.db.prepare('SELECT id,subject_id AS subjectId,title,youtube_id AS youtubeId,start_seconds AS startSeconds,url FROM videos WHERE subject_id=? ORDER BY rowid DESC').all(subjectId) as StudyVideo[];
  }
  get(input: z.infer<typeof videoRefInput>): StudyVideo {
    const ref = videoRefInput.parse(input); this.store.requireSubject(ref.subjectId);
    const row = this.store.db.prepare('SELECT id,subject_id AS subjectId,title,youtube_id AS youtubeId,start_seconds AS startSeconds,url FROM videos WHERE id=? AND subject_id=?').get(ref.id, ref.subjectId) as StudyVideo | undefined;
    if (!row) throw new AppError('NOT_FOUND', 'Vídeo não encontrado nesta matéria.');
    return row;
  }
  add(input: z.infer<typeof videoAddInput>): StudyVideo {
    const data = videoAddInput.parse(input), link = parseYoutubeLink(data.url);
    return this.store.transaction(() => {
      const items = this.list(data.subjectId), existing = items.find(v => v.youtubeId === link.youtubeId);
      if (existing) return existing;
      if (items.length >= 200) throw new AppError('VIDEO_LIMIT', 'Esta matéria já tem 200 vídeos. Remova um link para adicionar outro.');
      const id = randomUUID();
      this.store.db.prepare('INSERT INTO videos(id,subject_id,title,youtube_id,start_seconds,url) VALUES(?,?,?,?,?,?)').run(id, data.subjectId, data.title || `Vídeo do YouTube · ${link.youtubeId}`, link.youtubeId, link.startSeconds, link.url);
      this.store.audit('video.add', id, 'ok'); return this.get({ subjectId: data.subjectId, id });
    });
  }
  remove(input: z.infer<typeof videoRefInput>) {
    return this.store.transaction(() => {
      const video = this.get(input);
      this.store.db.prepare('UPDATE desks SET video_id=NULL WHERE video_id=?').run(video.id);
      this.store.db.prepare('DELETE FROM video_moments WHERE video_id=?').run(video.id);
      this.store.db.prepare('DELETE FROM videos WHERE id=?').run(video.id);
      this.store.audit('video.remove', video.id, 'ok'); return null;
    });
  }
}
