import type { Producer, Upgrade, Achievement, Signal } from './economy-types';
import { BALANCE } from './economy-balance';
import { D, amount } from './amount';
import { validateContent } from './economy-validation';
// Engine slice validated before expansion. IDs from the previous game survive.
export const PRODUCERS: Producer[] = [
  {id:'collectors',name:'Coletores',location:'Rotas do vale',description:'Toda grande descoberta começa com uma caixa bem etiquetada.',base:40,rate:3,unlock:0,growth:BALANCE.growth,order:0,visual:'supply'},
  {id:'workshops',name:'Oficinas',location:'Distrito de montagem',description:'Peças comuns, combinações improváveis.',base:240,rate:18,unlock:200,growth:BALANCE.growth,order:1,visual:'supply'},
  {id:'warehouses',name:'Armazéns',location:'Rede logística',description:'O universo é vasto. O inventário também deveria ser.',base:1400,rate:105,unlock:1500,growth:BALANCE.growth,order:2,visual:'supply'},
  {id:'powerplants',name:'Centrais',location:'Anel energético',description:'A próxima hipótese precisa de uma tomada maior.',base:9000,rate:700,unlock:12000,growth:BALANCE.growth,order:3,visual:'energy'},
  {id:'observatories',name:'Observatórios',location:'Colina de observação',description:'Olhar longe também é uma forma de construir.',base:60000,rate:4800,unlock:90000,growth:BALANCE.growth,order:4,visual:'lab'},
  ...([
    ['spectral-labs','Laboratórios espectrais','Jardim de frequências','O invisível finalmente aceita deixar um recibo.','4e5','3.5e4','6e5','lab'],
    ['automata','Tramas autômatas','Distrito sem turnos','Máquinas ensinam outras máquinas a fazer uma pausa.','3e6','2.8e5','4e6','energy'],
    ['compute-cores','Núcleos de cálculo','Arquivo de hipóteses','Uma resposta por segundo. Perguntas ainda por conta da casa.','2.4e7','2.4e6','3.2e7','lab'],
    ['orbital-beacons','Balizas orbitais','Órbita baixa','O observatório cresceu e pediu uma varanda no céu.','2.2e8','2.2e7','3e8','orbit'],
    ['horizon-mesh','Malhas de horizonte','Linha do amanhecer','Cada horizonte é só a borda de um mapa provisório.','2.5e9','2.5e8','3.4e9','orbit'],
    ['planetary-archives','Arquivos planetários','Crosta de memória','Um planeta inteiro, devidamente indexado.','3.5e10','3.5e9','5e10','orbit'],
    ['stellar-choirs','Coros estelares','Constelação de trabalho','Estrelas sincronizadas; nenhuma reunião poderia obter isso.','6e11','6e10','8e11','cosmic'],
    ['instant-atelier','Ateliês de instantes','Margem do agora','Fabricam segundos de excelente procedência.','1.4e13','1.4e12','2e13','cosmic'],
    ['cartographic-folds','Dobras de cartografia','Coordenada adjacente','A distância perdeu uma discussão com o mapa.','4e14','4e13','6e14','cosmic'],
    ['reality-anchors','Âncoras de realidade','Sala das certezas','Fixam o que existe antes que mude de ideia.','1.6e16','1.6e15','2.4e16','cosmic'],
    ['impossible-council','Conselhos do impossível','Além da última nota','O impossível foi aprovado. Falta apenas documentar.','8e17','8e16','1.2e18','cosmic'],
  ] as const).map(([id,name,location,description,base,rate,unlock,visual],i)=>({id,name,location,description,base,rate,unlock,visual,growth:BALANCE.growth,order:i+5})),
];
PRODUCERS.forEach((p,i)=>{p.base=BALANCE.installationCosts[i];p.rate=BALANCE.installationRates[i];p.unlock=i?amount(new D(p.base).mul(.8)):0;});
const tierNames=['Especialização','Automação','Rede integrada','Circuito fino','Cartografia interna','Turno autônomo','Matéria paciente','Hipótese aplicada','Malha de precisão','Horizonte expandido','Arquivo vivo','Última coordenada'];
export const UPGRADES:Upgrade[] = [
  ...PRODUCERS.flatMap(p=>BALANCE.tierMilestones.map((quantity,i)=>({
    id:`${p.id}-${i+1}`,name:`${p.name} · ${tierNames[i]}`,description:`${i===4||i===8?'Custo da família −5%; produção ×1,5.':i===6||i===10?'Produção ×1,5 e +0,2% por unidade própria.':'Produção da família ×2.'} Requer ${quantity} unidades. ${p.location}: mais uma página no arquivo.`,
    cost:amount(new D(p.base).mul(new D(4).pow(i+1)).mul(i<3?2:8)),category:'tier' as const,producer:p.id,quantity,prior:i?`${p.id}-${i}`:undefined,
    conditions:[{metric:'producers' as const,producer:p.id,target:quantity},...(i?[{owned:`${p.id}-${i}`}]:[])],
    effects:i===4||i===8?[{kind:'production' as const,producer:p.id,factor:1.5},{kind:'cost' as const,producer:p.id,factor:.95}]:i===6||i===10?[{kind:'production' as const,producer:p.id,factor:1.5},{kind:'perUnit' as const,producer:p.id,perUnit:.002}]:[{kind:'production' as const,producer:p.id,factor:2}],
  }))),
  ...PRODUCERS.flatMap((p,i)=>[1,2].map((tier,j)=>{const other=PRODUCERS[(i+tier)%PRODUCERS.length];return{
    id:`link-${p.id}-${tier}`,name:`${p.name} ↔ ${other.name}`,description:`${p.name}: +${j?2:1}% por ${other.name.toLowerCase()}. ${other.name}: +${j?1:.5}% por ${p.name.toLowerCase()}. Investir nas duas pontas sustenta a rede.`,cost:amount(new D(p.base).mul(j?2000:80).plus(new D(other.base).mul(j?40:4))),category:'synergy' as const,producer:p.id,
    conditions:[{metric:'producers' as const,producer:p.id,target:j?100:25},{metric:'producers' as const,producer:other.id,target:j?25:5}],effects:[{kind:'synergy' as const,producer:p.id,other:other.id,perUnit:j?.02:.01},{kind:'synergy' as const,producer:other.id,other:p.id,perUnit:j?.01:.005}],
  };})),
  ...PRODUCERS.map(p=>({id:`special-${p.id}`,name:`${p.name} · Nota de margem`,description:'Um detalhe do arquivo: produção ×1,5 e sinais 2% mais frequentes.',cost:amount(new D(p.base).mul('1e6')),category:'special' as const,producer:p.id,conditions:[{metric:'producers' as const,producer:p.id,target:150},{metric:'events' as const,target:5}],effects:[{kind:'production' as const,producer:p.id,factor:1.5},{kind:'eventChance' as const,factor:1.02}]})),
  ...[1,2,3].map((tier,i)=>({id:`pulse-${tier}`,name:`Pulso amplificado ${tier}`,description:'Potência do motor ×2, dentro do teto secundário. Nenhum intervalo entre cliques.',cost:[500,6000,70000][i],category:'global' as const,conditions:[{metric:'clicks' as const,target:[100,500,2000][i]},...(i?[{owned:`pulse-${i}`}]:[])],effects:[{kind:'pulse' as const,factor:2}]})),
  ...[1,2,3].map((tier,i)=>({id:`network-${tier}`,name:`Sinergia urbana ${tier}`,description:'Produção global ×1,25. Toda descoberta precisa circular.',cost:[3000,30000,300000][i],category:'global' as const,conditions:[{metric:'producers' as const,target:[20,60,150][i]},...(i?[{owned:`network-${i}`}]:[])],effects:[{kind:'production' as const,factor:1.25}]})),
  ...[10,25,50,100,150].map((target,i)=>({id:`discovery-${i+1}`,name:`Índice de descoberta · ${i+1}`,description:`Dobra a influência das conquistas elegíveis na produção. Requer índice ${target}.`,cost:amount(new D(5000).mul(new D(100).pow(i))),category:'global' as const,conditions:[{metric:'index' as const,target}],effects:[{kind:'achievement' as const,factor:2}]})),
  ...(['production','active','offline','duration','eventChance','cost','production','active','offline','duration','eventChance','cost','production','active'] as const).map((kind,i)=>({id:`protocol-${i+1}`,name:`Protocolo ${['de circulação','de prática','de longa observação','de ressonância','de escuta','de logística','de horizonte','de laboratório','de persistência','de alinhamento','de antena','de projeto','de expansão','de síntese'][i]}`,description:`${({production:'Produção global ×1,2',active:'Recompensas de atividades ×1,15',offline:'Horizonte offline ×1,2, até 14 dias',duration:'Duração dos sinais ×1,15',eventChance:'Sinais 10% mais frequentes',cost:'Instalações custam 5% menos'} as Record<string,string>)[kind]}. A rede aprende a coordenar seus próprios limites.`,cost:amount(new D('1e5').mul(new D(35).pow(i))),category:'global' as const,conditions:[{metric:'lifetime' as const,target:amount(new D('1e4').mul(new D(30).pow(i)))}],effects:[{kind,factor:kind==='cost'?.95:kind==='eventChance'?1.1:kind==='active'||kind==='duration'?1.15:1.2}]})),
];
export const PERMANENT:Upgrade[] = [
  {id:'legacy-tools',name:'Ferramentas herdadas',cost:1,category:'permanent',permanent:true,description:'Pulso ×2, limitado pelo teto do motor secundário.',conditions:[],effects:[{kind:'pulse',factor:2}]},
  {id:'city-charter',name:'Carta da cidade',cost:3,category:'permanent',permanent:true,description:'Instalações custam 10% menos.',conditions:[],effects:[{kind:'cost',factor:.9}]},
  {id:'long-horizon',name:'Horizonte longo',cost:5,category:'permanent',permanent:true,description:'Produção offline até 14 dias.',conditions:[],effects:[{kind:'offline',factor:2}]},
  {id:'shared-knowledge',name:'Conhecimento compartilhado',cost:8,category:'permanent',permanent:true,description:'Produção automática ×1,25.',conditions:[],effects:[{kind:'production',factor:1.25}]},
  ...(['production','cost','active','duration','eventChance','achievement'] as const).flatMap((kind,i)=>[1,2,3,4,5,6].map((tier,j)=>({id:`legacy-${kind.toLowerCase()}-${tier}`,name:`${['Memória da rede','Carta de logística','Ofício transmitido','Escuta prolongada','Antena herdada','Arquivo de descobertas'][i]} · ${tier}`,cost:amount(new D(5+i*2).mul(new D(5).pow(j))),category:'permanent' as const,permanent:true,
    description:`${({production:'Produção ×1,25',cost:'Custo de instalações −4%',active:'Recompensas de atividades ×1,2',duration:'Sinais duram 10% mais',eventChance:'Sinais 8% mais frequentes',achievement:'Influência do índice ×1,3'} as Record<string,string>)[kind]}. Uma melhoria para todos os próximos ciclos.`,conditions:j?[{owned:`legacy-${kind.toLowerCase()}-${j}`}]:[{metric:'cycles' as const,target:1}],effects:[{kind,factor:kind==='cost'?.96:kind==='duration'?1.1:kind==='eventChance'?1.08:kind==='achievement'?1.3:kind==='active'?1.2:1.25}],
  }))),
];
const milestones=(metric:Achievement['metric'],targets:(number|string)[],label:string,unit:string):Achievement[]=>targets.map((target,i)=>({id:`${metric.toLowerCase()}-${target}`,name:`${label} · ${i+1}`,description:`${target} ${unit}.`,metric,target,eligible:true}));
export const ACHIEVEMENTS:Achievement[] = [
  ...PRODUCERS.flatMap(p=>BALANCE.achievementMilestones.map(target=>({id:`units-${p.id}-${target}`,name:`${p.name} · ${target}`,description:`Possuir ${target} unidades de ${p.name.toLowerCase()}.`,metric:'producers' as const,producer:p.id,target,eligible:true}))),
  ...milestones('lifetime',[100,500,1000,5000,10000,50000,100000,500000,1000000,'1e7','1e8','1e9','1e10','1e11','1e12','1e14','1e16','1e18','1e21','1e24','1e30','1e40'],'Horizonte','de Produção acumulada'),
  ...milestones('producers',[10,25,50,100,150,250,500,1000,2000,4000,8000,16000],'Rede em expansão','instalações no ciclo'),
  ...milestones('upgrades',[1,3,5,10,21,40,60,100,150,200,240,265],'Engenharia aplicada','melhorias no ciclo'),
  ...milestones('focusMinutes',[1,10,30,60,120,300,600,1500,3000,6000],'Observação paciente','minutos efetivos de Foco recompensados'),
  ...milestones('reviews',[1,5,10,25,50,100,250,500,1000,2500],'Arquivo revisitado','revisões elegíveis recompensadas'),
  ...milestones('studyDays',[1,3,7,14,30,100],'Constância sem pressa','dias com dez minutos de Foco ou cinco revisões'),
  ...milestones('rounds',[1,5,10,25,50,100,250,500],'Memória em rede','rodadas de memória completas'),
  ...milestones('challenges',[1,5,10,20,50,100,250,500],'Oficina experiente','partidas completas na Oficina'),
  ...milestones('perfect',[1,5,20,100],'Controle impecável','partidas perfeitas na Oficina'),
  ...milestones('harvested',[10,50,200,1000],'Jardim abundante','colheitas'),
  ...milestones('gathered',[25,100,500,2000],'Expedição veterana','coletas'),
  ...milestones('prestige',[1,5,20,100,1000,10000],'História da cidade','insígnias recebidas na jornada'),
  ...milestones('events',[1,5,10,25,100,500],'Escuta do céu','sinais ativados'),
  ...milestones('combos',[1,5,25,100],'Frequências cruzadas','sobreposições de sinais distintos'),
  ...milestones('builds',[1,2,3,4],'Quatro perspectivas','classes exploradas por redistribuição'),
  ...milestones('synergies',[1,5,16,32],'Costura de horizontes','sinergias no ciclo'),
  ...milestones('families',[4,8,12,15,16],'Mapa do observatório','famílias operando no ciclo'),
  ...milestones('clicks',[100,500,2000],'Ritmo de máquina','pulsos na jornada'),
  ...milestones('cycles',[1,3,10,30],'Recalibração','ciclos voluntários'),
  ...([
    ['silent-start','Primeiro silêncio','lifetime',100000,'no-pulse'],['silent-horizon','Horizonte silencioso','lifetime','1e8','no-pulse'],
    ['four-directions','Quatro direções','cycles',1,'all-builds'],['four-horizons','Uma rede, quatro lentes','cycles',4,'all-builds'],
    ['complete-atlas','Atlas completo','families',16,'full-network'],['complete-return','Atlas herdado','cycles',3,'full-network'],
    ['patient-return','O arquivo esperou','lifetime',10000,'comeback'],['patient-universe','O céu ainda estava lá','lifetime','1e12','comeback'],
    ['symmetry','Arquitetura simétrica','producers',40,'symmetric'],['grand-symmetry','Tudo em seu lugar','producers',400,'symmetric'],
    ['night-note','Nota da madrugada','focusMinutes',30,'late-night'],['night-archive','Arquivo noturno','focusMinutes',600,'late-night'],
    ['double-sky','Dois céus','combos',1,'two-events'],['crossed-orbits','Órbitas cruzadas','combos',25,'two-events'],
    ['quiet-logistics','Um acordo improvável','upgrades',40,'many-discounts'],['perfect-blueprint','Planta sem desperdício','upgrades',200,'many-discounts'],
    ['clean-workshop','Cinco instrumentos afinados','perfect',5,'clean-run'],['clean-ensemble','Uma oficina em uníssono','perfect',20,'clean-run'],
    ['first-last','A caixa e o impossível','families',2,'old-and-new'],['unbroken-route','Não esquecer a origem','cycles',3,'old-and-new'],
  ] as const).map(([id,name,metric,target,condition])=>({id,name,metric,target,condition,description:`${({ 'no-pulse':'Avançar sem pulsos no motor','all-builds':'Explorar as quatro classes e recalibrar','full-network':'Manter todas as famílias em operação','comeback':'Retornar após ao menos um dia','symmetric':'Manter quatro ou mais famílias com a mesma quantidade','late-night':'Estudar entre meia-noite e cinco horas','two-events':'Sobrepor dois tipos de sinais','many-discounts':'Combinar descontos até 35%','clean-run':'Completar uma série de partidas perfeitas sem partidas imperfeitas','old-and-new':'Manter cem Coletores junto ao Conselho do impossível'} as Record<string,string>)[condition]}. Marco: ${target} (${metric}).`,secret:true,eligible:false})),
];
export const SIGNALS:Signal[] = [
  {id:'alignment',name:'Alinhamento orbital',description:'Produção ×3 por cinco minutos.',weight:45,rarity:'common',durationMs:5*60000,effects:[{kind:'production',factor:3}]},
  {id:'resonance',name:'Ressonância local',description:'Uma família produz ×5 por quatro minutos.',weight:25,rarity:'uncommon',durationMs:4*60000,family:true,effects:[{kind:'production',factor:5}]},
  {id:'cache',name:'Arquivo recuperado',description:'Receba o equivalente a dez minutos de produção.',weight:15,rarity:'common',durationMs:0,cacheMinutes:10,effects:[]},
  {id:'logistics',name:'Janela logística',description:'Instalações custam 20% menos por seis minutos.',weight:10,rarity:'uncommon',durationMs:6*60000,effects:[{kind:'cost',factor:.8}]},
  {id:'echo',name:'Eco de Prática',description:'Recompensas de atividades ×2 por oito minutos.',weight:5,rarity:'rare',durationMs:8*60000,build:'practice',effects:[{kind:'active',factor:2}]},
  {id:'interference',name:'Interferência construtiva',description:'Bônus por unidade das sinergias ×2 por quatro minutos.',weight:8,rarity:'rare',durationMs:4*60000,effects:[{kind:'synergyBoost',factor:2}]},
];
validateContent(PRODUCERS,[...UPGRADES,...PERMANENT],ACHIEVEMENTS,SIGNALS);
