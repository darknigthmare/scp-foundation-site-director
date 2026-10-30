import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1"));
const plain = (value) => JSON.parse(JSON.stringify(value));

function loadGameNamespace(storage = new Map()) {
  const code = readFileSync(join(root, "dist", "game.js"), "utf8");
  const context = {
    console,
    performance: { now: () => 0 },
    navigator: {},
    location: { protocol: "http:" },
    window: { matchMedia: () => ({ matches: false }), setTimeout: () => 0, addEventListener: () => undefined },
    document: { readyState: "loading", addEventListener: () => undefined, getElementById: () => null },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key)
    }
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  return context.SCPGame;
}

function room(id, type, x, y, width = 4, height = 3) {
  return { id, type, x, y, width, height, level: 1, condition: 100, cleanliness: 100,
    staffAssigned: [], queue: [], upgrades: [], enabled: true, powerPriority: 2 };
}

function work(id, kind = "repair", metadata) {
  return { id, kind, severity: 1, progress: 0, createdAt: 0, expiresAt: 10000, source: id, metadata };
}

function resetMember(member, x = 1, y = 2) {
  member.status = "working";
  member.shift = "day";
  member.position = { layer: "surface", x, y };
  member.target = undefined;
  member.targetRoomId = undefined;
  member.assignmentRoomId = undefined;
  member.path = [];
  member.pathIndex = 0;
  member.taskProgress = 0;
  member.compromised = false;
  Object.assign(member.needs, { hunger: 0, fatigue: 0, stress: 0, morale: 90, health: 100, contamination: 0 });
}

function prepare(game, keepLayout = false) {
  const state = game.createNewGame("campaign", "standard", 31337);
  const member = state.staff.find((entry) => entry.role === "guard");
  assert.ok(member);
  resetMember(member);
  state.staff = [member];
  state.scps = [];
  state.procedures = [];
  state.undergroundRooms = [];
  state.undergroundConduits = [];
  state.regionFacilities = [];
  if (!keepLayout) state.surfaceRooms = [];
  state.surfaceRooms.forEach((entry) => { entry.staffAssigned = []; entry.queue = []; });
  state.minuteOfDay = 400;
  state.speed = 1;
  state.settings.autoPauseCritical = false;
  state.flags["last-random-event"] = 999999;
  state.flags["last-work-spawn"] = 999999;
  return { state, member };
}

function arrival(room) {
  return { x: Math.floor(room.x + room.width / 2), y: Math.floor(room.y + room.height / 2) };
}

function arrived(member, destination) {
  const goal = arrival(destination);
  return member.targetRoomId === destination.id && member.pathIndex === member.path.length
    && member.position.x === goal.x && member.position.y === goal.y;
}

function inside(position, obstacle) {
  return position.x >= obstacle.x && position.x < obstacle.x + obstacle.width
    && position.y >= obstacle.y && position.y < obstacle.y + obstacle.height;
}

function step(game, state, count = 1, inspect) {
  for (let index = 0; index < count; index += 1) {
    const before = state.elapsedMinutes;
    game.advanceSimulation(state, 1);
    assert.equal(state.elapsedMinutes, before + 1, "la simulation doit avancer");
    inspect?.();
  }
}

function walkTo(game, state, member, destination, inspect) {
  for (let index = 0; index < 200 && !arrived(member, destination); index += 1) {
    const previous = { ...member.position };
    step(game, state);
    const dx = Math.abs(member.position.x - previous.x);
    const dy = Math.abs(member.position.y - previous.y);
    assert.ok(dx < 1e-10 || dy < 1e-10, "un déplacement ne coupe pas un coin en diagonale");
    assert.ok(dx + dy <= 0.55 + 1e-10, "la replanification ne téléporte pas le personnel");
    inspect?.();
  }
  assert.ok(arrived(member, destination), "le membre doit atteindre la salle");
}

test("la grille refuse les coordonnées invalides et les extrémités bloquées", () => {
  const game = loadGameNamespace();
  for (const [start, target, width, height, blocked] of [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, 3, 3, new Set(["1,0"])],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, 3, 3, new Set(["0,0"])],
    [{ x: -1, y: 0 }, { x: 1, y: 0 }, 3, 3],
    [{ x: 0.5, y: 0 }, { x: 1, y: 0 }, 3, 3],
    [{ x: 0, y: 0 }, { x: 3, y: 0 }, 3, 3],
    [{ x: 0, y: 0 }, { x: NaN, y: 0 }, 3, 3],
    [{ x: 0, y: 0 }, { x: 1, y: Infinity }, 3, 3],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, 0, 3],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, 3.5, 3]
  ]) {
    assert.equal(game.getManhattanPath(start, target, width, height, blocked).length, 0);
  }
  assert.deepEqual(plain(game.getManhattanPath({ x: 0, y: 0 }, { x: 1, y: 0 }, 3, 3)), [{ x: 1, y: 0 }]);
});

