import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepareFixture } from './test-fixture';
const f = prepareFixture('checklist-smoke'); const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const packaged = process.argv.includes('--packaged');
let stepId = '';
for (let pass = 0; pass < 2; pass++) {
  const app = await electron.launch({ executablePath: packaged ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(packaged ? [] : ['.']), `--user-data-dir=${path.join(f.dir, 'data')}`], env });
  try {
    const page = await app.firstWindow(); await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    if (!pass) {
      await page.getByRole('textbox', { name: 'Nova tarefa', exact: true }).fill('Revisão A'); await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
      for (const text of ['Ler capítulo', 'Resolver exercício']) { await page.getByRole('textbox', { name: 'Nova etapa em Revisão A' }).fill(text); await page.getByRole('button', { name: 'Adicionar etapa em Revisão A' }).click(); }
      await page.getByRole('checkbox', { name: 'Concluir Ler capítulo' }).check(); await page.getByText('1 / 2 concluídas', { exact: true }).waitFor();
      await page.getByRole('checkbox', { name: 'Concluir Ler capítulo' }).uncheck(); await page.getByRole('checkbox', { name: 'Concluir Ler capítulo' }).check();
      await page.getByRole('button', { name: 'Editar Resolver exercício' }).click(); await page.getByRole('textbox', { name: 'Editar texto da etapa' }).fill('Praticar equações'); await page.getByRole('button', { name: 'Salvar etapa', exact: true }).click();
      await page.getByRole('button', { name: 'Retomar Praticar equações' }).click(); await page.locator('.next-action').filter({ hasText: 'Retomar: Praticar equações' }).waitFor();
      const state = await page.evaluate(subjectId => window.desktop.listTasks({ subjectId }), f.a.id); assert.ok(state.ok); if (state.ok) stepId = state.value[0].steps[1].id;
      await page.getByRole('button', { name: 'Matéria B', exact: true }).click(); await page.getByRole('textbox', { name: 'Nova tarefa', exact: true }).fill('Revisão B'); await page.getByRole('button', { name: 'Criar tarefa', exact: true }).click();
      await page.getByText('0 / 0 concluídas', { exact: true }).waitFor(); await page.getByRole('button', { name: 'Matéria A', exact: true }).click();
      await page.locator('.next-action').filter({ hasText: 'Retomar: Praticar equações' }).waitFor(); await page.screenshot({ path: '.local/evidence/checklist.png' });
    } else {
      await page.getByText('1 / 2 concluídas', { exact: true }).waitFor();
      const state = await page.evaluate(async subjectId => ({ tasks: await window.desktop.listTasks({ subjectId }), desk: await window.desktop.openDesk({ subjectId }) }), f.a.id);
      assert.ok(state.tasks.ok && state.desk.ok); if (state.tasks.ok && state.desk.ok) { assert.equal(state.tasks.value[0].steps[1].id, stepId); assert.equal(state.desk.value.nextStepId, stepId); }
      const invalid = await page.evaluate(input => window.desktop.updateStep({ ...input, done: false }), { subjectId: f.b.id, id: stepId }); assert.ok(!invalid.ok && invalid.code === 'INVALID_REFERENCE');
    }
  } finally { await app.close(); }
}
console.log('Checklist/UI/SQLite reais: duas matérias, duas etapas, marca/desmarca, renomeação sem mudar ID, contagem e próxima ação persistem ao reabrir; erro de associação não grava.');
