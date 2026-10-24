import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepareFixture,noteTitle,chooseSubject } from './test-fixture';
// The desk belongs to the subject: note, PDF, page and draft come back per subject and after restart.
// Since the workspace tabs (UI-04), column widths belong to the tab and are covered by smoke-study-tabs.
const fixture = prepareFixture('desk-smoke', ['study', 'pdf']);
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const packaged = process.argv.includes('--packaged');
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: packaged ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(packaged ? [] : ['.']), `--user-data-dir=${path.join(fixture.dir, 'data')}`], env });
  try {
    const page = await app.firstWindow();
    await noteTitle(page,'Nota A');
    if (!pass) {
      await page.locator('canvas[data-rendered-page="2"]').waitFor();
      const editor = page.getByRole('textbox', { name: 'Conteúdo da nota' });
      await editor.click(); await editor.press('Control+End'); await page.keyboard.insertText('\nRascunho da mesa A.');
      await page.getByRole('button', { name: 'Próxima página', exact: true }).click(); await page.locator('canvas[data-rendered-page="3"]').waitFor();
      await page.waitForFunction(async id => { const r = await window.desktop.openDesk({ subjectId: id }); return r.ok && r.value.page === 3; }, fixture.a.id);
      await chooseSubject(page,'Matéria B');
      await noteTitle(page,'Nota B'); await page.locator('canvas[data-rendered-page="3"]').waitFor();
      await chooseSubject(page,'Matéria A');
      await noteTitle(page,'Nota A'); await page.locator('canvas[data-rendered-page="3"]').waitFor();
      // CodeMirror renders only the visible lines, so the draft at the end is read through IPC.
      const draft = await page.evaluate(id => window.desktop.openNote({ id }), fixture.noteA.ref.id); assert.ok(draft.ok && draft.value.draft?.text.includes('Rascunho da mesa A.'));
      await page.screenshot({ path: '.local/evidence/desk.png' });
    } else {
      await page.locator('canvas[data-rendered-page="3"]').waitFor();
      const results = await page.evaluate(async ids => ({ a: await window.desktop.openDesk({ subjectId: ids.a }), b: await window.desktop.openDesk({ subjectId: ids.b }), note: await window.desktop.openNote({ id: ids.note }) }), { a: fixture.a.id, b: fixture.b.id, note: fixture.noteA.ref.id });
      assert.ok(results.a.ok && results.b.ok && results.note.ok);
      if (results.a.ok && results.b.ok && results.note.ok) {
        assert.equal(results.a.value.materialId, fixture.materialA.id); assert.equal(results.b.value.materialId, fixture.materialB.id);
        assert.equal(results.a.value.page, 3); assert.equal(results.b.value.page, 3); assert.ok(results.note.value.draft?.text.includes('Rascunho da mesa A.'));
      }
    }
  } finally { await app.close(); }
}
console.log('Mesa/UI real: duas matérias, notas/PDFs distintos, página trocada por botão e restaurada por matéria, rascunho preservado entre matérias e após reinicialização.');
