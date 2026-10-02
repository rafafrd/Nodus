import fs from 'node:fs';
const [id, statusList, evidence] = process.argv.slice(2);
const statuses = statusList.split(',');
let text = fs.readFileSync('docs/validation/ALPHA.md', 'utf8');
const start = text.indexOf(`## ${id} `);
if (start < 0) throw Error('Seção não encontrada');
const next = text.indexOf('\n## ', start + 1);
const end = next < 0 ? text.length : next;
let section = text.slice(start, end);
section = section.replace(/^\| C(\d+) \| [^|]+ \|[^\r\n]+/gm, (_, n) => {
  const status = statuses[Number(n) - 1] ?? statuses[0];
  if (!['aprovado', 'falhou', 'não verificado'].includes(status)) throw Error('Resultado inválido');
  return `| C${n} | ${status} | ${evidence.replaceAll('|', '/')} |`;
});
section += `\nExecução 02/10/2026, Windows 11 (10.0.26200), Node host portátil 24.21.0. ${evidence}\n`;
fs.writeFileSync('docs/validation/ALPHA.md', text.slice(0, start) + section + text.slice(end));
