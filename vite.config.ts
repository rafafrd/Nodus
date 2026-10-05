import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  root: 'src/renderer', base: './', html: { cspNonce: 'vite-dev' },
  plugins: [react(), { name: 'production-csp', apply: 'build', transformIndexHtml: { order: 'post', handler: html => html.replace(" 'nonce-vite-dev'", '').replace(' ws://127.0.0.1:5173', '') } }],
  build: { outDir: '../../dist/renderer', emptyOutDir: true },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
});
