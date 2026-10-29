import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1"));

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

test("la campagne ne valide plus la directive initiale au premier tick", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 12345);
  state.speed = 4;
  game.advanceSimulation(state, 60);
  assert.equal(state.currentChapter, 0);
  assert.equal(state.campaign[0].complete, false);
});

test("le chargement choisit la sauvegarde la plus récente", () => {
  const storage = new Map();
  const game = loadGameNamespace(storage);
  const older = game.createNewGame("campaign", "standard", 1);
  const newer = game.createNewGame("sandbox", "director", 2);
  older.savedAt = 10;
  newer.savedAt = 20;
  storage.set(game.SAVE_KEY, JSON.stringify(older));
  storage.set(game.AUTOSAVE_KEY, JSON.stringify(newer));
  assert.equal(game.loadLatestGame().seed, 2);
});

test("les salles de support ne sont plus compatibles avec un transfert SCP", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("sandbox", "standard", 222);
  const scp682 = state.scps.find((scp) => scp.definitionId === "scp-682");
  assert.ok(scp682);
  const rooms = game.getCompatibleRooms(state, scp682).map((room) => room.type);
  assert.equal(rooms.includes("air-filtration"), false);
  assert.equal(rooms.includes("power-node"), false);
});

test("le blindage rend une cellule Keter compatible avec SCP-682", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("sandbox", "standard", 223);
  state.resources.funds = 1_000_000;
  state.resources.parts = 1_000;
  const built = game.buildUndergroundRoom(state, "keter-containment", 0, 2);
  assert.equal(built.ok, true);
  const room = state.undergroundRooms.find((entry) => entry.type === "keter-containment" && entry.x === 0);
  assert.ok(room);
  state.selectedId = room.id;
  state.selectedType = "underground-room";
  assert.equal(game.upgradeSelected(state).ok, true);
  const scp682 = state.scps.find((scp) => scp.definitionId === "scp-682");
  assert.ok(scp682);
  assert.equal(game.getCompatibleRooms(state, scp682).some((entry) => entry.id === room.id), true);
});

test("un ordre de crise impossible ne dépense pas les ressources", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 333);
  game.startCrisis(state, "biohazard");
  const ammo = state.resources.ammo;
  const result = game.issueCrisisOrder(state, "deploy-mtf", state.crisis.zones[0].id);
  assert.equal(result.ok, false);
  assert.equal(state.resources.ammo, ammo);
});

test("une sauvegarde partielle est migrée vers un état simulable", () => {
  const game = loadGameNamespace();
  const imported = game.importSave(JSON.stringify({
    version: "0.9.0",
    seed: 44,
    resources: { funds: 1200 },
    surfaceRooms: [],
    undergroundRooms: [],
    staff: []
  }));
  assert.ok(imported);
  assert.ok(Array.isArray(imported.scps));
  assert.ok(Array.isArray(imported.campaign));
  imported.speed = 4;
  assert.doesNotThrow(() => game.advanceSimulation(imported, 60));
});

test("les conséquences différées anciennes reçoivent un horodatage et expirent", () => {
  const game = loadGameNamespace();
  const previous = game.createNewGame("campaign", "standard", 444);
  previous.elapsedMinutes = 500;
  previous.flags["night-overtime"] = true;
  delete previous.flags["night-overtime:at"];
  const imported = game.importSave(JSON.stringify(previous));
  assert.ok(imported);
  assert.equal(imported.flags["night-overtime:at"], 500);
  imported.flags["last-random-event"] = 999999;
  imported.elapsedMinutes = 1259;
  imported.speed = 1;
  game.advanceSimulation(imported, 1);
  assert.equal(Boolean(imported.flags["night-overtime"]), false);
});

test("un SCP ne peut pas être retransféré gratuitement dans sa propre cellule", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("sandbox", "standard", 445);
  const scp173 = state.scps.find((scp) => scp.definitionId === "scp-173");
  assert.ok(scp173);
  const room = game.getCompatibleRooms(state, scp173)[0];
  assert.ok(room);
  assert.equal(game.transferSCP(state, scp173.id, room.id).ok, true);
  assert.equal(scp173.breachRisk, Math.max(8, game.getSCPDefinition(scp173.definitionId).risk * 1.8));
  scp173.breachRisk = 99;
  const funds = state.resources.funds;
  const retry = game.transferSCP(state, scp173.id, room.id);
  assert.equal(retry.ok, false);
  assert.equal(scp173.breachRisk, 99);
  assert.equal(state.resources.funds, funds);
});

