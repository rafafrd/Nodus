import * as T from 'three';
import type { GameState } from '../shared/game';

// Two complete geometry sets share the same district coordinates and live game state.
export function createUrbanScene() {
  const geometries:T.BufferGeometry[]=[new T.BoxGeometry(1,1,1),new T.CylinderGeometry(1,1,1,12),new T.IcosahedronGeometry(1,0)], materials=new Map<string,T.MeshStandardMaterial>();
  const [cube,cylinder,sphere]=geometries;
  function material(color:string,glow=false) {const key=color+glow;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:glow?.35:.75,metalness:glow?.35:.1,emissive:glow?color:'#000000',emissiveIntensity:glow?1.2:0,flatShading:true}));return materials.get(key)!;}
  function shape(parent:T.Object3D,geometry:T.BufferGeometry,color:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,glow=false) {const m=new T.Mesh(geometry,material(color,glow));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=!glow;m.receiveShadow=true;parent.add(m);return m;}
  const box=(parent:T.Object3D,color:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,glow=false)=>shape(parent,cube,color,x,y,z,sx,sy,sz,glow);
  function build(cyber:boolean) {
    const root=new T.Group();root.name=cyber?'cyberpunk-city':'newyork-city';
    const accent=cyber?'#44e6df':'#ffe1a3', pink='#e666c4',dark=cyber?'#202739':'#424b53',road=cyber?'#171b28':'#555b60';
    function group(x:number,z:number) {const g=new T.Group();g.position.set(x,.24,z);root.add(g);return g;}
    box(root,cyber?'#303549':'#858482',-1,-.75,-.5,28,1.5,21);box(root,cyber?'#131927':'#60686b',-1,-1.55,-.5,28.4,.15,21.4);
    box(root,cyber?'#153444':'#416e80',9.8,.05,0,3.4,.14,21);
    for(const z of [.2,-3.5])box(root,road,-2,.29,z,19,.13,1.9);
    for(const x of [-3,6.4])box(root,road,x,.3,0,1.7,.14,18);
    for(let i=0;i<20;i++){box(root,cyber?accent:'#d7c69d',-11+i*.9,.375,.2,.36,.012,.025,cyber);if(i<17)box(root,cyber?pink:'#d7c69d',-3,.38,-8+i,.025,.012,.4,cyber);}
    for(const z of [-.78,1.18])box(root,cyber?accent:'#c1b8a5',-2,.34,z,19,.05,.04,cyber);
    // Crosswalks and traffic on the same connected streets.
    for(let i=0;i<6;i++)for(const x of [-4.5,-1.5])box(root,'#b9c1c3',x,.385,-.6+i*.27,.5,.01,.12);
    const cars:T.Group[]=[];
    for(let i=0;i<4;i++){const car=group(-7+i*3,.7);box(car,cyber?['#3d7b96','#a74888'][i%2]:['#deb439','#364954','#874a40'][i%3],0,.3,0,.95,.45,.46);box(car,'#a2b5be',.08,.56,0,.48,.18,.42);for(const x of [-.3,.3])for(const z of [-.24,.24])shape(car,cylinder,'#1b2025',x,.14,z,.12,.12,.12);cars.push(car);}
    function building(x:number,z:number,height:number,color:string,width=2.2) {
      const g=group(x,z);box(g,'#69696b',0,.12,0,width+.3,.24,2.1);box(g,color,0,height/2+.2,0,width,height,1.8);box(g,dark,0,height+.3,0,width+.25,.2,2.05);
      const floors=Math.max(2,Math.floor(height/.85));
      for(let floor=0;floor<floors;floor++)for(const side of [-1,1]){
        box(g,cyber?(floor%2?accent:pink):floor%3?'#8ca2a8':'#d8b778',side*width*.25,.7+floor*.82,.92,.4,.42,.035,cyber);
        box(g,cyber?'#333f58':'#b1a18d',side*width*.25,.42+floor*.82,.945,.49,.07,.07);
      }
      box(g,cyber?'#394a64':'#1f2c32',0,.65,.98,.55,1.05,.08);
      if(cyber){box(g,accent,-width/2-.03,height/2,1.03,.035,height,.06,true);box(g,pink,0,height-.2,1.02,width,.045,.05,true);box(g,dark,width/2-.15,height+.65,-.5,.07,.9,.07);box(g,accent,width/2-.15,height+1.15,-.5,.1,.06,.1,true);}
      else{for(let i=0;i<3;i++)box(g,'#a89c8c',0,.1+i*.13,1.5-i*.17,.9,.2,.55);for(let i=1;i<floors;i++){box(g,'#252c30',0,.48+i*.82,1.08,1.5,.07,.3);for(const dx of [-.65,.65])box(g,'#252c30',dx,.66+i*.82,1.23,.03,.32,.03);}box(g,'#4a4846',.75,height+.75,0,.045,1,.045);}
      return g;
    }
    [[-7.8,3.1,4.3],[-7.3,-2.4,3.8],[-4.6,-6.4,5.4],[-5.5,6.4,3.4],[2.7,-7.8,4.4]].forEach(([x,z,h],i)=>building(x,z,h,cyber?['#38405b','#283849','#45405a'][i%3]:['#98614c','#ab795d','#715950'][i%3]));
    // The skyline changes silhouette, rather than recoloring the village houses.
    for(let i=0;i<5;i++){
      const height=(cyber?7.4:6.4)+(i%3)*1.8,g=building(-7+i*3.6,-9.3,height,cyber?'#273a56':'#74818c',1.9);
      if(cyber){box(g,pink,0,height+1,0,1.4,.8,1.2,true);box(g,dark,0,height+1.8,0,.06,1.7,.06);}
      else{box(g,'#59636c',0,height+.9,0,1.4,1.1,1.3);box(g,'#79828b',0,height+1.7,0,.9,.65,.85);box(g,'#a4a6a4',0,height+2.35,0,.06,1.2,.06);}
    }
    // Rooftop water tanks and sci-fi cooling towers.
    for(const [x,z] of [[-7.8,3.1],[-4.6,-6.4]]){const g=group(x,z);shape(g,cylinder,cyber?'#537999':'#967958',0,cyber?5.6:6,0,.5,1.1,.5);for(const dx of [-.4,.4])box(g,dark,dx,5.2,0,.06,.6,.06);shape(g,cylinder,cyber?accent:'#504f4a',0,6.6,0,.57,.1,.57,cyber);}
    const cottage=building(.15,6.7,cyber?3.7:3,cyber?'#424c68':'#a47b66',2);
    const market=group(-.4,-2.6);box(market,cyber?'#34425c':'#7c5444',0,1.1,0,3,2.2,1.7);box(market,cyber?pink:'#386752',0,1.7,1,3.4,.3,.75,cyber);box(market,cyber?accent:'#dfc38c',0,2.45,.94,2.4,.45,.07,cyber);for(const x of [-.8,.8])box(market,'#84a6b3',x,.85,.88,.65,1.1,.06);
    const mine=group(-10.3,-5.8);box(mine,cyber?'#3b435a':'#746b62',0,1.1,0,2.7,2.2,2);box(mine,'#151c26',0,.7,1.02,1.1,1.3,.06);box(mine,cyber?accent:'#b79a56',0,1.55,1.08,1.5,.18,.1,cyber);box(mine,dark,1.1,2.25,-.5,.3,1.9,.3);
    const engine=group(3,2.4);box(engine,dark,0,.35,0,2.4,.7,1.8);shape(engine,cylinder,cyber?'#435c79':'#727a7c',0,1.1,0,.65,1.3,.65);box(engine,cyber?accent:'#d5ad59',0,1.65,0,1.55,.18,1.2,cyber);const rotor=box(engine,cyber?accent:'#b8a982',0,1.12,1,1.2,.1,.1,cyber);
    const mill=group(4.5,5.8);box(mill,cyber?'#2d4056':'#7f7770',0,1.15,0,2.2,2.3,1.9);for(const x of [-.6,.6])shape(mill,cylinder,cyber?'#647c95':'#9e9b8e',x,2.9,-.2,.27,1.9,.27);box(mill,cyber?pink:'#b9c0b5',0,1.7,1,1.5,.2,.1,cyber);
    const beds:T.Mesh[]=[];
    for(let i=0;i<6;i++){const x=2.3+i%2*2.15,z=-4.65+Math.floor(i/2)*1.65;const g=group(x,z);const m=box(g,cyber?'#263f51':'#857561',0,.1,0,1.85,.2,1.28);beds.push(m);box(g,cyber?accent:'#a7ac91',0,.24,-.64,1.9,.08,.08,cyber);}
    // New York park / luminous botanical district preserve the forest location.
    box(root,cyber?'#29424a':'#647a59',-10,.31,7.1,5,.08,4.2);
    for(let i=0;i<9;i++){const x=-12+(i%3)*1.4,z=5.8+Math.floor(i/3)*1.4;shape(root,cylinder,cyber?'#557279':'#786450',x,.9,z,.1,1.25,.1);shape(root,sphere,cyber?'#488681':'#82956b',x,1.9,z,.7,.9,.7);}
    const fountain=group(-3,.3);shape(fountain,cylinder,'#949b9d',0,.25,0,1.2,.5,1.2);shape(fountain,cylinder,cyber?accent:'#6b9cba',0,.52,0,.95,.035,.95,cyber);box(fountain,cyber?pink:'#bcb5a2',0,1.2,0,.3,1.2,.3,cyber);
    const decoration=new T.Group();root.add(decoration);for(const [x,z] of [[-5,3],[-2,4.6],[4,-3]]){box(decoration,cyber?'#586b88':'#886b50',x,.7,z,1.7,.16,.55);box(decoration,cyber?accent:'#705c48',x,1,z-.22,1.7,.5,.1,cyber);}
    const extraFountain=group(-1.5,4);shape(extraFountain,cylinder,cyber?pink:'#778d9a',0,.55,0,.75,.9,.75,cyber);
    const greenhouse=group(6,-6.8);box(greenhouse,cyber?'#376071':'#75988e',0,1.2,0,2.2,2.3,2);for(const x of [-1,0,1])box(greenhouse,cyber?accent:'#c2d0be',x,1.2,1.05,.07,2.3,.07,cyber);
    const lights=new T.Group();root.add(lights);for(const [x,z] of [[-5,1.4],[-1.5,1.4],[-4,4.4],[6,.3],[6,4]]){box(lights,dark,x,1.6,z,.07,2.7,.07);box(lights,accent,x,2.9,z,.5,.15,.15,true);}
    const bridge=group(9.8,2.1);box(bridge,dark,0,.38,0,4.4,.2,1.5);for(const z of [-.75,.75])box(bridge,cyber?accent:'#a6a39a',0,.95,z,4.4,.06,.06,cyber);
    return {root,engine,rotor,mill,cottage,decoration,extraFountain,greenhouse,lights,beds,cars};
  }
  const newyork=build(false),cyberpunk=build(true);let time=0;
  return {newyork:newyork.root,cyberpunk:cyberpunk.root,update(s:GameState,delta:number,moving:boolean){if(moving)time+=delta;for(const city of [newyork,cyberpunk]){city.cottage.visible=s.owned.includes('cottage');city.mill.visible=s.owned.includes('windmill');city.decoration.visible=s.owned.includes('benches');city.extraFountain.visible=s.owned.includes('fountain');city.greenhouse.visible=s.owned.includes('greenhouse');city.lights.visible=s.owned.includes('lanterns')||s.atmosphere==='night';city.beds.forEach((bed,i)=>bed.visible=Boolean(s.plots[i]));city.engine.scale.setScalar(1+s.engine.level*.025);if(moving&&city.root.visible){if(Number(s.engine.power)>0)city.rotor.rotation.z+=delta*.6;city.cars.forEach((g,i)=>g.position.x=-10+(time*.35+i*4)%17);}}},dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
