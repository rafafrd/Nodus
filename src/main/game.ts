import { randomUUID, randomInt } from 'node:crypto';
import type { z } from 'zod';
import { Store } from './store';
import { AppError } from '../shared/contracts';
import { CROPS, SHOP, RESOURCES, MEMORY_PAIRS, classFor, levelFor, type GameState, type GameResult, type Build, type Plot, type Resource, type ShopId, type Round, gameInput } from '../shared/game';
import { engineCost, enginePower, skillPosition, type Engine, type Challenge, type GameAction } from '../shared/game';

type Player = { coins: number; xp: number; inventory: Record<Resource, number>; owned: ShopId[]; plots: Plot[]; build: Build; gatheredAt: number; passiveAt: number; passiveCarry: number; roundId: string | null; engine: Engine; challengeId: string | null };
type StoredRound = Omit<Round, 'cards'> & { cards: { id: number; pair: number; text: string; matched: boolean }[] };
export class Game {
  constructor(readonly store: Store, readonly clock: () => number = Date.now) {}
  private load(): Player {
    const row = this.store.db.prepare('SELECT coins,xp,state FROM game_player WHERE id=1').get() as { coins: number; xp: number; state: string } | undefined;
    if (row) { const state = JSON.parse(row.state); return { ...state, engine: state.engine ?? { level: 0, clicks: 0, lastClickAt: 0 }, challengeId: state.challengeId ?? null, coins: row.coins, xp: row.xp }; }
    const p: Player = { coins: 0, xp: 0, inventory: { wheat: 0, carrot: 0, stone: 0, wood: 0 }, owned: [], plots: Array.from({ length: 4 }, (_, i) => ({ id: i + 1, crop: null, plantedAt: 0, readyAt: 0 })), build: { focus: 0, review: 0, planning: 0, practice: 0 }, gatheredAt: 0, passiveAt: this.clock(), passiveCarry: 0, roundId: null, engine: { level: 0, clicks: 0, lastClickAt: 0 }, challengeId: null };
    this.credit(p, 'starter', 'Boas-vindas à vila', 60, 0); this.save(p); return p;
  }
  private save(p: Player) { const { coins, xp, ...state } = p; this.store.db.prepare('INSERT INTO game_player(id,coins,xp,state) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET coins=excluded.coins,xp=excluded.xp,state=excluded.state').run(coins, xp, JSON.stringify(state)); }
  private credit(p: Player, source: string, action: string, coins: number, xp: number, resources: Partial<Record<Resource, number>> = {}) {
    if (p.coins + coins < 0) throw new AppError('INSUFFICIENT_COINS', 'Você ainda não tem moedas suficientes.');
    for (const [key, delta] of Object.entries(resources)) if (p.inventory[key as Resource] + delta < 0) throw new AppError('INSUFFICIENT_RESOURCE', 'Você ainda não tem esse recurso em quantidade suficiente.');
    this.store.db.prepare('INSERT INTO game_ledger(source,action,coins,xp,resources,at,rule_version) VALUES(?,?,?,?,?,?,2)').run(source, action, coins, xp, JSON.stringify(resources), this.clock());
    p.coins += coins; p.xp += xp; for (const [key, delta] of Object.entries(resources)) p.inventory[key as Resource] += delta;
  }
  private settle(p: Player, boundary = false) {
    const now = this.clock();
    if (!p.owned.includes('windmill') || now <= p.passiveAt) return;
    const delta = now - p.passiveAt;
    const elapsed = Math.min(7 * 24 * 60 * 60000, boundary ? delta : Math.floor(delta / 60000) * 60000);
    if (!elapsed) return;
    const at = p.passiveAt, units = elapsed * (4 + p.build.focus) + (p.passiveCarry ?? 0), coins = Math.floor(units / 60000);
    if (coins) this.credit(p, `passive:${at}:${now}`, 'Produção do moinho', coins, 0);
    p.passiveCarry = units % 60000; p.passiveAt = boundary ? now : now - delta % 60000; this.save(p);
  }
  private readRound(id: string | null): StoredRound | null {
    if (!id) return null;
    const row = this.store.db.prepare('SELECT state FROM game_rounds WHERE id=?').get(id);
    return row ? JSON.parse(String(row.state)) : null;
  }
  private persistRound(round: StoredRound) { this.store.db.prepare('INSERT INTO game_rounds(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(round.id, JSON.stringify(round)); }
  private view(p: Player): GameState {
    const round = this.readRound(p.roundId);
    return { ...p, engine: { ...p.engine, power: enginePower(p.engine.level), upgradeCost: engineCost(p.engine.level) }, challenge: this.challenge(p), level: levelFor(p.xp), className: classFor(p.build), now: this.clock(), passiveCoins: p.owned.includes('windmill') ? 4 + p.build.focus : 0, round: round ? { ...round, cards: round.cards.map(c => ({ id: c.id, matched: c.matched, label: c.matched || round.selected.includes(c.id) ? c.text : null })) } : null, recent: this.store.db.prepare('SELECT action,coins,xp,at FROM game_ledger ORDER BY id DESC LIMIT 6').all() as GameState['recent'] };
  }
  private challenge(p: Player): Challenge | null { const row = p.challengeId && this.store.db.prepare('SELECT state FROM game_challenges WHERE id=?').get(p.challengeId); return row ? JSON.parse(String(row.state)) : null; }
  private saveChallenge(c: Challenge) { this.store.db.prepare('INSERT INTO game_challenges(id,state) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state').run(c.id, JSON.stringify(c)); }
  private expire(p: Player) { const c = this.challenge(p); if (c?.status === 'active' && c.kind === 'qte' && this.clock() > c.stepAt + c.stepMs) { c.status = 'failed'; this.saveChallenge(c); this.store.audit('game.challenge-expire', c.id, 'ok'); } }
  private play(p: Player, a: GameAction): string {
    const now = this.clock(); let c = this.challenge(p);
    if (a.kind === 'start-challenge') {
      if (c?.status === 'active') return 'Desafio retomado. Termine ou encerre para começar outro.';
      c = { id: randomUUID(), kind: a.game, pace: a.pace, status: 'active', stage: 0, hits: 0, sequence: Array.from({ length: 3 }, () => (['A', 'S', 'D', 'W'] as const)[randomInt(4)]), targets: Array.from({ length: 3 }, () => [30, 45, 60, 75][randomInt(4)]), stepAt: now, stepMs: a.game === 'qte' ? a.pace === 'relaxed' ? 3500 : 2000 : a.pace === 'relaxed' ? 3200 : 2000, zone: a.pace === 'relaxed' ? 32 : 18, coins: 0, xp: 0 };
      p.challengeId = c.id; this.saveChallenge(c); return 'Desafio iniciado. Siga as instruções no centro.';
    }
    if (!c || c.id !== ('challengeId' in a ? a.challengeId : null) || c.status !== 'active') throw new AppError('INVALID_CHALLENGE', 'Esse desafio não está ativo.');
    if (a.kind === 'cancel-challenge') { c.status = 'failed'; this.saveChallenge(c); return 'Desafio encerrado. Você pode tentar de novo sem custo.'; }
    if (a.kind === 'qte-input' && c.kind === 'qte') {
      if (a.key !== c.sequence[c.stage] || now > c.stepAt + c.stepMs) c.status = 'failed';
      else { c.hits++; c.stage++; c.stepAt = now; }
    } else if (a.kind === 'skill-input' && c.kind === 'skillcheck') {
      if (Math.abs(skillPosition(now, c.stepAt, c.stepMs) - c.targets[c.stage]) <= c.zone / 2) c.hits++;
      c.stage++; c.stepAt = now;
    } else throw new AppError('INVALID_CHALLENGE', 'Essa ação pertence a outro tipo de desafio.');
    if (c.stage === 3) {
      c.status = 'completed'; c.coins = c.kind === 'qte' ? 24 : [0, 8, 20, 36][c.hits]; c.xp = c.kind === 'qte' ? 12 : c.hits * 5;
      this.credit(p, `challenge:${c.id}`, c.kind === 'qte' ? 'Sincronização QTE' : 'Calibração de precisão', c.coins, c.xp);
    }
    this.saveChallenge(c); return c.status === 'failed' ? 'Tentativa encerrada. Sem perda de moedas; tente novamente.' : c.status === 'completed' ? `Desafio concluído: +${c.coins} moedas e +${c.xp} XP.` : 'Etapa registrada. Continue!';
  }
  get(): GameState { return this.store.transaction(() => { const p = this.load(); this.settle(p); this.expire(p); return this.view(p); }); }
  act(raw: z.infer<typeof gameInput>): GameResult {
    const input = gameInput.parse(raw);
    return this.store.transaction(() => {
      const p = this.load(); this.settle(p); this.expire(p);
      const prior = this.store.db.prepare('SELECT request,message FROM game_operations WHERE id=?').get(input.operationId);
      const request = JSON.stringify(input.action);
      if (prior) { if (prior.request !== request) throw new AppError('OPERATION_CONFLICT', 'Essa operação já foi utilizada com outra ação.'); return { state: this.view(p), message: String(prior.message), replayed: true }; }
      const a = input.action, now = this.clock(), source = input.operationId;
      let message = 'Progresso salvo.';
      if (a.kind === 'engine-click') {
        if (p.engine.clicks && now - p.engine.lastClickAt < 300) throw new AppError('COOLDOWN', 'Espere o próximo pulso do motor.');
        p.engine.clicks++; p.engine.lastClickAt = now; const coins = enginePower(p.engine.level);
        this.credit(p, source, 'Pulso do motor', coins, p.engine.clicks % 10 === 0 ? 1 : 0); message = `+${coins} moedas. Motor trabalhando!`;
      } else if (a.kind === 'engine-upgrade') {
        const cost = engineCost(p.engine.level); if (cost === null) throw new AppError('MAX_LEVEL', 'Seu motor já está no nível máximo.');
        this.credit(p, source, 'Melhoria do motor', -cost, 0); p.engine.level++; message = `Motor nível ${p.engine.level}: ${enginePower(p.engine.level)} moedas por clique.`;
      } else if (['start-challenge', 'qte-input', 'skill-input', 'cancel-challenge'].includes(a.kind)) message = this.play(p, a);
      else if (a.kind === 'plant' || a.kind === 'harvest') {
        const plot = p.plots.find(v => v.id === a.plot); if (!plot) throw new AppError('LOCKED', 'Desbloqueie esse terreno na loja.');
        if (a.kind === 'plant') {
          if (plot.crop) throw new AppError('OCCUPIED', 'Este canteiro já está plantado.');
          const crop = CROPS[a.crop]; this.credit(p, source, `Plantio de ${crop.name}`, -crop.cost, 0);
          plot.crop = a.crop; plot.plantedAt = now; plot.readyAt = now + crop.seconds * 1000 * (1 - Math.min(.5, p.build.planning * .05));
          message = `${crop.name} plantado. Volte quando amadurecer.`;
        } else {
          if (!plot.crop || now < plot.readyAt) throw new AppError('NOT_READY', 'Esse cultivo ainda não está pronto para colher.');
          const crop = CROPS[plot.crop]; this.credit(p, source, `Colheita de ${crop.name}`, crop.coins, crop.xp, { [plot.crop]: 1 });
          plot.crop = null; plot.plantedAt = 0; plot.readyAt = 0; message = `Colheita feita: +${crop.coins} moedas e +${crop.xp} XP.`;
        }
      } else if (a.kind === 'gather') {
        if (now - p.gatheredAt < 1500) throw new AppError('COOLDOWN', 'Prepare a próxima coleta…');
        const amount = a.resource === 'stone' && p.owned.includes('pickaxe') ? 2 : 1;
        const coins = 4 + p.build.practice; this.credit(p, source, a.resource === 'stone' ? 'Expedição à mina' : 'Coleta no bosque', coins, 3, { [a.resource]: amount });
        p.gatheredAt = now; message = `+${amount} ${RESOURCES[a.resource].name.toLowerCase()}, +${coins} moedas e +3 XP.`;
      } else if (a.kind === 'buy') {
        const item = SHOP.find(v => v.id === a.item)!; if (p.owned.includes(item.id)) throw new AppError('ALREADY_OWNED', 'Essa melhoria já faz parte da sua vila.');
        this.credit(p, source, `Compra: ${item.name}`, -item.cost, 0); p.owned.push(item.id);
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
            round.coins = 20 * multiplier + round.maxCombo * 2 + efficiency + p.build.review * 2; round.xp = 15 * multiplier + round.cards.length + efficiency; round.completed = true;
            this.credit(p, `round:${round.id}`, 'Memória de Conceitos', round.coins, round.xp); message = `Rodada concluída: +${round.coins} moedas e +${round.xp} XP.`;
          }
        }
        this.persistRound(round);
      }
      this.save(p); this.store.db.prepare('INSERT INTO game_operations(id,request,message) VALUES(?,?,?)').run(source, request, message);
      this.store.audit(`game.${a.kind}`, source, 'ok'); return { state: this.view(p), message, replayed: false };
    });
  }
}
