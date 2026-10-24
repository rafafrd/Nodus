import fs from 'node:fs';
import path from 'node:path';
import { Store } from './store';
import { AppError } from '../shared/contracts';
import { D, dec, amount, integer, add, type Amount } from '../shared/amount';
import { BALANCE, BALANCE_V2 } from '../shared/economy-balance';
import { PRODUCERS, breakdown, emptyContext, freshCouncil, normalizeEconomy } from '../shared/economy';
import { normalizeFarm, settleFarm, STATION_RESOURCE, type StationId } from '../shared/farm';
import type { Economy } from '../shared/economy-types';

/** Settings key holding the exact rules v2 row (coins, xp, state) taken inside the converting transaction. */
export const RULES_V2_BACKUP = 'game_rules_v2_backup';
const V2_PRICES:Record<string,number> = { wheat:4, carrot:8, stone:3, wood:2 };
const V2_CATALOG = PRODUCERS.map((p,i)=>({...p,base:BALANCE_V2.installationCosts[i],rate:BALANCE_V2.installationRates[i]}));
type Row = { coins:string; xp:number; state:string };
const readRow=(store:Store)=>store.db.prepare('SELECT coins,xp,state FROM game_player WHERE id=1').get() as Row|undefined;
export function needsRulesV3(store:Store) { const row=readRow(store); return Boolean(row&&(JSON.parse(row.state).economy?.version??0)<BALANCE.version); }

/** File copy of the whole database before the first conversion (SQLite VACUUM INTO, outside any transaction). */
export function backupBeforeRulesV3(store:Store,now:number) {
  if(!needsRulesV3(store))return null;
  const folder=path.join(store.directory,'backups');fs.mkdirSync(folder,{recursive:true});
  const file=path.join(folder,`antes-regras-jogo-v3-${new Date(now).toISOString().replace(/[:.]/g,'-')}.sqlite`);
  if(!fs.existsSync(file))store.db.prepare('VACUUM INTO ?').run(file);
  store.audit('game.rules-v3-backup',null,'ok');
  return file;
}

/** Rules v2 → v3, inside the caller's transaction. Progress is preserved by meaning, not by raw number:
 * the bank and the journey total keep the same number of minutes of production under the new rates,
 * insignias keep exactly the count the old formula gave, and objects that left the game become credit. */
export function convertToRulesV3(store:Store,state:Record<string,any>,coins:Amount,now:number,legacy:()=>Economy) {
  const row=readRow(store)!;if(store.setting(RULES_V2_BACKUP)===null)store.setSetting(RULES_V2_BACKUP,JSON.stringify(row));
  const raw=state.economy??legacy(),old=normalizeEconomy(structuredClone(raw),now);
  // A rules v1 profile (GAM-01/02) keeps the insignia credit it had when v2 adopted it.
  if(!state.economy?.version){old.legacyCredit=Math.max(0,Math.floor(Math.sqrt(Number(old.lifetime)/20000))-Number(raw.prestige??0));old.legacyPrestige=raw.prestige??0;}
  const context={...emptyContext(),clicks:state.engine?.clicks??0,now};
  const quiet={...old,activeEvents:[],council:freshCouncil(now)};
  const oldRate=dec(breakdown(quiet,context,V2_CATALOG).final),newRate=dec(breakdown(quiet,context).final);
  // Minutes of production stored in objects that leave the game (materials, station stock, stored signals).
  const farm=normalizeFarm(state.farm,now);settleFarm(farm,now,BALANCE.offlineDays*86400000);
  const inventory={...(state.inventory??{})} as Record<string,number>;
  for(const id of Object.keys(STATION_RESOURCE) as StationId[]){inventory[STATION_RESOURCE[id]]=(inventory[STATION_RESOURCE[id]]??0)+farm.stations[id].stock;farm.stations[id].stock=0;farm.stations[id].carryMs=0;}
  let extra=new D(0);for(const [resource,count] of Object.entries(inventory))extra=extra.plus(new D(V2_PRICES[resource]??0).mul(Math.max(0,count)));
  for(const signal of old.signals)extra=extra.plus(oldRate.mul(signal.type==='cache'?10:5));
  const k=oldRate.gt(0)?newRate.div(oldRate):new D(1),scale=(v:Amount)=>integer(dec(v).mul(k));
  const oldCoins=add(coins,integer(extra)),oldLifetime=add(old.lifetime,integer(extra));
  const e:Economy={...old,version:BALANCE.version,lifetime:scale(oldLifetime),cycleEarned:scale(add(old.cycleEarned,integer(extra))),signals:[],flash:null,watchedMs:0,watchAt:0,council:freshCouncil(now)};
  delete e.motorDay;delete e.motorEarned;
  const before=dec(oldLifetime).div(BALANCE.prestigeBase).pow(BALANCE.prestigeExponent).floor(),after=dec(e.lifetime).div(BALANCE.prestigeBase).pow(BALANCE.prestigeExponent).floor();
  e.prestigeShift=before.minus(after).toNumber();if(!Number.isSafeInteger(e.prestigeShift))throw new AppError('ECONOMY_LIMIT','Conversão de prestígio fora do intervalo.');
  // The motor level becomes the click upgrades that now play its role.
  const level=Number(state.engine?.level??0);for(const [min,id] of [[1,'pulse-1'],[5,'pulse-2']] as const)if(level>=min&&!e.upgrades.includes(id))e.upgrades.push(id);
  const challengeId=state.challengeId as string|null;
  if(challengeId){const c=store.db.prepare('SELECT state FROM game_challenges WHERE id=?').get(challengeId);if(c){const challenge=JSON.parse(String(c.state));if(['active','paused'].includes(challenge.status)){challenge.status='failed';store.db.prepare('UPDATE game_challenges SET state=? WHERE id=?').run(JSON.stringify(challenge),challengeId);}}}
  const newCoins=scale(oldCoins);
  store.db.prepare('INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,5)').run('migration:rules-v3','Conversão para as regras do jogo 3 (GAM-06)',String(amount(dec(newCoins).minus(coins))),0,JSON.stringify({ratio:k.toSignificantDigits(12).toString(),materials:inventory,signals:old.signals.length}),now);
  store.audit('game.rules-v3',null,'ok');
  const {inventory:_i,gatheredAt:_g,challengeId:_c,...rest}=state;
  return {state:{...rest,economy:e,farm,engine:{...(state.engine??{clicks:0,lastClickAt:0}),level:0},challengeId:null},coins:newCoins,ratio:k};
}

/** Restores the exact rules v2 row saved by the conversion (documented manual rollback; tested). */
export function rollbackRulesV3(store:Store) {
  return store.transaction(()=>{
    const saved=store.setting(RULES_V2_BACKUP);if(!saved)throw new AppError('NOT_FOUND','Não há cópia das regras anteriores neste perfil.');
    const row=JSON.parse(saved) as Row;
    store.db.prepare('UPDATE game_player SET coins=?,xp=?,state=? WHERE id=1').run(row.coins,row.xp,row.state);
    store.db.prepare("DELETE FROM game_ledger WHERE source='migration:rules-v3'").run();
    store.db.prepare('DELETE FROM settings WHERE key=?').run(RULES_V2_BACKUP);
    store.audit('game.rules-v3-rollback',null,'ok');
  });
}
