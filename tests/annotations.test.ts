import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { prepareFixture } from '../scripts/test-fixture';
import { Store } from '../src/main/store';
import { Desks } from '../src/main/desk';
import { Videos } from '../src/main/videos';
import { Annotations } from '../src/main/annotations';
import { exportImage } from '../src/main/export-images';
import { exportDestination } from '../src/main/export-destination';
import { clockSeconds, markCreateInput } from '../src/shared/study';
test('marcações vinculam versão/documento/matéria, preservam PDF e fazem rollback real; momentos persistem e remoção do vídeo limpa referências', () => {
    const f = prepareFixture('annotations-unit'), store = new Store(path.join(f.dir, 'data')), videos = new Videos(store), annotations = new Annotations(store, new Desks(store), videos), bytes = fs.readFileSync(f.pdfA), fingerprint = createHash('sha256').update(bytes).digest('hex');
    try {
        const input = { subjectId: f.a.id, materialId: f.materialA.id, fingerprint, noteId: f.noteA.ref.id, page: 2, x: .1, y: .1, width: .4, height: .2, color: 'gold' as const, comment: 'Uma ideia importante' }, mark = annotations.addMark(input);
        assert.equal(annotations.marks({ subjectId: input.subjectId, materialId: input.materialId, fingerprint }).marks[0].id, mark.id);
        assert.throws(() => annotations.addMark({ ...input, subjectId: f.b.id }));
        assert.throws(() => annotations.addMark({ ...input, noteId: f.noteB.ref.id }));
        assert.equal(markCreateInput.safeParse({ ...input, x: .9 }).success, false);
        store.db.exec("CREATE TRIGGER reject_mark BEFORE INSERT ON audit_events WHEN NEW.action='pdf.mark' BEGIN SELECT RAISE(ABORT,'fixture'); END");
        assert.throws(() => annotations.addMark(input));
        assert.equal(annotations.marks({ subjectId: input.subjectId, materialId: input.materialId, fingerprint }).marks.length, 1);
        store.db.exec('DROP TRIGGER reject_mark');
        assert.deepEqual(fs.readFileSync(f.pdfA), bytes);
        fs.appendFileSync(f.pdfA, '\n% external version');
        assert.throws(() => annotations.addMark(input));
        const current = createHash('sha256').update(fs.readFileSync(f.pdfA)).digest('hex');
        assert.deepEqual(annotations.marks({ subjectId: input.subjectId, materialId: input.materialId, fingerprint: current }), { marks: [], otherVersions: 1 });
        const video = videos.add({ subjectId: f.a.id, url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', title: 'Fixture pública' }), moment = annotations.addMoment({ subjectId: f.a.id, videoId: video.id, seconds: 75, text: 'Retomar conceito' });
        assert.equal(annotations.moment({ subjectId: f.a.id, videoId: video.id, id: moment.id }).seconds, 75);
        assert.throws(() => annotations.moment({ subjectId: f.b.id, videoId: video.id, id: moment.id }));
        assert.equal(clockSeconds('1:15'), 75);
        assert.equal(clockSeconds('1:90'), null);
        assert.equal(clockSeconds('25:00:00'), null);
        videos.remove({ subjectId: f.a.id, id: video.id });
        assert.equal(store.db.prepare('SELECT COUNT(*) n FROM video_moments').get()!.n, 0);
    }
    finally {
        store.close();
    }
});
test('imagens da exportação negam rede/traversal/links e dimensões antes do codec', () => {
    const dir = fs.mkdtempSync(path.resolve('.local/image-unit-')), outside = path.join(dir, 'outside.png'), root = path.join(dir, 'root');
    fs.mkdirSync(root);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(path.join(root, 'pixel.png'), png);
    fs.writeFileSync(outside, png);
    let calls = 0;
    const normalize = (b: Buffer) => { calls++; return b; };
    assert.deepEqual(exportImage(root, 'note.md', 'pixel.png', normalize), png);
    for (const source of ['../outside.png', '%2e%2e/outside.png', 'https://example.com/a.png', 'file:///C:/a.png', '\\host\\a.png', '.git/a.png'])
        assert.throws(() => exportImage(root, 'note.md', source, normalize));
    assert.equal(calls, 1);
    const oversized = Buffer.from(png);
    oversized.writeUInt32BE(5000, 16);
    fs.writeFileSync(path.join(root, 'big.png'), oversized);
    assert.throws(() => exportImage(root, 'note.md', 'big.png', normalize));
    assert.equal(calls, 1);
    const linked = path.join(dir, 'linked');
    fs.mkdirSync(linked);
    fs.writeFileSync(path.join(linked, 'pixel.png'), png);
    fs.symlinkSync(linked, path.join(root, 'link'), 'junction');
    assert.throws(() => exportImage(root, 'note.md', 'link/pixel.png', normalize));
});
test('destino PDF exige pasta canônica e rejeita junction/Git/arquivo/volume', () => { const dir = fs.mkdtempSync(path.resolve('.local/destination-unit-')); fs.mkdirSync(path.join(dir, '.git')); fs.writeFileSync(path.join(dir, 'file'), 'fixture'); assert.equal(exportDestination(dir), dir); for (const target of [path.join(dir, '.git'), path.join(dir, 'file'), path.parse(dir).root])
    assert.throws(() => exportDestination(target)); fs.symlinkSync(dir, path.join(path.dirname(dir), path.basename(dir) + '-link'), 'junction'); assert.throws(() => exportDestination(path.join(path.dirname(dir), path.basename(dir) + '-link'))); });
