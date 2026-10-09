import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Store } from '../src/main/store';
import { UserPreferences } from '../src/main/preferences';
import { AppManagementService } from '../src/main/app-management';
import { photoDimensions } from '../src/main/photo-input';
import { defaultPreferences, PHOTO_LIMIT, preferenceInput, photoInput } from '../src/shared/preferences';
import {defaultWorkspace,defaultWorkspaceTabs} from '../src/shared/workspace';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4qQAAAAASUVORK5CYII=', 'base64');

test('tema original anterior é conservado; principais persistem com rollback e argumentos limitados', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/editorial-preferences-')); let store = new Store(dir);
  try {
    const legacy = { name:'Perfil anterior', theme:'olive', animations:false, photo:null };
    const raw = JSON.stringify(legacy); store.setSetting('preferences', raw);
    let prefs = new UserPreferences(store);
    assert.deepEqual(prefs.get(), { ...legacy, sidebarCollapsed:false, editorialBackground:true, featuredProjectIds:[],workspaceLayout:defaultWorkspace,workspaceTabs:defaultWorkspaceTabs });
    assert.equal(store.setting('preferences'),raw, 'Leitura compatível não regrava o perfil');
    const ids = [randomUUID(),randomUUID()]; prefs.update({ theme:'editorial', featuredProjectIds:ids,editorialBackground:false });
    store.close(); store = new Store(dir); prefs = new UserPreferences(store);
    assert.deepEqual(prefs.get(), { ...legacy, sidebarCollapsed:false, editorialBackground:false, theme:'editorial', featuredProjectIds:ids,workspaceLayout:defaultWorkspace,workspaceTabs:defaultWorkspaceTabs });
    const before=store.setting('preferences');
    for(const featuredProjectIds of [['invalid'],[ids[0],ids[0]],Array.from({length:41},()=>randomUUID())]) {
      assert.throws(()=>prefs.update({featuredProjectIds})); assert.equal(store.setting('preferences'),before);
    }
    store.db.exec("CREATE TRIGGER editorial_audit_fail BEFORE INSERT ON audit_events WHEN NEW.action='preferences.update' BEGIN SELECT RAISE(FAIL,'fixture'); END;");
    assert.throws(()=>prefs.update({featuredProjectIds:[]})); assert.equal(store.setting('preferences'),before);
    store.db.exec('DROP TRIGGER editorial_audit_fail'); prefs.update({theme:'olive',featuredProjectIds:[]});
    assert.equal(prefs.get().name,legacy.name); assert.equal(prefs.get().animations,false); assert.equal(prefs.get().theme,'olive');
  } finally { store.close(); }
});
test('perfil/preferências persistem sem schema novo; updates e foto/audit fazem rollback sem tocar outros settings', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/preferences-data-')); let store = new Store(dir);
  try {
    const subject = store.createSubject({ name: 'Matéria preservada', color: 'sage' }); store.setSetting('other-setting', 'keep');
    let prefs = new UserPreferences(store); assert.deepEqual(prefs.get(), defaultPreferences);
    prefs.update({ name: 'Perfil de teste', theme: 'midnight', animations: false }); const photo = `data:image/png;base64,${png.toString('base64')}`; prefs.setPhoto(photo);
    store.close(); store = new Store(dir); prefs = new UserPreferences(store);
    assert.deepEqual(prefs.get(), { ...defaultPreferences, name: 'Perfil de teste', theme: 'midnight', animations: false, photo });
    assert.equal(store.db.prepare('PRAGMA user_version').get()!.user_version, 7); assert.equal(store.requireSubject(subject.id).name, 'Matéria preservada');
    const before = store.setting('preferences');
    store.db.exec("CREATE TRIGGER fail_pref BEFORE INSERT ON audit_events WHEN NEW.action LIKE 'preferences.%' OR NEW.action LIKE 'profile.%' BEGIN SELECT RAISE(FAIL,'fixture audit fail'); END;");
    assert.throws(() => prefs.update({ theme: 'graphite' })); assert.throws(() => prefs.setPhoto(null)); assert.equal(store.setting('preferences'), before); assert.equal(store.setting('other-setting'), 'keep');
    store.db.exec('DROP TRIGGER fail_pref'); prefs.setPhoto(null); assert.equal(prefs.get().photo, null); assert.equal(prefs.get().name, 'Perfil de teste');
    assert.equal(store.db.prepare("SELECT count(*) n FROM audit_events WHERE action='profile.photo-remove'").get()!.n, 1);
    store.setSetting('preferences', '{malformed'); assert.deepEqual(prefs.get(), defaultPreferences); assert.equal(store.setting('preferences'), '{malformed');
    for (const invalid of [{}, {theme:'remote'}, {name:'x'.repeat(81)}, {name:'x\0'}, {theme:undefined}, {photo:'https://example.test/photo.png'}, {animations:'false'}]) assert.equal(preferenceInput.safeParse(invalid).success, false);
  } finally { store.close(); }
});
test('foto aceita somente bytes limitados e dimensões raster limitadas antes do codec nativo', () => {
  assert.deepEqual(photoDimensions(png), { width: 1, height: 1 }); assert.equal(photoInput.safeParse({bytes:new Uint8Array(png)}).success, true);
  for (const input of [{bytes:[]}, {bytes:new Uint8Array()}, {bytes:new Uint8Array(PHOTO_LIMIT+1)}, {bytes:new Uint8Array(png),path:'C:/outside'}]) assert.equal(photoInput.safeParse(input).success, false);
  for (const invalid of [Buffer.from('<svg></svg>'),Buffer.from('https://example.test/image.png'),Buffer.alloc(50),Buffer.alloc(PHOTO_LIMIT+1)]) assert.throws(() => photoDimensions(invalid));
  const huge = Buffer.from(png); huge.writeUInt32BE(4096,16); huge.writeUInt32BE(4096,20); assert.throws(() => photoDimensions(huge));
  const zero = Buffer.from(png); zero.writeUInt32BE(0,16); assert.throws(() => photoDimensions(zero));
  const jpeg = Buffer.from([255,216,255,192,0,11,8,0,20,0,30,1,1,17,0,255,217]); assert.deepEqual(photoDimensions(jpeg),{width:30,height:20});
});

