import * as THREE from 'three';
import { rand, mat, groundY } from './world/terrain.js';
import { REALMS } from './realms/realm-registry.js';
import { getRealmQuestByName } from './realms/realm-quests.js';
import { applyQuestPickup } from './quest/quest-progress.js';
import { parseSave } from './save/save-state.js';
const root=document.querySelector('#game'),countEl=document.querySelector('#crystal-count'),intro=document.querySelector('#intro-card'),startButton=document.querySelector('#start-button'),toast=document.querySelector('#toast'),hint=document.querySelector('#bottom-hint'),crosshair=document.querySelector('.crosshair'),questTitle=document.querySelector('.quest-card strong'),questText=document.querySelector('.quest-card p'),realmNameEl=document.querySelector('#realm-name'),realmIndexEl=document.querySelector('#realm-index');
const scene=new THREE.Scene();scene.background=new THREE.Color('#91b8bb');scene.fog=new THREE.FogExp2('#91b8bb',.0035);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,900);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;root.appendChild(renderer.domElement);
const hemisphere=new THREE.HemisphereLight(0xc5f3ec,0x3b5143,2);scene.add(hemisphere);const sun=new THREE.DirectionalLight(0xffe7c2,3.2);sun.position.set(-90,130,55);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-110;sun.shadow.camera.right=110;sun.shadow.camera.top=110;sun.shadow.camera.bottom=-110;scene.add(sun);
const groundGeo=new THREE.PlaneGeometry(620,620,150,150);groundGeo.rotateX(-Math.PI/2);const pos=groundGeo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,groundY(x,z))}groundGeo.computeVertexNormals();const groundMaterial=mat('#597f61');const ground=new THREE.Mesh(groundGeo,groundMaterial);ground.receiveShadow=true;scene.add(ground);
const hillMats=[mat('#678f83'),mat('#739c8d'),mat('#507b75')];for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=rand(235,310),x=Math.cos(a)*r,z=Math.sin(a)*r,h=rand(35,80),hill=new THREE.Mesh(new THREE.ConeGeometry(rand(20,38),h,7),hillMats[i%3]);hill.position.set(x,groundY(x,z)+h*.36,z);hill.rotation.y=rand(0,6);hill.scale.z=rand(.65,1.2);hill.castShadow=true;scene.add(hill)}
const obstacles=[];const trunkMat=mat('#594b3c'),leafMats=[mat('#315f50'),mat('#3c755c'),mat('#4f8764'),mat('#668f6a')],trunkGeo=new THREE.CylinderGeometry(.22,.42,3.2,7),treeGeo=new THREE.ConeGeometry(1,1,7);
for(let i=0;i<390;i++){let x,z;do{x=rand(-285,285);z=rand(-285,285)}while(Math.hypot(x,z)<24||(Math.abs(x)<32&&z>-95&&z<35));const y=groundY(x,z),s=rand(.7,2.2),g=new THREE.Group(),trunk=new THREE.Mesh(trunkGeo,trunkMat);trunk.position.y=1.4*s;trunk.scale.setScalar(s);trunk.castShadow=true;g.add(trunk);for(let j=0;j<3;j++){const crown=new THREE.Mesh(treeGeo,leafMats[Math.floor(rand(0,4))]);crown.position.y=(2.5+j*1.05)*s;crown.scale.set((1.7-j*.24)*s,(2.4-j*.12)*s,(1.6-j*.16)*s);crown.rotation.y=rand(0,6);crown.castShadow=true;g.add(crown)}g.position.set(x,y,z);g.rotation.y=rand(0,6);scene.add(g);obstacles.push({x,z,r:Math.max(1.15,1.1*s)})}
const rockMats=[mat('#687c79'),mat('#7c8d82'),mat('#4e6b67')];for(let i=0;i<210;i++){const x=rand(-290,290),z=rand(-290,290);if(Math.hypot(x,z)<18)continue;const radius=rand(.4,2.2),rock=new THREE.Mesh(new THREE.DodecahedronGeometry(radius,0),rockMats[i%3]);rock.position.set(x,groundY(x,z)+.3,z);rock.scale.y=rand(.5,1.4);rock.rotation.set(rand(0,2),rand(0,6),rand(0,2));rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);obstacles.push({x,z,r:radius+.45})}
const flowerMats=[mat('#a7f0ce',.6,{emissive:'#2d8069',emissiveIntensity:.4}),mat('#e9c9a4',.7,{emissive:'#75553a',emissiveIntensity:.25}),mat('#b3bdf6',.6,{emissive:'#4e5d9e',emissiveIntensity:.45})];const stemMat=mat('#507c5c');for(let i=0;i<180;i++){const x=rand(-180,180),z=rand(-180,180);if(Math.hypot(x,z)<14)continue;const stem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.06,rand(.3,.8),5),stemMat);stem.position.set(x,groundY(x,z)+.25,z);scene.add(stem);const bloom=new THREE.Mesh(new THREE.IcosahedronGeometry(rand(.12,.25),1),flowerMats[i%3]);bloom.position.set(x,stem.position.y+.25,z);bloom.scale.y=1.3;scene.add(bloom)}
const fireflyMat=mat('#c9ffe7',.22,{emissive:'#6fffc9',emissiveIntensity:2.8});const fireflies=[];for(let i=0;i<72;i++){const orb=new THREE.Mesh(new THREE.SphereGeometry(rand(.035,.085),6,5),fireflyMat);orb.userData={x:rand(-145,145),z:rand(-145,145),y:rand(1.2,5.5),phase:rand(0,Math.PI*2),speed:rand(.4,1.4)};orb.position.set(orb.userData.x,orb.userData.y,orb.userData.z);scene.add(orb);fireflies.push(orb)}
const stone=mat('#a9b4a0'),dark=mat('#6c847d'),glow=mat('#8bf4d6',.25,{emissive:'#43dfb4',emissiveIntensity:1.5});const base=new THREE.Mesh(new THREE.CylinderGeometry(13,15,1.4,12),dark);base.position.set(0,groundY(0,-82)+.3,-82);base.receiveShadow=true;scene.add(base);
for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=Math.cos(a)*9,z=-82+Math.sin(a)*9,p=new THREE.Mesh(new THREE.BoxGeometry(1.8,7,1.8),stone);p.position.set(x,groundY(x,z)+3.7,z);p.rotation.y=-a;p.castShadow=true;scene.add(p);const cap=new THREE.Mesh(new THREE.BoxGeometry(2.3,.6,2.3),dark);cap.position.set(x,p.position.y+3.5,z);cap.rotation.y=-a;scene.add(cap)}
const arch=new THREE.Mesh(new THREE.TorusGeometry(4.4,.55,8,32,Math.PI),glow);arch.position.set(0,groundY(0,-82)+7,-82);arch.rotation.z=Math.PI;scene.add(arch);for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(1.5-i*.2),glow);c.position.set((i-1)*3,groundY((i-1)*3,-82)+2,-82);scene.add(c)}
const runeNodes=[],runeTargets=[2,1,3],runeMats=[mat('#9cebd7',.25,{emissive:'#318d76',emissiveIntensity:.4}),mat('#9cebd7',.25,{emissive:'#318d76',emissiveIntensity:.4}),mat('#9cebd7',.25,{emissive:'#318d76',emissiveIntensity:.4})];for(let i=0;i<3;i++){const x=(i-1)*5.2,z=-73,y=groundY(x,z),g=new THREE.Group();g.position.set(x,y,z);const plinth=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.35,.65,6),dark);plinth.position.y=.3;g.add(plinth);const obelisk=new THREE.Mesh(new THREE.OctahedronGeometry(.95,0),runeMats[i]);obelisk.position.y=1.55;obelisk.scale.set(.7,1.65,.7);g.add(obelisk);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,.045,5,24),glow);ring.rotation.x=Math.PI/2;ring.position.y=.55;g.add(ring);g.userData={state:0,obelisk,ring};scene.add(g);runeNodes.push(g)}
const shards=[],shardMat=mat('#a5ffe0',.22,{emissive:'#3be8b3',emissiveIntensity:2,metalness:.15}),haloMat=mat('#b4ffe5',.25,{emissive:'#66ffc9',emissiveIntensity:1});for(let i=0;i<5;i++){const a=i*1.256+.4,r=48+i*11,x=Math.cos(a)*r,z=-82+Math.sin(a)*r,g=new THREE.Group();g.position.set(x,groundY(x,z)+1.5,z);const c=new THREE.Mesh(new THREE.OctahedronGeometry(1.1),shardMat);c.scale.set(.72,1.5,.72);c.rotation.z=.18;g.add(c);const halo=new THREE.Mesh(new THREE.TorusGeometry(1.15,.035,5,28),haloMat);halo.rotation.x=Math.PI/2;g.add(halo);const light=new THREE.PointLight('#79ffd4',7,15,2);light.position.y=.4;g.add(light);g.userData={found:false,phase:rand(0,6)};scene.add(g);shards.push(g)}
const player=new THREE.Group(),cloakMat=mat('#497f75'),skinMat=mat('#e6bd98'),goldMat=mat('#e7c98d',.6,{metalness:.2}),body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,4,8),cloakMat),head=new THREE.Mesh(new THREE.SphereGeometry(.36,14,12),skinMat),hood=new THREE.Mesh(new THREE.SphereGeometry(.43,12,9,0,Math.PI*2,0,Math.PI*.65),goldMat),pack=new THREE.Mesh(new THREE.BoxGeometry(.5,.65,.25),mat('#e0c9a6'));body.position.y=1.2;body.castShadow=true;head.position.y=2.05;head.castShadow=true;hood.position.y=2.17;pack.position.set(0,1.15,.45);player.add(body,head,hood,pack);player.position.set(0,groundY(0,8),8);scene.add(player);
const keys={};let started=false,gameWon=false,yaw=0,pitch=.22,collected=0,lastTime=0,toastTimer=0,gamepadInteractWasDown=false;
let flightMode='walk',flightAltitude=0,verticalVelocity=0,balloonLift=0;
const flightReadout=document.querySelector('#flight-readout');
const wingRig=new THREE.Group();wingRig.visible=false;player.add(wingRig);
const wingMaterial=mat('#b9d9d0',.35,{transparent:true,opacity:.82,side:THREE.DoubleSide,metalness:.05});
for(const side of [-1,1]){const wing=new THREE.Mesh(new THREE.ShapeGeometry((()=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(side*1.9,-.25,side*2.55,.55);s.quadraticCurveTo(side*1.4,.72,side*.25,.48);s.closePath();return s})()),wingMaterial);wing.position.set(side*.18,1.65,0);wing.rotation.y=side*.12;wingRig.add(wing)}
const balloonRig=new THREE.Group();balloonRig.visible=false;player.add(balloonRig);
const balloon=new THREE.Mesh(new THREE.SphereGeometry(1.55,18,14),mat('#f0c7a0',.35,{transparent:true,opacity:.9}));
balloon.position.set(0,5.2,0);balloon.scale.set(.9,1.2,.9);balloonRig.add(balloon);
const basket=new THREE.Mesh(new THREE.BoxGeometry(.8,.55,.8),mat('#926c4b'));basket.position.y=2.45;balloonRig.add(basket);
const ropeMaterial=mat('#e5d2a5');
for(const side of [-1,1])for(const front of [-1,1]){const rope=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,2.15,5),ropeMaterial);rope.position.set(side*.28,3.8,front*.28);balloonRig.add(rope)}
function setFlightMode(mode,announce=true){
 if(!['walk','wings','balloon'].includes(mode))return;
 flightMode=mode;wingRig.visible=mode==='wings';balloonRig.visible=mode==='balloon';
 if(mode==='walk'){verticalVelocity=0;flightAltitude=Math.max(0,flightAltitude);if(flightAltitude<.25)flightAltitude=0}
 document.querySelectorAll('[data-flight]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.flight===mode)));
 if(flightReadout)flightReadout.textContent=mode==='walk'?'On foot · Choose Wings or Balloon to take off':mode==='wings'?'Wings active · move forward to glide; Space rises, Ctrl descends':'Balloon active · gentle automatic lift; Space rises, Ctrl descends';
 if(announce)showToast(mode==='walk'?'Flight gear stowed':mode==='wings'?'Wings equipped · catch the wind!':'Balloon inflated · enjoy the lift!');
}
document.querySelectorAll('[data-flight]').forEach(button=>button.addEventListener('click',()=>setFlightMode(button.dataset.flight)));
const riseButton=document.querySelector('#flight-up'),descendButton=document.querySelector('#flight-down');
function bindHold(button,code){let held=false;const down=e=>{e.preventDefault();held=true;keys[code]=true};const up=()=>{held=false;keys[code]=false};button.addEventListener('pointerdown',down);['pointerup','pointercancel','pointerleave'].forEach(type=>button.addEventListener(type,up));}
bindHold(riseButton,'Space');bindHold(descendButton,'ControlLeft');

// Luma currently uses a procedural guardian placeholder; replace with the final rigged model when available.
const luma=new THREE.Group();luma.visible=false;const lumaCore=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,2),mat('#d8fff4',.18,{emissive:'#6affdc',emissiveIntensity:2.4,transparent:true,opacity:.92}));luma.add(lumaCore);const lumaHalo=new THREE.Mesh(new THREE.TorusGeometry(2.1,.075,8,48),mat('#b7fff0',.2,{emissive:'#62f3d3',emissiveIntensity:2}));lumaHalo.rotation.x=Math.PI/2.5;luma.add(lumaHalo);const lumaLight=new THREE.PointLight('#80ffe1',18,42,1.8);luma.add(lumaLight);luma.position.set(0,groundY(0,-82)+5,-82);scene.add(luma);
let activeRealmIndex=0;
const realmQuestMarkers=[];
const foundQuestObjects={};
let totalQuestXP=0;
const questGemMaterial=mat('#fff0b8',.2,{emissive:'#f5c96d',emissiveIntensity:2});
const questRingMaterial=mat('#ffe4a2',.25,{emissive:'#dba84f',emissiveIntensity:1.2});
function mountRealmQuest(index){
  for(const marker of realmQuestMarkers)scene.remove(marker);
  realmQuestMarkers.length=0;
  const realm=REALMS[index],quest=getRealmQuestByName(realm.name);
  if(!quest)return;
  if(!Array.isArray(foundQuestObjects[realm.id]))foundQuestObjects[realm.id]=[];
  const found=new Set(foundQuestObjects[realm.id]);
  const count=quest.objects.filter(item=>found.has(item.id)).length;
  questTitle.textContent=count===quest.objects.length?'Realm Quest Complete':quest.title;
  questText.textContent=`${quest.description} Found ${count}/${quest.objects.length} · ${totalQuestXP} XP.`;
  quest.objects.forEach((object,i)=>{
    if(found.has(object.id))return;
    const x=(object.x-.5)*280,z=(object.y-.5)*280;
    const marker=new THREE.Group();marker.position.set(x,groundY(x,z)+1.2,z);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.8,1),questGemMaterial);
    gem.scale.set(.75,1.25,.75);marker.add(gem);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.045,6,24),questRingMaterial);
    ring.rotation.x=Math.PI/2;marker.add(ring);
    const light=new THREE.PointLight('#ffe1a0',3.5,10,2);light.position.y=.3;marker.add(light);
    marker.userData={object,realmId:realm.id,phase:i*.9};
    scene.add(marker);realmQuestMarkers.push(marker);
  });
}
function collectRealmObject(){
  const marker=realmQuestMarkers.find(item=>Math.hypot(player.position.x-item.position.x,player.position.z-item.position.z)<3.4);
  if(!marker)return false;
  const {object,realmId}=marker.userData;
  const quest=getRealmQuestByName(REALMS[activeRealmIndex].name);
  const result=applyQuestPickup(foundQuestObjects,totalQuestXP,{...quest,realmId},object.id);
  Object.assign(foundQuestObjects,result.found);totalQuestXP=result.totalXP;
  scene.remove(marker);realmQuestMarkers.splice(realmQuestMarkers.indexOf(marker),1);
  const complete=quest.objects.every(item=>foundQuestObjects[realmId].includes(item.id));
  questTitle.textContent=complete?'Realm Quest Complete':quest.title;
  questText.textContent=complete?`All treasures found! +${quest.completionXP} completion XP · ${totalQuestXP} XP earned.`:`${object.name} found · +${object.xp} XP. ${quest.description}`;
  saveProgress();showToast(complete?`✦ ${quest.title} complete!`:`${object.name} found · +${object.xp} XP`);
  return true;
}
// Each realm has its own atmospheric character while the shared terrain and
// chapter-one mechanics are being migrated into separate playable environments.
const realmAtmospheres=[
  {fog:.0035,sun:3.2,hemisphere:2,exposure:1.15},
  {fog:.0048,sun:2.25,hemisphere:2.4,exposure:1.12},
  {fog:.0024,sun:3.8,hemisphere:1.8,exposure:1.22},
  {fog:.0055,sun:1.8,hemisphere:1.7,exposure:1.05},
  {fog:.0062,sun:1.7,hemisphere:2.6,exposure:1.08},
  {fog:.0042,sun:2.5,hemisphere:2.5,exposure:1.12},
  {fog:.0038,sun:2.8,hemisphere:2.1,exposure:1.1},
  {fog:.0028,sun:3.1,hemisphere:2.8,exposure:1.18},
  {fog:.0021,sun:4.1,hemisphere:1.5,exposure:1.24},
  {fog:.0058,sun:1.9,hemisphere:1.9,exposure:1.06},
  {fog:.0032,sun:3,hemisphere:2.2,exposure:1.14},
  {fog:.0065,sun:1.6,hemisphere:1.8,exposure:1.03},
];
// Realm-specific landmark sets: each preview changes more than its palette.
// These are scenic prototypes; full terrain/travel gating remains a later migration.
const realmLandmarks=[];
function landmarkMaterial(color,emissive=color){
  return mat(color,.62,{emissive,emissiveIntensity:.38});
}
function addLandmarkMesh(group,geometry,material,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,groundY(x,z)+y,z);mesh.rotation.set(rx,ry,rz);mesh.scale.set(sx,sy,sz);
  mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
}
function buildRealmLandmarks(index,realm){
  const group=new THREE.Group();
  const accent=landmarkMaterial('#'+realm.oceanGlow.toString(16).padStart(6,'0'));
  const stoneMat=landmarkMaterial('#'+realm.grainPrimary.toString(16).padStart(6,'0'));
  const darkMat=landmarkMaterial('#'+realm.nearLand.toString(16).padStart(6,'0'));
  const place=(x,z,y=0)=>({x,z,y});
  if(index===0){
    for(let i=0;i<5;i++){const p=place(-32+i*16,-36-(i%2)*8);addLandmarkMesh(group,new THREE.CylinderGeometry(1.3,2,7+(i%3)*2,6),stoneMat,p.x,p.y+3.5,p.z,0,0.2*i,0);}
  }else if(index===1){
    for(let i=0;i<5;i++){const p=place(-30+i*15,-48);addLandmarkMesh(group,new THREE.IcosahedronGeometry(3.5,1),accent,p.x,9+(i%2)*4,p.z,0,i,0,1,.8,1);}
  }else if(index===2){
    for(let i=0;i<3;i++){const p=place(-20+i*20,-55);addLandmarkMesh(group,new THREE.TorusGeometry(5,.65,8,24,Math.PI),stoneMat,p.x,5,p.z,0,0,Math.PI,1.2,1.5,1);}
  }else if(index===3){
    for(let i=0;i<7;i++){const p=place(-30+i*10,-48-(i%2)*9);addLandmarkMesh(group,new THREE.CylinderGeometry(.35,.9,5+(i%3)*2,5),accent,p.x,2.8,p.z,0,0,.18*(i%2));}
  }else if(index===4){
    for(let i=0;i<5;i++){const p=place(-28+i*14,-46);addLandmarkMesh(group,new THREE.TorusGeometry(3.5,.55,7,18),stoneMat,p.x,2.8,p.z,Math.PI/2.4,0,i*.3,1,1.5,1);}
  }else if(index===5){
    for(let i=0;i<8;i++){const p=place(-32+i*9,-50-(i%2)*7);addLandmarkMesh(group,new THREE.OctahedronGeometry(2.6+(i%3)),accent,p.x,2.5,p.z,0,i*.6,.15,1,1.8,1);}
  }else if(index===6){
    for(let i=0;i<5;i++){const p=place(-28+i*14,-50);addLandmarkMesh(group,new THREE.SphereGeometry(3.8,10,7),stoneMat,p.x,8+(i%2)*3,p.z,0,0,0,1.6,.3,1.2);addLandmarkMesh(group,new THREE.ConeGeometry(1.1,5,6),accent,p.x,3,p.z);}
  }else if(index===7){
    for(let i=0;i<6;i++){const p=place(-30+i*12,-48-(i%2)*6);addLandmarkMesh(group,new THREE.ConeGeometry(5,3.5,7),stoneMat,p.x,1.4,p.z,0,i*.4,0,1.4,.65,1);}
  }else if(index===8){
    for(let i=0;i<4;i++){const p=place(-24+i*16,-48);addLandmarkMesh(group,new THREE.TorusGeometry(4+i*.5,.16,6,36),accent,p.x,6+i%2*2,p.z,.35,i*.5,0,1,1,1);}
  }else if(index===9){
    for(let i=0;i<6;i++){const p=place(-30+i*12,-50-(i%2)*7);addLandmarkMesh(group,new THREE.CylinderGeometry(.12,1.4,7+(i%3)*2,5),accent,p.x,3.5,p.z,0,i*.4,.08);}
  }else if(index===10){
    for(let i=0;i<5;i++){const p=place(-28+i*14,-48);addLandmarkMesh(group,new THREE.CylinderGeometry(.45,.75,5,7),stoneMat,p.x,2.5,p.z);addLandmarkMesh(group,new THREE.SphereGeometry(2.5,8,6),accent,p.x,7,p.z,0,i,0,1,1.35,1);}
  }else{
    for(let i=0;i<7;i++){const p=place(-32+i*10,-48-(i%2)*6);addLandmarkMesh(group,new THREE.ConeGeometry(1.8,8+(i%3)*2,5),darkMat,p.x,4,p.z);addLandmarkMesh(group,new THREE.SphereGeometry(1.2,8,6),accent,p.x,8+(i%3)*2,p.z);}
  }
  group.visible=false;scene.add(group);realmLandmarks.push(group);
}
REALMS.forEach((realm,index)=>buildRealmLandmarks(index,realm));
function applyRealmPalette(index, announce=true){
  activeRealmIndex=(index+REALMS.length)%REALMS.length;
  const realm=REALMS[activeRealmIndex];
  const atmosphere=realmAtmospheres[activeRealmIndex];
  realmLandmarks.forEach((group,i)=>{group.visible=i===activeRealmIndex;});
  scene.background.setHex(realm.farLand);
  scene.fog.color.setHex(realm.farLand);
  scene.fog.density=atmosphere.fog;
  renderer.toneMappingExposure=atmosphere.exposure;
  sun.intensity=atmosphere.sun;
  hemisphere.intensity=atmosphere.hemisphere;
  groundMaterial.color.setHex(realm.nearLand);
  hillMats.forEach((material,i)=>material.color.setHex(i===0?realm.farLand:(i===1?realm.nearLand:realm.grassAlternate)));
  leafMats.forEach((material,i)=>material.color.setHex(i%2===0?realm.grassPrimary:realm.grassAlternate));
  flowerMats.forEach((material,i)=>material.color.setHex(i===0?realm.oceanGlow:(i===1?realm.grainPrimary:realm.oceanLight)));
  sun.color.setHex(realm.grainPrimary);
  hemisphere.color.setHex(realm.oceanGlow);
  hemisphere.groundColor.setHex(realm.nearLand);
  realmNameEl.textContent=realm.name.toUpperCase();
  realmIndexEl.textContent=String(activeRealmIndex+1).padStart(2,'0');
  mountRealmQuest(activeRealmIndex);
  if(announce)showToast(`Realm palette preview · ${realm.name}`);
}
document.querySelector('#realm-prev').addEventListener('click',()=>applyRealmPalette(activeRealmIndex-1));
document.querySelector('#realm-next').addEventListener('click',()=>applyRealmPalette(activeRealmIndex+1));
applyRealmPalette(0,false);
const SAVE_KEY='athar-whispering-wilds-v1';
function readSave(){try{const value=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');return value&&typeof value==='object'?value:null}catch{return null}}
function saveProgress(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:3,collected,shards:shards.map(shard=>shard.userData.found),position:{x:player.position.x,z:player.position.z},runes:runeNodes.map(n=>n.userData.state),gameWon,foundQuestObjects,totalQuestXP,activeRealmIndex}))}catch{/* Private browsing or storage restrictions: continue without saving. */}}
function restoreProgress(){
  const save=parseSave(readSave(),{shardCount:shards.length,runeCount:runeNodes.length,realmCount:REALMS.length});
  if(!save)return;
  Object.assign(foundQuestObjects,save.foundQuestObjects);totalQuestXP=save.totalQuestXP;activeRealmIndex=save.activeRealmIndex;
  save.shards.forEach((f,i)=>{shards[i].userData.found=f;if(f)scene.remove(shards[i])});
  collected=shards.filter(shard=>shard.userData.found).length;countEl.textContent=String(collected);
  if(save.position){player.position.x=save.position.x;player.position.z=save.position.z;player.position.y=groundY(save.position.x,save.position.z)}
  if(save.runes)runeNodes.forEach((node,i)=>{const state=save.runes[i];node.userData.state=state;const active=state>0;node.userData.obelisk.material.emissiveIntensity=active?1.5:.4;node.userData.obelisk.material.color.set(active?'#b7ffe8':'#9cebd7');node.userData.ring.material=active?shardMat:glow});
  gameWon=save.gameWon;luma.visible=gameWon;applyRealmPalette(activeRealmIndex,false);
  if(gameWon){questTitle.textContent='Luma Awakened';questText.textContent='The five shards and aligned runes awakened Luma. Your journey has begun.';hint.textContent='Chapter complete · Luma has awakened in the Whispering Wilds.'}
}
restoreProgress();function showToast(message){toast.textContent=message;toast.classList.add('show');toastTimer=2.6}function startGame(){started=true;intro.classList.add('hidden');crosshair.classList.add('visible');renderer.domElement.requestPointerLock?.();hint.textContent='The shards are calling. Follow their glow through the trees.';showToast('The Whispering Wilds await.')}startButton.addEventListener('click',startGame);renderer.domElement.addEventListener('click',()=>{if(started&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});const touchKeys=document.querySelectorAll('[data-key]');touchKeys.forEach(button=>{const code=button.dataset.key;const down=e=>{e.preventDefault();keys[code]=true};const up=e=>{e.preventDefault();keys[code]=false};button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('pointerleave',up)});document.querySelector('#touch-interact').addEventListener('pointerdown',e=>{e.preventDefault();interact()});let touchLook=null;renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&started)touchLook={x:e.clientX,y:e.clientY}});renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&touchLook&&started){yaw-=(e.clientX-touchLook.x)*.006;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-touchLook.y)*.004,-.05,.65);touchLook={x:e.clientX,y:e.clientY}}});renderer.domElement.addEventListener('pointerup',()=>touchLook=null);function clearInputs(){for(const code of Object.keys(keys))keys[code]=false}
function interact(){
 if(!started)return;
 if(collectRealmObject())return;
 if(gameWon)return;
 const nearRune=runeNodes.find(n=>Math.hypot(player.position.x-n.position.x,player.position.z-n.position.z)<4.2);
 if(nearRune){nearRune.userData.state=(nearRune.userData.state+1)%4;const active=nearRune.userData.state>0;nearRune.userData.obelisk.material.emissiveIntensity=active?1.5:.4;nearRune.userData.obelisk.material.color.set(active?'#b7ffe8':'#9cebd7');nearRune.userData.ring.material=active?shardMat:glow;saveProgress();showToast(`Rune ${runeNodes.indexOf(nearRune)+1}: ${nearRune.userData.state} · Tune all three runes to the ancient pattern.`)}
 else if(Math.hypot(player.position.x,player.position.z+82)<15){if(collected<5)showToast('The ring needs all five shards first.');else if(runeNodes.every((n,i)=>n.userData.state===runeTargets[i])){gameWon=true;luma.visible=true;questTitle.textContent='Luma Awakened';questText.textContent='The five shards and the aligned runes awaken Luma. Your journey has begun.';hint.textContent='Chapter complete · Luma has awakened in the Whispering Wilds.';saveProgress();showToast('✦ Luma has awakened · Chapter One complete!')}else showToast('The runes are out of harmony. Find the three stones and tune them: 2 · 1 · 3.')}
 else showToast('Find a rune stone or return to the ancient ring.');
}
const interactCodes=new Set(['KeyE','Enter','Space','GamepadInteract']);
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&started)e.preventDefault();if(!e.repeat&&e.code==='Digit1'){setFlightMode('walk');return}if(!e.repeat&&e.code==='Digit2'){setFlightMode('wings');return}if(!e.repeat&&e.code==='Digit3'){setFlightMode('balloon');return}if(!e.repeat&&interactCodes.has(e.code)&&(e.code!=='Space'||flightMode==='walk')){interact();return}keys[e.code]=true});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('blur',clearInputs);
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement)clearInputs()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInputs();saveProgress()}});
addEventListener('mousemove',e=>{if(started&&document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0018,-.05,.65)}});addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const forward=new THREE.Vector3(),right=new THREE.Vector3(),desired=new THREE.Vector3(),cameraTarget=new THREE.Vector3(),cameraOffset=new THREE.Vector3();
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-lastTime)/1000||0,.04);lastTime=now;for(const marker of realmQuestMarkers){marker.rotation.y+=dt*.45;marker.position.y=groundY(marker.position.x,marker.position.z)+1.2+Math.sin(now*.0017+marker.userData.phase)*.2;}for(const f of fireflies){const u=f.userData;f.position.x=u.x+Math.sin(now*.00035*u.speed+u.phase)*1.8;f.position.y=u.y+Math.sin(now*.001*u.speed+u.phase)*.7;f.position.z=u.z+Math.cos(now*.0003*u.speed+u.phase)*1.8;f.visible=Math.sin(now*.0014+u.phase)>.02;}for(const shard of shards){if(shard.userData.found)continue;shard.rotation.y+=dt*.65;shard.position.y=groundY(shard.position.x,shard.position.z)+1.5+Math.sin(now*.0018+shard.userData.phase)*.22;shard.children[1].rotation.z+=dt*.4;if(started&&player.position.distanceTo(shard.position)<3){shard.userData.found=true;scene.remove(shard);collected++;countEl.textContent=collected;saveProgress();showToast(collected===5?'All shards gathered — Luma has heard you!':`Shard found · ${collected} of 5`);hint.textContent=collected===5?'Return to the ancient ring. Tune the three rune stones to 2 · 1 · 3, then press E at the ring.':'Keep exploring; another shard is hidden nearby.'}}
if(gameWon){luma.visible=true;luma.position.y=groundY(0,-82)+5+Math.sin(now*.0015)*.45;luma.rotation.y+=dt*.35;lumaCore.rotation.x+=dt*.22;lumaCore.rotation.y+=dt*.55;lumaHalo.rotation.z+=dt*.3;lumaLight.intensity=16+Math.sin(now*.003)*3;}if(started){forward.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));desired.set(0,0,0);
 let padX=0,padY=0,padLookX=0,padLookY=0,padRun=false,padInteract=false;
 try{for(const pad of navigator.getGamepads?.()||[]){if(!pad)continue;const axis=(i)=>{const v=pad.axes[i]||0;return Math.abs(v)<.18?0:v};padX=axis(0);padY=axis(1);padLookX=axis(2);padLookY=axis(3);padRun=!!(pad.buttons[4]?.pressed||pad.buttons[10]?.pressed);padInteract=!!(pad.buttons[0]?.pressed||pad.buttons[2]?.pressed);break}}catch{/* Gamepad API can be unavailable in restricted contexts. */}
 if(padX||padY){desired.addScaledVector(right,padX);desired.addScaledVector(forward,-padY)}
 if(keys.KeyW||keys.ArrowUp)desired.add(forward);if(keys.KeyS||keys.ArrowDown)desired.sub(forward);if(keys.KeyD||keys.ArrowRight)desired.add(right);if(keys.KeyA||keys.ArrowLeft)desired.sub(right);
 if(padLookX||padLookY){yaw-=padLookX*2.2*dt;pitch=THREE.MathUtils.clamp(pitch+padLookY*1.5*dt,-.05,.65)}
 if(padInteract&&!gamepadInteractWasDown)interact();gamepadInteractWasDown=padInteract;
 if(desired.lengthSq()>0){desired.normalize();const running=keys.ShiftLeft||keys.ShiftRight||padRun;const speed=flightMode==='wings'?(running?19:13):(running?16:9);const nx=THREE.MathUtils.clamp(player.position.x+desired.x*speed*dt,-300,300),nz=THREE.MathUtils.clamp(player.position.z+desired.z*speed*dt,-300,300);const blockedX=obstacles.some(o=>Math.hypot(nx-o.x,player.position.z-o.z)<o.r+.72),blockedZ=obstacles.some(o=>Math.hypot(player.position.x-o.x,nz-o.z)<o.r+.72);if(!blockedX)player.position.x=nx;if(!blockedZ)player.position.z=nz;player.rotation.y=Math.atan2(desired.x,desired.z);body.position.y=1.2+Math.sin(now*.012)*.045}player.position.x=THREE.MathUtils.clamp(player.position.x,-300,300);player.position.z=THREE.MathUtils.clamp(player.position.z,-300,300);const groundHeight=groundY(player.position.x,player.position.z);if(flightMode==='balloon'){balloonLift=Math.min(22,balloonLift+dt*2.8);if(keys.Space)flightAltitude+=dt*7;if(keys.ControlLeft||keys.ControlRight)flightAltitude-=dt*6;flightAltitude=Math.max(0,Math.min(38,flightAltitude));if(flightAltitude<balloonLift)flightAltitude=Math.min(38,flightAltitude+dt*1.5);else if(flightAltitude>balloonLift+2)flightAltitude-=dt*.8;}else if(flightMode==='wings'){if(keys.Space)verticalVelocity=Math.min(8,verticalVelocity+dt*10);if(keys.ControlLeft||keys.ControlRight)verticalVelocity=Math.max(-9,verticalVelocity-dt*13);if(desired.lengthSq()>0&&flightAltitude>0)verticalVelocity=Math.max(verticalVelocity,-1.4);verticalVelocity-=dt*(flightAltitude>0?2.2:9.8);flightAltitude=Math.max(0,Math.min(32,flightAltitude+verticalVelocity*dt));if(flightAltitude===0&&verticalVelocity<0)verticalVelocity=0;}else{flightAltitude=Math.max(0,flightAltitude-dt*10);balloonLift=0;}player.position.y=groundHeight+flightAltitude;wingRig.rotation.z=Math.sin(now*.008)*.035;balloonRig.position.y=Math.sin(now*.0015)*.18;cameraTarget.set(player.position.x,player.position.y+2,player.position.z);const distance=8.5;cameraOffset.set(Math.sin(yaw)*distance,3.1+pitch*4,Math.cos(yaw)*distance);desired.copy(cameraTarget).add(cameraOffset);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(cameraTarget)}else{camera.position.set(0,10,24);camera.lookAt(0,1,-20);player.rotation.y=Math.sin(now*.0004)*.15}if(started&&Math.floor(now/1500)!==Math.floor((now-dt*1000)/1500))saveProgress();if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toast.classList.remove('show')}renderer.render(scene,camera)}
camera.position.set(0,10,24);camera.lookAt(0,1,-20);requestAnimationFrame(animate);