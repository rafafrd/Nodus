import { app, BrowserWindow, ipcMain, protocol, net, session, dialog } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';
import { AppError, subjectInput, renameInput, subjectIdInput, createNoteInput, noteIdInput, noteWriteInput, deskInput, materialChoiceInput, focusStartInput, focusActionInput, taskInput, stepInput, stepUpdateInput } from '../shared/contracts';
import { Store } from './store';
import { Vault } from './vault';
import { Desks } from './desk';
import { Focus } from './focus';
import { Checklist } from './checklist';
import { Game } from './game';
import { gameInput } from '../shared/game';
protocol.registerSchemesAsPrivileged([{ scheme: 'study', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
let window: BrowserWindow;
let store: Store;
let vault: Vault;
let desks: Desks;
let focus: Focus;
let checklist: Checklist;
let game: Game;
let focusTimer: ReturnType<typeof setInterval>;
let allowClose = false;
const devUrl = !app.isPackaged && process.env.APP_DEV_URL === 'http://127.0.0.1:5173' ? process.env.APP_DEV_URL : undefined;
const startUrl = devUrl ?? 'study://app/index.html';
function handle<T>(channel: string, schema: z.ZodType<T>, action: (input: T) => unknown) {
  ipcMain.handle(channel, async (event, arg: unknown) => {
    try {
      if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame?.url !== startUrl && event.senderFrame?.url !== startUrl + '/') throw new AppError('FORBIDDEN', 'Origem não autorizada.');
      const parsed = schema.safeParse(arg);
      if (!parsed.success) throw new AppError('INVALID_ARGUMENT', 'Dados inválidos para esta operação.');
      return { ok: true, value: await action(parsed.data) };
    } catch (error) {
      try { store.audit(channel, null, error instanceof AppError ? error.code : 'INTERNAL'); } catch { /* Falha de banco não deve impedir resposta de erro. */ }
      return { ok: false, code: error instanceof AppError ? error.code : 'INTERNAL', message: error instanceof AppError ? error.message : 'Não foi possível concluir a operação. Seus dados de edição foram preservados.' };
    }
  });
}
function register() {
  handle('game:get', z.undefined(), () => game.get());
  handle('game:action', gameInput, input => game.act(input));
  handle('app:version', z.undefined(), () => ({ version: app.getVersion(), electron: process.versions.electron, node: process.versions.node }));
  handle('app:bootstrap', z.undefined(), () => store.bootstrap());
  handle('subject:create', subjectInput, input => store.createSubject(input));
  handle('subject:rename', renameInput, input => store.renameSubject(input));
  handle('vault:choose', z.undefined(), async () => {
    const result = await dialog.showOpenDialog(window, { title: 'Escolher pasta de notas (vault)', properties: ['openDirectory', 'createDirectory'] });
    return result.canceled ? null : vault.selectRoot(result.filePaths[0]);
  });
  handle('note:list', subjectIdInput, input => vault.list(input.subjectId));
  handle('note:create', createNoteInput, input => vault.create(input));
  handle('note:import', subjectIdInput, async input => {
    vault.root(); store.requireSubject(input.subjectId);
    const result = await dialog.showOpenDialog(window, { title: 'Importar Markdown: o app adicionará identidade ao frontmatter se ausente', defaultPath: vault.root(), properties: ['openFile'], filters: [{ name: 'Markdown', extensions: ['md'] }] });
    return result.canceled ? null : vault.import(input.subjectId, result.filePaths[0]);
  });
  handle('note:open', noteIdInput, input => vault.open(input.id));
  handle('note:save', noteWriteInput, input => vault.save(input));
  handle('note:draft', noteWriteInput, input => vault.draft(input));
  handle('note:discard', noteIdInput, input => vault.discard(input.id));
  handle('app:finish-close', z.undefined(), () => { focus.pauseActive(); allowClose = true; setImmediate(() => window.close()); return null; });
  handle('desk:open', subjectIdInput, input => desks.open(input.subjectId));
  handle('desk:save', deskInput, input => desks.save(input));
  handle('material:list', subjectIdInput, input => desks.listMaterials(input.subjectId));
  handle('material:read', noteIdInput, input => desks.read(input.id));
  handle('focus:get', subjectIdInput, input => focus.get(input.subjectId));
  handle('focus:start', focusStartInput, input => focus.start(input.subjectId, input.minutes));
  handle('focus:action', focusActionInput, input => focus.act(input));
  handle('task:list', subjectIdInput, input => checklist.list(input.subjectId));
  handle('task:create', taskInput, input => checklist.create(input.subjectId, input.text));
  handle('step:create', stepInput, input => checklist.add(input));
  handle('step:update', stepUpdateInput, input => checklist.update(input));
  handle('material:choose', materialChoiceInput, async input => {
    store.requireSubject(input.subjectId);
    if (input.replaceId && desks.material(input.replaceId).subjectId !== input.subjectId) throw new AppError('INVALID_REFERENCE', 'Documento de outra matéria.');
    const result = await dialog.showOpenDialog(window, { title: input.replaceId ? 'Localizar PDF novamente' : 'Abrir PDF local', properties: ['openFile'], filters: [{ name: 'PDF', extensions: ['pdf'] }] });
    return result.canceled ? null : desks.choose(input.subjectId, result.filePaths[0], input.replaceId);
  });
}
function createWindow() {
  window = new BrowserWindow({ width: 1440, height: 940, minWidth: 1000, minHeight: 700, backgroundColor: '#0c1014', title: 'App Estudos', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true } });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (url !== startUrl) event.preventDefault(); });
  window.on('close', event => { if (!allowClose) { event.preventDefault(); window.webContents.send('app:before-close'); } });
  void window.loadURL(startUrl).catch(() => { dialog.showErrorBox('Falha ao abrir a mesa', 'A interface não pôde ser carregada. Seus arquivos e o banco foram preservados. Gere a build novamente antes de reabrir.'); allowClose = true; window.close(); });
}
app.whenReady().then(() => {
  const dataDirectory = app.commandLine.getSwitchValue('user-data-dir');
  if (dataDirectory) app.setPath('userData', path.resolve(dataDirectory));
  store = new Store(app.getPath('userData'));
  vault = new Vault(store);
  desks = new Desks(store);
  focus = new Focus(store);
  checklist = new Checklist(store);
  game = new Game(store);
  focusTimer = setInterval(() => { try { focus.tick(); } catch { window?.webContents.send('app:storage-error', 'Não foi possível gravar o checkpoint de foco. Pause e tente novamente.'); } }, 1000);
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  protocol.handle('study', request => {
    const url = new URL(request.url);
    const root = path.join(__dirname, 'renderer');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const target = path.resolve(root, relative);
    if (url.host !== 'app' || !target.startsWith(root + path.sep)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(target).href);
  });
  register(); createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}).catch(error => { dialog.showErrorBox('Falha ao iniciar', error instanceof AppError ? error.message : 'Não foi possível abrir o armazenamento local. Preserve seus dados e verifique o acesso à pasta do aplicativo.'); app.exit(1); });
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => { clearInterval(focusTimer); focus?.pauseActive(); store?.close(); });
