import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
const data = fs.mkdtempSync(path.resolve('.local/game-ipc-'));
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${data}`], env });
try {
  const page = await app.firstWindow(); await page.getByRole('button', { name: 'Entrar na cidade', exact: true }).waitFor();
  const before = await page.evaluate(() => window.desktop.getGame()); assert.ok(before.ok);
  // A controlled hostile window with direct ipcRenderer access attempts the real
  // privileged handlers. This is a probe window, never the product renderer config.
  const denied = await app.evaluate(async ({ BrowserWindow }) => {
    const foreign = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } });
    try {
      await foreign.loadURL('data:text/html,<title>Isolated IPC security probe</title>');
      return await foreign.webContents.executeJavaScript(`(async () => {
        const {ipcRenderer} = require('electron');
        const read = await ipcRenderer.invoke('game:get');
        const write = await ipcRenderer.invoke('game:action', {operationId: require('node:crypto').randomUUID(), action: {kind:'gather',resource:'stone'}});
        return {read,write};
      })()`);
    } finally { foreign.destroy(); }
  });
  assert.ok(!denied.read.ok && denied.read.code === 'FORBIDDEN'); assert.ok(!denied.write.ok && denied.write.code === 'FORBIDDEN');
  const after = await page.evaluate(() => window.desktop.getGame()); assert.ok(after.ok && before.ok);
  if (after.ok && before.ok) assert.deepEqual({ ...after.value, now: 0 }, { ...before.value, now: 0 });
  const config = await app.evaluate(({ BrowserWindow }) => { const p = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences(); return { sandbox: p.sandbox, contextIsolation: p.contextIsolation, nodeIntegration: p.nodeIntegration, webSecurity: p.webSecurity }; });
  assert.deepEqual(config, { sandbox: true, contextIsolation: true, nodeIntegration: false, webSecurity: true });
  fs.writeFileSync('.local/evidence/game-ipc-results.json', JSON.stringify({ date: '2026-10-02', packaged: true, denied, config, effect: 'wallet/xp/inventory unchanged' }, null, 2));
  console.log('Pacote Windows: game:get/game:action rejeitam outra janela; configuração isolada preservada e estado sem efeito.');
} finally { await app.close(); }
