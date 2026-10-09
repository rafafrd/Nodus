import {useEffect,useRef,useState} from 'react';
import {motionPreference,usePreferences} from './preferences';

/** Fixed camera and screen coordinates: only light animates, never the page position. */
export function HomeBackground({active}:{active:boolean}){
 const host=useRef<HTMLDivElement>(null),live=useRef(active),refresh=useRef(()=>{}),[failed,setFailed]=useState(false);
 const {value}=usePreferences();live.current=active;
 useEffect(()=>refresh.current(),[active,value.theme]);
 useEffect(()=>{
  let disposed=false,cleanup=()=>{};
  void import('three').then(T=>{
   if(disposed||!host.current)return;
   const el=host.current;let renderer:InstanceType<typeof T.WebGLRenderer>;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{setFailed(true);return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));el.append(renderer.domElement);
   const canvas=renderer.domElement;canvas.dataset.testid='home-background';canvas.setAttribute('aria-hidden','true');
   const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,2),geometry=new T.PlaneGeometry(2,2);
   const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},resolution:{value:new T.Vector2(1,1)},accent:{value:new T.Color()},light:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:`
    uniform float time;uniform vec2 resolution;uniform vec3 accent;uniform float light;varying vec2 vUv;
    void main(){
     vec2 p=(vUv-.5)*vec2(resolution.x/resolution.y,1.0);vec2 center=vec2(.36,.12);float distance=length((p-center)*vec2(.8,1.2));
     float breathing=.7+.3*sin(time*.23);float halo=exp(-distance*distance*3.2)*breathing;
     float rings=pow(.5+.5*cos(distance*30.0-time*.18),12.0)*(1.0-smoothstep(.05,.9,distance));
     vec2 grid=abs(fract(vUv*resolution/48.0-.5)-.5);float line=1.0-smoothstep(.0,.018,min(grid.x,grid.y));
     float beam=exp(-pow((p.x-p.y*.7+.65)*5.0,2.0))*(.5+.5*sin(time*.16+p.y*3.0));
     float alpha=halo*mix(.05,.035,light)+rings*mix(.04,.035,light)+line*.035+beam*.035;
     gl_FragColor=vec4(accent,alpha);
    }`});scene.add(new T.Mesh(geometry,material));
   const reduced=motionPreference();let frame=0,last=0,time=0,frames=0,minimized=false,lost=false,dirty=true;
   function running(){return live.current&&!document.hidden&&!minimized&&!lost;}
   function paint(now:number){frame=0;if(!running())return;if(now-last<65&&!dirty&&!reduced.matches){frame=requestAnimationFrame(paint);return;}
    const delta=last?Math.min(.1,(now-last)/1000):0;last=now;if(!reduced.matches)time+=delta;
    const style=getComputedStyle(document.documentElement);material.uniforms.accent.value.set(style.getPropertyValue('--theme-accent').trim());material.uniforms.light.value=document.documentElement.dataset.theme==='white'?1:0;material.uniforms.time.value=time;
    renderer.render(scene,camera);dirty=false;canvas.dataset.ready='true';canvas.dataset.frames=String(++frames);canvas.dataset.time=time.toFixed(3);canvas.dataset.motion=reduced.matches?'still':'running';
    if(!reduced.matches)frame=requestAnimationFrame(paint);
   }
   function restart(){dirty=true;if(!running()){cancelAnimationFrame(frame);frame=0;last=0;canvas.dataset.motion='paused';return;}if(!frame)frame=requestAnimationFrame(paint);}
   const resize=new ResizeObserver(()=>{renderer.setSize(Math.max(1,el.clientWidth),Math.max(1,el.clientHeight));material.uniforms.resolution.value.set(Math.max(1,el.clientWidth),Math.max(1,el.clientHeight));restart();});resize.observe(el);
   const contextLost=(event:Event)=>{event.preventDefault();lost=true;restart();setFailed(true);};canvas.addEventListener('webglcontextlost',contextLost);
   const removeWindow=window.desktop.onWindowState(state=>{minimized=state.minimized;restart();});void window.desktop.getWindowState().then(r=>{if(!disposed&&r.ok){minimized=r.value.minimized;restart();}});
   document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);refresh.current=restart;restart();
   cleanup=()=>{refresh.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();removeWindow();document.removeEventListener('visibilitychange',restart);reduced.removeEventListener('change',restart);canvas.removeEventListener('webglcontextlost',contextLost);geometry.dispose();material.dispose();renderer.dispose();canvas.remove();};
  }).catch(()=>{if(!disposed)setFailed(true);});
  return()=>{disposed=true;cleanup();};
 },[]);
 return <div ref={host} className="home-background" data-fallback={failed} aria-hidden="true"/>;
}
