import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import vm from 'node:vm';
const root=resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:\/)/,'$1'));
const plain=v=>JSON.parse(JSON.stringify(v));
function loadGame() {
  const context={console,performance:{now:()=>0},navigator:{},location:{protocol:'http:'},
    window:{matchMedia:()=>({matches:false}),setTimeout:()=>0,addEventListener:()=>{}},
    document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},
    localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}};
  vm.createContext(context);vm.runInContext(readFileSync(join(root,'dist/game.js'),'utf8'),context);
  return context.SCPGame;
}
function basic(g){const s=g.createNewGame('sandbox','standard',7373);s.resources.funds=1000000;s.resources.parts=10000;return s;}
function find(s,type){const r=s.undergroundRooms.find(room=>room.type===type);assert.ok(r);return r;}
function connected(g,s,a,b){const line=g.getUndergroundConduitBetween(s,a,b);assert.ok(line);return line;}

test('la fondation initiale possède des conduites physiques entre ses modules réellement contigus',()=>{
  const g=loadGame(),s=basic(g),shaft=find(s,'elevator-shaft'),cell=find(s,'safe-containment');
  assert.ok(s.undergroundConduits.length>=10);
  assert.deepEqual(plain(g.getUndergroundUtilityStatus(s,cell)),{power:true,water:true,air:true});
  for(const line of s.undergroundConduits){
    const a=s.undergroundRooms.find(r=>r.id===line.roomAId),b=s.undergroundRooms.find(r=>r.id===line.roomBId);
    assert.ok(g.undergroundRoomsTouch(s,a,b));
    assert.equal(line.paidFunds,0);assert.equal(line.paidParts,0);
  }
  assert.equal(g.getUndergroundUtilityStatus(s,shaft).power,true);
});

test('un nouveau module ne reçoit pas de l’électricité par une roche non câblée',()=>{
  const g=loadGame(),s=basic(g),shaft=find(s,'elevator-shaft');
  assert.equal(g.buildUndergroundRoom(s,'service-tunnel',19,0,14).ok,true);
  const next=s.undergroundRooms.find(r=>r.x===19&&r.level===0&&r.type==='service-tunnel');
  assert.ok(next&&g.undergroundRoomsTouch(s,shaft,next));
  assert.deepEqual(plain(g.getUndergroundUtilityStatus(s,next)),{power:false,water:false,air:false});
  const funds=s.resources.funds,parts=s.resources.parts;
  assert.equal(g.installUndergroundConduit(s,shaft.id,next.id).ok,true);
  assert.equal(s.resources.funds,funds-850);assert.equal(s.resources.parts,parts-4);
  assert.deepEqual(plain(g.getUndergroundUtilityStatus(s,next)),{power:true,water:true,air:true});
  assert.equal(g.installUndergroundConduit(s,next.id,shaft.id).ok,false);
  assert.equal(s.resources.funds,funds-850);
});

test('chaque vanne isole uniquement son réseau, sans couper le chemin du personnel',()=>{
  const g=loadGame(),s=basic(g),cell=find(s,'safe-containment');
  const upstream=s.undergroundRooms.find(r=>r.level===0&&r.x===5&&r.type==='service-tunnel');
  const line=connected(g,s,cell,upstream),previous=plain(s.resources);
  for(const key of ['power','water','air']){
    assert.equal(g.toggleUndergroundConduit(s,cell.id,upstream.id,key).ok,true);
    assert.equal(g.getUndergroundUtilityStatus(s,cell)[key],false);
    for(const other of ['power','water','air'].filter(v=>v!==key))assert.equal(g.getUndergroundUtilityStatus(s,cell)[other],true);
    assert.equal(g.areUndergroundRoomsConnected(cell,upstream,s),true,'la gaine n’est pas une porte');
    assert.equal(g.toggleUndergroundConduit(s,cell.id,upstream.id,key).ok,true);
    assert.equal(g.getUndergroundUtilityStatus(s,cell)[key],true);
  }
  assert.deepEqual(plain(s.resources),previous,'circuit breakers never consume or refund resources');
  assert.equal(line.paidFunds,0);
});

