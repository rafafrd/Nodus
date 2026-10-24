import {useEffect,useRef,useState} from 'react';
import {motionPreference,usePreferences} from './preferences';
import type {WorkspaceArea} from '../shared/workspace';

/** Areas where the user reads or writes: while one is visible the backdrop holds a still frame (ADR-0025). */
const READING:readonly WorkspaceArea[]=['study','pdf','video'];
/** Areas the backdrop is visible behind. The city scene covers it, so it never asks for motion. */
const AMBIENT:readonly WorkspaceArea[]=['home','settings','review','graph','explorer'];
export const backdropAnimates=(panes:readonly WorkspaceArea[],cinema:boolean)=>!cinema&&panes.some(a=>AMBIENT.includes(a))&&!panes.some(a=>READING.includes(a));
type Rgb=readonly [number,number,number];
const luminance=(c:Rgb)=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
export const contrast=(a:Rgb,b:Rgb)=>{const x=luminance(a)+.05,y=luminance(b)+.05;return Math.max(x,y)/Math.min(x,y);};
/** Highest ink alpha whose blend over the page still gives secondary text `target`:1 (canvas blending is in sRGB).`n * 4.7 rather than 4.5: measured screenshots land up to 0.15 lower where grid, rings and halo overlap. */
export function backdropCap(bg:Rgb,ink:Rgb,muted:Rgb,target=4.7){
 const blend=(a:number)=>bg.map((v,i)=>Math.round(v+(ink[i]-v)*a)) as unknown as Rgb;
 let low=0,high=.45;for(let i=0;i<24;i++){const mid=(low+high)/2;if(contrast(muted,blend(mid))>=target)low=mid;else high=mid;}
 return low;
}
const hex=(value:string):Rgb|null=>{const m=value.trim().match(/^#([0-9a-f]{6})$/i);if(!m)return null;const n=parseInt(m[1],16);return [n>>16,n>>8&255,n&255];};

const FRAGMENT=`precision highp float;
uniform float time,strength,cap,dpr;uniform vec2 size;uniform vec3 ink;
float rule(float x,float period){float d=abs(fract(x/period+.5)-.5)*period;return 1.0-smoothstep(.5,1.5,d);}
void main(){
 vec2 px=gl_FragCoord.xy/dpr,p=(px/size-.5)*vec2(size.x/size.y,1.0);
 float grid=max(rule(px.x,48.0),rule(px.y,48.0)),major=max(rule(px.x,192.0),rule(px.y,192.0));
 vec2 center=vec2(.42*size.x/size.y,.24);float d=length((p-center)*vec2(.8,1.15));
 float halo=exp(-d*d*2.4)*(.78+.22*sin(time*.21));
 float rings=pow(.5+.5*cos(d*30.0-time*.16),14.0)*(1.0-smoothstep(.06,1.0,d));
 float beam=exp(-pow((p.x-p.y*.7+.5+.08*sin(time*.05))*4.0,2.0))*(.55+.45*sin(time*.13+p.y*2.6));
 float corner=exp(-pow(length((p-vec2(-.5*size.x/size.y,-.5))*vec2(1.0,1.4)),2.0)*3.0);
 float alpha=grid*(.045+.035*halo)+major*.035+halo*.11+rings*.06+beam*.05+corner*.05;
 gl_FragColor=vec4(ink,clamp(alpha*strength,0.0,cap));
}`;

/** One WebGL canvas behind the whole shell. Fixed camera: only light moves, never the page. */
export function AppBackdrop({panes,cinema}:{panes:readonly WorkspaceArea[];cinema:boolean}){
 const host=useRef<HTMLDivElement>(null),animate=backdropAnimates(panes,cinema),live=useRef(animate),refresh=useRef(()=>{}),[failed,setFailed]=useState(false);
 const {value}=usePreferences(),allowed=value.animations&&value.editorialBackground,allowedRef=useRef(allowed);
 live.current=animate;allowedRef.current=allowed;
 // Theme tokens are read once per theme/intensity change (after PreferencesProvider has applied them).
 // The cap serves the shader and the CSS fallback.
 useEffect(()=>{const style=getComputedStyle(document.documentElement),ink=style.getPropertyValue('--backdrop-ink').trim().split(/\s+/).map(Number) as unknown as Rgb,bg=hex(style.getPropertyValue('--theme-bg')),muted=hex(style.getPropertyValue('--theme-muted'));
  if(ink.length===3&&ink.every(Number.isFinite)&&bg&&muted)host.current!.style.setProperty('--backdrop-cap',backdropCap(bg,ink,muted).toFixed(4));},[value.theme,value.backgroundIntensity]);
 useEffect(()=>refresh.current(),[animate,allowed,value.theme,value.backgroundIntensity]);
 useEffect(()=>{
  let disposed=false,cleanup=()=>{};
  void import('three').then(T=>{
   if(disposed||!host.current)return;
   const el=host.current;let renderer:InstanceType<typeof T.WebGLRenderer>;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{setFailed(true);return;}
   const dpr=Math.min(devicePixelRatio,1.25);renderer.setPixelRatio(dpr);el.append(renderer.domElement);
   const canvas=renderer.domElement;canvas.dataset.testid='app-background';canvas.setAttribute('aria-hidden','true');
   const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,2),geometry=new T.PlaneGeometry(2,2);
   // ink is a raw sRGB triplet from the theme tokens, so no colour-space conversion is applied.
   const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:12},strength:{value:1},cap:{value:.1},dpr:{value:dpr},size:{value:new T.Vector2(1,1)},ink:{value:new T.Vector3(1,1,1)}},vertexShader:'void main(){gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:FRAGMENT});
   scene.add(new T.Mesh(geometry,material));
   const reduced=motionPreference(),stage=document.querySelector<HTMLElement>('.area-stage');
   let frame=0,last=0,frames=0,minimized=false,lost=false,dirty=true;
   function readTheme(){const style=getComputedStyle(document.documentElement),ink=style.getPropertyValue('--backdrop-ink').trim().split(/\s+/).map(Number) as unknown as Rgb;
    if(ink.length===3&&ink.every(Number.isFinite))material.uniforms.ink.value.set(ink[0]/255,ink[1]/255,ink[2]/255);
    material.uniforms.cap.value=Number(el.style.getPropertyValue('--backdrop-cap'))||.1;
    material.uniforms.strength.value=(Number(style.getPropertyValue('--backdrop-strength'))||1)*(Number(style.getPropertyValue('--backdrop-scale'))||1);}
   const moving=()=>allowedRef.current&&!reduced.matches,visible=()=>!document.hidden&&!minimized&&!lost;
   const looping=()=>moving()&&live.current&&visible()&&stage?.dataset.motion!=='transitioning';
   function state(){el.dataset.running=String(looping());canvas.dataset.motion=!moving()?'still':looping()?'running':'paused';}
   function paint(now:number){
    frame=0;if(!visible())return;
    const loop=looping();
    // About 30 frames/s is enough for slow light; a still frame is painted once per change.
    if(loop&&!dirty&&now-last<33){frame=requestAnimationFrame(paint);return;}
    if(loop&&last)material.uniforms.time.value+=Math.min(.1,(now-last)/1000);last=loop?now:0;
    renderer.render(scene,camera);dirty=false;canvas.dataset.ready='true';canvas.dataset.frames=String(++frames);canvas.dataset.time=Number(material.uniforms.time.value).toFixed(3);state();
    if(loop)frame=requestAnimationFrame(paint);
   }
   function restart(){dirty=true;state();if(!frame&&visible())frame=requestAnimationFrame(paint);}
   const resize=new ResizeObserver(()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);renderer.setSize(w,h);material.uniforms.size.value.set(w,h);restart();});resize.observe(el);
   // Area changes keep the last frame on screen and give every frame back to the transition.
   const transitions=new MutationObserver(()=>{if(stage?.dataset.motion==='transitioning'){cancelAnimationFrame(frame);frame=0;state();}else restart();});if(stage)transitions.observe(stage,{attributes:true,attributeFilter:['data-motion']});
   const contextLost=(event:Event)=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;state();setFailed(true);};canvas.addEventListener('webglcontextlost',contextLost);
   const removeWindow=window.desktop.onWindowState(s=>{minimized=s.minimized;restart();});void window.desktop.getWindowState().then(r=>{if(!disposed&&r.ok){minimized=r.value.minimized;restart();}});
   document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);refresh.current=()=>{readTheme();restart();};readTheme();restart();
   cleanup=()=>{refresh.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();transitions.disconnect();removeWindow();document.removeEventListener('visibilitychange',restart);reduced.removeEventListener('change',restart);canvas.removeEventListener('webglcontextlost',contextLost);geometry.dispose();material.dispose();renderer.dispose();canvas.remove();};
  }).catch(()=>{if(!disposed)setFailed(true);});
  return()=>{disposed=true;cleanup();};
 },[]);
 return <div ref={host} className="app-backdrop" data-testid="app-backdrop" data-fallback={failed} aria-hidden="true"/>;
}
