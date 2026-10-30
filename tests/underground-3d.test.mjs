import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:\/)/, '$1'));
const plain = obj => JSON.parse(JSON.stringify(obj));
function engine() {
  const code=readFileSync(join(root, 'dist/game.js'), 'utf8');
  const context={console,performance:{now:()=>0},navigator:{},location:{protocol:'http:'},
    window:{matchMedia:()=>({matches:false}),setTimeout:()=>0,addEventListener:()=>{}},
    document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},
    localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}};
  vm.createContext(context);vm.runInContext(code,context);
  return context.SCPGame;
}
function dig(id,type,x,y,level,width) {
  return {id,type,x,y,level,width,enabled:true,condition:100,sealed:false,staffAssigned:[],upgrades:[],powerPriority:3};
}
function simulate(g,s,n=1) {
  for(let i=0;i<n;i++){
    let before=s.elapsedMinutes;
    g.advanceSimulation(s,1);
    assert.equal(s.elapsedMinutes,before+1);
  }
}
function fixture(g) {
  const s=g.createNewGame('sandbox','standard',313);
  const m=s.staff.find(p=>p.role==='guard');assert.ok(m);
  s.staff=[m];s.regionFacilities=[];s.scps=[];s.procedures=[];
  s.surfaceRooms=[{ id:'lift',type:'elevator',x:17,y:12,width:4,height:4,
    level:1,condition:100,cleanliness:100,staffAssigned:[],queue:[],upgrades:[],enabled:true,powerPriority:3 }];
  s.minuteOfDay=480;s.speed=1;s.settings.autoPauseCritical=false;
  s.flags['last-random-event']=1e9;s.flags['last-work-spawn']=1e9;s.resources.power=100;
  Object.assign(m,{clearance:5,shift:'day',status:'working',position:{layer:'surface',x:19,y:14},
    target:undefined,targetRoomId:undefined,assignmentRoomId:'destination',taskProgress:0,path:[],pathIndex:0});
  Object.assign(m.needs,{hunger:0,fatigue:0,stress:0,morale:90,health:100,contamination:0});
  const shaft=dig('shaft','elevator-shaft',18,14,0,1);
  const hall=dig('hall','service-tunnel',13,14,0,5);
  const north=dig('north','service-tunnel',13,13,0,3);
  const west=dig('west','service-tunnel',9,13,0,4);
  const destination=dig('destination','safe-containment',7,13,0,2);
  s.undergroundRooms=[shaft,hall,north,west,destination];
  return {s,m,shaft,hall,north,west,destination};
}

test('une construction possède une coordonnée Y : même x/étage sur deux coupes distinctes',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',500);
  s.resources.funds=1e6;s.resources.parts=1e3;
  assert.equal(g.setUndergroundSlice(s,3).ok,true);
  const first=g.buildUndergroundRoom(s,'service-tunnel',0,3);
  assert.equal(first.ok,true,first.message);
  assert.equal(s.undergroundRooms.at(-1).y,3);
  assert.equal(g.buildUndergroundRoom(s,'service-tunnel',0,3).ok,false);
  assert.equal(g.setUndergroundSlice(s,4).ok,true);
  assert.equal(g.buildUndergroundRoom(s,'service-tunnel',0,3).ok,true);
  assert.equal(s.undergroundRooms.at(-1).y,4);
  assert.equal(s.undergroundRooms.filter(r=>r.x===0&&r.level===3&&[3,4].includes(r.y)).length,2);
});

test('les galeries transversales demandent une vraie paroi commune et un chevauchement',()=>{
  const g=engine(),{s,m,shaft,hall,north,west,destination}=fixture(g);
  const route=g.planUndergroundRoute(s,g.undergroundRoomPosition(s,shaft),destination,m);
  assert.deepEqual(plain(route.map(x=>x.id)),['shaft','hall','north','west','destination']);
  assert.equal(g.areUndergroundRoomsConnected(hall,north,s),true);
  north.x=3;
  assert.equal(g.planUndergroundRoute(s,g.undergroundRoomPosition(s,shaft),destination,m),undefined);
  north.x=13;north.y=12;
  assert.equal(g.planUndergroundRoute(s,g.undergroundRoomPosition(s,shaft),destination,m),undefined);
});