test('une gaine de ventilation isolée réduit réellement la conformité SCP',()=>{
  const g=loadGame(),s=basic(g),cell=find(s,'safe-containment');
  const upstream=s.undergroundRooms.find(r=>r.level===0&&r.x===5&&r.type==='service-tunnel');
  const scp=s.scps.find(r=>r.definitionId==='scp-173');assert.ok(scp);
  scp.contained=true;scp.transferred=true;scp.roomId=cell.id;cell.scpId=scp.id;
  const baseline=g.evaluateProcedureCompliance(s,scp);
  assert.equal(g.toggleUndergroundConduit(s,cell.id,upstream.id,'air').ok,true);
  const noAir=g.evaluateProcedureCompliance(s,scp);
  assert.ok(noAir<baseline,`ventilation hors ligne: ${baseline} -> ${noAir}`);
  assert.equal(g.toggleUndergroundConduit(s,cell.id,upstream.id,'air').ok,true);
  assert.equal(g.evaluateProcedureCompliance(s,scp),baseline);
  assert.equal(g.toggleUndergroundConduit(s,cell.id,upstream.id,'power').ok,true);
  assert.ok(g.evaluateProcedureCompliance(s,scp)<baseline);
});

test('un sas a besoin de son câble et de la ventilation des deux côtés',()=>{
  const g=loadGame(),s=basic(g),cell=find(s,'safe-containment');
  const tunnel=s.undergroundRooms.find(r=>r.level===0&&r.x===5&&r.type==='service-tunnel');
  assert.equal(g.installUndergroundGate(s,cell.id,tunnel.id,'airlock').ok,true);
  const gate=s.undergroundGates.at(-1);
  assert.ok(g.canTraverseUndergroundGate(s,cell,tunnel));
  g.toggleUndergroundConduit(s,cell.id,tunnel.id,'power');
  assert.equal(g.canTraverseUndergroundGate(s,cell,tunnel),false);
  assert.match(g.getUndergroundGateStatus(s,gate),/circuit électrique/);
  g.toggleUndergroundConduit(s,cell.id,tunnel.id,'power');
  g.toggleUndergroundConduit(s,cell.id,tunnel.id,'air');
  assert.equal(g.canTraverseUndergroundGate(s,cell,tunnel),false);
  assert.match(g.getUndergroundGateStatus(s,gate),/ventilation/);
  g.toggleUndergroundConduit(s,cell.id,tunnel.id,'air');
  assert.equal(g.canTraverseUndergroundGate(s,cell,tunnel),true);
});

test('un secteur scellé conserve ses câbles : la porte n’est pas un coupe-circuit',()=>{
  const g=loadGame(),s=basic(g),cell=find(s,'safe-containment');
  assert.equal(g.setUndergroundSeal(s,cell.id,true).ok,true);
  assert.deepEqual(plain(g.getUndergroundUtilityStatus(s,cell)),{power:true,water:true,air:true});
  assert.equal(g.setUndergroundSeal(s,cell.id,false).ok,true);
});

test('une batterie locale alimente une section isolée même si la Surface est en panne',()=>{
  const g=loadGame(),s=basic(g),battery=find(s,'power-node'),room=find(s,'research-lab');
  const link=connected(g,s,battery,s.undergroundRooms.find(r=>r.level===1&&r.x===13));
  s.flags['surface-blackout']=true;
  assert.equal(g.getUndergroundUtilityStatus(s,battery).power,true);
  assert.equal(g.getUndergroundUtilityStatus(s,room).power,true);
  assert.equal(g.getUndergroundUtilityStatus(s,room).water,true);
  // Water from the surface is not an electrical battery service.
  s.resources.water=0;
  assert.equal(g.getUndergroundUtilityStatus(s,room).water,false);
  assert.equal(link.power,true);
});

