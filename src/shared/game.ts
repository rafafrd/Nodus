import { z } from 'zod';
import type { EconomyView } from './economy';
import { PRODUCERS, PERMANENT, POLICIES } from './economy-content';
import type { Amount } from './amount';
import type { Farm, FarmProjectId } from './farm';
import type { Flash } from './economy-types';
const ids = (items: readonly {id:string}[]) => items.map(v=>v.id) as [string,...string[]];
const economicInteger = z.union([z.number().int().positive().max(Number.MAX_SAFE_INTEGER),z.string().regex(/^[1-9][0-9]{0,1099}$/)]);
export const CITY_SKINS = [{ id:'original',name:'Vale Sereno',description:'Casas, jardins e luz natural.' },{ id:'cyberpunk',name:'Cyberpunk',description:'Torres, néon e infraestrutura futurista.' },{ id:'newyork',name:'New York',description:'Brownstones, avenidas e skyline urbano.' }] as const;

/** Garden seeds (GAM-06). Each costs one minute of production; ripe plants wait as long as needed. */
export const CROPS = {
  wheat: { name: 'Trigo-luz', seconds: 180, harvest: 'Colhido: 8 minutos de produção.', growing: '', xp: 5, color: '#dcb963' },
  carrot: { name: 'Raiz-âmbar', seconds: 480, harvest: 'Colhida: clique ×3 por 5 minutos.', growing: '', xp: 8, color: '#e99652' },
  dew: { name: 'Flor-de-orvalho', seconds: 900, harvest: 'Colhida: 2 minutos de produção.', growing: '+3% de produção enquanto plantada.', xp: 10, color: '#9fc7d8' },
} as const;
export type CropId = keyof typeof CROPS;
export const CROP_HARVEST_MINUTES: Record<CropId, number> = { wheat: 8, carrot: 0, dew: 2 };
/** Village pieces appear by themselves at journey milestones (total produced). Older purchases stay owned. */
export const DECOR = [
  { id:'benches', name:'Bancos do jardim', at:200 }, { id:'fountain', name:'Fonte do jardim', at:2000 }, { id:'lanterns', name:'Luzes da vila', at:2e4 },
  { id:'depot', name:'Depósito', at:6e4, farm:true }, { id:'cottage', name:'Casa do viajante', at:2e5 }, { id:'forest-post', name:'Posto do bosque', at:6e5, farm:true },
  { id:'greenhouse', name:'Estufa de vidro', at:2e6 }, { id:'mine-post', name:'Posto da mina', at:6e6, farm:true }, { id:'windmill', name:'Moinho', at:2e7 },
  { id:'fields', name:'Terra fértil', at:6e7 },
] as const;
export type ShopId = 'windmill'|'fields'|'pickaxe'|'cottage'|'lanterns'|'fountain'|'benches'|'greenhouse';
export const SKILLS = [
  { id: 'focus', name: 'Foco', title: 'Guardião' },
  { id: 'review', name: 'Revisão', title: 'Erudito' },
  { id: 'planning', name: 'Planejamento', title: 'Arquiteto' },
  { id: 'practice', name: 'Prática', title: 'Explorador' },
] as const;
export type Build = Record<typeof SKILLS[number]['id'], number>;
export type Resource = 'wheat' | 'carrot' | 'stone' | 'wood';
export const levelFor = (xp: number) => 1 + Math.floor(xp / 100);
/** Cosmetic: the class follows the build and has no economic effect. */
export function classFor(build: Build) {
  const ranked = [...SKILLS].sort((a, b) => build[b.id] - build[a.id]);
  return build[ranked[0].id] === build[ranked[1].id] ? 'Viajante' : ranked[0].title;
}
export type Plot = { id: number; crop: CropId | null; plantedAt: number; readyAt: number };
export type Card = { id: number; label: string | null; matched: boolean };
export type Round = { id: string; difficulty: 'easy' | 'normal' | 'hard'; cards: Card[]; selected: number[]; attempts: number; combo: number; maxCombo: number; completed: boolean; coins: Amount; xp: number; startedAt: number };
/** Mira: squares appear in a 1000×600 arena and leave after `life` ms; precision decides the points (osu!-like). */
export const AIM_ARENA = { width: 1000, height: 600, leadMs: 3000 } as const;
export const AIM_LEVELS = {
  easy: { name: 'Leve', targets: 20, size: 110, lifeMs: 1500, gapMs: 850, multiplier: 1 },
  normal: { name: 'Normal', targets: 28, size: 84, lifeMs: 1150, gapMs: 650, multiplier: 2 },
  hard: { name: 'Difícil', targets: 36, size: 64, lifeMs: 850, gapMs: 500, multiplier: 3 },
  expert: { name: 'Insano', targets: 45, size: 46, lifeMs: 620, gapMs: 360, multiplier: 4 },
} as const;
export type AimLevel = keyof typeof AIM_LEVELS;
/** at: ms after the round starts (the countdown included); x, y: center in arena units; size: side in arena units. */
export type AimTarget = { x: number; y: number; at: number; life: number; size: number };
export type AimHit = { target: number; t: number; dx: number; dy: number };
export type AimResult = { difficulty: AimLevel; accuracy: number; counts: [number, number, number, number]; misclicks: number; maxCombo: number; grade: string; coins: Amount; xp: number };
export type AimView = { active: { id: string; difficulty: AimLevel; targets: AimTarget[] } | null; last: AimResult | null; best: Partial<Record<AimLevel, number>> };
/** dx, dy: click offset from the center in half-sides (−1…1). The square's center ring is worth the most. */
export const aimPoints = (dx: number, dy: number) => { const r = Math.max(Math.abs(dx), Math.abs(dy)); return r <= .4 ? 300 : r <= .75 ? 100 : 50; };
export const aimGrade = (accuracy: number) => accuracy >= 1 ? 'SS' : accuracy >= .95 ? 'S' : accuracy >= .9 ? 'A' : accuracy >= .8 ? 'B' : accuracy >= .7 ? 'C' : 'D';
/** Counts 300/100/50/miss, accuracy over targets plus misclicks, and the longest run of hit targets. */
export function aimScore(targets: AimTarget[], hits: AimHit[], misclicks: number) {
  const byTarget = new Map(hits.map(h => [h.target, aimPoints(h.dx, h.dy)])), counts: [number, number, number, number] = [0, 0, 0, 0];
  let total = 0, combo = 0, maxCombo = 0;
  targets.forEach((_, i) => { const points = byTarget.get(i); if (points === undefined) { counts[3]++; combo = 0; return; } total += points; counts[points === 300 ? 0 : points === 100 ? 1 : 2]++; maxCombo = Math.max(maxCombo, ++combo); });
  const accuracy = Math.floor(total / (300 * (targets.length + misclicks)) * 10000) / 10000;
  return { counts, accuracy, maxCombo, grade: aimGrade(accuracy) };
}
export type Engine ={ level: number; clicks: number; lastClickAt: number; lastGain?:Amount; clickTokens?:number };
export type GardenView = { unlocked:boolean; seedCost:Amount; growth:number; dew:number };
export type CouncilView = { unlocked:boolean; seats:(string|null)[]; deliberations:number; nextDeliberationAt:number|null };
export type GameState = {
  skin:typeof CITY_SKINS[number]['id']; economy:EconomyView; atmosphere: 'golden'|'dawn'|'night'; coins: Amount; xp: number; level: number; build: Build; className: string;
  owned: ShopId[]; plots: Plot[]; now: number; passiveCoins: Amount; round: Round | null; aim: AimView;
  farm: Farm & { objective:{id:FarmProjectId}|null };
  engine: Engine & { power: Amount };
  flash: Flash | null; garden: GardenView; council: CouncilView; nextDecor: { id:string; name:string; at:number } | null;
  recent: { action: string; coins: Amount; xp: number; at: number }[];
};
export const gameAction = z.discriminatedUnion('kind', [
  z.strictObject({kind:z.literal('core-click'),count:z.number().int().min(1).max(40)}),
  z.strictObject({kind:z.literal('flash-catch'),id:z.uuid()}),
  z.strictObject({kind:z.literal('council-seat'),seat:z.number().int().min(0).max(2),policy:z.enum(ids(POLICIES)).nullable()}),
  z.strictObject({kind:z.literal('skin'),value:z.enum(['original','cyberpunk','newyork'])}),
  z.strictObject({kind:z.literal('producer-buy'),producer:z.enum(ids(PRODUCERS)),quantity:z.union([z.literal(1),z.literal(10),z.literal(100),z.literal('max')])}),
  z.strictObject({kind:z.literal('economy-upgrade'),id:z.string().min(1).max(64)}),
  z.strictObject({kind:z.literal('prestige'),expectedCycles:z.number().int().min(0),expectedGain:economicInteger}),
  z.strictObject({kind:z.literal('permanent-upgrade'),id:z.enum(ids(PERMANENT))}),
  z.strictObject({kind:z.literal('dismiss-return')}),
  z.strictObject({kind:z.literal('atmosphere'),value:z.enum(['golden','dawn','night'])}),
  z.strictObject({ kind: z.literal('plant'), plot: z.number().int().min(1).max(6), crop: z.enum(['wheat', 'carrot', 'dew']) }),
  z.strictObject({ kind: z.literal('harvest'), plot: z.number().int().min(1).max(6) }),
  z.strictObject({ kind: z.literal('respec'), build: z.strictObject({ focus: z.number().int().min(0).max(100), review: z.number().int().min(0).max(100), planning: z.number().int().min(0).max(100), practice: z.number().int().min(0).max(100) }) }),
  z.strictObject({ kind: z.literal('start-round'), difficulty: z.enum(['easy', 'normal', 'hard']) }),
  z.strictObject({ kind: z.literal('flip'), roundId: z.uuid(), card: z.number().int().min(0).max(17) }),
  z.strictObject({ kind: z.literal('aim-start'), difficulty: z.enum(['easy', 'normal', 'hard', 'expert']) }),
  z.strictObject({ kind: z.literal('aim-finish'), roundId: z.uuid(), misclicks: z.number().int().min(0).max(999),
    hits: z.array(z.strictObject({ target: z.number().int().min(0).max(63), t: z.number().int().min(0).max(600000), dx: z.number().min(-1).max(1), dy: z.number().min(-1).max(1) })).max(64) }),
]);
export type GameAction = z.infer<typeof gameAction>;
export const gameInput = z.strictObject({ operationId: z.uuid(), action: gameAction });
/** watching: the city area is on screen. Only watched time brings a Lampejo closer. */
export const gameReadInput = z.strictObject({ watching: z.boolean() }).optional();
export type GameResult = { state: GameState; message: string; replayed: boolean };
// Curated demonstration content: definitions, examples and formula/use cases.
export const MEMORY_PAIRS = [
  ['Vetor', 'Grandeza com direção e magnitude'], ['Número primo', 'Exemplo: 2, 3, 5 ou 7'], ['A = b × h', 'Área de um retângulo'],
  ['Derivada', 'Taxa de variação instantânea'], ['Função linear', 'Exemplo: f(x) = 2x'], ['v = Δs / Δt', 'Velocidade média'],
  ['Algoritmo', 'Sequência finita de instruções'], ['Estrutura de repetição', 'Exemplo: for ou while'], ['a² + b² = c²', 'Lados de um triângulo retângulo'],
] as const;