test('une habilitation intermédiaire ou un confinement transverse coupe le réseau 3D',()=>{
  const g=engine(),{s,m,shaft,north,destination}=fixture(g);
  m.clearance=1;north.type='security-post';
  assert.equal(g.planUndergroundRoute(s,g.undergroundRoomPosition(s,shaft),destination,m),undefined);
  m.clearance=5;assert.ok(g.planUndergroundRoute(s,g.undergroundRoomPosition(s,shaft),destination,m));
  north.sealed=true;
  assert.equal(g.hasUndergroundElevatorConnection(s,destination,m),false);
  north.sealed=false;
  assert.equal(g.hasUndergroundElevatorConnection(s,destination,m),true);
});

test('marche continue dans X puis Y, sans téléportation vers une autre coupe',()=>{
  const g=engine(),{s,m,destination}=fixture(g);
  let travelInY=false, travelledInX=false;
  for(let i=0;i<120&&!g.staffIsAtUndergroundRoom(m,destination);i++){
    const before=plain(m.position);
    simulate(g,s);
    if(before.layer==='underground'&&m.position.layer==='underground'){
      const dx=Math.abs(before.x-m.position.x);
      const dy=Math.abs((before.sectionY??14)-(m.position.sectionY??14));
      assert.ok(dx<=0.55001 && dy<=0.55001);
      assert.ok(dx<0.00001 || dy<0.00001,'un agent ne coupe pas la roche en diagonale');
      if(dx>0.001) travelledInX=true;
      if(dy>0.001) travelInY=true;
    }
  }
  assert.equal(g.staffIsAtUndergroundRoom(m,destination),true);
  assert.equal(m.position.sectionY,13);
  assert.equal(travelledInX,true);assert.equal(travelInY,true);
});

test('verrouillage pendant la traversée transversale : repli physique côté source',()=>{
  const g=engine(),{s,m,north}=fixture(g);
  for(let i=0;i<80&&!m.undergroundLink;i++)simulate(g,s);
  assert.ok(m.undergroundLink);
  const fromY=m.position.sectionY;
  const beforeId=m.undergroundLink.fromId;
  assert.equal(beforeId,'hall');
  north.sealed=true;
  simulate(g,s);
  assert.ok(Math.abs(m.position.sectionY-fromY)<=.55+1e-7);
  for(let i=0;i<12&&m.undergroundLink;i++)simulate(g,s);
  assert.equal(m.position.sectionY,14);
  assert.equal(m.undergroundLink,undefined);
  assert.equal(m.position.layer,'underground');
});

test('enregistrer au milieu d’une traverse et restaurer la liaison exacte',()=>{
  const g=engine(),{s,m,destination}=fixture(g);
  const other=g.createNewGame('sandbox','standard',8888);
  const scp=other.scps.find(p=>p.definitionId==='scp-173');
  const proc=other.procedures.find(p=>p.scpId==='scp-173');
  assert.ok(scp&&proc);
  scp.contained=true;scp.transferred=true;scp.roomId=destination.id;
  destination.scpId=scp.id;
  s.scps=[scp];s.procedures=[proc];destination.staffAssigned=[m.id];
  for(let i=0;i<80&&!m.undergroundLink;i++)simulate(g,s);
  assert.ok(m.undergroundLink);
  const pending=plain(m.undergroundLink);
  const y=m.position.sectionY;
  const restored=g.importSave(JSON.stringify(s));
  assert.ok(restored);
  const worker=restored.staff.find(p=>p.id===m.id);
  assert.ok(worker);
  assert.deepEqual(plain(worker.undergroundLink),pending);
  assert.equal(worker.position.sectionY,y);
  restored.speed=1;restored.settings.autoPauseCritical=false;
  restored.flags['last-random-event']=1e9;restored.flags['last-work-spawn']=1e9;
  const d=restored.undergroundRooms.find(r=>r.id==='destination');
  for(let i=0;i<80&&!g.staffIsAtUndergroundRoom(worker,d);i++)simulate(g,restored);
  assert.equal(g.staffIsAtUndergroundRoom(worker,d),true);
});

