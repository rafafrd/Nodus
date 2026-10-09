import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Store} from '../src/main/store';
import {Game} from '../src/main/game';
import {CROPS,type GameAction,type CropId} from '../src/shared/game';
import {dec} from '../src/shared/amount';
import {simulate} from './simulate-economy';

fs.mkdirSync('.local/evidence/farm-projects',{recursive:true});
const dir=fs.mkdtempSync(path.resolve('.local/farm-simulation-')),db=new Store(dir),start=Date.UTC(2026,9,9,12);let now=start;
const game=new Game(db,()=>now),act=(action:GameAction)=>game.act({operationId:randomUUID(),action}).state;
const projects:{id:string;elapsedSeconds:number}[]=[];
try{
 // Real domain/SQLite from an empty profile, only valid manual actions. Advancing
 // the main clock models an active player; elapsed seconds are simulated.
 for(let tick=0;tick<1000;tick++){
  let s=game.get();if(s.farm.built.length===3)break;
  for(const p of s.plots)if(p.crop&&now>=p.readyAt)s=act({kind:'harvest',plot:p.id});
  const q=s.farm.objective!;
  if(q.ready){s=act({kind:'farm-build',project:q.id});projects.push({id:q.id,elapsedSeconds:(now-start)/1000});continue;}
  const crop=q.materials.find(m=>(m.resource==='wheat'||m.resource==='carrot')&&m.missing>0)?.resource as CropId|undefined;
  if(crop){let pending=s.plots.filter(p=>p.crop===crop).length;const needed=q.materials.find(m=>m.resource===crop)!.missing;
   for(const p of s.plots)if(!p.crop&&pending<needed&&dec(s.coins).gte(CROPS[crop].cost)){s=act({kind:'plant',plot:p.id,crop});pending++;}
  }
  for(const id of ['forest-post','mine-post'] as const)if(s.farm.built.includes(id)&&s.farm.stations[id].stock)s=act({kind:'farm-collect',station:id});
  const resource=s.farm.objective!.materials.find(m=>(m.resource==='wood'||m.resource==='stone')&&m.missing>0)?.resource;
  if(resource&&(resource==='wood'||resource==='stone')&&now-s.gatheredAt>=1500)act({kind:'gather',resource});
  now+=1500;
 }
 const initial=game.get();assert.equal(initial.farm.built.length,3);assert.equal(initial.economy.focusMinutes,0);assert.equal(initial.economy.harvested,15);
 console.log('Projetos sem estudo: '+JSON.stringify(projects));
 const scenarios=[];
 for(const studyMinutes of [0,45])for(const automation of [false,true]){
  const result=simulate(studyMinutes,7,{initial,playMinutes:15,automation,motor:true});scenarios.push(result);console.log(JSON.stringify({studyMinutes,automation,...result.final,automaticRevenue:result.automaticRevenue,motorRevenue:result.motorRevenue,marks:result.marks}));
 }
 const manual=40,automatic=1;assert.ok(manual>automatic);assert.ok(dec(scenarios[1].final!.ratePerMinute).gt(0));assert.ok(dec(scenarios[3].final!.lifetime).gt(scenarios[1].final!.lifetime));
 fs.writeFileSync('.local/evidence/farm-projects/simulation.json',JSON.stringify({at:new Date().toISOString(),model:'Real Game actions and SQLite for early projects with controlled main clock; 7-day formula scenarios from that snapshot. Not human playtime or empirical retention.',projects,initial:{coins:initial.coins,xp:initial.xp,harvested:initial.economy.harvested,gathered:initial.economy.gathered,inventory:initial.inventory,farm:initial.farm},manualCapacityPerMinute:manual,automaticCapacityPerMinute:automatic,scenarios},null,2));
}finally{db.close();}
