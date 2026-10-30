import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1"));
const plain = (value) => JSON.parse(JSON.stringify(value));

function loadGameNamespace(storage = new Map()) {
  const context = {
    console, performance: { now: () => 0 }, navigator: {}, location: { protocol: "http:" },
    window: { matchMedia: () => ({ matches: false }), setTimeout: () => 0, addEventListener: () => undefined },
    document: { readyState: "loading", addEventListener: () => undefined, getElementById: () => null },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key)
    }
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(join(root, "dist", "game.js"), "utf8"), context);
  return context.SCPGame;
}

function config(overrides = {}) {
  return {
    side: "west", offset: 1, kind: "airlock", enabled: true, minClearance: 0,
    allowedTraffic: ["public", "staff", "security", "medical", "contaminated", "freight", "anomaly"],
    direction: "both", queueCapacity: 4, powered: true, airSupply: true,
    ...overrides
  };
}

function prepare(game, count = 1) {
  const state = game.createNewGame("sandbox", "standard", 72026);
  const original = state.surfaceRooms.find((entry) => entry.type === "maintenance");
  const room = { ...original, id: "access-test-room", x: 8, y: 4, width: 4, height: 3,
    accessPoints: [], staffAssigned: [], queue: [] };
  const engineers = state.staff.filter((member) => member.role === "engineer");
  const third = state.staff.find((member) => member.role === "guard");
  state.staff = [...engineers, third].slice(0, count);
  state.surfaceRooms = [room];
  state.undergroundRooms = [];
  state.staff.forEach((member) => {
    member.position = { layer: "surface", x: 7, y: 5 };
    member.assignmentRoomId = room.id;
    member.targetRoomId = undefined;
    member.target = undefined;
    member.path = [];
    member.pathIndex = 0;
    member.status = "working";
    member.shift = "day";
    Object.assign(member.needs, { hunger: 0, fatigue: 0, stress: 0, morale: 90, health: 100, contamination: 0 });
  });
  room.staffAssigned = state.staff.map((member) => member.id);
  state.minuteOfDay = 400;
  state.speed = 1;
  state.settings.autoPauseCritical = false;
  state.flags["last-random-event"] = 999999;
  state.flags["last-work-spawn"] = 999999;
  return { state, room, member: state.staff[0] };
}

function addAccess(game, state, room, overrides = {}) {
  assert.equal(game.addSurfaceAccess(state, room.id, config(overrides)).ok, true);
  return room.accessPoints.at(-1);
}

function step(game, state, count = 1) {
  for (let index = 0; index < count; index += 1) {
    const before = state.elapsedMinutes;
    game.advanceSimulation(state, 1);
    assert.equal(state.elapsedMinutes, before + 1);
  }
}

function activeAirlock(game, count = 1) {
  const fixture = prepare(game, count);
  const access = addAccess(game, fixture.state, fixture.room);
  step(game, fixture.state, 2);
  assert.equal(access.cycle?.phase, "equalizing");
  assert.equal(access.cycle.remaining, 2);
  assert.equal(access.queue.length, count - 1);
  return { ...fixture, access };
}

test("les salles neuves reçoivent des portes utilisables incluses dans leur coût", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 8001);
  assert.equal(state.resources.funds, 72000);
  const ids = new Set();
  for (const room of state.surfaceRooms) {
    assert.ok(Array.isArray(room.accessPoints));
    assert.equal(room.type === "corridor" ? room.accessPoints.length === 0 : room.accessPoints.length > 0, true);
    for (const access of room.accessPoints) {
      assert.equal(access.kind, "door");
      assert.equal(access.paidFunds, 0);
      assert.equal(access.paidParts, 0);
      assert.equal(ids.has(access.id), false);
      ids.add(access.id);
      assert.equal(game.isSurfaceAccessPassageClear(state, room, access), true);
    }
  }
  const fixture = prepare(game);
  const funds = fixture.state.resources.funds;
  const definition = game.getSurfaceDefinition("maintenance");
  assert.equal(game.buildSurfaceRoom(fixture.state, "maintenance", 0, 0).ok, true);
  const built = fixture.state.surfaceRooms.at(-1);
  assert.ok(built.accessPoints.length > 0);
  assert.ok(built.accessPoints.every((access) => access.paidFunds === 0 && access.paidParts === 0));
  assert.equal(fixture.state.resources.funds, funds - definition.cost.funds);
});

