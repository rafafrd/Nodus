import { z } from 'zod';
import type { Subject, NoteRef } from './contracts';
import type { StudyVideo } from './videos';
const id = z.uuid(), text = (max: number) => z.string().trim().min(1).max(max);
export const searchInput = z.strictObject({ query: z.string().trim().max(160) });
export type SearchHit = {
    kind: 'subject' | 'note' | 'project' | 'video';
    id: string;
    title: string;
    detail: string;
    subjectId?: string;
};
export type StudyCatalog = {
    subjects: Subject[];
    notes: NoteRef[];
    videos: StudyVideo[];
    projects: {
        id: string;
        name: string;
    }[];
};
export const cardCreateInput = z.strictObject({ subjectId: id, noteId: id.nullable(), question: text(1000), answer: text(4000), excerpt: z.string().max(2000) });
export const cardRefInput = z.strictObject({ subjectId: id, id });
export const cardListInput = z.strictObject({ subjectId: id.optional() });
export const cardReviewInput = z.strictObject({ subjectId: id, id, operationId: id, version: z.number().int().min(0), rating: z.enum(['again', 'hard', 'good', 'easy']) });
export type Flashcard = {
    id: string;
    subjectId: string;
    noteId: string | null;
    question: string;
    answer: string;
    excerpt: string;
    dueAt: number;
    intervalDays: number;
    reviews: number;
    version: number;
};
const fingerprint = z.string().regex(/^[a-f0-9]{64}$/);
export const markListInput = z.strictObject({ subjectId: id, materialId: id, fingerprint });
export const markCreateInput = z.strictObject({ subjectId: id, materialId: id, fingerprint, noteId: id.nullable(), page: z.number().int().min(1).max(100000), x: z.number().min(0).max(1), y: z.number().min(0).max(1), width: z.number().min(.002).max(1), height: z.number().min(.002).max(1), color: z.enum(['gold', 'sage', 'blue']), comment: z.string().trim().max(2000) }).refine(r => r.x + r.width <= 1.000001 && r.y + r.height <= 1.000001);
export const markRefInput = z.strictObject({ subjectId: id, materialId: id, id });
export type PdfMark = z.infer<typeof markCreateInput> & {
    id: string;
    fingerprint: string;
};
export const momentCreateInput = z.strictObject({ subjectId: id, videoId: id, seconds: z.number().int().min(0).max(86400), text: text(2000) });
export const momentListInput = z.strictObject({ subjectId: id, videoId: id });
export const momentRefInput = z.strictObject({ subjectId: id, videoId: id, id });
export type VideoMoment = z.infer<typeof momentCreateInput> & {
    id: string;
};
export function clockSeconds(value: string): number | null { const parts = value.trim().split(':'); if (!parts.length || parts.length > 3 || parts.some(p => !/^\d{1,5}$/.test(p)))
    return null; const numbers = parts.map(Number); if (parts.length > 1 && numbers.slice(1).some(n => n >= 60))
    return null; const seconds = numbers.reduce((sum, n) => sum * 60 + n, 0); return seconds <= 86400 ? seconds : null; }
export const clockLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
export const linkCreateInput = z.strictObject({ subjectId: id, sourceId: id, targetId: id, label: text(120) }).refine(r => r.sourceId !== r.targetId);
export const linkRefInput = z.strictObject({ subjectId: id, id });
export type NoteLink = {
    id: string;
    subjectId: string;
    sourceId: string;
    targetId: string;
    label: string;
};
export type TodayState = {
    at: number;
    focusMs: number;
    due: number;
    cards: number;
    lastSubjectId: string | null;
    tasks: {
        id: string;
        subjectId: string;
        subject: string;
        text: string;
        done: number;
        total: number;
    }[];
    subjects: Subject[];
};
