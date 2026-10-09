import * as T from 'three';
import {gsap} from 'gsap';
import type {GameState} from '../shared/game';
import {FARM_PROJECTS,STATION_CAPACITY,type FarmProjectId} from '../shared/farm';
export const FARM_POSITIONS:Record<FarmProjectId,[number,number,number]>={depot:[.2,.26,3.7],'forest-post':[-8.2,.26,8.6],'mine-post':[-11.5,.26,-3]};
export function createFarmScene(){
 const root=new T.Group();root.name='farm-projects';
 const box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,10),torus=new T.TorusGeometry(.43,.055,6,18),materials:T.MeshStandardMaterial[]=[];
 const variants=new Map<GameState['skin'],{id:FarmProjectId;group:T.Group;stock:T.Group;bar:T.Mesh;wheel:T.Group;parcel:T.Mesh;time:number;light:T.MeshStandardMaterial}[]>();
 function material(color:string,glow=false){const m=new T.MeshStandardMaterial({color,roughness:.72,metalness:glow?.35:0,emissive:glow?color:'#000000',emissiveIntensity:glow?.4:0});materials.push(m);return m;}
 function block(parent:T.Object3D,m:T.Material,x:number,y:number,z:number,w:number,h:number,d:number){const mesh=new T.Mesh(box,m);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 for(const skin of ['original','cyberpunk','newyork'] as const){
  const cyber=skin==='cyberpunk',urban=skin!=='original',wall=material(cyber?'#29405c':urban?'#986b53':'#bba271'),edge=material(cyber?'#42778c':urban?'#404750':'#65533a'),crate=material(cyber?'#627e9b':urban?'#aa9b7d':'#997a4a'),track=material('#293c3d');
  const rows=FARM_PROJECTS.map(project=>{
   const light=material(cyber?'#71ebdc':urban?'#e4bf77':'#bfd594',true),group=new T.Group();group.name=skin+'-'+project.id;group.position.set(...FARM_POSITIONS[project.id]);root.add(group);
   block(group,edge,0,.08,0,2.65,.16,2.1);
   if(project.id==='depot'){
    block(group,wall,0,.85,-.45,2.3,1.5,1.1);block(group,edge,0,1.68,-.26,2.65,.16,1.8);block(group,track,-.52,.75,.13,.6,1.25,.04);
    for(const x of [-1.1,1.1])block(group,edge,x,.83,.48,.1,1.6,.1);for(let i=0;i<4;i++)block(group,crate,.4,.44+i*.18,.22,.7,.13,.72);
    block(group,light,-.55,1.47,.15,.6,.12,.04);
   }else if(project.id==='forest-post'){
    block(group,wall,-.4,.75,-.4,1.2,1.3,1);block(group,edge,-.35,1.5,-.2,1.9,.18,1.5);
    block(group,edge,.6,.45,.1,1.4,.16,.65);for(let i=0;i<3;i++){const log=new T.Mesh(cylinder,crate);log.rotation.z=Math.PI/2;log.scale.set(.13,.9,.13);log.position.set(.6,.62+i*.19,.06);group.add(log);}
    block(group,edge,1.1,1.05,-.5,.1,2.05,.1);block(group,edge,.48,2.06,-.5,1.4,.09,.09);block(group,light,-.45,1.05,.12,.4,.28,.05);
   }else{
    for(const x of [-.9,.9]){const beam=block(group,edge,x,1.35,-.4,.11,2.65,.12);beam.rotation.z=x<0?-.1:.1;}
    block(group,edge,0,2.7,-.4,2.25,.18,.85);block(group,wall,-.4,.7,-.6,1.1,1.1,.7);block(group,track,0,.23,.1,1.7,.14,1.15);
    for(const x of [-.43,.43])block(group,edge,x,.36,.48,.07,.07,1.4);block(group,light,0,2.36,-.32,.9,.15,.09);
   }
   const stock=new T.Group();group.add(stock);for(let i=0;i<10;i++)block(stock,crate,-1+(i%5)*.44,.23+Math.floor(i/5)*.32,.77,.36,.29,.35);
   const height=project.id==='mine-post'?2.98:2.12;block(group,track,0,height,.3,1.9,.1,.07);const bar=block(group,light,-.95,height,.35,.005,.11,.05);
   const wheel=new T.Group();wheel.position.set(project.id==='mine-post'?.55:1.12,project.id==='mine-post'?2.31:.95,-.2);group.add(wheel);const rim=new T.Mesh(torus,edge);wheel.add(rim);for(let i=0;i<4;i++){const spoke=block(wheel,edge,0,0,0,.82,.035,.035);spoke.rotation.z=i*Math.PI/4;}
   const parcel=block(group,crate,.65,.45,.5,.26,.24,.3);parcel.visible=false;
   return {id:project.id,group,stock,bar,wheel,parcel,time:0,light};
  });variants.set(skin,rows);
 }
 const blueprint=new T.Group();blueprint.name='project-blueprint';root.add(blueprint);const ghost=new T.MeshBasicMaterial({color:'#e5c895',transparent:true,opacity:.55,depthWrite:false}),ghostBox=new T.BoxGeometry(2.6,1.7,1.9),ghostGeometry=new T.EdgesGeometry(ghostBox);const outline=new T.LineSegments(ghostGeometry,ghost);outline.position.y=.92;blueprint.add(outline);
 const footprintGeometry=new T.RingGeometry(1.7,1.74,48),footprintMaterial=new T.MeshBasicMaterial({color:'#e5c895',transparent:true,opacity:.5,side:T.DoubleSide,depthWrite:false}),footprint=new T.Mesh(footprintGeometry,footprintMaterial);footprint.rotation.x=-Math.PI/2;footprint.position.y=.02;blueprint.add(footprint);
 let previous=new Set<FarmProjectId>(),first=true,time=0,skin:GameState['skin']='original';
 return {root,get working(){return (variants.get(skin)??[]).filter(row=>row.parcel.visible).length;},get time(){return time;},update(state:GameState,delta:number,motion:boolean){
  skin=state.skin;if(motion)time+=delta;blueprint.visible=Boolean(state.farm.objective);if(state.farm.objective)blueprint.position.set(...FARM_POSITIONS[state.farm.objective.id]);ghost.opacity=motion?.4+Math.sin(time*1.5)*.12:.5;ghost.color.set(state.skin==='cyberpunk'?'#71ebdc':'#e5c895');footprintMaterial.color.copy(ghost.color);
  for(const [skin,rows] of variants)for(const row of rows){
   row.group.visible=skin===state.skin&&state.farm.built.includes(row.id);if(!row.group.visible)continue;
   if(!motion){gsap.killTweensOf(row.group.scale);row.group.scale.setScalar(1);}
   const count=row.id==='depot'?0:state.farm.stations[row.id].stock,ratio=count/STATION_CAPACITY,working=row.id!=='depot'&&count<STATION_CAPACITY;
   row.stock.children.forEach((mesh,i)=>mesh.visible=row.id==='depot'||i<Math.ceil(ratio*10));row.bar.visible=row.id!=='depot';row.bar.scale.x=Math.max(.005,ratio*1.9);row.bar.position.x=-.95+Math.max(.005,ratio*1.9)/2;
   row.wheel.visible=row.id!=='depot';row.parcel.visible=working;if(motion&&working){row.time+=delta;row.wheel.rotation.z+=delta*.9;}
   row.parcel.position.z=.14+(row.time*.23)%1;row.parcel.position.y=row.id==='mine-post'?.42+Math.sin(row.time*.8)*.04:.5;row.light.emissiveIntensity=working&&motion?.35+Math.sin(row.time*1.3)*.08:.25;
   if(!first&&!previous.has(row.id)&&motion)gsap.fromTo(row.group.scale,{x:.65,y:.35,z:.65},{x:1,y:1,z:1,duration:.75,ease:'back.out(1.2)'});
  }previous=new Set(state.farm.built);first=false;
 },dispose(){for(const rows of variants.values())for(const row of rows)gsap.killTweensOf(row.group.scale);[box,cylinder,torus,ghostBox,ghostGeometry,footprintGeometry].forEach(g=>g.dispose());[...materials,ghost,footprintMaterial].forEach(m=>m.dispose());}};
}