test('un puits doit émerger dans le même X et le même Y que son ascenseur',()=>{
  const g=engine(),{s,shaft}=fixture(g);
  assert.equal(g.getUndergroundPortals(s).length,1);
  shaft.y=3;
  assert.equal(g.getUndergroundPortals(s).length,0);
  s.surfaceRooms[0].y=2;s.surfaceRooms[0].height=4;
  assert.equal(g.getUndergroundPortals(s).length,1);
});

test('passer de surface à une coupe vide ne crée aucune pièce souterraine fictive',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',98);
  const room=s.surfaceRooms.find(r=>r.type==='medical');
  s.selectedType='surface-room';s.selectedId=room.id;s.view='surface';
  g.setView(s,'underground');
  assert.ok(g.getSiteSectionSurfaceY(s)>=room.y && g.getSiteSectionSurfaceY(s)<room.y+room.height);
  assert.equal(s.selectedType,undefined);
  assert.equal(s.undergroundRooms.filter(r=>g.undergroundRoomSectionY(s,r)===g.getSiteSectionSurfaceY(s)).length,0);
});

test('coupe Y : navigation bornée, sélection nettoyée, coupe conservée dans la sauvegarde',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',27);
  const selected=s.undergroundRooms[0];
  s.view='underground';s.selectedType='underground-room';s.selectedId=selected.id;
  assert.equal(g.setUndergroundSlice(s,13).ok,true);
  assert.equal(s.selectedId,undefined);
  assert.equal(g.getSiteSectionSurfaceY(s),13);
  assert.equal(g.setUndergroundSlice(s,99).ok,false);
  assert.equal(g.getSiteSectionSurfaceY(s),13);
  const reload=g.importSave(JSON.stringify(s));assert.ok(reload);
  assert.equal(g.getSiteSectionSurfaceY(reload),13);
});

test('ancienne partie : migration Y=14 et coordonnées d’agents préservées',()=>{
  const g=engine(),s=g.createNewGame('campaign','standard',55);
  for(const r of s.undergroundRooms)delete r.y;
  s.flags['load-schema-version']=3;
  s.flags['underground-slice-y']=undefined;
  const guard=s.staff.find(p=>p.role==='guard');
  guard.position={layer:'underground',x:18.5,y:0,level:0};
  const saved=JSON.stringify(s);
  const reload=g.importSave(saved);assert.ok(reload);
  assert.ok(reload.undergroundRooms.every(r=>r.y===14));
  assert.equal(reload.staff.find(p=>p.id===guard.id).position.sectionY,14);
});

test('la sauvegarde rejette une coordonnée Y corrompue',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',56);
  s.undergroundRooms[0].y=s.surfaceHeight+3;
  assert.equal(g.importSave(JSON.stringify(s)),undefined);
});

test('chaque annexe extérieure fermée possède son plan spécialisé, sans salles dupliquées',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',57);
  const initial=s.surfaceRooms.length;
  for(const f of s.regionFacilities){
    if(!g.isRegionFacilityEnterable(f)){
      assert.equal(g.getAnnexInteriorPlan(s,f),undefined);continue;
    }
    const plan=g.getAnnexInteriorPlan(s,f);
    assert.equal(plan.facilityId,f.id);
    assert.equal(plan.rooms.length,4);
    assert.equal(new Set(plan.rooms.map(z=>z.id)).size,4);
    assert.ok(plan.rooms.every(z=>z.name.length && z.width>0 && z.height>0));
  }
  assert.equal(s.surfaceRooms.length,initial);
});

test('la sélection depuis la ville ouvre la bonne annexe puis retrouve le même bâtiment',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',58);
  const plant=s.regionFacilities.find(f=>f.type==='power-plant');assert.ok(plant);
  s.view='region';s.selectedId=plant.id;s.selectedType='facility';
  assert.equal(g.openAnnexInterior(s,plant.id).ok,true);
  assert.equal(s.activeInteriorFacilityId,plant.id);
  assert.equal(g.getActiveInteriorFacility(s)?.id,plant.id);
  assert.equal(g.getAnnexInteriorPlan(s,plant).rooms[0].name,'Salle des turbines');
  assert.equal(s.selectedType,'facility');
  g.setView(s,'region');
  assert.equal(s.selectedId,plant.id);
  assert.equal(s.activeInteriorFacilityId,undefined);
});

