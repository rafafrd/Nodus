export type Result<T> = { ok: true; value: T } | { ok: false; code: string; message: string };
export type AppInfo = { version: string; electron: string; node: string };
export type Subject = { id: string; name: string; color: string };
export type Bootstrap = { subjects: Subject[]; vault: string | null; activeSubjectId: string | null };
export const idSchema = z.uuid();
export const subjectInput = z.strictObject({ name: z.string().trim().min(1).max(120), color: z.enum(['sage', 'blue', 'rose', 'amber']) });
export const renameInput = z.strictObject({ id: idSchema, name: z.string().trim().min(1).max(120) });
export type NoteRef = { id: string; subjectId: string; path: string; title: string; hash: string; revision: number };
export type NoteDocument = { ref: NoteRef; text: string; hash: string; draft: { text: string; baseHash: string } | null };
export type SaveResult = { state: 'saved'; document: NoteDocument } | { state: 'conflict'; external: NoteDocument };
export const subjectIdInput = z.strictObject({ subjectId: idSchema });
export const noteIdInput = z.strictObject({ id: idSchema });
export const createNoteInput = z.strictObject({ subjectId: idSchema, title: z.string().trim().min(1).max(160) });
export const noteWriteInput = z.strictObject({ id: idSchema, text: z.string().max(2 * 1024 * 1024), hash: z.string().regex(/^[a-f0-9]{64}$/) });
export type Material = { id: string; subjectId: string; name: string };
export type Desk = { subjectId: string; noteId: string | null; materialId: string | null; page: number; split: number; tool: 'focus' | 'checklist' | 'none'; preview: boolean; nextStepId: string | null };
export const deskInput = z.strictObject({ subjectId: idSchema, noteId: idSchema.nullable().optional(), materialId: idSchema.nullable().optional(), page: z.number().int().min(1).max(100000).optional(), split: z.number().int().min(30).max(75).optional(), tool: z.enum(['focus', 'checklist', 'none']).optional(), preview: z.boolean().optional(), nextStepId: idSchema.nullable().optional() });
export const materialChoiceInput = z.strictObject({ subjectId: idSchema, replaceId: idSchema.optional() });
export interface DesktopApi {
  version(): Promise<Result<AppInfo>>;
  bootstrap(): Promise<Result<Bootstrap>>;
  createSubject(input: z.infer<typeof subjectInput>): Promise<Result<Subject>>;
  renameSubject(input: z.infer<typeof renameInput>): Promise<Result<Subject>>;
  chooseVault(): Promise<Result<string | null>>;
  listNotes(input: z.infer<typeof subjectIdInput>): Promise<Result<NoteRef[]>>;
  createNote(input: z.infer<typeof createNoteInput>): Promise<Result<NoteDocument>>;
  importNote(input: z.infer<typeof subjectIdInput>): Promise<Result<NoteDocument | null>>;
  openNote(input: z.infer<typeof noteIdInput>): Promise<Result<NoteDocument>>;
  saveNote(input: z.infer<typeof noteWriteInput>): Promise<Result<SaveResult>>;
  recoverDraft(input: z.infer<typeof noteWriteInput>): Promise<Result<null>>;
  discardDraft(input: z.infer<typeof noteIdInput>): Promise<Result<NoteDocument>>;
  onBeforeClose(callback: () => void): () => void;
  finishClose(): Promise<Result<null>>;
  openDesk(input: z.infer<typeof subjectIdInput>): Promise<Result<Desk>>;
  saveDesk(input: z.infer<typeof deskInput>): Promise<Result<Desk>>;
  listMaterials(input: z.infer<typeof subjectIdInput>): Promise<Result<Material[]>>;
  chooseMaterial(input: z.infer<typeof materialChoiceInput>): Promise<Result<Material | null>>;
}
export class AppError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export function empty(value: unknown) {
  if (value !== undefined) throw new AppError('INVALID_ARGUMENT', 'Esta operação não recebe argumentos.');
}
import { z } from 'zod';
