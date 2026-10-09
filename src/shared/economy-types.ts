import type { Amount } from './amount';
export type Metric = 'lifetime'|'clicks'|'engine'|'index'|'producers'|'upgrades'|'harvested'|'gathered'|'challenges'|'perfect'|'rounds'|'prestige'|'focusMinutes'|'reviews'|'studyDays'|'events'|'combos'|'cycles'|'families'|'synergies'|'builds'|'memoryPerfect';
export type Condition = { metric: Metric; target: Amount; producer?: string } | { owned: string };
export type Effect =
  | { kind:'production'|'cost'|'offline'|'duration'|'eventChance'|'active'|'achievement'|'pulse'|'synergyBoost'; factor: number; producer?:string }
  | { kind:'synergy'; producer:string; other:string; perUnit:number }
  | { kind:'perUnit'; producer:string; perUnit:number };
export type Producer = { id:string; name:string; location:string; description:string; base:Amount; rate:Amount; unlock:Amount; growth:string; order:number; visual:'supply'|'energy'|'lab'|'orbit'|'cosmic' };
export type Upgrade = { id:string; name:string; description:string; cost:Amount; category:'tier'|'synergy'|'special'|'global'|'permanent'; producer?:string; quantity?:number; prior?:string; conditions:Condition[]; effects:Effect[]; permanent?:boolean };
export type Achievement = { id:string; name:string; description:string; metric:Metric; target:Amount; producer?:string; secret?:boolean; eligible:boolean; condition?:'all-builds'|'full-network'|'no-pulse'|'comeback'|'symmetric'|'late-night'|'two-events'|'many-discounts'|'clean-run'|'old-and-new'; };
export type Signal = { id:string; name:string; description:string; weight:number; rarity:'common'|'uncommon'|'rare'; durationMs:number; effects:Effect[]; cacheMinutes?:number; family?:boolean; build?:'focus'|'review'|'planning'|'practice' };
export type EventInstance = { id:string; type:string; producer?:string; foundAt:number; startedAt?:number; endsAt?:number };
export type Economy = {
  version?:number; producers:Record<string,number>; upgrades:string[]; achievements:string[];
  lifetime:Amount; cycleEarned:Amount; prestige:Amount; tokens:Amount; cycles:number; permanent:string[];
  harvested:number; gathered:number; challenges:number; perfect:number; rounds:number;
  focusMinutes:number; reviews:number; studyDays:number; events:number; combos:number; memoryPerfect:number;
  study:{ focus:Record<string,number>; reviewCursor:number; baselineAt:number; lastDay:string; streak:number; dayMinutes:number; dayReviews:number; builds:string[] };
  signals:EventInstance[]; activeEvents:EventInstance[]; nextSignalAt:number; eventSerial:number;
  unlocks:string[]; returnReport?:{ elapsedMs:number; producedMs?:number; credited:Amount; capped:boolean; signals:number; milestones:number; at:number };
  motorDay?:string; motorEarned?:Amount; legacyCredit?:Amount; legacyPrestige?:Amount;
};
export type EconomicContext = { clicks:number; level:number; millRate:number; build:Record<'focus'|'review'|'planning'|'practice',number>; now:number; focusActive?:boolean };
export type FamilyBreakdown = { id:string; base:Amount; tiers:Amount; synergy:Amount; total:Amount; individual:Amount; share:number; level:number; activeUpgrades:string[]; partners:string[] };
export type Breakdown = { families:FamilyBreakdown[]; base:Amount; specialized:Amount; synergy:Amount; achievement:Amount; build:Amount; global:Amount; event:Amount; meta:Amount; final:Amount; layers:{name:string; factor:Amount}[] };