test("le plan de route est pur et aligne une position fractionnaire sans couper les obstacles", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const origin = room("origin", "intake", 1, 1, 4, 4);
  const wall = room("wall", "medical", 6, 0, 2, 7);
  const destination = room("destination", "maintenance", 10, 1);
  state.surfaceRooms = [origin, wall, destination];
  member.position = { layer: "surface", x: 3.7, y: 3.4 };
  const before = JSON.stringify(state);
  const path = game.planSurfaceRoute(state, member.position, destination);
  assert.ok(path?.length);
  assert.equal(JSON.stringify(state), before, "planifier ne doit modifier ni le membre ni les files");
  let previous = member.position;
  for (const point of path) {
    assert.ok(point.x === previous.x || point.y === previous.y);
    assert.equal(inside(point, wall), false);
    previous = point;
  }
  assert.deepEqual(plain(path.at(-1)), arrival(destination));
});

test("une destination d'une cellule reste dans son empreinte et distingue arrivée de refus", () => {
  const game = loadGameNamespace();
  const { state } = prepare(game);
  const destination = room("small", "staff-room", 4, 4, 1, 1);
  state.surfaceRooms = [destination];
  const position = { layer: "surface", x: 1, y: 1 };
  const path = game.planSurfaceRoute(state, position, destination);
  assert.deepEqual(plain(path.at(-1)), { x: 4, y: 4 });
  assert.deepEqual(plain(game.planSurfaceRoute(state, { layer: "surface", x: 4, y: 4 }, destination)), []);
  destination.enabled = false;
  assert.equal(game.planSurfaceRoute(state, position, destination), undefined);
});

test("un agent sort de l'intake initial et rejoint sa salle assignée", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game, true);
  const intake = state.surfaceRooms.find((entry) => entry.type === "intake");
  const destination = state.surfaceRooms.find((entry) => entry.type === "medical");
  member.position = { layer: "surface", x: 4, y: 8 };
  member.assignmentRoomId = destination.id;
  const before = { ...member.position };
  walkTo(game, state, member, destination, () => {
    for (const obstacle of state.surfaceRooms.filter((entry) => entry !== intake && entry !== destination && entry.type !== "corridor")) {
      assert.equal(inside(member.position, obstacle), false);
    }
  });
  assert.notDeepEqual(plain(member.position), before);
  assert.equal(member.status, "working");
  assert.ok(member.taskProgress > 0);
});

test("un agent quitte le réfectoire pour reprendre son affectation", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const canteen = room("food", "canteen", 1, 1);
  const destination = room("work", "maintenance", 10, 1);
  state.surfaceRooms = [canteen, destination];
  member.position = { layer: "surface", x: 2, y: 2 };
  member.needs.hunger = 90;
  member.assignmentRoomId = destination.id;
  walkTo(game, state, member, canteen);
  assert.equal(member.status, "eating");
  member.needs.hunger = 10;
  walkTo(game, state, member, destination);
  assert.equal(member.status, "working");
});

test("le service choisit une salle accessible même si sa file est plus longue", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const inaccessible = room("far-food", "canteen", 13, 1);
  const accessible = room("near-food", "canteen", 2, 7);
  const wall = room("wall", "medical", 8, 0, 1, state.surfaceHeight);
  accessible.queue = [work("waiting", "delivery")];
  state.surfaceRooms = [inaccessible, accessible, wall];
  member.needs.hunger = 90;
  step(game, state);
  assert.equal(member.targetRoomId, accessible.id);
  walkTo(game, state, member, accessible, () => assert.ok(member.position.x < wall.x));
  assert.ok(member.needs.hunger < 90 + state.elapsedMinutes * 0.022);
});

test("une construction sur l'ancien trajet déclenche un détour depuis le pas en cours", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const destination = room("work", "maintenance", 13, 1);
  state.surfaceRooms = [destination];
  member.assignmentRoomId = destination.id;
  step(game, state);
  assert.equal(member.position.x, 1.55);
  const previousPath = member.path;
  const wall = room("new-room", "medical", 5, 0, 3, 6);
  state.surfaceRooms.push(wall);
  walkTo(game, state, member, destination, () => assert.equal(inside(member.position, wall), false));
  assert.notEqual(member.path, previousPath);
});

