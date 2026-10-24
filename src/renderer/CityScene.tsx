import { motionPreference } from './preferences';
import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../shared/game';
import { gsap } from 'gsap';
import { Icon } from './Icon';
import { createUrbanScene } from './UrbanScene';
import { createProductionDistrict } from './ProductionDistrict';
import { createFarmScene } from './FarmScene';
import {createCityEffects} from './CityEffects';
import { minigameStatus, type MinigameId } from './GameMinigames';

export type Place = 'engine' | 'plaza' | 'farm' | 'shop' | 'range' | 'mine' | 'forest' | 'mill';
const PLACES: { id: Place; name: string; x: number; z: number }[] = [
  { id: 'engine', name: 'NÚCLEO', x: 3, z: 2.4 },
  { id: 'farm', name: 'HORTA', x: 3.3, z: -6.8 }, { id: 'shop', name: 'CONSELHO', x: -1, z: -2.1 },
  { id: 'mine', name: 'MINA', x: -10.3, z: -5.8 }, { id: 'forest', name: 'BOSQUE', x: -9.8, z: 7.6 },
  { id: 'mill', name: 'MOINHO', x: 4.4, z: 5.7 }, { id: 'plaza', name: 'MEMÓRIA', x: -3, z: 2.1 },
  { id: 'range', name: 'MIRA', x: -.4, z: -5.6 },
];
// Places that open a minigame: a ring on the ground and a play mark on the label show where to enter.
const MINIGAME_PLACES: Partial<Record<Place, MinigameId>> = { farm: 'garden', shop: 'council', plaza: 'memory', range: 'aim' };
export function CityScene({ state, selected, onSelect, active, onReady }: { state: GameState; selected: Place; active: boolean; onSelect(place: Place): void; onReady(): void }) {
  const host = useRef<HTMLDivElement>(null), labels = useRef<(HTMLButtonElement | null)[]>([]);
  const live = useRef({ state, selected, onSelect, active, onReady }); live.current = { state, selected, onSelect, active, onReady };
  const focus = useRef((_place: Place) => {});
  const controls = useRef({ zoom: (_amount: number) => {}, reset: () => {}, production:()=>{} });
  const redraw = useRef(() => {});
  const [error, setError] = useState('');
  useEffect(() => { redraw.current(); }, [state, active]);
  useEffect(() => { focus.current(selected); redraw.current(); }, [selected]);
  useEffect(() => {
    let stopped = false, cleanup = () => {};
    void Promise.all([import('three'), import('three/addons/controls/OrbitControls.js'), import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'), import('three/addons/postprocessing/UnrealBloomPass.js'), import('three/addons/postprocessing/OutputPass.js')]).then(([T, { OrbitControls }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }]) => {
      if (stopped || !host.current) return;
      const element = host.current;
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' }); }
      catch { setError('O cenário 3D não pôde ser aberto. As ferramentas ao lado continuam disponíveis.'); live.current.onReady(); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.info.autoReset = false; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
      renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
      renderer.domElement.setAttribute('aria-label', 'Cidade isométrica, selecione um local pelos botões'); renderer.domElement.dataset.testid = 'city-canvas'; element.prepend(renderer.domElement);
      const scene = new T.Scene(); scene.background = new T.Color('#bacbc7');
      const district=createProductionDistrict();scene.add(district.root);
      const camera = new T.OrthographicCamera(-24, 24, 15, -15, .1, 200); camera.position.set(28, 28, 34);
      const orbit = new OrbitControls(camera, renderer.domElement); orbit.target.set(0, .3, 0); orbit.enableRotate = false; orbit.enableDamping = false; orbit.minZoom = .75; orbit.maxZoom = 2.2; orbit.screenSpacePanning = true;
      orbit.mouseButtons = { LEFT: T.MOUSE.PAN, MIDDLE: T.MOUSE.DOLLY, RIGHT: T.MOUSE.PAN }; orbit.update();
      const ambient=new T.HemisphereLight('#fff4df', '#718a83', 1.9);scene.add(ambient);
      const sun = new T.DirectionalLight('#ffe3bd', 3.2); sun.position.set(-12, 24, 12); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 65 }); sun.shadow.normalBias = .04; scene.add(sun);
      // A cool fill from the opposite side keeps shaded faces readable; fog fades the far sea into the sky.
      const fill = new T.DirectionalLight('#bcd3ee', .55); fill.position.set(20, 12, -16); scene.add(fill); scene.fog = new T.Fog('#bacbc7', 62, 120);
      // Glow only where light sources matter (Cyberpunk and night), so daylight surfaces never bloom.
      const composer = new EffectComposer(renderer), bloom = new UnrealBloomPass(new T.Vector2(1, 1), .5, .35, .85); composer.addPass(new RenderPass(scene, camera)); composer.addPass(bloom); composer.addPass(new OutputPass()); composer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      const geometries = new Set<InstanceType<typeof T.BufferGeometry>>(), materials = new Map<string, InstanceType<typeof T.MeshStandardMaterial>>();
      const unitBox = new T.BoxGeometry(1, 1, 1), sphere = new T.IcosahedronGeometry(1, 0), cone = new T.ConeGeometry(1, 1, 5), cylinder = new T.CylinderGeometry(1, 1, 1, 12); [unitBox, sphere, cone, cylinder].forEach(g => geometries.add(g));
      function mat(color: string, glow = false) { const key = color + glow; if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({ color, roughness: .92, metalness: 0, flatShading: true, emissive: glow ? color : '#000000', emissiveIntensity: glow ? .8 : 0 })); return materials.get(key)!; }
      function mesh(parent: InstanceType<typeof T.Object3D>, shape: import('three').BufferGeometry<import('three').NormalBufferAttributes>, color: string, x: number, y: number, z: number, sx: number, sy: number, sz: number) { const obj = new T.Mesh(shape, mat(color)); obj.position.set(x, y, z); obj.scale.set(sx, sy, sz); obj.castShadow = true; obj.receiveShadow = true; parent.add(obj); return obj; }
      const box = (parent: InstanceType<typeof T.Object3D>, color: string, x: number, y: number, z: number, sx: number, sy: number, sz: number) => mesh(parent, unitBox, color, x, y, z, sx, sy, sz);
      function group(x: number, z: number, angle = 0) { const g = new T.Group(); g.position.set(x, .24, z); g.rotation.y = angle; scene.add(g); return g; }
      const land = new T.Shape(); land.moveTo(-14, -9); land.lineTo(-11, -11); land.lineTo(10, -11); land.lineTo(14, -7); land.lineTo(14, 8); land.lineTo(11, 10); land.lineTo(-12, 10); land.lineTo(-15, 6); land.closePath();
      const terrain = new T.ExtrudeGeometry(land, { depth: 1.5, bevelEnabled: true, bevelSegments: 1, bevelSize: .18, bevelThickness: .15, steps: 1 }); geometries.add(terrain);
      const island = new T.Mesh(terrain, [mat('#91a481'), mat('#8b7e61')]); island.rotation.x = -Math.PI / 2; island.position.y = -1.45; island.receiveShadow = true; island.castShadow = true; scene.add(island);
      // A wider, darker ledge under the island reads as a rock layer at the waterline.
      const strata = new T.Mesh(terrain, mat('#75684f')); strata.rotation.x = -Math.PI / 2; strata.position.y = -2.25; strata.scale.set(1.035, 1.035, .55); strata.receiveShadow = true; scene.add(strata);
      const sea = box(scene, '#98b9b3', 0, -2, 0, 500, .2, 500); sea.castShadow = false;
      box(scene, '#73abb2', 9.8, .27, 0, 3.4, .05, 20.5);
      for (let i = 0; i < 17; i++) { const water = box(scene, '#b4d2ca', 8.5 + (i % 3) * .9, .302, -9 + i * 1.1, .8, .012, .035); water.castShadow = false; }
      const stone = '#c6bb9d', wood = '#796448';
      box(scene, stone, -2, .27, .2, 18.5, .12, 1.85); box(scene, stone, -3, .28, 1, 1.8, .12, 15.5);
      mesh(scene, cylinder, '#cfc3a7', -3, .32, .25, 3.2, .14, 3.2);
      for (let x = -11; x < 7; x += .9) for (const z of [-.4, .4]) box(scene, '#b6ad92', x, .343, z, .55, .014, .02);
      function house(x: number, z: number, color: string, roofColor: string, scale = 1, angle = 0) {
        const g = group(x, z, angle); g.scale.setScalar(scale);
        box(g, '#9d947b', 0, .16, 0, 2.6, .3, 2.25); box(g, color, 0, 1.15, 0, 2.25, 2, 1.9);
        const shape = new T.Shape(); shape.moveTo(-1.35, 0); shape.lineTo(0, .9); shape.lineTo(1.35, 0); shape.closePath();
        const geometry = new T.ExtrudeGeometry(shape, { depth: 2.3, bevelEnabled: false }); geometries.add(geometry);
        const roof = new T.Mesh(geometry, mat(roofColor)); roof.position.set(0, 2.1, -1.15); roof.castShadow = true; g.add(roof);
        box(g, wood, -.42, .65, .972, .49, 1.05, .1); box(g, '#d9d092', .55, 1.3, .97, .45, .49, .1);
        box(g, '#655844', .55, 1.3, 1.036, .035, .5, .03); box(g, '#655844', .55, 1.3, 1.036, .45, .035, .03);
        box(g, '#bcaa8c', -.63, 2.6, -.35, .35, 1, .4); box(g, '#897960', -.63, 3.1, -.35, .43, .12, .5);
        for (const x of [-1.07, 1.07]) box(g, wood, x, 1.2, 1, .1, 2, .12); box(g, wood, 0, 1.9, .99, 2.15, .09, .1);
        houses.push(g); return g;
      }
      const houses: InstanceType<typeof T.Group>[] = [];
      house(-7.7, 3.2, '#e2d2ac', '#a75f4e', 1.1, -.08); house(-7.4, -2.6, '#c7d6cb', '#536f71', .83, .08);
      house(-3.8, -5.7, '#e4d9b5', '#b87551', 1.12, .12); house(-5.2, 6.5, '#d3c3a0', '#596c73', .78, -.15);
      house(2.7, -7.1, '#dad4b1', '#ab624d', .95);
      const cottage = house(.15, 6.7, '#ead8ae', '#a97658', .9); cottage.visible = live.current.state.owned.includes('cottage');
      // Windmill and four sails.
      const mill = group(4.5, 5.8); const towerGeo = new T.CylinderGeometry(.75, 1.05, 3.6, 10); geometries.add(towerGeo);
      mesh(mill, towerGeo, '#e1d5b6', 0, 1.8, 0, 1, 1, 1); mesh(mill, cone, '#718984', 0, 4, 0, 1.25, 1.35, 1.25);
      box(mill, wood, 0, .6, .97, .44, 1, .13); const sails = new T.Group(); sails.position.set(0, 3, 1.05); mill.add(sails);
      for (let i = 0; i < 4; i++) { const arm = new T.Group(); arm.rotation.z = i * Math.PI / 2; sails.add(arm); box(arm, '#6e614b', 0, 1.18, 0, .13, 2.45, .12); box(arm, '#e2ddbc', .3, 1.22, 0, .55, 1.8, .07); for (let j = 0; j < 5; j++) box(arm, '#a59b7d', .3, .5 + j * .33, .05, .58, .045, .04); }
      const millFoundation = box(scene, '#aa9f83', 4.5, .28, 5.8, 2.6, .12, 2.6);
      // Market awning, barrels and produce.
      const market = group(-.4, -2.6); for (const x of [-1.5, 1.5]) for (const z of [-.8, .8]) box(market, wood, x, 1.1, z, .12, 2.2, .12);
      for (let i = 0; i < 7; i++) box(market, i % 2 ? '#e3d8a8' : '#9b6575', -1.47 + i * .49, 2.14, 0, .49, .15, 2.08);
      box(market, wood, 0, .7, .7, 3.3, .8, .65);
      for (let i = 0; i < 15; i++) mesh(market, sphere, ['#c9a85d', '#b46f51', '#9cac66'][i % 3], -1.2 + (i % 5) * .5, 1.2, .6 + Math.floor(i / 5) * .15, .13, .13, .13);
      for (const [x, z] of [[-2.4, -1], [1.9, .3]]) { mesh(market, cylinder, '#a68754', x, .45, z, .37, .8, .37); mesh(market, cylinder, '#635947', x, .56, z, .38, .06, .38); }
      // Active engine: cosmetic rotation, all rewards stay in main.
      const engine = group(3, 2.4); box(engine, '#53645d', 0, .2, 0, 2.2, .4, 1.7);
      box(engine, '#c19359', 0, .85, 0, 1.25, 1, 1); box(engine, '#354c46', 0, 1.45, 0, 1.4, .2, 1.1);
      mesh(engine, cylinder, '#9db39b', -.5, 1.75, -.25, .15, .6, .15);
      const wheel = new T.Group(); wheel.position.set(0, 1, .8); engine.add(wheel);
      const wheelGeo = new T.TorusGeometry(.67, .12, 6, 20); geometries.add(wheelGeo); mesh(wheel, wheelGeo, '#dfba74', 0, 0, 0, 1, 1, 1);
      for (let i = 0; i < 6; i++) { const spoke = box(wheel, '#937950', 0, 0, 0, 1.2, .08, .09); spoke.rotation.z = i * Math.PI / 6; }
      const upgrades = new T.Group(); engine.add(upgrades);
      const upgradeParts: InstanceType<typeof T.Mesh>[] = [];
      for (let i = 0; i < 10; i++) { const part = box(upgrades, i < 5 ? '#c8ab6f' : '#87a494', -.85 + (i % 5) * .42, .52 + Math.floor(i / 5) * .4, -.65, .23, .26, .23); upgradeParts.push(part); }
      // Fountain with still water and a small monument.
      const fountain = group(-3, .3); mesh(fountain, cylinder, '#b6b9a2', 0, .25, 0, .98, .5, .98); mesh(fountain, cylinder, '#77a8b5', 0, .53, 0, .81, .03, .81); mesh(fountain, cylinder, '#d3ceb0', 0, .85, 0, .17, 1.4, .17); mesh(fountain, sphere, '#e4d39e', 0, 1.58, 0, .32, .38, .32);
      // Farm beds use live crop state, not decorative balances.
      const cropGroups: InstanceType<typeof T.Group>[] = [], plotMeshes: InstanceType<typeof T.Mesh>[] = [];
      for (let i = 0; i < 6; i++) {
        const x = 2.3 + i % 2 * 2.15, z = -4.65 + Math.floor(i / 2) * 1.65;
        const soil = box(scene, '#785b3e', x, .33, z, 1.85, .18, 1.28); plotMeshes.push(soil);
        for (let j = 0; j < 5; j++) box(scene, '#967555', x - .7 + j * .35, .43, z, .08, .03, 1.12);
        const plants = new T.Group(); plants.position.set(x, .45, z); scene.add(plants); cropGroups.push(plants);
        for (let row = 0; row < 3; row++) for (let col = 0; col < 5; col++) {
          const stem = box(plants, '#748958', -.68 + col * .34, .31, -.37 + row * .36, .035, .62, .035);
          mesh(plants, sphere, '#d8b961', stem.position.x, .65, stem.position.z, .09, .22, .09);
        }
      }
      for (const z of [-5.6, .4]) { for (let i = 0; i < 7; i++) box(scene, '#dfd2ae', 1.2 + i * .7, .69, z, .08, .82, .08); box(scene, '#c7b994', 3.3, .89, z, 4.7, .08, .08); }
      // Trees, orchard, rock face and mine entrance.
      const trees:InstanceType<typeof T.Group>[]=[];
      function tree(x: number, z: number, size: number, evergreen = false) {
        const g = group(x, z);trees.push(g); box(g, '#867151', 0, .65 * size, 0, .17 * size, 1.3 * size, .17 * size);
        if (evergreen) { mesh(g, cone, '#4e7962', 0, 1.5 * size, 0, .8 * size, 1.65 * size, .8 * size); mesh(g, cone, '#678a67', 0, 2.1 * size, 0, .62 * size, 1.3 * size, .62 * size); }
        else { mesh(g, sphere, '#8b9e65', 0, 1.6 * size, 0, .91 * size, 1 * size, .87 * size); mesh(g, sphere, '#a0ac75', -.3 * size, 1.8 * size, .12 * size, .68 * size, .8 * size, .7 * size); }
      }
      for (let i = 0; i < 26; i++) { const side = i % 2 === 0; tree(side ? -12.2 + Math.sin(i * 3.1) * 1.4 : -10.4 + (i % 4) * 3.6, side ? -8.5 + (i / 2) * 1.32 : -9 + Math.cos(i * 2.3) * .5, .7 + i % 3 * .16, i % 4 === 0); }
      for (let i = 0; i < 5; i++) tree(-10 + (i % 3) * 1.35, 6.9 + Math.floor(i / 3) * 1.3, .85);
      const rock = group(-10.1, -5.3); for (let i = 0; i < 7; i++) mesh(rock, sphere, ['#8b9790', '#a1a89b', '#778982'][i % 3], (i % 3 - 1) * 1.2, .75 + Math.floor(i / 3) * .75, -Math.floor(i / 3) * .55, 1.45, 1.45, 1.2);
      box(rock, '#263f3c', 0, .64, 1.19, 1.04, 1.2, .13); for (const x of [-.62, .62]) box(rock, '#856a4c', x, .72, 1.32, .15, 1.42, .15); box(rock, '#856a4c', 0, 1.41, 1.32, 1.45, .18, .15);
      for (let i = 0; i < 5; i++) box(rock, '#a28d67', 0, .13, 1.7 + i * .35, .9, .08, .13);
      box(rock, '#5f695e', .97, .34, 1.7, .6, .5, .5);
      // Bridge, dock and little sailboat on the river.
      const bridge = group(9.8, 2.1); for (let i = 0; i < 16; i++) box(bridge, '#c6ac7c', -2.1 + i * .28, .35, 0, .26, .14, 1.5);
      for (const z of [-.73, .73]) { for (let i = 0; i < 5; i++) box(bridge, wood, -2 + i, .67, z, .1, .65, .1); box(bridge, wood, 0, .95, z, 4.2, .09, .1); }
      const boat = group(9.8, 7.2); box(boat, '#8c7255', 0, .07, 0, .9, .18, 1.65); box(boat, '#624d3a', 0, .26, .74, .85, .3, .12); box(boat, '#624d3a', 0, 1, 0, .06, 1.7, .06);
      const sailGeo = new T.BufferGeometry(); sailGeo.setAttribute('position', new T.Float32BufferAttribute([0, .5, 0, 0, 1.8, 0, .8, .5, 0], 3)); sailGeo.computeVertexNormals(); geometries.add(sailGeo); const sailMaterial = mat('#e6dabe'); sailMaterial.side = T.DoubleSide; boat.add(new T.Mesh(sailGeo, sailMaterial));
      // Lanterns are an owned cosmetic, visible after purchase.
      const lanterns = new T.Group(); scene.add(lanterns);
      const purchasedFountain=group(-1.5,4);mesh(purchasedFountain,cylinder,'#bfb69c',0,.18,0,1.1,.3,1.1);mesh(purchasedFountain,cylinder,'#70aeb4',0,.35,0,.86,.06,.86);mesh(purchasedFountain,cylinder,'#c9c2a8',0,.66,0,.16,.6,.16);mesh(purchasedFountain,cylinder,'#c9c2a8',0,1,0,.58,.12,.58);mesh(purchasedFountain,cylinder,'#8ec6c8',0,1.08,0,.4,.04,.4);
      const benches=new T.Group();scene.add(benches);for(const [x,z] of [[-5,3],[-2,4.6],[4,-3]]){box(benches,'#856c48',x,.7,z,1.7,.16,.55);box(benches,'#856c48',x,1,z-.22,1.7,.5,.1);for(const leg of [-.6,.6])box(benches,'#56685f',x+leg,.5,z,.11,.5,.45);}
      const greenhouse=group(6,-6.8);box(greenhouse,'#b9c9c0',0,.1,0,2.6,.18,2.5);box(greenhouse,'#79a69c',0,1,0,2.2,1.8,2);for(const x of [-1.1,0,1.1])box(greenhouse,'#dae2ca',x,1,1.04,.06,1.8,.06);for(const y of [.2,1,1.9])box(greenhouse,'#dae2ca',0,y,1.04,2.2,.055,.06);mesh(greenhouse,cone,'#a8c3af',0,2.25,0,1.6,.8,1.55);
      for (const [x, z] of [[-5, 1.4], [-1.5, 1.4], [-4, 4.4], [6, .3], [6, 4]]) { box(lanterns, '#627168', x, 1.3, z, .085, 2.1, .085); const lamp = box(lanterns, '#e5bd6e', x, 2.34, z, .26, .35, .26); lamp.material = mat('#edc47a', true); box(lanterns, '#59685f', x, 2.55, z, .33, .08, .33); }
      // Citizens walk only on paths. Their motion carries no economic effect.
      const citizens: InstanceType<typeof T.Group>[] = [];
      for (let i = 0; i < 7; i++) { const g = group(-10 + i * 2.4, .5); box(g, ['#8b657a', '#486d74', '#ba8660'][i % 3], 0, .35, 0, .23, .45, .18); mesh(g, sphere, '#dfbd91', 0, .67, 0, .14, .15, .14); box(g, '#57675c', 0, .81, 0, .3, .07, .27); citizens.push(g); }
      for (let i = 0; i < 48; i++) { const x = -13 + (i * 7.37) % 25, z = -8 + (i * 3.71) % 18; if (x > 7 || Math.abs(z) < 1.7 || Math.abs(x + 3) < 1.5 || x > 1 && x < 6 && z < 1 || Math.abs(x + .4) < 1.7 && Math.abs(z + 5.6) < 1.3) continue; mesh(scene, sphere, i % 3 ? '#aeb87a' : '#cfb27a', x, .35, z, .11, .15, .11); }
      // Chimney smoke: three puffs per house rise and shrink; the traveller's cottage has none until it is built.
      const smokeMaterial = new T.MeshStandardMaterial({ color: '#efece2', roughness: 1, transparent: true, opacity: .55, depthWrite: false, flatShading: true });
      const smoke = houses.slice(0, 5).flatMap(g => { g.updateMatrixWorld(); const top = new T.Vector3(-.63, 3.25, -.35).applyMatrix4(g.matrixWorld); return [0, 1, 2].map(k => { const puff = new T.Mesh(sphere, smokeMaterial); puff.userData = { x: top.x, y: top.y, z: top.z, k }; scene.add(puff); return puff; }); });
      const village=new T.Group();
      for(const object of [...scene.children]) if(object!==sea && object!==district.root && (object instanceof T.Mesh || object instanceof T.Group)) village.add(object);
      scene.add(village);
      // Live plants and citizens are shared, so changing a skin cannot reset growth or identity.
      for(const object of [...cropGroups,...citizens])scene.add(object);
      const urban=createUrbanScene();scene.add(urban.newyork,urban.cyberpunk);
      const farmProjects=createFarmScene();scene.add(farmProjects.root);
      const effects=createCityEffects();scene.add(effects.root);
      // Mira range, shared by the three skins: a booth and three square boards that flip like pop-up targets.
      const range = new T.Group(); range.position.set(-.4, .24, -5.6); scene.add(range);
      box(range, '#958c78', 0, .08, 0, 2.9, .16, 2.1); box(range, '#6f6553', 0, .5, .8, 2.5, .62, .3); box(range, '#b04a3c', 0, .84, .8, 2.62, .08, .4);
      const boards = [-.85, 0, .85].map(x => { box(range, '#5d5446', x, .62, -.6, .08, .96, .08); const board = new T.Group(); board.position.set(x, 1.1, -.6); range.add(board);
        box(board, '#efe9d8', 0, .32, 0, .62, .62, .06); box(board, '#c4523f', 0, .32, .035, .42, .42, .02); box(board, '#efe9d8', 0, .32, .05, .25, .25, .02); box(board, '#2f3a36', 0, .32, .065, .09, .09, .02); return board; });
      box(range, '#5d5446', 1.32, 1.05, .8, .06, 1.8, .06); const pennant = new T.Mesh(sailGeo, mat('#c4523f')); pennant.rotation.y = -Math.PI / 2; pennant.scale.set(.5, .38, .5); pennant.position.set(1.32, 1.2, .8); range.add(pennant);
      // Minigame zones: a ring on the ground pulses where a minigame is open, and stays grey while it is locked.
      const zoneGeo = new T.RingGeometry(1.8, 1.98, 48); geometries.add(zoneGeo);
      const zones = (Object.entries(MINIGAME_PLACES) as [Place, MinigameId][]).map(([place, id]) => { const p = PLACES.find(v => v.id === place)!, material = new T.MeshBasicMaterial({ color: '#f2c86b', transparent: true, opacity: .55, depthWrite: false, side: T.DoubleSide, fog: false }), ring = new T.Mesh(zoneGeo, material); ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, .47, p.z); ring.renderOrder = 2; scene.add(ring); return { ring, material, id }; });
      // A small flock circles over the day skies; it stays home at night and over the neon city.
      const flock = new T.Group(); scene.add(flock);
      const birds = Array.from({ length: 7 }, (_, i) => { const bird = new T.Group(); flock.add(bird); const wings = [-1, 1].map(side => { const wing = new T.Group(); wing.position.x = side * .04; bird.add(wing); const feather = box(wing, '#3b4440', side * .2, 0, 0, .4, .025, .14); feather.castShadow = false; return wing; }); bird.userData = { i, wings }; return bird; });
      // House windows share one material, so night lights every window at once.
      const windowGlass = mat('#d9d092');
      function placeLife(t: number) {
        smoke.forEach(puff => { const u = puff.userData, p = (t * .32 + u.k / 3) % 1; puff.position.set(u.x + p * .5, u.y + p * 1.7, u.z - p * .2); puff.scale.setScalar((.14 + p * .32) * (1 - p * p)); });
        birds.forEach(bird => { const i = bird.userData.i, a = t * .16 + i * .5; bird.position.set(-2 + Math.cos(a) * (10 + i % 3), 8.5 + Math.sin(a * 2 + i) * .4, Math.sin(a) * (8 + i % 2)); bird.rotation.y = -a;
          (bird.userData.wings as InstanceType<typeof T.Group>[]).forEach((wing, side) => { wing.rotation.z = (side ? -1 : 1) * Math.sin(t * 9 + i) * .5; }); });
      }
      placeLife(0);
      const ringGeo = new T.RingGeometry(1.65, 1.73, 40); geometries.add(ringGeo); const ringMaterial = new T.MeshBasicMaterial({ color: '#fff3a2', transparent: true, opacity: .8, side: T.DoubleSide });
      const selection = new T.Mesh(ringGeo, ringMaterial); selection.rotation.x = -Math.PI / 2; selection.position.y = .5; scene.add(selection);
      const hitTargets: InstanceType<typeof T.Mesh>[] = []; const hitMaterial = new T.MeshBasicMaterial({ visible: false });
      PLACES.forEach(place => { const hit = new T.Mesh(unitBox, hitMaterial); hit.position.set(place.x, 1.3, place.z); hit.scale.set(3.5, 3, 3.5); hit.userData.place = place.id; scene.add(hit); hitTargets.push(hit); });
      const ray = new T.Raycaster(), pointer = new T.Vector2(); let down = { x: 0, y: 0 };
      function hit(event: PointerEvent) { const bounds = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1); ray.setFromCamera(pointer, camera); return ray.intersectObjects(hitTargets)[0]?.object.userData.place as Place | undefined; }
      const pointerDown = (e: PointerEvent) => { gsap.killTweensOf(cameraPose); down = { x: e.clientX, y: e.clientY }; };
      const pointerUp = (e: PointerEvent) => { if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) { const place = hit(e); if (place) live.current.onSelect(place); } };
      const pointerMove = (e: PointerEvent) => { renderer.domElement.style.cursor = hit(e) ? 'pointer' : 'grab'; };
      renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointerup', pointerUp); renderer.domElement.addEventListener('pointermove', pointerMove);
      const reduced = motionPreference(); let frame = 0, last = 0, ready = false, animationTime = 0, lastAnimation = 0,frames=0,minimized=false,contextLost=false,lastShadow=0,shadowKey='';
      const canDraw=()=>live.current.active&&!document.hidden&&!minimized&&!contextLost;
      const cameraPose = { x: 0, z: 0, zoom: 1 };
      const applyCamera = () => { orbit.target.set(cameraPose.x, .3, cameraPose.z); camera.position.set(28 + cameraPose.x, 28, 34 + cameraPose.z); camera.zoom = cameraPose.zoom; camera.updateProjectionMatrix(); orbit.update(); restart(); };
      function moveCamera(x: number, z: number, zoom: number) {
        gsap.killTweensOf(cameraPose);
        Object.assign(cameraPose, { x: orbit.target.x, z: orbit.target.z, zoom: camera.zoom });
        renderer.domElement.dataset.camera = reduced.matches ? 'idle' : 'moving';
        if (reduced.matches) { Object.assign(cameraPose, { x, z, zoom }); applyCamera(); }
        else gsap.to(cameraPose, { x, z, zoom, duration: .85, ease: 'power3.inOut', overwrite: true, onUpdate: applyCamera, onComplete: () => { renderer.domElement.dataset.camera = 'idle'; restart(); } });
      }
      focus.current = id => { const p = PLACES.find(v => v.id === id)!; moveCamera(p.x * .58, p.z * .58, 1.12); };
      controls.current = { zoom: amount => moveCamera(orbit.target.x, orbit.target.z, Math.max(.75, Math.min(2.2, camera.zoom + amount))), reset: () => moveCamera(0, 0, 1),production:()=>moveCamera(18,0,1.1) };
      function draw(now: number) {
        frame = 0;
        if (canDraw() && (reduced.matches || gsap.isTweening(cameraPose) || now - last >= 33)) {
          last = now; const { state: s, selected } = live.current; mill.visible = s.owned.includes('windmill'); millFoundation.visible = !mill.visible; cottage.visible = s.owned.includes('cottage'); lanterns.visible = s.owned.includes('lanterns');
          purchasedFountain.visible=s.owned.includes('fountain');benches.visible=s.owned.includes('benches');greenhouse.visible=s.owned.includes('greenhouse');const sky=s.atmosphere==='night'?'#182b36':s.atmosphere==='dawn'?'#c6c5c3':'#bacbc7';(scene.background as InstanceType<typeof T.Color>).set(sky);ambient.intensity=s.atmosphere==='night'?.65:1.9;sun.intensity=s.atmosphere==='night'?.8:s.atmosphere==='dawn'?2.2:3.2;sun.color.set(s.atmosphere==='dawn'?'#edc3be':s.atmosphere==='night'?'#9fbcd8':'#ffe3bd');
          engine.scale.setScalar(1 + s.engine.level * .025);
          (sea.material as InstanceType<typeof T.MeshStandardMaterial>).color.set(s.atmosphere==='night'?'#203d48':s.atmosphere==='dawn'?'#a4b6b8':'#98b9b3');
          upgradeParts.forEach((part, i) => { part.visible = i < s.engine.level; });
          const delta = lastAnimation ? Math.min(.05, (now - lastAnimation) / 1000) : 0; lastAnimation = now;
          village.visible=s.skin==='original';urban.newyork.visible=s.skin==='newyork';urban.cyberpunk.visible=s.skin==='cyberpunk';
          if(s.skin!=='original'){
            const cyber=s.skin==='cyberpunk',night=s.atmosphere==='night',dawn=s.atmosphere==='dawn';
            (scene.background as InstanceType<typeof T.Color>).set(cyber?(night?'#0c1120':dawn?'#293047':'#18233b'):(night?'#1f2c40':dawn?'#c3b6ac':'#b4c3cd'));
            ambient.intensity=cyber?.95:night?.75:1.7;sun.intensity=cyber?1.25:night?.75:2.8;sun.color.set(cyber?'#99b7ef':night?'#9fb7d6':dawn?'#e6b99d':'#f2dcc3');
            (sea.material as InstanceType<typeof T.MeshStandardMaterial>).color.set(cyber?'#111e30':night?'#263e53':'#678b9d');
          }
          const night = s.atmosphere === 'night', glow = s.skin === 'cyberpunk' || night;
          (scene.fog as InstanceType<typeof T.Fog>).color.copy(scene.background as InstanceType<typeof T.Color>);
          windowGlass.emissive.set(night ? '#ffcf78' : '#000000'); windowGlass.emissiveIntensity = night ? .9 : 0;
          flock.visible = s.skin !== 'cyberpunk' && !night;
          zones.forEach(({ ring, material, id }, i) => { const status = minigameStatus(id, s), pulse = reduced.matches ? .5 : .5 + .5 * Math.sin(animationTime * 2.4 + i * 1.3);
            material.color.set(status.locked ? '#9aa39c' : status.ready ? '#ffd76e' : s.skin === 'cyberpunk' ? '#6ff0e6' : '#f2c86b'); material.opacity = status.locked ? .2 : .32 + pulse * .38; ring.scale.setScalar(status.locked ? 1 : 1 + pulse * .05); });
          urban.update(s,delta,!reduced.matches);district.update(s,delta,!reduced.matches);farmProjects.update(s,delta,!reduced.matches);effects.update(s,delta,!reduced.matches);renderer.domElement.dataset.farmProjects=farmProjects.root.children.filter(v=>v.visible&&v.name!=='project-blueprint').map(v=>v.name).join(',');renderer.domElement.dataset.installationObjects=String(district.objects);renderer.domElement.dataset.installationLevels=district.root.children.filter(v=>v.name.startsWith('installation-')).map(v=>v.userData.level??0).join(',');
          if (!reduced.matches) { animationTime += delta; if(Number(s.engine.power)>0)wheel.rotation.z += delta * .5; sails.rotation.z += delta * .2; boat.position.y = .24 + Math.sin(animationTime) * .035; trees.forEach((g,i)=>{g.rotation.z=Math.sin(animationTime*.8+i*.9)*.018;});citizens.forEach((g, i) => { g.position.x = -9.5 + ((animationTime * .23 + i * 2.5) % 15); g.position.z = i % 2 ? .6 : -.45; g.position.y = .24 + Math.abs(Math.sin(animationTime * 8 + i)) * .03; });
            placeLife(animationTime); boards.forEach((board, i) => { board.rotation.x = -(Math.max(0, Math.sin(animationTime * .9 + i * 2.1)) ** 4) * 1.35; }); }
          cropGroups.forEach((g, i) => { const plot = s.plots[i]; g.visible = Boolean(plot?.crop); plotMeshes[i].visible = Boolean(plot); if (plot?.crop) { const growth = Math.max(.12, Math.min(1, (s.now - plot.plantedAt) / Math.max(1, plot.readyAt - plot.plantedAt))); g.scale.y = .15 + growth * .85; } });
          const place = PLACES.find(v => v.id === selected)!; selection.position.x = place.x; selection.position.z = place.z;
          const nextShadow=[s.skin,s.atmosphere,s.engine.level,s.owned.join(','),s.farm.built.join(','),Object.values(s.economy.producers).join(',')].join(':');if(nextShadow!==shadowKey||!reduced.matches&&now-lastShadow>1000){renderer.shadowMap.needsUpdate=true;lastShadow=now;shadowKey=nextShadow;}
          renderer.info.reset(); bloom.strength = s.skin === 'cyberpunk' ? .55 : .35; if (glow) composer.render(); else renderer.render(scene, camera);
          renderer.domElement.dataset.bloom = String(glow); renderer.domElement.dataset.frames=String(++frames);renderer.domElement.dataset.effectsTime=effects.time.toFixed(3);renderer.domElement.dataset.emitting=String(effects.emitting);renderer.domElement.dataset.farmWorking=String(farmProjects.working);renderer.domElement.dataset.motion=reduced.matches?'still':'running';renderer.domElement.dataset.drawCalls=String(renderer.info.render.calls);renderer.domElement.dataset.triangles=String(renderer.info.render.triangles);
          PLACES.forEach((p, i) => { const projected = new T.Vector3(p.x, p.id === 'mine' ? 3.7 : 3, p.z).project(camera); const label = labels.current[i]; if (label) { label.style.left = `${(projected.x * .5 + .5) * element.clientWidth}px`; label.style.top = `${(-projected.y * .5 + .5) * element.clientHeight}px`; label.style.visibility = projected.x < -1 || projected.x > 1 || projected.y < -1 || projected.y > 1 ? 'hidden' : 'visible'; } });
          renderer.domElement.dataset.ready = 'true';
          renderer.domElement.dataset.engineLevel = String(s.engine.level);
          renderer.domElement.dataset.skin=s.skin;
          renderer.domElement.dataset.targetX = String(orbit.target.x); renderer.domElement.dataset.targetZ = String(orbit.target.z); renderer.domElement.dataset.zoom = String(camera.zoom);
          if (!ready) { ready = true; live.current.onReady(); }
        }
        if (canDraw() && !reduced.matches) frame = requestAnimationFrame(draw);
      }
      function restart() { if (!canDraw()) {renderer.domElement.dataset.motion='paused'; cancelAnimationFrame(frame); frame = 0; lastAnimation = 0; gsap.killTweensOf(cameraPose); renderer.domElement.dataset.camera = 'idle'; return; } if (!frame) frame = requestAnimationFrame(draw); }
      const onLost=(event:Event)=>{event.preventDefault();contextLost=true;restart();setError('O cenário 3D foi interrompido. Use os objetivos, locais e ferramentas para continuar.');};renderer.domElement.addEventListener('webglcontextlost',onLost);
      const removeWindow=window.desktop.onWindowState(s=>{minimized=s.minimized;restart();});void window.desktop.getWindowState().then(r=>{if(!stopped&&r.ok){minimized=r.value.minimized;restart();}});
      redraw.current = restart; orbit.addEventListener('change', restart);
      const observer = new ResizeObserver(() => { const width = Math.max(1, element.clientWidth), height = Math.max(1, element.clientHeight), aspect = width / height; camera.left = -15 * aspect; camera.right = 15 * aspect; camera.updateProjectionMatrix(); renderer.setSize(width, height); composer.setSize(width, height); restart(); }); observer.observe(element);
      const stopForPreference = () => { gsap.killTweensOf(cameraPose); renderer.domElement.dataset.camera = 'idle'; restart(); };
      const stopForGesture = () => { gsap.killTweensOf(cameraPose); renderer.domElement.dataset.camera = 'idle'; };
      orbit.addEventListener('start', stopForGesture);
      document.addEventListener('visibilitychange', restart); reduced.addEventListener('change', stopForPreference); restart();
      cleanup = () => { focus.current = () => {}; redraw.current = () => {};removeWindow();renderer.domElement.removeEventListener('webglcontextlost',onLost); gsap.killTweensOf(cameraPose); cancelAnimationFrame(frame); observer.disconnect(); orbit.removeEventListener('change', restart); orbit.removeEventListener('start', stopForGesture); orbit.dispose(); document.removeEventListener('visibilitychange', restart); reduced.removeEventListener('change', stopForPreference); renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointermove', pointerMove); urban.dispose(); district.dispose(); farmProjects.dispose();effects.dispose(); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); ringMaterial.dispose(); smokeMaterial.dispose(); zones.forEach(z => z.material.dispose()); bloom.dispose(); composer.dispose(); hitMaterial.dispose(); renderer.dispose(); renderer.domElement.remove(); };
    }).catch(() => { if (!stopped) { setError('Não foi possível carregar o cenário.'); live.current.onReady(); } });
    return () => { stopped = true; cleanup(); };
  }, []);
  return <div className="city-map" ref={host}>{PLACES.map((p, i) => { const game = MINIGAME_PLACES[p.id], status = game ? minigameStatus(game, state) : null; return <button key={p.id} ref={el => { labels.current[i] = el; }} className={`city-label ${selected === p.id ? 'selected' : ''} ${game ? 'minigame' : ''}`} data-ready={status?.ready || undefined} data-locked={status?.locked || undefined} onClick={() => onSelect(p.id)} aria-label={`Visitar ${p.name.toLocaleLowerCase()}`} title={status ? `${p.name} · ${status.text}` : p.name}><span/><b className="place-name">{p.name}</b>{status && <em className="place-play">{status.locked ? 'FECHADO' : 'JOGAR ▸'}</em>}</button>; })}<div className="city-camera">{Object.values(state.economy.producers).some(Boolean)&&<button aria-label="Explorar distrito produtivo" onClick={()=>controls.current.production()}><Icon kind="city"/></button>}<button aria-label="Aproximar cidade" onClick={() => controls.current.zoom(.15)}><Icon kind="plus"/></button><button aria-label="Afastar cidade" onClick={() => controls.current.zoom(-.15)}><Icon kind="minus"/></button><button aria-label="Centralizar cidade" onClick={() => controls.current.reset()}><Icon kind="target"/></button></div><span className="city-controls">Arraste para explorar · Role para aproximar</span>{error && <div className="city-webgl-error" role="alert">{error}</div>}</div>;
}
