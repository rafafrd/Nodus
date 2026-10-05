import { z } from 'zod';
export const pdfSourceInput = z.discriminatedUnion('source', [z.strictObject({ source: z.literal('vault') }), z.strictObject({ source: z.literal('project'), projectId: z.uuid() })]);
const options={title:z.string().trim().max(120).optional(),includeImages:z.boolean().optional(),destination:z.enum(['downloads','selected']).optional()};
export const pdfExportInput = z.discriminatedUnion('source', [z.strictObject({ source: z.literal('vault'), folder: z.string().max(1024),noteId:z.uuid().optional(),...options }).refine(v=>!v.noteId||v.folder===''), z.strictObject({ source: z.literal('project'), projectId: z.uuid(), folder: z.string().max(1024),...options })]);
export type PdfSource = z.infer<typeof pdfSourceInput>;
export type PdfExportInput = z.infer<typeof pdfExportInput>;
export type PdfFolder = { path: string; label: string };
export type PdfExportResult = { state: 'saved'; path: string; notes: number; bytes: number; skipped: number;warnings?:string[] };
