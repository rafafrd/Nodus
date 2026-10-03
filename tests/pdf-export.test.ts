import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { collectExportNotes, exportFolder, exportFolders, EXPORT_LIMITS } from '../src/main/export-notes';
import { exportDocument } from '../src/main/pdf-document';
import { pdfExportInput, pdfSourceInput } from '../src/shared/pdf-export';
import { savePdfOutput } from '../src/main/export-output';
import { Store } from '../src/main/store';
const fixture = () => fs.mkdtempSync(path.resolve('.local/export-unit-'));
test('exportação lê Markdown/subpastas em ordem, remove metadata da cópia e não altera fonte; links/auxiliares excluídos', () => {
  const root = fixture(), outside = fixture(); fs.mkdirSync(path.join(root,'capítulos')); fs.mkdirSync(path.join(root,'.git'));
  const source = '\uFEFF---\r\nstudy_id: fixture\r\nunknown: keep\r\n---\r\n# Ação e revisão\r\n\r\n**Conteúdo** $x^2$\r\n';
  fs.writeFileSync(path.join(root,'2.MD'),source); fs.writeFileSync(path.join(root,'10.md'),'# Dez\n'); fs.writeFileSync(path.join(root,'capítulos','resumo.md'),'# Capítulo\n'); fs.writeFileSync(path.join(root,'.git','private.md'),'private');
  fs.writeFileSync(path.join(outside,'outside.md'),'outside'); fs.symlinkSync(outside,path.join(root,'atalho'),'junction'); fs.writeFileSync(path.join(root,'example.ts'),'source inerte');
  const book=collectExportNotes(root); assert.deepEqual(book.notes.map(n=>n.path),['2.MD','10.md','capítulos/resumo.md']); assert.equal(book.skipped,2); assert.equal(book.notes[0].title,'Ação e revisão'); assert.ok(book.notes[0].body.includes('$x^2$')); assert.ok(!book.notes[0].body.includes('study_id'));
  assert.equal(fs.readFileSync(path.join(root,'2.MD'),'utf8'),source); assert.equal(fs.readFileSync(path.join(outside,'outside.md'),'utf8'),'outside'); assert.deepEqual(exportFolders(root),['','capítulos']);
  for(const relative of ['../outside','C:/outside','capítulos\\resumo.md','capítulos//resumo.md','.git','atalho','2.MD']) assert.throws(()=>exportFolder(root,relative));
});
test('contratos/pastas vazias/encoding/limites de nota, total e quantidade rejeitam sem modificar fonte', () => {
  for(const bad of [{source:'vault',folder:'',path:'C:/outside'},{source:'project',projectId:'invalid',folder:''},{source:'remote',folder:''}]) assert.equal(pdfExportInput.safeParse(bad).success,false);
  assert.equal(pdfSourceInput.safeParse({source:'vault',folder:''}).success,false);
  const empty=fixture(); assert.throws(()=>collectExportNotes(empty));
  const root=fixture(), note=path.join(root,'bad.md');
  for(const bytes of [Buffer.from([0xc3,0x28]),Buffer.from('text\0'),Buffer.alloc(EXPORT_LIMITS.fileBytes+1,65)]) {fs.writeFileSync(note,bytes);assert.throws(()=>collectExportNotes(root));assert.deepEqual(fs.readFileSync(note),bytes);}
  const many=fixture();for(let i=0;i<=EXPORT_LIMITS.notes;i++)fs.writeFileSync(path.join(many,`${i}.md`),'note');assert.throws(()=>collectExportNotes(many));
  const total=fixture();for(let i=0;i<4;i++)fs.writeFileSync(path.join(total,`${i}.md`),'a'.repeat(EXPORT_LIMITS.fileBytes));assert.throws(()=>collectExportNotes(total));
});
test('template escapa títulos/paths e torna HTML, imagens e links de Markdown inertes; formatação GFM permanece', () => {
  const html=exportDocument({title:'<img src=x onerror=alert(1)>',skipped:0,notes:[{path:'<script>.md',title:'<script>evil</script>',body:'# Conteúdo\n\n<script>alert(1)</script>\n\n![Figura](https://outside.test/a.png)\n\n[link](file:///C:/outside)\n\n| Coluna | Valor |\n|---|---|\n| A | **B** |\n\n```js\nconst x = "<img>";\n```'}]});
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img ')); assert.ok(!html.includes('src="https:')); assert.ok(!html.includes('href="file:')); assert.ok(html.includes('&lt;script&gt;evil')); assert.ok(html.includes('<table>')); assert.ok(html.includes('<strong>B</strong>')); assert.ok(html.includes('<pre>')); assert.ok(html.includes('background:#000')); assert.ok(html.includes("script-src &#x27;none&#x27;"));
});

test('arquivo novo exige audit opaco de sucesso; falha SQLite real remove apenas a saída nova', () => {
  const root=fixture(), downloads=path.join(root,'downloads'), store=new Store(path.join(root,'data'));
  const bytes=Buffer.from('%PDF-1.4\nfixture identificada, não prova de impressão');
  try {
    const first=savePdfOutput(store,downloads,'Título privado',bytes);
    const event=store.db.prepare("SELECT * FROM audit_events WHERE action='pdf:export'").get()!;
    assert.equal(event.outcome,'ok');assert.match(String(event.entity_id),/^[0-9a-f-]{36}$/);assert.ok(!JSON.stringify(event).includes('Título privado'));assert.ok(!JSON.stringify(event).includes(downloads));
    store.db.exec("CREATE TRIGGER reject_export_audit BEFORE INSERT ON audit_events WHEN NEW.action='pdf:export' BEGIN SELECT RAISE(ABORT,'fixture audit failure'); END");
    assert.throws(()=>savePdfOutput(store,downloads,'Outro título',bytes));
    assert.deepEqual(fs.readdirSync(downloads),[path.basename(first)]);assert.deepEqual(fs.readFileSync(first),bytes);
    assert.equal(store.db.prepare("SELECT COUNT(*) n FROM audit_events WHERE action='pdf:export'").get()!.n,1);
    store.db.exec('DROP TRIGGER reject_export_audit');
    const second=savePdfOutput(store,downloads,'Título privado',bytes);assert.notEqual(first,second);assert.equal(fs.readdirSync(downloads).length,2);
  } finally {store.close();}
});
