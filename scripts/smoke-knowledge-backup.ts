import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron, chromium } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
const f = prepareFixture('knowledge-ui'), data = path.join(f.dir, 'data'), docs = path.join(f.dir, 'documents');
fs.mkdirSync(docs);
const store = new Store(data), extra = new Vault(store).create({ subjectId: f.a.id, title: 'Vetores e relações' });
store.close();
const original = [path.join(f.root, f.noteA.ref.path), f.pdfA].map(file => ({ file, bytes: fs.readFileSync(file) }));
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${data}`], env }), page = await app.firstWindow(), errors: string[] = [];
page.on('pageerror', e => errors.push(e.message));
let child: Awaited<ReturnType<typeof chromium.connectOverCDP>> | null = null, restarted = false;
async function area(name: string) { await page.waitForFunction(name => document.querySelector(`[data-area="${name}"]`)?.getAttribute('aria-hidden') === 'false' && document.querySelector('[data-testid=area-stage]')?.getAttribute('data-motion') === 'idle', name); }
try {
    await app.evaluate(({ app }, dir) => app.setPath('documents', dir), docs);
    await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Abrir grafo', exact: true }).click();
    await area('graph');
    await page.getByTestId('graph-canvas').waitFor();
    await page.getByRole('combobox', { name: 'Nota de origem da relação', exact: true }).selectOption(f.noteA.ref.id);
    await page.getByRole('combobox', { name: 'Nota de destino da relação', exact: true }).selectOption(extra.ref.id);
    await page.getByRole('textbox', { name: 'Nome da relação', exact: true }).fill('Usa conceito');
    await page.getByRole('button', { name: 'Conectar notas', exact: true }).click();
    await page.getByRole('button', { name: 'Excluir relação Usa conceito', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Selecionar nó Vetores e relações', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid=graph-canvas]')?.getAttribute('data-camera') === 'idle');
    await page.screenshot({ path: '.local/evidence/expansion-graph.png' });
    await page.getByRole('button', { name: 'Abrir no caderno', exact: false }).click();
    await area('study');
    await page.getByRole('heading', { name: 'Vetores e relações', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Entrar na cidade', exact: true }).click();
    await area('city');
    await page.getByRole('button', { name: 'Melhorar motor', exact: true }).click();
    await page.getByRole('button', { name: 'Gerar moedas', exact: true }).waitFor();
    for (let i = 0; i < 40; i++) {
        await page.getByRole('button', { name: 'Gerar moedas', exact: true }).click();
        await page.waitForTimeout(330);
    }
    await page.getByRole('button', { name: 'Mercado', exact: true }).click();
    for (const name of ['Fonte do jardim', 'Bancos do jardim', 'Estufa de vidro']) {
        await page.getByRole('button', { name: `Comprar ${name}`, exact: true }).click();
        await page.getByRole('button', { name: `Comprar ${name}`, exact: true }).waitFor({ state: 'visible' });
    }
    await page.getByRole('button', { name: 'Noite', exact: true }).click();
    await page.waitForTimeout(600);
    const game = await page.evaluate(() => window.desktop.getGame());
    assert.ok(game.ok);
    if (game.ok) {
        assert.equal(game.value.atmosphere, 'night');
        assert.ok(['fountain', 'benches', 'greenhouse'].every(id => game.value.owned.includes(id as never)));
        assert.equal(game.value.engine.clicks, 40);
    }
    await page.screenshot({ path: '.local/evidence/expansion-city-night.png' });
    await page.getByRole('button', { name: 'Abrir configurações', exact: true }).click();
    await area('settings');
    await page.getByRole('button', { name: 'Dados e app', exact: true }).click();
    await page.getByRole('button', { name: 'Conferir prévia do backup', exact: true }).click();
    await page.getByRole('button', { name: 'Criar backup agora', exact: true }).click();
    await page.getByRole('textbox', { name: 'Backup criado', exact: true }).waitFor();
    const snapshot = await page.getByRole('textbox', { name: 'Backup criado', exact: true }).inputValue();
    assert.ok(snapshot.startsWith(docs));
    await page.getByRole('button', { name: 'Restaurar em uma cópia', exact: true }).click();
    await page.getByRole('textbox', { name: 'Pasta restaurada', exact: true }).waitFor();
    const restored = await page.getByRole('textbox', { name: 'Pasta restaurada', exact: true }).inputValue();
    assert.ok(restored.startsWith(docs));
    await page.screenshot({ path: '.local/evidence/expansion-backup.png' });
    for (const o of original)
        assert.deepEqual(fs.readFileSync(o.file), o.bytes);
    const foreign = await app.evaluate(async ({ BrowserWindow }) => { const w = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } }); try {
        await w.loadURL('data:text/html,fixture');
        return await w.webContents.executeJavaScript("Promise.all([require('electron').ipcRenderer.invoke('backup:create'),require('electron').ipcRenderer.invoke('backup:activate',{id:'00000000-0000-4000-8000-000000000000'}),require('electron').ipcRenderer.invoke('mark:list',{})])");
    }
    finally {
        w.destroy();
    } });
    assert.ok(foreign.every((r: any) => !r.ok && r.code === 'FORBIDDEN'));
    const faultStore=new Store(data);faultStore.db.exec("CREATE TRIGGER deny_activation BEFORE INSERT ON audit_events WHEN NEW.action='backup:activate' BEGIN SELECT RAISE(ABORT,'fixture activation audit failure'); END");const rejected=await page.evaluate(id=>window.desktop.activateRestore({id}),path.basename(restored));assert.ok(!rejected.ok);assert.equal(app.process().exitCode,null);faultStore.db.exec('DROP TRIGGER deny_activation');faultStore.close();
    const profile = path.join(restored, 'profile'), closing = app.waitForEvent('close', { timeout: 30000 });
    await page.getByRole('button', { name: 'Abrir cópia restaurada', exact: true }).click();
    await closing;
    restarted = true;
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 150 && !fs.existsSync(portFile); i++)
        await new Promise(r => setTimeout(r, 100));
    assert.ok(fs.existsSync(portFile), 'Relaunch criou DevToolsActivePort no perfil da cópia');
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    child = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    const restoredPage = child.contexts()[0].pages().find(p => p.url().startsWith('study://app/'))!;
    assert.ok(restoredPage);
    await restoredPage.getByRole('heading', { name: 'Vetores e relações', exact: true }).waitFor();
    const management = await restoredPage.evaluate(() => window.desktop.getAppManagement());
    assert.ok(management.ok);
    if (management.ok) {
        assert.equal(management.value.dataDirectory, profile);
        assert.equal(management.value.vault, path.join(restored, 'vault'));
    }
    const links = await restoredPage.evaluate(subjectId => window.desktop.noteLinks({ subjectId }), f.a.id);
    assert.ok(links.ok && links.value.length === 1);
    const restoredGame = await restoredPage.evaluate(() => window.desktop.getGame());
    assert.ok(restoredGame.ok && restoredGame.value.atmosphere === 'night');
    await restoredPage.screenshot({ path: '.local/evidence/expansion-restored.png' });
    await restoredPage.evaluate(() => window.desktop.finishClose());
    for (const o of original)
        assert.deepEqual(fs.readFileSync(o.file), o.bytes);
    assert.deepEqual(errors, []);
    fs.writeFileSync('.local/evidence/knowledge-backup-results.json', JSON.stringify({ date: new Date().toISOString(), fixture: f.dir, snapshot, restored, game, foreign, management, links, relaunch: true, errors }, null, 2));
    console.log('Windows real graph/GSAP/source; city 40 real engine pulses/upgrades/3 purchases/night; backup UI→hashes/schema clone→actual app.relaunch/CDP verified restored profile and preserved originals.');
}
finally {
    if (!restarted)
        await app.close();
    if (child)
        await child.close().catch(() => { });
}
