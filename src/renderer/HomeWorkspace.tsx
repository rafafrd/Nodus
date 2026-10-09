import {useLayoutEffect,useRef,type ComponentProps} from 'react';
import {gsap} from 'gsap';
import {DayOverview} from './DayOverview';
import {HomeBackground} from './HomeBackground';
import {useReducedMotion} from './motion';
import type {WorkspaceArea} from '../shared/workspace';

export function HomeWorkspace(props:ComponentProps<typeof DayOverview>&{navigate(area:WorkspaceArea):void}){
 const host=useRef<HTMLDivElement>(null),reduced=useReducedMotion();
 useLayoutEffect(()=>{
  const el=host.current!;const components=el.querySelectorAll('[data-home-enter]');
  gsap.killTweensOf(components);el.dataset.componentMotion='still';
  if(!props.activeArea||reduced){gsap.set(components,{clearProps:'opacity,transform,willChange'});return;}
  el.dataset.componentMotion='entering';
  const tween=gsap.fromTo(components,{y:18,opacity:0},{y:0,opacity:1,duration:.65,stagger:.07,ease:'power3.out',clearProps:'opacity,transform,willChange',onComplete:()=>{el.dataset.componentMotion='idle';}});
  return()=>{tween.kill();gsap.set(components,{clearProps:'opacity,transform,willChange'});};
 },[props.activeArea,reduced]);
 return <div className="home-workspace" ref={host} data-testid="home-workspace"><HomeBackground active={props.activeArea}/><div className="home-scroll"><DayOverview {...props} home explore={props.navigate}/></div></div>;
}
