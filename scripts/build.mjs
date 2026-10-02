import { build } from 'esbuild';
import { build as viteBuild } from 'vite';
await build({ entryPoints: ['src/main/index.ts'], bundle: true, platform: 'node', format: 'cjs', external: ['electron'], outfile: 'dist/main.cjs' });
await build({ entryPoints: ['src/preload/index.ts'], bundle: true, platform: 'node', format: 'cjs', external: ['electron'], outfile: 'dist/preload.cjs' });
await viteBuild();
