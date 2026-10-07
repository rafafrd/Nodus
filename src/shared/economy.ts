export const PRODUCERS = [
  { id:'collectors', name:'Coletores', base:40, rate:3, unlock:0, description:'Pequenas rotas de recursos sustentam o primeiro ciclo.' },
  { id:'workshops', name:'Oficinas', base:240, rate:18, unlock:200, description:'Transforme matéria-prima em produção contínua.' },
  { id:'warehouses', name:'Armazéns', base:1400, rate:105, unlock:1500, description:'Uma rede de logística para toda a cidade.' },
  { id:'powerplants', name:'Centrais', base:9000, rate:700, unlock:12000, description:'Energia para a próxima escala de crescimento.' },
  { id:'observatories', name:'Observatórios', base:60000, rate:4800, unlock:90000, description:'Conhecimento aplicado à produção da cidade.' },
] as const;
export type ProducerId = typeof PRODUCERS[number]['id'];
export type Economy = { producers:Record<ProducerId,number>; upgrades:string[]; achievements:string[]; lifetime:number; cycleEarned:number; harvested:number; gathered:number; challenges:number; perfect:number; rounds:number; prestige:number; tokens:number; cycles:number; permanent:string[] };
export const freshEconomy = ():Economy => ({ producers:{collectors:0,workshops:0,warehouses:0,powerplants:0,observatories:0},upgrades:[],achievements:[],lifetime:0,cycleEarned:0,harvested:0,gathered:0,challenges:0,perfect:0,rounds:0,prestige:0,tokens:0,cycles:0,permanent:[] });
export const PERMANENT = [
  { id:'legacy-tools', name:'Ferramentas herdadas', cost:1, description:'Dobra a potência de cada pulso, em todos os ciclos.' },
  { id:'city-charter', name:'Carta da cidade', cost:3, description:'Produtores custam 10% menos, permanentemente.' },
  { id:'long-horizon', name:'Horizonte longo', cost:5, description:'Produção offline passa de 7 para 14 dias por visita.' },
  { id:'shared-knowledge', name:'Conhecimento compartilhado', cost:8, description:'Mais 25% de produção automática, em todos os ciclos.' },
] as const;
export type Upgrade = {id:string;name:string;cost:number;producer?:ProducerId;quantity?:number;prior?:string;clicks?:number;engine?:number;total?:number;effect:'double'|'global'|'click';description:string};
export const UPGRADES:Upgrade[] = [
  ...PRODUCERS.flatMap(p=>[5,15,30].map((quantity,i)=>({ id:`${p.id}-${i+1}`, name:`${p.name} · ${['Especialização','Automação','Rede integrada'][i]}`,cost:p.base*[8,40,180][i],producer:p.id,quantity,prior:i?`${p.id}-${i}`:undefined,effect:'double' as const,description:`×2 na produção de ${p.name.toLowerCase()}. Requer ${quantity} unidades${i?' e a melhoria anterior':''}.` }))),
  ...[1,2,3].map((tier,i)=>({id:`pulse-${tier}`,name:`Pulso amplificado ${tier}`,cost:[500,6000,70000][i],clicks:[100,500,2000][i],engine:[2,5,8][i],prior:i?`pulse-${i}`:undefined,effect:'click' as const,description:`×2 no pulso. Requer ${[100,500,2000][i]} pulsos e motor nível ${[2,5,8][i]}.`})),
  ...[1,2,3].map((tier,i)=>({id:`network-${tier}`,name:`Sinergia urbana ${tier}`,cost:[3000,30000,300000][i],total:[20,60,150][i],prior:i?`network-${i}`:undefined,effect:'global' as const,description:`+25% de produção automática. Requer ${[20,60,150][i]} produtores no total.`})),
];
export type Achievement = {id:string;name:string;description:string;metric:'lifetime'|'clicks'|'producers'|'upgrades'|'harvested'|'gathered'|'challenges'|'perfect'|'rounds'|'prestige';target:number};
const milestones=(metric:Achievement['metric'],targets:number[],names:string[],unit:string):Achievement[]=>targets.map((target,i)=>({id:`${metric}-${target}`,name:names[i],description:`${target.toLocaleString('pt-BR')} ${unit}.`,metric,target}));
export const ACHIEVEMENTS:Achievement[] = [
  ...milestones('lifetime',[1000,10000,100000,1000000],['Primeiro capital','Cidade em movimento','Economia conectada','Metrópole'],'moedas produzidas ao longo da jornada'),
  ...milestones('clicks',[100,500,2000],['Mãos à obra','Motor incansável','Ritmo de máquina'],'pulsos no motor'),
  ...milestones('producers',[10,50,150],['Equipe formada','Distrito produtivo','Rede metropolitana'],'produtores no ciclo'),
  ...milestones('upgrades',[3,10,21],['Engenharia aplicada','Especialização urbana','Tecnologia completa'],'melhorias no ciclo'),
  ...milestones('harvested',[10,50],['Primeira safra','Jardim abundante'],'colheitas'),
  ...milestones('gathered',[25,100],['Explorador de rotas','Expedição veterana'],'coletas'),
  ...milestones('challenges',[1,5,20],['Aprendiz da Oficina','Oficina experiente','Mestre da Oficina'],'partidas completas na Oficina'),
  ...milestones('perfect',[1,5],['Precisão absoluta','Controle impecável'],'partidas perfeitas na Oficina'),
  ...milestones('rounds',[5,25],['Encontro de ideias','Memória em rede'],'rodadas de memória completas'),
  ...milestones('prestige',[1,5,20],['Novo horizonte','Legado construído','História da cidade'],'pontos de prestígio acumulados'),
];
export const producerTotal=(e:Economy)=>Object.values(e.producers).reduce((a,b)=>a+b,0);
export function upgradeReady(u:Upgrade,e:Economy,clicks:number,level:number) { return (!u.prior||e.upgrades.includes(u.prior))&&(!u.producer||e.producers[u.producer]>=(u.quantity??0))&&clicks>=(u.clicks??0)&&level>=(u.engine??0)&&producerTotal(e)>=(u.total??0); }
export function producerCost(p:typeof PRODUCERS[number],e:Economy,quantity=1) { let cost=0;for(let i=0;i<quantity;i++)cost+=Math.ceil(p.base*1.17**(e.producers[p.id]+i)*(e.permanent.includes('city-charter')?.9:1));return cost; }
export function production(e:Economy,millRate:number) { const base=PRODUCERS.reduce((sum,p)=>sum+p.rate*e.producers[p.id]*2**UPGRADES.filter(u=>u.producer===p.id&&e.upgrades.includes(u.id)).length,0)+millRate; return Math.round(base*(1+e.prestige*.05)*(1+e.achievements.length*.01)*(1+e.upgrades.filter(id=>id.startsWith('network-')).length*.25)*(e.permanent.includes('shared-knowledge')?1.25:1)*100)/100; }
export function pulseMultiplier(e:Economy) { return 2**e.upgrades.filter(id=>id.startsWith('pulse-')).length*(e.permanent.includes('legacy-tools')?2:1); }
export const prestigeGain=(e:Economy)=>Math.max(0,Math.floor(Math.sqrt(e.lifetime/20000))-e.prestige);
export const nextPrestigeAt=(e:Economy)=>20000*(e.prestige+prestigeGain(e)+1)**2;
export function achievementProgress(a:Achievement,e:Economy,clicks:number) { return a.metric==='clicks'?clicks:a.metric==='producers'?producerTotal(e):a.metric==='upgrades'?e.upgrades.length:e[a.metric]; }
export type EconomyView = Economy & { rate:number; multiplier:number; prestigeGain:number; nextPrestigeAt:number; offlineDays:number; producersView:{id:ProducerId;count:number;cost:number;cost10:number;unlocked:boolean;rate:number}[]; upgradesView:{id:string;owned:boolean;unlocked:boolean}[]; achievementsView:{id:string;unlocked:boolean;progress:number}[] };
