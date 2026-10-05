import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
const f = prepareFixture('annotations-ui'), data = path.join(f.dir, 'data'), original = fs.readFileSync(f.pdfA), source = fs.readFileSync(path.join(f.root, f.noteA.ref.path));
const destination=path.join(f.dir,'chosen-output');fs.mkdirSync(destination);const seed=new Store(data);seed.setSetting('pdfDestination',destination);seed.close();
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
fs.writeFileSync(path.join(f.root, f.a.id, 'pixel.png'), image);
fs.appendFileSync(path.join(f.root, f.noteA.ref.path), '\n\n![Imagem local identificada](pixel.png)\n');
const withImage = fs.readFileSync(path.join(f.root, f.noteA.ref.path));
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${data}`], env }), page = await app.firstWindow(), errors: string[] = [];
page.on('pageerror', e => errors.push(e.message));
async function guestUrl() { for (let i = 0; i < 100; i++) {
    const url = await app.evaluate(({ webContents }) => webContents.getAllWebContents().find(w => w.getURL().startsWith('https://www.youtube-nocookie.com/embed/'))?.getURL());
    if (url)
        return url;
    await page.waitForTimeout(100);
} return null; }
try {
    await app.evaluate(({ app }, dir) => { app.setPath('downloads', dir); }, f.dir);
    await page.getByRole('heading', { name: 'Nota A', exact: true }).waitFor();
    await page.waitForFunction(() => document.querySelector('canvas[data-rendered-page="2"]'));
    await page.getByRole('button', { name: 'Marcar área', exact: true }).click();
    const box = await page.locator('.pdf-mark-overlay').boundingBox();
    assert.ok(box);
    await page.mouse.move(box.x + box.width * .1, box.y + box.height * .1);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .7, box.y + box.height * .18, { steps: 8 });
    await page.mouse.up();
    await page.getByRole('textbox', { name: 'Comentário da marcação', exact: true }).fill('Trecho importante para revisar.');
    await page.getByRole('button', { name: 'Salvar marcação', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    await page.getByText('Trecho importante para revisar.', { exact: true }).waitFor();
    await page.screenshot({ path: '.local/evidence/expansion-pdf-marks.png' });
    assert.deepEqual(fs.readFileSync(f.pdfA), original);
    await page.getByRole('button', { name: 'Vídeos', exact: true }).click();
    await page.getByRole('button', { name: 'Salvar link do YouTube', exact: true }).click();
    await page.getByRole('textbox', { name: 'Link do YouTube', exact: true }).fill('https://youtu.be/M7lc1UVf-VE');
    await page.getByRole('textbox', { name: 'Título do vídeo', exact: true }).fill('Aula pública de demonstração');
    await page.getByRole('button', { name: 'Salvar link', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    await page.getByRole('textbox', { name: 'Tempo do momento', exact: true }).fill('1:15');
    await page.getByRole('textbox', { name: 'Anotação do momento', exact: true }).fill('Voltar à explicação.');
    await page.getByRole('button', { name: 'Guardar momento', exact: true }).click();
    await page.getByRole('button', { name: 'Abrir momento 1:15', exact: true }).waitFor();
    await page.screenshot({ path: '.local/evidence/expansion-video-moments.png' });
    await page.getByRole('button', { name: 'Abrir momento 1:15', exact: true }).click();
    await page.waitForFunction(() => !!document.querySelector('.video-surface'));
    const guest = await guestUrl();
    assert.ok(guest?.includes('start=75'));
    await page.getByRole('button', { name: 'Fechar player', exact: true }).click();
    await page.getByRole('button', { name: 'Abrir configurações', exact: true }).click();
    await page.getByRole('button', { name: 'Dados e app', exact: true }).click();
    await page.getByRole('combobox', { name: 'Nota individual para exportar', exact: true }).selectOption(f.noteA.ref.id);
    await page.getByRole('textbox', { name: 'Título da capa', exact: true }).fill('Vetores — meu caderno');
    await page.getByRole('checkbox', { name: 'Incluir imagens locais PNG/JPEG', exact: true }).check();
    await page.getByRole('button', { name: 'Exportar nota em PDF', exact: true }).click();
    await page.getByRole('textbox', { name: 'PDF exportado', exact: true }).waitFor();
    const output = await page.getByRole('textbox', { name: 'PDF exportado', exact: true }).inputValue();
    assert.ok(fs.readFileSync(output).subarray(0, 5).equals(Buffer.from('%PDF-')));
    assert.ok(!await page.getByText(/Imagem omitida na nota/).count());
    await page.getByRole('combobox',{name:'Destino do PDF',exact:true}).selectOption('selected');await page.getByRole('button',{name:'Exportar nota em PDF',exact:true}).click();await page.waitForFunction(()=>{const el=document.querySelector<HTMLInputElement>('[aria-label="PDF exportado"]');return el?.value.includes('chosen-output');});const selectedOutput=await page.getByRole('textbox',{name:'PDF exportado',exact:true}).inputValue();assert.ok(selectedOutput.startsWith(destination));assert.ok(fs.existsSync(selectedOutput));
    await page.screenshot({ path: '.local/evidence/expansion-rich-export.png' });
    assert.deepEqual(fs.readFileSync(path.join(f.root, f.noteA.ref.path)), withImage);
    assert.deepEqual(errors, []);
    fs.writeFileSync('.local/evidence/annotations-results.json', JSON.stringify({ date: new Date().toISOString(), fixture: f.dir, output,selectedOutput,nativePickerAutomated:false, guest, errors, originalNoteBytes: source.length, finalNoteBytes: withImage.length }, null, 2));
    console.log('Windows package: PDF mark/comment/note source intact; video moment UI→isolated embed start75; single-note black PDF with local image/custom cover. Native destination picker not automated.');
}
finally {
    await app.close();
}