test('Home inicial e tema branco conservam perfil anterior, abas, dados e rollback', () => {
  const dir=fs.mkdtempSync(path.resolve('.local/white-preferences-'));let store=new Store(dir);
  try {
    let prefs=new UserPreferences(store);assert.equal(prefs.get().workspaceTabs.tabs[0].focused,'home');
    const legacy={name:'Perfil anterior de prova',theme:'midnight',animations:false,photo:null,workspaceLayout:{panes:['study','pdf'],sizes:[61,39]}};
    store.setSetting('preferences',JSON.stringify(legacy));store.setSetting('other-setting','keep');
    const before=prefs.get();prefs.update({theme:'white'});const saved=store.setting('preferences');
    assert.deepEqual(prefs.get(),{...before,theme:'white'});assert.equal(preferenceInput.safeParse({theme:'white'}).success,true);
    store.close();store=new Store(dir);prefs=new UserPreferences(store);assert.equal(prefs.get().theme,'white');assert.deepEqual(prefs.get().workspaceTabs,before.workspaceTabs);
    store.db.exec("CREATE TRIGGER white_audit_fail BEFORE INSERT ON audit_events WHEN NEW.action='preferences.update' BEGIN SELECT RAISE(FAIL,'fixture audit fail'); END;");
    assert.throws(()=>prefs.update({theme:'olive'}));assert.equal(store.setting('preferences'),saved);assert.equal(store.setting('other-setting'),'keep');assert.equal(store.db.prepare('PRAGMA user_version').get()!.user_version,7);
  } finally {store.close();}
});

