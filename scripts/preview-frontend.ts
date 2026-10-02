import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import electronPath from 'electron';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
import { Desks } from '../src/main/desk';
import { Checklist } from '../src/main/checklist';
import { Focus } from '../src/main/focus';

// All content below is an explicit demonstration fixture, stored only in .local.
const stage = process.argv.find(v => /^--stage=[a-z0-9-]+$/.test(v))?.split('=')[1] ?? 'current';
fs.mkdirSync('.local/evidence', { recursive: true });
const directory = fs.mkdtempSync(path.resolve('.local/frontend-preview-'));
const data = path.join(directory, 'data'), root = path.join(directory, 'vault'); fs.mkdirSync(root);
const store = new Store(data), vault = new Vault(store), desks = new Desks(store), checklist = new Checklist(store); vault.selectRoot(root);
const subject = store.createSubject({ name: 'Álgebra Linear', color: 'sage' });
store.createSubject({ name: 'Algoritmos', color: 'blue' }); store.createSubject({ name: 'Física', color: 'amber' });
const doc = vault.create({ subjectId: subject.id, title: 'Vetores e transformações' });
vault.save({ id: doc.ref.id, hash: doc.hash, text: doc.text + 'Uma transformação linear muda os vetores, mas conserva a estrutura do espaço. Antes de calcular, vale enxergar o que acontece.\n\n> Entender a geometria dá sentido à conta.\n\n## O que observar\n\n- **Direção:** para onde o vetor passa a apontar.\n- **Comprimento:** quanto ele aumenta ou diminui.\n- **Base:** como os vetores de referência são transformados.\n\n## Da ideia à matriz\n\nAs colunas da matriz mostram o destino dos vetores da base. Cada vetor pode ser reconstruído como uma combinação dessas colunas.\n\n```text\nT(v) = A · v\nv = (2, 1)\n```\n\n## Para a próxima revisão\n\nExplicar com um desenho a diferença entre rotação e escala. Depois, resolver os exercícios 1 a 3 sem consultar o exemplo.\n\n---\n\nAmostra demonstrativa — nenhum dado pessoal.\n' });
vault.create({ subjectId: subject.id, title: 'Bases e independência linear' }); vault.create({ subjectId: subject.id, title: 'Exercícios da semana' });
const task = checklist.create(subject.id, 'Revisão de transformações');
const step = checklist.add({ subjectId: subject.id, taskId: task.id, text: 'Revisar o conceito de base' }); checklist.update({ subjectId: subject.id, id: step.id, done: true });
const next = checklist.add({ subjectId: subject.id, taskId: task.id, text: 'Resolver exercícios 1 a 3' });
checklist.add({ subjectId: subject.id, taskId: task.id, text: 'Desenhar rotação e escala' });
const pdfPath = path.join(directory, 'Transformações lineares.pdf');
const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R 6 0 R 8 0 R] /Count 3 >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
const t = (x: number, y: number, size: number, text: string) => `BT /F1 ${size} Tf ${x} ${y} Td (${text.replace(/[\\()]/g, v => '\\' + v)}) Tj ET\n`;
for (let i = 0; i < 3; i++) {
  const stream = '0.98 0.98 0.96 rg 0 0 595 842 re f\n0.22 0.28 0.19 rg\n' + t(45, 785, 10, 'CADERNO DE ESTUDO / ALGEBRA LINEAR') + '0.76 0.80 0.71 RG 45 764 m 550 764 l S\n' + t(45, 712, 27, ['Vetores no plano', 'Transformacoes lineares', 'Da geometria a matriz'][i]) + t(45, 679, 11, 'Uma ideia, duas representacoes.') + t(45, 624, 15, '01 / Observe a direcao') + t(45, 599, 11, 'A transformacao leva cada vetor a uma nova posicao.') + '0.87 0.89 0.83 rg 45 303 505 240 re f\n0.65 0.70 0.59 RG 95 358 m 95 501 l S 75 383 m 505 383 l S\n0.31 0.42 0.22 RG 2 w 95 383 m 305 478 l S 305 478 m 288 477 l S 305 478 m 296 463 l S\n0.31 0.42 0.22 rg\n' + t(322, 475, 14, 'v = (2, 1)') + t(114, 327, 10, 'O vetor descreve direcao e comprimento.') + t(45, 250, 15, '02 / Escreva a transformacao') + t(45, 222, 12, 'T(v) = A . v') + t(45, 185, 11, 'As colunas de A mostram o destino dos vetores da base.') + t(45, 64, 9, 'AMOSTRA DEMONSTRATIVA - NENHUM DADO PESSOAL') + t(523, 64, 10, `${i + 1} / 3`);
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + i * 2} 0 R >>`, `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`);
}
let pdf = '%PDF-1.4\n'; const offsets = [0];
objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
const xref = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`; fs.writeFileSync(pdfPath, pdf);
const material = desks.choose(subject.id, pdfPath);
const focus = new Focus(store); const session = focus.start(subject.id, 25).session!; focus.act({ subjectId: subject.id, id: session.id, action: 'pause' });
desks.save({ subjectId: subject.id, noteId: doc.ref.id, materialId: material.id, page: 2, split: 52, preview: true, tool: 'both', nextStepId: next.id }); store.close();
const canonical = fs.readFileSync(path.join(root, doc.ref.path), 'utf8');
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: process.argv.includes('--packaged') ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(process.argv.includes('--packaged') ? [] : ['.']), `--user-data-dir=${data}`], env });
try {
  const page = await app.firstWindow(); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.getByRole('heading', { name: subject.name, exact: true }).waitFor(); await page.locator('canvas[data-rendered-page="2"]').waitFor();
  await page.getByText('Entender a geometria dá sentido à conta.', { exact: true }).waitFor();
  await page.screenshot({ path: `.local/evidence/frontend-${stage}-desk.png` });
  if (!process.argv.includes('--desk-only')) {
    await page.getByRole('button', { name: 'Ajustar página', exact: true }).click();
    await page.waitForFunction(async () => {
      const canvas = document.querySelector('.pdf-scroll canvas'), panel = document.querySelector('.pdf-scroll');
      if (!canvas || !panel) return false;
      const size = `${canvas.clientWidth}:${canvas.clientHeight}`;
      for (let i = 0; i < 4; i++) {
        if (canvas.getAttribute('data-rendered-page') !== '2' || document.querySelector('.pdf-loading') || canvas.clientHeight <= 0 || canvas.clientHeight > panel.clientHeight - 37 || size !== `${canvas.clientWidth}:${canvas.clientHeight}`) return false;
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      return true;
    });
    await page.screenshot({ path: `.local/evidence/frontend-${stage}-pdf-fit.png` });
    await page.getByRole('button', { name: 'Ajustar largura', exact: true }).click();
    await page.getByRole('button', { name: 'Só caderno', exact: true }).click();
    assert.equal(await page.locator('.sidebar').isVisible(), false); await page.screenshot({ path: `.local/evidence/frontend-${stage}-reading.png` });
    await page.keyboard.press('Escape'); assert.equal(await page.locator('.sidebar').isVisible(), true);
    await page.locator('canvas[data-rendered-page="2"]').waitFor();
    const restored = await page.evaluate(subjectId => window.desktop.openDesk({ subjectId }), subject.id); assert.ok(restored.ok && restored.value.materialId === material.id && restored.value.noteId === doc.ref.id && restored.value.page === 2 && restored.value.split === 52 && restored.value.tool === 'both');
    await page.keyboard.press('Alt+2'); await page.getByText('Revisão de transformações', { exact: true }).waitFor();
    await page.screenshot({ path: `.local/evidence/frontend-${stage}-checklist.png` });
    await page.getByRole('button', { name: 'Editar', exact: true }).click();
    const source = await page.evaluate(id => window.desktop.openNote({ id }), doc.ref.id); assert.ok(source.ok && source.value.ref.id === doc.ref.id && source.value.text === canonical);
    await page.screenshot({ path: `.local/evidence/frontend-${stage}-editor.png` });
    await page.setViewportSize({ width: 1040, height: 760 });
    await page.keyboard.press('Alt+3'); await page.locator('.module-grid .focus-module').waitFor();
    await page.locator('canvas[data-rendered-page="2"]').waitFor();
    const bounds = await page.locator('.statusbar').boundingBox(); assert.ok(bounds && bounds.y + bounds.height <= 760);
    for (const selector of ['.note-panel', '.document-panel', '.focus-module', '.tool-panel']) {
      const panel = await page.locator(selector).boundingBox(); assert.ok(panel && panel.height > 200 && panel.y + panel.height <= bounds!.y);
    }
    await page.screenshot({ path: `.local/evidence/frontend-${stage}-compact.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Algoritmos', exact: true }).click(); await page.getByRole('heading', { name: 'Ideias que ficam.' }).waitFor();
    await page.keyboard.press('Alt+1'); await page.getByRole('button', { name: '15 min', exact: true }).click();
    assert.equal(await page.getByRole('spinbutton', { name: 'Minutos de foco' }).inputValue(), '15');
    await page.getByRole('button', { name: 'Iniciar foco', exact: true }).click(); await page.getByRole('button', { name: 'Pausar foco', exact: true }).click();
    const chosen = await page.evaluate(() => window.desktop.bootstrap()); assert.ok(chosen.ok);
    if (chosen.ok) { const id = chosen.value.subjects.find(s => s.name === 'Algoritmos')!.id; const active = await page.evaluate(subjectId => window.desktop.getFocus({ subjectId }), id); assert.ok(active.ok && active.value.session?.durationMs === 15 * 60000 && active.value.session.state === 'paused'); }
    await page.getByRole('button', { name: 'Nova matéria', exact: true }).click(); await page.getByRole('dialog').waitFor();
    await page.screenshot({ path: `.local/evidence/frontend-${stage}-modal.png` }); await page.keyboard.press('Escape');
    await page.getByRole('button', { name: subject.name, exact: true }).click();
    await page.locator('.module-grid .focus-module').waitFor();
    await page.getByRole('button', { name: 'Leitura', exact: true }).click();
    await page.getByText('Entender a geometria dá sentido à conta.', { exact: true }).waitFor();
    assert.equal(fs.readFileSync(path.join(root, doc.ref.path), 'utf8'), canonical);
  }
  assert.deepEqual(errors, []);
  console.log(`Frontend ${stage}: capturas reais em .local/evidence/frontend-${stage}-*.png; dados fictícios isolados em ${directory}.`);
} finally { await app.close(); }
if (!process.argv.includes('--desk-only')) {
  const reopened = await electron.launch({ executablePath: process.argv.includes('--packaged') ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(process.argv.includes('--packaged') ? [] : ['.']), `--user-data-dir=${data}`], env });
  try {
    const page = await reopened.firstWindow();
    await page.getByRole('heading', { name: subject.name, exact: true }).waitFor();
    await page.locator('.module-grid .focus-module').waitFor();
    await page.locator('canvas[data-rendered-page="2"]').waitFor();
    await page.locator('.next-action').filter({ hasText: 'Retomar: Resolver exercícios 1 a 3' }).waitFor();
    const restored = await page.evaluate(subjectId => window.desktop.openDesk({ subjectId }), subject.id);
    assert.ok(restored.ok && restored.value.tool === 'both' && restored.value.noteId === doc.ref.id && restored.value.materialId === material.id && restored.value.page === 2 && restored.value.split === 52 && restored.value.preview && restored.value.nextStepId === next.id);
    await page.screenshot({ path: `.local/evidence/frontend-${stage}-reopened.png` });
    console.log('Grade restaurada após fechar/reabrir: nota, PDF, página, proporção, leitura e próxima ação preservados.');
  } finally { await reopened.close(); }
  const empty = fs.mkdtempSync(path.resolve('.local/frontend-empty-'));
  const firstUse = await electron.launch({ executablePath: process.argv.includes('--packaged') ? path.resolve('release/win-unpacked/App Estudos.exe') : electronPath, args: [...(process.argv.includes('--packaged') ? [] : ['.']), `--user-data-dir=${empty}`], env });
  try { const page = await firstUse.firstWindow(); await page.getByRole('button', { name: /Criar primeira matéria/ }).waitFor(); await page.screenshot({ path: `.local/evidence/frontend-${stage}-welcome.png` }); }
  finally { await firstUse.close(); }
  fs.writeFileSync(`.local/evidence/frontend-${stage}-result.json`, JSON.stringify({ stage, packaged: process.argv.includes('--packaged'), platform: process.platform, directory, checks: ['PDF ajustado à altura', 'Só caderno/Esc sem alteração da mesa', 'Fonte Markdown idêntica', 'Grade compacta com painéis/rodapé dentro da janela', 'Foco de 15 min iniciado/pausado pelo serviço real', 'Redução de movimento', 'Grade persistida após reabertura', 'Primeiro uso real sem dados'], result: 'passed' }, null, 2));
}
