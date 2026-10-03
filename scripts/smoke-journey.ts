import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
import { Desks } from '../src/main/desk';
import { generatePdf } from './test-fixture';
fs.mkdirSync('.local', { recursive: true });
const dir = fs.mkdtempSync(path.resolve('.local/journey-')); const dataDir = path.join(dir, 'data'), root = path.join(dir, 'vault'); fs.mkdirSync(root);
const initial = new Store(dataDir); new Vault(initial).selectRoot(root); initial.close();
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
let ids: string[] = [], noteIds: string[] = [], materialIds: string[] = [], focusId = '', stepId = '', pausedElapsed = 0;
const reports: string[] = [];
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${dataDir}`], env });
  try {
    const page = await app.firstWindow(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.getByTestId('version').filter({ hasText: '0.1.0' }).waitFor();
    if (!pass) {
      for (const name of ['Matéria A', 'Matéria B']) { await page.getByRole('button', { name: 'Nova matéria', exact: true }).click(); await page.getByRole('textbox', { name: 'Nome da matéria' }).fill(name); await page.getByRole('button', { name: 'Criar matéria', exact: true }).click(); await page.getByRole('heading', { name, exact: true }).waitFor(); }
      const boot = await page.evaluate(() => window.desktop.bootstrap()); assert.ok(boot.ok); if (boot.ok) ids = boot.value.subjects.map(s => s.id); reports.push('R1 aprovado: duas matérias criadas pela UI.');
      for (let i = 0; i < 2; i++) {
        await page.getByRole('button', { name: `Matéria ${i ? 'B' : 'A'}`, exact: true }).click(); await page.getByRole('button', { name: 'Nova nota', exact: true }).click(); await page.getByRole('textbox', { name: 'Título da nota' }).fill(`Resumo ${i ? 'B' : 'A'}`); await page.getByRole('button', { name: 'Criar nota', exact: true }).click();
        await page.getByRole('heading', { name: `Resumo ${i ? 'B' : 'A'}`, exact: true, level: 2 }).waitFor();
        const refs = await page.evaluate(subjectId => window.desktop.listNotes({ subjectId }), ids[i]); assert.ok(refs.ok); if (!refs.ok) throw Error('Nota não criada'); noteIds[i] = refs.value[0].id;
        const opened = await page.evaluate(id => window.desktop.openNote({ id }), noteIds[i]); if (!opened.ok) throw Error('Nota não aberta');
        await page.getByRole('textbox', { name: 'Conteúdo da nota' }).fill(opened.value.text + `\nNotas de estudo da matéria ${i ? 'B' : 'A'}.\n\n` + fs.readFileSync('tests/fixtures/compatibility.md', 'utf8'));
        await page.getByRole('button', { name: 'Salvar nota', exact: true }).click(); await page.getByRole('status').filter({ hasText: 'Salvo no arquivo' }).waitFor();
        const fixtureFile = path.join(dir, `journey-${i}.pdf`); generatePdf(fixtureFile, `journey-${i}`);
        const db = new Store(dataDir); const desks = new Desks(db); const material = desks.choose(ids[i], fixtureFile); materialIds[i] = material.id; desks.save({ subjectId: ids[i], materialId: material.id, page: i ? 3 : 2, split: i ? 40 : 60 }); db.close();
        await page.getByRole('textbox', { name: 'Nova tarefa' }).fill(`Revisão ${i ? 'B' : 'A'}`); await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
        for (const step of ['Ler conteúdo', 'Resolver exercícios']) { await page.getByRole('textbox', { name: `Nova etapa em Revisão ${i ? 'B' : 'A'}` }).fill(step); await page.getByRole('button', { name: `Adicionar etapa em Revisão ${i ? 'B' : 'A'}` }).click(); }
        if (!i) { await page.getByRole('checkbox', { name: 'Concluir Ler conteúdo' }).check(); await page.getByRole('button', { name: 'Retomar Resolver exercícios' }).click(); }
      }
      await page.getByRole('button', { name: 'Matéria A', exact: true }).click(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
      const tasks = await page.evaluate(subjectId => window.desktop.listTasks({ subjectId }), ids[0]); if (tasks.ok) stepId = tasks.value[0].steps[1].id;
      await page.getByRole('button', { name: 'Abrir foco', exact: true }).click(); await page.getByRole('spinbutton', { name: 'Minutos de foco' }).fill('1'); await page.getByRole('button', { name: 'Iniciar foco', exact: true }).click(); await page.waitForTimeout(1000); await page.getByRole('button', { name: 'Pausar foco', exact: true }).click();
      const focus = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), ids[0]); if (!focus.ok || !focus.value.session) throw Error('Foco não persistido'); focusId = focus.value.session.id; pausedElapsed = focus.value.session.elapsedMs;
      reports.push('R2/R3/R4 aprovados: notas salvas, PDFs reais distintos/páginas 2 e 3, layouts 60 e 40, tarefas/etapas distintas e foco de 1 min pausado. PDFs vinculados pelos serviços reais de fixture; diálogo nativo não automatizado.');
      await page.screenshot({ path: '.local/evidence/mvp-journey.png' });
    } else {
      await page.getByRole('heading', { name: 'Resumo A', exact: true, level: 2 }).waitFor(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
      const states = await page.evaluate(async input => ({ a: await window.desktop.openDesk({ subjectId: input.ids[0] }), b: await window.desktop.openDesk({ subjectId: input.ids[1] }), tasks: await window.desktop.listTasks({ subjectId: input.ids[0] }), focus: await window.desktop.getFocus({ subjectId: input.ids[0] }) }), { ids });
      assert.ok(states.a.ok && states.b.ok && states.tasks.ok && states.focus.ok);
      if (states.a.ok && states.b.ok && states.focus.ok && states.tasks.ok) {
        assert.equal(states.a.value.noteId, noteIds[0]); assert.equal(states.b.value.noteId, noteIds[1]); assert.equal(states.a.value.materialId, materialIds[0]); assert.equal(states.b.value.materialId, materialIds[1]);
        assert.equal(states.a.value.page, 2); assert.equal(states.b.value.page, 3); assert.equal(states.a.value.split, 60); assert.equal(states.b.value.split, 40); assert.equal(states.a.value.nextStepId, stepId);
        assert.equal(states.tasks.value[0].steps[0].done, true); assert.equal(states.focus.value.session?.id, focusId); assert.equal(states.focus.value.session?.elapsedMs, pausedElapsed); assert.equal(states.focus.value.session?.state, 'paused');
      }
      reports.push('R5/R6 aprovados: executável fechado/reaberto, IDs/contextos/checklist/retomada e foco pausado sem crédito fechado.');
      const note = await page.evaluate(id => window.desktop.openNote({ id }), noteIds[0]); if (!note.ok) throw Error('Nota ausente');
      const file = path.join(root, ...note.value.ref.path.split('/')); const external = note.value.text + '\nEdição externa limpa.\n'; fs.writeFileSync(file, external);
      await page.getByRole('textbox', { name: 'Conteúdo da nota' }).press('Control+End');
      await page.waitForFunction(() => document.querySelector('.cm-content')?.textContent?.includes('Edição externa limpa.') || document.querySelector('.markdown-preview')?.textContent?.includes('Edição externa limpa.'));
      await page.getByRole('textbox', { name: 'Conteúdo da nota' }).fill(external + '\nMinha edição pendente.\n'); fs.writeFileSync(file, external + '\nNova versão externa.\n');
      await page.getByText('Arquivo alterado fora do app', { exact: true }).waitFor();
      const conflict = await page.evaluate(id => window.desktop.openNote({ id }), noteIds[0]); assert.ok(conflict.ok && conflict.value.draft?.text.includes('Minha edição pendente.') && conflict.value.text.includes('Nova versão externa.'));
      reports.push('R7 aprovado: atualização externa limpa e conflito conservaram duas versões na build empacotada.');
      await page.getByRole('button', { name: 'Matéria B', exact: true }).click(); await page.locator('canvas[data-rendered-page="3"]').waitFor();
      await page.setViewportSize({ width: 1040, height: 760 }); await page.screenshot({ path: '.local/evidence/mvp-compact.png' });
      const footer = await page.locator('.statusbar').boundingBox(); const height = await page.evaluate(() => innerHeight); assert.ok(footer && footer.y + footer.height <= height);
    }
    assert.deepEqual(errors, []);
  } finally { await app.close(); }
}
reports.push('R8 não verificado: nuvem/celular fora do MVP local, sem configuração/publicação.');
fs.writeFileSync('.local/evidence/journey-results.json', JSON.stringify({ date: new Date().toISOString(), build: 'App Estudos 0.1.0 win-unpacked', reports }, null, 2));
console.log(reports.join('\n'));
