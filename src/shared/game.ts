import { z } from 'zod';
import type { EconomyView } from './economy';
import { PRODUCERS, PERMANENT } from './economy-content';
import type { Amount } from './amount';
import type { Farm, ProjectQuote } from './farm';
const ids = (items: {id:string}[]) => items.map(v=>v.id) as [string,...string[]];
const economicInteger = z.union([z.number().int().positive().max(Number.MAX_SAFE_INTEGER),z.string().regex(/^[1-9][0-9]{0,1099}$/)]);
export const CITY_SKINS = [{ id:'original',name:'Vale Sereno',description:'Casas, jardins e luz natural.' },{ id:'cyberpunk',name:'Cyberpunk',description:'Torres, néon e infraestrutura futurista.' },{ id:'newyork',name:'New York',description:'Brownstones, avenidas e skyline urbano.' }] as const;

export const CROPS = {
  wheat: { name: 'Trigo', seconds: 45, cost: 2, coins: 8, xp: 5, color: '#dcb963' },
  carrot: { name: 'Cenoura', seconds: 90, cost: 5, coins: 18, xp: 10, color: '#e99652' },
} as const;
export const SHOP = [
  { id: 'windmill', name: 'Moinho', cost: 75, description: 'Produz 4 moedas por minuto, inclusive entre visitas.', icon: 'mill' },
  { id: 'fields', name: 'Terra fértil', cost: 60, description: 'Abre dois canteiros adicionais na fazenda.', icon: 'farm' },
  { id: 'pickaxe', name: 'Picareta de ferro', cost: 85, description: 'Dobra a pedra recebida por coleta na mina.', icon: 'mine' },
  { id: 'cottage', name: 'Casa do viajante', cost: 120, description: 'Constrói sua casa junto à praça.', icon: 'home' },
  { id: 'lanterns', name: 'Luzes da vila', cost: 50, description: 'Lanternas douradas iluminam as ruas.', icon: 'light' },
  { id: 'fountain', name: 'Fonte do jardim', cost: 45, description: 'Uma fonte de pedra e água junto ao jardim.', icon: 'light' },
  { id: 'benches', name: 'Bancos do jardim', cost: 15, description: 'Três lugares para descansar sob as árvores.', icon: 'home' },
  { id: 'greenhouse', name: 'Estufa de vidro', cost: 90, description: 'Uma construção decorativa junto à fazenda.', icon: 'farm' },
] as const;
export type ShopId = typeof SHOP[number]['id'];
export const SKILLS = [
  { id: 'focus', name: 'Foco', effect: '+1 moeda/min por ponto com o moinho.', title: 'Guardião' },
  { id: 'review', name: 'Revisão', effect: '+2 moedas por ponto nas rodadas de memória.', title: 'Erudito' },
  { id: 'planning', name: 'Planejamento', effect: 'Cultivos 5% mais rápidos por ponto (até 50%).', title: 'Arquiteto' },
  { id: 'practice', name: 'Prática', effect: '+1 moeda por ponto em cada coleta.', title: 'Explorador' },
] as const;
export type Build = Record<typeof SKILLS[number]['id'], number>;
export type CropId = keyof typeof CROPS;
export type Resource = CropId | 'stone' | 'wood';
export const RESOURCES: Record<Resource, { name: string; price: number }> = { wheat: { name: 'Trigo', price: 4 }, carrot: { name: 'Cenoura', price: 8 }, stone: { name: 'Pedra', price: 3 }, wood: { name: 'Madeira', price: 2 } };
export const levelFor = (xp: number) => 1 + Math.floor(xp / 100);
export function classFor(build: Build) {
  const ranked = [...SKILLS].sort((a, b) => build[b.id] - build[a.id]);
  return build[ranked[0].id] === build[ranked[1].id] ? 'Viajante' : ranked[0].title;
}
export type Plot = { id: number; crop: CropId | null; plantedAt: number; readyAt: number };
export type Card = { id: number; label: string | null; matched: boolean };
export type Round = { id: string; difficulty: 'easy' | 'normal' | 'hard'; cards: Card[]; selected: number[]; attempts: number; combo: number; maxCombo: number; completed: boolean; coins: Amount; xp: number; startedAt: number };
export const ENGINE_MAX_LEVEL = 10;
export const enginePower = (level: number) => 1 + level * 2;
export const engineCost = (level: number) => level >= ENGINE_MAX_LEVEL ? null : Math.ceil(25 * 1.8 ** level);
export type Engine = { level: number; clicks: number; lastClickAt: number; lastGain?:Amount };
export type Challenge = { id: string; kind: 'qte' | 'skillcheck'; pace: 'relaxed' | 'normal'; status: 'active' | 'paused' | 'completed' | 'failed'; stage: number; hits: number; sequence: ('A' | 'S' | 'D' | 'W')[]; targets: number[]; stepAt: number; stepMs: number; zone: number; coins: Amount; xp: number; readyAt?:number; startedAt?:number; pausedAt?:number; misses?:number; version?:number };
export const challengeTotal=(c:Challenge)=>c.sequence.length;
export const challengeReadyAt=(c:Challenge)=>c.readyAt??c.stepAt;
export const challengePhase=(c:Challenge)=>Math.min(3,1+Math.floor(c.stage/12));
export function skillPosition(now: number, stepAt: number, period: number) { const phase = Math.max(0, now - stepAt) % period / period; return phase < .5 ? phase * 200 : (1 - phase) * 200; }
export type GameState = { skin:typeof CITY_SKINS[number]['id']; economy:EconomyView; farm:Farm & {objective:ProjectQuote|null;reinvestment:{kind:'installation'|'upgrade';id:string;name:string;benefit:string;cost:Amount}|null}; atmosphere: 'golden'|'dawn'|'night'; coins: Amount; xp: number; level: number; build: Build; className: string; inventory: Record<Resource, number>; owned: ShopId[]; plots: Plot[]; gatheredAt: number; now: number; passiveCoins: Amount; round: Round | null; engine: Engine & { power: Amount; budget:Amount; remaining:Amount; referenceRate:Amount; upgradeCost: number | null }; challenge: Challenge | null; recent: { action: string; coins: Amount; xp: number; at: number }[] };
export const gameAction = z.discriminatedUnion('kind', [
  z.strictObject({kind:z.literal('farm-build'),project:z.enum(['depot','forest-post','mine-post'])}),
  z.strictObject({kind:z.literal('farm-target'),project:z.enum(['forest-post','mine-post'])}),
  z.strictObject({kind:z.literal('farm-collect'),station:z.enum(['forest-post','mine-post'])}),
  z.strictObject({kind:z.literal('skin'),value:z.enum(['original','cyberpunk','newyork'])}),
  z.strictObject({kind:z.literal('producer-buy'),producer:z.enum(ids(PRODUCERS)),quantity:z.union([z.literal(1),z.literal(10),z.literal(100),z.literal('max')])}),
  z.strictObject({kind:z.literal('economy-upgrade'),id:z.string().min(1).max(64)}),
  z.strictObject({kind:z.literal('prestige'),expectedCycles:z.number().int().min(0),expectedGain:economicInteger}),
  z.strictObject({kind:z.literal('permanent-upgrade'),id:z.enum(ids(PERMANENT))}),
  z.strictObject({kind:z.literal('activate-signal'),id:z.uuid()}),
  z.strictObject({kind:z.literal('dismiss-return')}),
  z.strictObject({kind:z.literal('pause-challenge'),challengeId:z.uuid()}),
  z.strictObject({kind:z.literal('resume-challenge'),challengeId:z.uuid()}),
  z.strictObject({kind:z.literal('atmosphere'),value:z.enum(['golden','dawn','night'])}),
  z.strictObject({ kind: z.literal('engine-click') }),
  z.strictObject({ kind: z.literal('engine-upgrade') }),
  z.strictObject({ kind: z.literal('start-challenge'), game: z.enum(['qte', 'skillcheck']), pace: z.enum(['relaxed', 'normal']) }),
  z.strictObject({ kind: z.literal('qte-input'), challengeId: z.uuid(), key: z.enum(['A', 'S', 'D', 'W']) }),
  z.strictObject({ kind: z.literal('skill-input'), challengeId: z.uuid() }),
  z.strictObject({ kind: z.literal('cancel-challenge'), challengeId: z.uuid() }),
  z.strictObject({ kind: z.literal('plant'), plot: z.number().int().min(1).max(6), crop: z.enum(['wheat', 'carrot']) }),
  z.strictObject({ kind: z.literal('harvest'), plot: z.number().int().min(1).max(6) }),
  z.strictObject({ kind: z.literal('gather'), resource: z.enum(['stone', 'wood']) }),
  z.strictObject({ kind: z.literal('buy'), item: z.enum(['windmill', 'fields', 'pickaxe', 'cottage', 'lanterns','fountain','benches','greenhouse']) }),
  z.strictObject({ kind: z.literal('sell'), resource: z.enum(['wheat', 'carrot', 'stone', 'wood']), quantity: z.number().int().min(1).max(10000) }),
  z.strictObject({ kind: z.literal('respec'), build: z.strictObject({ focus: z.number().int().min(0).max(100), review: z.number().int().min(0).max(100), planning: z.number().int().min(0).max(100), practice: z.number().int().min(0).max(100) }) }),
  z.strictObject({ kind: z.literal('start-round'), difficulty: z.enum(['easy', 'normal', 'hard']) }),
  z.strictObject({ kind: z.literal('flip'), roundId: z.uuid(), card: z.number().int().min(0).max(17) }),
]);
export type GameAction = z.infer<typeof gameAction>;
export const gameInput = z.strictObject({ operationId: z.uuid(), action: gameAction });
export type GameResult = { state: GameState; message: string; replayed: boolean };
// Curated demonstration content: definitions, examples and formula/use cases.
export const MEMORY_PAIRS = [
  ['Vetor', 'Grandeza com direção e magnitude'], ['Número primo', 'Exemplo: 2, 3, 5 ou 7'], ['A = b × h', 'Área de um retângulo'],
  ['Derivada', 'Taxa de variação instantânea'], ['Função linear', 'Exemplo: f(x) = 2x'], ['v = Δs / Δt', 'Velocidade média'],
  ['Algoritmo', 'Sequência finita de instruções'], ['Estrutura de repetição', 'Exemplo: for ou while'], ['a² + b² = c²', 'Lados de um triângulo retângulo'],
] as const;
