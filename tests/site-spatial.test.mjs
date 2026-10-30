import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import vm from "node:vm";
const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1"));
const plain = value => JSON.parse(JSON.stringify(value));
function start() {
  const source = readFileSync(join(root,"dist/game.js"),"utf8");
  const context = { console, performance:{now:()=>0},navigator:{},location:{protocol:"http:"},
    window:{matchMedia:()=>({matches:false}),setTimeout:()=>0,addEventListener:()=>{}},
    document:{readyState:"loading",addEventListener:()=>{},getElementById:()=>null},
    localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}} };
  vm.createContext(context);vm.runInContext(source,context);
  return {g:context.SCPGame,s:context.SCPGame.createNewGame("sandbox","standard",4040)};
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9);
test("la ville projette chaque salle sans créer des bâtiments miroirs",()=>{
  const {g,s}=start(),lot=g.getSiteRegionFootprint(s);
  assert.deepEqual(plain(lot),{x:10,y:9,width:9,height:5});
  assert.equal(g.getRegionCampusOverlap(s).length,0);
  for(const r of s.surfaceRooms){
    const roof=g.getSurfaceRegionFootprint(s,r);
    const xy=g.regionToSurfacePosition(s,{x:roof.x,y:roof.y});
    near(xy.x,r.x);near(xy.y,r.y);
    near(roof.width/lot.width,r.width/s.surfaceWidth);
    near(roof.height/lot.height,r.height/s.surfaceHeight);
    assert.equal(g.getSurfaceRoomAtRegionPosition(s,g.surfaceToRegionPosition(s,{x:r.x+r.width/2,y:r.y+r.height/2})).id,r.id);
  }
  assert.equal("siteBuildings" in s,false);
});
test("un clic sur un toit sub-tuile sélectionne sa vraie salle",()=>{
  const {g,s}=start();s.view="region";
  const r=s.surfaceRooms.find(x=>x.type==="medical");
  const p=g.surfaceToRegionPosition(s,{x:r.x+1.1,y:r.y+1.7});
  const width=1200,w=54,h=w*.48;
  const runtime={state:s,canvas:{getBoundingClientRect:()=>({left:0,top:0,width,height:850})}};
  g.selectAtCanvas(runtime,width/2+(p.x-p.y)*w/2,54+(p.x+p.y)*h/2);
  assert.equal(s.selectedId,r.id);g.setView(s,"surface");assert.equal(s.selectedId,r.id);
  g.setView(s,"region");assert.equal(s.selectedId,r.id);
});
test("surface, puits et sous-sol utilisent la même verticale",()=>{
  const {g,s}=start(),e=s.surfaceRooms.find(r=>r.type==="elevator"),
    shaft=s.undergroundRooms.find(r=>r.type==="elevator-shaft"&&r.level===0);
  assert.equal(g.getSiteSectionSurfaceY(s),14);
  near(g.undergroundXToSurfaceX(s,shaft.x+.5),20.5);
  assert.equal(g.isShaftUnderSurfaceElevator(s,shaft,e),true);
  assert.equal(g.getUndergroundPortals(s).length,1);
  assert.equal(g.getSurfaceRoomAboveUnderground(s,shaft).id,e.id);
  assert.equal(g.getUndergroundRoomBelowSurface(s,e).id,shaft.id);
  s.view="surface";s.selectedType="surface-room";s.selectedId=e.id;
  g.setView(s,"underground");assert.equal(s.selectedId,shaft.id);
  g.setView(s,"surface");assert.equal(s.selectedId,e.id);
});
test("un ascenseur décalé ou un puits scellé ne provoque aucun trajet fantôme",()=>{
  const {g,s}=start(),e=s.surfaceRooms.find(r=>r.type==="elevator"),
    shaft=s.undergroundRooms.find(r=>r.type==="elevator-shaft"&&r.level===0);
  e.y=1;e.height=4;assert.equal(g.getUndergroundPortals(s).length,0);
  e.y=12;e.x=1;assert.equal(g.getUndergroundPortals(s).length,0);
  e.x=20;assert.equal(g.getUndergroundPortals(s).length,1);
  shaft.sealed=true;assert.equal(g.getUndergroundPortals(s).length,0);
});
test("la cellule de confinement a une pièce réelle au-dessus",()=>{
  const {g,s}=start(),room=s.undergroundRooms.find(r=>r.type==="safe-containment");
  const above=g.getSurfaceRoomAboveUnderground(s,room);
  assert.equal(above.type,"staff-room");
  const x=g.undergroundXToSurfaceX(s,room.x+room.width/2);
  assert.ok(x>=above.x&&x<above.x+above.width);
  assert.equal(g.getUndergroundRoomBelowSurface(s,above).level,0);
});
test("une pièce hors de la coupe n'acquiert pas de sous-sol imaginaire",()=>{
  const {g,s}=start(),room=s.surfaceRooms.find(r=>r.type==="medical");
  assert.equal(g.isSurfaceRoomOnUndergroundSection(s,room),false);
  assert.equal(g.getUndergroundRoomBelowSurface(s,room),undefined);
});
test("bâtir puis démolir une salle actualise sa toiture extérieure",()=>{
  const {g,s}=start();s.resources.funds=1e6;s.resources.parts=1e3;
  const initial=s.surfaceRooms.length;
  assert.equal(g.buildSurfaceRoom(s,"restroom",21,1).ok,true);
  const room=s.surfaceRooms.at(-1),roof=g.getSurfaceRegionFootprint(s,room);
  const p={x:roof.x+roof.width/2,y:roof.y+roof.height/2};
  assert.equal(g.getSurfaceRoomAtRegionPosition(s,p).id,room.id);
  s.selectedId=room.id;s.selectedType="surface-room";
  assert.equal(g.demolishSelected(s).ok,true);
  assert.equal(s.surfaceRooms.length,initial);
  assert.equal(g.getSurfaceRoomAtRegionPosition(s,p),undefined);
});
test("le terrain du Site est réservé sans facturer ni casser les annexes",()=>{
  const {g,s}=start(),before=plain(s.resources);
  assert.equal(g.buildRegionFacility(s,"road",17,12).ok,false);
  assert.deepEqual(plain(s.resources),before);
  assert.equal(g.buildRegionFacility(s,"road",17,0).ok,true);
});
test("sauvegardes historiques : aucune annexe n'est déplacée",()=>{
  const {g,s}=start();s.regionFacilities.push({...s.regionFacilities[0],id:"legacy",x:13,y:10});
  assert.equal(g.getRegionCampusOverlap(s).length,1);
  const saved=JSON.stringify(s),loaded=g.importSave(saved);
  assert.ok(loaded);assert.equal(loaded.regionFacilities.some(r=>r.id==="legacy"),true);
  for(const r of loaded.surfaceRooms){
    const p={x:r.x+.25,y:r.y+.25},back=g.regionToSurfacePosition(loaded,g.surfaceToRegionPosition(loaded,p));
    near(p.x,back.x);near(p.y,back.y);
  }
  assert.equal(JSON.stringify(s),saved);
});
