import {FARM_PROJECTS,STATION_CAPACITY,STATION_RESOURCE,type StationId} from '../shared/farm';
import {RESOURCES,type GameAction,type GameState,type Resource} from '../shared/game';
import {formatAmount} from '../shared/amount';
import type {Place} from './CityScene';

const RESOURCE_PLACE:Record<Resource,Place>={wood:'forest',stone:'mine',wheat:'farm',carrot:'farm'};
export function StationStock({state,id,busy,execute}:{state:GameState;id:StationId;busy:boolean;execute(a:GameAction):void}){
 const station=state.farm.stations[id],full=station.stock===STATION_CAPACITY,project=FARM_PROJECTS.find(v=>v.id===id)!;
 return <section className="station-stock" aria-label={`Estoque do ${project.name.toLowerCase()}`}><div><strong>{project.name}</strong><small>{full?'Estoque cheio · produção pausada':'1 '+RESOURCES[STATION_RESOURCE[id]].name.toLowerCase()+'/min · inclusive com o app fechado'}</small></div><progress aria-label={`Estoque ${project.name}`} value={station.stock} max={STATION_CAPACITY}/><div className="station-collect"><span data-testid={`stock-${id}`}>{station.stock} / {STATION_CAPACITY}</span><button disabled={busy||!station.stock} aria-label={`Recolher ${project.name}`} onClick={()=>execute({kind:'farm-collect',station:id})}>Recolher {station.stock||''}</button></div></section>;
}
export function FarmProjects({state,busy,execute,visit,reinvest}:{state:GameState;busy:boolean;execute(a:GameAction):void;visit(p:Place,crop?:'wheat'|'carrot'):void;reinvest():void}){
 const q=state.farm.objective,stations=(Object.keys(STATION_RESOURCE) as StationId[]).filter(id=>state.farm.built.includes(id)),choice=state.farm.built.includes('depot')&&stations.length===0;
 const next=state.farm.reinvestment;
 return <section className="farm-objective" aria-label="Próximo objetivo"><span className="game-kicker">{q?'PRÓXIMO PROJETO':'REINVESTIR NA VILA'}</span>
 {q?<><div className="farm-objective-title"><h2>{q.name}</h2><span>{q.progress}%</span></div><p>{q.benefit}</p><progress value={q.progress} max={100} aria-label={`Materiais para ${q.name}`}/>
 {choice&&<label className="farm-project-choice">Qual posto construir primeiro?<select aria-label="Próximo posto" disabled={busy} value={q.id} onChange={e=>execute({kind:'farm-target',project:e.target.value as StationId})}><option value="forest-post">Bosque · madeira</option><option value="mine-post">Mina · pedra</option></select></label>}
 <div className="project-materials">{q.materials.map(m=><div key={m.resource}><span>{RESOURCES[m.resource].name} <b>{Math.min(m.have,m.required)}/{m.required}</b></span>{m.missing?<button aria-label={`Buscar ${RESOURCES[m.resource].name}`} disabled={busy} onClick={()=>visit(RESOURCE_PLACE[m.resource],m.resource==='wheat'||m.resource==='carrot'?m.resource:undefined)}>Faltam {m.missing} · buscar ↗</button>:<small>✓ Pronto</small>}</div>)}</div>
 <button className="primary project-build" disabled={busy||!q.ready} onClick={()=>execute({kind:'farm-build',project:q.id})}>Construir {q.name}</button></>:next?<><h2>{next.name}</h2><p>{next.benefit}</p><small>{formatAmount(next.cost)} de Produção</small><button className="primary project-build" onClick={reinvest}>Ver em Produção →</button></>:<><h2>Vila construída</h2><p>Recolha seus postos e explore a produção da cidade.</p><button className="primary project-build" onClick={reinvest}>Ver Produção →</button></>}
 {!!stations.length&&<details className="farm-stocks"><summary>Postos · {stations.reduce((sum,id)=>sum+state.farm.stations[id].stock,0)} materiais disponíveis</summary>{stations.map(id=><StationStock key={id} state={state} id={id} busy={busy} execute={execute}/>)}<p>Recolher transfere materiais ao inventário. Cultivos continuam manuais.</p></details>}
 </section>;
}