test("les options de procédure avancées exigent leur recherche", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 446);
  const scp173 = state.scps.find((scp) => scp.definitionId === "scp-173");
  assert.ok(scp173);
  const blocked = game.updateProcedure(state, scp173.id, { backupPower: true });
  assert.equal(blocked.ok, false);
  const updated = game.updateProcedure(state, scp173.id, { assignedStaff: 0, trainingRequired: 0, complexity: 0 });
  assert.equal(updated.ok, true);
  const procedure = state.procedures.find((entry) => entry.id === scp173.procedureId);
  assert.ok(procedure);
  assert.ok(procedure.assignedStaff >= 3);
  assert.ok(procedure.trainingRequired >= 20);
  assert.ok(procedure.complexity >= 25);
});

test("un membre blessé conserve son statut et une seule file de soins", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 447);
  const member = state.staff.find((entry) => entry.role === "guard");
  assert.ok(member);
  member.needs.health = 40;
  member.status = "working";
  member.shift = state.minuteOfDay >= 360 && state.minuteOfDay < 1080 ? "day" : "night";
  state.speed = 4;
  game.advanceSimulation(state, 2);
  const patientItems = state.surfaceRooms.flatMap((room) => room.queue).filter((item) => item.kind === "patient" && item.metadata?.staffId === member.id);
  assert.equal(member.status, "injured");
  assert.equal(patientItems.length, 1);
});

test("l'objectif Keter exige 1 440 minutes consécutives", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("sandbox", "standard", 448);
  const keter = state.scps.find((scp) => game.getSCPDefinition(scp.definitionId).objectClass === "Keter");
  assert.ok(keter);
  keter.contained = true;
  keter.breachRisk = 24;
  state.flags["last-random-event"] = 999999;
  state.speed = 4;
  game.advanceSimulation(state, 1);
  assert.equal(state.flags["stable-keter-days"], 0);
  keter.breachRisk = 26;
  game.advanceSimulation(state, 1);
  assert.equal(state.flags["stable-keter-minutes"], 0);
  keter.breachRisk = 24;
  for (let index = 0; index < 6; index += 1) game.advanceSimulation(state, 240);
  assert.equal(state.flags["stable-keter-days"], 1);
});

test("une vérification ciblée neutralise une compromission interne", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 449);
  const member = state.staff.find((entry) => entry.role !== "director");
  assert.ok(member);
  member.compromised = true;
  const command = state.reputation.command;
  const result = game.vetStaff(state, member.id);
  assert.equal(result.ok, true);
  assert.equal(member.compromised, false);
  assert.ok(state.reputation.command > command);
});

test("une sauvegarde provenant d'une version future est rejetée sans modifier la partie", () => {
  const game = loadGameNamespace();
  const current = game.createNewGame("campaign", "standard", 999);
  const future = JSON.parse(JSON.stringify(current));
  future.version = "999.0.0";
  assert.equal(game.importSave(JSON.stringify(future)), undefined);
  assert.equal(current.seed, 999);
  assert.equal(current.version, game.GAME_VERSION);
});

test("une version de sauvegarde mal formée est refusée", () => {
  const game = loadGameNamespace();
  assert.equal(game.importSave(JSON.stringify({ version: "not-a-version" })), undefined);
  assert.equal(game.importSave(JSON.stringify({ version: "0." + "9".repeat(400) + ".0" })), undefined);
  assert.equal(game.importSave(JSON.stringify({ version: "0.9007199254740992.0" })), undefined);
});

test("la réduction des animations ne change pas les déplacements simulés", () => {
  const game = loadGameNamespace();
  const normal = game.createNewGame("campaign", "standard", 555);
  const reduced = game.createNewGame("campaign", "standard", 555);
  normal.settings.reducedMotion = false;
  reduced.settings.reducedMotion = true;
  for (const state of [normal, reduced]) {
    state.staff = state.staff.slice(0, 1);
    const member = state.staff[0];
    member.shift = "day";
    member.position = { layer: "surface", x: 1, y: 1 };
    member.targetRoomId = undefined;
    member.assignmentRoomId = state.surfaceRooms.find(room => room.type === "medical").id;
    member.path = [];
    member.pathIndex = 0;
    state.speed = 1;
    state.flags["last-random-event"] = 999999;
  }
  game.advanceSimulation(normal, 10);
  game.advanceSimulation(reduced, 10);
  assert.deepEqual(
    JSON.parse(JSON.stringify(normal.staff[0].position)),
    JSON.parse(JSON.stringify(reduced.staff[0].position))
  );
});

