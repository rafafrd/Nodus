import type { Resource } from './game';

export const FARM_PROJECTS = [
  { id:'depot', name:'Depósito', benefit:'Libera os postos que produzem materiais entre visitas.', costs:{wood:10,stone:5} },
  { id:'forest-post', name:'Posto do bosque', benefit:'Produz 1 madeira por minuto, até 200 no estoque.', costs:{wood:20,stone:10,wheat:10} },
  { id:'mine-post', name:'Posto da mina', benefit:'Produz 1 pedra por minuto, até 200 no estoque.', costs:{stone:30,wood:15,carrot:5} },
] as const;
export type FarmProjectId = typeof FARM_PROJECTS[number]['id'];
export type StationId = Exclude<FarmProjectId,'depot'>;
export const STATION_CAPACITY = 200;
export const STATION_MINUTE_MS = 60000;
export const STATION_RESOURCE:Record<StationId,'wood'|'stone'> = {'forest-post':'wood','mine-post':'stone'};
export type Station = { stock:number; carryMs:number; settledAt:number };
export type Farm = { built:FarmProjectId[]; target:StationId; stations:Record<StationId,Station> };
export const freshFarm = (now:number):Farm => ({built:[],target:'forest-post',stations:{'forest-post':{stock:0,carryMs:0,settledAt:now},'mine-post':{stock:0,carryMs:0,settledAt:now}}});
export function normalizeFarm(raw:Partial<Farm>|undefined,now:number):Farm {
  const base=freshFarm(now);
  return {...base,...raw,stations:{'forest-post':{...base.stations['forest-post'],...raw?.stations?.['forest-post']},'mine-post':{...base.stations['mine-post'],...raw?.stations?.['mine-post']}}};
}
// Full stocks discard elapsed time and fractions: clearing space never unlocks
// a backlog accumulated while production was paused. Regressions keep the watermark.
export function settleFarm(farm:Farm,now:number,offlineMs:number) {
  for(const id of Object.keys(STATION_RESOURCE) as StationId[]){
    const station=farm.stations[id];if(!farm.built.includes(id)||now<=station.settledAt)continue;
    const elapsed=Math.min(now-station.settledAt,offlineMs);
    const units=station.carryMs+elapsed;
    station.stock=Math.min(STATION_CAPACITY,station.stock+Math.floor(units/STATION_MINUTE_MS));
    station.carryMs=station.stock===STATION_CAPACITY?0:units%STATION_MINUTE_MS;
    station.settledAt=now;
  }
}
export type ProjectQuote = {id:FarmProjectId;name:string;benefit:string;ready:boolean;progress:number;materials:{resource:Resource;required:number;have:number;missing:number}[]};
export function projectQuote(id:FarmProjectId,inventory:Record<Resource,number>):ProjectQuote {
  const project=FARM_PROJECTS.find(p=>p.id===id)!;
  const materials=Object.entries(project.costs).map(([resource,required])=>({resource:resource as Resource,required,have:inventory[resource as Resource],missing:Math.max(0,required-inventory[resource as Resource])}));
  const total=materials.reduce((sum,m)=>sum+m.required,0),collected=materials.reduce((sum,m)=>sum+Math.min(m.have,m.required),0);
  return {id,name:project.name,benefit:project.benefit,ready:materials.every(m=>!m.missing),progress:Math.floor(collected/total*100),materials};
}
export function nextProject(farm:Farm):FarmProjectId|null {
  if(!farm.built.includes('depot'))return 'depot';
  if(!farm.built.includes(farm.target))return farm.target;
  return (Object.keys(STATION_RESOURCE) as StationId[]).find(id=>!farm.built.includes(id))??null;
}
