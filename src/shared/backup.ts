import { z } from 'zod';
export const backupRefInput = z.strictObject({ id: z.uuid() });
export const backupPath = z.string().min(1).max(1024).refine(v => !/[\\:\0]/.test(v) && !v.startsWith('/') && v.split('/').every(p => p && p !== '.' && p !== '..' && !p.endsWith('.') && !p.endsWith(' ') && !/[<>"|?*\u0001-\u001f]/.test(p) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)));
export const snapshotManifest = z.strictObject({ format: z.literal('nodus-local-v1'), id: z.uuid(), at: z.number().int().positive(), schema: z.union([z.literal(5),z.literal(6),z.literal(7)]), files: z.array(z.strictObject({ path: backupPath, bytes: z.number().int().min(0).max(100 * 1024 * 1024), hash: z.string().regex(/^[a-f0-9]{64}$/) })).min(1).max(5000), projects: z.array(z.uuid()).max(200), materials: z.array(z.uuid()).max(2000), vault: z.boolean(), omissions: z.array(z.string().max(240)).max(200) });
export type SnapshotManifest = z.infer<typeof snapshotManifest>;
export type BackupPreview = {
    files: number;
    bytes: number;
    notes: number;
    projects: number;
    materials: number;
    omissions: string[];
    destination: string;
};
export type BackupReceipt = {
    id: string;
    path: string;
    at: number;
    files: number;
    bytes: number;
    omissions: string[];
};
export type RestoreReceipt = {
    id: string;
    path: string;
    profile: string;
    files: number;
    omissions: string[];
};
