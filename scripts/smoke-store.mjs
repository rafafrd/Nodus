import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const dir = path.resolve(await fs.mkdtemp('.local/store-smoke-'));
let ids;
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: electronPath, args: ['.', `--user-data-dir=${dir}`], env });
  try {
    const page = await app.firstWindow();
    await page.getByTestId('version').filter({ hasText: '0.1.0' }).waitFor();
    if (!pass) {
      await page.getByRole('textbox', { name: 'Nome da matéria', exact: true }).fill('Matemática');
      await page.getByRole('button', { name: 'Criar matéria', exact: true }).click();
      await page.getByRole('button', { name: 'Renomear Matemática' }).waitFor();
      const results = await page.evaluate(async () => {
        const b = await window.desktop.createSubject({ name: 'Física', color: 'blue' });
        const invalid = await window.desktop.createSubject({ name: '', color: 'sage' });
        const data = await window.desktop.bootstrap();
        return { b, invalid, data };
      });
      assert.ok(results.b.ok && !results.invalid.ok && results.invalid.code === 'INVALID_ARGUMENT');
      assert.equal(results.data.value.subjects.length, 2);
      ids = results.data.value.subjects.map(s => s.id);
      const renamed = await page.evaluate(id => window.desktop.renameSubject({ id, name: 'Álgebra' }), ids[0]);
      assert.ok(renamed.ok);
    } else {
      const data = await page.evaluate(() => window.desktop.bootstrap());
      assert.deepEqual(data.value.subjects.map(s => s.id), ids);
      assert.equal(data.value.subjects[0].name, 'Álgebra');
    }
  } finally { await app.close(); }
}
console.log('SQLite no Electron: duas matérias, renomeação, rejeição IPC sem gravação, IDs estáveis após reinicialização.');
