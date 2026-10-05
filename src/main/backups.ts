import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { Store } from './store';
import { AppError } from '../shared/contracts';
import { backupPath, snapshotManifest, type SnapshotManifest, type BackupPreview, type BackupReceipt, type RestoreReceipt } from '../shared/backup';
const MAX_FILE = 100 * 1024 * 1024, MAX_TOTAL = 300 * 1024 * 1024, MAX_FILES = 5000;
const digest = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const excluded = (name: string) => name.startsWith('.') || ['node_modules', 'dist', 'release', 'credentials', 'credentials.json', 'id_rsa', 'id_ed25519', 'nodusbackups', 'nodusrestored'].includes(name.toLowerCase()) || /\.(pem|key|pfx|p12)$/i.test(name);
function regular(file: string, directory = false) { const canonical = fs.realpathSync.native(file); if (fs.lstatSync(file).isSymbolicLink() || canonical.toLowerCase() !== path.resolve(file).toLowerCase() || (directory ? !fs.statSync(file).isDirectory() : !fs.statSync(file).isFile()))
    throw new AppError('BACKUP_PATH', 'Arquivo ou pasta mudou, está indisponível ou contém um link.'); return canonical; }
function safe(root: string, relative: string) { backupPath.parse(relative); let cursor = root; for (const part of relative.split('/')) {
    cursor = path.join(cursor, part);
    regular(cursor, part !== relative.split('/').at(-1) || fs.statSync(cursor).isDirectory());
} return cursor; }
function read(file: string, max = MAX_FILE) { regular(file); const fd = fs.openSync(file, 'r'); try {
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.size > max)
        throw new AppError('BACKUP_LIMIT', 'Um arquivo ultrapassa o limite da cópia.');
    const bytes = Buffer.alloc(before.size);
    let offset = 0;
    while (offset < bytes.length) {
        const n = fs.readSync(fd, bytes, offset, bytes.length - offset, offset);
        if (!n)
            throw new AppError('BACKUP_CHANGED', 'Arquivo mudou durante a cópia. Tente novamente.');
        offset += n;
    }
    const after = fs.fstatSync(fd), current = fs.statSync(regular(file));
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || after.ino !== current.ino || after.dev !== current.dev)
        throw new AppError('BACKUP_CHANGED', 'Arquivo mudou durante a cópia. Tente novamente.');
    return bytes;
}
finally {
    fs.closeSync(fd);
} }
function write(file: string, bytes: Buffer) { fs.mkdirSync(path.dirname(file), { recursive: true }); const fd = fs.openSync(file, 'wx'); try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
}
finally {
    fs.closeSync(fd);
} }
type Source = {
    source: string;
    path: string;
};
export class Backups {
    private selected = new Map<string, {
        root: string;
        hash: string;
    }>();
    private restored = new Map<string, RestoreReceipt>();
    private busy = false;
    constructor(readonly store: Store, readonly documents: string | (() => string)) { }
    private parent(name: string) { const documents = typeof this.documents === 'function' ? this.documents() : this.documents; regular(documents, true); const parent = path.join(documents, name); fs.mkdirSync(parent, { recursive: true }); regular(parent, true); return parent; }
    private cleanup(parent: string, target: string) { if (path.dirname(target) !== parent || fs.realpathSync.native(parent).toLowerCase() !== parent.toLowerCase() || fs.lstatSync(target).isSymbolicLink())
        throw new AppError('BACKUP_PATH', 'Pasta temporária mudou. Preserve-a e confira o disco.'); fs.rmSync(target, { recursive: true, force: true }); }
    private collect() {
        const sources: Source[] = [], omissions: string[] = [], projects: string[] = [], materials: string[] = [];
        let bytes = fs.statSync(path.join(this.store.directory, 'study.sqlite')).size, entries = 0;
        const omit = (text: string) => { if (omissions.length < 200)
            omissions.push(text.slice(0, 240)); };
        const add = (source: string, target: string) => { backupPath.parse(target); const stat = fs.statSync(regular(source)); if (stat.size > MAX_FILE)
            throw new AppError('BACKUP_LIMIT', 'Arquivo acima de 100 MiB; reduza a origem da cópia.'); if (sources.length + 1 >= MAX_FILES || (bytes += stat.size) > MAX_TOTAL)
            throw new AppError('BACKUP_LIMIT', 'A cópia admite até 5.000 arquivos e 300 MiB. Reduza as pastas de origem.'); sources.push({ source, path: target }); };
        const walk = (root: string, prefix: string) => { regular(root, true); const visit = (relative: string, depth: number) => { if (depth > 16)
            throw new AppError('BACKUP_LIMIT', 'Pasta acima de 16 níveis.'); const folder = relative ? safe(root, relative) : root, handle = fs.opendirSync(folder); try {
            let entry;
            while ((entry = handle.readSync())) {
                if (++entries > 10000)
                    throw new AppError('BACKUP_LIMIT', 'Pastas com muitos itens. Reduza a origem.');
                const rel = relative ? `${relative}/${entry.name}` : entry.name;
                if (excluded(entry.name) || entry.isSymbolicLink()) {
                    omit(`${prefix}/${rel}: auxiliar, credencial conhecida ou link omitido`);
                    continue;
                }
                backupPath.parse(rel);
                if (entry.isDirectory())
                    visit(rel, depth + 1);
                else if (entry.isFile())
                    add(safe(root, rel), `${prefix}/${rel}`);
            }
        }
        finally {
            handle.closeSync();
        } }; visit('', 0); };
        const vault = this.store.setting('vault');
        if (vault) {
            walk(vault, 'vault');
            for (const row of this.store.db.prepare('SELECT path FROM notes').all()) {
                const relative = String(row.path);
                backupPath.parse(relative);
                if (!sources.some(s => s.path === `vault/${relative}`))
                    omit(`vault/${relative}: nota ausente ou excluída; referência e rascunho conservados`);
            }
        }
        for (const row of this.store.db.prepare('SELECT id,root FROM project_folders').all()) {
            const id = String(row.id);
            if (!/^[0-9a-f-]{36}$/i.test(id))
                throw new AppError('BACKUP_REFERENCE', 'Identidade de projeto inválida.');
            projects.push(id);
            try {
                walk(String(row.root), `projects/${id}`);
            }
            catch (e) {
                if (!fs.existsSync(String(row.root)))
                    omit(`projects/${id}: pasta ausente; referências e rascunhos conservados`);
                else
                    throw e;
            }
        }
        for (const row of this.store.db.prepare('SELECT id,path FROM materials').all()) {
            const id = String(row.id);
            if (!/^[0-9a-f-]{36}$/i.test(id))
                throw new AppError('BACKUP_REFERENCE', 'Identidade de documento inválida.');
            if (!fs.existsSync(String(row.path))) {
                omit(`materials/${id}: PDF ausente; referência conservada`);
                continue;
            }
            add(String(row.path), `materials/${id}.pdf`);
            materials.push(id);
        }
        for (const name of ['recovery', 'project-recovery']) {
            const root = path.join(this.store.directory, name);
            if (fs.existsSync(root))
                walk(root, `profile/${name}`);
        }
        return { sources, omissions, projects, materials, vault: !!vault, bytes };
    }
    preview(): BackupPreview { const s = this.collect(); return { files: s.sources.length + 1, bytes: s.bytes, notes: Number(this.store.db.prepare('SELECT COUNT(*) n FROM notes').get()!.n), projects: s.projects.length, materials: s.materials.length, omissions: s.omissions, destination: this.parent('NodusBackups') }; }
    create(): BackupReceipt { if (this.busy)
        throw new AppError('BACKUP_BUSY', 'Uma cópia já está em andamento.'); const parent = this.parent('NodusBackups'), id = randomUUID(), root = path.join(parent, id); fs.mkdirSync(root); this.busy = true; try {
        const s = this.collect();
        fs.mkdirSync(path.join(root, 'profile'));
        const database = path.join(root, 'profile', 'study.sqlite');
        this.store.db.prepare('VACUUM INTO ?').run(database);
        const dbBytes = read(database, 64 * 1024 * 1024), files = [{ path: 'profile/study.sqlite', bytes: dbBytes.length, hash: digest(dbBytes) }];
        let bytes = dbBytes.length;
        for (const item of s.sources) {
            const content = read(item.source);
            bytes += content.length;
            if (bytes > MAX_TOTAL)
                throw new AppError('BACKUP_LIMIT', 'A cópia cresceu acima de 300 MiB.');
            write(path.join(root, ...item.path.split('/')), content);
            files.push({ path: item.path, bytes: content.length, hash: digest(content) });
        }
        const manifest = snapshotManifest.parse({ format: 'nodus-local-v1', id, at: Date.now(), schema: 5, files, projects: s.projects, materials: s.materials, vault: s.vault, omissions: s.omissions });
        write(path.join(root, 'snapshot.json'), Buffer.from(JSON.stringify(manifest, null, 2)));
        this.store.audit('backup:create', id, 'ok');
        this.selected.set(id, { root, hash: digest(Buffer.from(JSON.stringify(manifest, null, 2))) });
        return { id, path: root, at: manifest.at, files: files.length, bytes, omissions: s.omissions };
    }
    catch (e) {
        this.cleanup(parent, root);
        throw e;
    }
    finally {
        this.busy = false;
    } }
    private validate(root: string): SnapshotManifest { regular(root, true); const manifest = snapshotManifest.parse(JSON.parse(read(path.join(root, 'snapshot.json'), 2 * 1024 * 1024).toString('utf8'))), seen = new Set<string>(); let total = 0; for (const item of manifest.files) {
        const key = item.path.toLowerCase();
        if (seen.has(key) || item.path.split('/').some(excluded) || !/^(profile\/study\.sqlite|profile\/(?:recovery|project-recovery)\/.+|vault\/.+|projects\/[0-9a-f-]{36}\/.+|materials\/[0-9a-f-]{36}\.pdf)$/.test(item.path))
            throw new AppError('BACKUP_MANIFEST', 'Caminhos duplicados, auxiliares ou fora do snapshot.');
        seen.add(key);
        const content = read(safe(root, item.path), item.path === 'profile/study.sqlite' ? 64 * 1024 * 1024 : MAX_FILE);
        if (content.length !== item.bytes || digest(content) !== item.hash)
            throw new AppError('BACKUP_INTEGRITY', 'A cópia foi alterada ou está incompleta. Nenhum dado atual foi modificado.');
        if ((total += content.length) > MAX_TOTAL)
            throw new AppError('BACKUP_LIMIT', 'Snapshot acima de 300 MiB.');
    } if (!seen.has('profile/study.sqlite'))
        throw new AppError('BACKUP_MANIFEST', 'Banco ausente no snapshot.'); return manifest; }
    select(root: string): BackupReceipt { const canonical = regular(root, true), m = this.validate(canonical), id = randomUUID(); this.selected.set(id, { root: canonical, hash: digest(read(path.join(canonical, 'snapshot.json'), 2 * 1024 * 1024)) }); if (this.selected.size > 20)
        this.selected.delete(this.selected.keys().next().value!); return { id, path: canonical, at: m.at, files: m.files.length, bytes: m.files.reduce((n, f) => n + f.bytes, 0), omissions: m.omissions }; }
    private verifyDatabase(file: string, parent: string) { const scratch = path.join(parent, randomUUID()); fs.mkdirSync(scratch); const baseline = new Store(scratch); const expected = baseline.db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE sql IS NOT NULL ORDER BY type,name").all(); baseline.close(); this.cleanup(parent, scratch); const db = new DatabaseSync(file, { readOnly: true, allowExtension: false }); try {
        db.exec('PRAGMA trusted_schema=OFF;');
        if (Number(db.prepare('PRAGMA user_version').get()!.user_version) !== 5)
            throw new AppError('BACKUP_SCHEMA', 'Este snapshot exige outro formato de banco.');
        const actual = db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE sql IS NOT NULL ORDER BY type,name").all();
        if (JSON.stringify(actual) !== JSON.stringify(expected) || String(db.prepare('PRAGMA quick_check').get()!.quick_check) !== 'ok' || db.prepare('PRAGMA foreign_key_check').all().length)
            throw new AppError('BACKUP_SCHEMA', 'Estrutura ou integridade do banco não corresponde ao app.');
    }
    finally {
        db.close();
    } }
    restore(id: string): RestoreReceipt { const selection = this.selected.get(id); if (!selection)
        throw new AppError('BACKUP_REFERENCE', 'Selecione e confira a cópia antes de restaurar.'); if (this.busy)
        throw new AppError('BACKUP_BUSY', 'Uma cópia já está em andamento.'); const parent = this.parent('NodusRestored'), restoreId = randomUUID(), root = path.join(parent, restoreId); fs.mkdirSync(root); this.busy = true; try {
        if (digest(read(path.join(selection.root, 'snapshot.json'), 2 * 1024 * 1024)) !== selection.hash)
            throw new AppError('BACKUP_CHANGED', 'A prévia mudou. Selecione a cópia novamente.');
        const m = this.validate(selection.root);
        for (const item of m.files) {
            const content = read(safe(selection.root, item.path));
            if (digest(content) !== item.hash)
                throw new AppError('BACKUP_CHANGED', 'Snapshot mudou durante restauração.');
            write(path.join(root, ...item.path.split('/')), content);
        }
        this.verifyDatabase(path.join(root, 'profile', 'study.sqlite'), parent);
        const restored = new Store(path.join(root, 'profile'));
        try {
            const projectIds = restored.db.prepare('SELECT id FROM project_folders').all().map(r => String(r.id));
            if (JSON.stringify([...projectIds].sort()) !== JSON.stringify([...m.projects].sort()))
                throw new AppError('BACKUP_REFERENCE', 'Lista de projetos inconsistente.');
            restored.transaction(() => { if (m.vault) {
                fs.mkdirSync(path.join(root, 'vault'), { recursive: true });
                restored.setSetting('vault', path.join(root, 'vault'));
            }
            else
                restored.db.prepare("DELETE FROM settings WHERE key='vault'").run(); restored.db.prepare("DELETE FROM settings WHERE key IN ('pdfDestination','restoredProfile')").run(); for (const id of m.projects) {
                const folder = path.join(root, 'projects', id);
                fs.mkdirSync(folder, { recursive: true });
                restored.db.prepare('UPDATE project_folders SET root=? WHERE id=?').run(folder, id);
            } for (const row of restored.db.prepare('SELECT id FROM materials').all()) {
                const id = String(row.id);
                if (!/^[0-9a-f-]{36}$/i.test(id))
                    throw new AppError('BACKUP_REFERENCE', 'ID de documento inválido.');
                restored.db.prepare('UPDATE materials SET path=? WHERE id=?').run(path.join(root, 'materials', `${id}.pdf`), id);
            } for (const row of restored.db.prepare('SELECT path FROM notes').all()) {
                backupPath.parse(row.path);
                if (!String(row.path).endsWith('.md'))
                    throw new AppError('BACKUP_REFERENCE', 'Caminho de nota inválido.');
            } for (const row of restored.db.prepare('SELECT path FROM project_drafts').all())
                backupPath.parse(row.path); restored.audit('backup:restored', restoreId, 'ok'); });
        }
        finally {
            restored.close();
        }
        const receipt = { id: restoreId, path: root, profile: path.join(root, 'profile'), files: m.files.length, omissions: m.omissions };
        write(path.join(root, 'restore.json'), Buffer.from(JSON.stringify({ id: restoreId, snapshotId: m.id }, null, 2)));
        this.store.audit('backup:restore-copy', restoreId, 'ok');
        this.restored.set(restoreId, receipt);
        return receipt;
    }
    catch (e) {
        this.cleanup(parent, root);
        throw e;
    }
    finally {
        this.busy = false;
    } }
    restoredProfile(id: string) { const result = this.restored.get(id); if (!result)
        throw new AppError('BACKUP_REFERENCE', 'Crie uma cópia restaurada nesta sessão primeiro.'); regular(result.path, true); regular(result.profile, true); this.verifyDatabase(path.join(result.profile, 'study.sqlite'), this.parent('NodusRestored')); return result.profile; }
}
