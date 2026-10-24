import fs from 'node:fs';
import path from 'node:path';
import {_electron as electron,type Page} from 'playwright';
import {prepareFixture} from './test-fixture';

// UI-08 evidence: the same script runs on the baseline package (--label=before) and on
// the new one (--label=after). Generated fixture, real packaged app, no personal data.
// "Backdrop only" hides every shell element except the backdrop layers, so the remaining
// pixels are the background over --theme-bg: that is what ΔL* and the worst-case text
// contrast are measured on. Normal screenshots are kept as visual evidence.
const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8)??'after';
const themes=(process.argv.find(a=>a.startsWith('--themes='))?.slice(9)??'editorial,olive,graphite,midnight,white').split(',') as Theme[];
const intensities=(process.argv.find(a=>a.startsWith('--intensities='))?.slice(14)??'').split(',').filter(Boolean);
type Theme='editorial'|'olive'|'graphite'|'midnight'|'white';
const out=path.resolve('.local/evidence/ui-08',label);fs.mkdirSync(out,{recursive:true});
const f=prepareFixture('backdrop-'+label),data=path.join(f.dir,'data'),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const app=await electron.launch({executablePath:path.resolve('release/win-unpacked/App Estudos.exe'),args:[`--user-data-dir=${data}`],env}),page=await app.firstWindow();
page.setDefaultTimeout(20000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
const MEASURE=`html[data-measure-backdrop] .nodus-shell,html[data-measure-backdrop] .nodus-shell *{visibility:hidden!important}
html[data-measure-backdrop] .nodus-shell *:not(:is(.editorial-backdrop,.app-backdrop,.app-backdrop *,.home-background)){background:transparent!important;border-color:transparent!important;box-shadow:none!important}
html[data-measure-backdrop] :is(.editorial-backdrop,.app-backdrop,.app-backdrop *,.home-background,.home-background *){visibility:visible!important}
html[data-hide-backdrop] :is(.editorial-backdrop,.app-backdrop,.home-background){visibility:hidden!important;background:transparent!important}
html[data-hide-backdrop] .home-background canvas{visibility:hidden!important}`;
async function idle(){await page.locator('.area-stage[data-motion=idle]').waitFor();await page.locator('.activity-rail[aria-busy=false]').waitFor();}
async function go(name:string){await page.locator('#nodus-sidebar').getByRole('button',{name,exact:true}).click();await idle();await page.waitForTimeout(900);}
async function appearance(theme:Theme,animations:boolean,intensity?:string){
 await go('Abrir configurações');await page.getByRole('button',{name:'Aparência',exact:true}).click();
 const button=page.locator(`.settings-themes button[data-preview=${theme}]`);if(await button.getAttribute('aria-pressed')!=='true')await button.click();
 await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme);
 const toggle=page.getByRole('switch',{name:'Animações da interface',exact:true});if(await toggle.isChecked()!==animations)await toggle.click();
 await page.waitForFunction(v=>document.documentElement.dataset.animations===v,animations?'on':'off');
 if(intensity){const choice=page.locator(`[data-backdrop-intensity=${intensity}]`);await choice.click();await page.waitForFunction(v=>document.documentElement.dataset.backdropIntensity===v,intensity);}
}
// Pixel statistics computed in the page from the PNG Playwright captured (no extra dependency).
async function measure(region:{x:number;y:number;width:number;height:number}){
 const shot=(await page.screenshot({clip:region})).toString('base64');
 return page.evaluate(async png=>{
  const image=new Image();image.src='data:image/png;base64,'+png;await image.decode();
  const canvas=new OffscreenCanvas(image.width,image.height),g=canvas.getContext('2d')!;g.drawImage(image,0,0);const px=g.getImageData(0,0,image.width,image.height).data;
  const lin=(c:number)=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;},Y=(r:number,gg:number,b:number)=>.2126*lin(r)+.7152*lin(gg)+.0722*lin(b);
  const Lstar=(y:number)=>y>216/24389?116*Math.cbrt(y)-16:y*24389/27;
  const css=getComputedStyle(document.documentElement),hex=(v:string)=>{const m=v.trim().match(/^#([0-9a-f]{6})$/i);if(!m)throw Error('cor '+v);const n=parseInt(m[1],16);return[n>>16,n>>8&255,n&255] as const;};
  const bg=hex(css.getPropertyValue('--theme-bg')),text=hex(css.getPropertyValue('--theme-text')),muted=hex(css.getPropertyValue('--theme-muted'));
  const bgL=Lstar(Y(...bg)),light=bgL<50;const deltas:number[]=[];let extreme=-1,extremeColor=[0,0,0];
  for(let i=0;i<px.length;i+=4){const d=Lstar(Y(px[i],px[i+1],px[i+2]))-bgL;deltas.push(Math.abs(d));const toward=light?d:-d;if(toward>extreme){extreme=toward;extremeColor=[px[i],px[i+1],px[i+2]];}}
  deltas.sort((a,b)=>a-b);const q=(p:number)=>deltas[Math.min(deltas.length-1,Math.floor(p*deltas.length))];
  const contrast=(a:readonly number[],b:readonly number[])=>{const la=Y(a[0],a[1],a[2])+.05,lb=Y(b[0],b[1],b[2])+.05;return Math.max(la,lb)/Math.min(la,lb);};
  return{bgLstar:+bgL.toFixed(2),meanDeltaL:+(deltas.reduce((s,v)=>s+v,0)/deltas.length).toFixed(2),p50:+q(.5).toFixed(2),p95:+q(.95).toFixed(2),p99:+q(.99).toFixed(2),max:+deltas.at(-1)!.toFixed(2),coverage1:+(deltas.filter(v=>v>=1).length/deltas.length).toFixed(3),coverage3:+(deltas.filter(v=>v>=3).length/deltas.length).toFixed(3),
   extremeColor,textContrast:+contrast(text,extremeColor).toFixed(2),mutedContrast:+contrast(muted,extremeColor).toFixed(2),textOnBg:+contrast(text,bg).toFixed(2),mutedOnBg:+contrast(muted,bg).toFixed(2)};
 },shot);
}
// Contribution in the real UI: the same screen with and without the backdrop layers.
async function inUi(region:{x:number;y:number;width:number;height:number}){
 const shown=(await page.screenshot({clip:region})).toString('base64');
 await page.evaluate(()=>document.documentElement.setAttribute('data-hide-backdrop',''));await page.waitForTimeout(150);
 const hidden=(await page.screenshot({clip:region})).toString('base64');
 await page.evaluate(()=>document.documentElement.removeAttribute('data-hide-backdrop'));
 return page.evaluate(async([a,b])=>{
  const read=async(png:string)=>{const image=new Image();image.src='data:image/png;base64,'+png;await image.decode();const c=new OffscreenCanvas(image.width,image.height),g=c.getContext('2d')!;g.drawImage(image,0,0);return g.getImageData(0,0,image.width,image.height).data;};
  const [x,y]=[await read(a),await read(b)],lin=(c:number)=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
  const L=(d:Uint8ClampedArray,i:number)=>{const v=.2126*lin(d[i])+.7152*lin(d[i+1])+.0722*lin(d[i+2]);return v>216/24389?116*Math.cbrt(v)-16:v*24389/27;};
  const deltas:number[]=[];for(let i=0;i<x.length;i+=4)deltas.push(Math.abs(L(x,i)-L(y,i)));deltas.sort((p,q)=>p-q);
  const visible=deltas.filter(v=>v>=1);return{visibleFraction:+(visible.length/deltas.length).toFixed(3),visibleFraction3:+(deltas.filter(v=>v>=3).length/deltas.length).toFixed(3),p99:+deltas[Math.floor(deltas.length*.99)].toFixed(2),medianWhereVisible:visible.length?+visible[Math.floor(visible.length/2)].toFixed(2):0};
 },[shown,hidden]);
}
async function backdropOnly(name:string){
 const region=await page.locator('.workspace-body').evaluate(el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)};});
 const ui=await inUi(region);
 await page.evaluate(()=>document.documentElement.setAttribute('data-measure-backdrop',''));
 const samples=[];for(let i=0;i<3;i++){await page.waitForTimeout(700);samples.push(await measure(region));}
 await page.screenshot({path:path.join(out,name+'-backdrop-only.png'),clip:region});
 await page.evaluate(()=>document.documentElement.removeAttribute('data-measure-backdrop'));
 const worst=samples.reduce((a,b)=>b.p99>a.p99?b:a);return{ui,...worst,p99Range:[Math.min(...samples.map(s=>s.p99)),Math.max(...samples.map(s=>s.p99))]};
}
// Four seconds of the backdrop canvas itself (no UI on top), as recorded in UI-07's smoke-home-white.
async function record(name:string){
 const bytes=await page.evaluate(async()=>{const canvas=document.querySelector<HTMLCanvasElement>('canvas[data-testid=app-background],canvas[data-testid=home-background]');if(!canvas)return [];const stream=canvas.captureStream(30),chunks:Blob[]=[];const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4e6});const done=new Promise<void>(r=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>r();});recorder.start();await new Promise(r=>setTimeout(r,4000));recorder.stop();await done;stream.getTracks().forEach(t=>t.stop());return [...new Uint8Array(await new Blob(chunks).arrayBuffer())];});
 if(bytes.length)fs.writeFileSync(path.join(out,name),Buffer.from(bytes));
}
async function frames(){
 await page.evaluate(()=>{const w=window as unknown as {__frames:number[];__run:boolean};w.__frames=[];w.__run=true;let last=performance.now();const tick=(t:number)=>{w.__frames.push(t-last);last=t;if(w.__run)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 for(let i=0;i<2;i++)for(const name of ['Voltar aos estudos','Abrir configurações','Abrir início'])await go(name);
 const d=await page.evaluate(()=>{const w=window as unknown as {__frames:number[];__run:boolean};w.__run=false;return w.__frames.slice(1);});d.sort((a,b)=>a-b);
 return{frames:d.length,p50:+d[Math.floor(d.length*.5)].toFixed(1),p95:+d[Math.floor(d.length*.95)].toFixed(1),over34ms:d.filter(v=>v>34).length,over50ms:d.filter(v=>v>50).length,max:+d.at(-1)!.toFixed(1)};
}
const report:Record<string,unknown>={label,at:new Date().toISOString(),window:'1440x900',themes:{}};
try{
 await page.getByRole('textbox',{name:'Título da nota',exact:true}).waitFor();
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.unmaximize();w.setSize(1440,900);});
 await page.addStyleTag({content:MEASURE});
 await page.evaluate('window.__name=f=>f'); // tsx keepNames wraps inner functions passed to evaluate
 for(const theme of themes)for(const animations of [true,false])for(const intensity of intensities.length&&animations?intensities:[undefined]){
  const key=`${theme}-${animations?'on':'off'}${intensity?'-'+intensity:''}`;await appearance(theme,animations,intensity);
  const entry:Record<string,unknown>={};
  for(const [area,button] of [['inicio','Abrir início'],['caderno','Voltar aos estudos'],['ajustes','Abrir configurações']] as const){
   await go(button);if(area==='ajustes')await page.getByRole('button',{name:'Aparência',exact:true}).click();
   await page.waitForTimeout(400);await page.screenshot({path:path.join(out,`${key}-${area}.png`)});
   entry[area]=await backdropOnly(`${key}-${area}`);
   if(process.argv.includes('--video')&&area==='inicio'&&animations&&!intensity)await record(`${key}-fundo.webm`);
   entry[area+'Running']=await page.evaluate(()=>({editorial:document.querySelector('[data-testid=editorial-background]')?.getAttribute('data-running')??null,app:document.querySelector('[data-testid=app-backdrop]')?.getAttribute('data-running')??null,canvas:document.querySelector<HTMLCanvasElement>('canvas[data-testid=app-background],canvas[data-testid=home-background]')?.dataset.motion??null}));
  }
  if(animations&&!intensity&&(theme==='editorial'||theme==='white'))entry.frames=await frames();
  (report.themes as Record<string,unknown>)[key]=entry;console.log(key,JSON.stringify(entry));
 }
}finally{report.errors=errors;fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(report,null,2));await app.close();}
