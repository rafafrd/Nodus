import { z } from 'zod';
export const pdfSourceInput = z.discriminatedUnion('source', [z.strictObject({ source: z.literal('vault') }), z.strictObject({ source: z.literal('project'), projectId: z.uuid() })]);
export const pdfExportInput = z.discriminatedUnion('source', [z.strictObject({ source: z.literal('vault'), folder: z.string().max(1024) }), z.strictObject({ source: z.literal('project'), projectId: z.uuid(), folder: z.string().max(1024) })]);
export type PdfSource = z.infer<typeof pdfSourceInput>;
export type PdfExportInput = z.infer<typeof pdfExportInput>;
export type PdfFolder = { path: string; label: string };
export type PdfExportResult = { state: 'saved'; path: string; notes: number; bytes: number; skipped: number };