test("un agent ne reçoit pas les bénéfices d'une salle inaccessible", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 777);
  const member = state.staff.find(entry => entry.role === "guard");
  const canteen = state.surfaceRooms.find(room => room.type === "canteen");
  assert.ok(member && canteen);
  member.shift = "day";
  member.position = { layer: "surface", x: 0, y: 0 };
  member.needs.hunger = 90;
  member.targetRoomId = undefined;
  member.path = [];
  member.pathIndex = 0;
  // A full-height wall separates the start from food without covering either.
  state.surfaceRooms = [
    canteen,
    { ...state.surfaceRooms[0], id: "blocker", type: "medical", x: 1, y: 0,
      width: 1, height: state.surfaceHeight, queue: [], staffAssigned: [] }
  ];
  const before = member.needs.hunger;
  state.speed = 1;
  game.advanceSimulation(state, 1);
  assert.ok(member.needs.hunger >= before);
});

test("la navigation contourne les cases bloquées et refuse une destination isolée", () => {
  const game = loadGameNamespace();
  const blocked = new Set(["1,0", "1,1"]);
  const path = game.getManhattanPath({ x: 0, y: 0 }, { x: 2, y: 0 }, 3, 3, blocked);
  assert.ok(path.length > 0);
  assert.ok(path.every(point => !blocked.has(`${point.x},${point.y}`)));
  assert.deepEqual(JSON.parse(JSON.stringify(path.at(-1))), { x: 2, y: 0 });
  const sealed = new Set(["1,0", "0,1"]);
  assert.equal(game.getManhattanPath({ x: 0, y: 0 }, { x: 2, y: 2 }, 3, 3, sealed).length, 0);
});

test("un personnel en quarantaine conserve son statut même si le trajet est impossible", () => {
  const game = loadGameNamespace();
  const state = game.createNewGame("campaign", "standard", 880);
  const member = state.staff.find(entry => entry.role === "guard");
  assert.ok(member);
  member.shift = "day";
  member.needs.contamination = 90;
  member.status = "working";
  member.position = { layer: "surface", x: 0, y: 0 };
  state.speed = 1;
  game.advanceSimulation(state, 2);
  assert.equal(member.status, "quarantined");
});

test("les données imbriquées malformées sont refusées sans régénérer les collections", () => {
  const storage = new Map();
  const game = loadGameNamespace(storage);
  const original = game.createNewGame("campaign", "standard", 901);
  const snapshot = JSON.stringify(original);
  storage.set(game.SAVE_KEY, snapshot);
  const cases = [
    ["personnel incomplet", (state) => { state.staff = [{}]; }],
    ["membre nul dans une équipe valide", (state) => { state.staff.push(null); }],
    ["besoins manquants", (state) => { delete state.staff[0].needs; }],
    ["compétences nulles", (state) => { state.staff[0].skills = null; }],
    ["position absente", (state) => { delete state.staff[0].position; }],
    ["trajet mal formé", (state) => { state.staff[0].path = [{}]; }],
    ["file non tabulaire", (state) => { state.surfaceRooms[0].queue = {}; }],
    ["élément de file incomplet", (state) => { state.surfaceRooms[0].queue = [{ id: "broken" }]; }],
    ["améliorations mal formées", (state) => { state.surfaceRooms[0].upgrades = "broken"; }],
    ["caméra nulle", (state) => { state.camera.surface = null; }],
    ["type de bâtiment inconnu", (state) => { state.regionFacilities[0].type = "unknown"; }],
    ["zone de crise incomplète", (state) => { state.crisis.zones = [{ id: "broken" }]; }],
    ["objectifs non tabulaires", (state) => { state.campaign[0].objectives = {}; }],
    ["ressource textuelle", (state) => { state.resources.power = "broken"; }],
    ["indicateur imbriqué", (state) => { state.flags["broken"] = {}; }]
  ];
  for (const [name, corrupt] of cases) {
    const candidate = JSON.parse(snapshot);
    corrupt(candidate);
    assert.equal(game.importSave(JSON.stringify(candidate)), undefined, name);
    assert.equal(storage.get(game.SAVE_KEY), snapshot, name + ": la sauvegarde existante reste intacte");
    assert.equal(JSON.stringify(original), snapshot, name + ": la partie active reste intacte");
  }
});

