import fs from 'node:fs';
import path from 'node:path';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
import { Desks } from '../src/main/desk';
export function generatePdf(file: string, label: string) {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>'];
  for (let i = 0; i < 3; i++) {
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 9 0 R >> >> /Contents ${4 + i * 2} 0 R >>`);
    const content = `BT /F1 22 Tf 60 720 Td (Test fixture ${label} - page ${i + 1}) Tj ET`;
    objects.push(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
  }
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  fs.writeFileSync(file, pdf);
}
export function prepareFixture(prefix: string) {
  fs.mkdirSync('.local', { recursive: true });
  const dir = fs.mkdtempSync(path.resolve(`.local/${prefix}-`)); const root = path.join(dir, 'vault'); fs.mkdirSync(root);
  const store = new Store(path.join(dir, 'data')); const vault = new Vault(store); const desks = new Desks(store); vault.selectRoot(root);
  const a = store.createSubject({ name: 'Matéria A', color: 'sage' }), b = store.createSubject({ name: 'Matéria B', color: 'blue' });
  const noteA = vault.create({ subjectId: a.id, title: 'Nota A' }), noteB = vault.create({ subjectId: b.id, title: 'Nota B' });
  const source = fs.readFileSync('tests/fixtures/compatibility.md', 'utf8');
  const savedA = vault.save({ id: noteA.ref.id, hash: noteA.hash, text: noteA.text + source });
  if (savedA.state !== 'saved') throw Error('Fixture não salva');
  const pdfA = path.join(dir, 'fixture-A.pdf'), pdfB = path.join(dir, 'fixture-B.pdf'); generatePdf(pdfA, 'A'); generatePdf(pdfB, 'B');
  const materialA = desks.choose(a.id, pdfA), materialB = desks.choose(b.id, pdfB);
  desks.save({ subjectId: a.id, noteId: noteA.ref.id, materialId: materialA.id, split: 60, page: 2, preview: false });
  desks.save({ subjectId: b.id, noteId: noteB.ref.id, materialId: materialB.id, split: 42, page: 3, preview: false });
  store.close(); return { dir, root, a, b, noteA: savedA.document, noteB, materialA, materialB, pdfA, pdfB };
}
