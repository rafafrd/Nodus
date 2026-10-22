import { useEffect,useRef } from 'react';
import { gsap } from 'gsap';
import { Icon } from './Icon';
import { duration,ease,MotorGain,useReducedMotion } from './motion';
import type {Amount} from '../shared/amount';
export function EngineButton({disabled,gain,exhausted=false,press}:{disabled:boolean;gain:{id:number;coins:Amount};exhausted?:boolean;press():void}){
 const button=useRef<HTMLButtonElement>(null),wheel=useRef<HTMLSpanElement>(null),reduced=useReducedMotion(),turn=useRef(0);
 useEffect(()=>()=>{gsap.killTweensOf(button.current);gsap.killTweensOf(wheel.current);},[]);
 useEffect(()=>{if(reduced){turn.current=0;gsap.killTweensOf(button.current);gsap.killTweensOf(wheel.current);gsap.set(button.current,{clearProps:'transform'});gsap.set(wheel.current,{clearProps:'transform'});}},[reduced]);
 function click(){if(disabled)return;if(!reduced){turn.current+=35;gsap.killTweensOf(button.current);gsap.fromTo(button.current,{scale:.965},{scale:1,duration:duration.micro,ease:ease.out,clearProps:'transform'});gsap.to(wheel.current,{rotation:turn.current,duration:duration.ui,ease:ease.out,overwrite:true});}press();}
 return <button ref={button} className="engine-pulse" aria-label="Gerar Produção" disabled={disabled||exhausted} onClick={click}><span ref={wheel} className="engine-wheel"><Icon kind="engine"/></span><MotorGain id={gain.id} coins={gain.coins}/><b>{exhausted?'Orçamento de hoje esgotado':'Acionar motor'}</b><small>{exhausted?'Explore a vila enquanto o motor descansa.':'Um clique, um pulso.'}</small></button>;
}
