import * as T from 'three';
import { PRODUCERS, BALANCE } from '../shared/economy';
import type { GameState } from '../shared/game';
// One aggregate per family: object count is independent of owned units.
export function createProductionDistrict() {
 const root=new T.Group();root.name='observatory-production-district';
 const cube=new T.BoxGeometry(1,1,1),orb=new T.IcosahedronGeometry(1,1),ring=new T.TorusGeometry(.5,.06,6,20);
 const stone=new T.MeshStandardMaterial({color:'#6e7978',roughness:.9}),shell=new T.MeshStandardMaterial({color:'#9caaa6',roughness:.75,metalness:.2}),light=new T.MeshStandardMaterial({color:'#d2d9c7',emissive:'#d2d9c7',emissiveIntensity:.2});
 const mesh=(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const item=new T.Mesh(g,m);item.position.set(x,y,z);item.scale.set(sx,sy,sz);item.castShadow=true;item.receiveShadow=true;parent.add(item);return item;};
 mesh(root,cube,stone,19,-.8,0,10,1.5,18);mesh(root,cube,shell,13,.3,2,5,.16,.8);
 const modules=PRODUCERS.map((family,i)=>{
  const group=new T.Group();group.name=`installation-${family.id}`;group.position.set(15.8+i%4*2.3,.05,-6.8+Math.floor(i/4)*4.3);root.add(group);
  mesh(group,cube,stone,0,.12,0,1.9,.24,2.8);const building=new T.Group();group.add(building);
  mesh(building,cube,shell,0,.9,0,1.4,1.6,1.7);mesh(building,cube,stone,0,1.76,0,1.65,.14,1.95);
  mesh(building,cube,light,0,1,.87,1.05,.13,.04);mesh(building,cube,stone,-.45,.36,.91,.25,.6,.08);
  if(family.visual==='lab')mesh(building,orb,shell,0,2.05,0,.7,.5,.7);
  if(family.visual==='energy')mesh(building,cube,light,.45,2.05,-.4,.15,.8,.15);
  let antenna:T.Mesh|null=null;
  if(family.visual==='orbit'||family.visual==='cosmic'){antenna=mesh(building,ring,light,0,2.4,0,1.4,1.4,1.4);antenna.rotation.x=Math.PI/4;mesh(building,orb,shell,0,2.4,0,.22,.22,.22);}
  const beacon=mesh(building,orb,light,-.45,2.04,-.45,.065,.065,.065);
  return{group,building,antenna,beacon};
 });
 let signature='',time=0;
 return{root,objects:root.getObjectsByProperty('type','Mesh').length,update(state:GameState,delta=0,motion=false){
  if(motion)time+=delta;
  modules.forEach((module,i)=>{if(module.antenna&&motion&&module.group.visible)module.antenna.rotation.y+=delta*.18;module.beacon.scale.setScalar(motion?1+Math.sin(time*1.6+i)*.18:1);});
  const levels=PRODUCERS.map(p=>BALANCE.visualMilestones.filter(n=>(state.economy.producers[p.id]??0)>=n).length),key=state.skin+levels.join(':');if(key===signature)return;signature=key;
  root.visible=levels.some(Boolean);shell.color.set(state.skin==='cyberpunk'?'#36425c':state.skin==='newyork'?'#9b7560':'#9caaa6');light.color.set(state.skin==='cyberpunk'?'#83d9e0':'#d2d9c7');light.emissive.copy(light.color);stone.color.set(state.skin==='cyberpunk'?'#283146':'#6e7978');
  modules.forEach((module,i)=>{module.group.visible=levels[i]>0;module.building.scale.y=1+Math.max(0,levels[i]-1)*.26;module.group.userData.level=levels[i];});
 },dispose(){[cube,orb,ring].forEach(g=>g.dispose());[stone,shell,light].forEach(m=>m.dispose());}};
}
