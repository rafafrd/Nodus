// Farm buildings of GAM-05. Since GAM-06 they are village pieces that appear at milestones (DECOR in game.ts);
// stations no longer produce materials. The shapes stay because the 3D scene and saved profiles use them.
export const FARM_PROJECTS = [
  { id:'depot', name:'Depósito' },
  { id:'forest-post', name:'Posto do bosque' },
  { id:'mine-post', name:'Posto da mina' },
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
/** Rules v2 station production, used once to convert the stock a profile accumulated before GAM-06.
 * Full stocks discard elapsed time; regressions keep the watermark. */
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
