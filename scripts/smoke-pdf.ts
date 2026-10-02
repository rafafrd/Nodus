import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Desks } from '../src/main/desk';
const f = prepareFixture('pdf-smoke'); const packaged = process.argv.includes('--packaged');
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: packaged ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...packaged ? [] : ['.'], `--user-data-dir=${path.join(f.dir, 'data')}`], env });
  try {
    const page = await app.firstWindow();
    await page.locator('canvas[data-rendered-page="2"]').waitFor();
    assert.equal(await page.getByTestId('pdf-pages').innerText(), '3');
    await page.waitForFunction(() => document.querySelector('[data-testid=pdf-text]')?.textContent?.includes('fixture A - page 2'));
    await page.getByRole('button', { name: 'Próxima página', exact: true }).click(); await page.locator('canvas[data-rendered-page="3"]').waitFor();
    await page.getByRole('button', { name: 'Página anterior', exact: true }).click(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
    await page.getByRole('button', { name: 'Matéria B', exact: true }).click(); await page.locator('canvas[data-rendered-page="3"]').waitFor();
    await page.getByRole('button', { name: 'Matéria A', exact: true }).click(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
    if (!pass) await page.screenshot({ path: `.local/evidence/pdf-${packaged ? 'packaged' : 'dev'}.png` });
    if (pass) {
      const moved = path.join(f.dir, 'fixture-moved.pdf'); assert.ok(moved.startsWith(f.dir + path.sep)); fs.renameSync(f.pdfA, moved);
      await page.getByRole('button', { name: 'Matéria B', exact: true }).click(); await page.getByRole('heading', { name: 'Nota B', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Matéria A', exact: true }).click(); await page.getByRole('alert').filter({ hasText: 'ausente' }).waitFor();
      assert.ok(await page.getByRole('button', { name: 'Localizar arquivo novamente' }).isVisible());
      const data = new Store(path.join(f.dir, 'data')); const desks = new Desks(data); desks.choose(f.a.id, moved, f.materialA.id); data.close();
      await page.getByRole('button', { name: 'Matéria B', exact: true }).click(); await page.getByRole('heading', { name: 'Nota B', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Matéria A', exact: true }).click(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
      fs.writeFileSync(moved, 'invalid PDF fixture');
      await page.getByRole('button', { name: 'Matéria B', exact: true }).click(); await page.getByRole('heading', { name: 'Nota B', exact: true }).waitFor();
      await page.getByRole('button', { name: 'Matéria A', exact: true }).click(); await page.getByRole('alert').filter({ hasText: 'PDF válido' }).waitFor();
      await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    }
  } finally { await app.close(); }
}
console.log(`PDF real (${packaged ? 'empacotado Windows' : 'build local'}): worker/fontes, 3 páginas, navegação, retomada, arquivo ausente, relocalização com ID e erro inválido sem perda de nota.`);