test("la migration des entrées conserve les identités et les ressources sans rouvrir une salle scellée", () => {
  const game = loadGameNamespace();
  const old = game.createNewGame("campaign", "standard", 8002);
  old.version = "0.9.0";
  old.resources.funds = 4321;
  old.surfaceRooms.forEach((room) => { delete room.accessPoints; });
  const legacy = JSON.stringify(old);
  const migrated = game.importSave(legacy);
  const again = game.importSave(legacy);
  assert.ok(migrated && again);
  assert.deepEqual(Array.from(migrated.staff, (member) => member.id), Array.from(old.staff, (member) => member.id));
  assert.deepEqual(Array.from(migrated.surfaceRooms, (room) => room.id), Array.from(old.surfaceRooms, (room) => room.id));
  assert.deepEqual(plain(migrated.resources), plain(old.resources));
  assert.deepEqual(plain(migrated.surfaceRooms.map((room) => room.accessPoints)), plain(again.surfaceRooms.map((room) => room.accessPoints)));
  assert.equal(migrated.flags["load-schema-version"], 5);
  migrated.surfaceRooms[0].accessPoints = [];
  const sealed = game.importSave(JSON.stringify(migrated));
  assert.ok(sealed);
  assert.deepEqual(plain(sealed.surfaceRooms[0].accessPoints), []);
});

test("un marqueur de schéma futur ou mal formé ne peut pas être rétrogradé silencieusement", () => {
  const game = loadGameNamespace();
  const current = game.createNewGame("campaign", "standard", 8004);
  assert.equal(current.flags["load-schema-version"], 5);
  const snapshot = JSON.stringify(current);
  for (const marker of [6, -1, 1.5, "5", true, null]) {
    const candidate = JSON.parse(snapshot);
    candidate.flags["load-schema-version"] = marker;
    assert.equal(game.importSave(JSON.stringify(candidate)), undefined, String(marker));
  }
  for (const marker of [undefined, 0, 1, 2, 3]) {
    const candidate = JSON.parse(snapshot);
    if (marker === undefined) delete candidate.flags["load-schema-version"];
    else candidate.flags["load-schema-version"] = marker;
    candidate.surfaceRooms.forEach((room) => { delete room.accessPoints; });
    const migrated = game.importSave(JSON.stringify(candidate));
    assert.ok(migrated);
    assert.equal(migrated.flags["load-schema-version"], 5);
    assert.equal(migrated.staff[0].id, current.staff[0].id);
  }
  assert.equal(JSON.stringify(current), snapshot);
});

test("une pose de porte paie une seule fois et ne conserve pas les références de configuration", () => {
  const game = loadGameNamespace();
  const { state, room } = prepare(game);
  const before = plain(state.resources);
  const settings = config({ kind: "door" });
  settings.paidFunds = 999999;
  settings.id = "forged";
  assert.equal(game.addSurfaceAccess(state, room.id, settings).ok, true);
  const access = room.accessPoints[0];
  assert.equal(state.resources.funds, before.funds - 250);
  assert.equal(state.resources.parts, before.parts - 2);
  assert.equal(access.paidFunds, 250);
  assert.equal(access.paidParts, 2);
  assert.notEqual(access.id, "forged");
  settings.allowedTraffic.length = 0;
  assert.equal(access.allowedTraffic.length, 7);
  const snapshot = JSON.stringify(state);
  assert.equal(game.addSurfaceAccess(state, room.id, config({ kind: "door" })).ok, false);
  assert.equal(JSON.stringify(state), snapshot);
});

test("un sas rembourse seulement une fraction du prix payé, sans remboursement répété", () => {
  const game = loadGameNamespace();
  const { state, room } = prepare(game);
  const before = plain(state.resources);
  const access = addAccess(game, state, room);
  assert.equal(state.resources.funds, before.funds - 1000);
  assert.equal(state.resources.parts, before.parts - 6);
  assert.equal(game.removeSurfaceAccess(state, room.id, access.id).ok, true);
  assert.equal(state.resources.funds, before.funds - 650);
  assert.ok(Math.abs(state.resources.parts - (before.parts - 3.6)) < 1e-9);
  const after = JSON.stringify(state);
  assert.equal(game.removeSurfaceAccess(state, room.id, access.id).ok, false);
  assert.equal(JSON.stringify(state), after);
  const initial = game.createNewGame("campaign", "standard", 8003);
  const initialRoom = initial.surfaceRooms.find((entry) => entry.accessPoints.length);
  const initialFunds = initial.resources.funds;
  const initialParts = initial.resources.parts;
  assert.equal(game.removeSurfaceAccess(initial, initialRoom.id, initialRoom.accessPoints[0].id).ok, true);
  assert.equal(initial.resources.funds, initialFunds);
  assert.equal(initial.resources.parts, initialParts);
});

