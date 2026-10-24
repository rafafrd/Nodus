import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { _electron as electron, type Page } from 'playwright';
import { prepareFixture } from './test-fixture';
import { Store } from '../src/main/store';
import { Game } from '../src/main/game';
import { UserPreferences } from '../src/main/preferences';
import type { GameState } from '../src/shared/game';

// GAM-07 on the packaged Windows app: minigame shortcuts, map entrances, the Mira round end to end and the
// city in its three skins. Generated fixture only; the economy is earned by playing the real Game API.
const out = path.resolve('.local/evidence/gam-07'); fs.mkdirSync(out, { recursive: true });
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const checks: string[] = [], errors: string[] = [];
const f = prepareFixture('aim-city'), data = path.join(f.dir, 'data');
{
  const store = new Store(data); let now = Date.now() - 30 * 60000; const game = new Game(store, () => now);
  const act = (action: never) => game.act({ operationId: randomUUID(), action });
  for (let i = 0; i < 30 * 60; i++) { now += 1000; act({ kind: 'core-click', count: 4 } as never); const s = game.get(); const p = s.economy.producersView.filter(v => v.unlocked).sort((a, b) => Number(a.cost) - Number(b.cost))[0]; if (p && Number(p.cost) <= Number(s.coins)) act({ kind: 'producer-buy', producer: p.id, quantity: 1 } as never); }
  new UserPreferences(store).update({ theme: 'editorial', animations: true }); store.close();
}
const app = await electron.launch({ executablePath: path.resolve('release/win-unpacked/App Estudos.exe'), args: [`--user-data-dir=${data}`], env }), page: Page = await app.firstWindow();
page.setDefaultTimeout(30000); page.on('pageerror', e => errors.push(e.message));
const shot = async (name: string) => { await page.waitForTimeout(600); await page.screenshot({ path: path.join(out, `${name}.png`) }); };
const game = async () => { const r = await page.evaluate(() => window.desktop.getGame()); assert.ok(r.ok); return r.value as GameState; };
const nav = (name: string) => page.getByRole('navigation', { name: 'Jogo' }).getByRole('button', { name, exact: true });
const canvas = page.locator('canvas[data-testid=city-canvas]');
/** Clicks every square that shows up, at `offset` half-sides from its center, until the round ends. */
async function play(offset: number) {
  const seen = new Set<string>();
  await page.getByTestId('aim-arena').waitFor();
  while (await page.getByTestId('aim-arena').count()) {
    for (const target of await page.getByTestId('aim-target').all()) {
      const index = await target.getAttribute('data-index').catch(() => null), box = await target.boundingBox().catch(() => null);
      if (!index || !box || seen.has(index)) continue; seen.add(index);
      const x = box.x + box.width / 2 + offset * box.width / 2, y = box.y + box.height / 2;
      // Nothing may cover a square: the notice bar once swallowed clicks at the bottom of the arena.
      const under = await page.evaluate(([px, py]) => { const el = document.elementFromPoint(px, py), t = el?.closest('[data-index]'); return t ? t.getAttribute('data-index') : el?.closest('[data-testid=aim-arena]') ? 'arena' : `${el?.tagName}.${el?.className}`; }, [x, y]).catch(() => 'arena');
      assert.ok(under === index || under === 'arena', `quadrado ${index} coberto por ${under}`);
      await page.mouse.click(x, y);
    }
    await page.waitForTimeout(15);
  }
  return seen.size;
}
try {
  await page.getByRole('textbox', { name: 'Título da nota', exact: true }).waitFor();
  await app.evaluate(({ BrowserWindow }) => { const win = BrowserWindow.getAllWindows()[0]; win.unmaximize(); win.setSize(1440, 900); });
  await page.locator('#nodus-sidebar').getByRole('button', { name: 'Entrar na cidade', exact: true }).click();
  await page.locator('.game-shell[data-area-ready=true]').waitFor(); await canvas.and(page.locator('[data-ready=true]')).waitFor();

  // Shortcuts on the observatory and a grouped menu: every minigame is one click away and says what waits there.
  const shortcuts = page.getByRole('region', { name: 'Minigames' });
  for (const name of ['Mira', 'Memória', 'Horta', 'Conselho']) await shortcuts.getByRole('button', { name: `Abrir ${name}`, exact: true }).waitFor();
  assert.equal(await shortcuts.locator('button[data-locked]').count(), 0, 'Horta e Conselho já abertos pela fixture');
  assert.deepEqual(await page.locator('.game-nav-caption').allTextContents(), ['CIDADE', 'MINIGAMES', 'PROGRESSO']);
  for (const place of ['mira', 'horta', 'conselho', 'memória']) assert.ok(await page.getByRole('button', { name: `Visitar ${place}`, exact: true }).evaluate(el => el.classList.contains('minigame') && Boolean(el.querySelector('.place-play'))), `${place} marcado como entrada de minigame`);
  assert.equal(await canvas.getAttribute('data-bloom'), 'false', 'dia no Vale Sereno não usa brilho');
  checks.push('atalhos, menu agrupado e entradas no mapa');
  await shot('observatorio-vale-dourado');

  // The map entrance opens the Mira page.
  await page.getByRole('button', { name: 'Visitar mira', exact: true }).dispatchEvent('click');
  await page.getByRole('radiogroup', { name: 'Dificuldade da Mira' }).waitFor(); assert.equal(await nav('Mira').getAttribute('aria-current'), 'page');
  await shot('mira-inicio');

  // Easy round, every square hit at its center: 100% and paid once by the main process.
  const before = await game();
  await page.getByRole('button', { name: /Começar rodada Leve/ }).click();
  await page.locator('.aim-countdown').waitFor();
  const easyHits = await play(0);
  await page.getByTestId('aim-result').waitFor();
  let s = await game();
  assert.equal(easyHits, 20); assert.equal(s.aim.last!.accuracy, 1, JSON.stringify(s.aim.last)); assert.equal(s.aim.last!.grade, 'SS'); assert.equal(s.economy.aimRounds, 1);
  assert.ok(Number(s.coins) > Number(before.coins), 'rodada paga em centelhas'); assert.equal(s.aim.active, null);
  checks.push(`Leve: 20/20 no centro, SS, +${s.aim.last!.coins} centelhas`);
  await shot('mira-resultado-leve');

  // Hard round aimed off center: the points drop to 100 and the accuracy follows.
  await page.getByRole('radio', { name: /Difícil/ }).click(); await page.getByRole('button', { name: /Começar rodada Difícil/ }).click();
  await page.locator('.aim-countdown').waitFor(); await page.waitForTimeout(3600); await shot('mira-rodada-dificil');
  await play(.6); await page.getByTestId('aim-result').waitFor(); s = await game();
  assert.ok(s.aim.last!.counts[1] > 0 && s.aim.last!.counts[0] === 0, 'fora do centro vale 100'); assert.ok(s.aim.last!.accuracy < .5);
  checks.push(`Difícil fora do centro: ${s.aim.last!.counts.join('/')} (300/100/50/perdidos), ${(s.aim.last!.accuracy * 100).toFixed(1)}%`);
  await shot('mira-resultado-dificil');

  // Leaving halfway pays nothing.
  await page.getByRole('radio', { name: /Insano/ }).click(); await page.getByRole('button', { name: /Começar rodada Insano/ }).click();
  await page.locator('.aim-countdown').waitFor(); await page.getByRole('button', { name: 'Sair da rodada', exact: true }).click();
  await page.getByText('Rodada interrompida: nada foi pago.').waitFor(); assert.equal((await game()).economy.aimRounds, 2);
  checks.push('rodada abandonada não paga');

  // The city in each skin and atmosphere.
  for (const [skin, atmosphere, name, glow] of [['original', 'Noite', 'vale-noite', 'true'], ['cyberpunk', 'Dourado', 'cyberpunk', 'true'], ['newyork', 'Dourado', 'newyork-dourado', 'false'], ['newyork', 'Noite', 'newyork-noite', 'true']] as const) {
    await nav('Perfil').click(); await page.getByRole('combobox', { name: 'Skin da cidade' }).selectOption(skin); await page.getByRole('button', { name: atmosphere, exact: true }).click();
    await nav('Observatório').click(); await canvas.and(page.locator(`[data-skin=${skin}]`)).waitFor();
    await page.waitForFunction(g => document.querySelector('canvas[data-testid=city-canvas]')?.getAttribute('data-bloom') === g, glow);
    await shot(`observatorio-${name}`);
  }
  checks.push('três skins com brilho só no Cyberpunk e à noite');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ checks, errors }, null, 1));
} finally { await app.close(); }