test('refuser la pose sans paroi et ne pas facturer un circuit invalide',()=>{
  const g=loadGame(),s=basic(g),cell=find(s,'safe-containment'),air=find(s,'air-filtration');
  const before=plain(s.resources);
  assert.equal(g.installUndergroundConduit(s,cell.id,air.id).ok,false);
  assert.equal(g.installUndergroundConduit(s,'unknown',cell.id).ok,false);
  assert.equal(g.toggleUndergroundConduit(s,cell.id,air.id,'power').ok,false);
  assert.equal(g.toggleUndergroundConduit(s,cell.id,air.id,'bogus').ok,false);
  assert.deepEqual(plain(s.resources),before);
});

test('démontage rembourse seulement la gaine payée, et jamais une seconde fois',()=>{
  const g=loadGame(),s=basic(g),shaft=find(s,'elevator-shaft');
  g.buildUndergroundRoom(s,'service-tunnel',19,0,14);
  const fresh=s.undergroundRooms.find(r=>r.level===0&&r.x===19);
  g.installUndergroundConduit(s,shaft.id,fresh.id);
  const cost=s.resources.funds;
  assert.equal(g.removeUndergroundConduit(s,fresh.id,shaft.id).ok,true);
  assert.equal(s.resources.funds,cost+340);
  assert.equal(g.removeUndergroundConduit(s,shaft.id,fresh.id).ok,false);
  assert.equal(s.resources.funds,cost+340);
});

test('démolir un module non occupé retire les gaines orphelines',()=>{
  const g=loadGame(),s=basic(g),shaft=find(s,'elevator-shaft');
  assert.equal(g.buildUndergroundRoom(s,'service-tunnel',19,0,14).ok,true);
  const fresh=s.undergroundRooms.find(r=>r.level===0&&r.x===19);
  assert.equal(g.installUndergroundConduit(s,shaft.id,fresh.id).ok,true);
  s.selectedType='underground-room';s.selectedId=fresh.id;
  const result=g.demolishSelected(s);assert.equal(result.ok,true,result.message);
  assert.equal(s.undergroundConduits.some(line=>line.roomAId===fresh.id||line.roomBId===fresh.id),false);
});

test('sauvegarder la séparation de trois réseaux et la rétablir à l’import',()=>{
  const g=loadGame(),s=basic(g),cell=find(s,'safe-containment');
  const tunnel=s.undergroundRooms.find(r=>r.level===0&&r.x===5);
  g.toggleUndergroundConduit(s,cell.id,tunnel.id,'water');
  const loaded=g.importSave(JSON.stringify(s));assert.ok(loaded);
  const restoredCell=loaded.undergroundRooms.find(r=>r.id===cell.id);
  const restoredTunnel=loaded.undergroundRooms.find(r=>r.id===tunnel.id);
  assert.equal(g.getUndergroundConduitBetween(loaded,restoredCell,restoredTunnel).water,false);
  assert.equal(g.getUndergroundUtilityStatus(loaded,restoredCell).water,false);
  assert.equal(g.getUndergroundUtilityStatus(loaded,restoredCell).power,true);
});

test('sauvegarde antérieure sans réseau technique : migration déterministe sans paiement',()=>{
  const g=loadGame(),s=basic(g),cell=find(s,'safe-containment');
  delete s.undergroundConduits;s.flags['load-schema-version']=5;
  const recovered=g.importSave(JSON.stringify(s));assert.ok(recovered);
  const oldLinks=recovered.undergroundConduits;
  assert.ok(oldLinks.length>0);
  assert.equal(oldLinks.every(x=>x.paidFunds===0&&x.paidParts===0),true);
  assert.equal(g.getUndergroundUtilityStatus(recovered,recovered.undergroundRooms.find(r=>r.id===cell.id)).power,true);
  assert.equal(recovered.flags['load-schema-version'],6);
});

