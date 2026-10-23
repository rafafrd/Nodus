import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { cubic, distance, duration, ease, stagger } from '../src/renderer/motion/tokens';

const renderer = 'src/renderer', css = fs.readFileSync(path.join(renderer, 'motion/motion.css'), 'utf8');
const tracked = (extension: string) => execFileSync('git', ['ls-files', renderer], { encoding: 'utf8' }).split(/\r?\n/).filter(file => file.endsWith(extension) && fs.existsSync(file));

test('tokens de motion do GSAP e do CSS permanecem iguais', () => {
  for (const [name, seconds] of Object.entries(duration)) {
    const found = css.match(new RegExp(`--motion-${name}:\\s*([\\d.]+)s`));
    assert.ok(found, `--motion-${name} ausente em motion.css`);
    assert.equal(Number(found[1]), seconds, `--motion-${name} difere de duration.${name}`);
  }
  const css_names = { out: 'out', soft: 'soft', in: 'in', inOut: 'in-out' } as const;
  for (const [name, curve] of Object.entries(cubic)) {
    const found = css.match(new RegExp(`--ease-${css_names[name as keyof typeof css_names]}:\\s*(cubic-bezier\\([^)]*\\))`));
    assert.ok(found, `--ease-${name} ausente em motion.css`);
    assert.equal(found[1].replace(/\s/g, ''), curve, `--ease-${name} difere de cubic.${name}`);
  }
});

test('easings e valores seguem a direção: desaceleração longa, sem bounce, entradas curtas', () => {
  for (const value of Object.values(ease)) assert.doesNotMatch(value, /back|elastic|bounce/);
  assert.ok(duration.micro < duration.ui && duration.ui < duration.panel && duration.panel < duration.scene && duration.scene <= duration.hero);
  assert.ok(stagger.list >= .01 && stagger.list <= .02, 'stagger de lista entre 10 e 20 ms');
  assert.ok(distance.micro <= distance.ui && distance.ui <= distance.panel && distance.panel <= 24);
});

test('componentes não reintroduzem durações e easings soltos fora das cenas 3D', () => {
  const scenes = new Set(['CityScene.tsx', 'FarmScene.ts']);
  const offenders: string[] = [];
  for (const file of tracked('.tsx').concat(tracked('.ts'))) {
    if (file.includes('/motion/') || scenes.has(path.basename(file))) continue;
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => { if (/\bduration:\s*\.?\d/.test(line) || /\bease:\s*'/.test(line)) offenders.push(`${file}:${index + 1}`); });
  }
  assert.deepEqual(offenders, [], 'use duration/ease de src/renderer/motion');
});

test('transições CSS usam tokens; só o anel de progresso do foco mantém tempo próprio', () => {
  const offenders: string[] = [];
  for (const file of tracked('.css')) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => { for (const match of line.matchAll(/transition:\s*([^;}]+)/g)) if (/\d\.?\d*s\b/.test(match[1]) && !/stroke-dashoffset/.test(match[1])) offenders.push(`${file}:${index + 1}: ${match[0]}`); });
  }
  assert.deepEqual(offenders, []);
});

test('cantos retos: border-radius só aceita 0, 2px ou círculos', () => {
  const offenders: string[] = [];
  for (const file of tracked('.css')) {
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, index) => { for (const match of line.matchAll(/border-radius:\s*([^;}]+)/g)) if (!/^(0|2px|50%)\s*(!important)?\s*$/.test(match[1])) offenders.push(`${file}:${index + 1}: ${match[0]}`); });
  }
  assert.deepEqual(offenders, []);
});
