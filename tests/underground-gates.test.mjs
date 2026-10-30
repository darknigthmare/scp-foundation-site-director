import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import vm from 'node:vm';

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:\/)/, '$1'));
const plain = v => JSON.parse(JSON.stringify(v));

function loadGame() {
  const source = readFileSync(join(root, 'dist', 'game.js'), 'utf8');
  const ctx = { console, performance: { now: () => 0 }, navigator: {}, location: { protocol: 'http:' },
    window: { matchMedia: () => ({ matches: false }), setTimeout: () => 0, addEventListener: () => {} },
    document: { readyState: 'loading', addEventListener: () => {}, getElementById: () => null },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
  vm.createContext(ctx); vm.runInContext(source, ctx); return ctx.SCPGame;
}
function room(id, type, x, y, width = 2) {
  return { id, type, x, y, width, level: 0, condition: 100,
    staffAssigned: [], upgrades: [], enabled: true, sealed: false, powerPriority: 2 };
}
function fixture(api, crossing = 'x', twoStaff = false, actualScp = false) {
  const state = api.createNewGame('sandbox', 'standard', 9082);
  const a = room('hall-a', 'service-tunnel', 5, 14, 3);
  const b = room('cell-b', 'safe-containment', crossing === 'x' ? 8 : 5, crossing === 'x' ? 14 : 15, 3);
  // A real supply circuit: emergency battery -> filter -> hall -> cell.
  // Gate tests must not depend on invented global air/electrical service.
  const battery = room('battery', 'power-node', 3, 14, 2);
  const filter = room('filter', 'air-filtration', 1, 14, 2);
  state.undergroundRooms = [filter, battery, a, b];
  state.undergroundConduits = api.createLegacyUndergroundConduits(state);
  const guards = state.staff.filter(m => m.role === 'guard').slice(0, twoStaff ? 2 : 1);
  assert.equal(guards.length, twoStaff ? 2 : 1);
  state.staff = guards;
  guards.forEach((m, i) => {
    m.clearance = 5; m.shift = 'day'; m.status = 'working';
    m.position = { layer: 'underground', x: 6.5, y: 0, level: 0, sectionY: 14 };
    m.target = undefined; m.targetRoomId = undefined; m.path = []; m.pathIndex = 0;
    m.assignmentRoomId = b.id; m.undergroundLink = undefined;
    Object.assign(m.needs, { hunger: 0, fatigue: 0, stress: 0, morale: 90, health: 100, contamination: 0 });
  });
  state.minuteOfDay = 480; state.speed = 1; state.settings.autoPauseCritical = false;
  state.flags['last-random-event'] = 999999; state.flags['last-work-spawn'] = 999999;
  state.resources.power = 100; state.resources.funds = 999999; state.resources.parts = 999;
  if (actualScp) {
    const scp = state.scps.find(x => x.definitionId === 'scp-173');
    scp.roomId = b.id; scp.contained = true; scp.transferred = true; b.scpId = scp.id;
    api.autoAssignStaff(state);
    assert.ok(state.staff.some(m => m.assignmentRoomId === b.id));
  } else { state.scps = []; state.procedures = []; }
  return { state, a, b, guards };
}
function tick(g, s, count=1) {for(let i=0;i<count;i++){const before=s.elapsedMinutes;g.advanceSimulation(s,1);assert.equal(s.elapsedMinutes,before+1);}}
function route(g,s,a,b,member){return g.planUndergroundRoute(s,g.undergroundRoomPosition(s,a),b,member);}

test('installer une porte prélève le prix exact et empêche les doublons ou la roche traversée',()=>{
  const g=loadGame(),{state,a,b}=fixture(g);
  const funds=state.resources.funds, parts=state.resources.parts;
  assert.equal(g.installUndergroundGate(state,a.id,b.id,'door').ok,true);
  assert.equal(state.resources.funds,funds-650);
  assert.equal(state.resources.parts,parts-2);
  assert.equal(state.undergroundGates.length,1);
  assert.equal(g.installUndergroundGate(state,b.id,a.id,'door').ok,false);
  assert.equal(state.resources.funds,funds-650);
  b.x=12;
  assert.equal(g.installUndergroundGate(state,a.id,b.id,'airlock').ok,false);
});

test('une porte suit habilitation, verrouillage et sens de circulation, sans changement de grille',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g);
  const m=guards[0];
  assert.equal(g.installUndergroundGate(state,a.id,b.id,'door').ok,true);
  const gate=state.undergroundGates[0];
  assert.ok(route(g,state,a,b,m));
  assert.equal(g.configureUndergroundGate(state,gate.id,{minClearance:4}).ok,true);
  m.clearance=3;assert.equal(route(g,state,a,b,m),undefined);
  m.clearance=5;
  assert.equal(g.configureUndergroundGate(state,gate.id,{direction:'a-to-b'}).ok,true);
  assert.ok(route(g,state,a,b,m));
  assert.equal(route(g,state,b,a,m),undefined);
  assert.equal(g.configureUndergroundGate(state,gate.id,{enabled:false}).ok,true);
  assert.equal(route(g,state,a,b,m),undefined);
  assert.equal(g.configureUndergroundGate(state,gate.id,{enabled:true,direction:'both'}).ok,true);
  assert.ok(route(g,state,b,a,m));
});

