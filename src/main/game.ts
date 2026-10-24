import { randomUUID, randomInt } from 'node:crypto';
import type { z } from 'zod';
import { Store } from './store';
import { AppError } from '../shared/contracts';
import { CROPS, CROP_HARVEST_MINUTES, DECOR, MEMORY_PAIRS, AIM_ARENA, AIM_LEVELS, aimScore, classFor, levelFor, gameInput, gameReadInput, type GameState, type GameResult, type GameAction, type Build, type Plot, type ShopId, type Round, type Engine, type AimLevel, type AimTarget, type AimResult } from '../shared/game';
import { PRODUCERS, UPGRADES, ACHIEVEMENTS, PERMANENT, POLICIES, FLASH_OUTCOMES, BALANCE, normalizeEconomy, freshEconomy, production, clickPower, producerCost, maxAffordable, breakdown, efficiencyIndex, effectFactor, upgradeReady, prestigeGain, nextPrestigeAt, achievementProgress, achievementReady, type Economy, type EconomyView } from '../shared/economy';
import { D, dec, amount, integer, add, sub, formatAmount, type Amount } from '../shared/amount';
import { minutesOfProduction } from '../shared/economic-activities';
import { baselineStudy, syncStudy } from './economic-study';
import { backupBeforeRulesV3, convertToRulesV3 } from './game-migration';
import type { EconomicContext } from '../shared/economy-types';
import { freshFarm, normalizeFarm, type Farm, type FarmProjectId } from '../shared/farm';

