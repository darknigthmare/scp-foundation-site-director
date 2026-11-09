import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import vm from 'node:vm';

const root=resolve(new URL('..',import.meta.url).pathname.replace(/^\/(.:\/)/,'$1'));
const simple=x=>JSON.parse(JSON.stringify(x));
function engine(){
  const ns={console,performance:{now:()=>0},navigator:{},location:{protocol:'http:'},
    window:{matchMedia:()=>({matches:false}),setTimeout:()=>0,addEventListener:()=>{}},
    document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},
    localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}};
  vm.createContext(ns);vm.runInContext(readFileSync(join(root,'dist/game.js'),'utf8'),ns);
  return ns.SCPGame;
}
function fixture(g,id){
  const s=g.createNewGame('sandbox','standard',73811);
  s.resources.funds=100000;s.resources.parts=500;
  s.resources.medical=150;s.resources.food=150;s.resources.chemicals=150;s.resources.intel=150;
  s.settings.autoPauseCritical=false;
  s.minuteOfDay=480;s.speed=1;
  s.flags['last-work-spawn']=1000000;s.flags['last-random-event']=1000000;
  const scp=s.scps.find(x=>x.definitionId===id), room=s.undergroundRooms.find(x=>x.type==='safe-containment');
  assert.ok(scp && room);
  s.scps=[scp];scp.discovered=true;scp.contained=true;scp.transferred=true;scp.roomId=room.id;
  room.scpId=scp.id;
  const proc=s.procedures.find(x=>x.id===scp.procedureId);
  assert.ok(proc);s.procedures=[proc];
  const tunnel=s.undergroundRooms.find(x=>x.type==='service-tunnel' && x.x===5 && x.level===0);
  assert.ok(tunnel);const link=g.getUndergroundConduitBetween(s,room,tunnel);assert.ok(link);
  assert.deepEqual(simple(g.getUndergroundUtilityStatus(s,room)),{power:true,water:true,air:true});
  return {s,scp,room,proc,tunnel,link};
}
function placeStaff(s,room,number=1,role){
  const matches=s.staff.filter(m=>!role||m.role===role).slice(0,number);
  assert.equal(matches.length,number);
  matches.forEach(m=>{
    m.position={layer:'underground',x:room.x+room.width/2,y:room.level,level:room.level,sectionY:room.y};
    m.status='working';m.shift='day';m.assignmentRoomId=room.id;
    Object.assign(m.needs,{hunger:0,fatigue:0,stress:40,morale:60,health:100,contamination:0});
  });
  return matches;
}