test('un sas suspend le personnel pendant 4 minutes, puis traverse à vitesse physique',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g);
  assert.equal(g.installUndergroundGate(state,a.id,b.id,'airlock').ok,true);
  const m=guards[0], gate=state.undergroundGates[0];
  tick(g,state);
  assert.equal(gate.cycle?.phase,'equalizing');
  assert.equal(m.position.x,6.5);
  tick(g,state,4);
  assert.equal(gate.cycle?.phase,'crossing');
  assert.equal(m.position.x,6.5);
  let moved=false;
  for(let i=0;i<30&&gate.cycle;i++){
    const prev=plain(m.position);
    tick(g,state);
    const dx=Math.abs(m.position.x-prev.x),dy=Math.abs((m.position.sectionY??14)-(prev.sectionY??14));
    assert.ok(dx+dy<=0.550001,'le sas ne téléporte pas un occupant');
    if(dx+dy>0) moved=true;
  }
  assert.ok(moved);
  assert.equal(gate.cycle,undefined);
  assert.equal(gate.passedCount,1);
  assert.equal(g.staffIsAtUndergroundRoom(m,b),true);
});

test('un sas limite la concurrence : file FIFO et un seul occupant à la fois',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g,'x',true);
  assert.equal(g.installUndergroundGate(state,a.id,b.id,'airlock').ok,true);
  const gate=state.undergroundGates[0];
  tick(g,state,2);
  assert.equal(gate.cycle?.staffId,guards[0].id);
  assert.deepEqual(plain(gate.queue),[guards[1].id]);
  assert.equal(gate.passedCount,0);
  for(let i=0;i<45&&gate.passedCount<2;i++)tick(g,state);
  assert.equal(gate.passedCount,2);
  assert.equal(gate.cycle,undefined);
  assert.deepEqual(plain(gate.queue),[]);
  assert.ok(guards.every(m=>g.staffIsAtUndergroundRoom(m,b)));
});

test('la coupure de courant et la perte d’air interrompent le cycle sans le réinitialiser',()=>{
  const g=loadGame(),{state,a,b}=fixture(g);
  assert.equal(g.installUndergroundGate(state,a.id,b.id,'airlock').ok,true);
  const gate=state.undergroundGates[0];
  tick(g,state,2);
  const previous=gate.cycle.remaining;
  gate.powered=false;tick(g,state,3);
  assert.equal(gate.cycle.remaining,previous);
  gate.powered=true;gate.airSupply=false;tick(g,state,3);
  assert.equal(gate.cycle.remaining,previous);
  gate.airSupply=true;tick(g,state,1);
  assert.equal(gate.cycle.remaining,previous-1);
});

test('fermer un sas après admission impose un retour progressif et ne compte aucun passage',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g);
  g.installUndergroundGate(state,a.id,b.id,'airlock');
  const gate=state.undergroundGates[0],m=guards[0];
  tick(g,state,7);
  assert.equal(gate.cycle?.phase,'crossing');
  const moved=m.position.x;
  assert.ok(moved>6.5);
  assert.equal(g.configureUndergroundGate(state,gate.id,{enabled:false}).ok,true);
  for(let i=0;i<25&&gate.cycle;i++){
    const before=m.position.x;tick(g,state);
    assert.ok(Math.abs(m.position.x-before)<=0.550001);
  }
  assert.equal(gate.cycle,undefined);
  assert.equal(m.position.x,6.5);
  assert.equal(gate.passedCount,0);
  assert.equal(m.status,'queued');
});

test('un sas transverse Y relie les coupes adjacentes sans saut spatial',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g,'y');
  g.installUndergroundGate(state,a.id,b.id,'airlock');
  const gate=state.undergroundGates[0],m=guards[0];
  assert.ok(route(g,state,a,b,m));
  for(let i=0;i<35&&gate.passedCount<1;i++){
    const before=plain(m.position);
    tick(g,state);
    const moved=Math.abs(m.position.x-before.x)+Math.abs((m.position.sectionY??14)-(before.sectionY??14));
    assert.ok(moved<=0.550001);
  }
  assert.equal(gate.passedCount,1);
  assert.equal(m.position.sectionY,15);
  assert.equal(g.staffIsAtUndergroundRoom(m,b),true);
});