for (const explicit of [false, true]) {
  test(`la fermeture d'une destination ${explicit ? "assignée" : "de service"} arrête le trajet et la réouverture le reprend`, () => {
    const game = loadGameNamespace();
    const { state, member } = prepare(game);
    const destination = room("destination", explicit ? "maintenance" : "canteen", 13, 1);
    state.surfaceRooms = [destination];
    if (explicit) member.assignmentRoomId = destination.id;
    else member.needs.hunger = 90;
    step(game, state);
    destination.enabled = false;
    const stopped = plain(member.position);
    step(game, state, 3);
    assert.deepEqual(plain(member.position), stopped);
    assert.equal(member.targetRoomId, undefined);
    assert.equal(member.target, undefined);
    assert.equal(member.path.length, 0);
    assert.equal(member.pathIndex, 0);
    assert.equal(member.status, "queued");
    destination.enabled = true;
    walkTo(game, state, member, destination);
  });
}

test("une destination supprimée ne laisse aucun chemin actif", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const destination = room("food", "canteen", 13, 1);
  state.surfaceRooms = [destination];
  member.needs.hunger = 90;
  step(game, state);
  const before = plain(member.position);
  state.surfaceRooms = [];
  step(game, state);
  assert.deepEqual(plain(member.position), before);
  assert.equal(member.targetRoomId, undefined);
  assert.equal(member.pathIndex, 0);
  assert.equal(member.path.length, 0);
});

test("un ancien chemin importé est reconstruit avant tout mouvement", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const destination = room("work", "maintenance", 13, 1);
  const wall = room("wall", "medical", 5, 0, 3, 6);
  state.surfaceRooms = [destination, wall];
  member.role = "engineer";
  member.assignmentRoomId = destination.id;
  member.targetRoomId = destination.id;
  member.target = { layer: "surface", ...arrival(destination) };
  member.path = [{ x: 7, y: 2 }, arrival(destination)];
  member.pathIndex = 0;
  const imported = game.importSave(JSON.stringify(state));
  assert.ok(imported);
  imported.settings.autoPauseCritical = false;
  imported.speed = 1;
  const loadedMember = imported.staff.find((entry) => entry.id === member.id);
  const loadedRoom = imported.surfaceRooms.find((entry) => entry.id === destination.id);
  walkTo(game, imported, loadedMember, loadedRoom, () => assert.equal(inside(loadedMember.position, wall), false));
});

test("un couloir fermé invalide son passage et peut être rouvert", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const destination = room("work", "maintenance", 13, 1);
  const wall = room("wall", "medical", 8, 0, 1, state.surfaceHeight);
  const passage = room("passage", "corridor", 8, 2, 1, 1);
  state.surfaceRooms = [destination, wall, passage];
  member.assignmentRoomId = destination.id;
  step(game, state);
  passage.enabled = false;
  const before = plain(member.position);
  step(game, state);
  assert.deepEqual(plain(member.position), before);
  assert.equal(member.targetRoomId, undefined);
  passage.enabled = true;
  walkTo(game, state, member, destination);
});

test("un couloir superposé ne rouvre pas une salle fermée, mais son occupant peut sortir", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const destination = room("work", "maintenance", 13, 1);
  const wall = room("closed-room", "medical", 8, 0, 1, state.surfaceHeight);
  const passage = room("passage", "corridor", 8, 2, 1, 1);
  wall.enabled = false;
  state.surfaceRooms = [destination, wall, passage];
  assert.equal(game.planSurfaceRoute(state, member.position, destination), undefined);
  wall.enabled = true;
  assert.ok(game.planSurfaceRoute(state, member.position, destination)?.length);
  wall.enabled = false;
  member.position = { layer: "surface", x: 8, y: 3 };
  assert.ok(game.planSurfaceRoute(state, member.position, destination)?.length);
});

test("un échec de trajet attend avant de réessayer, mais réagit immédiatement à une ouverture", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const destination = room("food", "canteen", 13, 1);
  const wall = room("wall", "medical", 8, 0, 1, state.surfaceHeight);
  state.surfaceRooms = [destination, wall];
  member.needs.hunger = 90;
  const pathfind = game.getManhattanPath;
  let searches = 0;
  game.getManhattanPath = (...args) => { searches += 1; return pathfind(...args); };
  step(game, state);
  const initialSearches = searches;
  assert.ok(initialSearches > 0);
  step(game, state, 8);
  assert.equal(searches, initialSearches);
  assert.equal(member.targetRoomId, undefined);
  assert.ok(member.needs.hunger >= 90);
  step(game, state, 2);
  assert.ok(searches > initialSearches);
  state.surfaceRooms = [destination];
  step(game, state);
  assert.equal(member.targetRoomId, destination.id);
});

