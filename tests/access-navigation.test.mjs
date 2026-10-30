import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import vm from "node:vm";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1"));
const plain = (value) => JSON.parse(JSON.stringify(value));

function gameNamespace() {
  const context = { console, performance: { now: () => 0 }, navigator: {}, location: { protocol: "http:" },
    window: { matchMedia: () => ({ matches: false }), setTimeout: () => 0, addEventListener: () => undefined },
    document: { readyState: "loading", addEventListener: () => undefined, getElementById: () => null },
    localStorage: { getItem: () => null, setItem: () => undefined, removeItem: () => undefined } };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(root, "dist/game.js"), "utf8"), context);
  return context.SCPGame;
}

function room(id = "work", type = "maintenance", x = 8, y = 4, width = 4, height = 4) {
  return { id, type, x, y, width, height, level: 1, condition: 100, cleanliness: 100,
    staffAssigned: [], queue: [], upgrades: [], enabled: true, powerPriority: 2, accessPoints: [] };
}

function access(kind = "door", overrides = {}) {
  return { id: "gate", side: "west", offset: 1, kind, enabled: true, minClearance: 0,
    allowedTraffic: ["public", "staff", "security", "medical", "contaminated", "freight", "anomaly"],
    direction: "both", queueCapacity: 4, powered: true, airSupply: true,
    queue: [], passedCount: 0, paidFunds: 0, paidParts: 0, ...overrides };
}

function setup(kind = "door") {
  const game = gameNamespace();
  const state = game.createNewGame("campaign", "standard", 98117);
  const member = state.staff.find((entry) => entry.role === "engineer");
  const destination = room();
  const gate = access(kind);
  destination.accessPoints = [gate];
  destination.staffAssigned = [member.id];
  state.staff = [member];
  state.surfaceRooms = [destination];
  state.undergroundRooms = [];
  state.undergroundConduits = [];
  state.regionFacilities = [];
  state.scps = [];
  state.procedures = [];
  state.minuteOfDay = 400;
  state.elapsedMinutes = 1;
  state.speed = 1;
  state.settings.autoPauseCritical = false;
  state.flags["last-random-event"] = 999999;
  state.flags["last-work-spawn"] = 999999;
  Object.assign(member, { status: "working", shift: "day", clearance: 2,
    position: { layer: "surface", x: 2, y: 5 }, assignmentRoomId: destination.id,
    targetRoomId: undefined, target: undefined, path: [], pathIndex: 0 });
  Object.assign(member.needs, { hunger: 0, fatigue: 0, stress: 0, morale: 90, health: 100, contamination: 0 });
  return { game, state, member, destination, gate };
}

function queueMember(scenario, member = scenario.member, reverse = false) {
  const { game, state, destination, gate } = scenario;
  const cells = game.getSurfaceAccessCells(destination, gate);
  const from = reverse ? cells.inside : cells.outside;
  const to = reverse ? cells.outside : cells.inside;
  member.position = { layer: "surface", ...from };
  member.path = [{ ...to }];
  member.pathIndex = 0;
  member.targetRoomId = destination.id;
  member.target = { layer: "surface", ...to };
  assert.equal(game.processSurfaceAccessStep(state, member, to), true);
  return { from: plain(from), to: plain(to) };
}

function gateTick(scenario, count = 1) {
  for (let index = 0; index < count; index += 1) {
    scenario.state.elapsedMinutes += 1;
    scenario.game.updateSurfaceAccesses(scenario.state);
    const doors = scenario.game.getSurfaceAccessDoorState(scenario.state, scenario.destination, scenario.gate);
    assert.equal(doors.entryOpen && doors.exitOpen, false, "les deux portes d'un sas ne sont jamais ouvertes simultanément");
  }
}

function arrived(member, destination) {
  return member.position.x === Math.floor(destination.x + destination.width / 2)
    && member.position.y === Math.floor(destination.y + destination.height / 2)
    && member.status === "working";
}

test("un trajet de surface franchit le seuil configuré et aucun autre mur", () => {
  const { game, state, member, destination, gate } = setup();
  const before = JSON.stringify(state);
  const path = game.planSurfaceRoute(state, member.position, destination, member);
  assert.ok(path?.length);
  assert.equal(JSON.stringify(state), before, "la planification reste pure");
  const cells = game.getSurfaceAccessCells(destination, gate);
  const entrance = path.findIndex((cell) => cell.x >= destination.x);
  assert.deepEqual(plain(path[entrance - 1]), plain(cells.outside));
  assert.deepEqual(plain(path[entrance]), plain(cells.inside));
  gate.enabled = false;
  assert.equal(game.planSurfaceRoute(state, member.position, destination, member), undefined);
});