test("une configuration ou une emprise invalide est refusée avant toute dépense", () => {
  const game = loadGameNamespace();
  const cases = [
    ["type inconnu", { kind: "portal" }], ["mur inconnu", { side: "above" }],
    ["position négative", { offset: -1 }], ["position fractionnaire", { offset: 0.5 }],
    ["position hors mur", { offset: 3 }], ["habilitation hors limites", { minClearance: 6 }],
    ["flux inconnu", { allowedTraffic: ["ghost"] }], ["flux dupliqué", { allowedTraffic: ["staff", "staff"] }],
    ["flux incomplet", { allowedTraffic: new Array(1) }],
    ["capacité nulle", { queueCapacity: 0 }], ["capacité excessive", { queueCapacity: 17 }],
    ["énergie mal formée", { powered: "true" }], ["air absent", { airSupply: undefined }]
  ];
  for (const [name, invalid] of cases) {
    const { state, room } = prepare(game);
    const snapshot = JSON.stringify(state);
    assert.equal(game.addSurfaceAccess(state, room.id, config(invalid)).ok, false, name);
    assert.equal(JSON.stringify(state), snapshot, name);
  }
  for (const condition of ["board", "obstacle", "corridor", "funds", "parts"]) {
    const { state, room } = prepare(game);
    if (condition === "board") room.x = 0;
    if (condition === "obstacle") state.surfaceRooms.push({ ...room, id: "neighbor", x: 4, accessPoints: [] });
    if (condition === "corridor") room.type = "corridor";
    if (condition === "funds") state.resources.funds = 999;
    if (condition === "parts") state.resources.parts = 5;
    const snapshot = JSON.stringify(state);
    assert.equal(game.addSurfaceAccess(state, room.id, config()).ok, false, condition);
    assert.equal(JSON.stringify(state), snapshot, condition);
  }
});

test("démanteler une salle récupère les accès encore installés sans créer de remboursement gratuit", () => {
  const game = loadGameNamespace();
  const { state, room } = prepare(game);
  addAccess(game, state, room, { kind: "door", side: "north", offset: 1 });
  addAccess(game, state, room);
  const before = plain(state.resources);
  state.selectedId = room.id;
  state.selectedType = "surface-room";
  assert.equal(game.demolishSelected(state).ok, true);
  const definition = game.getSurfaceDefinition(room.type);
  assert.equal(state.resources.funds, before.funds + (definition.cost.funds + 250 + 1000) * 0.35);
  assert.ok(Math.abs(state.resources.parts - (before.parts + (definition.cost.parts + 2 + 6) * 0.4)) < 1e-9);
  assert.equal(state.surfaceRooms.includes(room), false);
  const after = JSON.stringify(state);
  assert.equal(game.demolishSelected(state).ok, false);
  assert.equal(JSON.stringify(state), after);
});

test("modifier un accès conserve son identité, son investissement et son compteur", () => {
  const game = loadGameNamespace();
  const { state, room } = prepare(game);
  const access = addAccess(game, state, room, { kind: "door" });
  access.passedCount = 8;
  const resources = plain(state.resources);
  const id = access.id;
  assert.equal(game.updateSurfaceAccess(state, room.id, id, {
    ...access, minClearance: 3, allowedTraffic: ["security"], direction: "in",
    id: "changed", paidFunds: 999999, passedCount: 0, queue: [{ staffId: "forged" }]
  }).ok, true);
  assert.equal(access.id, id);
  assert.equal(access.paidFunds, 250);
  assert.equal(access.passedCount, 8);
  assert.equal(access.queue.length, 0);
  assert.deepEqual(plain(access.allowedTraffic), ["security"]);
  assert.deepEqual(plain(state.resources), resources);
  const snapshot = JSON.stringify(state);
  assert.equal(game.updateSurfaceAccess(state, room.id, id, { ...access, kind: "airlock" }).ok, false);
  assert.equal(JSON.stringify(state), snapshot);
});

test("un cycle occupé protège sa géométrie et sa politique tout en permettant une mise à l'arrêt", () => {
  const game = loadGameNamespace();
  const { state, room, member, access } = activeAirlock(game);
  for (const update of [{ offset: 0 }, { minClearance: 5 }, { direction: "out" }, { allowedTraffic: [] }]) {
    const snapshot = JSON.stringify(state);
    assert.equal(game.updateSurfaceAccess(state, room.id, access.id, { ...access, ...update }).ok, false);
    assert.equal(JSON.stringify(state), snapshot);
  }
  const cycle = plain(access.cycle);
  const position = plain(member.position);
  assert.equal(game.updateSurfaceAccess(state, room.id, access.id, { ...access, enabled: false }).ok, true);
  step(game, state, 3);
  assert.deepEqual(plain(access.cycle), cycle);
  assert.deepEqual(plain(member.position), position);
  assert.equal(access.passedCount, 0);
  assert.equal(game.updateSurfaceAccess(state, room.id, access.id, { ...access, powered: false, airSupply: false }).ok, true);
});