type Player = { skin: GameState['skin']; economy:Economy; farm:Farm; atmosphere: 'golden'|'dawn'|'night'; coins: Amount; xp: number; owned: ShopId[]; plots: Plot[]; build: Build; passiveAt: number; passiveCarry: Amount; roundId: string | null; engine: Engine; aimId?: string | null; aimLast?: AimResult | null; aimBest?: Partial<Record<AimLevel, number>> };
type StoredAim = { id: string; kind: 'aim'; difficulty: AimLevel; targets: AimTarget[]; startedAt: number; completed: boolean };
type StoredRound = Omit<Round, 'cards'> & { rewardVersion?:number; cards: { id: number; pair: number; text: string; matched: boolean }[] };
// Clicks and production of one real minute share a ledger row instead of one row per action.
const AGGREGATED=['production:','click:'];
export class Game {
  constructor(readonly store: Store, readonly clock: () => number = Date.now, readonly random:()=>number=Math.random) {
    backupBeforeRulesV3(store,clock());
    this.store.transaction(()=>{this.load();});
  }
  private load(): Player {
    const row = this.store.db.prepare('SELECT coins,xp,state FROM game_player WHERE id=1').get() as { coins: string; xp: number; state: string } | undefined;
    const now=this.clock();
    if (row) {
      let state=JSON.parse(row.state),coins:Amount=amount(row.coins),converted=false;
      if((state.economy?.version??0)<BALANCE.version){const r=convertToRulesV3(this.store,state,coins,now,()=>this.legacyEconomy());state=r.state;coins=r.coins;converted=true;}
      const p:Player={...state,farm:normalizeFarm(state.farm,now),skin:state.skin??'original',economy:normalizeEconomy(state.economy,now),atmosphere:state.atmosphere??'golden',engine:{level:0,clicks:0,lastClickAt:0,...state.engine},owned:state.owned??[],plots:state.plots??this.freshPlots(),build:state.build??{focus:0,review:0,planning:0,practice:0},passiveAt:state.passiveAt??now,passiveCarry:state.passiveCarry??0,roundId:state.roundId??null,coins,xp:row.xp};
      if(!p.economy.study.baselineAt)baselineStudy(this.store,p.economy);
      if(converted||!state.farm)this.save(p);
      return p;
    }
    const p: Player = { skin:'original',economy:freshEconomy(now),farm:freshFarm(now), atmosphere:'golden', coins: 0, xp: 0, owned: [], plots: this.freshPlots(), build: { focus: 0, review: 0, planning: 0, practice: 0 }, passiveAt: now, passiveCarry: 0, roundId: null, engine: { level: 0, clicks: 0, lastClickAt: 0 } };
    baselineStudy(this.store,p.economy);
    this.credit(p, 'starter', 'Boas-vindas ao observatório', 15, 0); this.save(p); return p;
  }
  private freshPlots():Plot[] {return Array.from({ length: 4 }, (_, i) => ({ id: i + 1, crop: null, plantedAt: 0, readyAt: 0 }));}
  private save(p: Player) { const { coins, xp, ...state } = p; this.store.db.prepare('INSERT INTO game_player(id,coins,xp,state) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET coins=excluded.coins,xp=excluded.xp,state=excluded.state').run(String(coins), xp, JSON.stringify(state)); }
  private credit(p: Player, source: string, action: string, coins: Amount, xp: number) {
    if (!dec(coins).isInteger()||!Number.isSafeInteger(p.xp + xp)) throw new AppError('ECONOMY_LIMIT', 'Valor econômico inválido.');
    const next=add(p.coins,coins);
    if (dec(next).lt(0)) throw new AppError('INSUFFICIENT_COINS', 'Você ainda não tem centelhas suficientes.');
    const prior=AGGREGATED.some(prefix=>source.startsWith(prefix))?this.store.db.prepare('SELECT coins,xp FROM game_ledger WHERE source=?').get(source):null;
    if(prior)this.store.db.prepare('UPDATE game_ledger SET coins=?,xp=?,at=? WHERE source=?').run(String(add(String(prior.coins),coins)),Number(prior.xp)+xp,this.clock(),source);
    else this.store.db.prepare('INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,5)').run(source,action,String(coins),xp,'{}',this.clock());
    p.coins=next; p.xp += xp; if(dec(coins).gt(0)&&source!=='starter'){p.economy.lifetime=add(p.economy.lifetime,coins);p.economy.cycleEarned=add(p.economy.cycleEarned,coins);}
  }
  private legacyEconomy():Economy {
    const e=freshEconomy();
    e.lifetime=Number(this.store.db.prepare("SELECT coalesce(sum(coins),0) n FROM game_ledger WHERE coins>0 AND source<>'starter'").get()?.n??0);e.cycleEarned=e.lifetime;
    for(const [field,action] of [['harvested','Colheita de %'],['gathered','Expedição à mina'],['rounds','Memória de Conceitos']] as const)e[field]=Number(this.store.db.prepare('SELECT count(*) n FROM game_ledger WHERE action LIKE ?').get(action)?.n??0);
    e.gathered+=Number(this.store.db.prepare("SELECT count(*) n FROM game_ledger WHERE action='Coleta no bosque'").get()?.n??0);
    e.challenges=Number(this.store.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'challenge:%'").get()?.n??0);e.version=0;return e;
  }
  private focusActive(){return Boolean(this.store.db.prepare("SELECT id FROM focus_sessions WHERE state='running' LIMIT 1").get());}
  private context(p:Player,now=this.clock(),focusActive=this.focusActive()):EconomicContext {return{clicks:p.engine.clicks,level:0,now,focusActive,dew:p.plots.filter(v=>v.crop==='dew').length};}
  private rate(p:Player,now=this.clock()) {return production(p.economy,this.context(p,now,false));}
  private offlineDays(p:Player) {return Math.min(BALANCE.extendedOfflineDays,BALANCE.offlineDays*effectFactor('offline',p.economy,this.context(p,this.clock(),false)).toNumber());}
  private economyView(p:Player):EconomyView {
    const e=p.economy,c=this.context(p),b=breakdown(e,c);
    return{...e,rate:b.final,clickPower:clickPower(e,c,b.final),multiplier:amount(new D(1).plus(dec(e.prestige).mul(BALANCE.prestigeBonus))),prestigeGain:prestigeGain(e),nextPrestigeAt:nextPrestigeAt(e),offlineDays:this.offlineDays(p),index:efficiencyIndex(e),breakdown:b,focusActive:Boolean(c.focusActive),
      producersView:PRODUCERS.map(v=>{const family=b.families.find(f=>f.id===v.id)!,count=e.producers[v.id]??0,max=maxAffordable(v,e,p.coins,c),quote=(q:number)=>producerCost(v,e,Math.min(q,BALANCE.maxUnits-count),c);return{id:v.id,count,cost:quote(1),cost10:quote(10),cost100:quote(100),max,costMax:quote(max),unlocked:e.unlocks.includes(v.id)||dec(e.lifetime).gte(v.unlock),rate:family.total,share:family.share,level:family.level,individual:family.individual,activeUpgrades:family.activeUpgrades,partners:family.partners};}),
      upgradesView:UPGRADES.map(u=>({id:u.id,owned:e.upgrades.includes(u.id),unlocked:upgradeReady(u,e,p.engine.clicks)})),
      achievementsView:ACHIEVEMENTS.map(a=>({id:a.id,unlocked:e.achievements.includes(a.id),progress:a.secret&&!e.achievements.includes(a.id)?0:achievementProgress(a,e,p.engine.clicks)}))};
  }
  private achievements(p:Player,report?:Economy['returnReport']) {
    const added=ACHIEVEMENTS.filter(a=>!p.economy.achievements.includes(a.id)&&achievementReady(a,p.economy,this.context(p)));
    if(added.length){this.settle(p,true);p.economy.achievements.push(...added.map(a=>a.id));if(report)report.milestones+=added.length;this.store.audit('game.achievements',null,'ok');}
  }
  /** Families, minigames and village pieces unlock by themselves; nothing here costs or pays. */
  private unlocks(p:Player) {
    const e=p.economy;
    for(const family of PRODUCERS)if(dec(e.lifetime).gte(family.unlock)&&!e.unlocks.includes(family.id))e.unlocks.push(family.id);
    for(const [id,rule] of [['garden',BALANCE.gardenUnlock],['council',BALANCE.councilUnlock]] as const)if(!e.unlocks.includes(id)&&(e.producers[rule.producer]??0)>=rule.count)e.unlocks.push(id);
    for(const piece of DECOR){if(dec(e.lifetime).lt(piece.at))continue;
      if('farm' in piece){if(!p.farm.built.includes(piece.id as FarmProjectId))p.farm.built.push(piece.id as FarmProjectId);}
      else if(!p.owned.includes(piece.id as ShopId)){p.owned.push(piece.id as ShopId);if(piece.id==='fields')for(const id of [5,6])if(!p.plots.some(v=>v.id===id))p.plots.push({id,crop:null,plantedAt:0,readyAt:0});}}
  }
  private settle(p: Player,boundary=false) {
    const now=this.clock();if(!Number.isSafeInteger(now))throw new AppError('CLOCK_INVALID','Confira a data do computador.');
    if(now<=p.passiveAt)return;
    const delta=now-p.passiveAt,quantum=Object.values(p.economy.producers).some(Boolean)?1000:60000;
    const elapsed=Math.min(this.offlineDays(p)*86400000,boundary?delta:Math.floor(delta/quantum)*quantum);if(!elapsed)return;
    const end=p.passiveAt+elapsed;
    // Integrate each event-expiry boundary at its actual rate; elapsed offline
    // time never receives a whole-day multiplier from a one-minute event.
    const boundaries=[p.passiveAt,...p.economy.activeEvents.map(v=>v.endsAt??0).filter(t=>t>p.passiveAt&&t<end),end].sort((a,b)=>a-b);
    let units=dec(p.passiveCarry??0);
    for(let i=1;i<boundaries.length;i++)units=units.plus(dec(this.rate(p,boundaries[i-1])).mul(boundaries[i]-boundaries[i-1]));
    const coins=integer(units.div(60000));if(dec(coins).gt(0))this.credit(p,`production:${p.economy.cycles}:${Math.floor(now/60000)}`,'Produção automática da cidade',coins,0);
    p.passiveCarry=amount(units.mod(60000));p.passiveAt=boundary?now:now-delta%quantum;
    if(delta>=BALANCE.returnAfterMs)p.economy.returnReport={elapsedMs:delta,producedMs:elapsed,credited:coins,capped:delta>this.offlineDays(p)*86400000,signals:0,milestones:0,at:now};
    p.economy.activeEvents=p.economy.activeEvents.filter(v=>(v.endsAt??0)>now);
  }
  private council(p:Player,now=this.clock()) {
    const c=p.economy.council!;
    while(c.deliberations<BALANCE.deliberationsMax&&now>=c.deliberationAt+BALANCE.deliberationMs){c.deliberations++;c.deliberationAt+=BALANCE.deliberationMs;}
    if(c.deliberations>=BALANCE.deliberationsMax||now<c.deliberationAt)c.deliberationAt=Math.min(c.deliberationAt,now);
  }
  /** Lampejo: only watched time brings it closer, never during Focus; a missed one simply leaves. */
  // watching null = an action, which neither adds nor resets watched time.
  private watch(p:Player,watching:boolean|null,focusActive:boolean) {
    const e=p.economy,now=this.clock();
    if(e.flash&&(now>e.flash.expiresAt+750||focusActive))e.flash=null;
    if(e.watchNeedMs===undefined)e.watchNeedMs=this.flashInterval(p);
    if(watching===null)return;
    if(!watching||focusActive){e.watchAt=0;return;}
    const gap=now-(e.watchAt||0);if(e.watchAt&&gap>0&&gap<=BALANCE.watchGapMs)e.watchedMs=(e.watchedMs??0)+gap;e.watchAt=now;
    if(!e.flash&&(e.watchedMs??0)>=e.watchNeedMs){e.flash={id:randomUUID(),appearedAt:now,expiresAt:now+BALANCE.flashLifetimeMs,x:.18+this.random()*.64,y:.22+this.random()*.46};e.watchedMs=0;e.watchNeedMs=this.flashInterval(p);this.store.audit('game.flash',e.flash.id,'ok');}
  }
  private flashInterval(p:Player) {return Math.round((BALANCE.flashWatchMinMs+this.random()*(BALANCE.flashWatchMaxMs-BALANCE.flashWatchMinMs))/effectFactor('eventChance',p.economy,this.context(p,this.clock(),false)).toNumber());}
  private startEvent(p:Player,type:string,durationMs:number,now:number) {
    const e=p.economy,existing=e.activeEvents.find(v=>v.type===type&&(v.endsAt??0)>now),length=Math.round(durationMs*effectFactor('duration',e,this.context(p,now,false)).toNumber());
    if(existing){existing.endsAt=Math.max(existing.endsAt??now,now)+length;return;}
    if(e.activeEvents.some(v=>(v.endsAt??0)>now))e.combos++;
    e.activeEvents.push({id:randomUUID(),type,foundAt:now,startedAt:now,endsAt:now+length});
  }
  private study(p:Player) {syncStudy(this.store,p.economy,(source,label,xp)=>this.credit(p,source,label,0,xp));}
  private readRound(id: string | null): StoredRound | null { if (!id) return null; const row = this.store.db.prepare('SELECT state FROM game_rounds WHERE id=?').get(id); return row ? JSON.parse(String(row.state)) : null; }
  /** Mira: each square keeps a distance from the previous one, so every target asks for a new aim. */
  private aimTargets(level:AimLevel):AimTarget[] {
    const spec=AIM_LEVELS[level],margin=spec.size/2+12,targets:AimTarget[]=[];
    const pick=(span:number)=>Math.round(margin+this.random()*(span-2*margin));
    for(let i=0;i<spec.targets;i++){
      let x=pick(AIM_ARENA.width),y=pick(AIM_ARENA.height);const last=targets[i-1];
      for(let tries=0;last&&tries<20&&Math.hypot(x-last.x,y-last.y)<spec.size*1.8;tries++){x=pick(AIM_ARENA.width);y=pick(AIM_ARENA.height);}
      targets.push({x,y,at:AIM_ARENA.leadMs+i*spec.gapMs,life:spec.lifeMs,size:spec.size});
    }
    return targets;
  }
  private persistRound(round: StoredRound|StoredAim) { this.store.db.prepare('INSERT INTO game_rounds(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(round.id, JSON.stringify(round)); }
  private seedCost(p:Player) {return integer(D.max(BALANCE.seedFloor,dec(this.rate(p)).mul(BALANCE.seedMinutes)));}
  private view(p: Player): GameState {
    const round = this.readRound(p.roundId),aim=this.readRound(p.aimId??null) as unknown as StoredAim|null,e=p.economy,c=this.context(p),rate=this.rate(p);
    const objective=DECOR.find(d=>'farm' in d&&!p.farm.built.includes(d.id as FarmProjectId)),next=DECOR.find(d=>dec(e.lifetime).lt(d.at))??null;
    return { skin:p.skin, atmosphere:p.atmosphere, coins:p.coins, xp:p.xp, build:p.build, owned:p.owned, plots:p.plots,
      farm:{...p.farm,objective:objective?{id:objective.id as FarmProjectId}:null}, economy:this.economyView(p),
      engine:{...p.engine,level:0,power:clickPower(e,c,rate)}, flash:e.flash??null,
      garden:{unlocked:e.unlocks.includes('garden'),seedCost:this.seedCost(p),growth:effectFactor('garden',e,c).toNumber(),dew:c.dew??0},
      council:{unlocked:e.unlocks.includes('council'),seats:e.council!.seats,deliberations:e.council!.deliberations,nextDeliberationAt:e.council!.deliberations<BALANCE.deliberationsMax?e.council!.deliberationAt+BALANCE.deliberationMs:null},
      nextDecor:next?{id:next.id,name:next.name,at:next.at}:null,
      level: levelFor(p.xp), className: classFor(p.build), now: this.clock(), passiveCoins: rate,
      round: round ? { ...round, cards: round.cards.map(card => ({ id: card.id, matched: card.matched, label: card.matched || round.selected.includes(card.id) ? card.text : null })) } : null,
      aim: { active: aim && !aim.completed ? { id: aim.id, difficulty: aim.difficulty, targets: aim.targets } : null, last: p.aimLast ?? null, best: p.aimBest ?? {} },
      recent: this.store.db.prepare('SELECT action,coins,xp,at FROM game_ledger ORDER BY id DESC LIMIT 6').all().map(row=>({...row,coins:amount(String(row.coins))})) as GameState['recent'] };
  }
  /** Shared by reads and actions: settle time, study XP, unlocks, the Lampejo clock and achievements. */
  private refresh(p:Player,watching:boolean|null) {
    const previous=p.economy.returnReport;this.settle(p);const report=p.economy.returnReport!==previous?p.economy.returnReport:undefined;
    const focusActive=this.focusActive();this.study(p);this.council(p);this.watch(p,watching,focusActive);this.unlocks(p);this.achievements(p,report);
  }
  get(raw?: z.infer<typeof gameReadInput>): GameState { const input=gameReadInput.parse(raw); return this.store.transaction(() => { const p=this.load();this.refresh(p,Boolean(input?.watching));this.save(p);return this.view(p); }); }
  act(raw: z.infer<typeof gameInput>): GameResult {
    const input = gameInput.parse(raw);
    return this.store.transaction(() => {
      const p=this.load();
      const prior = this.store.db.prepare('SELECT request,message FROM game_operations WHERE id=?').get(input.operationId);
      const request = JSON.stringify(input.action);
      if (prior) { if (prior.request !== request) throw new AppError('OPERATION_CONFLICT', 'Essa operação já foi utilizada com outra ação.'); this.refresh(p,null);this.save(p); return { state: this.view(p), message: String(prior.message), replayed: true }; }
      this.refresh(p,null);
      const message=this.apply(p,input.action,input.operationId);
      if(input.action.kind==='respec'){const name=classFor(p.build);if(name!=='Viajante'&&!p.economy.study.builds.includes(name))p.economy.study.builds.push(name);}
      this.unlocks(p);this.achievements(p);this.save(p);this.store.db.prepare('INSERT INTO game_operations(id,request,message) VALUES(?,?,?)').run(input.operationId, request, message);
      if(input.action.kind!=='core-click')this.store.audit(`game.${input.action.kind}`, input.operationId, 'ok');
      return { state: this.view(p), message, replayed: false };
    });
  }
  private apply(p:Player,a:GameAction,source:string):string {
    const e=p.economy,now=this.clock();
    switch(a.kind){
      case 'core-click':{
        // Token bucket on the main clock: 25 clicks/s on average, bursts up to one batch, so batches cannot
        // claim clicks that never happened while two batches sent close together lose nothing.
        const since=p.engine.lastClickAt?Math.max(0,now-p.engine.lastClickAt):Infinity,tokens=Math.min(BALANCE.maxClickBatch,(p.engine.clickTokens??BALANCE.maxClickBatch)+since/BALANCE.clickIntervalMs),count=Math.min(a.count,Math.floor(tokens));
        const gain=integer(dec(clickPower(e,this.context(p,now),this.rate(p))).mul(count));
        if(count)this.credit(p,`click:${e.cycles}:${Math.floor(now/60000)}`,'Cliques no núcleo',gain,0);
        p.engine.clicks+=count;p.engine.lastClickAt=now;p.engine.clickTokens=tokens-count;p.engine.lastGain=gain;
        return count<a.count?`+${formatAmount(gain)} centelhas (${count} de ${a.count} cliques contados; o núcleo conta até 25 por segundo).`:`+${formatAmount(gain)} centelhas.`;
      }
      case 'flash-catch':{
        const flash=e.flash;if(!flash||flash.id!==a.id)throw new AppError('FLASH_GONE','Esse Lampejo já passou. Outro aparece enquanto você observa a cidade.');
        // A small grace covers the IPC round trip of a click made just before the light faded.
        if(now>flash.expiresAt+750)throw new AppError('FLASH_GONE','Esse Lampejo já passou. Outro aparece enquanto você observa a cidade.');
        this.settle(p,true);e.flash=null;e.events++;
        let roll=Math.max(0,Math.min(.999999,this.random()))*FLASH_OUTCOMES.reduce((n,o)=>n+o.weight,0);const outcome=FLASH_OUTCOMES.find(o=>(roll-=o.weight)<0)??FLASH_OUTCOMES[0];
        if(outcome.id==='find'){const rate=dec(this.rate(p)),gain=integer(D.max(1,D.min(dec(p.coins).mul(BALANCE.findBankShare),rate.mul(BALANCE.findMinutes)),rate.mul(BALANCE.findFloorMinutes)));this.credit(p,`flash:${flash.id}`,'Lampejo: Achado',gain,5);return `Achado! +${formatAmount(gain)} centelhas.`;}
        this.startEvent(p,outcome.id,outcome.id==='tide'?60000:10000,now);this.credit(p,`flash:${flash.id}`,`Lampejo: ${outcome.name}`,0,5);
        return `${outcome.name}! ${outcome.description}`;
      }
      case 'council-seat':{
        if(!e.unlocks.includes('council'))throw new AppError('LOCKED',`O Conselho abre com ${BALANCE.councilUnlock.count} Oficinas.`);
        const c=e.council!;if(c.seats[a.seat]===a.policy)return 'Essa pauta já está nessa cadeira.';
        if(a.policy&&c.seats.includes(a.policy))throw new AppError('POLICY_TAKEN','Essa pauta já ocupa outra cadeira.');
        if(a.policy&&c.deliberations<1)throw new AppError('NO_DELIBERATION','Sem deliberações agora. Uma nova chega em até 30 minutos.');
        this.settle(p,true);if(a.policy){if(c.deliberations===BALANCE.deliberationsMax)c.deliberationAt=now;c.deliberations--;}
        c.seats[a.seat]=a.policy;return a.policy?`${POLICIES.find(v=>v.id===a.policy)!.name} na cadeira ${a.seat+1}.`:`Cadeira ${a.seat+1} livre.`;
      }
      case 'skin':p.skin=a.value;return 'Skin da cidade aplicada e salva.';
      case 'atmosphere':p.atmosphere=a.value;return 'Ambiente da vila atualizado.';
      case 'dismiss-return':delete e.returnReport;return 'Progresso salvo.';
      case 'producer-buy':{
        const producer=PRODUCERS.find(v=>v.id===a.producer)!;
        if(!e.unlocks.includes(producer.id)&&dec(e.lifetime).lt(producer.unlock))throw new AppError('LOCKED','Produza mais para desbloquear essa instalação.');
        this.settle(p,true);const quantity=a.quantity==='max'?maxAffordable(producer,e,p.coins,this.context(p)):a.quantity;
        if(!quantity)throw new AppError('INSUFFICIENT_COINS','Você ainda não tem centelhas suficientes.');
        if(e.producers[a.producer]+quantity>BALANCE.maxUnits)throw new AppError('MAX_LEVEL',`Limite de ${BALANCE.maxUnits} unidades por família.`);
        this.credit(p,source,`Instalação: ${producer.name} ×${quantity}`,amount(dec(producerCost(producer,e,quantity,this.context(p))).neg()),0);e.producers[a.producer]+=quantity;return `${producer.name} ×${quantity}. A produção aumentou.`;
      }
      case 'economy-upgrade':{
        const u=UPGRADES.find(v=>v.id===a.id);if(!u)throw new AppError('INVALID_UPGRADE','Melhoria desconhecida.');
        if(e.upgrades.includes(u.id))throw new AppError('ALREADY_OWNED','Essa melhoria já foi adquirida.');
        if(!upgradeReady(u,e,p.engine.clicks))throw new AppError('LOCKED','Cumpra os requisitos da melhoria primeiro.');
        this.settle(p,true);this.credit(p,source,`Melhoria: ${u.name}`,amount(dec(u.cost).neg()),0);e.upgrades.push(u.id);return `${u.name} adquirida.`;
      }
      case 'permanent-upgrade':{
        const u=PERMANENT.find(v=>v.id===a.id)!;if(e.permanent.includes(u.id))throw new AppError('ALREADY_OWNED','Essa melhoria permanente já foi adquirida.');
        if(!upgradeReady(u,e,p.engine.clicks))throw new AppError('LOCKED','Cumpra os requisitos dessa melhoria permanente.');
        if(dec(e.tokens).lt(u.cost))throw new AppError('INSUFFICIENT_PRESTIGE','Você ainda não tem insígnias suficientes.');
        this.settle(p,true);e.tokens=sub(e.tokens,u.cost);e.permanent.push(u.id);return 'Melhoria permanente adquirida.';
      }
      case 'prestige':{
        this.settle(p,true);const gain=prestigeGain(e);if(dec(gain).lt(1)||!dec(gain).eq(a.expectedGain)||e.cycles!==a.expectedCycles)throw new AppError('PRESTIGE_CHANGED','O ganho mudou. Confira a prévia de prestígio novamente.');
        this.credit(p,source,'Prestígio: início de novo ciclo',amount(dec(p.coins).neg()),0);
        e.prestige=add(e.prestige,gain);e.tokens=add(e.tokens,gain);e.legacyPrestige=add(e.legacyPrestige??0,e.legacyCredit??0);e.legacyCredit=0;e.cycles++;e.cycleEarned=0;e.producers=freshEconomy().producers;e.upgrades=[];e.activeEvents=[];e.flash=null;p.passiveCarry=0;p.passiveAt=now;
        return `Novo ciclo iniciado: +${formatAmount(gain)} insígnias e bônus permanente de ${formatAmount(amount(dec(e.prestige).mul(5)))}%.`;
      }
      case 'plant':case 'harvest':{
        if(!e.unlocks.includes('garden'))throw new AppError('LOCKED',`A Horta abre com ${BALANCE.gardenUnlock.count} Coletores.`);
        const plot=p.plots.find(v=>v.id===a.plot);if(!plot)throw new AppError('LOCKED','Esse canteiro chega com a Terra fértil.');
        if(a.kind==='plant'){
          if(plot.crop)throw new AppError('OCCUPIED','Este canteiro já está plantado.');
          this.settle(p,true);const crop=CROPS[a.crop];this.credit(p,source,`Horta: ${crop.name}`,amount(dec(this.seedCost(p)).neg()),0);
          plot.crop=a.crop;plot.plantedAt=now;plot.readyAt=now+Math.round(crop.seconds*1000/effectFactor('garden',e,this.context(p)).toNumber());return `${crop.name} plantado.`;
        }
        if(!plot.crop||now<plot.readyAt)throw new AppError('NOT_READY','Esse cultivo ainda não está pronto para colher.');
        this.settle(p,true);const id=plot.crop,crop=CROPS[id];plot.crop=null;plot.plantedAt=0;plot.readyAt=0;e.harvested++;
        if(id==='carrot'){this.startEvent(p,'amber',5*60000,now);this.credit(p,source,`Colheita: ${crop.name}`,0,crop.xp);return `${crop.name} colhida: clique ×3 por 5 minutos.`;}
        const reward=minutesOfProduction(CROP_HARVEST_MINUTES[id],BALANCE.seedFloor,e,this.context(p));this.credit(p,source,`Colheita: ${crop.name}`,reward,crop.xp);return `${crop.name} colhido: +${formatAmount(reward)} centelhas.`;
      }
      case 'respec':{
        if(Object.values(a.build).reduce((sum,v)=>sum+v,0)>levelFor(p.xp))throw new AppError('INVALID_BUILD','Você ainda não tem esses pontos de habilidade.');
        p.build=a.build;this.credit(p,source,'Redistribuição de habilidades',0,0);return 'Build atualizada. A classe acompanha suas escolhas.';
      }
      case 'start-round':{
        const existing=this.readRound(p.roundId);if(existing&&!existing.completed)return 'Rodada retomada, sem limite de tempo.';
        const count=a.difficulty==='easy'?3:a.difficulty==='normal'?6:9;
        const cards=MEMORY_PAIRS.slice(0,count).flatMap((pair,index)=>pair.map(text=>({id:0,pair:index,text,matched:false})));
        for(let i=cards.length-1;i>0;i--){const j=randomInt(i+1);[cards[i],cards[j]]=[cards[j],cards[i]];}
        cards.forEach((card,index)=>{card.id=index;});
        const round:StoredRound={id:randomUUID(),difficulty:a.difficulty,cards,selected:[],attempts:0,combo:0,maxCombo:0,completed:false,coins:0,xp:0,startedAt:now,rewardVersion:5};
        this.persistRound(round);p.roundId=round.id;return 'Encontre os pares. Jogue no seu ritmo.';
      }
      case 'flip':{
        const round=this.readRound(p.roundId);
        if(!round||round.id!==a.roundId||round.completed)throw new AppError('INVALID_ROUND','Essa rodada não está ativa.');
        const card=round.cards[a.card];if(!card||card.matched)throw new AppError('INVALID_CARD','Escolha uma carta ainda disponível.');
        if(round.selected.length===2)round.selected=[];
        if(round.selected.includes(card.id))throw new AppError('INVALID_CARD','Escolha outra carta.');
        round.selected.push(card.id);let message='Carta virada.';
        if(round.selected.length===2){
          round.attempts++;const [first,second]=round.selected.map(id=>round.cards[id]);
          if(first.pair===second.pair){first.matched=second.matched=true;round.combo++;round.maxCombo=Math.max(round.maxCombo,round.combo);round.selected=[];message='Par encontrado!';}
          else{round.combo=0;message='Essas cartas não formam um par. Escolha a próxima.';}
          if(round.cards.every(v=>v.matched)){
            const multiplier=round.difficulty==='easy'?1:round.difficulty==='normal'?2:3,pairs=round.cards.length/2,efficiency=Math.floor(pairs/round.attempts*8);
            round.coins=minutesOfProduction(BALANCE.activeRateMinutes.memory*multiplier,20*multiplier+round.maxCombo*2+efficiency,e,this.context(p),1+(round.maxCombo/pairs)*.25);
            round.xp=15*multiplier+round.cards.length+efficiency;round.completed=true;e.rounds++;if(round.attempts===pairs)e.memoryPerfect++;
            this.credit(p,`round:${round.id}`,'Memória de Conceitos',round.coins,round.xp);message=`Rodada concluída: +${formatAmount(round.coins)} centelhas e +${round.xp} XP.`;
          }
        }
        this.persistRound(round);return message;
      }
      case 'aim-start':{
        // A round left halfway is simply replaced: its squares are gone and it pays nothing.
        const aim:StoredAim={id:randomUUID(),kind:'aim',difficulty:a.difficulty,targets:this.aimTargets(a.difficulty),startedAt:now,completed:false};
        this.persistRound(aim);p.aimId=aim.id;return `Mira ${AIM_LEVELS[a.difficulty].name}: acerte o centro dos quadrados.`;
      }
      case 'aim-finish':{
        const aim=this.readRound(p.aimId??null) as unknown as StoredAim|null;
        if(!aim||aim.kind!=='aim'||aim.id!==a.roundId||aim.completed)throw new AppError('INVALID_ROUND','Essa rodada da Mira não está ativa.');
        // The main clock bounds the reward rate: a round cannot end before its last square has left.
        if(now<aim.startedAt+Math.max(...aim.targets.map(t=>t.at+t.life)))throw new AppError('AIM_TOO_SOON','A rodada ainda não terminou.');
        const seen=new Set<number>();
        for(const hit of a.hits){const t=aim.targets[hit.target];
          if(!t||seen.has(hit.target)||hit.t<t.at-50||hit.t>t.at+t.life+150)throw new AppError('INVALID_AIM','Um acerto não corresponde a um quadrado desta rodada.');seen.add(hit.target);}
        const spec=AIM_LEVELS[aim.difficulty],score=aimScore(aim.targets,a.hits,a.misclicks),perfect=score.accuracy===1;
        const coins=score.accuracy>0?minutesOfProduction(BALANCE.activeRateMinutes.aim*spec.multiplier,10*spec.multiplier,e,this.context(p),score.accuracy**2):0;
        const xp=Math.round(6*spec.multiplier*score.accuracy)+(perfect?5:0);
        aim.completed=true;this.persistRound(aim);e.aimRounds++;if(perfect)e.aimPerfect++;
        p.aimBest={...p.aimBest,[aim.difficulty]:Math.max(p.aimBest?.[aim.difficulty]??0,score.accuracy)};
        p.aimLast={difficulty:aim.difficulty,...score,misclicks:a.misclicks,coins,xp};
        this.credit(p,`aim:${aim.id}`,`Mira ${spec.name}`,coins,xp);
        return `Mira ${spec.name}: ${score.grade}, ${(score.accuracy*100).toFixed(2).replace('.',',')}% de precisão, +${formatAmount(coins)} centelhas.`;
      }
    }
  }
}
