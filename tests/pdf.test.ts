import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { prepareFixture, generatePdf } from '../scripts/test-fixture';
import { Store } from '../src/main/store';
import { Desks } from '../src/main/desk';
test('referência PDF autoriza apenas arquivo selecionado; ausente/inválido/relocalização preservam ID', () => {
  const f = prepareFixture('pdf-test'); const store = new Store(path.join(f.dir, 'data')); const desks = new Desks(store);
  try {
    assert.ok(Buffer.from(desks.read(f.materialA.id)).subarray(0, 8).toString().startsWith('%PDF-'));
    fs.renameSync(f.pdfA, path.join(f.dir, 'moved.pdf')); assert.throws(() => desks.read(f.materialA.id), /ausente/);
    const located = desks.choose(f.a.id, path.join(f.dir, 'moved.pdf'), f.materialA.id); assert.equal(located.id, f.materialA.id); assert.ok(desks.read(located.id).length > 100);
    fs.writeFileSync(path.join(f.dir, 'invalid.pdf'), 'isto não é um PDF'); const invalid = desks.choose(f.a.id, path.join(f.dir, 'invalid.pdf')); assert.throws(() => desks.read(invalid.id), /válido/);
    assert.throws(() => desks.choose(f.b.id, f.pdfB, f.materialA.id), /outra matéria/);
    const selectedFolder = path.join(f.dir, 'selected'), externalFolder = path.join(f.dir, 'external'); fs.mkdirSync(selectedFolder); fs.mkdirSync(externalFolder);
    generatePdf(path.join(selectedFolder, 'reference.pdf'), 'selected'); generatePdf(path.join(externalFolder, 'reference.pdf'), 'external');
    const linked = desks.choose(f.a.id, path.join(selectedFolder, 'reference.pdf'));
    fs.unlinkSync(path.join(selectedFolder, 'reference.pdf')); fs.rmdirSync(selectedFolder); fs.symlinkSync(externalFolder, selectedFolder, 'junction');
    assert.throws(() => desks.read(linked.id), /caminho/);
  } finally { store.close(); }
});
