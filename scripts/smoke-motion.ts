import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { UserPreferences } from '../src/main/preferences';
import { Checklist } from '../src/main/checklist';
import { Projects } from '../src/main/projects';

// UI-07. Packaged Windows executable, isolated generated fixture, real IPC/SQLite/vault. No personal data.
// --tag=before only captures (the baseline build has no motion contract to assert); --tag=after also asserts it.
const tag = process.argv.find(arg => arg.startsWith('--tag='))?.slice(6) ?? 'after', assertions = tag === 'after';
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7);
const variants = [
  { name: 'editorial-on', theme: 'editorial', animations: true },
  { name: 'editorial-off', theme: 'editorial', animations: false },
  { name: 'white-on', theme: 'white', animations: true },
  { name: 'graphite-on', theme: 'graphite', animations: true },
].filter(variant => !only || variant.name === only);
const exe = path.resolve('release/win-unpacked/App Estudos.exe'), env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const root = path.resolve(`.local/evidence/motion/${tag}`); fs.mkdirSync(root, { recursive: true });
const areas = [
  ['caderno', 'Voltar aos estudos', '.note-panel'], ['inicio', 'Abrir início', '[data-testid=home-workspace]'], ['pdf', 'Abrir PDF', 'canvas[data-rendered-page="2"]'],
  ['revisao', 'Abrir revisões', '.review-workspace'], ['conexoes', 'Abrir grafo', '[data-testid=graph-canvas]'], ['projetos', 'Abrir Explorer', '.project-shell'],
  ['cidade', 'Entrar na cidade', 'canvas[data-testid=city-canvas][data-ready=true]'], ['ajustes', 'Abrir configurações', '.settings-workspace'],
] as const;
const summary: Record<string, unknown> = {};