test('une sauvegarde au milieu d’un sas conserve l’occupant, la progression et les tarifs',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g,'x',false,true);
  g.installUndergroundGate(state,a.id,b.id,'airlock');
  tick(g,state,3);
  const gate=state.undergroundGates[0];
  const snapshot=plain(gate.cycle);
  assert.ok(snapshot);
  const loaded=g.importSave(JSON.stringify(state));
  assert.ok(loaded);
  const loadedGate=loaded.undergroundGates[0];
  assert.deepEqual(plain(loadedGate.cycle),snapshot);
  assert.equal(loadedGate.paidFunds,2600);
  loaded.speed=1;loaded.settings.autoPauseCritical=false;
  loaded.flags['last-random-event']=999999;loaded.flags['last-work-spawn']=999999;
  for(let i=0;i<40&&loadedGate.passedCount<1;i++)tick(g,loaded);
  assert.equal(loadedGate.passedCount,1);
  assert.equal(loadedGate.cycle,undefined);
});

test('les références de sas forgées, les cycles hors réseau et le schéma futur sont refusés',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g);
  g.installUndergroundGate(state,a.id,b.id,'airlock');
  const original=JSON.stringify(state);
  const corrupt=(change)=>{const v=JSON.parse(original);change(v);return g.importSave(JSON.stringify(v));};
  assert.equal(corrupt(v=>{v.undergroundGates[0].roomBId='missing';}),undefined);
  assert.equal(corrupt(v=>{v.undergroundGates[0].paidFunds=5000000;}),undefined);
  assert.equal(corrupt(v=>{v.undergroundGates[0].minClearance=7;}),undefined);
  assert.equal(corrupt(v=>{v.undergroundGates[0].queue=['missing-staff'];}),undefined);
  assert.equal(corrupt(v=>{v.undergroundGates.push({...v.undergroundGates[0],id:'duplicate'});}),undefined);
  assert.equal(corrupt(v=>{v.flags['load-schema-version']=7;}),undefined);
  assert.equal(g.importSave(original)?.undergroundGates?.length,1);
});

test('démolir un module nettoie ses accès, mais refuse un sas occupé ou du personnel présent',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g);
  g.installUndergroundGate(state,a.id,b.id,'airlock');
  state.selectedType='underground-room';state.selectedId=b.id;
  tick(g,state);
  const refused=g.demolishSelected(state);
  assert.equal(refused.ok,false);
  assert.match(refused.message,/sas actifs/);
  g.evacuateUndergroundGate(state,state.undergroundGates[0].id);
  const removed=g.demolishSelected(state);
  assert.equal(removed.ok,true,removed.message);
  assert.equal(state.undergroundGates.length,0);
});

test('un sas vide peut être démonté avec remboursement plafonné, sans double-remboursement',()=>{
  const g=loadGame(),{state,a,b}=fixture(g);
  g.installUndergroundGate(state,a.id,b.id,'airlock');
  const gate=state.undergroundGates[0],funds=state.resources.funds;
  assert.equal(g.removeUndergroundGate(state,gate.id).ok,true);
  assert.equal(state.resources.funds,funds+1040);
  assert.equal(g.removeUndergroundGate(state,gate.id).ok,false);
  assert.equal(state.resources.funds,funds+1040);
});

test('une porte fermée au milieu du pas empêche le franchissement fantôme',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g);
  g.installUndergroundGate(state,a.id,b.id,'door');
  const gate=state.undergroundGates[0],m=guards[0];
  tick(g,state);assert.equal(gate.cycle?.phase,'crossing');
  tick(g,state);assert.ok(m.position.x>6.5);
  g.configureUndergroundGate(state,gate.id,{enabled:false});
  for(let i=0;i<15&&gate.cycle;i++){
    const before=m.position.x;tick(g,state);
    assert.ok(Math.abs(m.position.x-before)<=0.550001);
  }
  assert.equal(gate.cycle,undefined);
  assert.equal(gate.passedCount,0);
  assert.equal(m.position.x,6.5);
  tick(g,state,7);
  assert.equal(m.position.x,6.5);
});

test('une porte peut être sauvegardée pendant le pas et terminée sans doublon',()=>{
  const g=loadGame(),{state,a,b,guards}=fixture(g,'x',false,true);
  g.installUndergroundGate(state,a.id,b.id,'door');
  tick(g,state,2);
  assert.equal(state.undergroundGates[0].cycle?.phase,'crossing');
  const loaded=g.importSave(JSON.stringify(state));assert.ok(loaded);
  loaded.speed=1;
  const gate=loaded.undergroundGates[0];
  for(let i=0;i<30&&gate.passedCount<1;i++)tick(g,loaded);
  assert.equal(gate.passedCount,1);
  assert.equal(gate.cycle,undefined);
});