test('la sauvegarde d’une annexe conserve son identité et ses ressources, une annexe disparue est nettoyée',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',59);
  const facility=s.regionFacilities.find(f=>f.type==='water-treatment');
  s.view='region';s.selectedId=facility.id;s.selectedType='facility';
  assert.equal(g.openAnnexInterior(s,facility.id).ok,true);
  s.flags['annex-room-selected']=`${facility.id}:control`;
  const cost=plain(s.resources),snapshot=JSON.stringify(s);
  const loaded=g.importSave(snapshot);assert.ok(loaded);
  assert.equal(loaded.activeInteriorFacilityId,facility.id);
  assert.deepEqual(plain(loaded.resources),cost);
  const lost=plain(s);lost.regionFacilities=lost.regionFacilities.filter(f=>f.id!==facility.id);
  const repaired=g.importSave(JSON.stringify(lost));assert.ok(repaired);
  assert.equal(repaired.activeInteriorFacilityId,undefined);
});

test('mini-plan supérieur : clic sur une autre coupe sélectionne le vrai module',()=>{
  const g=engine(),{s,destination}=fixture(g);
  s.view='underground';s.selectedId=undefined;s.selectedType=undefined;
  assert.equal(g.setUndergroundPlanLevel(s,0).ok,true);
  const width=1200,height=900;
  const uX=width-238+8+(destination.x+.8)/s.undergroundWidth*(218-16);
  const uY=66+26+(destination.y+.5)/s.surfaceHeight*(150-34);
  const runtime={state:s,canvas:{getBoundingClientRect:()=>({left:0,top:0,width,height})}};
  g.selectAtCanvas(runtime,uX,uY);
  assert.equal(g.getSiteSectionSurfaceY(s),13);
  assert.equal(s.selectedId,destination.id);
  assert.equal(g.getUndergroundPlanLevel(s),0);
});

test('une seconde galerie permet un détour après scellement transversal',()=>{
  const g=engine(),{s,m,shaft,north,destination}=fixture(g);
  s.undergroundRooms.push(dig('alternate','service-tunnel',9,14,0,4));
  north.sealed=true;
  const route=g.planUndergroundRoute(s,g.undergroundRoomPosition(s,shaft),destination,m);
  assert.ok(route);
  assert.equal(route.some(r=>r.id==='north'),false);
  assert.ok(route.some(r=>r.id==='alternate'));
  for(let i=0;i<150&&!g.staffIsAtUndergroundRoom(m,destination);i++)simulate(g,s);
  assert.equal(g.staffIsAtUndergroundRoom(m,destination),true);
});

test('une sauvegarde falsifiée ne peut pas déplacer un agent via un faux embranchement',()=>{
  const g=engine(),{s,m}=fixture(g);
  m.position={layer:'underground',x:25,y:0,level:0,sectionY:13.4};
  m.undergroundLink={fromId:'hall',toId:'north',crossingX:25};
  assert.equal(g.importSave(JSON.stringify(s)),undefined);
});


test('le menu Surface reste le Site principal même si une annexe est sélectionnée',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',61);
  const plant=s.regionFacilities.find(f=>f.type==='power-plant');
  s.view='region';s.selectedType='facility';s.selectedId=plant.id;
  g.setView(s,'surface');
  assert.equal(s.view,'surface');
  assert.equal(s.activeInteriorFacilityId,undefined);
  assert.equal(g.getActiveInteriorFacility(s),undefined);
  assert.equal(s.selectedType,undefined);
  g.setView(s,'region');s.selectedType='facility';s.selectedId=plant.id;
  assert.equal(g.openAnnexInterior(s,plant.id).ok,true);
  assert.equal(g.getActiveInteriorFacility(s).id,plant.id);
  g.setView(s,'region');
  assert.equal(s.selectedId,plant.id);
});
