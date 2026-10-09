import { randomUUID, randomInt } from 'node:crypto';
import type { z } from 'zod';
import { Store } from './store';
import { AppError } from '../shared/contracts';
import { CROPS, SHOP, RESOURCES, MEMORY_PAIRS, classFor, levelFor, type GameState, type GameResult, type Build, type Plot, type Resource, type ShopId, type Round, gameInput } from '../shared/game';
import { challengeTotal, challengeReadyAt, challengePhase, engineCost, enginePower, skillPosition, type Engine, type Challenge, type GameAction } from '../shared/game';

import { PRODUCERS, UPGRADES, ACHIEVEMENTS, PERMANENT, SIGNALS, BALANCE, normalizeEconomy, freshEconomy, production, pulseMultiplier, producerCost, maxAffordable, breakdown, efficiencyIndex, effectFactor, upgradeReady, prestigeGain, nextPrestigeAt, achievementProgress, achievementReady, type Economy, type EconomyView } from '../shared/economy';
import { D, dec, amount, integer, add, sub, formatAmount, type Amount } from '../shared/amount';
import { activityReward } from '../shared/economic-activities';
import { baselineStudy, syncStudy } from './economic-study';
import type { EconomicContext } from '../shared/economy-types';
import { FARM_PROJECTS, STATION_RESOURCE, freshFarm, normalizeFarm, settleFarm, nextProject, projectQuote, type Farm } from '../shared/farm';
import {motorQuote} from '../shared/motor';

