import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const errors = [];
const fail = (message) => errors.push(message);
const read = (relative) => {
  try { return fs.readFileSync(path.join(root, relative), 'utf8'); }
  catch { fail('Arquivo ausente ou ilegível: ' + relative); return ''; }
};
const required = [
  'README.md', 'AGENTS.md', 'CLAUDE.md', 'gotcha.md',
  '.gitignore', '.gitattributes', '.editorconfig', '.node-version', '.npmrc',
  'docs/README.md', 'docs/setup/windows.md', 'docs/setup/git.md', 'docs/setup/agents.md',
  'docs/architecture/README.md', 'docs/architecture/data-model.md', 'docs/sdd.md',
  'docs/product/PRD.md', 'docs/design/README.md', 'docs/adr/README.md',
  'docs/tasks/README.md', 'docs/status/ALPHA_STATE.md',
  'docs/validation/ALPHA.md', 'docs/validation/BOOTSTRAP.md'
];
for (const name of required) {
  if (!fs.existsSync(path.join(root, name))) fail('Arquivo obrigatório ausente: ' + name);
}
for (const folder of ['todo', 'doing', 'done']) {
  const p = path.join(root, 'docs/tasks', folder);
  if (!fs.existsSync(p) || !fs.statSync(p).isDirectory()) fail('Pasta de tarefas ausente: ' + folder);
}
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'release', '.local']);
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return ignoredDirs.has(entry.name) ? [] : walk(p);
    return entry.isFile() ? [p] : [];
  });
}
const markdownFiles = walk(root).filter((p) => p.endsWith('.md'));
let linkCount = 0;
for (const filename of markdownFiles) {
  const text = fs.readFileSync(filename, 'utf8').replace(/\x60{3}[\s\S]*?\x60{3}/g, '');
  const links = [...text.matchAll(/(?<!!)\[[^\]]*\]\(([^)]+)\)/g)];
  for (const match of links) {
    const raw = match[1].trim().replace(/^<|>$/g, '');
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('#')) continue;
    const relative = raw.split('#')[0].split('?')[0];
    if (!relative) continue;
    linkCount++;
    let target;
    try { target = path.resolve(path.dirname(filename), decodeURIComponent(relative)); }
    catch { fail('Link inválido em ' + path.relative(root, filename) + ': ' + raw); continue; }
    if (!fs.existsSync(target)) fail('Link local ausente em ' + path.relative(root, filename) + ': ' + raw);
  }
}
const outcomes = {
  todo: ['a_fazer'],
  doing: ['em_andamento', 'bloqueado', 'parcial'],
  done: ['concluido']
};
const labels = {
  a_fazer: 'A fazer', em_andamento: 'Em andamento', bloqueado: 'Bloqueado',
  parcial: 'Parcial', concluido: 'Concluído'
};
const tasks = new Map();
for (const folder of ['todo', 'doing', 'done']) {
  const dir = path.join(root, 'docs/tasks', folder);
  if (!fs.existsSync(dir)) continue;
  for (const filename of fs.readdirSync(dir).filter((name) => /^ALP-\d{2}\.md$/.test(name))) {
    const text = read('docs/tasks/' + folder + '/' + filename);
    const header = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!header) { fail(filename + ': frontmatter ausente'); continue; }
    const fields = Object.fromEntries(header[1].split(/\r?\n/).map((line) => {
      const colon = line.indexOf(':');
      return colon < 0 ? null : [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
    }).filter(Boolean));
    const id = filename.replace('.md', '');
    if (fields.id !== id) fail(filename + ': ID diferente do nome');
    if (tasks.has(id)) fail(id + ': duplicado em mais de uma pasta');
    if (fields.status !== folder) fail(id + ': status diferente da pasta');
    if (!outcomes[folder].includes(fields.outcome)) fail(id + ': outcome incompatível com a pasta');
    const criteria = [...text.matchAll(/^C(\d+)\. /gm)].map((m) => Number(m[1]));
    const count = Number(fields.criteria_count);
    if (!Number.isInteger(count) || count < 1 || count !== criteria.length
      || criteria.some((n, i) => n !== i + 1)) fail(id + ': critérios ausentes, duplicados ou fora da sequência');
    let deps = [];
    try {
      deps = JSON.parse(fields.depends_on);
      if (!Array.isArray(deps) || deps.some((d) => typeof d !== 'string')) throw new Error();
    } catch { fail(id + ': depends_on deve ser uma lista JSON de IDs'); deps = []; }
    tasks.set(id, { id, folder, outcome: fields.outcome, count, deps });
  }
}
for (let i = 1; i <= 11; i++) {
  const id = 'ALP-' + String(i).padStart(2, '0');
  if (!tasks.has(id)) fail('Ticket obrigatório ausente: ' + id);
}
for (const task of tasks.values()) {
  for (const dep of task.deps) {
    if (!tasks.has(dep) || dep === task.id) fail(task.id + ': dependência inválida: ' + dep);
  }
}
const state = read('docs/status/ALPHA_STATE.md');
const rows = [...state.matchAll(/^\| (ALP-\d{2}) \| (todo|doing|done) \| ([^|]+) \|/gm)];
const indexed = new Map();
for (const row of rows) {
  if (indexed.has(row[1])) fail(row[1] + ': duplicado na tabela de retomada');
  indexed.set(row[1], { folder: row[2], label: row[3].trim() });
}
const validation = read('docs/validation/ALPHA.md');
for (const task of tasks.values()) {
  const row = indexed.get(task.id);
  if (!row || row.folder !== task.folder || row.label !== labels[task.outcome])
    fail(task.id + ': tabela de retomada diverge do ticket');
  const start = validation.indexOf('## ' + task.id + ' ');
  if (start < 0) { fail(task.id + ': seção de validação ausente'); continue; }
  const next = validation.indexOf('\n## ', start + 1);
  const section = validation.slice(start, next < 0 ? undefined : next);
  const results = new Map();
  for (const line of section.split(/\r?\n/)) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (/^C\d+$/.test(cells[0] ?? '')) results.set(cells[0], { result: cells[1], evidence: cells.slice(2).join('|').trim() });
  }
  for (let i = 1; i <= task.count; i++) {
    const item = results.get('C' + i);
    if (!item || !['aprovado', 'falhou', 'não verificado'].includes(item.result))
      fail(task.id + '/C' + i + ': resultado ausente ou inválido');
    if (task.folder === 'done' && (!item || item.result !== 'aprovado' || !item.evidence || item.evidence === '—'))
      fail(task.id + '/C' + i + ': done exige resultado aprovado e referência de evidência');
  }
}
for (const id of indexed.keys()) if (!tasks.has(id)) fail(id + ': retomada aponta para ticket inexistente');
if (Buffer.byteLength(read('AGENTS.md'), 'utf8') > 16 * 1024)
  fail('AGENTS.md excede a reserva de 16 KiB deste bootstrap; revise o contexto');
if (errors.length) {
  for (const message of errors) console.error('FALHA: ' + message);
  process.exitCode = 1;
} else {
  const criteriaCount = [...tasks.values()].reduce((n, t) => n + t.count, 0);
  console.log('OK: ' + tasks.size + ' tickets; ' + criteriaCount + ' critérios; '
    + markdownFiles.length + ' arquivos Markdown; ' + linkCount + ' links locais.');
  console.log('Esta verificação é de consistência documental; não testa a aplicação nem prova evidências externas.');
}
