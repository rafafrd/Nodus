import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// Real GSAP against jsdom: the contract is the end state (no leaked live attributes or inline props) and the reduced-motion path.
const dom = new JSDOM('<!doctype html><html data-theme="editorial"><body></body></html>', { pretendToBeVisual: true });
const g = globalThis as Record<string, unknown>;
Object.assign(g, { window: dom.window, document: dom.window.document, requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window), cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window), getComputedStyle: dom.window.getComputedStyle.bind(dom.window) });
dom.window.matchMedia = ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} })) as never;
g.matchMedia = dom.window.matchMedia;
const { drawHairlines } = await import('../src/renderer/motion/reveal');
const { gsap } = await import('gsap');
gsap.ticker.lagSmoothing(0);

const html = dom.window.document.documentElement, wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
function fixture() {
  const root = dom.window.document.createElement('div');
  root.innerHTML = '<header data-hairline></header><div data-hairline></div>';
  dom.window.document.body.append(root); return root;
}

test('hairline draw marca as linhas como vivas e devolve borda e variável ao fim', async () => {
  html.dataset.theme = 'editorial'; delete html.dataset.animations;
  const root = fixture(), lines = [...root.querySelectorAll<HTMLElement>('[data-hairline]')];
  drawHairlines(root);
  assert.ok(lines.every(line => line.hasAttribute('data-hairline-live')), 'vivas durante o desenho');
  await wait(900);
  assert.ok(lines.every(line => !line.hasAttribute('data-hairline-live')), 'estado vivo removido ao terminar');
  assert.ok(lines.every(line => line.style.getPropertyValue('--hairline') === ''), '--hairline limpo ao terminar');
});

test('um segundo desenho cancela o primeiro sem deixar rastro', async () => {
  const root = fixture(), lines = [...root.querySelectorAll<HTMLElement>('[data-hairline]')];
  drawHairlines(root); await wait(80); drawHairlines(root); await wait(900);
  assert.ok(lines.every(line => !line.hasAttribute('data-hairline-live') && line.style.getPropertyValue('--hairline') === ''));
});

test('animações desligadas, outro tema e movimento reduzido não desenham nada', () => {
  const root = fixture(), lines = [...root.querySelectorAll<HTMLElement>('[data-hairline]')];
  html.dataset.animations = 'off'; drawHairlines(root);
  assert.ok(lines.every(line => !line.hasAttribute('data-hairline-live')), 'data-animations=off');
  delete html.dataset.animations; html.dataset.theme = 'white'; drawHairlines(root);
  assert.ok(lines.every(line => !line.hasAttribute('data-hairline-live')), 'tema sóbrio');
  html.dataset.theme = 'editorial';
  dom.window.matchMedia = ((query: string) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} })) as never; g.matchMedia = dom.window.matchMedia;
  drawHairlines(root);
  assert.ok(lines.every(line => !line.hasAttribute('data-hairline-live')), 'prefers-reduced-motion');
});