test("la réduction des animations conserve un trajet effectivement parcouru", () => {
  const game = loadGameNamespace();
  const normal = prepare(game);
  const reduced = prepare(game);
  for (const [scenario, preference] of [[normal, false], [reduced, true]]) {
    const destination = room("work", "maintenance", 13, 1);
    scenario.state.surfaceRooms = [destination];
    scenario.member.assignmentRoomId = destination.id;
    scenario.state.settings.reducedMotion = preference;
  }
  const start = plain(normal.member.position);
  step(game, normal.state, 12);
  step(game, reduced.state, 12);
  assert.notDeepEqual(plain(normal.member.position), start, "deux agents immobiles ne valident pas ce test");
  assert.deepEqual(plain(normal.member.position), plain(reduced.member.position));
  assert.deepEqual(plain(normal.member.needs), plain(reduced.member.needs));
});

test("le personnel en route ou en formation ne fournit pas de service à distance", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const destination = room("work", "maintenance", 13, 1);
  member.role = "engineer";
  member.assignmentRoomId = destination.id;
  destination.staffAssigned = [member.id];
  const item = work("repair");
  destination.queue = [item];
  state.surfaceRooms = [destination];
  step(game, state, 10);
  assert.equal(member.status, "moving");
  assert.equal(item.progress, 0);
  walkTo(game, state, member, destination);
  step(game, state, 10 - state.elapsedMinutes % 10);
  assert.ok(item.progress > 0);
  const before = item.progress;
  member.status = "training";
  member.taskProgress = 0;
  step(game, state, 10);
  assert.equal(item.progress, before);
});

test("les soins d'un membre ne progressent qu'après son arrivée effective", () => {
  const game = loadGameNamespace();
  const { state, member: patient } = prepare(game);
  const medical = room("medical", "medical", 13, 1);
  state.surfaceRooms = [medical];
  patient.needs.health = 40;
  const doctor = game.createStaffMember("medic", new game.SeededRandom(55), 1);
  const goal = arrival(medical);
  resetMember(doctor, goal.x, goal.y);
  doctor.assignmentRoomId = medical.id;
  medical.staffAssigned = [doctor.id];
  state.staff.push(doctor);
  step(game, state, 10);
  const request = medical.queue.find((item) => item.metadata?.staffId === patient.id);
  assert.ok(request);
  assert.equal(request.progress, 0);
  assert.equal(doctor.status, "working");
  assert.equal(patient.needs.health, 40);
  request.progress = 99.9;
  step(game, state, 10);
  assert.equal(request.progress, 99.9);
  assert.equal(patient.needs.health, 40);
  walkTo(game, state, patient, medical);
  step(game, state, 10 - state.elapsedMinutes % 10);
  assert.ok(patient.needs.health > 40);
  assert.equal(medical.queue.includes(request), false);
});

test("un changement d'infirmerie déplace une seule demande sans repousser son échéance", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const first = room("first-medical", "medical", 8, 1);
  const second = room("second-medical", "medical", 8, 7);
  state.surfaceRooms = [first, second];
  member.needs.health = 40;
  step(game, state, 3);
  assert.equal(member.targetRoomId, first.id, "sa propre demande ne doit pas le faire changer de destination");
  const request = first.queue[0];
  const deadline = request.expiresAt;
  first.enabled = false;
  step(game, state);
  assert.equal(member.targetRoomId, second.id);
  assert.equal(first.queue.length, 0);
  assert.equal(second.queue.length, 1);
  assert.equal(second.queue[0].id, request.id);
  assert.equal(second.queue[0].expiresAt, deadline);
  assert.equal(member.status, "injured");
});

test("les demandes expirent aussi dans une salle fermée", () => {
  const game = loadGameNamespace();
  const { state } = prepare(game);
  const medical = room("closed", "medical", 13, 1);
  medical.enabled = false;
  medical.queue = [{ ...work("expired", "patient"), expiresAt: 0 }];
  state.surfaceRooms = [medical];
  step(game, state, 10);
  assert.equal(medical.queue.length, 0);
  assert.ok(state.history.some((entry) => entry.includes("expired")));
});

test("une quarantaine inaccessible préserve le statut et n'accorde aucun soin", () => {
  const game = loadGameNamespace();
  const { state, member } = prepare(game);
  const quarantine = room("quarantine", "quarantine", 13, 1);
  const wall = room("wall", "medical", 8, 0, 1, state.surfaceHeight);
  state.surfaceRooms = [quarantine, wall];
  member.needs.contamination = 90;
  member.needs.health = 40;
  step(game, state, 12);
  assert.equal(member.status, "quarantined");
  assert.equal(member.needs.health, 40);
  assert.equal(member.needs.contamination, 90);
  assert.equal(member.targetRoomId, undefined);
});
