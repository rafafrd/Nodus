import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Checklist } from '../src/main/checklist';
const fixture = prepareFixture('expansion'), data = path.join(fixture.dir, 'data'), store = new Store(data), check = new Checklist(store);
const task = check.create(fixture.a.id, 'Revisar equações hoje');
check.add({ subjectId: fixture.a.id, taskId: task.id, text: 'Resolver uma questão' });
store.close();
const originals = [fixture.noteA.ref, fixture.noteB.ref].map(n => ({ file: path.join(fixture.root, n.path), bytes: fs.readFileSync(path.join(fixture.root, n.path)) }));
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${data}`], env }), page = await app.firstWindow(), errors: string[] = [];
page.on('pageerror', e => errors.push(e.message));
async function ready(area: string) { await page.waitForFunction(target => document.querySelector(`[data-area="${target}"]`)?.getAttribute('aria-hidden') === 'false' && document.querySelector('[data-testid=area-stage]')?.getAttribute('data-motion') === 'idle', area); }
try {
    await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    await page.keyboard.press('Control+k');
    await page.getByRole('textbox', { name: 'Busca global', exact: true }).fill('Matéria B');
    const hit = page.getByRole('option', { name: 'Matéria B Matéria', exact: true });
    await hit.waitFor();
    await page.screenshot({ path: '.local/evidence/expansion-search.png' });
    await hit.click();
    await page.getByRole('heading', { name: 'Matéria B', exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    await page.getByRole('button', { name: 'Matéria A', exact: true }).click();
    await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Criar flashcard do trecho', exact: true }).click();
    await ready('review');
    await page.getByRole('textbox', { name: 'Pergunta do flashcard', exact: true }).fill('Como descrever um vetor?');
    await page.getByRole('textbox', { name: 'Resposta do flashcard', exact: true }).fill('Direção e magnitude.');
    assert.equal(await page.getByRole('combobox', { name: 'Nota de origem do flashcard', exact: true }).inputValue(), fixture.noteA.ref.id);
    await page.getByRole('button', { name: 'Salvar flashcard', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    await page.getByRole('button', { name: 'Revelar resposta', exact: true }).click();
    await page.getByText('Direção e magnitude.', { exact: true }).waitFor();
    await page.screenshot({ path: '.local/evidence/expansion-review.png' });
    await page.getByRole('button', { name: 'Lembrei Intervalo normal', exact: true }).click();
    await page.getByRole('heading', { name: 'Tudo revisado por agora.', exact: true }).waitFor();
    const cards = await page.evaluate(() => window.desktop.listFlashcards({}));
    assert.ok(cards.ok);
    if (cards.ok) {
        assert.equal(cards.value.length, 1);
        assert.equal(cards.value[0].reviews, 1);
        assert.equal(cards.value[0].noteId, fixture.noteA.ref.id);
        assert.ok(cards.value[0].dueAt > Date.now());
    }
    await page.getByRole('button', { name: 'Abrir início', exact: true }).click();
    await ready('home');
    await page.locator('[data-area="home"]').getByText('Revisar equações hoje', { exact: true }).waitFor();
    await page.screenshot({ path: '.local/evidence/expansion-today.png' });
    await page.getByRole('button', { name: 'Retomar mesa', exact: false }).click();
    await ready('study');
    await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    const invalid = await page.evaluate(async () => [await window.desktop.createFlashcard({ subjectId: 'bad', noteId: null, question: 'Q', answer: 'A', excerpt: '' }), await window.desktop.globalSearch({ query: 'x', path: 'C:/outside' } as never)]);
    assert.ok(invalid.every(r => !r.ok));
    await page.keyboard.press('Control+k');
    await page.getByRole('textbox', { name: 'Busca global', exact: true }).fill('Criar nota');
    await page.getByRole('option', { name: 'Criar nota Ação do app', exact: true }).click();
    await page.getByRole('dialog', { name: 'Nova nota', exact: true }).waitFor();
    assert.equal(await page.locator('dialog[open]').count(), 1);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    const foreign = await app.evaluate(async ({ BrowserWindow }) => { const win = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } }); try {
        await win.loadURL('data:text/html,fixture');
        return await win.webContents.executeJavaScript("Promise.all([require('electron').ipcRenderer.invoke('study:catalog'),require('electron').ipcRenderer.invoke('card:list',{})])");
    }
    finally {
        win.destroy();
    } });
    assert.ok(foreign.every((r: any) => !r.ok && r.code === 'FORBIDDEN'));
    for (const original of originals)
        assert.deepEqual(fs.readFileSync(original.file), original.bytes);
    assert.deepEqual(errors, []);
    fs.writeFileSync('.local/evidence/expansion-results.json', JSON.stringify({ date: new Date().toISOString(), fixture: fixture.dir, packaged: true, cards, invalid, foreign, errors }, null, 2));
    console.log('Phase1 real UI/IPC/SQLite: CtrlK cross-subject, source flashcard/reveal/rating/due, Today/task/return, source bytes intact and sender/strict denied.');
}
finally {
    await app.close();
}
