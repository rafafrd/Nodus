import * as T from 'three';
import type {GameState} from '../shared/game';
import {FARM_POSITIONS} from './FarmScene';
import {dec} from '../shared/amount';

/** Cosmetic animation only: it observes confirmed state from the main process. */
export function createCityEffects(){
 const root=new T.Group();root.name='city-atmosphere';
 const geometry=new T.PlaneGeometry(3.4,20.5,1,1),waterMaterial=new T.ShaderMaterial({
  uniforms:{time:{value:0},base:{value:new T.Color('#78aaa9')},crest:{value:new T.Color('#c8e2d3')}},
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform float time;uniform vec3 base;uniform vec3 crest;varying vec2 vUv;
   void main(){float a=sin(vUv.y*110.0-time*1.8+sin(vUv.x*14.0+time*.4)*1.6);float b=sin(vUv.y*64.0+vUv.x*12.0-time*.9);float waves=smoothstep(.82,1.0,a)*.22+smoothstep(.9,1.0,b)*.14;
   float edge=smoothstep(0.0,.13,vUv.x)*smoothstep(0.0,.13,1.0-vUv.x);gl_FragColor=vec4(mix(base,crest,waves+(1.0-edge)*.15),1.0);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`
 });
 const water=new T.Mesh(geometry,waterMaterial);water.rotation.x=-Math.PI/2;water.position.set(9.8,.322,0);root.add(water);
 const orb=new T.IcosahedronGeometry(1,0),mistMat=new T.MeshBasicMaterial({color:'#e5e8df',transparent:true,opacity:.35,depthWrite:false});
 const clouds=new T.InstancedMesh(orb,mistMat,18);clouds.frustumCulled=false;root.add(clouds);
 const moteGeo=new T.BufferGeometry(),motePositions=new Float32Array(48*3);moteGeo.setAttribute('position',new T.BufferAttribute(motePositions,3));const moteMat=new T.PointsMaterial({color:'#f5d88f',size:.065,transparent:true,opacity:.75,depthWrite:false});const motes=new T.Points(moteGeo,moteMat);motes.frustumCulled=false;root.add(motes);
 const burstMaterial=new T.MeshBasicMaterial({color:'#e6c984',transparent:true,opacity:1,depthWrite:false}),burst=new T.InstancedMesh(orb,burstMaterial,36);burst.frustumCulled=false;burst.visible=false;root.add(burst);
 const matrix=new T.Object3D(),emitter=new T.Vector3();let age=9,time=0,lastClicks=-1,previous:GameState['farm']|null=null;
 function emit(x:number,y:number,z:number){emitter.set(x,y,z);age=0;burst.visible=true;}
 return {root,get time(){return time;},get emitting(){return age<1.2;},update(s:GameState,delta:number,motion:boolean){
  const night=s.atmosphere==='night',cyber=s.skin==='cyberpunk';if(motion)time+=delta;
  water.position.y=s.skin==='original'?.322:.135;waterMaterial.uniforms.time.value=time;waterMaterial.uniforms.base.value.set(cyber?'#15384a':night?'#2b5467':s.atmosphere==='dawn'?'#82a6ab':'#6b9d9f');waterMaterial.uniforms.crest.value.set(cyber?'#77e9df':night?'#78a7b8':'#dce7ce');
  clouds.visible=s.skin==='original'&&!night;for(let i=0;i<18;i++){const c=Math.floor(i/6),phase=i%6;matrix.position.set(-14+c*12+Math.sin(time*.035+c)*1.8+(phase%3)*1.05,7+c*.65+Math.sin(phase)*.2,-10+(c%2)*19+Math.floor(phase/3)*.7);matrix.scale.set(1.45,.35,1.15);matrix.rotation.set(0,phase*.2,0);matrix.updateMatrix();clouds.setMatrixAt(i,matrix.matrix);}clouds.instanceMatrix.needsUpdate=true;
  motes.visible=night||cyber;moteMat.color.set(cyber?'#82eddf':'#f3d383');for(let i=0;i<48;i++)motePositions.set([-12+(i*7.91)%24+Math.sin(time*.2+i)*.3,.8+(i%6)*.45+Math.sin(time*.7+i)*.2,-8+(i*3.73)%17],i*3);moteGeo.attributes.position.needsUpdate=true;
  if(previous){const built=s.farm.built.find(id=>!previous!.built.includes(id));if(built&&motion){const p=FARM_POSITIONS[built];emit(p[0],1,p[2]);}
   for(const id of ['forest-post','mine-post'] as const)if(s.farm.stations[id].stock<previous.stations[id].stock&&motion){const p=FARM_POSITIONS[id];emit(p[0],.8,p[2]);}}
  if(lastClicks>=0&&s.engine.clicks>lastClicks&&dec(s.engine.lastGain??0).gt(0)&&motion)emit(3,1.2,2.4);
  if(motion)age+=delta;else age=9;burst.visible=age<1.2;burstMaterial.opacity=Math.max(0,1-age/1.2);
  if(burst.visible)for(let i=0;i<36;i++){const angle=i*2.39996,speed=.8+(i%7)*.16;matrix.position.set(emitter.x+Math.cos(angle)*age*speed,emitter.y+age*(1+(i%5)*.3)-age*age*.9,emitter.z+Math.sin(angle)*age*speed);matrix.scale.setScalar(.045*(1-age/1.4));matrix.rotation.set(age,i,angle);matrix.updateMatrix();burst.setMatrixAt(i,matrix.matrix);}burst.instanceMatrix.needsUpdate=true;
  previous={...s.farm,built:[...s.farm.built],stations:{'forest-post':{...s.farm.stations['forest-post']},'mine-post':{...s.farm.stations['mine-post']}}};lastClicks=s.engine.clicks;
 },dispose(){geometry.dispose();waterMaterial.dispose();orb.dispose();mistMat.dispose();moteGeo.dispose();moteMat.dispose();burstMaterial.dispose();clouds.dispose();burst.dispose();}};
}
