import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1"));
const plain = (value) => JSON.parse(JSON.stringify(value));
function game() {
  const code = readFileSync(join(root, "dist", "game.js"), "utf8");
  const context = {
    console, performance: { now: () => 0 }, navigator: {}, location: { protocol: "http:" },
    window: { matchMedia: () => ({ matches: false }), setTimeout: () => 0, addEventListener: () => undefined },
    document: { readyState: "loading", addEventListener: () => undefined, getElementById: () => null },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.SCPGame;
}
function lift(id="lift",x=17) {
  return { id, type:"elevator",x,y:12,width:4,height:4,level:1,condition:100,cleanliness:100,
    staffAssigned:[],queue:[],upgrades:[],enabled:true,powerPriority:3 };
}
function room(id,type,x,level,width) {
  return {id,type,x,level,width,condition:100,staffAssigned:[],upgrades:[],
    enabled:true,sealed:false,powerPriority:3};
}
function sample(api, depth=0) {
  const state=api.createNewGame("sandbox","standard",654321);
  const member=state.staff.find((item)=>item.role==="guard");
  assert.ok(member);
  state.staff=[member]; state.regionFacilities=[]; state.scps=[]; state.procedures=[];
  state.surfaceRooms=[lift()]; state.minuteOfDay=480; state.speed=1;
  state.settings.autoPauseCritical=false;
  state.flags["last-random-event"]=100000;
  state.flags["last-work-spawn"]=100000;
  state.resources.power=100;
  member.clearance=5; member.shift="day"; member.status="working";
  member.position={layer:"surface",x:19,y:14}; member.target=undefined;
  member.targetRoomId=undefined; member.assignmentRoomId="dest";
  member.taskProgress=0; member.path=[]; member.pathIndex=0;
  Object.assign(member.needs,{fatigue:0,hunger:0,stress:0,morale:90,health:100,contamination:0});
  const shafts=Array.from({length:depth+1},(_,z)=>room("shaft-"+z,"elevator-shaft",18,z,1));
  const tunnels=Array.from({length:depth+1},(_,z)=>room("tunnel-"+z,"service-tunnel",10,z,8));
  const dest=room("dest","safe-containment",8,depth,2);
  dest.staffAssigned=[member.id];
  state.undergroundRooms=[...shafts,...tunnels,dest];
  return {state,member,shafts,tunnels,dest};
}
function tick(api,state,n=1){
  for(let i=0;i<n;i++){
    const t=state.elapsedMinutes;
    api.advanceSimulation(state,1);
    assert.equal(state.elapsedMinutes,t+1);
  }
}

test("aucun trajet ne traverse un vide dans le roc",()=>{
  const api=game(),{state,member,tunnels,dest}=sample(api);
  assert.equal(api.hasUndergroundElevatorConnection(state,dest,member),true);
  state.undergroundRooms=state.undergroundRooms.filter(r=>r!==tunnels[0]);
  assert.equal(api.hasUndergroundElevatorConnection(state,dest,member),false);
  tick(api,state,12);
  assert.equal(member.position.layer,"surface");
  assert.equal(member.status,"queued");
});

test("descente temporisée puis marche à 0,55 case par minute",()=>{
  const api=game(),{state,member,dest}=sample(api);
  tick(api,state);
  assert.equal(member.position.layer,"surface");
  assert.equal(member.target.layer,"underground");
  tick(api,state,3);
  assert.equal(member.position.layer,"surface");
  tick(api,state);
  assert.equal(member.position.layer,"underground");
  assert.equal(member.position.x,18.5);
  let walked=false;
  for(let i=0;i<100&&!api.staffIsAtUndergroundRoom(member,dest);i++){
    const before=plain(member.position);
    tick(api,state);
    if(before.layer==="underground"&&member.position.layer==="underground"
       &&before.x!==member.position.x){
      walked=true;
      assert.ok(Math.abs(member.position.x-before.x)<=0.550001);
    }
  }
  assert.equal(api.staffIsAtUndergroundRoom(member,dest),true);
  assert.equal(member.status,"working");
  assert.equal(walked,true);
});

test("puits manquant ou habilitation insuffisante coupent l'accès",()=>{
  const api=game(),{state,member,dest,shafts,tunnels}=sample(api,2);
  assert.equal(api.hasUndergroundElevatorConnection(state,dest,member),true);
  shafts[1].enabled=false;
  assert.equal(api.hasUndergroundElevatorConnection(state,dest,member),false);
  shafts[1].enabled=true;
  tunnels[2].type="security-post";
  member.clearance=1;
  assert.equal(api.hasUndergroundElevatorConnection(state,dest,member),false);
  member.clearance=2;
  assert.equal(api.hasUndergroundElevatorConnection(state,dest,member),true);
});

test("panne au milieu de la descente: pause et reprise",()=>{
  const api=game(),{state,member,dest}=sample(api);
  tick(api,state,2);
  const progress=member.taskProgress;
  assert.ok(progress>0);
  state.resources.power=0;
  tick(api,state,5);
  assert.equal(member.position.layer,"surface");
  assert.equal(member.taskProgress,progress);
  state.resources.power=100;
  for(let i=0;i<70&&!api.staffIsAtUndergroundRoom(member,dest);i++) tick(api,state);
  assert.equal(api.staffIsAtUndergroundRoom(member,dest),true);
});

test("la sauvegarde mid-ascenseur conserve la destination et la progression",()=>{
  const api=game(),{state,member,dest}=sample(api);
  // On load, real SCP staffing is recomputed, so this is an actual containment
  // assignment, not an orphaned debug assignment to an empty room.
  const authentic=api.createNewGame("sandbox","standard",8877);
  const scp=authentic.scps.find(entry=>entry.definitionId==="scp-173");
  const procedure=authentic.procedures.find(entry=>entry.scpId==="scp-173");
  assert.ok(scp&&procedure);
  scp.contained=true; scp.transferred=true; scp.roomId=dest.id;
  dest.scpId=scp.id;
  state.scps=[scp]; state.procedures=[procedure];
  tick(api,state,3);
  assert.equal(member.position.layer,"surface");
  const resumed=api.importSave(JSON.stringify(state));
  assert.ok(resumed);
  resumed.speed=1;resumed.settings.autoPauseCritical=false;
  resumed.flags["last-random-event"]=100000;
  resumed.flags["last-work-spawn"]=100000;
  const loaded=resumed.staff.find(m=>m.id===member.id);
  const loadedDestination=resumed.undergroundRooms.find(r=>r.id==="dest");
  assert.ok(loaded&&loadedDestination);
  assert.equal(loaded.assignmentRoomId,"dest");
  assert.equal(loaded.taskProgress,member.taskProgress);
  for(let i=0;i<100&&!api.staffIsAtUndergroundRoom(loaded,loadedDestination);i++) tick(api,resumed);
  assert.equal(api.staffIsAtUndergroundRoom(loaded,loadedDestination),true);
});

test("sceller une galerie bloque les agents et la réouverture les libère",()=>{
  const api=game(),{state,member,tunnels,dest}=sample(api);
  assert.equal(api.setUndergroundSeal(state,tunnels[0].id,true).ok,true);
  assert.equal(api.hasUndergroundElevatorConnection(state,dest,member),false);
  tick(api,state,6);
  assert.equal(member.position.layer,"surface");
  assert.equal(api.setUndergroundSeal(state,tunnels[0].id,false).ok,true);
  for(let i=0;i<100&&!api.staffIsAtUndergroundRoom(member,dest);i++) tick(api,state);
  assert.equal(api.staffIsAtUndergroundRoom(member,dest),true);
});

test("deux puits permettent de contourner un axe vertical fermé",()=>{
  const api=game(),{state,member}=sample(api);
  const a0=room("a0","elevator-shaft",2,0,1),a1=room("a1","elevator-shaft",2,1,1);
  const b0=room("b0","elevator-shaft",17,0,1),b1=room("b1","elevator-shaft",17,1,1);
  const middle=room("mid0","service-tunnel",3,0,14);
  const left=room("left","service-tunnel",3,1,6);
  const target=room("target","safe-containment",9,1,2);
  const right=room("right","service-tunnel",11,1,6);
  state.undergroundRooms=[a0,a1,b0,b1,middle,left,target,right];
  state.surfaceRooms=[lift("liftA",0),lift("liftB",15)];
  const origin={layer:"underground",x:2.5,y:0,level:0};
  const first=api.planUndergroundRoute(state,origin,target,member);
  assert.ok(first&&first.some(r=>r.id==="a1"));
  a1.sealed=true;
  const alternate=api.planUndergroundRoute(state,origin,target,member);
  assert.ok(alternate&&alternate.some(r=>r.id==="b1"));
  b1.sealed=true;
  assert.equal(api.planUndergroundRoute(state,origin,target,member),undefined);
});

test("le retour pour manger doit être physique",()=>{
  const api=game(),{state,member,dest}=sample(api,1);
  state.surfaceRooms.push({...lift("canteen",1),type:"canteen",width:5,height:3,y:7});
  member.position={layer:"underground",x:dest.x+dest.width/2,y:1,level:1};
  member.needs.hunger=90;
  tick(api,state,1);
  assert.equal(member.position.layer,"underground");
  let walked=false;
  for(let i=0;i<140&&member.position.layer!=="surface";i++){
    const before=plain(member.position);
    tick(api,state);
    if(before.layer==="underground"&&member.position.layer==="underground"
      &&Math.abs(before.x-member.position.x)>0.001) walked=true;
  }
  assert.equal(walked,true);
  assert.equal(member.position.layer,"surface");
});

test("le personnel absent ne contribue plus à la conformité SCP",()=>{
  const api=game();
  const state=api.createNewGame("sandbox","standard",606);
  const scp=state.scps.find(x=>x.definitionId==="scp-173");
  const dest=state.undergroundRooms.find(x=>x.type==="safe-containment");
  assert.ok(scp&&dest);
  scp.contained=true;scp.roomId=dest.id;scp.transferred=true;dest.scpId=scp.id;
  state.staff.forEach(m=>m.clearance=5);
  api.autoAssignStaff(state);
  const assigned=dest.staffAssigned.map(id=>state.staff.find(m=>m.id===id)).filter(Boolean);
  assert.ok(assigned.length);
  assigned.forEach(m=>{m.status="working";m.position={layer:"surface",x:1,y:1};});
  const before=api.evaluateProcedureCompliance(state,scp);
  assigned.forEach(m=>{m.position={layer:"underground",x:dest.x+dest.width/2,y:dest.level,level:dest.level};});
  const after=api.evaluateProcedureCompliance(state,scp);
  assert.ok(after>before);
});