test("la capacité de file ne peut pas être réduite sous le nombre de personnes présentes", () => {
  const game = loadGameNamespace();
  const { state, room, access } = activeAirlock(game, 3);
  assert.equal(access.queue.length, 2);
  const snapshot = JSON.stringify(state);
  assert.equal(game.updateSurfaceAccess(state, room.id, access.id, { ...access, queueCapacity: 1 }).ok, false);
  assert.equal(JSON.stringify(state), snapshot);
  assert.equal(game.updateSurfaceAccess(state, room.id, access.id, { ...access, queueCapacity: 2 }).ok, true);
  assert.equal(access.queue.length, 2);
});

test("démolition et construction ne déplacent jamais un occupant de sas", () => {
  const game = loadGameNamespace();
  const { state, room, member, access } = activeAirlock(game);
  state.selectedId = room.id;
  state.selectedType = "surface-room";
  const snapshot = JSON.stringify(state);
  assert.equal(game.removeSurfaceAccess(state, room.id, access.id).ok, false);
  assert.equal(game.demolishSelected(state).ok, false);
  assert.equal(game.buildSurfaceRoom(state, "corridor", 7, 5).ok, false);
  assert.equal(JSON.stringify(state), snapshot);
  const position = plain(member.position);
  assert.equal(game.evacuateSurfaceAccessAction(state, room.id, access.id).ok, true);
  assert.deepEqual(plain(member.position), position);
  assert.equal(access.cycle, undefined);
  assert.equal(access.enabled, false);
  assert.equal(access.passedCount, 0);
  assert.equal(game.removeSurfaceAccess(state, room.id, access.id).ok, true);
  assert.equal(game.demolishSelected(state).ok, true);
});

test("une sauvegarde en égalisation conserve l'occupant, la file et le cycle après une panne", () => {
  const game = loadGameNamespace();
  const { state, room, access } = activeAirlock(game, 2);
  assert.equal(game.updateSurfaceAccess(state, room.id, access.id, { ...access, powered: false }).ok, true);
  const snapshot = plain(access);
  const ids = Array.from(state.staff, (member) => member.id);
  const restored = game.importSave(JSON.stringify(state));
  assert.ok(restored);
  const restoredRoom = restored.surfaceRooms[0];
  const restoredAccess = restoredRoom.accessPoints[0];
  assert.deepEqual(plain(restoredAccess), snapshot);
  assert.deepEqual(Array.from(restored.staff, (member) => member.id), ids);
  restored.speed = 1;
  step(game, restored, 2);
  assert.deepEqual(plain(restoredAccess.cycle), snapshot.cycle);
  assert.equal(restoredAccess.passedCount, 0);
  assert.equal(game.updateSurfaceAccess(restored, restoredRoom.id, restoredAccess.id, { ...restoredAccess, powered: true }).ok, true);
  for (let index = 0; index < 30 && restoredAccess.passedCount < 2; index += 1) step(game, restored);
  assert.equal(restoredAccess.passedCount, 2);
  assert.equal(restoredAccess.queue.length, 0);
  assert.equal(restoredAccess.cycle, undefined);
  assert.ok(restored.staff.every((member) => member.position.layer === "surface" && member.position.x >= room.x));
});

