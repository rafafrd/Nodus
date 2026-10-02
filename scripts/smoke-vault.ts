import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
fs.mkdirSync('.local', { recursive: true });
const dir = fs.mkdtempSync(path.resolve('.local/vault-smoke-'));
const root = path.join(dir, 'vault'); fs.mkdirSync(root);
const store = new Store(path.join(dir, 'data')); const vault = new Vault(store); vault.selectRoot(root);
const subject = store.createSubject({ name: 'Matéria fixture', color: 'sage' });
const doc = vault.create({ subjectId: subject.id, title: 'Nota fixture' });
const file = vault.resolve(doc.ref.path); store.close();
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
let pendingText = '';
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: electronPath, args: ['.', `--user-data-dir=${path.join(dir, 'data')}`], env });
  try {
    const page = await app.firstWindow();
    await page.getByRole('button', { name: 'Matéria fixture', exact: true }).click();
    await page.getByRole('button', { name: 'Nota fixture', exact: true }).click();
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    const editor = page.getByRole('textbox', { name: 'Conteúdo da nota' });
    if (!pass) {
      const text = doc.text + fs.readFileSync('tests/fixtures/compatibility.md', 'utf8');
      await editor.fill(text); await page.getByRole('button', { name: 'Salvar nota', exact: true }).click();
      await page.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor();
      assert.equal(fs.readFileSync(file, 'utf8'), text);
      const parent = path.dirname(file), moved = parent + '-fixture-moved';
      assert.ok(parent.startsWith(root + path.sep) && moved.startsWith(root + path.sep));
      fs.renameSync(parent, moved); fs.writeFileSync(parent, 'falha controlada de fixture');
      await editor.fill(text + '\nBuffer preservado após falha.');
      await page.getByRole('button', { name: 'Salvar nota', exact: true }).click();
      await page.getByRole('alert').waitFor();
      const failed = new Store(path.join(dir, 'data'));
      assert.ok(String(failed.db.prepare('SELECT text FROM drafts WHERE note_id=?').get(doc.ref.id)?.text).includes('Buffer preservado após falha.')); failed.close();
      fs.unlinkSync(parent); fs.renameSync(moved, parent);
      await page.getByRole('button', { name: 'Fechar aviso', exact: true }).click();
      await editor.fill(text); await page.getByRole('button', { name: 'Salvar nota', exact: true }).click();
      await page.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor();
      const external = text.replace('Esta frase pode mudar.', 'Mudança externa limpa.'); fs.writeFileSync(file, external);
      await page.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor();
      await page.waitForFunction(() => document.querySelector('.cm-content')?.textContent?.includes('Mudança externa limpa.'));
      pendingText = external.replace('Mudança externa limpa.', 'Meu buffer pendente.'); await editor.fill(pendingText);
      const external2 = external.replace('Mudança externa limpa.', 'Segunda edição externa.'); fs.writeFileSync(file, external2);
      await page.getByText('Arquivo alterado fora do app', { exact: true }).waitFor();
      assert.equal(fs.readFileSync(file, 'utf8'), external2);
      assert.ok((await editor.locator('.cm-line').allTextContents()).join('\n').includes('Meu buffer pendente.'));
      await page.screenshot({ path: '.local/evidence/vault-conflict.png' });
    } else {
      await page.getByRole('status').filter({ hasText: 'Rascunho recuperado' }).waitFor();
      const recovered = await page.evaluate(id => window.desktop.openNote({ id }), doc.ref.id);
      assert.ok(recovered.ok); if (recovered.ok) assert.equal(recovered.value.draft?.text, pendingText);
      await editor.press('Control+End');
      await page.getByText('<custom-element data-fixture="true">conteúdo não representável</custom-element>', { exact: true }).first().waitFor();
      assert.ok(fs.readFileSync(file, 'utf8').includes('Segunda edição externa.'));
      const invalid = await page.evaluate(() => window.desktop.openNote({ id: '../arbitrary' }));
      assert.ok(!invalid.ok && invalid.code === 'INVALID_ARGUMENT');
    }
  } finally { await app.close(); }
}
console.log('Vault/IPC/UI reais: bytes salvos, edição externa limpa atualizada, conflito preservado, rascunho reaberto e argumento inválido rejeitado.');