const ids=['scp-173','scp-096','scp-049','scp-106','scp-939','scp-914','scp-294','scp-682','scp-999','scp-131','scp-087','scp-008'];
test('matrice exhaustive : une seule entrée par SCP réellement inclus, sans faux ID',()=>{
  const g=engine(),s=g.createNewGame('sandbox','standard',99);
  assert.deepEqual(simple(Object.keys(g.SCP_BEHAVIOR_PROFILES).sort()),simple(s.scps.map(x=>x.definitionId).sort()));
  assert.equal(new Set(ids).size,12);
  for(const id of ids){
    const profile=g.SCP_BEHAVIOR_PROFILES[id];
    assert.ok(profile&&profile.domain&&profile.protocol&&profile.source&&profile.response);
    assert.match(profile.source,new RegExp('/'+id+'$'));
    for(const service of ['power','water','air']){
      const fault=profile[service];
      assert.ok(fault.effect.length>35);
      assert.ok(fault.compliance>=0&&fault.hourlyPressure>=0);
      assert.ok(fault.studyMultiplier>=0&&fault.studyMultiplier<=1);
    }
  }
});
for(const id of ids){
  for(const service of ['power','water','air']){
    test(`${id} : panne ${service} isolée = diagnostic et pression propres au SCP`,()=>{
      const g=engine(),{s,scp,room,tunnel}=fixture(g,id);
      const before=g.inspectSCPBehavior(s,scp);
      assert.ok(before&&before.profile.id===id);
      const original=before.hourlyPressure;
      const op=g.toggleUndergroundConduit(s,room.id,tunnel.id,service);
      assert.equal(op.ok,true);
      const after=g.inspectSCPBehavior(s,scp);
      const rule=g.SCP_BEHAVIOR_PROFILES[id][service];
      assert.equal(after.utilities[service],false);
      assert.ok(after.faults.find(f=>f.service===service&&f.effect===rule.effect));
      assert.ok(Math.abs(after.hourlyPressure-original-rule.hourlyPressure)<1e-7);
      assert.equal(g.toggleUndergroundConduit(s,room.id,tunnel.id,service).ok,true);
      assert.equal(g.inspectSCPBehavior(s,scp).utilities[service],true);
    });
  }
}
test('SCP-914 : le ressort reste mécanique sans électricité, mais étude et essais s’arrêtent',()=>{
  const g=engine(),{s,scp,room,tunnel,proc}=fixture(g,'scp-914');
  proc.restrictedTesting=true;placeStaff(s,room);
  assert.equal(g.inspectSCPBehavior(s,scp).mechanismOperational,true);
  g.toggleUndergroundConduit(s,room.id,tunnel.id,'power');
  const report=g.inspectSCPBehavior(s,scp);
  assert.equal(report.mechanismOperational,true);
  assert.equal(report.studyMultiplier,0);
  assert.equal(report.profile.power.hourlyPressure,0);
  assert.equal(g.getSCPResponseAvailability(s,scp).ok,false);
});
test('SCP-294 : pas de dépendance magique à l’eau du Site pour fournir un liquide anormal',()=>{
  const g=engine(),{s,scp,room,tunnel,proc}=fixture(g,'scp-294');
  proc.restrictedTesting=true;
  placeStaff(s,room,2,'guard').forEach(m=>m.clearance=3);
  placeStaff(s,room,1,'researcher');
  assert.equal(g.getSCPResponseAvailability(s,scp).ok,true);
  g.toggleUndergroundConduit(s,room.id,tunnel.id,'water');
  assert.equal(g.inspectSCPBehavior(s,scp).utilities.water,false);
  assert.equal(g.getSCPResponseAvailability(s,scp).ok,true);
  assert.ok(g.performSCPResponse(s,scp.id).ok);
});
test('SCP-008 : aucune infection aérienne ni hydrique automatique en cas de panne',()=>{
  const g=engine(),{s,scp,room,tunnel}=fixture(g,'scp-008');
  const exposed=placeStaff(s,room,1,'medic')[0];
  const before=exposed.needs.contamination;
  g.toggleUndergroundConduit(s,room.id,tunnel.id,'water');
  g.toggleUndergroundConduit(s,room.id,tunnel.id,'air');
  assert.equal(g.getSCPResponseAvailability(s,scp).ok,false);
  const report=g.inspectSCPBehavior(s,scp);
  assert.ok(report.faults.some(f=>f.service==='water'));
  assert.ok(report.faults.some(f=>f.service==='air'));
  assert.equal(exposed.needs.contamination,before);
  assert.match(report.profile.air.effect,/n'est pas aérien/);
});
test('SCP-682 : un simple circuit acide sur un autre niveau ne suffit pas',()=>{
  const g=engine(),{s,scp,room}=fixture(g,'scp-682');
  const fake=s.undergroundRooms.find(x=>x.type==='acid-system');
  if(fake){fake.y=0;fake.level=0;fake.x=19;}
  assert.equal(g.scp682HasWorkingAcidFeed(s,room),false);
  const acid={id:'acid-live',type:'acid-system',x:0,y:room.y,level:0,width:2,condition:100,
    enabled:true,sealed:false,staffAssigned:[],upgrades:[],powerPriority:2};
  s.undergroundRooms.push(acid);
  assert.equal(g.scp682HasWorkingAcidFeed(s,room),false,'no paid conduit, no acid feed');
  assert.equal(g.installUndergroundConduit(s,room.id,acid.id).ok,true);
  assert.equal(g.scp682HasWorkingAcidFeed(s,room),true);
  const before=g.inspectSCPBehavior(s,scp);
  assert.equal(before.acidFeedOperational,true);
  g.toggleUndergroundConduit(s,room.id,acid.id,'power');
  assert.equal(g.scp682HasWorkingAcidFeed(s,room),false);
  assert.ok(g.inspectSCPBehavior(s,scp).hourlyPressure>before.hourlyPressure);
});
test('SCP-131 : le bonus d’observation SCP-173 exige une réelle proximité sur la même coupe',()=>{
  const g=engine(),{s,scp,room,tunnel}=fixture(g,'scp-173');
  const eyes=g.createNewGame('sandbox','standard',223);
  const extra=eyes.scps.find(x=>x.definitionId==='scp-131');
  const proc=eyes.procedures.find(x=>x.id===extra.procedureId);
  proc.humaneCare=true;
  extra.contained=true;extra.roomId=tunnel.id;
  s.scps.push(extra);s.procedures.push(proc);
  assert.equal(g.scp131CanAssist173(s,room),true);
  const first=g.evaluateProcedureCompliance(s,scp);
  tunnel.y=13;
  assert.equal(g.scp131CanAssist173(s,room),false);
  assert.ok(g.evaluateProcedureCompliance(s,scp)<first);
});
test('SCP-999 : une visite ne soigne pas à distance le personnel d’un autre bâtiment',()=>{
  const g=engine(),{s,scp,room,proc}=fixture(g,'scp-999');
  const [near]=placeStaff(s,room);
  const far=s.staff.find(m=>m.id!==near.id);
  Object.assign(far.needs,{stress:44,morale:54});
  far.position={layer:'surface',x:1,y:1};
  proc.humaneCare=true;
  const before={near:simple(near.needs),far:simple(far.needs)};
  const out=g.performSCPResponse(s,scp.id);
  assert.equal(out.ok,true,out.message);
  assert.equal(near.needs.stress,before.near.stress-8);
  assert.equal(near.needs.morale,before.near.morale+10);
  assert.equal(far.needs.stress,before.far.stress);
  assert.equal(far.needs.morale,before.far.morale);
});
test('SCP-131 : le recensement horaire est un ordre à renouveler dans le vrai délai',()=>{
  const g=engine(),{s,scp}=fixture(g,'scp-131');
  assert.ok(g.inspectSCPBehavior(s,scp).faults.some(f=>/Recensement/.test(f.effect)));
  assert.equal(g.performSCPResponse(s,scp.id).ok,true);
  assert.ok(!g.inspectSCPBehavior(s,scp).faults.some(f=>/Recensement/.test(f.effect)));
  s.elapsedMinutes+=60;
  assert.equal(g.getSCPResponseAvailability(s,scp).ok,true);
  s.elapsedMinutes+=1;
  assert.ok(g.inspectSCPBehavior(s,scp).faults.some(f=>/Recensement/.test(f.effect)));
});
test('SCP-096 : la consignation met fin à l’optique, consomme les ressources, versionne la procédure',()=>{
  const g=engine(),{s,scp,proc}=fixture(g,'scp-096');
  const funds=s.resources.funds, version=proc.version;
  assert.equal(proc.opticalMonitoring,false,'default profile forbids optics');
  proc.opticalMonitoring=true;
  assert.ok(g.inspectSCPBehavior(s,scp).faults.some(f=>/Surveillance optique/.test(f.effect)));
  const result=g.performSCPResponse(s,scp.id);
  assert.equal(result.ok,true,result.message);
  assert.equal(proc.opticalMonitoring,false);
  assert.equal(proc.version,version+1);
  assert.equal(s.resources.funds,funds-100);
  assert.equal(g.getSCPResponseAvailability(s,scp).ok,false);
});
test('SCP-087 : protocole interdit les expéditions, sans inventer une sortie de gameplay',()=>{
  const g=engine(),{s,scp,proc}=fixture(g,'scp-087');
  assert.equal(proc.restrictedTesting,false);
  assert.ok(g.inspectSCPBehavior(s,scp).faults.some(f=>/exploration/.test(f.effect)));
  assert.equal(g.performSCPResponse(s,scp.id).ok,true);
  assert.equal(proc.restrictedTesting,true);
  assert.ok(!g.inspectSCPBehavior(s,scp).faults.some(f=>/exploration/.test(f.effect)));
});
test('SCP-914 : seuls les essais payés et autorisés créent des pièces',()=>{
  const g=engine(),{s,scp,room,proc}=fixture(g,'scp-914');
  placeStaff(s,room,2,'guard');placeStaff(s,room,1,'researcher');proc.restrictedTesting=true;
  const funds=s.resources.funds,parts=s.resources.parts,research=s.resources.research;
  const out=g.performSCPResponse(s,scp.id);
  assert.equal(out.ok,true,out.message);
  assert.equal(s.resources.parts,parts+1,'2 pièces absorbées pour 3 produites');
  assert.equal(s.resources.funds,funds-150);
  assert.equal(s.resources.research,research+1.5);
  assert.equal(g.performSCPResponse(s,scp.id).ok,false,'no infinite resource farming');
});
test('réponses propres aux 12 SCP, sans coût débité en cas d’échec',()=>{
  const g=engine();
  for(const id of ids){
    const {s,scp,room,proc}=fixture(g,id);
    proc.humaneCare=true;
    proc.restrictedTesting=true;
    placeStaff(s,room,1);
    const before=simple(s.resources);
    // Not all protocols are immediately possible: check their precondition first.
    const available=g.getSCPResponseAvailability(s,scp);
    const result=g.performSCPResponse(s,scp.id);
    assert.equal(result.ok,available.ok,id+': '+result.message);
    if(!available.ok)assert.deepEqual(simple(s.resources),before,id+' failed protocol must be atomic');
    else assert.equal(g.getSCPResponseAvailability(s,scp).ok,false,id+' cooldown');
  }
});
test('la sauvegarde préserve le délai d’intervention sans nouveau schéma',()=>{
  const g=engine(),{s,scp}=fixture(g,'scp-131');
  assert.equal(g.performSCPResponse(s,scp.id).ok,true);
  const saved=g.importSave(JSON.stringify(s));
  assert.ok(saved);
  const restored=saved.scps.find(x=>x.id===scp.id);
  assert.ok(restored);
  assert.equal(g.getSCPResponseAvailability(saved,restored).ok,false);
  assert.equal(saved.flags[`scp-131-census:${scp.id}:at`],0);
  assert.equal(saved.flags[`scp-response:${scp.id}:at`],0);
});

for(const id of ids){
  test(`${id} : son intervention opérationnelle propre peut aboutir avec les prérequis réels`,()=>{
    const g=engine(),{s,scp,room,proc}=fixture(g,id);
    proc.humaneCare=true;proc.restrictedTesting=true;
    proc.observationLevel=90;
    if(id==='scp-173')placeStaff(s,room,3);
    if(id==='scp-999')placeStaff(s,room,1);
    if(id==='scp-914'){
      placeStaff(s,room,2,'guard');placeStaff(s,room,1,'researcher');
    }
    if(id==='scp-294'){
      placeStaff(s,room,2,'guard').forEach(m=>m.clearance=3);
      placeStaff(s,room,1,'researcher');
    }
    if(id==='scp-682'){
      const acid={id:'acid-safety',type:'acid-system',x:0,y:room.y,level:0,width:2,
        condition:100,enabled:true,sealed:false,staffAssigned:[],upgrades:[],powerPriority:2};
      s.undergroundRooms.push(acid);
      assert.equal(g.installUndergroundConduit(s,room.id,acid.id).ok,true);
    }
    const pre=g.getSCPResponseAvailability(s,scp);
    assert.equal(pre.ok,true,`${id} setup: ${pre.message}`);
    const risk=scp.breachRisk;
    const resources=simple(s.resources);
    const result=g.performSCPResponse(s,scp.id);
    assert.equal(result.ok,true,result.message);
    assert.ok(scp.breachRisk>=0 && Number.isFinite(scp.breachRisk));
    assert.equal(g.getSCPResponseAvailability(s,scp).ok,false);
    assert.ok(s.notifications[0].title.includes('Protocole SCP'));
    assert.ok(s.resources.funds<=resources.funds);
    if(!['scp-914','scp-294'].includes(id)) assert.ok(scp.breachRisk <= risk);
  });
}

test('SCP-914 : l’essai n’est pas possible avec un garde et un chercheur seulement',()=>{
  const g=engine(),{s,scp,room,proc}=fixture(g,'scp-914');
  proc.restrictedTesting=true;
  placeStaff(s,room,1,'guard');placeStaff(s,room,1,'researcher');
  const available=g.getSCPResponseAvailability(s,scp);
  assert.equal(available.ok,false);
  assert.match(available.message,/deux gardes/);
});
test('SCP-294 : deux gardes insuffisamment habilités ne permettent pas l’essai',()=>{
  const g=engine(),{s,scp,room,proc}=fixture(g,'scp-294');
  proc.restrictedTesting=true;
  placeStaff(s,room,2,'guard').forEach(m=>m.clearance=2);
  placeStaff(s,room,1,'researcher');
  const before=simple(s.resources);
  const outcome=g.performSCPResponse(s,scp.id);
  assert.equal(outcome.ok,false);
  assert.match(outcome.message,/niveau 3/);
  assert.deepEqual(simple(s.resources),before);
});
test('SCP-939 : aucune intervention n’active un dispositif sans recherche préalable',()=>{
  const g=engine(),{s,scp,proc}=fixture(g,'scp-939');
  s.mode='campaign';
  s.researchNodes.forEach(n=>n.completed=false);
  const before=simple(s.resources);
  const x=g.performSCPResponse(s,scp.id);
  assert.equal(x.ok,false);
  assert.deepEqual(simple(s.resources),before);
  assert.equal(proc.analogBackup,false);
  assert.equal(proc.isolatedNetwork,false);
});
test('SCP-049 : les soins coopératifs doivent être débloqués avant l’intervention',()=>{
  const g=engine(),{s,scp,proc}=fixture(g,'scp-049');
  s.mode='campaign';s.researchNodes.forEach(n=>n.completed=false);
  assert.equal(g.performSCPResponse(s,scp.id).ok,false);
  assert.equal(proc.humaneCare,false);
});

test('SCP-106 : la corrosion progresse sans entretien, mais aucune énergie ne désactive l’entité',()=>{
  const g=engine(),{s,scp,room,proc}=fixture(g,'scp-106');
  proc.maintenanceFrequency=10;
  g.toggleUndergroundConduit(s,room.id,s.undergroundRooms.find(r=>r.x===5&&r.level===0&&r.type==='service-tunnel').id,'power');
  assert.equal(g.inspectSCPBehavior(s,scp).anomalyStillPresent,true);
  const old=room.condition;
  g.advanceSimulation(s,60);
  assert.ok(room.condition<old-1);
});
test('étude SCP sans chercheur physiquement présent : aucun progrès artificiel',()=>{
  const g=engine(),{s,scp,room,proc}=fixture(g,'scp-914');
  proc.restrictedTesting=true;
  const before=scp.researchProgress;
  g.advanceSimulation(s,60);
  assert.equal(scp.researchProgress,before);
  placeStaff(s,room,1,'researcher');
  g.advanceSimulation(s,60);
  assert.ok(scp.researchProgress>before);
});
test('une panne SCP garde l’anomalie confinée et signale une seule alerte, puis la reprise',()=>{
  const g=engine(),{s,scp,room,tunnel,proc}=fixture(g,'scp-914');
  proc.restrictedTesting=true;
  g.toggleUndergroundConduit(s,room.id,tunnel.id,'power');
  const orig=s.notifications.filter(n=>n.title.includes('Diagnostic SCP-914')).length;
  g.advanceSimulation(s,120);
  const first=s.notifications.filter(n=>n.title.includes('Diagnostic SCP-914')).length;
  assert.equal(first,orig+1);
  assert.equal(scp.contained,true);
  g.toggleUndergroundConduit(s,room.id,tunnel.id,'power');
  g.advanceSimulation(s,60);
  assert.ok(s.notifications.some(n=>n.title.includes('mesures rétablies')));
});
