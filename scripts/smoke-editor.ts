import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepareFixture, noteTitle } from './test-fixture';
const fixture = prepareFixture('editor-smoke');
fs.mkdirSync('.local/evidence', { recursive: true });
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const packaged = process.argv.includes('--packaged');
const app = await electron.launch({ executablePath: packaged ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(packaged ? [] : ['.']), `--user-data-dir=${path.join(fixture.dir, 'data')}`], env });
try {
  const page = await app.firstWindow();
  await noteTitle(page, 'Nota A');
  const editor = page.getByRole('textbox', { name: 'Conteúdo da nota' });
  // The editor shows only the body (UX-01); type at its end instead of replacing the whole file.
  await editor.click(); await editor.press('Control+End'); await editor.press('Enter'); await page.keyboard.insertText('Trecho fixture editável.');
  await editor.press('Home'); await editor.press('Shift+End');
  await page.getByRole('button', { name: 'Negrito', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar nota', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor();
  const after = fs.readFileSync(path.join(fixture.root, fixture.noteA.ref.path), 'utf8'); fs.writeFileSync('.local/evidence/editor-output.md', after);
  assert.equal(after, fixture.noteA.text + '\n**Trecho fixture editável.**');
  const opened = await page.evaluate(id => window.desktop.openNote({ id }), fixture.noteA.ref.id);
  assert.ok(opened.ok); if (opened.ok) assert.equal(opened.value.text, after);
  await page.screenshot({ path: '.local/evidence/editor.png' });
  fs.writeFileSync('.local/evidence/editor-output.md', after);
  console.log('Editor/toolbar/arquivo reais: alteração seletiva conserva todos os bytes restantes da fixture; instância isolada.');
} finally { await app.close(); }
