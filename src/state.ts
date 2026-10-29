namespace SCPGame {
  const CONTAINMENT_ROOM_TAGS = ["safe", "euclid", "keter", "humanoid", "bio", "infohazard", "heavy", "temporal"];
  const LOAD_SCHEMA_VERSION = 2;
  const PROCEDURE_OPTION_UNLOCKS: Partial<Record<keyof ProcedureState, string>> = {
    backupPower: "backup-power",
    analogBackup: "analog-backup",
    biometricMonitoring: "biometric-monitoring",
    automatedLockdown: "automated-lockdown",
    humaneCare: "humane-care",
    isolatedNetwork: "isolated-network",
    redundantVentilation: "biological-control"
  };

  export function createEmptyCrisis(): CrisisState {
    return {
      active: false,
      type: "none",
      title: "Aucune crise active",
      description: "Le Site fonctionne dans les paramètres nominaux.",
      severity: 0,
      elapsed: 0,
      siteIntegrity: 100,
      veilExposure: 0,
      threatProgress: 0,
      zones: [],
      orders: [],
      log: []
    };
  }

  export function createDefaultProcedure(scpId: string): ProcedureState {
    const definition = getSCPDefinition(scpId);
    const isEarlySafe = definition.objectClass === "Safe" && definition.risk <= 4;
    return {
      id: uid("proc"),
      scpId,
      version: 1,
      observationLevel: definition.requirements.procedureFlags.includes("observation") ? 58 : 38,
      assignedStaff: Math.max(1, Object.values(definition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0) - 1),
      maintenanceFrequency: definition.objectClass === "Keter" ? 62 : isEarlySafe ? 48 : 52,
      backupPower: false,
      analogBackup: false,
      biometricMonitoring: false,
      opticalMonitoring: !definition.requirements.procedureFlags.includes("no-optical"),
      automatedLockdown: false,
      humaneCare: false,
      restrictedTesting: false,
      isolatedNetwork: false,
      redundantVentilation: false,
      trainingRequired: definition.requirements.procedureFlags.includes("training") ? 48 : 28,
      notes: `Procédure initiale générée pour ${definition.designation}. À réviser après observation et incident.`,
      compliance: 50,
      complexity: 40
    };
  }

  function baseSkillsForRole(role: StaffRole, rng: SeededRandom): SkillSet {
    const base: SkillSet = {
      research: rng.int(5, 25),
      security: rng.int(5, 25),
      engineering: rng.int(5, 25),
      medicine: rng.int(5, 25),
      logistics: rng.int(5, 25),
      administration: rng.int(5, 25),
      memetics: rng.int(0, 12)
    };
    const boost = rng.int(35, 60);
    switch (role) {
      case "director": base.administration += boost; base.security += 18; base.research += 15; break;
      case "researcher": base.research += boost; base.memetics += rng.int(10, 28); break;
      case "guard": base.security += boost; base.engineering += 8; break;
      case "engineer": base.engineering += boost; base.logistics += 12; break;
      case "medic": base.medicine += boost; base.research += 10; break;
      case "logistics": base.logistics += boost; base.engineering += 8; break;
      case "admin": base.administration += boost; base.logistics += 10; break;
      case "mtf": base.security += boost + 12; base.medicine += 8; base.engineering += 8; break;
    }
    Object.keys(base).forEach((key) => {
      base[key as keyof SkillSet] = clamp(base[key as keyof SkillSet], 0, 100);
    });
    return base;
  }

  export function createStaffMember(role: StaffRole, rng: SeededRandom, index = 0): StaffMember {
    const salaryBase: Record<StaffRole, number> = {
      director: 520,
      researcher: 290,
      guard: 230,
      engineer: 270,
      medic: 285,
      logistics: 205,
      admin: 215,
      mtf: 380
    };
    const traits = [rng.pick(STAFF_TRAITS)];
    if (rng.chance(0.28)) {
      const second = rng.pick(STAFF_TRAITS.filter((trait) => trait !== traits[0]));
      traits.push(second);
    }
    const clearanceBase: Record<StaffRole, number> = {
      director: 4,
      researcher: 2,
      guard: 2,
      engineer: 1,
      medic: 2,
      logistics: 1,
      admin: 2,
      mtf: 3
    };
    const clearance = clamp(clearanceBase[role] + (rng.chance(0.22) ? 1 : 0), 0, 5) as 0 | 1 | 2 | 3 | 4 | 5;
    return {
      id: uid("staff"),
      name: `${rng.pick(STAFF_FIRST_NAMES)} ${rng.pick(STAFF_LAST_NAMES)}`,
      role,
      clearance,
      salary: salaryBase[role] + rng.int(-25, 55),
      skills: baseSkillsForRole(role, rng),
      traits,
      needs: {
        fatigue: rng.int(2, 15),
        hunger: rng.int(0, 12),
        stress: rng.int(4, 18),
        morale: rng.int(65, 88),
        health: 100,
        contamination: 0
      },
      status: role === "director" ? "working" : (index % 3 === 0 ? "moving" : "working"),
      position: { layer: "surface", x: 3 + (index % 4), y: 7 + Math.floor(index / 4) % 4 },
      path: [],
      pathIndex: 0,
      shift: index % 3 === 0 ? "night" : "day",
      experience: rng.int(0, 25),
      loyalty: rng.int(55, 90),
      compromised: false,
      taskProgress: 0
    };
  }

  function createFacility(type: RegionFacilityType, x: number, y: number): RegionFacility {
    const definition = getRegionDefinition(type);
    return {
      id: uid("facility"),
      type,
      x,
      y,
      width: definition.size.x,
      height: definition.size.y,
      level: 1,
      condition: 100,
      staffed: type !== "watchtower" && type !== "checkpoint",
      enabled: true
    };
  }

  function createSurfaceRoom(type: SurfaceRoomType, x: number, y: number, width?: number, height?: number): SurfaceRoom {
    const definition = getSurfaceDefinition(type);
    return {
      id: uid("surface"),
      type,
      x,
      y,
      width: width ?? definition.minSize.x,
      height: height ?? definition.minSize.y,
      level: 1,
      condition: 100,
      cleanliness: 100,
      staffAssigned: [],
      queue: [],
      upgrades: [],
      enabled: true,
      powerPriority: type === "elevator" || type === "medical" || type === "command-center" ? 3 : 2
    };
  }

  function createUndergroundRoom(type: UndergroundRoomType, x: number, level: number, width?: number): UndergroundRoom {
    const definition = getUndergroundDefinition(type);
    return {
      id: uid("underground"),
      type,
      x,
      level,
      width: width ?? definition.width,
      condition: 100,
      staffAssigned: [],
      upgrades: [],
      enabled: true,
      powerPriority: definition.tags.includes("keter") || definition.tags.includes("bio") ? 3 : 2,
      sealed: false
    };
  }

  function createInitialFacilities(): RegionFacility[] {
    return [
      createFacility("cover-office", 8, 4),
      createFacility("parking", 5, 5),
      createFacility("power-plant", 12, 3),
      createFacility("water-treatment", 12, 7),
      createFacility("supply-depot", 7, 9),
      createFacility("checkpoint", 3, 7),
      createFacility("road", 4, 7),
      createFacility("road", 5, 7),
      createFacility("road", 6, 7),
      createFacility("road", 7, 7),
      createFacility("green-zone", 4, 2)
    ];
  }

  function createInitialSurfaceRooms(): SurfaceRoom[] {
    return [
      createSurfaceRoom("reception", 1, 1, 4, 3),
      createSurfaceRoom("checkpoint", 5, 1, 4, 3),
      createSurfaceRoom("administration", 10, 1, 4, 3),
      createSurfaceRoom("medical", 15, 1, 5, 4),
      createSurfaceRoom("intake", 1, 6, 6, 4),
      createSurfaceRoom("laboratory", 8, 6, 5, 4),
      createSurfaceRoom("maintenance", 14, 6, 5, 4),
      createSurfaceRoom("warehouse", 20, 6, 5, 4),
      createSurfaceRoom("staff-room", 2, 12, 4, 3),
      createSurfaceRoom("canteen", 7, 12, 5, 3),
      createSurfaceRoom("restroom", 13, 12, 3, 3),
      createSurfaceRoom("elevator", 20, 12, 4, 4),
      createSurfaceRoom("corridor", 1, 5, 24, 1),
      createSurfaceRoom("corridor", 1, 10, 24, 1),
      createSurfaceRoom("corridor", 0, 0, 1, 16)
    ];
  }

  function createInitialUndergroundRooms(): UndergroundRoom[] {
    return [
      createUndergroundRoom("elevator-shaft", 18, 0, 1),
      createUndergroundRoom("elevator-shaft", 18, 1, 1),
      createUndergroundRoom("elevator-shaft", 18, 2, 1),
      createUndergroundRoom("service-tunnel", 8, 0, 5),
      createUndergroundRoom("security-post", 14, 0, 2),
      createUndergroundRoom("safe-containment", 2, 0, 3),
      createUndergroundRoom("euclid-containment", 4, 1, 3),
      createUndergroundRoom("research-lab", 10, 1, 3),
      createUndergroundRoom("power-node", 14, 1, 2),
      createUndergroundRoom("air-filtration", 14, 2, 2)
    ];
  }

  function createInitialStaff(seed: number): StaffMember[] {
    const rng = new SeededRandom(seed + 77);
    const roles: StaffRole[] = [
      "director", "admin", "admin", "researcher", "researcher", "researcher",
      "guard", "guard", "guard", "guard", "engineer", "engineer", "medic", "medic", "logistics", "logistics"
    ];
    return roles.map((role, index) => createStaffMember(role, rng, index));
  }

  function createInitialScps(currentChapter = 0): SCPInstance[] {
    return SCP_DEFINITIONS.map((definition) => {
      const discovered = definition.unlockedAt <= currentChapter;
      return {
        id: uid("scp-instance"),
        definitionId: definition.id,
        contained: false,
        discovered,
        researchProgress: 0,
        knowledge: discovered ? 20 : 0,
        breachRisk: discovered ? 8 + definition.risk : 0,
        mood: 70,
        health: 100,
        activeEffect: "En attente de transfert",
        procedureId: "",
        daysContained: 0,
        incidents: 0,
        transferred: false
      };
    });
  }

  export function createNewGame(mode: "campaign" | "sandbox", difficulty: Difficulty, seed = Date.now() % 2_147_483_647): GameState {
    const difficultyMultiplier = getDifficultyMultiplier(difficulty);
    const scps = createInitialScps(mode === "sandbox" ? 5 : 0);
    const procedures = scps.map((scp) => createDefaultProcedure(scp.definitionId));
    scps.forEach((scp) => {
      const procedure = procedures.find((candidate) => candidate.scpId === scp.definitionId);
      scp.procedureId = procedure?.id ?? "";
    });

    const state: GameState = {
      version: GAME_VERSION,
      savedAt: Date.now(),
      seed,
      mode,
      settings: {
        difficulty,
        reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
        highContrast: false,
        audio: true,
        autoPauseCritical: true,
        tutorial: true,
        language: "fr"
      },
      view: "region",
      speed: 1,
      previousSpeed: 1,
      day: 1,
      minuteOfDay: 6 * 60,
      elapsedMinutes: 0,
      resources: {
        funds: Math.round(72_000 / difficultyMultiplier),
        power: 140,
        powerCapacity: 160,
        water: 120,
        waterCapacity: 150,
        food: 45,
        medical: 28,
        parts: 42,
        chemicals: 24,
        ammo: 32,
        intel: 18,
        research: 10
      },
      reputation: {
        command: 55,
        personnel: 65,
        cover: 68,
        ethics: 62,
        suspicion: 18
      },
      regionWidth: 20,
      regionHeight: 14,
      surfaceWidth: 26,
      surfaceHeight: 17,
      undergroundWidth: 22,
      undergroundLevels: 10,
      regionFacilities: createInitialFacilities(),
      surfaceRooms: createInitialSurfaceRooms(),
      undergroundRooms: createInitialUndergroundRooms(),
      staff: createInitialStaff(seed),
      workItems: [],
      scps,
      procedures,
      researchNodes: RESEARCH_NODE_TEMPLATES.map((node) => ({ ...deepClone(node), completed: mode === "sandbox" })),
      events: [],
      crisis: createEmptyCrisis(),
      campaign: deepClone(CAMPAIGN_TEMPLATE),
      currentChapter: mode === "sandbox" ? 5 : 0,
      notifications: [],
      history: [],
      flags: {
        "crisis-success-count": 0,
        "stable-keter-days": 0,
        "tutorial-seen": false,
        "last-random-event": 0,
        "last-work-spawn": 0,
        "last-daily-update": 0,
        "surface-blackout": false,
        "rationing": false
      },
      camera: {
        region: { zoom: 1, offsetX: 0, offsetY: 0 },
        surface: { zoom: 1, offsetX: 0, offsetY: 0 },
        underground: { zoom: 1, offsetX: 0, offsetY: 0 },
        command: { zoom: 1, offsetX: 0, offsetY: 0 },
        management: { zoom: 1, offsetX: 0, offsetY: 0 }
      },
      lastAutosave: 0,
      gameOver: false,
      victory: false
    };

    autoAssignStaff(state);
    logHistory(state, "Prise de commandement du Site Deep Protocol.");
    addNotification(state, "Bienvenue, Directeur", "Stabilisez la couverture, organisez la surface et préparez les premiers confinements.", "info");
    return state;
  }

  export function getUnlockTier(state: GameState): number {
    if (state.mode === "sandbox") return 99;
    return state.currentChapter;
  }

  export function isResearchUnlockActive(state: GameState, unlock: string): boolean {
    return state.researchNodes.some((node) => node.completed && node.unlocks.includes(unlock));
  }

  export function getProcedureOptionUnlock(key: keyof ProcedureState): string | undefined {
    return PROCEDURE_OPTION_UNLOCKS[key];
  }

  export function isProcedureOptionUnlocked(state: GameState, key: keyof ProcedureState): boolean {
    const unlock = getProcedureOptionUnlock(key);
    return !unlock || isResearchUnlockActive(state, unlock);
  }

  export function isRegionDefinitionUnlocked(state: GameState, definition: RegionFacilityDefinition): boolean {
    return definition.unlockedAt <= getUnlockTier(state);
  }

  export function isSurfaceDefinitionUnlocked(state: GameState, definition: SurfaceRoomDefinition): boolean {
    if (definition.unlockedAt > getUnlockTier(state)) return false;
    if (definition.type === "mtf-bay") return state.mode === "sandbox" || isResearchUnlockActive(state, "mtf-bay") || state.currentChapter >= 3;
    return true;
  }

  export function isUndergroundDefinitionUnlocked(state: GameState, definition: UndergroundRoomDefinition): boolean {
    if (definition.unlockedAt > getUnlockTier(state)) return false;
    const researchGate: Partial<Record<UndergroundRoomType, string>> = {
      "euclid-containment": "euclid-containment",
      "heavy-containment": "heavy-containment",
      "keter-containment": "keter-containment",
      "bio-containment": "bio-containment",
      "infohazard-vault": "infohazard-vault",
      "power-node": "power-node",
      "air-filtration": "air-filtration",
      "acid-system": "acid-system",
      "temporal-lock": "temporal-lock"
    };
    const unlock = researchGate[definition.type];
    if (!unlock) return true;
    return state.mode === "sandbox" || isResearchUnlockActive(state, unlock) || state.currentChapter >= definition.unlockedAt + 1;
  }

  export function logHistory(state: GameState, message: string): void {
    state.history.unshift(`${formatTime(state.day, state.minuteOfDay)} — ${message}`);
    if (state.history.length > 180) state.history.length = 180;
  }

  export function addNotification(state: GameState, title: string, message: string, severity: EventSeverity = "info"): void {
    state.notifications.unshift({
      id: uid("note"),
      time: state.elapsedMinutes,
      title,
      message,
      severity,
      read: false
    });
    if (state.notifications.length > 60) state.notifications.length = 60;
  }

  export function setView(state: GameState, view: ViewMode): void {
    state.view = view;
    state.buildSelection = undefined;
    state.selectedId = undefined;
    state.selectedType = undefined;
  }

  export function setSpeed(state: GameState, speed: GameSpeed): void {
    if (state.crisis.active && speed === 4) speed = 2;
    if (speed > 0) state.previousSpeed = speed;
    state.speed = speed;
  }

  export function togglePause(state: GameState): void {
    state.speed = state.speed === 0 ? (state.previousSpeed || 1) : 0;
  }

  export function startBuild(state: GameState, layer: Layer, type: BuildType): void {
    state.buildSelection = { layer, type, rotation: 0 };
    state.selectedId = undefined;
    state.selectedType = undefined;
  }

  export function cancelBuild(state: GameState): void {
    state.buildSelection = undefined;
  }

  export function buildRegionFacility(state: GameState, type: RegionFacilityType, x: number, y: number): { ok: boolean; message: string } {
    const definition = getRegionDefinition(type);
    if (!isRegionDefinitionUnlocked(state, definition)) return { ok: false, message: "Installation non autorisée à ce stade." };
    if (x < 0 || y < 0 || x + definition.size.x > state.regionWidth || y + definition.size.y > state.regionHeight) return { ok: false, message: "Construction hors de la carte." };
    const candidate = { x, y, width: definition.size.x, height: definition.size.y };
    if (state.regionFacilities.some((facility) => rectanglesOverlap(candidate, facility))) return { ok: false, message: "La zone est déjà occupée." };
    if (!payCost(state.resources, definition.cost)) return { ok: false, message: "Ressources insuffisantes." };
    const facility = createFacility(type, x, y);
    state.regionFacilities.push(facility);
    state.selectedId = facility.id;
    state.selectedType = "facility";
    state.reputation.cover = clamp(state.reputation.cover + (definition.coverImpact ?? 0), 0, 100);
    state.reputation.suspicion = clamp(state.reputation.suspicion + (definition.suspicionImpact ?? 0), 0, 100);
    logHistory(state, `${definition.name} construit dans la région.`);
    return { ok: true, message: `${definition.name} opérationnel.` };
  }

  export function buildSurfaceRoom(state: GameState, type: SurfaceRoomType, x: number, y: number): { ok: boolean; message: string } {
    const definition = getSurfaceDefinition(type);
    if (!isSurfaceDefinitionUnlocked(state, definition)) return { ok: false, message: "Salle non autorisée ou recherche manquante." };
    const width = definition.minSize.x;
    const height = definition.minSize.y;
    if (x < 0 || y < 0 || x + width > state.surfaceWidth || y + height > state.surfaceHeight) return { ok: false, message: "Construction hors du complexe." };
    const candidate = { x, y, width, height };
    if (state.surfaceRooms.some((room) => rectanglesOverlap(candidate, room))) return { ok: false, message: "La zone est déjà occupée." };
    if (!payCost(state.resources, definition.cost)) return { ok: false, message: "Ressources insuffisantes." };
    const room = createSurfaceRoom(type, x, y);
    state.surfaceRooms.push(room);
    state.selectedId = room.id;
    state.selectedType = "surface-room";
    autoAssignStaff(state);
    logHistory(state, `${definition.name} aménagé à la surface.`);
    return { ok: true, message: `${definition.name} prêt à être utilisé.` };
  }

  export function buildUndergroundRoom(state: GameState, type: UndergroundRoomType, x: number, level: number): { ok: boolean; message: string } {
    const definition = getUndergroundDefinition(type);
    if (!isUndergroundDefinitionUnlocked(state, definition)) return { ok: false, message: "Module non autorisé ou recherche manquante." };
    if (level < 0 || level >= state.undergroundLevels || x < 0 || x + definition.width > state.undergroundWidth) return { ok: false, message: "Construction hors des limites géologiques." };
    if (level >= 5 && !isResearchUnlockActive(state, "level-5-plus") && state.mode !== "sandbox") return { ok: false, message: "L'excavation profonde n'est pas encore maîtrisée." };
    const candidate = { x, level, width: definition.width };
    if (state.undergroundRooms.some((room) => undergroundOverlap(candidate, room))) return { ok: false, message: "Ce volume est déjà occupé." };
    const depthCostMultiplier = 1 + level * 0.12;
    const scaledCost: Cost = {};
    Object.entries(definition.cost).forEach(([key, amount]) => {
      scaledCost[key as keyof Cost] = Math.ceil((amount as number) * depthCostMultiplier);
    });
    if (!payCost(state.resources, scaledCost)) return { ok: false, message: "Ressources insuffisantes pour cette profondeur." };
    const room = createUndergroundRoom(type, x, level);
    state.undergroundRooms.push(room);
    state.selectedId = room.id;
    state.selectedType = "underground-room";
    autoAssignStaff(state);
    logHistory(state, `${definition.name} construit au niveau -${level + 1}.`);
    return { ok: true, message: `${definition.name} opérationnel au niveau -${level + 1}.` };
  }

  export function upgradeSelected(state: GameState): { ok: boolean; message: string } {
    if (!state.selectedId || !state.selectedType) return { ok: false, message: "Aucun élément sélectionné." };
    if (state.selectedType === "facility") {
      const facility = state.regionFacilities.find((entry) => entry.id === state.selectedId);
      if (!facility) return { ok: false, message: "Installation introuvable." };
      const cost = { funds: 3000 * facility.level, parts: 5 * facility.level };
      if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes." };
      facility.level += 1;
      facility.condition = 100;
      return { ok: true, message: `Installation améliorée au niveau ${facility.level}.` };
    }
    if (state.selectedType === "surface-room") {
      const room = state.surfaceRooms.find((entry) => entry.id === state.selectedId);
      if (!room) return { ok: false, message: "Salle introuvable." };
      const cost = { funds: 2500 * room.level, parts: 5 * room.level };
      if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes." };
      room.level += 1;
      room.condition = 100;
      room.cleanliness = 100;
      room.upgrades.push(`Optimisation ${room.level}`);
      return { ok: true, message: `Salle améliorée au niveau ${room.level}.` };
    }
    if (state.selectedType === "underground-room") {
      const room = state.undergroundRooms.find((entry) => entry.id === state.selectedId);
      if (!room) return { ok: false, message: "Module introuvable." };
      const cost = { funds: 4000 + room.upgrades.length * 2000, parts: 8 + room.upgrades.length * 3 };
      if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes." };
      room.condition = 100;
      room.upgrades.push(`Blindage ${room.upgrades.length + 1}`);
      return { ok: true, message: "Blindage et redondance améliorés." };
    }
    return { ok: false, message: "Cet élément ne peut pas être amélioré." };
  }

  export function demolishSelected(state: GameState): { ok: boolean; message: string } {
    if (!state.selectedId || !state.selectedType) return { ok: false, message: "Aucun élément sélectionné." };
    if (state.selectedType === "facility") {
      const index = state.regionFacilities.findIndex((entry) => entry.id === state.selectedId);
      if (index < 0) return { ok: false, message: "Installation introuvable." };
      const facility = state.regionFacilities[index];
      const definition = getRegionDefinition(facility.type);
      state.regionFacilities.splice(index, 1);
      addResource(state.resources, "funds", (definition.cost.funds ?? 0) * 0.35);
      addResource(state.resources, "parts", (definition.cost.parts ?? 0) * 0.4);
      state.selectedId = undefined;
      state.selectedType = undefined;
      return { ok: true, message: "Installation démontée et matériaux récupérés." };
    }
    if (state.selectedType === "surface-room") {
      const index = state.surfaceRooms.findIndex((entry) => entry.id === state.selectedId);
      if (index < 0) return { ok: false, message: "Salle introuvable." };
      const room = state.surfaceRooms[index];
      if (room.type === "elevator" && state.undergroundRooms.some((entry) => entry.type === "elevator-shaft")) return { ok: false, message: "Impossible de retirer l'ascenseur tant que les puits inférieurs existent." };
      const definition = getSurfaceDefinition(room.type);
      state.surfaceRooms.splice(index, 1);
      addResource(state.resources, "funds", (definition.cost.funds ?? 0) * 0.35);
      addResource(state.resources, "parts", (definition.cost.parts ?? 0) * 0.4);
      state.staff.forEach((member) => {
        if (member.assignmentRoomId === room.id) member.assignmentRoomId = undefined;
      });
      state.selectedId = undefined;
      state.selectedType = undefined;
      autoAssignStaff(state);
      return { ok: true, message: "Salle démantelée." };
    }
    if (state.selectedType === "underground-room") {
      const index = state.undergroundRooms.findIndex((entry) => entry.id === state.selectedId);
      if (index < 0) return { ok: false, message: "Module introuvable." };
      const room = state.undergroundRooms[index];
      if (room.scpId) return { ok: false, message: "Transférez le SCP avant de démanteler sa cellule." };
      const definition = getUndergroundDefinition(room.type);
      state.undergroundRooms.splice(index, 1);
      addResource(state.resources, "funds", (definition.cost.funds ?? 0) * 0.3);
      addResource(state.resources, "parts", (definition.cost.parts ?? 0) * 0.4);
      state.selectedId = undefined;
      state.selectedType = undefined;
      return { ok: true, message: "Module souterrain condamné et récupéré." };
    }
    return { ok: false, message: "Cet élément ne peut pas être démoli." };
  }

  export function repairSelected(state: GameState): { ok: boolean; message: string } {
    if (!state.selectedId || !state.selectedType) return { ok: false, message: "Aucun élément sélectionné." };
    const target = state.selectedType === "facility"
      ? state.regionFacilities.find((entry) => entry.id === state.selectedId)
      : state.selectedType === "surface-room"
        ? state.surfaceRooms.find((entry) => entry.id === state.selectedId)
        : state.selectedType === "underground-room"
          ? state.undergroundRooms.find((entry) => entry.id === state.selectedId)
          : undefined;
    if (!target) return { ok: false, message: "Élément introuvable." };
    const cost = { funds: 800, parts: 3 };
    if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes." };
    if (state.selectedType === "facility") {
      target.condition = 100;
    } else if (state.selectedType === "surface-room") {
      target.condition = 100;
      (target as SurfaceRoom).cleanliness = 100;
    } else if (state.selectedType === "underground-room") {
      target.condition = 100;
    }
    return { ok: true, message: "Maintenance corrective terminée." };
  }

  export function hireStaff(state: GameState, role: StaffRole): { ok: boolean; message: string } {
    const hireCost: Record<StaffRole, number> = {
      director: 6000,
      researcher: 2200,
      guard: 1800,
      engineer: 2100,
      medic: 2300,
      logistics: 1600,
      admin: 1700,
      mtf: 4200
    };
    if (role === "director" && state.staff.some((member) => member.role === "director" && member.status !== "dead")) return { ok: false, message: "Le Site possède déjà un directeur actif." };
    if (role === "mtf" && state.mode !== "sandbox" && state.currentChapter < 3 && !isResearchUnlockActive(state, "mtf-bay")) return { ok: false, message: "Recrutement FTM non autorisé." };
    if (state.resources.funds < hireCost[role]) return { ok: false, message: "Crédits insuffisants." };
    state.resources.funds -= hireCost[role];
    const rng = new SeededRandom(state.seed + state.staff.length * 971 + state.elapsedMinutes);
    const member = createStaffMember(role, rng, state.staff.length);
    state.staff.push(member);
    autoAssignStaff(state);
    logHistory(state, `${member.name} rejoint le Site comme ${ROLE_LABELS[role]}.`);
    return { ok: true, message: `${member.name} recruté.` };
  }

  export function dismissStaff(state: GameState, staffId: string): { ok: boolean; message: string } {
    const index = state.staff.findIndex((member) => member.id === staffId);
    if (index < 0) return { ok: false, message: "Personnel introuvable." };
    const member = state.staff[index];
    if (member.role === "director") return { ok: false, message: "Le directeur ne peut pas se renvoyer lui-même." };
    state.staff.splice(index, 1);
    state.surfaceRooms.forEach((room) => room.staffAssigned = room.staffAssigned.filter((id) => id !== staffId));
    state.undergroundRooms.forEach((room) => room.staffAssigned = room.staffAssigned.filter((id) => id !== staffId));
    state.reputation.personnel = clamp(state.reputation.personnel - 1, 0, 100);
    return { ok: true, message: `${member.name} a quitté le Site.` };
  }

  export function autoAssignStaff(state: GameState): void {
    state.surfaceRooms.forEach((room) => room.staffAssigned = []);
    state.undergroundRooms.forEach((room) => room.staffAssigned = []);
    const unavailable: StaffStatus[] = ["dead", "quarantined", "injured", "training"];
    const available = state.staff.filter((member) => !unavailable.includes(member.status));
    const assigned = new Set<string>();

    const assignRole = (roomId: string, role: StaffRole, count: number, underground = false): void => {
      const candidates = available
        .filter((member) => member.role === role && !assigned.has(member.id))
        .sort((a, b) => b.experience - a.experience);
      const selected = candidates.slice(0, count);
      selected.forEach((member) => {
        assigned.add(member.id);
        member.assignmentRoomId = roomId;
        if (underground) {
          const room = state.undergroundRooms.find((entry) => entry.id === roomId);
          room?.staffAssigned.push(member.id);
        } else {
          const room = state.surfaceRooms.find((entry) => entry.id === roomId);
          room?.staffAssigned.push(member.id);
        }
      });
    };

    state.surfaceRooms
      .filter((room) => room.enabled)
      .sort((a, b) => getSurfaceDefinition(b.type).security - getSurfaceDefinition(a.type).security)
      .forEach((room) => {
        const definition = getSurfaceDefinition(room.type);
        Object.entries(definition.requiredRoles).forEach(([role, count]) => assignRole(room.id, role as StaffRole, count ?? 0, false));
      });

    state.undergroundRooms
      .filter((room) => room.enabled && room.scpId)
      .forEach((room) => {
        const scp = state.scps.find((entry) => entry.id === room.scpId);
        if (!scp) return;
        const definition = getSCPDefinition(scp.definitionId);
        Object.entries(definition.requirements.staff).forEach(([role, count]) => assignRole(room.id, role as StaffRole, count ?? 0, true));
      });

    available.filter((member) => !assigned.has(member.id)).forEach((member) => {
      member.assignmentRoomId = undefined;
    });
  }

  export function trainStaff(state: GameState, staffId: string): { ok: boolean; message: string } {
    const member = state.staff.find((entry) => entry.id === staffId);
    if (!member) return { ok: false, message: "Personnel introuvable." };
    if (["dead", "quarantined", "injured", "training"].includes(member.status)) return { ok: false, message: "Ce membre n'est pas disponible pour une formation." };
    const trainingRoom = state.surfaceRooms.find((room) => room.type === "training" && room.enabled);
    const briefingRoom = state.surfaceRooms.find((room) => room.type === "briefing" && room.enabled);
    if (!trainingRoom && !briefingRoom) return { ok: false, message: "Construisez un centre de formation ou une salle de briefing." };
    const cost = { funds: 900, intel: 1 };
    if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes." };
    member.status = "training";
    member.taskProgress = 0;
    member.targetRoomId = trainingRoom?.id ?? briefingRoom?.id;
    autoAssignStaff(state);
    return { ok: true, message: `${member.name} suit une formation spécialisée.` };
  }

  export function setStaffShift(state: GameState, staffId: string, shift: "day" | "night"): { ok: boolean; message: string } {
    const member = state.staff.find((entry) => entry.id === staffId);
    if (!member) return { ok: false, message: "Personnel introuvable." };
    if (member.role === "director") return { ok: false, message: "Le directeur conserve une astreinte permanente." };
    member.shift = shift;
    member.needs.stress = clamp(member.needs.stress + 2, 0, 100);
    autoAssignStaff(state);
    return { ok: true, message: `${member.name} passe en équipe de ${shift === "day" ? "jour" : "nuit"}.` };
  }

  export function vetStaff(state: GameState, staffId: string): { ok: boolean; message: string } {
    const member = state.staff.find((entry) => entry.id === staffId);
    if (!member) return { ok: false, message: "Personnel introuvable." };
    const cost = { funds: 700, intel: 1 };
    if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes." };
    const threatNeutralized = member.compromised;
    member.loyalty = clamp(member.loyalty + 8, 0, 100);
    member.compromised = false;
    member.needs.stress = clamp(member.needs.stress + 4, 0, 100);
    state.reputation.personnel = clamp(state.reputation.personnel - 0.4, 0, 100);
    if (threatNeutralized) {
      state.resources.intel += 4;
      state.reputation.command = clamp(state.reputation.command + 2, 0, 100);
      state.reputation.suspicion = clamp(state.reputation.suspicion - 2, 0, 100);
      addNotification(state, "Menace interne neutralisée", `${member.name} a été isolé du réseau opérationnel puis revalidé.`, "major");
      logHistory(state, `Contrôle de sécurité : compromission de ${member.name} neutralisée.`);
      return { ok: true, message: `Compromission détectée et neutralisée chez ${member.name}.` };
    }
    logHistory(state, `Contrôle de sécurité préventif terminé pour ${member.name}.`);
    return { ok: true, message: `${member.name} a été revalidé, aucun indicateur hostile.` };
  }

  export function researchNode(state: GameState, nodeId: string): { ok: boolean; message: string } {
    const node = state.researchNodes.find((entry) => entry.id === nodeId);
    if (!node) return { ok: false, message: "Recherche introuvable." };
    if (node.completed) return { ok: false, message: "Recherche déjà achevée." };
    if (!node.prerequisites.every((id) => state.researchNodes.some((entry) => entry.id === id && entry.completed))) return { ok: false, message: "Prérequis manquants." };
    if (state.resources.research < node.cost) return { ok: false, message: "Points de recherche insuffisants." };
    state.resources.research -= node.cost;
    node.completed = true;
    addNotification(state, "Recherche terminée", `${node.name} est maintenant disponible.`, "info");
    logHistory(state, `Recherche achevée : ${node.name}.`);
    return { ok: true, message: `${node.name} déverrouillé.` };
  }

  export function updateProcedure(state: GameState, scpId: string, updates: Partial<ProcedureState>): { ok: boolean; message: string } {
    const scp = state.scps.find((entry) => entry.id === scpId || entry.definitionId === scpId);
    if (!scp) return { ok: false, message: "SCP introuvable." };
    const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
    if (!procedure) return { ok: false, message: "Procédure introuvable." };
    const definition = getSCPDefinition(scp.definitionId);
    const requiredStaff = Object.values(definition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0);
    const minimumTraining = clamp(18 + definition.risk * 4, 20, 78);
    const booleanKeys = ["backupPower", "analogBackup", "biometricMonitoring", "opticalMonitoring", "automatedLockdown", "humaneCare", "restrictedTesting", "isolatedNetwork", "redundantVentilation"] as Array<keyof ProcedureState>;
    const lockedOption = booleanKeys.find((key) => updates[key] === true && !isProcedureOptionUnlocked(state, key));
    if (lockedOption) {
      const unlock = getProcedureOptionUnlock(lockedOption);
      const research = state.researchNodes.find((node) => unlock && node.unlocks.includes(unlock));
      return { ok: false, message: `Recherche requise : ${research?.name ?? unlock ?? "doctrine avancée"}.` };
    }
    const observation = Number(updates.observationLevel);
    const assigned = Number(updates.assignedStaff);
    const maintenance = Number(updates.maintenanceFrequency);
    const training = Number(updates.trainingRequired);
    if (Number.isFinite(observation)) procedure.observationLevel = clamp(Math.round(observation), 0, 100);
    if (Number.isFinite(assigned)) procedure.assignedStaff = clamp(Math.round(assigned), requiredStaff, Math.min(18, requiredStaff + 3));
    if (Number.isFinite(maintenance)) procedure.maintenanceFrequency = clamp(Math.round(maintenance), 20, 100);
    if (Number.isFinite(training)) procedure.trainingRequired = clamp(Math.round(training), minimumTraining, 100);
    booleanKeys.forEach((key) => {
      if (typeof updates[key] === "boolean") (procedure as unknown as Record<string, boolean>)[key] = Boolean(updates[key]);
    });
    if (typeof updates.notes === "string") procedure.notes = updates.notes;
    const enabledOptions = booleanKeys.filter((key) => Boolean((procedure as unknown as Record<string, unknown>)[key])).length;
    procedure.complexity = clamp(Math.round(24 + definition.risk * 3.2 + enabledOptions * 3 + procedure.observationLevel * 0.08 + procedure.maintenanceFrequency * 0.05), 25, 100);
    procedure.version += 1;
    procedure.notes = sanitizeText(procedure.notes);
    logHistory(state, `Procédure ${getSCPDefinition(scp.definitionId).designation} révisée en version ${procedure.version}.`);
    return { ok: true, message: `Procédure v${procedure.version} enregistrée.` };
  }

  export function getEffectiveRoomContainment(room: UndergroundRoom): number {
    return getUndergroundDefinition(room.type).containment + room.upgrades.length;
  }

  export function getEffectiveRoomSecurity(room: UndergroundRoom): number {
    return getUndergroundDefinition(room.type).security + room.upgrades.length;
  }

  export function getCompatibleRooms(state: GameState, scp: SCPInstance): UndergroundRoom[] {
    const definition = getSCPDefinition(scp.definitionId);
    return state.undergroundRooms.filter((room) => {
      if (room.id === scp.roomId) return false;
      if (room.scpId && room.scpId !== scp.id) return false;
      const roomDefinition = getUndergroundDefinition(room.type);
      const isContainmentRoom = roomDefinition.tags.some((tag) => CONTAINMENT_ROOM_TAGS.includes(tag));
      const tagMatch = definition.requirements.roomTags.some((tag) => roomDefinition.tags.includes(tag));
      return isContainmentRoom
        && tagMatch
        && getEffectiveRoomContainment(room) >= definition.requirements.minContainment
        && getEffectiveRoomSecurity(room) >= definition.requirements.minSecurity;
    });
  }

  export function transferSCP(state: GameState, scpId: string, roomId?: string): { ok: boolean; message: string } {
    const scp = state.scps.find((entry) => entry.id === scpId || entry.definitionId === scpId);
    if (!scp) return { ok: false, message: "Dossier introuvable." };
    if (!scp.discovered) return { ok: false, message: "Dossier non autorisé." };
    const definition = getSCPDefinition(scp.definitionId);
    const candidates = getCompatibleRooms(state, scp);
    const room = roomId ? candidates.find((entry) => entry.id === roomId) : candidates[0];
    if (!room) return { ok: false, message: `Aucune cellule compatible avec ${definition.designation}.` };
    if (room.id === scp.roomId) return { ok: false, message: `${definition.designation} occupe déjà cette cellule.` };
    const wasTransferred = scp.transferred;
    const relocationFactor = wasTransferred ? 0.55 : 1;
    const transferCost: Cost = {
      funds: Math.round((1800 + definition.risk * 280) * relocationFactor),
      ammo: Math.max(0, Math.ceil(definition.risk / (wasTransferred ? 5 : 3))),
      medical: Math.max(0, Math.ceil(definition.risk / (wasTransferred ? 8 : 5)))
    };
    if (!payCost(state.resources, transferCost)) return { ok: false, message: `Ressources insuffisantes pour sécuriser ${wasTransferred ? "la relocalisation" : "le transfert"}.` };
    const previousRisk = scp.breachRisk;
    if (scp.roomId) {
      const previous = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
      if (previous) previous.scpId = undefined;
    }
    room.scpId = scp.id;
    scp.roomId = room.id;
    scp.contained = true;
    scp.transferred = true;
    scp.activeEffect = "Confinement en stabilisation";
    scp.breachRisk = wasTransferred ? Math.max(previousRisk, definition.risk * 1.8) : Math.max(8, definition.risk * 1.8);
    autoAssignStaff(state);
    addNotification(state, `${definition.designation} transféré`, `${definition.name} est maintenant au niveau -${room.level + 1}.`, definition.objectClass === "Keter" ? "major" : "info");
    logHistory(state, `${definition.designation} transféré vers ${getUndergroundDefinition(room.type).name}.`);
    return { ok: true, message: `${definition.designation} confiné au niveau -${room.level + 1}.` };
  }

  export function saveGame(state: GameState, autosave = false): boolean {
    try {
      state.savedAt = Date.now();
      const serialized = JSON.stringify(state);
      localStorage.setItem(autosave ? AUTOSAVE_KEY : SAVE_KEY, serialized);
      state.lastAutosave = state.elapsedMinutes;
      return true;
    } catch (error) {
      console.error("Échec de sauvegarde", error);
      return false;
    }
  }

  export function loadGame(autosave = false): GameState | undefined {
    try {
      const raw = localStorage.getItem(autosave ? AUTOSAVE_KEY : SAVE_KEY);
      if (!raw) return undefined;
      return normalizeLoadedState(JSON.parse(raw));
    } catch (error) {
      console.error("Échec de chargement", error);
      return undefined;
    }
  }

  export function loadLatestGame(): GameState | undefined {
    const manual = loadGame(false);
    const auto = loadGame(true);
    if (!manual) return auto;
    if (!auto) return manual;
    return (auto.savedAt || 0) > (manual.savedAt || 0) ? auto : manual;
  }

  export function hasSavedGame(): boolean {
    try {
      return Boolean(localStorage.getItem(SAVE_KEY) || localStorage.getItem(AUTOSAVE_KEY));
    } catch (error) {
      console.warn("Stockage local indisponible", error);
      return false;
    }
  }

  export function exportSave(state: GameState): void {
    downloadText(`scp-site-director-J${state.day}.json`, JSON.stringify(state, null, 2));
  }

  export function importSave(raw: string): GameState | undefined {
    try {
      if (raw.length > 4_000_000) throw new Error("Sauvegarde trop volumineuse");
      return normalizeLoadedState(JSON.parse(raw));
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  export function continueAfterVictory(state: GameState): void {
    state.mode = "sandbox";
    state.victory = false;
    state.speed = 0;
    state.previousSpeed = 1;
    state.currentChapter = Math.max(state.currentChapter, state.campaign.length - 1);
    state.researchNodes.forEach((node) => node.completed = true);
    state.scps.forEach((scp) => scp.discovered = true);
    addNotification(state, "Mandat prolongé", "Le Site reste jouable en mode bac à sable avec tous les dossiers autorisés.", "info");
    logHistory(state, "Mandat Deep Protocol prolongé en exploitation libre.");
  }

  function normalizeLoadedState(candidate: unknown): GameState | undefined {
    if (!candidate || typeof candidate !== "object") return undefined;
    const raw = candidate as Partial<GameState>;
    if (typeof raw.version !== "string") return undefined;
    // A newer build may contain fields and semantics this runtime cannot safely interpret.
    const parseVersion = (value: string): number[] | undefined => {
      if (!/^\d+\.\d+\.\d+$/.test(value)) return undefined;
      return value.split(".").map(Number);
    };
    const incomingVersion = parseVersion(raw.version);
    const supportedVersion = parseVersion(GAME_VERSION);
    if (!incomingVersion || !supportedVersion) return undefined;
    for (let index = 0; index < 3; index += 1) {
      if (incomingVersion[index] > supportedVersion[index]) return undefined;
      if (incomingVersion[index] < supportedVersion[index]) break;
    }
    const mode = raw.mode === "sandbox" ? "sandbox" : "campaign";
    const difficulty = ["story", "standard", "director", "keter"].includes(String(raw.settings?.difficulty)) ? raw.settings!.difficulty : "standard";
    const seed = Number.isFinite(raw.seed) ? Number(raw.seed) : Date.now();
    const defaults = createNewGame(mode, difficulty, seed);
    const objectValue = <T extends object>(value: unknown, fallback: T): T => value && typeof value === "object" && !Array.isArray(value) ? { ...fallback, ...(value as Partial<T>) } : fallback;
    const arrayValue = <T>(value: unknown, fallback: T[]): T[] => Array.isArray(value) && value.every((entry) => entry && typeof entry === "object") ? value as T[] : fallback;
    const state: GameState = {
      ...defaults,
      ...raw,
      version: GAME_VERSION,
      seed,
      mode,
      settings: objectValue(raw.settings, defaults.settings),
      resources: objectValue(raw.resources, defaults.resources),
      reputation: objectValue(raw.reputation, defaults.reputation),
      regionFacilities: arrayValue<RegionFacility>(raw.regionFacilities, defaults.regionFacilities),
      surfaceRooms: arrayValue<SurfaceRoom>(raw.surfaceRooms, defaults.surfaceRooms),
      undergroundRooms: arrayValue<UndergroundRoom>(raw.undergroundRooms, defaults.undergroundRooms),
      staff: arrayValue<StaffMember>(raw.staff, defaults.staff),
      workItems: arrayValue<WorkItem>(raw.workItems, defaults.workItems),
      scps: arrayValue<SCPInstance>(raw.scps, defaults.scps),
      procedures: arrayValue<ProcedureState>(raw.procedures, defaults.procedures),
      researchNodes: arrayValue<ResearchNode>(raw.researchNodes, defaults.researchNodes),
      events: arrayValue<GameEvent>(raw.events, defaults.events),
      crisis: objectValue(raw.crisis, defaults.crisis),
      campaign: arrayValue<CampaignChapter>(raw.campaign, defaults.campaign),
      notifications: arrayValue<Notification>(raw.notifications, defaults.notifications),
      history: Array.isArray(raw.history) ? raw.history.filter((entry): entry is string => typeof entry === "string").slice(-500) : defaults.history,
      flags: objectValue(raw.flags, defaults.flags),
      camera: objectValue(raw.camera, defaults.camera),
      buildSelection: undefined
    };
    state.savedAt = typeof state.savedAt === "number" && Number.isFinite(state.savedAt) ? state.savedAt : Date.now() - Math.max(0, 1_000_000 - (state.elapsedMinutes || 0));
    state.speed = 0;
    state.previousSpeed = state.previousSpeed || 1;
    state.buildSelection = undefined;
    ["inspection-delayed", "night-overtime", "infiltration-shadowed", "infiltration-contained", "ethics-redacted"].forEach((key) => {
      const timestamp = Number(state.flags[`${key}:at`]);
      if (Boolean(state.flags[key]) && !Number.isFinite(timestamp)) state.flags[`${key}:at`] = state.elapsedMinutes;
    });
    state.flags["load-schema-version"] = LOAD_SCHEMA_VERSION;
    if (state.currentEventId && !state.events?.some((event) => event.id === state.currentEventId && !event.resolved)) state.currentEventId = undefined;
    state.surfaceRooms.forEach((room) => { room.staffAssigned = room.staffAssigned ?? []; room.queue = room.queue ?? []; room.upgrades = room.upgrades ?? []; });
    state.undergroundRooms.forEach((room) => { room.staffAssigned = room.staffAssigned ?? []; room.upgrades = room.upgrades ?? []; room.enabled = room.enabled !== false; room.sealed = Boolean(room.sealed); });
    state.staff.forEach((member, index) => {
      member.path = member.path ?? [];
      member.pathIndex = member.pathIndex ?? 0;
      member.shift = member.shift ?? (index % 3 === 0 ? "night" : "day");
      member.loyalty = clamp(Number(member.loyalty ?? 70), 0, 100);
      member.compromised = Boolean(member.compromised);
      member.taskProgress = clamp(Number(member.taskProgress ?? 0), 0, 100);
    });
    state.scps = state.scps.filter((scp) => SCP_DEFINITIONS.some((definition) => definition.id === scp.definitionId));
    defaults.scps.forEach((defaultScp) => {
      if (!state.scps.some((scp) => scp.definitionId === defaultScp.definitionId)) state.scps.push(defaultScp);
    });
    state.scps.forEach((scp) => {
      let procedure = state.procedures.find((entry) => entry.id === scp.procedureId || entry.scpId === scp.definitionId);
      if (!procedure) {
        procedure = createDefaultProcedure(scp.definitionId);
        state.procedures.push(procedure);
      }
      scp.procedureId = procedure.id;
      (["backupPower", "analogBackup", "biometricMonitoring", "automatedLockdown", "humaneCare", "isolatedNetwork", "redundantVentilation"] as Array<keyof ProcedureState>).forEach((key) => {
        if (!isProcedureOptionUnlocked(state, key)) (procedure as unknown as Record<string, boolean>)[key] = false;
      });
    });
    state.researchNodes = defaults.researchNodes.map((defaultNode) => {
      const loaded = state.researchNodes.find((node) => node.id === defaultNode.id);
      return loaded ? { ...defaultNode, completed: Boolean(loaded.completed) } : defaultNode;
    });
    state.campaign = defaults.campaign.map((defaultChapter) => {
      const loaded = state.campaign.find((chapter) => chapter.id === defaultChapter.id);
      if (!loaded) return defaultChapter;
      return {
        ...defaultChapter,
        complete: Boolean(loaded.complete),
        objectives: defaultChapter.objectives.map((defaultObjective) => {
          const loadedObjective = loaded.objectives?.find((objective) => objective.id === defaultObjective.id);
          return loadedObjective ? { ...defaultObjective, progress: Number(loadedObjective.progress) || 0, complete: Boolean(loadedObjective.complete) } : defaultObjective;
        })
      };
    });
    state.crisis.zones = arrayValue<CrisisZone>(state.crisis.zones, []);
    state.crisis.orders = arrayValue<CrisisOrder>(state.crisis.orders, []);
    state.crisis.log = Array.isArray(state.crisis.log) ? state.crisis.log.filter((entry): entry is string => typeof entry === "string") : [];
    autoAssignStaff(state);
    return state;
  }
}