for (const variant of variants) {
  const fixture = prepareFixture(`motion-${variant.name}`), data = path.join(fixture.dir, 'data'), out = path.join(root, variant.name); fs.mkdirSync(out, { recursive: true });
  const seed = new Store(data);
  new UserPreferences(seed).update({ name: 'Rafael · demonstração', theme: variant.theme as 'editorial', animations: variant.animations });
  new Checklist(seed).create(fixture.a.id, 'Continuar meu estudo de hoje');
  const projectRoot = path.join(fixture.dir, 'Projeto de demonstração'); fs.mkdirSync(projectRoot); fs.writeFileSync(path.join(projectRoot, 'area.ts'), 'export const area = (b: number, h: number) => b * h / 2;\n');
  new Projects(seed).chooseRoot(projectRoot); seed.close();
  const app = await electron.launch({ executablePath: exe, args: [`--user-data-dir=${data}`], env, recordVideo: { dir: path.join(out, 'video'), size: { width: 1440, height: 900 } } }), page = await app.firstWindow();
  const errors: string[] = [], notes: string[] = [], shots: string[] = [];
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const idle = async () => { await page.locator('.area-stage[data-motion=idle]').waitFor(); await page.locator('.activity-rail[aria-busy=false]').waitFor(); };
  const shot = async (name: string) => { const file = `${String(shots.length + 1).padStart(2, '0')}-${name}.png`; await page.screenshot({ path: path.join(out, file) }); shots.push(file); };
  try {
    await page.getByRole('textbox', { name: 'Título da nota', exact: true }).waitFor();
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1440, 900));
    await page.waitForTimeout(600); await idle();
    // Records every stage state it sees so a sub-frame transition cannot hide from the polling below.
    await page.evaluate(() => { const seen = new Set<string>(); (window as never as { __stage: Set<string> }).__stage = seen; const stage = document.querySelector('[data-testid=area-stage]')!; new MutationObserver(() => seen.add(stage.getAttribute('data-motion') ?? '')).observe(stage, { attributes: true, attributeFilter: ['data-motion'] }); });
    await shot('caderno');
    const layerOf: Record<string, string> = { caderno: 'study', inicio: 'home', pdf: 'pdf', revisao: 'review', conexoes: 'graph', projetos: 'explorer', cidade: 'city', ajustes: 'settings' };
    for (const [name, label, ready] of areas) {
      if (name === 'caderno') continue;
      await page.evaluate(() => (window as never as { __stage: Set<string> }).__stage.clear());
      // Samples the incoming layer every frame until the stage settles: opacity, clip-path and the transform matrix (a and d must stay 1: nothing scales).
      // Passed as source text: tsx injects a __name helper into named arrows, which does not exist in the page.
      await page.evaluate(`((selector) => {
        const samples = []; window.__samples = samples; const t0 = performance.now(), stage = document.querySelector('[data-testid=area-stage]'); let started = false;
        const tick = () => {
          const el = document.querySelector(selector), elapsed = performance.now() - t0, motion = stage.getAttribute('data-motion'); if (motion !== 'idle') started = true;
          if (el) { const style = getComputedStyle(el); samples.push({ t: Math.round(elapsed), o: Number(style.opacity), transform: style.transform, clip: style.clipPath }); }
          if (!((started && motion === 'idle') || (!started && elapsed > 600) || elapsed > 8000)) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      })(${JSON.stringify(`[data-area="${layerOf[name]}"]`)})`);
      await page.getByRole('button', { name: label, exact: true }).first().click();
      // before: one frame at ~150 ms. after: the first frame the screenshot can take (the rAF samples above carry the real timeline).
      if (!assertions) await page.waitForTimeout(150);
      await shot(`${name}-meio`);
      await idle(); await page.locator(ready).first().waitFor(); await page.waitForTimeout(900); await shot(name);
      if (assertions) {
        const state = await page.evaluate(() => {
          const stage = document.querySelector<HTMLElement>('[data-testid=area-stage]')!, seen = [...(window as never as { __stage: Set<string> }).__stage];
          const layers = [...stage.querySelectorAll<HTMLElement>('.area-layer')].filter(el => el.dataset.present === 'true').map(el => ({ transform: el.style.transform, clip: el.style.clipPath }));
          return { seen, layers, live: document.querySelectorAll('[data-hairline-live]').length, split: document.querySelectorAll('.split-line, .split-line-mask').length, sweep: stage.style.getPropertyValue('--sweep'), leaked: document.querySelectorAll('[style*="will-change"]').length };
        });
        assert.equal(state.live, 0, `${variant.name}/${name}: hairline presa em estado vivo`);
        assert.equal(state.split, 0, `${variant.name}/${name}: máscara de linha não revertida`);
        assert.equal(state.sweep, '', `${variant.name}/${name}: --sweep não limpo`);
        for (const layer of state.layers) { assert.ok(!layer.transform || layer.transform === 'none', `${variant.name}/${name}: transform residual ${layer.transform}`); assert.ok(!layer.clip, `${variant.name}/${name}: clip-path residual`); }
        if (!variant.animations) assert.ok(!state.seen.includes('transitioning'), `${variant.name}/${name}: transição com animações desligadas`);
        else assert.ok(state.seen.includes('transitioning') || state.seen.includes('idle'), `${variant.name}/${name}: estágio sem estados`);
        await page.waitForTimeout(300);
        const samples = await page.evaluate(() => (window as never as { __samples: { t: number; o: number; transform: string; clip: string }[] }).__samples);
        const matrix = (transform: string) => (transform.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number)) ?? [1, 0, 0, 1, 0, 0];
        for (const sample of samples) { const [a, , , d] = matrix(sample.transform); assert.ok(Math.abs(a - 1) < 1e-6 && Math.abs(d - 1) < 1e-6, `${variant.name}/${name}: escala na transição (${sample.transform})`); }
        const clipped = samples.filter(sample => sample.clip !== 'none'), partial = samples.filter(sample => sample.o > 0 && sample.o < 1);
        if (variant.animations) { assert.ok(partial.length > 0, `${variant.name}/${name}: nenhum quadro intermediário de opacidade`); assert.ok(clipped.length > 0, `${variant.name}/${name}: nenhum quadro com clip-path`); } else assert.equal(partial.length + clipped.length, 0, `${variant.name}/${name}: quadros intermediários com animações desligadas`);
        assert.equal(samples.at(-1)!.clip, 'none'); assert.equal(samples.at(-1)!.o, 1);
        const gaps = samples.slice(1).map((sample, index) => sample.t - samples[index].t);
        notes.push(`${name}: ${samples.length} quadros, ${partial.length} com opacidade parcial, ${clipped.length} com clip-path, maior intervalo ${Math.max(0, ...gaps)} ms, último o=${samples.at(-1)!.o}`);
      }
    }
    if (assertions) {
      // Fonts: bundled files, no CSP violation, Editorial only.
      const fonts = await page.evaluate(async () => { await document.fonts.ready; return { serif: document.fonts.check('16px "Newsreader Variable"'), mono: document.fonts.check('12px "JetBrains Mono Variable"'), heading: getComputedStyle(document.querySelector('h1')!).fontFamily }; });
      if (variant.theme === 'editorial') assert.match(fonts.heading, /Newsreader Variable/); else assert.doesNotMatch(fonts.heading, /Newsreader/);
      notes.push(`fontes: ${JSON.stringify(fonts)}`);
      // Rail indicator follows the selected module.
      await page.getByRole('button', { name: 'Voltar aos estudos', exact: true }).first().click(); await idle(); await page.waitForTimeout(500);
      const rail = await page.evaluate(() => { const bar = document.querySelector<HTMLElement>('.rail-indicator')!, item = document.querySelector<HTMLElement>('.rail-module.selected')!; return { y: Math.round(bar.getBoundingClientRect().top), expected: Math.round(item.getBoundingClientRect().top), h: Math.round(bar.getBoundingClientRect().height), eh: Math.round(item.getBoundingClientRect().height), opacity: getComputedStyle(bar).opacity }; });
      assert.equal(rail.y, rail.expected); assert.equal(rail.h, rail.eh); assert.equal(rail.opacity, '1'); notes.push(`indicador: ${JSON.stringify(rail)}`);
      // Keyboard focus is always visible: a 2 px outline on every control reached by Tab.
      await page.getByRole('button', { name: 'Abrir busca global', exact: true }).focus();
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        const ring = await page.evaluate(() => { const style = getComputedStyle(document.activeElement!); return { tag: document.activeElement!.tagName, style: style.outlineStyle, width: parseFloat(style.outlineWidth), color: style.outlineColor }; });
        assert.equal(ring.style, 'solid', `foco por teclado sem contorno em ${ring.tag}`); assert.ok(ring.width >= 2, `contorno fino demais em ${ring.tag}`);
        notes.push(`foco ${i + 1}: ${ring.tag} ${ring.width}px ${ring.color}`);
      }
      // Save feedback: the note panel pulses its border and settles back.
      const editor = page.getByRole('textbox', { name: 'Conteúdo da nota', exact: true }); await editor.fill('# Feedback de salvamento\n\nTexto de demonstração.');
      await page.getByRole('button', { name: 'Salvar nota', exact: true }).click();
      if (variant.animations) await page.locator('.note-panel[data-tone=ok]').waitFor();
      await page.getByText('Salvo no arquivo', { exact: true }).first().waitFor(); await shot('salvo'); notes.push('feedback de salvamento observado');
    }
    // Command palette and a regular dialog: entry and list stagger.
    await page.keyboard.press('Control+k'); await page.waitForTimeout(110); await shot('ctrl-k-meio'); await page.locator('dialog[open]').waitFor(); await page.waitForTimeout(600); await shot('ctrl-k');
    await page.keyboard.press('Escape'); await page.locator('dialog[open]').waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Nova matéria pelo menu', exact: true }).click(); await page.locator('dialog[open]').waitFor(); await page.waitForTimeout(500); await shot('dialogo'); await page.keyboard.press('Escape'); await page.waitForTimeout(700);
    if (await page.locator('dialog[open]').count()) { notes.push(`Escape não fechou o diálogo: foco em ${await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80))}`); await page.getByRole('button', { name: 'Fechar diálogo', exact: true }).click(); }
    await page.locator('dialog[open]').waitFor({ state: 'hidden' });
    if (variant.theme === 'editorial' && variant.animations) {
      // Spotlight follows the pointer on Home cards and is absent for reduced motion.
      await page.getByRole('button', { name: 'Abrir início', exact: true }).first().click(); await idle(); await page.waitForTimeout(900);
      const card = page.locator('[data-spotlight]').first();
      if (assertions) { await card.hover({ position: { x: 40, y: 30 } }); await page.waitForTimeout(150); const var1 = await card.evaluate(el => el.style.getPropertyValue('--spot-x')); await card.hover({ position: { x: 120, y: 50 } }); await page.waitForTimeout(150); const var2 = await card.evaluate(el => el.style.getPropertyValue('--spot-x')); assert.notEqual(var1, ''); assert.notEqual(var1, var2); notes.push(`spotlight: ${var1} -> ${var2}`); await shot('spotlight'); }
    }
    if (assertions && variant.theme === 'editorial' && variant.animations) {
      // prefers-reduced-motion changes the next transition without a reload.
      await page.emulateMedia({ reducedMotion: 'reduce' }); await page.evaluate(() => (window as never as { __stage: Set<string> }).__stage.clear());
      await page.getByRole('button', { name: 'Abrir revisões', exact: true }).first().click(); await idle();
      const reduced = await page.evaluate(() => ({ seen: [...(window as never as { __stage: Set<string> }).__stage], split: document.querySelectorAll('.split-line').length, live: document.querySelectorAll('[data-hairline-live]').length }));
      assert.ok(!reduced.seen.includes('transitioning')); assert.equal(reduced.split, 0); assert.equal(reduced.live, 0); notes.push('prefers-reduced-motion: sem transição, sem máscara, sem hairline'); await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    if (assertions) assert.deepEqual(errors, [], `erros do renderer: ${errors.join(' | ')}`);
    summary[variant.name] = { shots, notes, errors };
  } catch (error) {
    await page.screenshot({ path: path.join(out, 'falha.png') }).catch(() => {}); summary[variant.name] = { shots, notes, errors, failure: String(error) }; throw error;
  } finally {
    const video = page.video(); await app.close().catch(() => {}); if (video) await video.saveAs(path.join(out, `${variant.name}.webm`)).catch(() => {});
    fs.rmSync(path.join(out, 'video'), { recursive: true, force: true });
    fs.writeFileSync(path.join(root, 'summary.json'), JSON.stringify({ at: new Date().toISOString(), tag, summary }, null, 2));
  }
}
console.log(JSON.stringify(summary, null, 2));