test('menu recolhido persiste junto das abas; argumentos inválidos e falha de audit conservam o estado', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/sidebar-preferences-')); let store = new Store(dir);
  try {
    let prefs = new UserPreferences(store);
    prefs.update({sidebarCollapsed:true});
    const tabs = structuredClone(prefs.get().workspaceTabs);
    tabs.tabs[0].panes = ['study','pdf','graph']; tabs.tabs[0].focused='study'; tabs.tabs[0].columnSplit = 62;
    prefs.update({workspaceTabs:tabs, name:'Perfil de teste'});
    store.close(); store = new Store(dir); prefs = new UserPreferences(store);
    assert.equal(prefs.get().sidebarCollapsed,true); assert.deepEqual(prefs.get().workspaceTabs,tabs);
    const before = store.setting('preferences');
    for (const sidebarCollapsed of ['true',1,null,undefined]) {
      assert.throws(() => prefs.update({sidebarCollapsed} as never)); assert.equal(store.setting('preferences'),before);
    }
    store.db.exec("CREATE TRIGGER sidebar_fail BEFORE INSERT ON audit_events WHEN NEW.action='preferences.update' BEGIN SELECT RAISE(FAIL,'fixture'); END;");
    assert.throws(() => prefs.update({sidebarCollapsed:false})); assert.equal(store.setting('preferences'),before);
    store.db.exec('DROP TRIGGER sidebar_fail'); prefs.update({sidebarCollapsed:false});
    assert.equal(prefs.get().sidebarCollapsed,false); assert.deepEqual(prefs.get().workspaceTabs,tabs); assert.equal(prefs.get().name,'Perfil de teste');
  } finally { store.close(); }
});
test('gestão conta banco real e só resolve diretórios registrados, negando enum extra, arquivo e pasta ausente', () => {
  const dir = fs.mkdtempSync(path.resolve('.local/preferences-management-')), store = new Store(dir), management = new AppManagementService(store);
  try {
    store.createSubject({ name: 'Fixture', color:'sage' }); const vault = path.join(dir,'vault'); fs.mkdirSync(vault); store.setSetting('vault',vault);
    assert.equal(management.get().counts.subjects,1); assert.equal(management.get().counts.notes,0); assert.ok(management.get().databaseBytes>0);
    assert.equal(management.folder({folder:'data'}),fs.realpathSync.native(dir)); assert.equal(management.folder({folder:'vault'}),fs.realpathSync.native(vault));
    for(const invalid of [{folder:'C:/outside'}, {folder:'data',path:'C:/outside'}, {}, undefined]) assert.throws(()=>management.folder(invalid));
    store.setSetting('vault',path.join(dir,'study.sqlite')); assert.throws(()=>management.folder({folder:'vault'})); store.setSetting('vault',path.join(dir,'missing')); assert.throws(()=>management.folder({folder:'vault'}));
  } finally { store.close(); }
});

test('layout de áreas persistido: compatibilidade, limites, rollback e preservação de outros dados',()=>{
 const dir=fs.mkdtempSync(path.resolve('.local/workspace-preferences-'));let store=new Store(dir);
 try{store.setSetting('vault','fixture-vault');let prefs=new UserPreferences(store);assert.deepEqual(prefs.get().workspaceLayout,defaultPreferences.workspaceLayout);
 const layout={panes:['study','pdf','graph'],sizes:[46,26,28]} as const;
 prefs.update({workspaceLayout:{panes:[...layout.panes],sizes:[...layout.sizes]}});store.close();store=new Store(dir);prefs=new UserPreferences(store);assert.deepEqual(prefs.get().workspaceLayout,layout);
 const before=store.setting('preferences');for(const workspaceLayout of [{panes:[],sizes:[]},{panes:['study','study'],sizes:[50,50]},{panes:['study','pdf','video','city'],sizes:[25,25,25,25]},{panes:['study','pdf'],sizes:[100]},{panes:['study','pdf'],sizes:[15,85]},{panes:['study','pdf'],sizes:[40,50]},{panes:['unknown'],sizes:[100]},{panes:['study'],sizes:[NaN]}]){assert.throws(()=>prefs.update({workspaceLayout} as never));assert.equal(store.setting('preferences'),before);}
 store.db.exec("CREATE TRIGGER layout_fail BEFORE INSERT ON audit_events WHEN NEW.action='preferences.update' BEGIN SELECT RAISE(FAIL,'fixture'); END;");assert.throws(()=>prefs.update({workspaceLayout:{panes:['city'],sizes:[100]}}));assert.equal(store.setting('preferences'),before);assert.equal(store.setting('vault'),'fixture-vault');
 }finally{store.close();}
});
