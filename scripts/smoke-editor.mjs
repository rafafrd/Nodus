import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: electronPath, args: ['.'], env });
try {
  const page = await app.firstWindow();
  const fixture = await fs.readFile('tests/fixtures/compatibility.md', 'utf8');
  const editor = page.getByRole('textbox', { name: 'Conteúdo da nota' });
  await editor.fill(fixture);
  assert.equal((await editor.locator('.cm-line').allTextContents()).join('\n'), fixture);
  await page.getByRole('button', { name: 'Negrito', exact: true }).click();
  const after = (await editor.locator('.cm-line').allTextContents()).join('\n');
  assert.ok(after.includes('custom_unknown: preserve-me') && after.includes('E = mc^2') && after.includes('<custom-element'));
  await page.screenshot({ path: '.local/evidence/editor.png' });
  await fs.writeFile('.local/evidence/editor-output.md', after);
  console.log('Editor real: fixture carregada, botão de formatação funcionou, conteúdo incompatível conservado.');
} finally { await app.close(); }
