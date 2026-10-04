import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { prepareFixture } from '../scripts/test-fixture';
import { Store } from '../src/main/store';
import { Vault } from '../src/main/vault';
import { Projects } from '../src/main/projects';
import { Study } from '../src/main/study';
import { Game } from '../src/main/game';
import { Backups } from '../src/main/backups';
test('snapshot real inclui WAL/drafts/fontes/projetos/PDF; restauração remapeia raízes e mantém originais e economia', () => {
    const f = prepareFixture('backup-unit'), store = new Store(path.join(f.dir, 'data')), docs = path.join(f.dir, 'documents');
    fs.mkdirSync(docs);
    const backups = new Backups(store, docs), project = path.join(f.dir, 'project');
    fs.mkdirSync(project);
    fs.mkdirSync(path.join(project, '.git'));
    fs.writeFileSync(path.join(project, '.git', 'config'), 'private repository');
    fs.writeFileSync(path.join(project, '.env'), 'FIXTURE_SECRET=not-a-real-token');
    fs.writeFileSync(path.join(project, 'readme.md'), 'Projeto inerte');
    const catalog = new Projects(store).chooseRoot(project), projectId = catalog.projects[0].id;
    new Vault(store).draft({ id: f.noteA.ref.id, hash: f.noteA.hash, text: f.noteA.text + '\nRascunho preservado' });
    const card = new Study(store).create({ subjectId: f.a.id, noteId: f.noteA.ref.id, question: 'Q', answer: 'A', excerpt: '' }), game = new Game(store);
    game.act({ operationId: randomUUID(), action: { kind: 'buy', item: 'fountain' } });
    const originals = [f.pdfA, path.join(f.root, f.noteA.ref.path), path.join(project, 'readme.md')].map(file => ({ file, bytes: fs.readFileSync(file) }));
    try {
        assert.ok(backups.preview().omissions.some(s => s.includes('.env')));
        const saved = backups.create();
        assert.ok(fs.existsSync(path.join(saved.path, 'profile', 'study.sqlite')));
        assert.ok(!fs.existsSync(path.join(saved.path, 'projects', projectId, '.env')));
        const restored = backups.restore(saved.id), copy = new Store(restored.profile);
        try {
            assert.equal(new Vault(copy).open(f.noteA.ref.id).draft!.text, f.noteA.text + '\nRascunho preservado');
            assert.equal(new Study(copy).cards()[0].id, card.id);
            assert.equal(new Game(copy).get().coins, 15);
            assert.ok(new Game(copy).get().owned.includes('fountain'));
            assert.equal(copy.setting('vault'), path.join(restored.path, 'vault'));
            assert.equal(copy.db.prepare('SELECT root FROM project_folders WHERE id=?').get(projectId)!.root, path.join(restored.path, 'projects', projectId));
            assert.deepEqual(fs.readFileSync(String(copy.db.prepare('SELECT path FROM materials WHERE id=?').get(f.materialA.id)!.path)), fs.readFileSync(f.pdfA));
        }
        finally {
            copy.close();
        }
        assert.equal(backups.restoredProfile(restored.id), restored.profile);
        for (const o of originals)
            assert.deepEqual(fs.readFileSync(o.file), o.bytes);
        assert.throws(() => backups.restore(randomUUID()));
        fs.appendFileSync(path.join(saved.path, 'vault', f.noteA.ref.path), 'tampered');
        assert.throws(() => backups.restore(saved.id));
        assert.throws(() => backups.select(saved.path));
        for (const o of originals)
            assert.deepEqual(fs.readFileSync(o.file), o.bytes);
    }
    finally {
        store.close();
    }
});
test('restore nega traversal/hash atualizado com schema malicioso/junction; audit falho remove só snapshot novo', () => {
    const f = prepareFixture('backup-hostile'), store = new Store(path.join(f.dir, 'data')), docs = path.join(f.dir, 'docs');
    fs.mkdirSync(docs);
    const backups = new Backups(store, docs), original = fs.readFileSync(f.pdfA);
    try {
        const saved = backups.create(), manifestPath = path.join(saved.path, 'snapshot.json'), m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        m.files[0].path = '../outside';
        fs.writeFileSync(manifestPath, JSON.stringify(m));
        assert.throws(() => backups.select(saved.path));
        const valid = backups.create(), dbFile = path.join(valid.path, 'profile', 'study.sqlite'), db = new DatabaseSync(dbFile);
        db.exec("CREATE TRIGGER malicious AFTER INSERT ON settings BEGIN DELETE FROM notes; END");
        db.close();
        const manifest = JSON.parse(fs.readFileSync(path.join(valid.path, 'snapshot.json'), 'utf8')), entry = manifest.files.find((x: any) => x.path === 'profile/study.sqlite'), bytes = fs.readFileSync(dbFile);
        entry.hash = createHash('sha256').update(bytes).digest('hex');
        entry.bytes = bytes.length;
        fs.writeFileSync(path.join(valid.path, 'snapshot.json'), JSON.stringify(manifest));
        const selected = backups.select(valid.path);
        assert.throws(() => backups.restore(selected.id));
        assert.deepEqual(fs.readdirSync(path.join(docs, 'NodusRestored')), []);
        const outside = path.join(f.dir, 'outside');
        fs.mkdirSync(outside);
        fs.symlinkSync(outside, path.join(f.root, 'junction'), 'junction');
        assert.ok(backups.preview().omissions.some(s => s.includes('junction')));
        store.db.exec("CREATE TRIGGER reject_backup BEFORE INSERT ON audit_events WHEN NEW.action='backup:create' BEGIN SELECT RAISE(ABORT,'fixture'); END");
        const before = fs.readdirSync(path.join(docs, 'NodusBackups'));
        assert.throws(() => backups.create());
        assert.deepEqual(fs.readdirSync(path.join(docs, 'NodusBackups')), before);
        store.db.exec('DROP TRIGGER reject_backup');
        assert.ok(backups.create());
        assert.deepEqual(fs.readFileSync(f.pdfA), original);
    }
    finally {
        store.close();
    }
});
test('decorações e ambiente usam preço/main/replay/audit sem inflação de XP ou redefinição de perfil', () => {
    const f = prepareFixture('cosmetics-unit'), store = new Store(path.join(f.dir, 'data')), game = new Game(store);
    try {
        const buy = { operationId: randomUUID(), action: { kind: 'buy' as const, item: 'fountain' as const } }, p = game.act(buy);
        assert.equal(p.state.coins, 15);
        assert.equal(game.act(buy).state.coins, 15);
        assert.throws(() => game.act({ ...buy, operationId: randomUUID() }));
        assert.throws(() => game.act({ operationId: randomUUID(), action: { kind: 'buy', item: 'greenhouse' } }));
        const changed = game.act({ operationId: randomUUID(), action: { kind: 'atmosphere', value: 'night' } });
        assert.equal(changed.state.atmosphere, 'night');
        assert.equal(changed.state.xp, 0);
        assert.equal(changed.state.coins, 15);
        store.db.exec("CREATE TRIGGER reject_atmosphere BEFORE INSERT ON audit_events WHEN NEW.action='game.atmosphere' BEGIN SELECT RAISE(ABORT,'fixture'); END");
        assert.throws(() => game.act({ operationId: randomUUID(), action: { kind: 'atmosphere', value: 'dawn' } }));
        assert.equal(game.get().atmosphere, 'night');
        assert.throws(() => game.act({ operationId: randomUUID(), action: { kind: 'buy', item: 'benches', price: 0 } as never }));
    }
    finally {
        store.close();
    }
});
