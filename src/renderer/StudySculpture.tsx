import {useEffect,useRef,useState} from 'react';
import {motionPreference} from './preferences';

/** A quiet, decorative scene. It never creates study or game progress. */
export function StudySculpture({active}:{active:boolean}){
 const host=useRef<HTMLDivElement>(null),live=useRef(active),redraw=useRef(()=>{}),[failed,setFailed]=useState(false);live.current=active;
 useEffect(()=>redraw.current(),[active]);
 useEffect(()=>{
  let disposed=false,cleanup=()=>{};
  void import('three').then(T=>{
   if(disposed||!host.current)return;const el=host.current;
   let renderer:InstanceType<typeof T.WebGLRenderer>;
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
   el.append(renderer.domElement);const canvas=renderer.domElement;canvas.dataset.testid='study-sculpture';canvas.setAttribute('aria-hidden','true');
   const scene=new T.Scene(),camera=new T.OrthographicCamera(-5.5,5.5,4.2,-4.2,.1,80);camera.position.set(8,9,12);camera.lookAt(0,.8,0);
   scene.add(new T.HemisphereLight('#fff4db','#1c2831',3));const light=new T.DirectionalLight('#e7c489',4);light.position.set(-4,8,5);scene.add(light);
   const objects=new T.Group();scene.add(objects);
   const geometries=new Set<InstanceType<typeof T.BufferGeometry>>(),materials=new Set<InstanceType<typeof T.Material>>();
   const box=new T.BoxGeometry(1,1,1),sphere=new T.IcosahedronGeometry(1,1),ring=new T.TorusGeometry(1,.012,6,100);[box,sphere,ring].forEach(g=>geometries.add(g));
   const mat=(color:string,metal=0)=>{const m=new T.MeshStandardMaterial({color,roughness:.6,metalness:metal});materials.add(m);return m;};
   const paper=mat('#e6dac0'),cover=mat('#253943'),gold=mat('#d6b373',.5),ink=mat('#a8b8b4'),dark=mat('#17262c');
   function block(parent:InstanceType<typeof T.Object3D>,material:InstanceType<typeof T.Material>,x:number,y:number,z:number,w:number,h:number,d:number){const m=new T.Mesh(box,material);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
   block(objects,dark,0,-.22,0,5.3,.32,3.65);block(objects,gold,0,-.045,0,5.35,.025,3.7);
   const book=new T.Group();objects.add(book);book.rotation.y=-.12;
   for(const side of [-1,1]){const leaf=new T.Group();leaf.rotation.z=side*.08;book.add(leaf);block(leaf,cover,side*1.08,.09,0,2.12,.15,2.9);
    for(let i=0;i<7;i++)block(leaf,paper,side*1.08,.18+i*.035,0,2.02,.027,2.72);
    for(let i=0;i<6;i++)block(leaf,ink,side*1.08,.43,-.92+i*.32,1.25-(i%3)*.18,.012,.025);
   }block(book,gold,0,.22,0,.07,.26,2.8);
   const orbit=new T.Mesh(ring,gold);orbit.rotation.x=Math.PI/2;orbit.scale.set(3.6,3.6,3.6);orbit.position.y=1.05;objects.add(orbit);
   const nodes:InstanceType<typeof T.Mesh>[]=[];for(let i=0;i<7;i++){const n=new T.Mesh(sphere,i%3===0?gold:ink);n.scale.setScalar(i%3===0?.15:.09);objects.add(n);nodes.push(n);}
   const lineGeo=new T.BufferGeometry();geometries.add(lineGeo);const positions=new Float32Array(7*6);lineGeo.setAttribute('position',new T.BufferAttribute(positions,3));const lineMat=new T.LineBasicMaterial({color:'#bdac83',transparent:true,opacity:.25});materials.add(lineMat);const connections=new T.LineSegments(lineGeo,lineMat);objects.add(connections);
   const sheets:InstanceType<typeof T.Group>[]=[];for(let i=0;i<3;i++){const g=new T.Group();g.position.set(1.8+i*.25,1.6+i*.5,-.6-i*.45);g.rotation.set(-.18,0,-.16+i*.2);block(g,paper,0,0,0,.95,.025,1.2);for(let j=0;j<3;j++)block(g,ink,0,.017,-.3+j*.24,.55,.01,.025);objects.add(g);sheets.push(g);}
   const reduced=motionPreference();let frame=0,last=0,time=0,frames=0,visible=true,minimized=false,dirty=true;const aim={x:0,y:0};
   function running(){return live.current&&visible&&!document.hidden&&!minimized;}
   function draw(now:number){frame=0;if(!running())return;if(now-last<33&&!dirty&&!reduced.matches){frame=requestAnimationFrame(draw);return;}
    const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(!reduced.matches)time+=dt;
    objects.rotation.y=reduced.matches?0:T.MathUtils.damp(objects.rotation.y,aim.x*.12,4,dt);objects.rotation.x=reduced.matches?0:T.MathUtils.damp(objects.rotation.x,aim.y*.035,4,dt);
    for(let i=0;i<nodes.length;i++){const angle=i*Math.PI*2/7+time*.09;nodes[i].position.set(Math.cos(angle)*3.6,1.05+Math.sin(angle*2+time*.3)*.28,Math.sin(angle)*2.65);const start=i*6;positions.set([nodes[i].position.x,nodes[i].position.y,nodes[i].position.z,0,.45,0],start);}
    lineGeo.attributes.position.needsUpdate=true;sheets.forEach((g,i)=>{g.position.y=1.6+i*.5+(reduced.matches?0:Math.sin(time*.7+i)*.1);g.rotation.y=reduced.matches?0:Math.sin(time*.25+i)*.12;});
    renderer.render(scene,camera);dirty=false;canvas.dataset.ready='true';canvas.dataset.frames=String(++frames);canvas.dataset.motion=reduced.matches?'still':'running';canvas.dataset.time=time.toFixed(3);canvas.dataset.drawCalls=String(renderer.info.render.calls);if(!reduced.matches)frame=requestAnimationFrame(draw);
   }
   function restart(){dirty=true;if(!running()){cancelAnimationFrame(frame);frame=0;last=0;canvas.dataset.motion='paused';return;}if(!frame)frame=requestAnimationFrame(draw);}
   const resize=new ResizeObserver(()=>{const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);camera.left=-4.2*w/h;camera.right=4.2*w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);restart();});resize.observe(el);
   const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart();});intersection.observe(el);
   const pointer=(e:PointerEvent)=>{const b=el.getBoundingClientRect();aim.x=(e.clientX-b.left)/b.width-.5;aim.y=(e.clientY-b.top)/b.height-.5;};const leave=()=>{aim.x=0;aim.y=0;};el.addEventListener('pointermove',pointer);el.addEventListener('pointerleave',leave);
   const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;setFailed(true);};canvas.addEventListener('webglcontextlost',lost);
   const removeWindow=window.desktop.onWindowState(s=>{minimized=s.minimized;restart();});void window.desktop.getWindowState().then(r=>{if(!disposed&&r.ok){minimized=r.value.minimized;restart();}});
   document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);redraw.current=restart;restart();
   cleanup=()=>{redraw.current=()=>{};cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();removeWindow();document.removeEventListener('visibilitychange',restart);reduced.removeEventListener('change',restart);el.removeEventListener('pointermove',pointer);el.removeEventListener('pointerleave',leave);canvas.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();canvas.remove();};
  }).catch(()=>{if(!disposed)setFailed(true);});
  return()=>{disposed=true;cleanup();};
 },[]);
 return <div className="study-sculpture" ref={host} aria-hidden="true">{failed&&<div className="sculpture-fallback">N<span>Uma ideia encontra outra.</span></div>}<span className="sculpture-caption">IDEIAS EM CONSTRUÇÃO <i/></span></div>;
}
