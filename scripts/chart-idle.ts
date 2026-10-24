import fs from 'node:fs';
import path from 'node:path';

// GAM-06 balance charts: static SVG from the simulate-idle JSON files (before = rules v2, after = rules v3).
// Two series at most, one axis, legend plus direct labels, light surface (they are embedded in GitHub pages).
const dir = path.resolve(process.argv[2] ?? 'docs/validation/evidence/gam-06');
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const C = { surface: '#fcfcfb', text: '#0b0b0b', muted: '#52514e', grid: '#e4e3df', before: '#eb6834', after: '#2a78d6' };
type Series = { name: string; color: string; points: [number, number][] };
const big = (v: number, d: number, unit: string) => `${(v / d).toFixed(v >= d * 10 ? 0 : 1).replace('.', ',')} ${unit}`;
const fmt = (v: number) => v >= 1e12 ? big(v, 1e12, 'tri') : v >= 1e9 ? big(v, 1e9, 'bi') : v >= 1e6 ? big(v, 1e6, 'mi') : v >= 1e3 ? big(v, 1e3, 'mil') : String(Math.round(v * 10) / 10).replace('.', ',');
const niceStep = (max: number) => { const raw = max / 4, mag = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 2.5, 5, 10].map(s => s * mag).find(s => s >= raw)!; };
function chart(file: string, title: string, subtitle: string, xLabel: string, series: Series[], opts: { log?: boolean; dots?: boolean; xMax: number; yMax?: number; xTicks: number[]; hline?: { y: number; label: string } }) {
  const W = 760, H = 440, L = 70, R = 150, T = 92, B = 56, w = W - L - R, h = H - T - B;
  const all = series.flatMap(s => s.points.map(p => p[1])).filter(v => !opts.log || v > 0);
  const top = Math.max(...all, opts.hline?.y ?? 0), step = niceStep(top), yMax = opts.yMax ?? (opts.log ? top * 1.08 : Math.ceil(top / step) * step), yMin = opts.log ? Math.max(1e-1, Math.min(...all)) : 0;
  const ly = (v: number) => opts.log ? (Math.log10(Math.max(v, yMin)) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) : v / yMax;
  const X = (x: number) => L + x / opts.xMax * w, Y = (y: number) => T + h - ly(y) * h;
  const yTicks = opts.log ? Array.from({ length: Math.floor(Math.log10(yMax)) - Math.ceil(Math.log10(yMin)) + 1 }, (_, i) => 10 ** (Math.ceil(Math.log10(yMin)) + i)).filter((_, i, a) => a.length <= 8 || i % 2 === 0) : Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const parts: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}">`, `<rect width="${W}" height="${H}" fill="${C.surface}"/>`,
    `<text x="${L}" y="30" font-family="Segoe UI,Arial,sans-serif" font-size="17" fill="${C.text}">${title}</text>`, `<text x="${L}" y="50" font-family="Segoe UI,Arial,sans-serif" font-size="12" fill="${C.muted}">${subtitle}</text>`];
  for (const t of yTicks) parts.push(`<line x1="${L}" x2="${L + w}" y1="${Y(t)}" y2="${Y(t)}" stroke="${C.grid}" stroke-width="1"/>`, `<text x="${L - 8}" y="${Y(t) + 4}" text-anchor="end" font-family="Segoe UI,Arial,sans-serif" font-size="11" fill="${C.muted}">${fmt(t)}</text>`);
  for (const t of opts.xTicks) parts.push(`<text x="${X(t)}" y="${T + h + 18}" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="11" fill="${C.muted}">${t}</text>`);
  parts.push(`<line x1="${L}" x2="${L + w}" y1="${T + h}" y2="${T + h}" stroke="${C.muted}" stroke-width="1"/>`, `<text x="${L + w / 2}" y="${H - 14}" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="12" fill="${C.muted}">${xLabel}</text>`);
  if (opts.hline) parts.push(`<line x1="${L}" x2="${L + w}" y1="${Y(opts.hline.y)}" y2="${Y(opts.hline.y)}" stroke="${C.muted}" stroke-width="1" stroke-dasharray="4 4"/>`, `<text x="${L + w + 8}" y="${Y(opts.hline.y) + 4}" font-family="Segoe UI,Arial,sans-serif" font-size="11" fill="${C.muted}">${opts.hline.label}</text>`);
  series.forEach((s, i) => {
    const pts = s.points.filter(p => p[0] <= opts.xMax && (!opts.log || p[1] > 0));
    if (pts.length && opts.dots) { pts.forEach(p => parts.push(`<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="4" fill="${s.color}" stroke="${C.surface}" stroke-width="2"/>`)); }
    else if (pts.length) { parts.push(`<polyline fill="none" stroke="${C.surface}" stroke-width="5" points="${pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')}"/>`, `<polyline fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" points="${pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')}"/>`);
      const last = pts.at(-1)!; parts.push(`<text x="${X(last[0]) + 8}" y="${Y(last[1]) + 4 + i * 2}" font-family="Segoe UI,Arial,sans-serif" font-size="12" fill="${C.text}">${s.name}: ${fmt(last[1])}</text>`); }
  });
  // Legend row under the title, identity never by color alone (direct labels at the line ends too).
  if (series.length > 1) parts.splice(4, 0, ...series.map((s, i) => `<g><rect x="${L + i * 110}" y="66" width="16" height="3" fill="${s.color}"/><text x="${L + 22 + i * 110}" y="71" font-family="Segoe UI,Arial,sans-serif" font-size="12" fill="${C.text}">${s.name}</text></g>`));
  parts.push('</svg>');
  fs.writeFileSync(path.join(dir, file), parts.join('\n'));
}
const beforeA = read('simulation-before-active.json'), afterA = read('simulation-after-active.json'), beforeI = read('simulation-before-idle.json'), afterI = read('simulation-after-idle.json');
const cumulative = (log: { second: number }[]) => [[0, 0] as [number, number], ...log.map((p, i) => [p.second / 60, i + 1] as [number, number])];
chart('compras-ativo.svg', 'Compras acumuladas, jogador ativo', 'Game real + SQLite com relógio controlado; modelo de fórmula, não tempo humano', 'minutos de jogo', [{ name: 'Antes', color: C.before, points: cumulative(beforeA.purchaseLog) }, { name: 'Depois', color: C.after, points: cumulative(afterA.purchaseLog) }], { xMax: 60, xTicks: [0, 10, 20, 30, 40, 50, 60] });
chart('compras-ocioso.svg', 'Compras acumuladas, jogador ocioso', 'Cidade aberta, sem cliques nem minijogos; só compras', 'minutos de jogo', [{ name: 'Antes', color: C.before, points: cumulative(beforeI.purchaseLog) }, { name: 'Depois', color: C.after, points: cumulative(afterI.purchaseLog) }], { xMax: 60, xTicks: [0, 10, 20, 30, 40, 50, 60] });
const rate = (r: { samples: { second: number; ratePerSecond: number }[] }) => r.samples.map(s => [s.second / 60, s.ratePerSecond] as [number, number]);
chart('producao-ativo.svg', 'Produção por segundo, jogador ativo (escala log)', 'Antes: motor com orçamento diário e coleta; depois: núcleo sem orçamento e minijogos', 'minutos de jogo', [{ name: 'Antes', color: C.before, points: rate(beforeA) }, { name: 'Depois', color: C.after, points: rate(afterA) }], { log: true, xMax: 60, xTicks: [0, 10, 20, 30, 40, 50, 60] });
// Decisions from purchases, computed the same way for both rule sets: upgrades, motor/shop items and the first unit of each family.
function decisions(log: { second: number; kind: string; id: string }[]) { const seen = new Set<string>(); const out: number[] = []; for (const p of log) { if (p.kind !== 'producer' || !seen.has(p.id)) out.push(p.second); if (p.kind === 'producer') seen.add(p.id); } return out; }
const gapSeries = (log: { second: number; kind: string; id: string }[]) => { const d = decisions(log); return d.map((s, i) => [s / 60, i ? s - d[i - 1] : s] as [number, number]); };
chart('decisoes-ativo.svg', 'Segundos desde a compra-decisão anterior, jogador ativo', 'Melhoria, item do motor/mercado ou primeira unidade de uma família (sem Lampejo nem Conselho)', 'minutos de jogo', [{ name: 'Antes', color: C.before, points: gapSeries(beforeA.purchaseLog) }, { name: 'Depois', color: C.after, points: gapSeries(afterA.purchaseLog) }], { dots: true, xMax: 60, xTicks: [0, 10, 20, 30, 40, 50, 60], hline: { y: 90, label: 'meta: 90 s' } });
for (const [name, r] of [['antes', beforeA], ['depois', afterA]] as const) { const g = gapSeries(r.purchaseLog).filter(p => p[0] < 30).map(p => p[1]).sort((a, b) => a - b); console.log(`Compras-decisão 0–30 min ${name}: n=${g.length} mediana=${g[Math.floor(g.length / 2)]} s máx=${g.at(-1)} s`); }
if (fs.existsSync(path.join(dir, 'simulation-after-long-active.json'))) {
  const long = read('simulation-after-long-active.json'), base = 1e12;
  chart('jornada-longa.svg', 'Total produzido na jornada, jogador ativo (escala log)', `Primeiro prestígio viável quando a linha cruza ${fmt(base)}; regras novas`, 'horas de jogo', [{ name: 'Depois', color: C.after, points: long.samples.map((s: { second: number; lifetime: number }) => [s.second / 3600, s.lifetime] as [number, number]) }], { log: true, xMax: long.minutes / 60, xTicks: Array.from({ length: long.minutes / 60 + 1 }, (_, i) => i), hline: { y: base, label: '1º prestígio' } });
}
// --png: rasterize with Playwright's Chromium so the PR shows them without depending on SVG rendering.
if (process.argv.includes('--png')) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  try { const page = await browser.newPage({ deviceScaleFactor: 2 }); for (const file of fs.readdirSync(dir).filter(n => n.endsWith('.svg'))) { await page.setContent(`<body style="margin:0">${fs.readFileSync(path.join(dir, file), 'utf8')}</body>`); await page.locator('svg').screenshot({ path: path.join(dir, file.replace(/\.svg$/, '.png')) }); } } finally { await browser.close(); }
}
console.log('Gráficos em', dir);
