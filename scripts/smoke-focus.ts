import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import path from 'node:path';
import assert from 'node:assert/strict';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { execFile } from 'node:child_process';
const f = prepareFixture('focus-smoke'); const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
let id = '', beforeClose = 0, crashElapsed = 0; let crashId = '';
for (let pass = 0; pass < 3; pass++) {
  let terminated = false;
  const app = await electron.launch({ executablePath: electronPath, args: ['.', `--user-data-dir=${path.join(f.dir, 'data')}`], env });
  try {
    const page = await app.firstWindow();
    await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    await page.locator('canvas[data-rendered-page="2"]').waitFor();
    if (!pass) await page.getByRole('button', { name: 'Abrir foco', exact: true }).click();
    if (!pass) {
      await page.getByRole('spinbutton', { name: 'Minutos de foco' }).fill('1');
      await page.getByRole('button', { name: 'Iniciar foco', exact: true }).click();
      await page.getByRole('button', { name: 'Pausar foco', exact: true }).waitFor();
      await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].blur());
      await page.waitForTimeout(1100);
      await page.getByRole('button', { name: 'Pausar foco', exact: true }).click();
      const paused = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id); assert.ok(paused.ok);
      if (!paused.ok || !paused.value.session) throw Error('Sessão não criada');
      id = paused.value.session.id; assert.ok(paused.value.session.elapsedMs >= 1000 && paused.value.session.elapsedMs < 2500);
      await page.waitForTimeout(1000);
      const later = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id); assert.ok(later.ok && later.value.session?.elapsedMs === paused.value.session.elapsedMs);
      await page.getByRole('button', { name: 'Retomar foco', exact: true }).click(); await page.waitForTimeout(600);
      const current = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id); assert.ok(current.ok); if (current.ok) beforeClose = current.value.session!.elapsedMs;
      await page.screenshot({ path: '.local/evidence/focus.png' });
    } else if (pass === 1) {
      await page.getByRole('button', { name: 'Retomar foco', exact: true }).waitFor();
      const reopened = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id);
      assert.ok(reopened.ok && reopened.value.session?.id === id && reopened.value.session.state === 'paused');
      if (reopened.ok) assert.ok(reopened.value.session!.elapsedMs - beforeClose < 900);
      await page.getByRole('button', { name: 'Encerrar foco', exact: true }).click();
      const finished = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id); assert.ok(finished.ok && finished.value.session?.state === 'ended');
      await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
      await page.getByRole('spinbutton', { name: 'Minutos de foco' }).fill('1'); await page.getByRole('button', { name: 'Iniciar foco', exact: true }).click();
      await page.waitForTimeout(6300);
      const disk = new Store(path.join(f.dir, 'data')); const last = disk.db.prepare("SELECT id,elapsed_ms FROM focus_sessions WHERE state='running'").get();
      assert.ok(last && Number(last.elapsed_ms) >= 5000); crashId = String(last!.id); crashElapsed = Number(last!.elapsed_ms); disk.close();
      const pid = app.process().pid;
      if (!pid) throw Error('PID de teste indisponível');
      await new Promise<void>((resolve, reject) => execFile('taskkill.exe', ['/PID', String(pid), '/T', '/F'], error => error ? reject(error) : resolve()));
      terminated = true;
    } else {
      await page.getByText('Sessão recuperada no último checkpoint. O intervalo fechado não foi contado.', { exact: true }).waitFor();
      const recovered = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), f.a.id);
      assert.ok(recovered.ok && recovered.value.session?.id === crashId && recovered.value.session.elapsedMs === crashElapsed && recovered.value.session.state === 'paused');
    }
  } finally { if (!terminated) await app.close(); }
}
console.log('Foco/UI/SQLite reais: duração escolhida, janela sem foco, pausa sem crédito, mesmo ID ao retomar, fechamento pausado e recuperação após processo encerrado à força no checkpoint; nota/PDF preservados.');