test("habilitations, métier et contamination déterminent réellement les accès", () => {
  const { game, state, member, destination, gate } = setup();
  gate.minClearance = 4;
  assert.equal(game.planSurfaceRoute(state, member.position, destination, member), undefined);
  member.clearance = 4;
  assert.ok(game.planSurfaceRoute(state, member.position, destination, member));
  gate.allowedTraffic = ["medical"];
  assert.equal(game.planSurfaceRoute(state, member.position, destination, member), undefined);
  member.role = "medic";
  assert.ok(game.planSurfaceRoute(state, member.position, destination, member));
  member.needs.contamination = 70;
  assert.equal(game.getStaffSurfaceTraffic(member), "contaminated");
  assert.equal(game.planSurfaceRoute(state, member.position, destination, member), undefined);
  gate.allowedTraffic = ["contaminated"];
  assert.ok(game.planSurfaceRoute(state, member.position, destination, member));
  member.needs.contamination = 0;
  member.role = "logistics";
  assert.equal(game.getStaffSurfaceTraffic(member), "freight");
  member.role = "mtf";
  assert.equal(game.getStaffSurfaceTraffic(member), "security");
});

test("un accès en entrée seule bloque la sortie et un second accès autorisé fournit un détour", () => {
  const { game, state, member, destination, gate } = setup();
  gate.direction = "out";
  assert.equal(game.planSurfaceRoute(state, member.position, destination, member), undefined);
  destination.accessPoints.push(access("door", { id: "south", side: "south", offset: 2 }));
  assert.ok(game.planSurfaceRoute(state, member.position, destination, member));
  destination.accessPoints = [gate];
  gate.direction = "in";
  const outsideRoom = room("other", "canteen", 1, 1, 3, 3);
  state.surfaceRooms.push(outsideRoom);
  outsideRoom.accessPoints = game.createDefaultSurfaceAccesses(state, outsideRoom);
  member.position = { layer: "surface", x: 9, y: 5 };
  assert.equal(game.planSurfaceRoute(state, member.position, outsideRoom, member), undefined);
  gate.direction = "both";
  assert.ok(game.planSurfaceRoute(state, member.position, outsideRoom, member));
});

test("un couloir superposé ne contourne jamais les murs d'une salle avec accès explicites", () => {
  const { game, state, member, destination } = setup();
  const wall = room("wall", "medical", 5, 0, 1, state.surfaceHeight);
  const corridor = room("legacy-corridor", "corridor", 5, 5, 1, 1);
  state.surfaceRooms.push(wall, corridor);
  assert.equal(game.planSurfaceRoute(state, member.position, destination, member), undefined);
  delete wall.accessPoints;
  assert.ok(game.planSurfaceRoute(state, member.position, destination, member), "le couloir synthétique historique reste compatible avant migration");
});

test("une modification d'habilitation ou de verrouillage recalcule le trajet sans attendre le délai d'échec", () => {
  const scenario = setup();
  const { game, state, member, gate, destination } = scenario;
  gate.minClearance = 5;
  const before = plain(member.position);
  game.advanceSimulation(state, 2);
  assert.deepEqual(plain(member.position), before);
  assert.match(member.routeBlockedReason, /Habilitation/);
  member.clearance = 5;
  game.advanceSimulation(state, 1);
  assert.notDeepEqual(plain(member.position), before);
  gate.enabled = false;
  const stopped = plain(member.position);
  game.advanceSimulation(state, 2);
  assert.deepEqual(plain(member.position), stopped);
  assert.match(member.routeBlockedReason, /Accès indisponibles/);
  gate.enabled = true;
  for (let index = 0; index < 100 && !arrived(member, destination); index += 1) game.advanceSimulation(state, 1);
  assert.ok(arrived(member, destination));
});