type Player = { skin: GameState['skin']; economy:Economy; farm:Farm; atmosphere: 'golden'|'dawn'|'night'; coins: Amount; xp: number; inventory: Record<Resource, number>; owned: ShopId[]; plots: Plot[]; build: Build; gatheredAt: number; passiveAt: number; passiveCarry: Amount; roundId: string | null; engine: Engine; challengeId: string | null };
type StoredRound = Omit<Round, 'cards'> & { rewardVersion?:number; cards: { id: number; pair: number; text: string; matched: boolean }[] };
export class Game {
  constructor(readonly store: Store, readonly clock: () => number = Date.now, readonly random:()=>number=Math.random) { this.store.transaction(()=>{this.load();}); }
  private load(): Player {
    const row = this.store.db.prepare('SELECT coins,xp,state FROM game_player WHERE id=1').get() as { coins: string; xp: number; state: string } | undefined;
    if (row) {
      const state=JSON.parse(row.state),legacy=!state.economy?.version;
      const p:Player={...state,farm:normalizeFarm(state.farm,this.clock()),skin:state.skin??'original',economy:normalizeEconomy(state.economy??this.legacyEconomy(),this.clock()),atmosphere:state.atmosphere??'golden',engine:state.engine??{level:0,clicks:0,lastClickAt:0},challengeId:state.challengeId??null,coins:amount(row.coins),xp:row.xp};
      if(!state.farm)this.save(p); // Establish an empty baseline once, never retroactive materials.
      if(legacy){
        // Credit elapsed time under the previous rules before adopting new rates.
        const raw=state.economy??this.legacyEconomy(),oldBase=PRODUCERS.slice(0,5).reduce((sum,v,i)=>sum+[3,18,105,700,4800][i]*(raw.producers[v.id]??0)*2**[1,2,3].filter(i=>raw.upgrades.includes(`${v.id}-${i}`)).length,0)+(p.owned.includes('windmill')?4+p.build.focus:0);
        PRODUCERS.slice(0,5).forEach((v,i)=>{if(dec(raw.lifetime).gte([0,200,1500,12000,90000][i])&&!p.economy.unlocks.includes(v.id))p.economy.unlocks.push(v.id);});
        const oldRate=Math.round(oldBase*(1+Number(raw.prestige)*.05)*(1+raw.achievements.length*.01)*(1+raw.upgrades.filter((id:string)=>id.startsWith('network-')).length*.25)*(raw.permanent.includes('shared-knowledge')?1.25:1)*100)/100;
        this.settle(p,true,oldRate);p.economy.legacyCredit=Math.max(0,Math.floor(Math.sqrt(Number(p.economy.lifetime)/20000))-Number(raw.prestige));p.economy.legacyPrestige=raw.prestige;baselineStudy(this.store,p.economy);this.save(p);this.store.audit('game.economy-migrate',null,'ok');
      }
      return p;
    }
    const p: Player = { skin:'original',economy:freshEconomy(this.clock()),farm:freshFarm(this.clock()), atmosphere:'golden', coins: 0, xp: 0, inventory: { wheat: 0, carrot: 0, stone: 0, wood: 0 }, owned: [], plots: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, crop: null, plantedAt: 0, readyAt: 0 })), build: { focus: 0, review: 0, planning: 0, practice: 0 }, gatheredAt: 0, passiveAt: this.clock(), passiveCarry: 0, roundId: null, engine: { level: 0, clicks: 0, lastClickAt: 0 }, challengeId: null };
    baselineStudy(this.store,p.economy);
    this.credit(p, 'starter', 'Boas-vindas à vila', 60, 0); this.save(p); return p;
  }
  private save(p: Player) { const { coins, xp, ...state } = p; this.store.db.prepare('INSERT INTO game_player(id,coins,xp,state) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET coins=excluded.coins,xp=excluded.xp,state=excluded.state').run(String(coins), xp, JSON.stringify(state)); }
  private credit(p: Player, source: string, action: string, coins: Amount, xp: number, resources: Partial<Record<Resource, number>> = {}) {
    if (!dec(coins).isInteger()||!Number.isSafeInteger(p.xp + xp)) throw new AppError('ECONOMY_LIMIT', 'Valor econômico inválido.');
    const next=add(p.coins,coins);dec(next);
    if (dec(next).lt(0)) throw new AppError('INSUFFICIENT_COINS', 'Você ainda não tem Produção suficiente.');
    for (const [key, delta] of Object.entries(resources)) {
      const next=p.inventory[key as Resource]+delta;
      if(next<0)throw new AppError('INSUFFICIENT_RESOURCE', 'Você ainda não tem esse recurso em quantidade suficiente.');
      if(!Number.isSafeInteger(next))throw new AppError('ECONOMY_LIMIT','O inventário atingiu seu limite. Venda materiais antes de recolher.');
    }
    // Passive credits in the same real minute share one ledger row, rather than
    // generating tens of thousands of records while the city stays open.
    const prior=source.startsWith('production:')?this.store.db.prepare('SELECT coins FROM game_ledger WHERE source=?').get(source):null;
    if(prior)this.store.db.prepare('UPDATE game_ledger SET coins=?,at=? WHERE source=?').run(String(add(String(prior.coins),coins)),this.clock(),source);
    else this.store.db.prepare('INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,4)').run(source,action,String(coins),xp,JSON.stringify(resources),this.clock());
    p.coins=next; p.xp += xp; if(dec(coins).gt(0)&&source!=='starter'){p.economy.lifetime=add(p.economy.lifetime,coins);p.economy.cycleEarned=add(p.economy.cycleEarned,coins);} for (const [key, delta] of Object.entries(resources)) p.inventory[key as Resource] += delta;
  }
  private legacyEconomy():Economy {
    const e=freshEconomy();
    e.lifetime=Number(this.store.db.prepare("SELECT coalesce(sum(coins),0) n FROM game_ledger WHERE coins>0 AND source<>'starter'").get()?.n??0);e.cycleEarned=e.lifetime;
    for(const [field,action] of [['harvested','Colheita de %'],['gathered','Expedição à mina'],['rounds','Memória de Conceitos']] as const)e[field]=Number(this.store.db.prepare('SELECT count(*) n FROM game_ledger WHERE action LIKE ?').get(action)?.n??0);
    e.gathered+=Number(this.store.db.prepare("SELECT count(*) n FROM game_ledger WHERE action='Coleta no bosque'").get()?.n??0);
    e.challenges=Number(this.store.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'challenge:%'").get()?.n??0);return e;
  }
  private context(p:Player,now=this.clock()):EconomicContext {return{clicks:p.engine.clicks,level:p.engine.level,millRate:p.owned.includes('windmill')?4+p.build.focus:0,build:p.build,now,focusActive:Boolean(this.store.db.prepare("SELECT id FROM focus_sessions WHERE state='running' LIMIT 1").get())};}
  private motor(p:Player) {
    const day=new Date(this.clock()).toLocaleDateString('sv-SE');
    // Backward dates cannot reset a used daily budget. Only a later local day does.
    const spent=!p.economy.motorDay||day>p.economy.motorDay?0:p.economy.motorEarned??0;
    const installed={...p.economy,activeEvents:[]},referenceRate=production(installed,0,this.context(p));
    return motorQuote(referenceRate,p.engine.level,pulseMultiplier(installed),spent);
  }
  private rate(p:Player,now=this.clock()) {return production(p.economy,0,this.context(p,now));}
  private offlineDays(p:Player) {return Math.min(BALANCE.extendedOfflineDays,BALANCE.offlineDays*effectFactor('offline',p.economy,this.context(p)).toNumber());}
  private economyView(p:Player):EconomyView {
    const e=p.economy,c=this.context(p),b=breakdown(e,c);
    return{...e,rate:b.final,multiplier:amount(new D(1).plus(dec(e.prestige).mul(BALANCE.prestigeBonus))),prestigeGain:prestigeGain(e),nextPrestigeAt:nextPrestigeAt(e),offlineDays:this.offlineDays(p),index:efficiencyIndex(e),breakdown:b,focusActive:Boolean(c.focusActive),activityQuotes:{gather:activityReward('gather',4+p.build.practice,e,c),focusMinute:activityReward('focus',BALANCE.focusFloorPerMinute,e,c),review:activityReward('review',BALANCE.reviewFloor,e,c)},
      producersView:PRODUCERS.map(v=>{const family=b.families.find(f=>f.id===v.id)!,count=e.producers[v.id]??0,max=maxAffordable(v,e,p.coins,c),quote=(q:number)=>producerCost(v,e,Math.min(q,BALANCE.maxUnits-count),c);return{id:v.id,count,cost:quote(1),cost10:quote(10),cost100:quote(100),max,costMax:quote(max),unlocked:e.unlocks.includes(v.id)||dec(e.lifetime).gte(v.unlock),rate:family.total,share:family.share,level:family.level,individual:family.individual,activeUpgrades:family.activeUpgrades,partners:family.partners};}),
      upgradesView:UPGRADES.map(u=>({id:u.id,owned:e.upgrades.includes(u.id),unlocked:upgradeReady(u,e,p.engine.clicks,p.engine.level)})),
      achievementsView:ACHIEVEMENTS.map(a=>({id:a.id,unlocked:e.achievements.includes(a.id),progress:a.secret&&!e.achievements.includes(a.id)?0:achievementProgress(a,e,p.engine.clicks)}))};
  }
  private achievements(p:Player,report?:Economy['returnReport']) {
    for(const family of PRODUCERS)if(dec(p.economy.lifetime).gte(family.unlock)&&!p.economy.unlocks.includes(family.id))p.economy.unlocks.push(family.id);
    const added=ACHIEVEMENTS.filter(a=>!p.economy.achievements.includes(a.id)&&achievementReady(a,p.economy,this.context(p)));
    if(added.length){this.settle(p,true);p.economy.achievements.push(...added.map(a=>a.id));if(report)report.milestones+=added.length;this.store.audit('game.achievements',null,'ok');this.save(p);}
  }
  private settle(p: Player,boundary=false,legacyRate?:number) {
    const now=this.clock();if(!Number.isSafeInteger(now))throw new AppError('CLOCK_INVALID','Confira a data do computador.');
    settleFarm(p.farm,now,this.offlineDays(p)*86400000);
    if(now<=p.passiveAt)return;
    const delta=now-p.passiveAt,quantum=Object.values(p.economy.producers).some(Boolean)?1000:60000;
    const elapsed=Math.min(this.offlineDays(p)*86400000,boundary?delta:Math.floor(delta/quantum)*quantum);if(!elapsed)return;
    const end=p.passiveAt+elapsed;
    // Integrate each event-expiry boundary at its actual rate; elapsed offline
    // time never receives a whole-day multiplier from a five-minute event.
    const boundaries=[p.passiveAt,...p.economy.activeEvents.map(v=>v.endsAt??0).filter(t=>t>p.passiveAt&&t<end),end].sort((a,b)=>a-b);
    let units=dec(p.passiveCarry??0);
    for(let i=1;i<boundaries.length;i++)units=units.plus(dec(legacyRate??this.rate(p,boundaries[i-1])).mul(boundaries[i]-boundaries[i-1]));
    const coins=integer(units.div(60000));if(dec(coins).gt(0))this.credit(p,`production:${p.economy.cycles}:${Math.floor(now/60000)}`,'Produção automática da cidade',coins,0);
    p.passiveCarry=amount(units.mod(60000));p.passiveAt=boundary?now:now-delta%quantum;
    if(delta>=BALANCE.returnAfterMs)p.economy.returnReport={elapsedMs:delta,producedMs:elapsed,credited:coins,capped:delta>this.offlineDays(p)*86400000,signals:0,milestones:0,at:now};
    p.economy.activeEvents=p.economy.activeEvents.filter(v=>(v.endsAt??0)>now);this.save(p);
  }
  private study(p:Player) {syncStudy(this.store,p.economy,this.context(p),(source,label,reward)=>this.credit(p,source,label,reward,0));}
  private signals(p:Player,report?:Economy['returnReport']) {
    const e=p.economy,now=this.clock();if(now<e.nextSignalAt||!Object.values(e.producers).some(Boolean))return;
    const interval=Math.round(BALANCE.signalEveryMs/effectFactor('eventChance',e,this.context(p)).toNumber()),due=Math.min(BALANCE.maxStoredSignals,Math.floor((now-e.nextSignalAt)/interval)+1),space=BALANCE.maxStoredSignals-e.signals.length;
    const candidates=SIGNALS.filter(s=>!s.build||p.build[s.build]>0),total=candidates.reduce((n,s)=>n+s.weight,0);
    for(let i=0;i<Math.min(due,space);i++){
      let roll=Math.max(0,Math.min(.999999999,this.random()))*total;const signal=candidates.find(s=>{roll-=s.weight;return roll<0;})??candidates[0];
      const owned=PRODUCERS.filter(v=>e.producers[v.id]>0),producer=signal.family?owned[Math.min(owned.length-1,Math.floor(this.random()*owned.length))]?.id:undefined;
      const id=randomUUID();e.signals.push({id,type:signal.id,...(producer?{producer}:{}),foundAt:now});e.eventSerial++;this.store.audit('game.signal-discovered',id,'ok');
    }
    e.nextSignalAt=now+interval;if(report)report.signals+=Math.min(due,space);this.save(p);
  }
  private readRound(id: string | null): StoredRound | null {
    if (!id) return null;
    const row = this.store.db.prepare('SELECT state FROM game_rounds WHERE id=?').get(id);
    return row ? JSON.parse(String(row.state)) : null;
  }
  private persistRound(round: StoredRound) { this.store.db.prepare('INSERT INTO game_rounds(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(round.id, JSON.stringify(round)); }
  private view(p: Player): GameState {
    const round = this.readRound(p.roundId);
    const next=nextProject(p.farm),objective=next?projectQuote(next,p.inventory):null;
    const upgrade=objective?undefined:UPGRADES.find(u=>!p.economy.upgrades.includes(u.id)&&upgradeReady(u,p.economy,p.engine.clicks,p.engine.level));
    const producer=PRODUCERS.find(v=>(p.economy.producers[v.id]??0)<BALANCE.maxUnits&&(p.economy.unlocks.includes(v.id)||dec(p.economy.lifetime).gte(v.unlock)));
    const reinvestment=objective?null:upgrade?{kind:'upgrade' as const,id:upgrade.id,name:upgrade.name,benefit:upgrade.description,cost:upgrade.cost}:producer?{kind:'installation' as const,id:producer.id,name:producer.name,benefit:producer.description,cost:producerCost(producer,p.economy,1,this.context(p))}:null;
    return { ...p, farm:{...p.farm,objective,reinvestment},economy:this.economyView(p),engine: { ...p.engine, ...this.motor(p), upgradeCost: engineCost(p.engine.level) }, challenge: this.challenge(p), level: levelFor(p.xp), className: classFor(p.build), now: this.clock(), passiveCoins: this.rate(p), round: round ? { ...round, cards: round.cards.map(c => ({ id: c.id, matched: c.matched, label: c.matched || round.selected.includes(c.id) ? c.text : null })) } : null, recent: this.store.db.prepare('SELECT action,coins,xp,at FROM game_ledger ORDER BY id DESC LIMIT 6').all().map(row=>({...row,coins:amount(String(row.coins))})) as GameState['recent'] };
  }
  private challenge(p: Player): Challenge | null { const row = p.challengeId && this.store.db.prepare('SELECT state FROM game_challenges WHERE id=?').get(p.challengeId); return row ? JSON.parse(String(row.state)) : null; }
  private saveChallenge(c: Challenge) { this.store.db.prepare('INSERT INTO game_challenges(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(c.id, JSON.stringify(c)); }
  private challengeStep(c:Challenge,now:number) {
    c.stepAt=now;c.readyAt=now+(c.stage===0?(c.pace==='relaxed'?4500:3500):0);
    const phase=challengePhase(c)-1;
    c.stepMs=c.kind==='qte'?(c.pace==='relaxed'?3400:2200)-phase*(c.pace==='relaxed'?300:350):(c.pace==='relaxed'?3200:2400)-phase*250;
    c.zone=(c.pace==='relaxed'?32:22)-phase*4;
  }
  private advanceChallenge(p:Player,c:Challenge,hit:boolean) {
    if(hit)c.hits++;else c.misses=(c.misses??0)+1;
    c.stage++;
    if((c.misses??0)>(c.kind==='qte'?6:10))c.status='failed';
    else if(c.stage>=challengeTotal(c)){
      c.status='completed';const total=challengeTotal(c);
      if((c.version??0)>=2){c.coins=(c.version??0)>=3?activityReward('office',Math.round((c.kind==='qte'?240:300)*(c.pace==='normal'?1.25:1)),p.economy,this.context(p),c.hits/total):Math.round((c.kind==='qte'?240:300)*(c.hits/total)*(c.pace==='normal'?1.25:1));c.xp=Math.round(60*c.hits/total);p.economy.challenges++;if(c.hits===total)p.economy.perfect++;}
      else{c.coins=c.kind==='qte'?24:[0,8,20,36][c.hits];c.xp=c.kind==='qte'?12:c.hits*5;}
      this.credit(p,`challenge:${c.id}`,c.kind==='qte'?'Sincronização QTE':'Calibração de precisão',c.coins,c.xp);
    } else if((c.version??0)>=2)this.challengeStep(c,this.clock());else c.stepAt=this.clock();
    this.saveChallenge(c);
  }
  private expire(p:Player) {const c=this.challenge(p);if(c?.status!=='active')return;const end=challengeReadyAt(c)+c.stepMs*(c.kind==='skillcheck'?2:1);
    if(this.clock()>end){if((c.version??0)>=2)this.advanceChallenge(p,c,false);else if(c.kind==='qte'){c.status='failed';this.saveChallenge(c);}this.store.audit('game.challenge-expire',c.id,'ok');this.save(p);}}
  private play(p:Player,a:GameAction):string {
    const now=this.clock();let c=this.challenge(p);
    if(a.kind==='start-challenge'){
      if(c?.status==='active'||c?.status==='paused')return 'Desafio retomado. Termine ou encerre para começar outro.';
      c={id:randomUUID(),kind:a.game,pace:a.pace,status:'active',stage:0,hits:0,sequence:Array.from({length:36},()=> (['A','S','D','W'] as const)[randomInt(4)]),targets:Array.from({length:36},()=>[25,40,55,70,80][randomInt(5)]),stepAt:now,stepMs:0,zone:0,coins:0,xp:0,startedAt:now,misses:0,version:3};
      this.challengeStep(c,now);p.challengeId=c.id;this.saveChallenge(c);return 'Partida iniciada: 36 etapas, três fases. Prepare-se para a primeira.';
    }
    if(!c||c.id!==('challengeId' in a?a.challengeId:null)||!['active','paused'].includes(c.status))throw new AppError('INVALID_CHALLENGE','Esse desafio não está ativo.');
    if(a.kind==='cancel-challenge'){c.status='failed';this.saveChallenge(c);return 'Desafio encerrado. Você pode tentar de novo sem custo.';}
    if(a.kind==='pause-challenge'){if(c.status==='active'){c.status='paused';c.pausedAt=now;this.saveChallenge(c);}return 'Partida pausada. O tempo está preservado.';}
    if(a.kind==='resume-challenge'){if(c.status==='paused'){const delta=now-(c.pausedAt??now),ready=challengeReadyAt(c);c.stepAt+=delta;c.readyAt=ready+delta;if(c.startedAt)c.startedAt+=delta;c.status='active';this.saveChallenge(c);}return 'Partida retomada.';}
    if(c.status!=='active')throw new AppError('CHALLENGE_PAUSED','Retome a partida para continuar.');
    if(now<challengeReadyAt(c))throw new AppError('NOT_READY','Aguarde o sinal da próxima etapa.');
    if(a.kind==='qte-input'&&c.kind==='qte'){
      const hit=a.key===c.sequence[c.stage]&&now<=challengeReadyAt(c)+c.stepMs;
      if((c.version??0)<2&&!hit){c.status='failed';this.saveChallenge(c);}else this.advanceChallenge(p,c,hit);
    }else if(a.kind==='skill-input'&&c.kind==='skillcheck')this.advanceChallenge(p,c,Math.abs(skillPosition(now,challengeReadyAt(c),c.stepMs)-c.targets[c.stage])<=c.zone/2);
    else throw new AppError('INVALID_CHALLENGE','Essa ação pertence a outro tipo de desafio.');
    const status=(c as Challenge).status;return status==='failed'?'Tentativa encerrada. Sem perda de moedas; tente novamente.':status==='completed'?`Partida concluída: +${c.coins} moedas e +${c.xp} XP.`:'Etapa registrada. Continue!';
  }
  get(): GameState { return this.store.transaction(() => { const p=this.load(),previous=p.economy.returnReport;this.settle(p);const report=p.economy.returnReport!==previous?p.economy.returnReport:undefined;this.study(p);this.signals(p,report);this.expire(p);this.achievements(p,report);this.save(p);return this.view(p); }); }
  act(raw: z.infer<typeof gameInput>): GameResult {
    const input = gameInput.parse(raw);
    return this.store.transaction(() => {
      const p=this.load(),previous=p.economy.returnReport;this.settle(p);const report=p.economy.returnReport!==previous?p.economy.returnReport:undefined;this.study(p);this.signals(p,report);this.expire(p);
      const prior = this.store.db.prepare('SELECT request,message FROM game_operations WHERE id=?').get(input.operationId);
      const request = JSON.stringify(input.action);
      if (prior) { if (prior.request !== request) throw new AppError('OPERATION_CONFLICT', 'Essa operação já foi utilizada com outra ação.'); this.save(p); return { state: this.view(p), message: String(prior.message), replayed: true }; }
      const a = input.action, now = this.clock(), source = input.operationId;
      let message = 'Progresso salvo.';
      if(a.kind==='farm-target'){
        if(!p.farm.built.includes('depot'))throw new AppError('LOCKED','Construa o depósito para liberar os postos.');
        if(p.farm.built.includes(a.project))throw new AppError('ALREADY_OWNED','Esse posto já está construído.');
        p.farm.target=a.project;message='Próximo projeto escolhido. Os materiais continuam no inventário.';
      }else if(a.kind==='farm-build'){
        const project=FARM_PROJECTS.find(v=>v.id===a.project)!;
        if(p.farm.built.includes(a.project))throw new AppError('ALREADY_OWNED','Essa construção já faz parte da vila.');
        if(a.project!=='depot'&&!p.farm.built.includes('depot'))throw new AppError('LOCKED','Construa o depósito para liberar os postos.');
        this.credit(p,source,`Construção: ${project.name}`,0,0,Object.fromEntries(Object.entries(project.costs).map(([r,n])=>[r,-n])));
        p.farm.built.push(a.project);
        if(a.project!=='depot')p.farm.stations[a.project]={stock:0,carryMs:0,settledAt:now};
        message=`${project.name} construído! ${project.benefit}`;
      }else if(a.kind==='farm-collect'){
        if(!p.farm.built.includes(a.station))throw new AppError('LOCKED','Construa esse posto antes de recolher.');
        const station=p.farm.stations[a.station],resource=STATION_RESOURCE[a.station],stock=station.stock;
        if(!stock)throw new AppError('EMPTY_STOCK','O estoque está vazio. O posto produz 1 material por minuto.');
        this.credit(p,source,`Estoque: ${FARM_PROJECTS.find(v=>v.id===a.station)!.name}`,0,0,{[resource]:stock});station.stock=0;
        message=`${stock} ${RESOURCES[resource].name.toLowerCase()} no inventário. Produção do posto retomada.`;
      }else if(a.kind==='skin'){p.skin=a.value;message='Skin da cidade aplicada e salva.';}
      else if(a.kind==='dismiss-return'){delete p.economy.returnReport;}
      else if(a.kind==='activate-signal'){
        if(this.context(p).focusActive)throw new AppError('FOCUS_ACTIVE','Seu sinal está guardado. Ative depois de pausar ou terminar o Foco.');
        const event=p.economy.signals.find(v=>v.id===a.id),signal=event&&SIGNALS.find(s=>s.id===event.type);if(!event||!signal)throw new AppError('INVALID_SIGNAL','Esse sinal não está guardado.');
        if(signal.durationMs&&p.economy.activeEvents.length>=BALANCE.maxConcurrentEvents)throw new AppError('EVENT_SLOTS','Já há dois sinais ativos. O restante continua guardado.');
        if(p.economy.activeEvents.some(v=>v.type===signal.id))throw new AppError('EVENT_DUPLICATE','Esse tipo de sinal já está ativo. Ele continua guardado.');
        this.settle(p,true);p.economy.signals=p.economy.signals.filter(v=>v.id!==a.id);p.economy.events++;
        if(p.economy.activeEvents.length)p.economy.combos++;
        if(signal.cacheMinutes)this.credit(p,`signal:${event.id}`,signal.name,integer(dec(this.rate(p)).mul(signal.cacheMinutes)),0);
        else p.economy.activeEvents.push({...event,startedAt:now,endsAt:now+Math.round(signal.durationMs*effectFactor('duration',p.economy,this.context(p)).toNumber())});
        message=`${signal.name} ativado. Os demais sinais continuam guardados.`;
      }else if(a.kind==='producer-buy'){
        const producer=PRODUCERS.find(v=>v.id===a.producer)!;
        if(!p.economy.unlocks.includes(producer.id)&&dec(p.economy.lifetime).lt(producer.unlock))throw new AppError('LOCKED','Produza mais para desbloquear essa instalação.');
        this.settle(p,true);const quantity=a.quantity==='max'?maxAffordable(producer,p.economy,p.coins,this.context(p)):a.quantity;
        if(!quantity)throw new AppError('INSUFFICIENT_COINS','Você ainda não tem Produção suficiente.');
        if(p.economy.producers[a.producer]+quantity>BALANCE.maxUnits)throw new AppError('MAX_LEVEL',`Limite de ${BALANCE.maxUnits} unidades por família.`);
        this.credit(p,source,`Produção: ${producer.name} ×${quantity}`,amount(dec(producerCost(producer,p.economy,quantity,this.context(p))).neg()),0);p.economy.producers[a.producer]+=quantity;message='Instalações adquiridas. A taxa aumentou.';
      }else if(a.kind==='economy-upgrade'){
        const u=UPGRADES.find(v=>v.id===a.id);if(!u)throw new AppError('INVALID_UPGRADE','Melhoria desconhecida.');
        if(p.economy.upgrades.includes(u.id))throw new AppError('ALREADY_OWNED','Essa melhoria já foi adquirida.');
        if(!upgradeReady(u,p.economy,p.engine.clicks,p.engine.level))throw new AppError('LOCKED','Cumpra os requisitos da melhoria primeiro.');
        this.settle(p,true);this.credit(p,source,`Tecnologia: ${u.name}`,amount(dec(u.cost).neg()),0);p.economy.upgrades.push(u.id);message='Melhoria adquirida. A produção foi atualizada.';
      }else if(a.kind==='permanent-upgrade'){
        const u=PERMANENT.find(v=>v.id===a.id)!;if(p.economy.permanent.includes(u.id))throw new AppError('ALREADY_OWNED','Essa melhoria permanente já foi adquirida.');
        if(!upgradeReady(u,p.economy,p.engine.clicks,p.engine.level))throw new AppError('LOCKED','Cumpra os requisitos dessa melhoria permanente.');
        if(dec(p.economy.tokens).lt(u.cost))throw new AppError('INSUFFICIENT_PRESTIGE','Você ainda não tem insígnias suficientes.');
        this.settle(p,true);p.economy.tokens=sub(p.economy.tokens,u.cost);p.economy.permanent.push(u.id);message='Melhoria permanente adquirida.';
      }else if(a.kind==='prestige'){
        this.settle(p,true);const gain=prestigeGain(p.economy);if(dec(gain).lt(1)||!dec(gain).eq(a.expectedGain)||p.economy.cycles!==a.expectedCycles)throw new AppError('PRESTIGE_CHANGED','O ganho mudou. Confira a prévia de prestígio novamente.');
        this.credit(p,source,'Prestígio: início de novo ciclo',amount(dec(p.coins).neg()),0);
        p.economy.prestige=add(p.economy.prestige,gain);p.economy.tokens=add(p.economy.tokens,gain);p.economy.legacyPrestige=add(p.economy.legacyPrestige??0,p.economy.legacyCredit??0);p.economy.legacyCredit=0;p.economy.cycles++;p.economy.cycleEarned=0;p.economy.producers=freshEconomy().producers;p.economy.upgrades=[];p.economy.activeEvents=[];p.engine.level=0;p.passiveCarry=0;p.passiveAt=now;
        const challenge=this.challenge(p);if(challenge&&['active','paused'].includes(challenge.status)){challenge.status='failed';this.saveChallenge(challenge);}message=`Novo ciclo iniciado: +${formatAmount(gain)} insígnias e bônus permanente de ${formatAmount(amount(dec(p.economy.prestige).mul(5)))}%.`;
      }else if(a.kind==='atmosphere'){p.atmosphere=a.value;message='Ambiente da vila atualizado.';}
      else if (a.kind === 'engine-click') {
        const coins=this.motor(p).power,day=new Date(now).toLocaleDateString('sv-SE');if(!p.economy.motorDay||day>p.economy.motorDay){p.economy.motorDay=day;p.economy.motorEarned=0;}p.economy.motorEarned=add(p.economy.motorEarned??0,coins);
        p.engine.clicks++; p.engine.lastClickAt = now;p.engine.lastGain=coins;
        this.credit(p, source, 'Pulso do motor', coins, p.engine.clicks % 10 === 0 ? 1 : 0); message = dec(coins).gt(0)?`+${formatAmount(coins)} de Produção. Motor trabalhando!`:'Orçamento do motor esgotado hoje. Colete materiais, cultive ou recolha os postos.';
      } else if (a.kind === 'engine-upgrade') {
        const cost = engineCost(p.engine.level); if (cost === null) throw new AppError('MAX_LEVEL', 'Seu motor já está no nível máximo.');
        this.credit(p, source, 'Melhoria do motor', -cost, 0); p.engine.level++; message = `Motor nível ${p.engine.level}: +${formatAmount(this.motor(p).power)} de Produção no próximo pulso.`;
      } else if (['start-challenge', 'qte-input', 'skill-input', 'cancel-challenge','pause-challenge','resume-challenge'].includes(a.kind)) message = this.play(p, a);
      else if (a.kind === 'plant' || a.kind === 'harvest') {
        const plot = p.plots.find(v => v.id === a.plot); if (!plot) throw new AppError('LOCKED', 'Desbloqueie esse terreno na loja.');
        if (a.kind === 'plant') {
          if (plot.crop) throw new AppError('OCCUPIED', 'Este canteiro já está plantado.');
          const crop = CROPS[a.crop]; this.credit(p, source, `Plantio de ${crop.name}`, -crop.cost, 0);
          plot.crop = a.crop; plot.plantedAt = now; plot.readyAt = now + crop.seconds * 1000 * (1 - Math.min(.5, p.build.planning * .05));
          message = `${crop.name} plantado. Volte quando amadurecer.`;
        } else {
          if (!plot.crop || now < plot.readyAt) throw new AppError('NOT_READY', 'Esse cultivo ainda não está pronto para colher.');
          p.economy.harvested++; const crop = CROPS[plot.crop],reward=activityReward('harvest',crop.coins,p.economy,this.context(p)); this.credit(p, source, `Colheita de ${crop.name}`, reward, crop.xp, { [plot.crop]: 1 });
          plot.crop = null; plot.plantedAt = 0; plot.readyAt = 0; message = `Colheita feita: +${formatAmount(reward)} de Produção e +${crop.xp} XP.`;
        }
      } else if (a.kind === 'gather') {
        if (now - p.gatheredAt < 1500) throw new AppError('COOLDOWN', 'Prepare a próxima coleta…');
        p.economy.gathered++; const amount = a.resource === 'stone' && p.owned.includes('pickaxe') ? 2 : 1;
        const coins=activityReward('gather',4+p.build.practice,p.economy,this.context(p)); this.credit(p, source, a.resource === 'stone' ? 'Expedição à mina' : 'Coleta no bosque', coins, 3, { [a.resource]: amount });
        p.gatheredAt = now; message = `+${amount} ${RESOURCES[a.resource].name.toLowerCase()}, +${coins} moedas e +3 XP.`;
      } else if (a.kind === 'buy') {
        const item = SHOP.find(v => v.id === a.item)!; if (p.owned.includes(item.id)) throw new AppError('ALREADY_OWNED', 'Essa melhoria já faz parte da sua vila.');
        this.settle(p,true);this.credit(p, source, `Compra: ${item.name}`, -item.cost, 0); p.owned.push(item.id);
        if (item.id === 'windmill') p.passiveAt = now;
        if (item.id === 'fields') p.plots.push(...[5, 6].map(id => ({ id, crop: null, plantedAt: 0, readyAt: 0 })));
        message = `${item.name} adquirido. Sua vila evoluiu.`;
      } else if (a.kind === 'sell') {
        const resource = RESOURCES[a.resource]; this.credit(p, source, `Venda de ${resource.name}`, resource.price * a.quantity, 0, { [a.resource]: -a.quantity }); message = `Venda concluída: +${resource.price * a.quantity} moedas.`;
      } else if (a.kind === 'respec') {
        if (Object.values(a.build).reduce((sum, v) => sum + v, 0) > levelFor(p.xp)) throw new AppError('INVALID_BUILD', 'Você ainda não tem esses pontos de habilidade.');
        // Settle at the previous rate first; a new rate begins at this timestamp.
        this.settle(p, true); p.passiveAt = now; p.build = a.build; this.credit(p, source, 'Redistribuição de habilidades', 0, 0); message = 'Build atualizada. Redistribuição gratuita.';
      } else if (a.kind === 'start-round') {
        const existing = this.readRound(p.roundId);
        if (existing && !existing.completed) message = 'Rodada retomada, sem limite de tempo.';
        else {
          const count = a.difficulty === 'easy' ? 3 : a.difficulty === 'normal' ? 6 : 9;
          const cards = MEMORY_PAIRS.slice(0, count).flatMap((pair, index) => pair.map(text => ({ id: 0, pair: index, text, matched: false })));
          for (let i = cards.length - 1; i > 0; i--) { const j = randomInt(i + 1); [cards[i], cards[j]] = [cards[j], cards[i]]; }
          cards.forEach((card, index) => { card.id = index; });
          const round: StoredRound = { id: randomUUID(), difficulty: a.difficulty, cards, selected: [], attempts: 0, combo: 0, maxCombo: 0, completed: false, coins: 0, xp: 0, startedAt: now,rewardVersion:3 };
          this.persistRound(round); p.roundId = round.id; message = 'Encontre os pares. Jogue no seu ritmo.';
        }
      } else if (a.kind === 'flip') {
        const round = this.readRound(p.roundId);
        if (!round || round.id !== a.roundId || round.completed) throw new AppError('INVALID_ROUND', 'Essa rodada não está ativa.');
        const card = round.cards[a.card]; if (!card || card.matched) throw new AppError('INVALID_CARD', 'Escolha uma carta ainda disponível.');
        if (round.selected.length === 2) round.selected = [];
        if (round.selected.includes(card.id)) throw new AppError('INVALID_CARD', 'Escolha outra carta.');
        round.selected.push(card.id);
        if (round.selected.length === 2) {
          round.attempts++;
          const [first, second] = round.selected.map(id => round.cards[id]);
          if (first.pair === second.pair) { first.matched = second.matched = true; round.combo++; round.maxCombo = Math.max(round.maxCombo, round.combo); round.selected = []; message = 'Par encontrado!'; }
          else { round.combo = 0; message = 'Essas cartas não formam um par. Escolha a próxima.'; }
          if (round.cards.every(v => v.matched)) {
            const multiplier = round.difficulty === 'easy' ? 1 : round.difficulty === 'normal' ? 2 : 3;
            const efficiency = Math.floor(round.cards.length / 2 / round.attempts * 8);
            round.coins = (round.rewardVersion??0)>=3?activityReward('memory',20*multiplier+round.maxCombo*2+efficiency+p.build.review*2,p.economy,this.context(p),1+(round.maxCombo/(round.cards.length/2))*.25):20*multiplier+round.maxCombo*2+efficiency+p.build.review*2; round.xp = 15 * multiplier + round.cards.length + efficiency; round.completed = true; p.economy.rounds++;if(round.attempts===round.cards.length/2)p.economy.memoryPerfect++;
            this.credit(p, `round:${round.id}`, 'Memória de Conceitos', round.coins, round.xp); message = `Rodada concluída: +${round.coins} moedas e +${round.xp} XP.`;
          }
        }
        this.persistRound(round);
      }
      if(a.kind==='respec'){const name=classFor(p.build);if(name!=='Viajante'&&!p.economy.study.builds.includes(name))p.economy.study.builds.push(name);}
      this.achievements(p,report); this.save(p); this.store.db.prepare('INSERT INTO game_operations(id,request,message) VALUES(?,?,?)').run(source, request, message);
      this.store.audit(`game.${a.kind}`, source, 'ok'); return { state: this.view(p), message, replayed: false };
    });
  }
}
