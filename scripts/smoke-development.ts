import { createServer } from 'vite';
import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepareFixture } from './test-fixture';
const f = prepareFixture('development-smoke'); const server = await createServer(); await server.listen();
const env = { ...process.env, APP_DEV_URL: 'http://127.0.0.1:5173' }; delete (env as Record<string, string | undefined>).ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: electronPath, args: ['.', `--user-data-dir=${path.join(f.dir, 'data')}`], env });
try {
  const page = await app.firstWindow(); const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.getByTestId('version').filter({ hasText: '0.1.0' }).waitFor(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
  assert.deepEqual(errors, []);
  console.log('Dev Vite/Electron real: IPC, React, CSP e worker PDF sem erros de console/página.');
} finally { await app.close(); await server.close(); }
