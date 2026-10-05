import { randomUUID, createHash } from 'node:crypto';
import { Store } from './store';
import { Desks } from './desk';
import { Videos } from './videos';
import { Study } from './study';
import { AppError } from '../shared/contracts';
import { markCreateInput, markListInput, momentCreateInput, momentListInput, momentRefInput, type PdfMark, type VideoMoment } from '../shared/study';
import type { z } from 'zod';
export class Annotations {
    constructor(readonly store: Store, readonly desks: Desks, readonly videos: Videos) { }
    private material(input: {
        subjectId: string;
        materialId: string;
        fingerprint?: string;
    }) { if (this.desks.material(input.materialId).subjectId !== input.subjectId)
        throw new AppError('INVALID_REFERENCE', 'Documento de outra matéria.'); if (input.fingerprint && createHash('sha256').update(this.desks.read(input.materialId)).digest('hex') !== input.fingerprint)
        throw new AppError('DOCUMENT_CHANGED', 'O PDF mudou. Recarregue antes de anotar; as marcações anteriores foram conservadas.'); }
    marks(raw: z.infer<typeof markListInput>): {
        marks: PdfMark[];
        otherVersions: number;
    } { const input = markListInput.parse(raw); this.material(input); const marks = this.store.db.prepare('SELECT id,subject_id AS subjectId,material_id AS materialId,note_id AS noteId,fingerprint,page,x,y,width,height,color,comment FROM pdf_marks WHERE material_id=? AND fingerprint=? ORDER BY page,rowid').all(input.materialId, input.fingerprint) as PdfMark[]; return { marks, otherVersions: Number(this.store.db.prepare('SELECT COUNT(*) n FROM pdf_marks WHERE material_id=? AND fingerprint<>?').get(input.materialId, input.fingerprint)!.n) }; }
    addMark(raw: z.infer<typeof markCreateInput>): PdfMark { const input = markCreateInput.parse(raw); this.material(input); return this.store.transaction(() => { if (input.noteId)
        new Study(this.store).requireNote(input.noteId, input.subjectId); if (Number(this.store.db.prepare('SELECT COUNT(*) n FROM pdf_marks WHERE material_id=?').get(input.materialId)!.n) >= 2000)
        throw new AppError('MARK_LIMIT', 'Limite de 2.000 marcações por documento.'); const id = randomUUID(); this.store.db.prepare('INSERT INTO pdf_marks(id,subject_id,material_id,note_id,fingerprint,page,x,y,width,height,color,comment) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id, input.subjectId, input.materialId, input.noteId, input.fingerprint, input.page, input.x, input.y, input.width, input.height, input.color, input.comment); this.store.audit('pdf.mark', id, 'ok'); return { id, ...input }; }); }
    removeMark(input: {
        subjectId: string;
        materialId: string;
        id: string;
    }) { this.material(input); this.store.transaction(() => { if (!this.store.db.prepare('SELECT id FROM pdf_marks WHERE id=? AND material_id=? AND subject_id=?').get(input.id, input.materialId, input.subjectId))
        throw new AppError('INVALID_REFERENCE', 'Marcação não encontrada neste documento.'); this.store.db.prepare('DELETE FROM pdf_marks WHERE id=?').run(input.id); this.store.audit('pdf.mark-remove', input.id, 'ok'); }); }
    moments(raw: z.infer<typeof momentListInput>): VideoMoment[] { const input = momentListInput.parse(raw); this.videos.get({ subjectId: input.subjectId, id: input.videoId }); return this.store.db.prepare('SELECT id,subject_id AS subjectId,video_id AS videoId,seconds,text FROM video_moments WHERE video_id=? ORDER BY seconds,rowid').all(input.videoId) as VideoMoment[]; }
    addMoment(raw: z.infer<typeof momentCreateInput>): VideoMoment { const input = momentCreateInput.parse(raw); return this.store.transaction(() => { this.videos.get({ subjectId: input.subjectId, id: input.videoId }); if (Number(this.store.db.prepare('SELECT COUNT(*) n FROM video_moments WHERE video_id=?').get(input.videoId)!.n) >= 500)
        throw new AppError('MOMENT_LIMIT', 'Limite de 500 momentos por vídeo.'); const id = randomUUID(); this.store.db.prepare('INSERT INTO video_moments(id,subject_id,video_id,seconds,text) VALUES(?,?,?,?,?)').run(id, input.subjectId, input.videoId, input.seconds, input.text); this.store.audit('video.moment', id, 'ok'); return { id, ...input }; }); }
    moment(raw: z.infer<typeof momentRefInput>): VideoMoment { const input = momentRefInput.parse(raw); this.videos.get({ subjectId: input.subjectId, id: input.videoId }); const row = this.store.db.prepare('SELECT id,subject_id AS subjectId,video_id AS videoId,seconds,text FROM video_moments WHERE id=? AND video_id=? AND subject_id=?').get(input.id, input.videoId, input.subjectId) as VideoMoment | undefined; if (!row)
        throw new AppError('INVALID_REFERENCE', 'Momento não encontrado neste vídeo.'); return row; }
    removeMoment(input: z.infer<typeof momentRefInput>) { return this.store.transaction(() => { this.moment(input); this.store.db.prepare('DELETE FROM video_moments WHERE id=?').run(input.id); this.store.audit('video.moment-remove', input.id, 'ok'); }); }
}
