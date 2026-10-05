import { z } from 'zod';

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
export type Round = { id: string; difficulty: 'easy' | 'normal' | 'hard'; cards: Card[]; selected: number[]; attempts: number; combo: number; maxCombo: number; completed: boolean; coins: number; xp: number; startedAt: number };
export type GameState = { coins: number; xp: number; level: number; build: Build; className: string; inventory: Record<Resource, number>; owned: ShopId[]; plots: Plot[]; gatheredAt: number; now: number; passiveCoins: number; round: Round | null; recent: { action: string; coins: number; xp: number; at: number }[] };
export const gameAction = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('plant'), plot: z.number().int().min(1).max(6), crop: z.enum(['wheat', 'carrot']) }),
  z.strictObject({ kind: z.literal('harvest'), plot: z.number().int().min(1).max(6) }),
  z.strictObject({ kind: z.literal('gather'), resource: z.enum(['stone', 'wood']) }),
  z.strictObject({ kind: z.literal('buy'), item: z.enum(['windmill', 'fields', 'pickaxe', 'cottage', 'lanterns']) }),
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
