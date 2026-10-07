import { useEffect,useRef } from 'react';
import { gsap } from 'gsap';
import { Icon } from './Icon';
import { MotorGain,useReducedMotion } from './motion';
export function EngineButton({disabled,gain,press}:{disabled:boolean;gain:{id:number;coins:number};press():void}){
 const button=useRef<HTMLButtonElement>(null),wheel=useRef<HTMLSpanElement>(null),reduced=useReducedMotion(),turn=useRef(0);
 useEffect(()=>()=>{gsap.killTweensOf(button.current);gsap.killTweensOf(wheel.current);},[]);
 useEffect(()=>{if(reduced){turn.current=0;gsap.killTweensOf(button.current);gsap.killTweensOf(wheel.current);gsap.set(button.current,{clearProps:'transform'});gsap.set(wheel.current,{clearProps:'transform'});}},[reduced]);
 function click(){if(disabled)return;if(!reduced){turn.current+=35;gsap.killTweensOf(button.current);gsap.fromTo(button.current,{scale:.965},{scale:1,duration:.22,ease:'back.out(2)',clearProps:'transform'});gsap.to(wheel.current,{rotation:turn.current,duration:.24,ease:'power2.out',overwrite:true});}press();}
 return <button ref={button} className="engine-pulse" aria-label="Gerar moedas" disabled={disabled} onClick={click}><span ref={wheel} className="engine-wheel"><Icon kind="engine"/></span><MotorGain id={gain.id} coins={gain.coins}/><b>Acionar motor</b><small>Um clique, um pulso.</small></button>;
}
