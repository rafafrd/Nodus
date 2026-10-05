import fs from 'node:fs';
import path from 'node:path';
import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
import { Desks } from '../src/main/desk';

// Isolated real initial game, with an explicitly fictitious study note.
const stage = process.argv.find(v => /^--stage=[a-z0-9-]+$/.test(v))?.split('=')[1] ?? 'first';
const directory = fs.mkdtempSync(path.resolve('.local/game-preview-')), data = path.join(directory, 'data'), root = path.join(directory, 'vault'); fs.mkdirSync(root);
const db = new Store(data), vault = new Vault(db); vault.selectRoot(root);
const subject = db.createSubject({ name: 'Algoritmos', color: 'sage' }); const note = vault.create({ subjectId: subject.id, title: 'Plano de estudos' });
new Desks(db).save({ subjectId: subject.id, noteId: note.ref.id, tool: 'both' }); db.close();
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const packaged = process.argv.includes('--packaged');
const app = await electron.launch({ executablePath: packaged ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(packaged ? [] : ['.']), `--user-data-dir=${data}`], env });
try {
  const page = await app.firstWindow(); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.getByRole('button', { name: 'Entrar na cidade', exact: true }).click();
  await page.locator('canvas[data-ready=true]').waitFor();
  for (let i = 1; i <= 4; i++) await page.getByRole('button', { name: `Plantar canteiro ${i}`, exact: true }).click();
  fs.mkdirSync('.local/evidence', { recursive: true });
  await page.screenshot({ path: `.local/evidence/game-${stage}-city.png` });
  await page.getByRole('button', { name: 'Mercado', exact: true }).click();
  await page.screenshot({ path: `.local/evidence/game-${stage}-shop.png` });
  console.log(JSON.stringify({ directory, errors, captures: `game-${stage}-city/shop.png` }));
} finally { await app.close(); }
