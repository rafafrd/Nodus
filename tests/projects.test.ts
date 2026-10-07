import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Store } from '../src/main/store';
import { Projects } from '../src/main/projects';
import { Game } from '../src/main/game';

test('projetos reais: árvore, UTF-8/CRLF/BOM, edição seletiva, hash/conflito, draft/restart e backup', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/project-')), root = path.join(dir, 'example-project'); fs.mkdirSync(root); fs.mkdirSync(path.join(root, 'src'));
  const original = '\uFEFF// Projeto fictício de teste\r\nexport const valor = 1;\r\n'; fs.writeFileSync(path.join(root, 'src/main.ts'), original);
  let db = new Store(path.join(dir, 'data')), service = new Projects(db);
  try {
    const id = service.chooseRoot(root).projects[0].id, ref = { projectId: id, path: 'src/main.ts' }; assert.equal(service.chooseRoot(root).projects.length, 1);
    assert.equal(service.tree({ projectId: id, path: '' }).entries[0].kind, 'directory'); const open = service.open(ref); assert.equal(open.text, original);
    const edited = original.replace('= 1;', '= 2;'); const saved = service.save({ ...ref, hash: open.hash!, text: edited }); assert.equal(saved.state, 'saved'); assert.equal(fs.readFileSync(path.join(root, ref.path), 'utf8'), edited);
    const current = service.open(ref); service.draft({ ...ref, hash: current.hash!, text: edited + '// Rascunho\r\n' }); fs.writeFileSync(path.join(root, ref.path), edited + '// Externo\r\n');
    const conflict = service.save({ ...ref, hash: current.hash!, text: edited + '// Rascunho\r\n' }); assert.equal(conflict.state, 'conflict'); assert.ok(service.open(ref).draft!.text.includes('Rascunho')); assert.ok(fs.readFileSync(path.join(root, ref.path), 'utf8').includes('Externo'));
    service.view({ projectId: id, tabs: [ref], active: ref }); db.close(); db = new Store(path.join(dir, 'data')); service = new Projects(db); assert.equal(service.catalog().view.active!.path, ref.path); assert.ok(service.open(ref).draft!.text.includes('Rascunho'));
    service.discard(ref); assert.equal(service.open(ref).draft, null); assert.ok(fs.readdirSync(path.join(db.directory, 'project-recovery')).length >= 2);
    const last = service.open(ref); service.draft({ ...ref, hash: last.hash!, text: '// Recuperável\r\n' }); fs.unlinkSync(path.join(root, ref.path)); assert.equal(service.open(ref).missing, true); assert.equal(service.open(ref).draft!.text, '// Recuperável\r\n'); assert.throws(() => service.save({ ...ref, hash: last.hash!, text: '// Recuperável\r\n' }), /indisponível/);
  } finally { db.close(); }
});

test('projeto não escapa raiz/junction e rejeita binário, volume/argumentos/limite e falha de gravação conserva draft', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/project-boundary-')), root = path.join(dir, 'project'), outside = path.join(dir, 'outside'); fs.mkdirSync(root); fs.mkdirSync(outside); fs.writeFileSync(path.join(outside, 'private.txt'), 'fictício fora da raiz');
  fs.writeFileSync(path.join(root, 'file.txt'), 'original'); fs.writeFileSync(path.join(root, 'binary.bin'), Buffer.from([0, 1])); fs.writeFileSync(path.join(root, 'huge.txt'), Buffer.alloc(1024 * 1024 + 1, 65));
  fs.symlinkSync(outside, path.join(root, 'escape'), process.platform === 'win32' ? 'junction' : 'dir'); const db = new Store(path.join(dir, 'data')), p = new Projects(db), id = p.chooseRoot(root).projects[0].id;
  try {
    for (const relative of ['../outside/private.txt', 'C:/Windows/file', 'src\\file.txt', '.git/config', '.GIT/config', '.Git/config']) assert.throws(() => p.open({ projectId: id, path: relative }));
    assert.throws(() => p.open({ projectId: id, path: 'escape/private.txt' }), /Links/); assert.equal(p.tree({ projectId: id, path: '' }).entries.find(e => e.name === 'escape')!.kind, 'link');
    assert.throws(() => p.open({ projectId: id, path: 'binary.bin' }), /texto/); assert.throws(() => p.open({ projectId: id, path: 'huge.txt' }), /1 MiB/);
    fs.mkdirSync(path.join(root, '.git')); fs.writeFileSync(path.join(root, '.git/config'), 'fictício — metadado protegido');
    for (const alias of ['.GIT/config', '.Git/config', 'GIT~1/config']) if (fs.existsSync(path.join(root, alias))) { assert.throws(() => p.open({ projectId: id, path: alias })); assert.throws(() => p.save({ projectId: id, path: alias, hash: '0'.repeat(64), text: 'negado' })); }
    assert.equal(fs.readFileSync(path.join(root, '.git/config'), 'utf8'), 'fictício — metadado protegido');
    const ref = { projectId: id, path: 'file.txt' }, doc = p.open(ref); p.draft({ ...ref, hash: doc.hash!, text: 'rascunho anterior' });
    for (const text of ['texto\0inválido', '\uD800']) { assert.throws(() => p.save({ ...ref, hash: doc.hash!, text })); assert.throws(() => p.draft({ ...ref, hash: doc.hash!, text })); assert.equal(p.open(ref).draft!.text, 'rascunho anterior'); assert.equal(fs.readFileSync(path.join(root, ref.path), 'utf8'), 'original'); }
    db.db.exec("CREATE TRIGGER reject_project_audit BEFORE INSERT ON audit_events WHEN NEW.action='project.save' BEGIN SELECT RAISE(ABORT,'forced audit failure'); END;");
    assert.throws(() => p.save({ ...ref, hash: doc.hash!, text: 'edição recuperável' }), /audit failure/); assert.equal(p.open(ref).draft!.text, 'edição recuperável'); assert.equal(fs.readFileSync(path.join(root, 'file.txt'), 'utf8'), 'edição recuperável'); // FS/SQLite are not one atomic transaction.
    assert.equal(fs.readFileSync(path.join(outside, 'private.txt'), 'utf8'), 'fictício fora da raiz'); assert.ok(!fs.readdirSync(root).some(name => name.endsWith('.tmp')));
  } finally { db.close(); }
});

test('migração v2 para v6 conserva jogo existente sem duplicar crédito inicial', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/migration-v2-')); let db = new Store(dir,5), game = new Game(db); const row = db.db.prepare('SELECT state FROM game_player').get()!; const legacy = JSON.parse(String(row.state)); delete legacy.engine; delete legacy.challengeId; db.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(legacy));
  db.db.exec('DROP TABLE card_reviews; DROP TABLE flashcards; DROP TABLE pdf_marks; DROP TABLE video_moments; DROP TABLE note_links; ALTER TABLE desks DROP COLUMN video_id; ALTER TABLE desks DROP COLUMN material_view; DROP TABLE videos; DROP TABLE project_drafts; DROP TABLE project_folders; DROP TABLE game_challenges; PRAGMA user_version=2;'); db.close(); db = new Store(dir); game = new Game(db);
  try { assert.equal(game.get().coins, 60); assert.equal(game.get().engine.level, 0); assert.equal(db.db.prepare("SELECT count(*) n FROM game_ledger WHERE source='starter'").get()!.n, 1); assert.equal(db.db.prepare('PRAGMA user_version').get()!.user_version, 6); } finally { db.close(); }
});