test("les accès et références de cycle corrompus sont rejetés sans toucher aux sauvegardes existantes", () => {
  const storage = new Map();
  const game = loadGameNamespace(storage);
  const { state } = activeAirlock(game, 2);
  const snapshot = JSON.stringify(state);
  storage.set(game.SAVE_KEY, snapshot);
  const cases = [
    ["table absente", (candidate) => { candidate.surfaceRooms[0].accessPoints = null; }],
    ["accès incomplet", (candidate) => { candidate.surfaceRooms[0].accessPoints = [{}]; }],
    ["identifiant vide", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].id = ""; }],
    ["position hors mur", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].offset = 100; }],
    ["position fractionnaire", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].offset = 0.5; }],
    ["capacité invalide", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].queueCapacity = 0; }],
    ["coût négatif", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].paidFunds = -1; }],
    ["remboursement forgé", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].paidFunds = 1001; }],
    ["pièces forgées", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].paidParts = 7; }],
    ["compteur non entier", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].passedCount = 1.5; }],
    ["flux inconnu", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].allowedTraffic = ["unknown"]; }],
    ["porte avec cycle", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].kind = "door"; candidate.surfaceRooms[0].accessPoints[0].paidFunds = 0; candidate.surfaceRooms[0].accessPoints[0].paidParts = 0; }],
    ["phase inconnue", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].cycle.phase = "both-open"; }],
    ["durée impossible", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].cycle.remaining = 3; }],
    ["occupant absent", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].cycle.staffId = "missing"; }],
    ["occupant mort", (candidate) => { candidate.staff[0].status = "dead"; }],
    ["occupant ailleurs", (candidate) => { candidate.staff[0].position.x += 1; }],
    ["point de sortie non adjacent", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].cycle.to.x += 2; }],
    ["point de sortie fractionnaire", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].cycle.to.y += 0.5; }],
    ["admission future", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].cycle.requestedAt = candidate.elapsedMinutes + 1; }],
    ["échéance antérieure", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].cycle.expiresAt = 0; }],
    ["occupant aussi dans la file", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].queue.push(plain(candidate.surfaceRooms[0].accessPoints[0].cycle)); }],
    ["requête dupliquée", (candidate) => { candidate.surfaceRooms[0].accessPoints[0].queue.push(plain(candidate.surfaceRooms[0].accessPoints[0].queue[0])); }],
    ["porte dupliquée", (candidate) => { candidate.surfaceRooms[0].accessPoints.push(plain(candidate.surfaceRooms[0].accessPoints[0])); }],
    ["identité du personnel dupliquée", (candidate) => { candidate.staff.push(plain(candidate.staff[0])); }]
  ];
  for (const [name, corrupt] of cases) {
    const candidate = JSON.parse(snapshot);
    corrupt(candidate);
    assert.equal(game.importSave(JSON.stringify(candidate)), undefined, name);
    assert.equal(storage.get(game.SAVE_KEY), snapshot, name);
    assert.equal(JSON.stringify(state), snapshot, name);
  }
});

test("la migration retire les propriétés étrangères aux points de passage", () => {
  const game = loadGameNamespace();
  const { state } = activeAirlock(game);
  state.surfaceRooms[0].accessPoints[0].cycle.from.layer = "underground";
  state.surfaceRooms[0].accessPoints[0].cycle.to.layer = "underground";
  const restored = game.importSave(JSON.stringify(state));
  assert.ok(restored);
  const access = restored.surfaceRooms[0].accessPoints[0];
  assert.deepEqual(Object.keys(access.cycle.from).sort(), ["x", "y"]);
  assert.deepEqual(Object.keys(access.cycle.to).sort(), ["x", "y"]);
  restored.speed = 1;
  step(game, restored, 3);
  assert.equal(access.passedCount, 1);
  assert.equal(restored.staff[0].position.layer, "surface");
});

test("renvoyer un occupant nettoie immédiatement ses références même en pause", () => {
  const game = loadGameNamespace();
  const { state, member, access } = activeAirlock(game, 2);
  state.speed = 0;
  assert.equal(game.dismissStaff(state, member.id).ok, true);
  assert.equal(access.cycle, undefined);
  assert.equal(access.passedCount, 0);
  assert.ok(access.queue.every((request) => request.staffId !== member.id));
  const restored = game.importSave(JSON.stringify(state));
  assert.ok(restored);
  restored.speed = 1;
  for (let index = 0; index < 15 && restored.surfaceRooms[0].accessPoints[0].passedCount === 0; index += 1) step(game, restored);
  assert.equal(restored.surfaceRooms[0].accessPoints[0].passedCount, 1);
  assert.equal(restored.staff.some((entry) => entry.id === member.id), false);
});

test("une sauvegarde récente au sas invalide laisse reprendre l'autre emplacement", () => {
  const storage = new Map();
  const game = loadGameNamespace(storage);
  const { state } = activeAirlock(game);
  state.savedAt = 10;
  const older = JSON.stringify(state);
  const broken = plain(state);
  broken.savedAt = 20;
  broken.surfaceRooms[0].accessPoints[0].cycle.staffId = "missing";
  const newer = JSON.stringify(broken);
  storage.set(game.SAVE_KEY, older);
  storage.set(game.AUTOSAVE_KEY, newer);
  const loaded = game.loadLatestGame();
  assert.ok(loaded);
  assert.equal(loaded.savedAt, 10);
  assert.equal(loaded.surfaceRooms[0].accessPoints[0].cycle.staffId, state.staff[0].id);
  assert.equal(storage.get(game.SAVE_KEY), older);
  assert.equal(storage.get(game.AUTOSAVE_KEY), newer);
});