test('les liens falsifiés (ID, doublon, paiement, types et géométrie) sont rejetés',()=>{
  const g=loadGame(),s=basic(g),snapshot=JSON.stringify(s);
  const corrupt=change=>{const candidate=JSON.parse(snapshot);change(candidate);return g.importSave(JSON.stringify(candidate));};
  assert.equal(corrupt(x=>{x.undergroundConduits[0].roomAId='ghost';}),undefined);
  assert.equal(corrupt(x=>{x.undergroundConduits.push({...x.undergroundConduits[0]});}),undefined);
  assert.equal(corrupt(x=>{x.undergroundConduits[0].power='yes';}),undefined);
  assert.equal(corrupt(x=>{x.undergroundConduits[0].paidFunds=1000000;}),undefined);
  assert.equal(corrupt(x=>{x.undergroundConduits[0].roomBId=x.undergroundConduits[0].roomAId;}),undefined);
  assert.equal(corrupt(x=>{x.undergroundConduits[0].roomBId='not-a-neighbour';}),undefined);
  assert.equal(corrupt(x=>{x.flags['load-schema-version']=7;}),undefined);
  assert.ok(g.importSave(snapshot));
});


test('une voie de secours X/Y continue d’alimenter une cellule après coupure du circuit direct',()=>{
  const g=loadGame(),s=basic(g);
  const room=(id,type,x,y,width)=>({id,type,x,y,level:0,width,condition:100,
    enabled:true,sealed:false,powerPriority:2,staffAssigned:[],upgrades:[]});
  const shaft=room('source','elevator-shaft',18,14,1),a=room('a','service-tunnel',15,14,3),
    b=room('b','safe-containment',12,14,3),c=room('c','service-tunnel',12,13,3),
    d=room('d','service-tunnel',15,13,3);
  s.undergroundRooms=[shaft,a,b,c,d];
  s.undergroundConduits=g.createLegacyUndergroundConduits(s);
  assert.equal(g.getUndergroundUtilityStatus(s,b).power,true);
  g.toggleUndergroundConduit(s,a.id,b.id,'power');
  assert.equal(g.getUndergroundUtilityStatus(s,b).power,true,'énergie par la galerie transversale de secours');
  g.toggleUndergroundConduit(s,c.id,b.id,'power');
  assert.equal(g.getUndergroundUtilityStatus(s,b).power,false,'les deux trajets ont été coupés');
  g.toggleUndergroundConduit(s,c.id,b.id,'power');
  assert.equal(g.getUndergroundUtilityStatus(s,b).power,true);
});

test('les laboratoires profonds ne produisent plus de recherche hors réseau',()=>{
  const g=loadGame(),s=basic(g),lab=find(s,'research-lab');
  const links=s.undergroundConduits.filter(x=>x.roomAId===lab.id||x.roomBId===lab.id);
  const raw=JSON.stringify(s),controlled=g.importSave(raw);assert.ok(controlled);
  for(const room of s.surfaceRooms)if(['research','laboratory','archive'].includes(room.type))room.enabled=false;
  for(const room of controlled.surfaceRooms)if(['research','laboratory','archive'].includes(room.type))room.enabled=false;
  s.speed=1;controlled.speed=1;
  s.settings.autoPauseCritical=false;controlled.settings.autoPauseCritical=false;
  s.flags['last-work-spawn']=1e9;controlled.flags['last-work-spawn']=1e9;
  s.flags['last-random-event']=1e9;controlled.flags['last-random-event']=1e9;
  const beforeResearch=s.resources.research;
  for(const line of links){
    const otherId=line.roomAId===lab.id?line.roomBId:line.roomAId;
    g.toggleUndergroundConduit(s,lab.id,otherId,'power');
  }
  assert.equal(g.getUndergroundUtilityStatus(s,lab).power,false);
  g.advanceSimulation(s,60);g.advanceSimulation(controlled,60);
  assert.ok(controlled.resources.research>s.resources.research,
    `avec réseau ${controlled.resources.research} vs sans ${s.resources.research}`);
  assert.ok(s.resources.research>=beforeResearch);
});

test('un état du nouveau schéma qui retire ses circuits ne peut pas se faire passer pour un ancien',()=>{
  const g=loadGame(),s=basic(g);
  const current=JSON.parse(JSON.stringify(s));delete current.undergroundConduits;
  assert.equal(g.importSave(JSON.stringify(current)),undefined);
  current.flags['load-schema-version']=5;
  assert.ok(g.importSave(JSON.stringify(current)), 'une véritable ancienne version sans circuits est migrée');
});
