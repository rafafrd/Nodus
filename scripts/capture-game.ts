import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {_electron as electron,type Page} from 'playwright';
import {prepareFixture} from './test-fixture';
import {Store} from '../src/main/store';
import {Game} from '../src/main/game';
import {UserPreferences} from '../src/main/preferences';

// GAM-06 visual evidence on the packaged app. Generated profile: the game is played through the real Game
// API (clicks and purchases) for a few minutes of simulated time, so the store, garden and council have
// content. No personal data. --theme selects the app theme; --size the window.
const theme=(process.argv.find(a=>a.startsWith('--theme='))?.slice(8)??'editorial') as 'editorial';
const [width,height]=(process.argv.find(a=>a.startsWith('--size='))?.slice(7)??'1440x900').split('x').map(Number);
const label=process.argv.find(a=>a.startsWith('--label='))?.slice(8)??theme;
const out=path.resolve('.local/evidence/gam-06/ui');fs.mkdirSync(out,{recursive:true});
const f=prepareFixture('game-ui-'+label),data=path.join(f.dir,'data');
{ const store=new Store(data);let now=Date.now()-20*60000;const game=new Game(store,()=>now,()=>.5);const act=(action:never)=>{try{return game.act({operationId:randomUUID(),action}).state;}catch{return null;}};
  for(let second=0;second<20*60;second++){now+=1000;act({kind:'core-click',count:4} as never);let s=game.get();
    for(let i=0;i<10;i++){const p=s.economy.producersView.filter(v=>v.unlocked).sort((a,b)=>Number(a.cost)-Number(b.cost))[0];if(!p||Number(p.cost)>Number(s.coins))break;s=act({kind:'producer-buy',producer:p.id,quantity:1} as never)??s;}}
  // Fixture: the next Lampejo after 6 s of watched time, so the recording shows one.
  const raw=JSON.parse(String(store.db.prepare('SELECT state FROM game_player').get()!.state));raw.economy.watchNeedMs=6000;raw.economy.watchedMs=0;store.db.prepare('UPDATE game_player SET state=?').run(JSON.stringify(raw));
  new UserPreferences(store).update({theme,animations:true});store.close(); }
const video=process.argv.includes('--video');
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const app=await electron.launch({executablePath:path.resolve('release/win-unpacked/App Estudos.exe'),args:[`--user-data-dir=${data}`],env,...(video?{recordVideo:{dir:out,size:{width,height}}}:{})}),page:Page=await app.firstWindow();
page.setDefaultTimeout(30000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
const shots:string[]=[];
async function shot(name:string){await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`${label}-${name}.png`)});shots.push(name);}
try{
 await page.getByRole('textbox',{name:'Título da nota',exact:true}).waitFor();
 await app.evaluate(({BrowserWindow},[w,h])=>{const win=BrowserWindow.getAllWindows()[0];win.unmaximize();win.setSize(w,h);},[width,height]);
 await page.locator('#nodus-sidebar').getByRole('button',{name:'Entrar na cidade',exact:true}).click();
 await page.locator('.game-shell[data-area-ready=true]').waitFor();await page.locator('.area-stage[data-motion=idle]').waitFor();
 await shot('observatorio');
 const core=page.getByRole('button',{name:'Clicar no núcleo',exact:true});for(let i=0;i<12;i++){await core.click();await page.waitForTimeout(60);}
 await shot('cliques');
 if(video){const name=(await import('../src/shared/economy')).PRODUCERS;const s=await page.evaluate(()=>window.desktop.getGame());if(s.ok){const p=s.value.economy.producersView.filter(v=>v.unlocked).sort((a,b)=>Number(a.cost)-Number(b.cost))[0];await page.getByRole('button',{name:`Comprar 1 ${name.find(x=>x.id===p.id)!.name}`,exact:true}).click({timeout:60000});}
  await page.getByTestId('flash-light').waitFor({timeout:30000});await page.waitForTimeout(700);await shot('lampejo');await page.getByTestId('flash-light').click();await page.waitForTimeout(400);await shot('lampejo-pego');await page.waitForTimeout(1500);for(let i=0;i<10;i++){await core.click();await page.waitForTimeout(90);}await page.waitForTimeout(800);}
 for(const [tab,name] of [['Horta','horta'],['Conselho','conselho'],['Memória','memoria'],['Conquistas','conquistas'],['Legado','legado'],['Perfil','perfil']] as const){await page.getByRole('navigation',{name:'Jogo'}).getByRole('button',{name:tab,exact:true}).click();await shot(name);}
 if(video){await page.getByRole('navigation',{name:'Jogo'}).getByRole('button',{name:'Horta',exact:true}).click();await page.getByRole('group',{name:'Semente'}).getByRole('button',{name:/Flor-de-orvalho/}).click();await page.getByRole('button',{name:'Plantar Flor-de-orvalho no canteiro 1',exact:true}).click({timeout:90000});await page.waitForTimeout(800);await page.getByRole('navigation',{name:'Jogo'}).getByRole('button',{name:'Observatório',exact:true}).click();await page.waitForTimeout(1500);}
 console.log(JSON.stringify({label,shots,errors}));
}finally{const recorded=video?page.video():null;await app.close();if(recorded)fs.renameSync(await recorded.path(),path.join(out,`${label}-jogo.webm`));}
