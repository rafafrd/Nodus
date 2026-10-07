import { z } from 'zod';
export const windowCommand = z.strictObject({ action: z.enum(['minimize', 'toggle-maximize', 'close']) });
export type WindowState = { maximized: boolean; minimized: boolean; fullscreen: boolean };
