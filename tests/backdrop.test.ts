import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { backdropAnimates } from '../src/renderer/AppBackdrop';
import { Store } from '../src/main/store';
import { UserPreferences } from '../src/main/preferences';

test('fundo só anima sem área de leitura visível; cinema e cidade não pedem movimento', () => {
  assert.equal(backdropAnimates(['home'], false), true);
  assert.equal(backdropAnimates(['settings', 'graph'], false), true);
  assert.equal(backdropAnimates(['home', 'study'], false), false, 'Caderno visível mantém o quadro parado');
  for (const reading of ['study', 'pdf', 'video'] as const) assert.equal(backdropAnimates([reading], false), false);
  assert.equal(backdropAnimates(['city'], false), false);
  assert.equal(backdropAnimates(['home'], true), false);
});

test('intensidade do fundo é aditiva, validada no main e não regrava perfis antigos', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/backdrop-preferences-')), store = new Store(dir);
  try {
    const raw = JSON.stringify({ name: '', theme: 'white', animations: true, editorialBackground: false, photo: null });
    store.setSetting('preferences', raw);
    const prefs = new UserPreferences(store);
    assert.equal(prefs.get().backgroundIntensity, 'standard');
    assert.equal(prefs.get().editorialBackground, false, 'Fundo parado salvo antes continua parado');
    assert.equal(store.setting('preferences'), raw);
    assert.throws(() => prefs.update({ backgroundIntensity: 'max' as never }));
    assert.equal(store.setting('preferences'), raw);
    assert.equal(prefs.update({ backgroundIntensity: 'vivid' }).backgroundIntensity, 'vivid');
    assert.equal(new UserPreferences(store).get().backgroundIntensity, 'vivid');
  } finally { store.close(); }
});
