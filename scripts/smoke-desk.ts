import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepareFixture } from './test-fixture';
const fixture = prepareFixture('desk-smoke');
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: electronPath, args: ['.', `--user-data-dir=${path.join(fixture.dir, 'data')}`], env });
  try {
    const page = await app.firstWindow();
    await page.getByRole('heading', { name: 'Matéria A', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    const slider = page.getByRole('slider', { name: 'Largura do caderno' });
    if (!pass) {
      await slider.focus(); await slider.press('ArrowRight');
      await page.waitForFunction(() => (document.querySelector('input[type=range]') as HTMLInputElement)?.value === '61');
      const editor = page.getByRole('textbox', { name: 'Conteúdo da nota' });
      await editor.fill(fixture.noteA.text + '\nRascunho da mesa A.');
      await page.getByRole('button', { name: 'Abrir foco', exact: true }).click();
      await page.getByText('FOCO', { exact: true }).waitFor();
      assert.ok((await editor.locator('.cm-line').allTextContents()).join('\n').includes('study_id:'));
      await page.getByRole('button', { name: 'Matéria B', exact: true }).click();
      await page.getByRole('heading', { name: 'Nota B', exact: true }).waitFor();
      assert.equal(await slider.inputValue(), '42');
      await page.getByRole('button', { name: 'Matéria A', exact: true }).click();
      await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
      const dock = await page.locator('.tool-dock').boundingBox(); const footer = await page.locator('.statusbar').boundingBox();
      const height = await page.evaluate(() => innerHeight);
      assert.ok(dock && footer && dock.y + dock.height <= height && footer.y + footer.height <= height);
      await page.screenshot({ path: '.local/evidence/desk.png' });
    } else {
      assert.equal(await slider.inputValue(), '61');
      const results = await page.evaluate(async ids => ({ a: await window.desktop.openDesk({ subjectId: ids.a }), b: await window.desktop.openDesk({ subjectId: ids.b }), note: await window.desktop.openNote({ id: ids.note }) }), { a: fixture.a.id, b: fixture.b.id, note: fixture.noteA.ref.id });
      assert.ok(results.a.ok && results.b.ok && results.note.ok);
      if (results.a.ok && results.b.ok && results.note.ok) {
        assert.equal(results.a.value.materialId, fixture.materialA.id); assert.equal(results.b.value.materialId, fixture.materialB.id);
        assert.equal(results.a.value.tool, 'focus'); assert.equal(results.b.value.split, 42); assert.ok(results.note.value.draft?.text.includes('Rascunho da mesa A.'));
      }
    }
  } finally { await app.close(); }
}
console.log('Mesa/UI real: duas matérias, notas/PDFs distintos, redimensionamento por teclado, ferramenta sem perda, contexto e rascunho restaurados após reinicialização.');