for (const reverse of [false, true]) {
  test(`une porte verrouillée à mi-pas ramène l'agent côté d'origine ${reverse ? "en sortie" : "en entrée"}, même après chargement`, () => {
    const scenario = setup();
    const { game, state, member, gate, destination } = scenario;
    if (reverse) {
      const other = room("outside-work", "maintenance", 1, 4, 3, 3);
      state.surfaceRooms.push(other);
      other.accessPoints = game.createDefaultSurfaceAccesses(state, other);
      member.assignmentRoomId = other.id;
    }
    const cells = game.getSurfaceAccessCells(destination, gate);
    const source = reverse ? cells.inside : cells.outside;
    member.position = { layer: "surface", ...source };
    game.advanceSimulation(state, 1);
    assert.ok(Math.abs(Math.abs(member.position.x - source.x) - 0.55) < 1e-9);
    gate.enabled = false;
    const loaded = game.importSave(JSON.stringify(state));
    assert.ok(loaded);
    const loadedMember = loaded.staff.find((entry) => entry.id === member.id);
    loaded.speed = 1;
    game.advanceSimulation(loaded, 1);
    assert.deepEqual(plain(loadedMember.position), { layer: "surface", ...plain(source) });
    assert.match(loadedMember.routeBlockedReason, /retour du côté d'origine/);
    assert.equal(loaded.surfaceRooms.find((entry) => entry.id === destination.id).accessPoints[0].passedCount, 0);
  });
}

test("une habilitation retirée pendant un franchissement manuel provoque un retour sans passage compté", () => {
  const { game, state, member, gate, destination } = setup();
  gate.minClearance = 2;
  const from = game.getSurfaceAccessCells(destination, gate).outside;
  member.position = { layer: "surface", ...from };
  game.advanceSimulation(state, 1);
  member.clearance = 0;
  game.advanceSimulation(state, 1);
  assert.deepEqual(plain(member.position), { layer: "surface", ...plain(from) });
  assert.equal(gate.passedCount, 0);
});

test("un sas suit admission, égalisation et sortie avant de compter un passage", () => {
  const scenario = setup("airlock");
  const { game, state, gate, member, destination } = scenario;
  const { from, to } = queueMember(scenario);
  gateTick(scenario);
  assert.equal(gate.cycle.phase, "entering");
  assert.deepEqual(plain(game.getSurfaceAccessDoorState(state, destination, gate)), { entryOpen: true, exitOpen: false });
  assert.deepEqual(plain(member.position), { layer: "surface", ...from });
  gateTick(scenario);
  assert.equal(gate.cycle.phase, "equalizing");
  assert.deepEqual(plain(game.getSurfaceAccessDoorState(state, destination, gate)), { entryOpen: false, exitOpen: false });
  gateTick(scenario);
  assert.equal(gate.cycle.remaining, 1);
  gateTick(scenario);
  assert.equal(gate.cycle.phase, "exiting");
  assert.equal(gate.passedCount, 0);
  assert.deepEqual(plain(member.position), { layer: "surface", ...from });
  gateTick(scenario);
  assert.equal(gate.cycle, undefined);
  assert.deepEqual(plain(member.position), { layer: "surface", ...to });
  assert.equal(gate.passedCount, 1);
  assert.equal(member.path.length, 0, "le trajet sera recalculé depuis le côté atteint");
});

test("la file du sas est FIFO, bidirectionnelle et n'admet jamais deux personnes", () => {
  const scenario = setup("airlock");
  const { state, gate, member } = scenario;
  const second = plain(member);
  second.id = "second";
  state.staff.push(second);
  const firstRoute = queueMember(scenario);
  const secondRoute = queueMember(scenario, second, true);
  assert.deepEqual(Array.from(gate.queue, (entry) => entry.staffId), [member.id, second.id]);
  gateTick(scenario);
  assert.equal(gate.cycle.staffId, member.id);
  assert.deepEqual(Array.from(gate.queue, (entry) => entry.staffId), [second.id]);
  gateTick(scenario, 4);
  assert.equal(gate.passedCount, 1);
  assert.deepEqual(plain(member.position), { layer: "surface", ...firstRoute.to });
  assert.deepEqual(plain(second.position), { layer: "surface", ...secondRoute.from });
  gateTick(scenario);
  assert.equal(gate.cycle.staffId, second.id);
  gateTick(scenario, 4);
  assert.deepEqual(plain(second.position), { layer: "surface", ...secondRoute.to });
  assert.equal(gate.passedCount, 2);
});

for (const failure of ["power", "air"]) {
  for (const [phase, ticks] of [["entering", 0], ["equalizing", 1], ["exiting", 3]]) {
    test(`une panne ${failure === "power" ? "électrique" : "d'air"} pendant ${phase} ferme les deux portes et fige le cycle`, () => {
      const scenario = setup("airlock");
      const { game, state, gate, member, destination } = scenario;
      const { from } = queueMember(scenario);
      gateTick(scenario, 1 + ticks);
      assert.equal(gate.cycle.phase, phase);
      const remaining = gate.cycle.remaining;
      if (failure === "power") state.resources.power = 0;
      else gate.airSupply = false;
      gateTick(scenario, 5);
      assert.equal(gate.cycle.phase, phase);
      assert.equal(gate.cycle.remaining, remaining);
      assert.deepEqual(plain(game.getSurfaceAccessDoorState(state, destination, gate)), { entryOpen: false, exitOpen: false });
      assert.deepEqual(plain(member.position), { layer: "surface", ...from });
      assert.equal(gate.passedCount, 0);
      state.resources.power = 100;
      gate.airSupply = true;
      gateTick(scenario, 4 - ticks);
      assert.equal(gate.passedCount, 1);
    });
  }
}

test("l'évacuation manuelle d'un sas revient au côté d'origine sans compter de traversée", () => {
  for (const reverse of [false, true]) {
    const scenario = setup("airlock");
    const { game, state, gate, member, destination } = scenario;
    const { from } = queueMember(scenario, member, reverse);
    gateTick(scenario, 3);
    gate.powered = false;
    game.evacuateSurfaceAccess(state, destination, gate);
    assert.deepEqual(plain(member.position), { layer: "surface", ...from });
    assert.equal(gate.passedCount, 0);
    assert.equal(gate.enabled, false);
    assert.equal(gate.cycle, undefined);
    assert.equal(gate.queue.length, 0);
    assert.equal(member.path.length, 0);
    gate.powered = true;
    gateTick(scenario, 6);
    assert.equal(gate.passedCount, 0);
  }
});

test("un cycle dont le sens est devenu interdit garde les deux portes fermées", () => {
  const scenario = setup("airlock");
  const { game, state, gate, destination } = scenario;
  queueMember(scenario);
  gateTick(scenario, 4);
  assert.equal(gate.cycle.phase, "exiting");
  gate.direction = "out";
  gateTick(scenario, 3);
  assert.equal(gate.cycle.phase, "exiting");
  assert.equal(gate.passedCount, 0);
  assert.deepEqual(plain(game.getSurfaceAccessDoorState(state, destination, gate)), { entryOpen: false, exitOpen: false });
  assert.match(game.getSurfaceAccessStatus(state, destination, gate), /Autorisation perdue/);
});

test("une panne conserve l'ordre FIFO et les échéances des personnes qui attendaient déjà", () => {
  const scenario = setup("airlock");
  const { game, state, member, gate } = scenario;
  queueMember(scenario);
  gateTick(scenario);
  const second = plain(member);
  second.id = "second";
  second.status = "working";
  state.staff.push(second);
  queueMember(scenario, second);
  const ticket = plain(gate.queue[0]);
  gate.powered = false;
  game.advanceSimulation(state, 5);
  assert.equal(gate.cycle.staffId, member.id);
  assert.deepEqual(plain(gate.queue), [ticket]);
  assert.equal(gate.passedCount, 0);
  assert.match(second.routeBlockedReason, /Panne électrique/);
  gate.powered = true;
  game.advanceSimulation(state, 5);
  assert.equal(gate.passedCount, 1);
  assert.equal(gate.cycle.staffId, second.id);
  assert.equal(gate.cycle.expiresAt, ticket.expiresAt);
});

test("la capacité limite la file sans doubler les demandes et les tickets expirés ont une conséquence", () => {
  const scenario = setup("airlock");
  const { game, state, member, gate } = scenario;
  gate.queueCapacity = 1;
  queueMember(scenario);
  queueMember(scenario);
  assert.equal(gate.queue.length, 1);
  const second = plain(member);
  second.id = "second";
  state.staff.push(second);
  queueMember(scenario, second);
  assert.equal(gate.queue.length, 1);
  assert.match(second.routeBlockedReason, /complète/);
  const stress = member.needs.stress;
  state.elapsedMinutes = gate.queue[0].expiresAt;
  game.updateSurfaceAccesses(state);
  assert.equal(gate.queue.length, 0);
  assert.equal(gate.cycle, undefined);
  assert.equal(member.needs.stress, stress + 1);
  assert.match(member.routeBlockedReason, /expirée/);
});

test("une demande annulée et un occupant décédé libèrent les réservations sans passage fantôme", () => {
  const scenario = setup("airlock");
  const { gate, member } = scenario;
  queueMember(scenario);
  member.path = [];
  gateTick(scenario);
  assert.equal(gate.queue.length, 0);
  assert.equal(gate.cycle, undefined);
  queueMember(scenario);
  gateTick(scenario);
  member.status = "dead";
  gateTick(scenario);
  assert.equal(gate.cycle, undefined);
  assert.equal(gate.passedCount, 0);
});

test("la simulation termine un cycle déjà engagé même lors d'une relève de personnel", () => {
  const scenario = setup("airlock");
  const { game, state, member, gate } = scenario;
  const { from, to } = queueMember(scenario);
  gateTick(scenario);
  member.shift = "night";
  gate.powered = false;
  game.advanceSimulation(state, 3);
  assert.deepEqual(plain(member.position), { layer: "surface", ...from });
  assert.equal(gate.cycle.phase, "entering");
  gate.powered = true;
  game.advanceSimulation(state, 4);
  assert.deepEqual(plain(member.position), { layer: "surface", ...to });
  assert.equal(gate.passedCount, 1);
  game.advanceSimulation(state, 1);
  assert.equal(member.status, "off-duty");
});

test("une formation payée pendant un cycle reste inscrite et commence après la sortie", () => {
  const scenario = setup("airlock");
  const { game, state, member, gate } = scenario;
  queueMember(scenario);
  gateTick(scenario);
  const training = room("training", "training", 1, 10, 4, 3);
  state.surfaceRooms.push(training);
  training.accessPoints = game.createDefaultSurfaceAccesses(state, training);
  const funds = state.resources.funds;
  assert.equal(game.trainStaff(state, member.id).ok, true);
  assert.equal(state.resources.funds, funds - 900);
  game.advanceSimulation(state, 4);
  assert.equal(gate.passedCount, 1);
  assert.equal(member.status, "training");
  assert.equal(member.taskProgress, 0);
  game.advanceSimulation(state, 1);
  assert.equal(member.status, "training");
  assert.equal(member.taskProgress, 0.4);
});

test("un changement de besoin retire une personne de la file avant l'admission suivante", () => {
  const scenario = setup("airlock");
  const { game, state, member, gate } = scenario;
  queueMember(scenario);
  gateTick(scenario);
  const second = plain(member);
  second.id = "second";
  second.status = "working";
  state.staff.push(second);
  queueMember(scenario, second);
  const canteen = room("food", "canteen", 1, 1, 3, 3);
  state.surfaceRooms.push(canteen);
  canteen.accessPoints = game.createDefaultSurfaceAccesses(state, canteen);
  second.needs.hunger = 95;
  game.advanceSimulation(state, 1);
  assert.equal(second.targetRoomId, canteen.id);
  assert.equal(gate.queue.some((entry) => entry.staffId === second.id), false);
  assert.equal(gate.cycle.staffId, member.id);
});

test("un cycle sauvegardé en égalisation reprend une seule fois depuis la même position", () => {
  const scenario = setup("airlock");
  const { game, state, member, destination, gate } = scenario;
  const { from, to } = queueMember(scenario);
  gateTick(scenario, 3);
  assert.equal(gate.cycle.phase, "equalizing");
  assert.equal(gate.cycle.remaining, 1);
  const loaded = game.importSave(JSON.stringify(state));
  assert.ok(loaded, "le jeu doit accepter sa propre sauvegarde pendant un cycle");
  const loadedMember = loaded.staff.find((entry) => entry.id === member.id);
  const loadedGate = loaded.surfaceRooms.find((entry) => entry.id === destination.id).accessPoints[0];
  assert.deepEqual(plain(loadedMember.position), { layer: "surface", ...from });
  loaded.speed = 1;
  loaded.settings.autoPauseCritical = false;
  game.advanceSimulation(loaded, 1);
  assert.equal(loadedGate.cycle.phase, "exiting");
  assert.equal(loadedGate.passedCount, 0);
  game.advanceSimulation(loaded, 1);
  assert.deepEqual(plain(loadedMember.position), { layer: "surface", ...to });
  assert.equal(loadedGate.passedCount, 1);
  game.advanceSimulation(loaded, 2);
  assert.equal(loadedGate.passedCount, 1);
});
