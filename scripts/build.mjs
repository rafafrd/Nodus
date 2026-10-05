import { build } from 'esbuild';
import { build as viteBuild } from 'vite';
import fs from 'node:fs/promises';
for (const folder of ['cmaps', 'standard_fonts']) await fs.cp(`node_modules/pdfjs-dist/${folder}`, `src/renderer/public/pdf-assets/${folder}`, { recursive: true });
await build({ entryPoints: ['src/main/index.ts'], bundle: true, platform: 'node', format: 'cjs', external: ['electron'], outfile: 'dist/main.cjs' });
await build({ entryPoints: ['src/preload/index.ts'], bundle: true, platform: 'node', format: 'cjs', external: ['electron'], outfile: 'dist/preload.cjs' });
await viteBuild();
