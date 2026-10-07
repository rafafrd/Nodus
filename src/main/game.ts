import { randomUUID, randomInt } from 'node:crypto';
import type { z } from 'zod';
import { Store } from './store';
import { AppError } from '../shared/contracts';
import { CROPS, SHOP, RESOURCES, MEMORY_PAIRS, classFor, levelFor, type GameState, type GameResult, type Build, type Plot, type Resource, type ShopId, type Round, gameInput } from '../shared/game';
import { challengeTotal, challengeReadyAt, challengePhase, engineCost, enginePower, skillPosition, type Engine, type Challenge, type GameAction } from '../shared/game';

import { PRODUCERS, UPGRADES, ACHIEVEMENTS, PERMANENT, freshEconomy, production, pulseMultiplier, producerCost, upgradeReady, prestigeGain, nextPrestigeAt, achievementProgress, type Economy, type EconomyView } from '../shared/economy';

type Player = { skin: GameState['skin']; economy:Economy; atmosphere: 'golden'|'dawn'|'night'; coins: number; xp: number; inventory: Record<Resource, number>; owned: ShopId[]; plots: Plot[]; build: Build; gatheredAt: number; passiveAt: number; passiveCarry: number; roundId: string | null; engine: Engine; challengeId: string | null };
type StoredRound = Omit<Round, 'cards'> & { cards: { id: number; pair: number; text: string; matched: boolean }[] };
export class Game {
  constructor(readonly store: Store, readonly clock: () => number = Date.now) {}
  private load(): Player {
    const row = this.store.db.prepare('SELECT coins,xp,state FROM game_player WHERE id=1').get() as { coins: number; xp: number; state: string } | undefined;
    if (row) { const state = JSON.parse(row.state); return { ...state, skin:state.skin??'original', economy:state.economy??this.legacyEconomy(), atmosphere:state.atmosphere??'golden', engine: state.engine ?? { level: 0, clicks: 0, lastClickAt: 0 }, challengeId: state.challengeId ?? null, coins: row.coins, xp: row.xp }; }
    const p: Player = { skin:'original',economy:freshEconomy(), atmosphere:'golden', coins: 0, xp: 0, inventory: { wheat: 0, carrot: 0, stone: 0, wood: 0 }, owned: [], plots: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, crop: null, plantedAt: 0, readyAt: 0 })), build: { focus: 0, review: 0, planning: 0, practice: 0 }, gatheredAt: 0, passiveAt: this.clock(), passiveCarry: 0, roundId: null, engine: { level: 0, clicks: 0, lastClickAt: 0 }, challengeId: null };
    this.credit(p, 'starter', 'Boas-vindas à vila', 60, 0); this.save(p); return p;
  }
  private save(p: Player) { const { coins, xp, ...state } = p; this.store.db.prepare('INSERT INTO game_player(id,coins,xp,state) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET coins=excluded.coins,xp=excluded.xp,state=excluded.state').run(coins, xp, JSON.stringify(state)); }
  private credit(p: Player, source: string, action: string, coins: number, xp: number, resources: Partial<Record<Resource, number>> = {}) {
    if (!Number.isSafeInteger(p.coins + coins) || !Number.isSafeInteger(p.xp + xp)||!Number.isSafeInteger(p.economy.lifetime+Math.max(0,coins))) throw new AppError('ECONOMY_LIMIT', 'O limite seguro desta economia foi atingido.');
    if (p.coins + coins < 0) throw new AppError('INSUFFICIENT_COINS', 'Você ainda não tem moedas suficientes.');
    for (const [key, delta] of Object.entries(resources)) if (p.inventory[key as Resource] + delta < 0) throw new AppError('INSUFFICIENT_RESOURCE', 'Você ainda não tem esse recurso em quantidade suficiente.');
    // Passive credits in the same real minute share one ledger row, rather than
    // generating tens of thousands of records while the city stays open.
    const sql=source.startsWith('production:')
      ? 'INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,3) ON CONFLICT(source) DO UPDATE SET coins=game_ledger.coins+excluded.coins,at=excluded.at'
      : 'INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,3)';
    this.store.db.prepare(sql).run(source, action, coins, xp, JSON.stringify(resources), this.clock());
    p.coins += coins; p.xp += xp; if(coins>0&&source!=='starter'){p.economy.lifetime+=coins;p.economy.cycleEarned+=coins;}  for (const [key, delta] of Object.entries(resources)) p.inventory[key as Resource] += delta;
  }
  private legacyEconomy():Economy {
    const e=freshEconomy();
    e.lifetime=Number(this.store.db.prepare("SELECT coalesce(sum(coins),0) n FROM game_ledger WHERE coins>0 AND source<>'starter'").get()?.n??0);e.cycleEarned=e.lifetime;
    for(const [field,action] of [['harvested','Colheita de %'],['gathered','Expedição à mina'],['rounds','Memória de Conceitos']] as const)e[field]=Number(this.store.db.prepare('SELECT count(*) n FROM game_ledger WHERE action LIKE ?').get(action)?.n??0);
    e.gathered+=Number(this.store.db.prepare("SELECT count(*) n FROM game_ledger WHERE action='Coleta no bosque'").get()?.n??0);
    e.challenges=Number(this.store.db.prepare("SELECT count(*) n FROM game_ledger WHERE source LIKE 'challenge:%'").get()?.n??0);return e;
  }
  private rate(p:Player) { return production(p.economy,p.owned.includes('windmill')?4+p.build.focus:0); }
  private economyView(p:Player):EconomyView {const e=p.economy;return{...e,rate:this.rate(p),multiplier:1+e.prestige*.05,prestigeGain:prestigeGain(e),nextPrestigeAt:nextPrestigeAt(e),offlineDays:e.permanent.includes('long-horizon')?14:7,
    producersView:PRODUCERS.map(v=>({id:v.id,count:e.producers[v.id],cost:producerCost(v,e),cost10:producerCost(v,e,10),unlocked:e.lifetime>=v.unlock,rate:production({...e,producers:{...freshEconomy().producers,[v.id]:e.producers[v.id]}},0)})),
    upgradesView:UPGRADES.map(u=>({id:u.id,owned:e.upgrades.includes(u.id),unlocked:upgradeReady(u,e,p.engine.clicks,p.engine.level)})),
    achievementsView:ACHIEVEMENTS.map(a=>({id:a.id,unlocked:e.achievements.includes(a.id),progress:achievementProgress(a,e,p.engine.clicks)}))};}
  private achievements(p:Player) {const added=ACHIEVEMENTS.filter(a=>!p.economy.achievements.includes(a.id)&&achievementProgress(a,p.economy,p.engine.clicks)>=a.target);if(added.length){this.settle(p,true);p.economy.achievements.push(...added.map(a=>a.id));this.store.audit('game.achievements',null,'ok');this.save(p);}}
  private settle(p: Player, boundary = false) {
    const now = this.clock(),rate=this.rate(p);
    if(now<=p.passiveAt)return;
    if(!rate){p.passiveAt=now;return;}
    const delta=now-p.passiveAt, quantum=Object.values(p.economy.producers).some(Boolean)?1000:60000;
    const elapsed=Math.min((p.economy.permanent.includes('long-horizon')?14:7)*24*60*60000,boundary?delta:Math.floor(delta/quantum)*quantum);
    if(!elapsed)return;
    const units=elapsed*rate+(p.passiveCarry??0),coins=Math.floor(units/60000);
    if(coins)this.credit(p,`production:${p.economy.cycles}:${Math.floor(now/60000)}`,'Produção automática da cidade',coins,0);
    p.passiveCarry=units%60000;p.passiveAt=boundary?now:now-delta%quantum;this.save(p);
  }
  private readRound(id: string | null): StoredRound | null {
    if (!id) return null;
    const row = this.store.db.prepare('SELECT state FROM game_rounds WHERE id=?').get(id);
    return row ? JSON.parse(String(row.state)) : null;
  }
  private persistRound(round: StoredRound) { this.store.db.prepare('INSERT INTO game_rounds(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(round.id, JSON.stringify(round)); }
  private view(p: Player): GameState {
    const round = this.readRound(p.roundId);
    return { ...p, economy:this.economyView(p),engine: { ...p.engine, power: enginePower(p.engine.level)*pulseMultiplier(p.economy), upgradeCost: engineCost(p.engine.level) }, challenge: this.challenge(p), level: levelFor(p.xp), className: classFor(p.build), now: this.clock(), passiveCoins: this.rate(p), round: round ? { ...round, cards: round.cards.map(c => ({ id: c.id, matched: c.matched, label: c.matched || round.selected.includes(c.id) ? c.text : null })) } : null, recent: this.store.db.prepare('SELECT action,coins,xp,at FROM game_ledger ORDER BY id DESC LIMIT 6').all() as GameState['recent'] };
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
      if(c.version===2){c.coins=Math.round((c.kind==='qte'?240:300)*(c.hits/total)*(c.pace==='normal'?1.25:1));c.xp=Math.round(60*c.hits/total);p.economy.challenges++;if(c.hits===total)p.economy.perfect++;}
      else{c.coins=c.kind==='qte'?24:[0,8,20,36][c.hits];c.xp=c.kind==='qte'?12:c.hits*5;}
      this.credit(p,`challenge:${c.id}`,c.kind==='qte'?'Sincronização QTE':'Calibração de precisão',c.coins,c.xp);
    } else if((c.version??0)>=2)this.challengeStep(c,this.clock());else c.stepAt=this.clock();
    this.saveChallenge(c);
  }
  private expire(p:Player) {const c=this.challenge(p);if(c?.status!=='active')return;const end=challengeReadyAt(c)+c.stepMs*(c.kind==='skillcheck'?2:1);
    if(this.clock()>end){if(c.version===2)this.advanceChallenge(p,c,false);else if(c.kind==='qte'){c.status='failed';this.saveChallenge(c);}this.store.audit('game.challenge-expire',c.id,'ok');this.save(p);}}
  private play(p:Player,a:GameAction):string {
    const now=this.clock();let c=this.challenge(p);
    if(a.kind==='start-challenge'){
      if(c?.status==='active'||c?.status==='paused')return 'Desafio retomado. Termine ou encerre para começar outro.';
      c={id:randomUUID(),kind:a.game,pace:a.pace,status:'active',stage:0,hits:0,sequence:Array.from({length:36},()=> (['A','S','D','W'] as const)[randomInt(4)]),targets:Array.from({length:36},()=>[25,40,55,70,80][randomInt(5)]),stepAt:now,stepMs:0,zone:0,coins:0,xp:0,startedAt:now,misses:0,version:2};
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
      if(c.version!==2&&!hit){c.status='failed';this.saveChallenge(c);}else this.advanceChallenge(p,c,hit);
    }else if(a.kind==='skill-input'&&c.kind==='skillcheck')this.advanceChallenge(p,c,Math.abs(skillPosition(now,challengeReadyAt(c),c.stepMs)-c.targets[c.stage])<=c.zone/2);
    else throw new AppError('INVALID_CHALLENGE','Essa ação pertence a outro tipo de desafio.');
    const status=(c as Challenge).status;return status==='failed'?'Tentativa encerrada. Sem perda de moedas; tente novamente.':status==='completed'?`Partida concluída: +${c.coins} moedas e +${c.xp} XP.`:'Etapa registrada. Continue!';
  }
  get(): GameState { return this.store.transaction(() => { const p = this.load(); this.settle(p); this.expire(p); this.achievements(p); return this.view(p); }); }
  act(raw: z.infer<typeof gameInput>): GameResult {
    const input = gameInput.parse(raw);
    return this.store.transaction(() => {
      const p = this.load(); this.settle(p); this.expire(p);
      const prior = this.store.db.prepare('SELECT request,message FROM game_operations WHERE id=?').get(input.operationId);
      const request = JSON.stringify(input.action);
      if (prior) { if (prior.request !== request) throw new AppError('OPERATION_CONFLICT', 'Essa operação já foi utilizada com outra ação.'); return { state: this.view(p), message: String(prior.message), replayed: true }; }
      const a = input.action, now = this.clock(), source = input.operationId;
      let message = 'Progresso salvo.';
      if(a.kind==='skin'){p.skin=a.value;message='Skin da cidade aplicada e salva.';}
      else if(a.kind==='producer-buy'){
        const producer=PRODUCERS.find(v=>v.id===a.producer)!;
        if(p.economy.lifetime<producer.unlock)throw new AppError('LOCKED','Produza mais moedas para desbloquear esse produtor.');
        if(p.economy.producers[a.producer]+a.quantity>100)throw new AppError('MAX_LEVEL','Limite de 100 unidades por produtor neste ciclo.');
        this.settle(p,true);this.credit(p,source,`Produção: ${producer.name} ×${a.quantity}`,-producerCost(producer,p.economy,a.quantity),0);p.economy.producers[a.producer]+=a.quantity;message='Produtores adquiridos. A taxa da cidade aumentou.';
      }else if(a.kind==='economy-upgrade'){
        const u=UPGRADES.find(v=>v.id===a.id);if(!u)throw new AppError('INVALID_UPGRADE','Melhoria desconhecida.');
        if(p.economy.upgrades.includes(u.id))throw new AppError('ALREADY_OWNED','Essa melhoria já foi adquirida.');
        if(!upgradeReady(u,p.economy,p.engine.clicks,p.engine.level))throw new AppError('LOCKED','Cumpra os requisitos da melhoria primeiro.');
        this.settle(p,true);this.credit(p,source,`Tecnologia: ${u.name}`,-u.cost,0);p.economy.upgrades.push(u.id);message='Melhoria adquirida. A produção foi atualizada.';
      }else if(a.kind==='permanent-upgrade'){
        const u=PERMANENT.find(v=>v.id===a.id)!;if(p.economy.permanent.includes(u.id))throw new AppError('ALREADY_OWNED','Essa melhoria permanente já foi adquirida.');
        if(p.economy.tokens<u.cost)throw new AppError('INSUFFICIENT_PRESTIGE','Você ainda não tem insígnias suficientes.');
        this.settle(p,true);p.economy.tokens-=u.cost;p.economy.permanent.push(u.id);message='Melhoria permanente adquirida.';
      }else if(a.kind==='prestige'){
        this.settle(p,true);const gain=prestigeGain(p.economy);if(gain<1||gain!==a.expectedGain||p.economy.cycles!==a.expectedCycles)throw new AppError('PRESTIGE_CHANGED','O ganho mudou. Confira a prévia de prestígio novamente.');
        this.settle(p,true);this.credit(p,source,'Prestígio: início de novo ciclo',-p.coins,0);
        p.economy.prestige+=gain;p.economy.tokens+=gain;p.economy.cycles++;p.economy.cycleEarned=0;p.economy.producers=freshEconomy().producers;p.economy.upgrades=[];p.engine.level=0;p.passiveCarry=0;p.passiveAt=now;
        const challenge=this.challenge(p);if(challenge&&['active','paused'].includes(challenge.status)){challenge.status='failed';this.saveChallenge(challenge);}message=`Novo ciclo iniciado: +${gain} insígnias e bônus permanente de ${p.economy.prestige*5}%.`;
      }else if(a.kind==='atmosphere'){p.atmosphere=a.value;message='Ambiente da vila atualizado.';}
      else if (a.kind === 'engine-click') {
        p.engine.clicks++; p.engine.lastClickAt = now; const coins = enginePower(p.engine.level)*pulseMultiplier(p.economy);
        this.credit(p, source, 'Pulso do motor', coins, p.engine.clicks % 10 === 0 ? 1 : 0); message = `+${coins} moedas. Motor trabalhando!`;
      } else if (a.kind === 'engine-upgrade') {
        const cost = engineCost(p.engine.level); if (cost === null) throw new AppError('MAX_LEVEL', 'Seu motor já está no nível máximo.');
        this.credit(p, source, 'Melhoria do motor', -cost, 0); p.engine.level++; message = `Motor nível ${p.engine.level}: ${enginePower(p.engine.level)} moedas por clique.`;
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
          p.economy.harvested++; const crop = CROPS[plot.crop]; this.credit(p, source, `Colheita de ${crop.name}`, crop.coins, crop.xp, { [plot.crop]: 1 });
          plot.crop = null; plot.plantedAt = 0; plot.readyAt = 0; message = `Colheita feita: +${crop.coins} moedas e +${crop.xp} XP.`;
        }
      } else if (a.kind === 'gather') {
        if (now - p.gatheredAt < 1500) throw new AppError('COOLDOWN', 'Prepare a próxima coleta…');
        p.economy.gathered++; const amount = a.resource === 'stone' && p.owned.includes('pickaxe') ? 2 : 1;
        const coins = 4 + p.build.practice; this.credit(p, source, a.resource === 'stone' ? 'Expedição à mina' : 'Coleta no bosque', coins, 3, { [a.resource]: amount });
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
          const round: StoredRound = { id: randomUUID(), difficulty: a.difficulty, cards, selected: [], attempts: 0, combo: 0, maxCombo: 0, completed: false, coins: 0, xp: 0, startedAt: now };
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
            round.coins = 20 * multiplier + round.maxCombo * 2 + efficiency + p.build.review * 2; round.xp = 15 * multiplier + round.cards.length + efficiency; round.completed = true; p.economy.rounds++;
            this.credit(p, `round:${round.id}`, 'Memória de Conceitos', round.coins, round.xp); message = `Rodada concluída: +${round.coins} moedas e +${round.xp} XP.`;
          }
        }
        this.persistRound(round);
      }
      this.achievements(p); this.save(p); this.store.db.prepare('INSERT INTO game_operations(id,request,message) VALUES(?,?,?)').run(source, request, message);
      this.store.audit(`game.${a.kind}`, source, 'ok'); return { state: this.view(p), message, replayed: false };
    });
  }
}
