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
import { Projects } from './projects';
import { projectTreeInput, projectFileInput, projectWriteInput, projectViewInput } from '../shared/projects';
import { UserPreferences } from './preferences';
import { photoDimensions } from './photo-input';
import { AppManagementService } from './app-management';
import { preferenceInput, photoInput, folderInput } from '../shared/preferences';
import { nativeImage, shell } from 'electron';
import { Videos } from './videos';
import { VideoPlayer } from './video-player';
import { videoAddInput, videoRefInput, videoLayoutInput } from '../shared/videos';
import { PdfExporter } from './pdf-export';
import { pdfSourceInput, pdfExportInput } from '../shared/pdf-export';
import { Study } from './study';
import { Annotations } from './annotations';
import { Backups } from './backups';
import { windowCommand } from '../shared/window';
import { backupRefInput } from '../shared/backup';
import { markListInput,markCreateInput,markRefInput,momentListInput,momentCreateInput,momentRefInput } from '../shared/study';
import { searchInput,cardListInput,cardCreateInput,cardRefInput,cardReviewInput,linkCreateInput,linkRefInput } from '../shared/study';
protocol.registerSchemesAsPrivileged([{ scheme: 'study', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }, { scheme:'nodus-pdf', privileges:{ standard:true, secure:true } }]);
let window: BrowserWindow;
let store: Store;
let vault: Vault;
let desks: Desks;
let focus: Focus;
let checklist: Checklist;
let game: Game;
let projects: Projects;
let preferences: UserPreferences;
let management: AppManagementService;
let videos: Videos;
let player: VideoPlayer;
let pdfExporter: PdfExporter;
let study: Study;
let annotations: Annotations;
let backups: Backups;
let relaunchProfile:string|null=null;
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
  handle('window:get', z.undefined(), () => windowState());
  handle('window:command', windowCommand, ({ action }) => {
    if (action === 'minimize') window.minimize();
    else if (action === 'toggle-maximize') { if (window.isMaximized()) window.unmaximize(); else window.maximize(); }
    else window.close(); // Existing draft + focus checkpoint handshake.
    return windowState();
  });
  handle('backup:preview',z.undefined(),()=>backups.preview());
  handle('backup:create',z.undefined(),()=>{focus.tick();return backups.create();});
  handle('backup:choose',z.undefined(),async()=>{const picked=await dialog.showOpenDialog(window,{title:'Selecionar pasta do snapshot Nodus (snapshot.json)',defaultPath:path.join(app.getPath('documents'),'NodusBackups'),properties:['openDirectory']});return picked.canceled?null:backups.select(picked.filePaths[0]);});
  handle('backup:restore',backupRefInput,input=>backups.restore(input.id));
  handle('backup:activate',backupRefInput,input=>{const profile=backups.restoredProfile(input.id);store.audit('backup:activate',input.id,'ok');relaunchProfile=profile;setImmediate(()=>window.close());return null;});
  handle('mark:list',markListInput,input=>annotations.marks(input));
  handle('mark:add',markCreateInput,input=>annotations.addMark(input));
  handle('mark:remove',markRefInput,input=>{annotations.removeMark(input);return null;});
  handle('moment:list',momentListInput,input=>annotations.moments(input));
  handle('moment:add',momentCreateInput,input=>annotations.addMoment(input));
  handle('moment:remove',momentRefInput,input=>{annotations.removeMoment(input);return null;});
  handle('moment:open',momentRefInput,async input=>{const moment=annotations.moment(input),video={...videos.get({subjectId:input.subjectId,id:input.videoId}),startSeconds:moment.seconds};return{video,player:await player.open(video,true)};});
  handle('study:catalog',z.undefined(),()=>study.catalog());
  handle('study:search',searchInput,input=>study.search(input.query));
  handle('study:today',z.undefined(),()=>{focus.tick();return study.today();});
  handle('card:list',cardListInput,input=>study.cards(input.subjectId));
  handle('card:create',cardCreateInput,input=>study.create(input));
  handle('card:review',cardReviewInput,input=>study.review(input));
  handle('card:remove',cardRefInput,input=>{study.remove(input);return null;});
  handle('link:list',subjectIdInput,input=>study.links(input.subjectId));
  handle('link:save',linkCreateInput,input=>study.link(input));
  handle('link:remove',linkRefInput,input=>study.unlink(input));
  handle('pdf:folders', pdfSourceInput, input => pdfExporter.folders(input));
  handle('pdf:destination',z.undefined(),async()=>{const picked=await dialog.showOpenDialog(window,{title:'Pasta de destino dos PDFs',properties:['openDirectory','createDirectory']});return picked.canceled?null:pdfExporter.chooseDestination(picked.filePaths[0]);});
  handle('pdf:export', pdfExportInput, input => pdfExporter.export(input));
  handle('preferences:get', z.undefined(), () => preferences.get());
  handle('preferences:update', preferenceInput, input => preferences.update(input));
  handle('profile:photo', photoInput, input => {
    photoDimensions(input.bytes);
    const image = nativeImage.createFromBuffer(Buffer.from(input.bytes));
    const size = image.getSize();
    if (image.isEmpty() || !size.width || !size.height || size.width > 4096 || size.height > 4096 || size.width * size.height > 4_000_000) throw new AppError('INVALID_PHOTO', 'Esta foto não pôde ser aberta. Escolha PNG ou JPEG válido.');
    const side = Math.min(size.width, size.height);
    const png = image.crop({ x: Math.floor((size.width - side) / 2), y: Math.floor((size.height - side) / 2), width: side, height: side }).resize({ width: 256, height: 256, quality: 'good' }).toPNG();
    if (!png.length || png.length > 380 * 1024) throw new AppError('INVALID_PHOTO', 'Esta foto não pôde ser preparada. Tente outra imagem.');
    return preferences.setPhoto(`data:image/png;base64,${png.toString('base64')}`);
  });
  handle('profile:photo-remove', z.undefined(), () => preferences.setPhoto(null));
  handle('app:management', z.undefined(), () => management.get());
  handle('app:folder', folderInput, async input => { const error = await shell.openPath(management.folder(input)); if (error) throw new AppError('FOLDER_UNAVAILABLE', 'Não foi possível abrir esta pasta. Confira o disco e tente novamente.'); return null; });
  handle('video:list', subjectIdInput, input => videos.list(input.subjectId));
  handle('video:add', videoAddInput, input => videos.add(input));
  handle('video:remove', videoRefInput, input => { const video = videos.get(input); videos.remove(input); player.remove(video.id); return null; });
  handle('player:open', videoRefInput, input => player.open(videos.get(input)));
  handle('player:layout', videoLayoutInput, input => player.layout(input));
  handle('player:close', z.undefined(), () => player.close());
  handle('project:list', z.undefined(), () => projects.catalog());
  handle('project:choose', z.undefined(), async () => { const picked = await dialog.showOpenDialog(window, { title: 'Abrir pasta de projeto', properties: ['openDirectory'] }); return picked.canceled ? null : projects.chooseRoot(picked.filePaths[0]); });
  handle('project:tree', projectTreeInput, input => projects.tree(input));
  handle('project:open', projectFileInput, input => projects.open(input));
  handle('project:save', projectWriteInput, input => projects.save(input));
  handle('project:draft', projectWriteInput, input => projects.draft(input));
  handle('project:discard', projectFileInput, input => projects.discard(input));
  handle('project:view', projectViewInput, input => projects.view(input));
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
  handle('app:finish-close', z.undefined(), () => { focus.pauseActive();if(relaunchProfile)app.relaunch({args:[...process.argv.slice(1).filter(arg=>!arg.startsWith('--user-data-dir=')),`--user-data-dir=${relaunchProfile}`]});allowClose = true; setImmediate(() => window.close()); return null; });
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
function windowState() { return { maximized: window.isMaximized(), minimized: window.isMinimized(), fullscreen: window.isFullScreen() }; }
function createWindow() {
  window = new BrowserWindow({ width: 1440, height: 940, minWidth: 1000, minHeight: 700, frame: false, backgroundColor: '#090a0b', title: 'Nodus', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true } });
  window.removeMenu();
  const publishWindow = () => window.webContents.send('window:state', windowState());
  window.on('maximize', publishWindow); window.on('unmaximize', publishWindow); window.on('minimize', publishWindow); window.on('restore', publishWindow); window.on('enter-full-screen', publishWindow); window.on('leave-full-screen', publishWindow);
  player = new VideoPlayer(window);
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
  projects = new Projects(store);
  preferences = new UserPreferences(store); management = new AppManagementService(store);
  pdfExporter = new PdfExporter(store, vault);
  study = new Study(store);
  videos = new Videos(store);
  annotations = new Annotations(store,desks,videos);
  backups = new Backups(store,()=>app.getPath('documents'));
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
