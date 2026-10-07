import { randomUUID } from 'node:crypto';
import { Store } from './store';
import { AppError, type NoteRef, type Subject } from '../shared/contracts';
import { cardCreateInput, cardReviewInput, linkCreateInput, type Flashcard, type SearchHit, type StudyCatalog, type TodayState, type NoteLink } from '../shared/study';
import type { StudyVideo } from '../shared/videos';
import type { z } from 'zod';
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
const cardColumns = 'id,subject_id AS subjectId,note_id AS noteId,question,answer,excerpt,due_at AS dueAt,interval_days AS intervalDays,reviews,version';
export class Study {
    constructor(readonly store: Store, readonly now = () => Date.now()) { }
    requireNote(id: string, subjectId: string) { if (!this.store.db.prepare('SELECT id FROM notes WHERE id=? AND subject_id=?').get(id, subjectId))
        throw new AppError('INVALID_REFERENCE', 'A nota precisa pertencer a esta matéria.'); }
    catalog(): StudyCatalog { return { subjects: this.store.bootstrap().subjects, notes: this.store.db.prepare('SELECT id,subject_id AS subjectId,path,title,hash,revision FROM notes ORDER BY rowid').all() as NoteRef[], videos: this.store.db.prepare('SELECT id,subject_id AS subjectId,title,youtube_id AS youtubeId,start_seconds AS startSeconds,url FROM videos ORDER BY rowid').all() as StudyVideo[], projects: this.store.db.prepare('SELECT id,name FROM project_folders ORDER BY rowid').all() as {
            id: string;
            name: string;
        }[] }; }
    search(query: string): SearchHit[] {
        const c = this.catalog(), q = fold(query), names = new Map(c.subjects.map(s => [s.id, s.name]));
        return [...c.subjects.map(s => ({ kind: 'subject' as const, id: s.id, title: s.name, detail: 'Matéria', subjectId: s.id })), ...c.notes.map(n => ({ kind: 'note' as const, id: n.id, title: n.title, detail: names.get(n.subjectId) || 'Nota', subjectId: n.subjectId })), ...c.projects.map(p => ({ kind: 'project' as const, id: p.id, title: p.name, detail: 'Explorer' })), ...c.videos.map(v => ({ kind: 'video' as const, id: v.id, title: v.title, detail: `Vídeo · ${names.get(v.subjectId) || ''}`, subjectId: v.subjectId }))].filter(h => !q || fold(h.title + ' ' + h.detail).includes(q)).slice(0, 60);
    }
    today(): TodayState {
        const at = this.now(), start = new Date(at);
        start.setHours(0, 0, 0, 0);
        const tasks = this.store.db.prepare('SELECT t.id,t.subject_id AS subjectId,s.name AS subject,t.text,COUNT(st.id) AS total,COALESCE(SUM(st.done),0) AS done FROM tasks t JOIN subjects s ON s.id=t.subject_id LEFT JOIN steps st ON st.task_id=t.id GROUP BY t.id HAVING COUNT(st.id)=0 OR SUM(st.done)<COUNT(st.id) ORDER BY t.rowid LIMIT 30').all() as TodayState['tasks'];
        let focusMs = 0;
        for (const segment of this.store.db.prepare('SELECT started_at AS start,COALESCE(ended_at,?) AS end,duration_ms AS duration FROM focus_segments WHERE started_at<? AND COALESCE(ended_at,?)>=?').all(at, at, at, start.getTime())) {
            const elapsed = Math.max(0, Number(segment.end) - Number(segment.start));
            const overlap = Math.max(0, Math.min(at, Number(segment.end)) - Math.max(start.getTime(), Number(segment.start)));
            focusMs += elapsed ? Math.min(Number(segment.duration), Math.round(Number(segment.duration) * overlap / elapsed)) : 0;
        }
        return { at, focusMs, due: Number(this.store.db.prepare('SELECT COUNT(*) n FROM flashcards WHERE due_at<=?').get(at)!.n), cards: Number(this.store.db.prepare('SELECT COUNT(*) n FROM flashcards').get()!.n), lastSubjectId: this.store.setting('activeSubject'), tasks, subjects: this.store.bootstrap().subjects };
    }
    cards(subjectId?: string): Flashcard[] { if (subjectId)
        this.store.requireSubject(subjectId); return this.store.db.prepare(`SELECT ${cardColumns} FROM flashcards ${subjectId ? 'WHERE subject_id=?' : ''} ORDER BY due_at,rowid`).all(...(subjectId ? [subjectId] : [])) as Flashcard[]; }
    private card(id: string, subjectId: string): Flashcard { const row = this.store.db.prepare(`SELECT ${cardColumns} FROM flashcards WHERE id=? AND subject_id=?`).get(id, subjectId) as Flashcard | undefined; if (!row)
        throw new AppError('INVALID_REFERENCE', 'Cartão não encontrado nesta matéria.'); return row; }
    create(raw: z.infer<typeof cardCreateInput>) { return this.store.transaction(() => this.createInTransaction(raw)); }
    createInTransaction(raw: z.infer<typeof cardCreateInput>) { const input = cardCreateInput.parse(raw); this.store.requireSubject(input.subjectId); if (input.noteId)
        this.requireNote(input.noteId, input.subjectId); if (Number(this.store.db.prepare('SELECT COUNT(*) n FROM flashcards').get()!.n) >= 5000)
        throw new AppError('CARD_LIMIT', 'Limite de 5.000 cartões alcançado.'); const id = randomUUID(); this.store.db.prepare('INSERT INTO flashcards(id,subject_id,note_id,question,answer,excerpt,due_at) VALUES(?,?,?,?,?,?,?)').run(id, input.subjectId, input.noteId, input.question, input.answer, input.excerpt, this.now()); this.store.audit('card.create', id, 'ok'); return this.card(id, input.subjectId); }
    remove(input: {
        subjectId: string;
        id: string;
    }) { this.store.transaction(() => { this.card(input.id, input.subjectId); this.store.db.prepare('DELETE FROM card_reviews WHERE card_id=?').run(input.id); this.store.db.prepare('DELETE FROM flashcards WHERE id=?').run(input.id); this.store.audit('card.remove', input.id, 'ok'); }); }
    review(raw: z.infer<typeof cardReviewInput>) { const input = cardReviewInput.parse(raw), request = JSON.stringify(input); return this.store.transaction(() => { const card = this.card(input.id, input.subjectId), prior = this.store.db.prepare('SELECT request FROM card_reviews WHERE id=?').get(input.operationId); if (prior) {
        if (prior.request !== request)
            throw new AppError('OPERATION_REUSED', 'Esta operação já foi usada para outra avaliação.');
        return card;
    } if (card.version !== input.version)
        throw new AppError('CARD_CHANGED', 'Este cartão já foi revisado. Atualize a lista.'); const interval = input.rating === 'again' ? 0 : input.rating === 'hard' ? Math.max(1, card.intervalDays * 1.2) : input.rating === 'good' ? Math.max(1, card.intervalDays * 2.5) : Math.max(4, card.intervalDays * 3.5); const days = Math.min(365, interval), at = this.now(), delay = days ? Math.round(days * 86400000) : 600000; if (!Number.isSafeInteger(at) || !Number.isFinite(days) || Math.abs(at + delay) > 8640000000000000)
        throw new AppError('CLOCK_INVALID', 'Confira a data do computador antes de agendar a revisão.'); this.store.db.prepare('UPDATE flashcards SET due_at=?,interval_days=?,reviews=reviews+1,version=version+1 WHERE id=?').run(at + delay, days, input.id); this.store.db.prepare('INSERT INTO card_reviews(id,card_id,request,rating,at) VALUES(?,?,?,?,?)').run(input.operationId, input.id, request, input.rating, at); if(card.dueAt<=at)this.store.db.prepare('INSERT INTO economic_receipts(source,kind,amount,at,version) VALUES(?,?,?,?,?)').run('review-source:'+input.operationId,'eligible-review','0',at,2); this.store.audit('card.review', input.id, 'ok'); return this.card(input.id, input.subjectId); }); }
    links(subjectId: string): NoteLink[] { this.store.requireSubject(subjectId); return this.store.db.prepare('SELECT id,subject_id AS subjectId,source_id AS sourceId,target_id AS targetId,label FROM note_links WHERE subject_id=? ORDER BY rowid').all(subjectId) as NoteLink[]; }
    link(raw: z.infer<typeof linkCreateInput>) { const input = linkCreateInput.parse(raw); return this.store.transaction(() => { this.requireNote(input.sourceId, input.subjectId); this.requireNote(input.targetId, input.subjectId); if (Number(this.store.db.prepare('SELECT COUNT(*) n FROM note_links WHERE subject_id=?').get(input.subjectId)!.n) >= 1000)
        throw new AppError('LINK_LIMIT', 'Exporte ou organize até 1.000 relações por matéria.'); const existing = this.store.db.prepare('SELECT id FROM note_links WHERE source_id=? AND target_id=?').get(input.sourceId, input.targetId), id = existing ? String(existing.id) : randomUUID(); this.store.db.prepare('INSERT INTO note_links(id,subject_id,source_id,target_id,label) VALUES(?,?,?,?,?) ON CONFLICT(source_id,target_id) DO UPDATE SET label=excluded.label').run(id, input.subjectId, input.sourceId, input.targetId, input.label); this.store.audit('link.save', id, 'ok'); return this.links(input.subjectId); }); }
    unlink(input: {
        subjectId: string;
        id: string;
    }) { return this.store.transaction(() => { if (!this.store.db.prepare('SELECT id FROM note_links WHERE id=? AND subject_id=?').get(input.id, input.subjectId))
        throw new AppError('INVALID_REFERENCE', 'Relação não encontrada.'); this.store.db.prepare('DELETE FROM note_links WHERE id=?').run(input.id); this.store.audit('link.remove', input.id, 'ok'); return this.links(input.subjectId); }); }
}