test("une ancienne sauvegarde conserve ses objets et complète ses champs optionnels", () => {
  const game = loadGameNamespace();
  const previous = game.createNewGame("campaign", "standard", 902);
  previous.version = "0.9.0";
  previous.resources.funds = 4321;
  previous.elapsedMinutes = 120;
  previous.camera = { surface: { zoom: 1.2 } };
  previous.settings = { difficulty: "standard" };
  previous.staff.forEach((member) => {
    delete member.path;
    delete member.pathIndex;
    delete member.shift;
    delete member.loyalty;
    delete member.compromised;
    delete member.taskProgress;
  });
  previous.surfaceRooms.forEach((room) => {
    delete room.queue;
    delete room.staffAssigned;
    delete room.upgrades;
    delete room.enabled;
    delete room.powerPriority;
  });
  previous.regionFacilities.forEach((facility) => {
    delete facility.enabled;
    delete facility.staffed;
  });
  previous.undergroundRooms.forEach((room) => { delete room.powerPriority; });
  previous.procedures.forEach((procedure) => {
    delete procedure.notes;
    delete procedure.opticalMonitoring;
  });
  previous.scps.forEach((scp) => {
    delete scp.activeEffect;
    delete scp.transferred;
  });
  const staffIds = Array.from(previous.staff, (member) => member.id);
  const roomIds = Array.from(previous.surfaceRooms, (room) => room.id);
  const imported = game.importSave(JSON.stringify(previous));
  assert.ok(imported);
  assert.deepEqual(Array.from(imported.staff, (member) => member.id), staffIds);
  assert.deepEqual(Array.from(imported.surfaceRooms, (room) => room.id), roomIds);
  assert.equal(imported.resources.funds, 4321);
  assert.equal(imported.elapsedMinutes, 120);
  assert.equal(imported.camera.surface.zoom, 1.2);
  assert.equal(imported.camera.surface.offsetX, 0);
  assert.equal(imported.camera.surface.offsetY, 0);
  assert.equal(imported.camera.region.zoom, 1);
  assert.equal(imported.staff[0].loyalty, 70);
  assert.ok(imported.surfaceRooms.every((room) => room.enabled && Number.isFinite(room.powerPriority)));
  assert.ok(imported.regionFacilities.every((facility) => facility.enabled && typeof facility.staffed === "boolean"));
  assert.ok(imported.undergroundRooms.every((room) => Number.isFinite(room.powerPriority)));
  assert.ok(imported.procedures.every((procedure) => typeof procedure.notes === "string" && typeof procedure.opticalMonitoring === "boolean"));
  assert.ok(imported.scps.every((scp) => typeof scp.activeEffect === "string" && typeof scp.transferred === "boolean"));
  imported.speed = 1;
  assert.doesNotThrow(() => game.advanceSimulation(imported, 30));
  assert.ok(Object.values(imported.resources).every(Number.isFinite));
});

test("un emplacement récent corrompu laisse charger l'autre sauvegarde intacte", () => {
  const storage = new Map();
  const game = loadGameNamespace(storage);
  const invalid = game.createNewGame("campaign", "standard", 903);
  const valid = game.createNewGame("sandbox", "director", 904);
  invalid.savedAt = 20;
  invalid.staff[0].needs = null;
  valid.savedAt = 10;
  const manual = JSON.stringify(invalid);
  const automatic = JSON.stringify(valid);
  storage.set(game.SAVE_KEY, manual);
  storage.set(game.AUTOSAVE_KEY, automatic);
  const loaded = game.loadLatestGame();
  assert.ok(loaded);
  assert.equal(loaded.seed, 904);
  assert.equal(storage.get(game.SAVE_KEY), manual);
  assert.equal(storage.get(game.AUTOSAVE_KEY), automatic);
  storage.set(game.AUTOSAVE_KEY, manual);
  assert.equal(game.loadLatestGame(), undefined);
});

test("les dimensions invalides et nombres non finis sont refusés avant reprise", () => {
  const game = loadGameNamespace();
  const original = game.createNewGame("campaign", "standard", 905);
  const snapshot = JSON.stringify(original);
  for (const width of [0, -1, 1.5, 257, 1_000_000_000]) {
    const candidate = JSON.parse(snapshot);
    candidate.surfaceWidth = width;
    assert.equal(game.importSave(JSON.stringify(candidate)), undefined, "largeur " + width);
  }
  for (const mutate of [
    (state) => { state.undergroundLevels = 65; },
    (state) => { state.camera.surface.zoom = 0; },
    (state) => { state.camera.surface.offsetX = "broken"; },
    (state) => { state.staff[0].needs.health = null; },
    (state) => { state.staff[0].position.x = -1; },
    (state) => { state.staff[0].position.x = state.surfaceWidth; },
    (state) => { state.staff[0].path = [{ x: state.surfaceWidth, y: 0 }]; }
  ]) {
    const candidate = JSON.parse(snapshot);
    mutate(candidate);
    assert.equal(game.importSave(JSON.stringify(candidate)), undefined);
  }
  const overflowingNumber = snapshot.replace('"power":140', '"power":1e400');
  assert.notEqual(overflowingNumber, snapshot);
  assert.equal(game.importSave(overflowingNumber), undefined);
  // Changing dimensions cannot silently inherit a default layout outside the map.
  assert.equal(game.importSave(JSON.stringify({ version: "0.9.0", surfaceWidth: 1 })), undefined);
});


