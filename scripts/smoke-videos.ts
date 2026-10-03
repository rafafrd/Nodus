import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { _electron as electron } from 'playwright';
import { prepareFixture } from './test-fixture';
const fixture = prepareFixture('videos'), data = path.join(fixture.dir, 'data');
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const packaged = process.argv.includes('--packaged');
async function launch() { return electron.launch({ executablePath: path.resolve(packaged ? 'release/win-unpacked/App Estudos.exe' : 'node_modules/electron/dist/electron.exe'), args: [...(packaged ? [] : ['.']), `--user-data-dir=${data}`], env }); }
let app = await launch(), page = await app.firstWindow();
const errors: string[] = [], reports: string[] = []; page.on('pageerror', e => errors.push(e.message));
async function guest() { return app.evaluate(({webContents}) => { const wc = webContents.getAllWebContents().find(w => w.getURL().startsWith('https://www.youtube-nocookie.com/embed/')); return wc ? { id: wc.id, url: wc.getURL(), prefs: wc.getLastWebPreferences() } : null; }); }
async function remote(script: string) { return app.evaluate(async ({webContents}, code) => { const wc = webContents.getAllWebContents().find(w => w.getURL().startsWith('https://www.youtube-nocookie.com/embed/')); if (!wc) throw Error('Player ausente'); return wc.executeJavaScript(code); }, script); }
async function shot(name: string) {
  // Window capture includes the native child view; renderer capture alone does not.
  const base64 = await app.evaluate(async ({desktopCapturer, BrowserWindow}) => {
    const win = BrowserWindow.getAllWindows()[0], sources = await desktopCapturer.getSources({ types: ['window'], thumbnailSize: { width: 1440, height: 940 } });
    const source = sources.find(s => s.id === win.getMediaSourceId()); if (!source || source.thumbnail.isEmpty()) throw Error('Captura nativa indisponível'); return source.thumbnail.toPNG().toString('base64');
  }); fs.writeFileSync(`.local/evidence/videos-${name}.png`, Buffer.from(base64, 'base64'));
}
async function idle() { await page.waitForFunction(() => document.querySelector('.video-surface')?.getAttribute('data-motion') === 'idle'); }
try {
  await page.getByRole('heading', {name:'Nota A',exact:true}).waitFor();
  await page.getByRole('button', {name:'Vídeos',exact:true}).click();
  await page.getByRole('button', {name:'Salvar link do YouTube',exact:true}).click();
  await page.getByRole('textbox', {name:'Link do YouTube',exact:true}).fill('https://youtube.com.attacker.test/watch?v=M7lc1UVf-VE');
  await page.getByRole('button', {name:'Salvar link',exact:true}).click(); await page.getByRole('alert').filter({hasText:'YouTube'}).waitFor();
  assert.equal(await guest(), null);
  await page.getByRole('textbox', {name:'Link do YouTube',exact:true}).fill('https://youtu.be/M7lc1UVf-VE?si=fixture');
  await page.getByRole('textbox', {name:'Título do vídeo',exact:true}).fill('Player do YouTube · aula de demonstração');
  await page.getByRole('button', {name:'Salvar link',exact:true}).click(); await page.getByRole('dialog',{name:'Salvar vídeo do YouTube'}).waitFor({state:'hidden'});
  assert.equal(await guest(), null, 'salvar não conecta ao YouTube');
  const links = await page.evaluate(subjectId => window.desktop.listVideos({subjectId}), fixture.a.id); assert.ok(links.ok); const video = links.value[0];
  const bad = await page.evaluate(ref => window.desktop.openVideoPlayer(ref), {subjectId:fixture.b.id,id:video.id}); assert.ok(!bad.ok);
  await page.getByRole('button', {name:'Abrir player',exact:true}).click();
  await page.waitForFunction(() => !document.querySelector('.video-loading'), undefined, {timeout:30000});
  await page.waitForTimeout(2200); let info = await guest(); assert.ok(info); const guestId = info.id;
  assert.equal(info.prefs.nodeIntegration,false); assert.equal(info.prefs.contextIsolation,true); assert.equal(info.prefs.sandbox,true); assert.equal(info.prefs.webSecurity,true); assert.ok(!info.prefs.preload);
  const separation = await app.evaluate(({webContents,BrowserWindow,session}) => {const wc=webContents.getAllWebContents().find(w=>w.getURL().startsWith('https://www.youtube-nocookie.com/embed/'))!;return {distinct:wc.session!==session.defaultSession,storage:wc.session.getStoragePath(),policy:wc.getWebRTCIPHandlingPolicy(),windows:BrowserWindow.getAllWindows().length};});
  assert.ok(separation.distinct);assert.equal(separation.storage,null);assert.equal(separation.policy,'disable_non_proxied_udp');
  const capabilities = await remote('({desktop:typeof window.desktop,require:typeof require,process:typeof process,video:!!document.querySelector("video"),body:document.body.innerText})');
  assert.equal(capabilities.desktop,'undefined'); assert.equal(capabilities.require,'undefined'); assert.equal(capabilities.process,'undefined'); assert.ok(capabilities.video); assert.ok(!/153|indisponível|unavailable/i.test(capabilities.body));
  await idle(); await shot('desk');
  // Native input targets the remote WebContents, rather than clicking the renderer behind it.
  await app.evaluate(({webContents}) => {const wc=webContents.getAllWebContents().find(w=>w.getURL().startsWith('https://www.youtube-nocookie.com/embed/'))!; const size=wc.getOwnerBrowserWindow()!.contentView.children.find(v=>'webContents' in v && (v as any).webContents===wc)!.getBounds(); wc.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,x:Math.round(size.width/2),y:Math.round(size.height/2)}); wc.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,x:Math.round(size.width/2),y:Math.round(size.height/2)});});
  let playing = false; let playback: any;
  for (let i=0;i<30;i++) { playback=await remote('(()=>{const v=document.querySelector("video");return {paused:v?.paused,time:v?.currentTime,ready:v?.readyState,error:document.body.innerText}})()'); if (playback.paused===false && playback.time>1 && playback.ready>=2) {playing=true;break;} await page.waitForTimeout(1000); }
  assert.ok(playing, `Reprodução externa não comprovada: ${JSON.stringify(playback)}`);
  const t0=playback.time;
  const remoteDenied=await remote(`(async()=>{const popup=window.open('https://www.youtube.com/');let mic='';try{await navigator.mediaDevices.getUserMedia({audio:true});mic='allowed';}catch(e){mic=e.name;}location.href='https://www.youtube.com/watch?v=M7lc1UVf-VE';return {popup:popup===null,mic};})()`);
  assert.ok(remoteDenied.popup);assert.equal(remoteDenied.mic,'NotAllowedError');assert.equal((await guest())!.id,guestId);assert.ok((await guest())!.url.startsWith('https://www.youtube-nocookie.com/embed/'));
  const foreignDenied = await app.evaluate(async ({BrowserWindow}, ref) => {
    const foreign = new BrowserWindow({show:false,webPreferences:{nodeIntegration:true,contextIsolation:false,sandbox:false}});
    try {await foreign.loadURL('data:text/html,<title>Controlled IPC probe only</title>');return await foreign.webContents.executeJavaScript(`(async()=>{const {ipcRenderer}=require('electron');return Promise.all([ipcRenderer.invoke('video:list',{subjectId:'${ref.subjectId}'}),ipcRenderer.invoke('video:add',{subjectId:'${ref.subjectId}',title:'hostile fixture',url:'https://youtu.be/M7lc1UVf-VE'}),ipcRenderer.invoke('video:remove',${JSON.stringify(ref)}),ipcRenderer.invoke('player:open',${JSON.stringify(ref)}),ipcRenderer.invoke('player:layout',{visible:true,x:0,y:0,width:1000,height:700}),ipcRenderer.invoke('player:close')]);})()`);}finally{foreign.destroy();}
  },{subjectId:fixture.a.id,id:video.id});assert.ok(foreignDenied.every(r=>!r.ok && r.code==='FORBIDDEN'));
  await page.getByRole('button',{name:'Modo cinema',exact:true}).click(); await page.waitForTimeout(100); assert.equal(await page.locator('.video-surface').getAttribute('data-motion'),'moving'); await idle();
  assert.equal((await guest())!.id,guestId); assert.equal(await page.locator('.area-stage').evaluate(el=>(el as HTMLElement).inert),true); await shot('cinema');
  // Escape received by the native remote surface returns to the inline player.
  await app.evaluate(({webContents})=>{const wc=webContents.getAllWebContents().find(w=>w.getURL().startsWith('https://www.youtube-nocookie.com/embed/'))!;wc.sendInputEvent({type:'keyDown',keyCode:'Escape'});wc.sendInputEvent({type:'keyUp',keyCode:'Escape'});});
  await page.locator('.video-surface[data-mode=inline]').waitFor(); await idle();
  await page.getByRole('button',{name:'Vídeo em PiP',exact:true}).click(); await idle();
  const mover=page.getByRole('button',{name:'Mover vídeo flutuante',exact:true}), before=await page.locator('.video-surface').boundingBox(); assert.ok(before);
  const handle=await mover.boundingBox(); assert.ok(handle); await page.mouse.move(handle.x+40,handle.y+20);await page.mouse.down();await page.mouse.move(120,380,{steps:12});await page.mouse.up();await idle(); const after=await page.locator('.video-surface').boundingBox(); assert.ok(after && after.x<before.x-100);
  await mover.focus();await mover.press('ArrowRight');await idle(); assert.ok((await page.locator('.video-surface').boundingBox())!.x>after.x);
  await page.getByRole('button',{name:'Abrir Explorer',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-area=explorer]')?.getAttribute('aria-hidden')==='false' && document.querySelector('[data-testid=area-stage]')?.getAttribute('data-motion')==='idle');
  assert.equal((await guest())!.id,guestId); const continued=await remote('({time:document.querySelector("video")?.currentTime,paused:document.querySelector("video")?.paused})'); assert.ok(continued.time>t0 && !continued.paused); await shot('pip-explorer');
  await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Modo cinema',exact:true}).click(); await idle(); assert.equal((await guest())!.id,guestId);await page.keyboard.press('Escape');await page.locator('.video-surface[data-mode=pip]').waitFor();await idle();
  await page.setViewportSize({width:1040,height:760});await idle(); const compact=await page.locator('.video-surface').boundingBox(); assert.ok(compact && compact.x>=0 && compact.y>=0 && compact.x+compact.width<=1040 && compact.y+compact.height<=760);await shot('compact-pip');
  await page.setViewportSize({width:1424,height:900});await idle();
  await page.getByRole('button',{name:'Voltar vídeo à mesa',exact:true}).click();await page.locator('.video-surface[data-mode=inline]').waitFor();await idle();assert.equal((await guest())!.id,guestId);
  await page.getByRole('button',{name:'Salvar link do YouTube',exact:true}).click();await page.getByRole('dialog',{name:'Salvar vídeo do YouTube'}).waitFor();await page.waitForTimeout(100);
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].contentView.children.filter(v=>'webContents'in v && (v as any).webContents.getURL().startsWith('https://www.youtube-nocookie.com/embed/')).some(v=>v.getVisible())),false);await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'Salvar vídeo do YouTube'}).waitFor({state:'hidden'});
  // A native child view cannot inherit the library's clipping; real scroll promotes it to PiP.
  await page.getByRole('button',{name:'Abrir todos os módulos',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.desk')?.getAttribute('data-layout-motion')==='idle');await page.locator('.video-library').evaluate(el=>{el.scrollTop=80;});await page.locator('.video-surface[data-mode=pip]').waitFor();await idle();assert.equal((await guest())!.id,guestId);
  await page.getByRole('button',{name:'Fechar módulo foco',exact:true}).click();
  await page.getByRole('button',{name:'Matéria B',exact:true}).click();await page.getByRole('heading',{name:'Nota B',exact:true}).waitFor();assert.ok((await page.locator('.video-surface-footer').textContent())?.includes('Matéria A'));
  await page.getByRole('button',{name:'Voltar vídeo à mesa',exact:true}).click();await page.getByRole('heading',{name:'Nota A',exact:true}).waitFor();await idle();
  await page.getByRole('button',{name:'Vídeo em PiP',exact:true}).click();await idle();await page.getByRole('button',{name:'Entrar na cidade',exact:true}).click();await page.locator('canvas[data-ready=true]').waitFor();await page.getByRole('button',{name:'Oficina',exact:true}).click();await page.getByRole('button',{name:/Sincronizar o motor/}).click();await page.locator('.game-shell[aria-busy=false]').waitFor();
  const challenge=await page.evaluate(()=>window.desktop.getGame());assert.ok(challenge.ok && challenge.value.challenge);const hidden=challenge.value.challenge;
  await page.getByRole('button',{name:'Modo cinema',exact:true}).click();await idle();await page.keyboard.press(hidden.sequence[0]);const underCinema=await page.evaluate(()=>window.desktop.getGame());assert.ok(underCinema.ok && underCinema.value.challenge?.stage===hidden.stage && underCinema.value.challenge.hits===0);
  await page.getByRole('button',{name:'Fechar player',exact:true}).click();await page.locator('.video-surface').waitFor({state:'hidden'});await page.getByRole('button',{name:/^Encerrar tentativa/}).click();await page.locator('.game-shell[aria-busy=false]').waitFor();
  await page.getByRole('button',{name:'Voltar aos estudos',exact:true}).click();await page.getByRole('button',{name:'Abrir player',exact:true}).waitFor();
  assert.equal(await guest(),null);
  await app.close(); app=await launch();page=await app.firstWindow();page.on('pageerror',e=>errors.push(e.message));await page.getByRole('heading',{name:'Nota A',exact:true}).waitFor();await page.getByRole('button',{name:'Abrir player',exact:true}).waitFor();assert.equal(await guest(),null);
  assert.equal((await page.evaluate(subjectId=>window.desktop.listVideos({subjectId}),fixture.a.id) as any).value[0].id,video.id);
  // Crash only the isolated remote renderer in this fixture; the app renderer stays alive.
  await page.getByRole('button',{name:'Abrir player',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.video-loading'),undefined,{timeout:30000});
  await app.evaluate(({webContents})=>webContents.getAllWebContents().find(w=>w.getURL().startsWith('https://www.youtube-nocookie.com/embed/'))!.forcefullyCrashRenderer());
  await page.getByRole('button',{name:'Tentar novamente',exact:true}).waitFor();assert.ok((await page.locator('.video-loading').textContent())?.includes('interrompido'));
  await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.video-loading'),undefined,{timeout:30000});assert.ok(await remote('!!document.querySelector("video")'));
  await page.getByRole('button',{name:'Fechar player',exact:true}).click();await page.locator('.video-surface').waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Matéria B',exact:true}).click();await page.getByRole('heading',{name:'Nota B',exact:true}).waitFor();await page.getByRole('button',{name:'Vídeos',exact:true}).click();assert.equal(await page.getByRole('navigation',{name:'Vídeos salvos',exact:true}).locator('button').count(),0);
  await page.getByRole('button',{name:'Matéria A',exact:true}).click();await page.getByRole('button',{name:`Remover link ${video.title}`,exact:true}).click();await page.getByRole('button',{name:'Abrir player',exact:true}).waitFor({state:'hidden'});
  await page.getByRole('button',{name:'PDFs',exact:true}).click();await page.locator('canvas[data-rendered-page="2"]').waitFor();
  assert.deepEqual(errors,[]);
  reports.push('Salvamento, URL inválida, identificação estável, isolamento por matéria, seleção/restart e remoção pelo IPC real.');
  reports.push('Player oficial YouTube carregado e reproduzido pela rede real; native input, sem bridge/Node/preload, um WebContents conservado em cinema/PiP/Explorer.');
  reports.push('Cinema/retorno por Escape nativo, PiP por mouse/teclado, resize compacto e movimento reduzido; fechamento destrói player e conserva link; restart não conecta; PDF2 preservado.');
  reports.push('Sessão efêmera distinta/UDP policy; popup/navegação/microfone negados; seis IPCs negados de janela hostil de prova; diálogos escondem view, scroll promove PiP e cinema não consome QTE oculto.');
  reports.push('Crash real do renderer remoto isolado conserva link e mostra nova tentativa; retry carrega o player real novamente sem derrubar a mesa.');
  fs.writeFileSync('.local/evidence/videos-results.json',JSON.stringify({date:new Date().toISOString(),packaged,fixture:fixture.dir,reports,capabilities,separation,remoteDenied,foreignDenied,guestId,t0,continued,compact,errors},null,2));
} catch(error) {await shot('failure').catch(()=>{});throw error;}
finally {await app.close();}
console.log(reports.join('\n'));
