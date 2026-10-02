import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
await fs.mkdir('.local/evidence', { recursive: true });
const directory = await fs.mkdtemp(path.resolve('.local/desktop-smoke-'));
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: process.argv.includes('--packaged') ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(process.argv.includes('--packaged') ? [] : ['.']), `--user-data-dir=${directory}`], env });
  try {
    const page = await app.firstWindow();
    await page.getByTestId('version').filter({ hasText: '0.1.0' }).waitFor();
    const result = await page.evaluate(() => window.desktop.version());
    if (!result.ok || result.value.version !== '0.1.0') throw Error(JSON.stringify(result));
    const controls = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences());
    if (!controls.contextIsolation || !controls.sandbox || controls.nodeIntegration) throw Error('Isolamento incorreto');
    await page.screenshot({ path: `.local/evidence/foundation-${pass}.png` });
    console.log(JSON.stringify({ pass, packaged: process.argv.includes('--packaged'), result, isolation: true }));
  } finally { await app.close(); }
}
