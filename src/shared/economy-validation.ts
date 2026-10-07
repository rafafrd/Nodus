import { z } from 'zod';
import { dec } from './amount';
import type { Producer, Upgrade, Achievement, Signal } from './economy-types';
const value=z.union([z.number().finite().nonnegative(),z.string().max(1100).regex(/^\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i)]).refine(v=>dec(v).gte(0));
const id=z.string().min(1).max(64).regex(/^[a-z0-9-]+$/);
const metric=z.enum(['lifetime','clicks','engine','index','producers','upgrades','harvested','gathered','challenges','perfect','rounds','prestige','focusMinutes','reviews','studyDays','events','combos','cycles','families','synergies','builds','memoryPerfect']);
const condition=z.union([z.strictObject({owned:id}),z.strictObject({metric,target:value,producer:id.optional()})]);
const effect=z.discriminatedUnion('kind',[
 z.strictObject({kind:z.enum(['production','cost','offline','duration','eventChance','active','achievement','pulse','synergyBoost']),factor:z.number().positive().max(10),producer:id.optional()}),
 z.strictObject({kind:z.literal('synergy'),producer:id,other:id,perUnit:z.number().positive().max(1)}),
 z.strictObject({kind:z.literal('perUnit'),producer:id,perUnit:z.number().positive().max(1)}),
]);
export function validateContent(producers:Producer[],upgrades:Upgrade[],achievements:Achievement[],signals:Signal[]) {
 z.array(z.strictObject({id,name:z.string().min(1),location:z.string().min(1),description:z.string().min(1),base:value,rate:value,unlock:value,growth:z.string().refine(v=>dec(v).gt(1)&&dec(v).lte(2)),order:z.number().int().nonnegative(),visual:z.enum(['supply','energy','lab','orbit','cosmic'])})).parse(producers);
 z.array(z.strictObject({id,name:z.string().min(1),description:z.string().min(1),cost:value,category:z.enum(['tier','synergy','special','global','permanent']),producer:id.optional(),quantity:z.number().int().positive().optional(),prior:id.optional(),conditions:z.array(condition),effects:z.array(effect).min(1),permanent:z.boolean().optional()})).parse(upgrades);
 z.array(z.strictObject({id,name:z.string().min(1),description:z.string().min(1),metric,target:value,producer:id.optional(),secret:z.boolean().optional(),eligible:z.boolean(),condition:z.enum(['all-builds','full-network','no-pulse','comeback','symmetric','late-night','two-events','many-discounts','clean-run','old-and-new']).optional()})).parse(achievements);
 z.array(z.strictObject({id,name:z.string().min(1),description:z.string().min(1),weight:z.number().positive(),rarity:z.enum(['common','uncommon','rare']),durationMs:z.number().int().nonnegative(),effects:z.array(effect),cacheMinutes:z.number().positive().optional(),family:z.boolean().optional(),build:z.enum(['focus','review','planning','practice']).optional()})).parse(signals);
 for(const catalogue of [producers,upgrades,achievements,signals])if(new Set(catalogue.map(v=>v.id)).size!==catalogue.length)throw new Error('IDs econômicos duplicados.');
 const families=new Set(producers.map(v=>v.id)),owned=new Set(upgrades.map(v=>v.id));
 const requireFamily=(v?:string)=>{if(v&&!families.has(v))throw new Error(`Família econômica desconhecida: ${v}`);};
 for(const upgrade of upgrades){requireFamily(upgrade.producer);for(const c of upgrade.conditions){if('owned' in c){if(!owned.has(c.owned))throw new Error(`Pré-requisito desconhecido: ${c.owned}`);}else requireFamily(c.producer);}for(const e of upgrade.effects){requireFamily('producer' in e?e.producer:undefined);if(e.kind==='synergy')requireFamily(e.other);}}
 for(const a of achievements)requireFamily(a.producer);
}
