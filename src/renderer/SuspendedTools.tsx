import { useEffect,useRef,useState } from 'react';
import { FocusPanel } from './FocusPanel';
import { ChecklistPanel } from './ChecklistPanel';
import { Icon } from './Icon';
export function SuspendedTools({subjectId,nextStepId,onNext,onError,version,cinema,opened,open}:{subjectId:string|null;nextStepId:string|null;onNext(id:string|null):void;onError(message:string):void;version:string;cinema:boolean;opened:'focus'|'checklist'|null;open(value:'focus'|'checklist'|null):void}){
 const [hover,setHover]=useState<'focus'|'checklist'|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),shown=opened??hover;
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 function enter(value:'focus'|'checklist'){if(timer.current)clearTimeout(timer.current);setHover(value);}
 function leave(){timer.current=setTimeout(()=>setHover(null),180);}
 return <footer className="suspended-tools" inert={cinema}><span className="workspace-local">LOCAL / <span data-testid="version">{version}</span></span>{subjectId&&<div className="suspended-buttons" onPointerLeave={leave} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(null);}}>{(['focus','checklist'] as const).map(value=><button key={value} aria-label={value==='focus'?'Abrir foco':'Abrir checklist'} aria-expanded={shown===value} onPointerEnter={()=>enter(value)} onFocus={()=>enter(value)} onClick={()=>open(opened===value?null:value)}><Icon kind={value==='focus'?'focus':'check'}/>{value==='focus'?'Foco':'Checklist'}</button>)}{shown&&!cinema&&<section className="suspended-popover" aria-label={shown==='focus'?'Painel de foco':'Painel de checklist'} onPointerEnter={()=>enter(shown)} onPointerLeave={leave} onKeyDown={e=>{if(e.key==='Escape'){open(null);setHover(null);}}}><header><strong>{shown==='focus'?'Foco':'Próximos passos'}</strong><button aria-label="Fechar painel suspenso" onClick={()=>{open(null);setHover(null);}}>×</button></header>{shown==='focus'?<FocusPanel key={subjectId} subjectId={subjectId} onError={onError}/>:<ChecklistPanel key={subjectId} subjectId={subjectId} nextStepId={nextStepId} onNext={onNext} onError={onError}/>}</section>}</div>}</footer>;
}
