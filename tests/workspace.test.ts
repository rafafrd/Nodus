import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store } from '../src/main/store';
import { UserPreferences } from '../src/main/preferences';
import { defaultPreferences, preferenceInput } from '../src/shared/preferences';
import { activeWorkspace, workspaceTabs, workspaceRects, updateWorkspace, type WorkspaceTab } from '../src/shared/workspace';

function tab(panes: WorkspaceTab['panes'], id = randomUUID()): WorkspaceTab { return { id, panes, focused: panes[0], columnSplit: 46, rowSplit: 58 }; }

test('grade cobre a superfície sem sobreposição; três janelas reservam a coluna esquerda inteira', () => {
  const areas = ['study', 'pdf', 'video', 'graph'] as const;
  for (let count = 1; count <= 4; count++) for (const columnSplit of [20, 46, 80]) for (const rowSplit of [20, 58, 80]) {
    const rects = workspaceRects({ panes: areas.slice(0, count), columnSplit, rowSplit });
    assert.equal(rects.length, count);
    assert.equal(rects.reduce((sum, rect) => sum + rect.width * rect.height, 0), 10000);
    for (const rect of rects) { assert.ok(rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 && rect.left + rect.width <= 100 && rect.top + rect.height <= 100); }
    for (let a = 0; a < count; a++) for (let b = a + 1; b < count; b++) {
      const first = rects[a], second = rects[b];
      assert.ok(first.left + first.width <= second.left || second.left + second.width <= first.left || first.top + first.height <= second.top || second.top + second.height <= first.top);
    }
    if (count === 3) { assert.equal(rects[0].height, 100); assert.equal(rects[1].left, rects[2].left); assert.equal(rects[2].top, rowSplit); }
  }
});

test('leitura de perfil com três colunas antigas conserva dados e converte divisão sem regravar', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/workspace-legacy-')), store = new Store(dir);
  try {
    const legacy = { ...defaultPreferences, name: 'Fixture anterior', theme: 'olive', animations: false, workspaceLayout: { panes: ['study', 'pdf', 'graph'], sizes: [46, 26, 28] } };
    const { workspaceTabs: _tabs, ...stored } = legacy;
    const raw = JSON.stringify(stored); store.setSetting('preferences', raw);
    const prefs = new UserPreferences(store), current = prefs.get(), active = activeWorkspace(current.workspaceTabs);
    assert.equal(current.name, legacy.name); assert.equal(current.theme, 'olive'); assert.equal(current.animations, false);
    assert.deepEqual(active.panes, legacy.workspaceLayout.panes); assert.equal(active.columnSplit, 46); assert.ok(Math.abs(active.rowSplit - 26 / 54 * 100) < .0001);
    assert.equal(store.setting('preferences'), raw); assert.equal(store.db.prepare('PRAGMA user_version').get()!.user_version, 7);
  } finally { store.close(); }
});

test('abas persistem composição/foco/divisores independentes; transação falha sem substituir perfil', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/workspace-tabs-')); let store = new Store(dir);
  try {
    const a = tab(['study', 'pdf', 'video', 'graph']), b = tab(['review']), subject = store.createSubject({ name: 'Fixture', color: 'sage' });
    let prefs = new UserPreferences(store);
    const value = { activeTabId: b.id, tabs: [a, b] }; prefs.update({ name: 'Teste local', workspaceTabs: value });
    store.close(); store = new Store(dir); prefs = new UserPreferences(store);
    assert.deepEqual(prefs.get().workspaceTabs, value); assert.equal(activeWorkspace(prefs.get().workspaceTabs).id, b.id);
    const next = updateWorkspace(value, { ...b, panes: ['pdf'], focused: 'pdf', rowSplit: 70 });
    assert.deepEqual(next.tabs[0], a); assert.equal(value.tabs[1].panes[0], 'review');
    prefs.update({ workspaceTabs: next }); const raw = store.setting('preferences');
    store.db.exec("CREATE TRIGGER tabs_fail BEFORE INSERT ON audit_events WHEN NEW.action='preferences.update' BEGIN SELECT RAISE(FAIL,'fixture'); END;");
    assert.throws(() => prefs.update({ workspaceTabs: value })); assert.equal(store.setting('preferences'), raw);
    assert.equal(prefs.get().name, 'Teste local'); assert.equal(store.requireSubject(subject.id).name, 'Fixture');
  } finally { store.close(); }
});

test('IPC rejeita abas vazias/duplicadas, foco ausente, quinta janela, pesos inválidos e campos extras', () => {
  const a = tab(['study']), b = tab(['study', 'pdf']);
  const value = { activeTabId: a.id, tabs: [a, b] };
  assert.ok(workspaceTabs.safeParse(value).success, 'Mesmo módulo pode estar em outras abas');
  for (const invalid of [
    { ...value, tabs: [] }, { ...value, tabs: [a, a] }, { ...value, activeTabId: randomUUID() },
    { ...value, tabs: [{ ...a, panes: [] }] }, { ...value, tabs: [{ ...a, panes: ['study', 'study'] }] },
    { ...value, tabs: [{ ...a, panes: ['study', 'pdf', 'video', 'graph', 'review'] }] },
    { ...value, tabs: [{ ...a, focused: 'pdf' }] }, { ...value, tabs: [{ ...a, columnSplit: 19 }] },
    { ...value, tabs: [{ ...a, rowSplit: 81 }] }, { ...value, tabs: [{ ...a, columnSplit: NaN }] },
    { ...value, tabs: [{ ...a, path: 'C:/outside' }] }, { ...value, tabs: Array.from({ length: 33 }, () => tab(['study'])) },
  ]) assert.equal(preferenceInput.safeParse({ workspaceTabs: invalid }).success, false);
});
