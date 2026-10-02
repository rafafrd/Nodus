export type Result<T> = { ok: true; value: T } | { ok: false; code: string; message: string };
export type AppInfo = { version: string; electron: string; node: string };
export type Subject = { id: string; name: string; color: string };
export type Bootstrap = { subjects: Subject[]; vault: string | null; activeSubjectId: string | null };
export const idSchema = z.uuid();
export const subjectInput = z.strictObject({ name: z.string().trim().min(1).max(120), color: z.enum(['sage', 'blue', 'rose', 'amber']) });
export const renameInput = z.strictObject({ id: idSchema, name: z.string().trim().min(1).max(120) });
export interface DesktopApi {
  version(): Promise<Result<AppInfo>>;
  bootstrap(): Promise<Result<Bootstrap>>;
  createSubject(input: z.infer<typeof subjectInput>): Promise<Result<Subject>>;
  renameSubject(input: z.infer<typeof renameInput>): Promise<Result<Subject>>;
}
export class AppError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export function empty(value: unknown) {
  if (value !== undefined) throw new AppError('INVALID_ARGUMENT', 'Esta operação não recebe argumentos.');
}
import { z } from 'zod';
