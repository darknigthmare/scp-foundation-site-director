namespace SCPGame {
  const CONTAINMENT_ROOM_TAGS = ["safe", "euclid", "keter", "humanoid", "bio", "infohazard", "heavy", "temporal"];
  const LOAD_SCHEMA_VERSION = 4;
  const SURFACE_ACCESS_SIDES: readonly SurfaceAccessSide[] = ["north", "east", "south", "west"];
  const SURFACE_ACCESS_TRAFFIC: readonly SurfaceTraffic[] = ["public", "staff", "security", "medical", "contaminated", "freight", "anomaly"];
  const SURFACE_ACCESS_COSTS: Record<SurfaceAccess["kind"], { funds: number; parts: number }> = {
    door: { funds: 250, parts: 2 },
    airlock: { funds: 1000, parts: 6 }
  };
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
      y: 14,
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
      // Visible galleries fill the genuine gaps in the starting installation.
      createUndergroundRoom("service-tunnel", 5, 0, 3),
      createUndergroundRoom("service-tunnel", 13, 0, 1),
      createUndergroundRoom("service-tunnel", 16, 0, 2),
      createUndergroundRoom("service-tunnel", 7, 1, 3),
      createUndergroundRoom("service-tunnel", 13, 1, 1),
      createUndergroundRoom("service-tunnel", 16, 1, 2),
      createUndergroundRoom("service-tunnel", 16, 2, 2),
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
        "load-schema-version": LOAD_SCHEMA_VERSION,
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

    state.surfaceRooms.forEach((room) => room.accessPoints = createDefaultSurfaceAccesses(state, room));
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
    const previousView = state.view;
    const selectedSurface = state.selectedType === "surface-room"
      ? state.surfaceRooms.find((room) => room.id === state.selectedId) : undefined;
    const selectedUnderground = state.selectedType === "underground-room"
      ? state.undergroundRooms.find((room) => room.id === state.selectedId) : undefined;
    const selectedFacility = state.selectedType === "facility"
      ? state.regionFacilities.find((facility) => facility.id === state.selectedId) : undefined;
    const existingAnnex = previousView === "surface" && state.activeInteriorFacilityId
      ? state.regionFacilities.find((facility) => facility.id === state.activeInteriorFacilityId) : undefined;
    state.view = view;
    state.buildSelection = undefined;
    if (view === "surface" && ((selectedFacility && isRegionFacilityEnterable(selectedFacility)) || existingAnnex)) {
      const facility = (selectedFacility && isRegionFacilityEnterable(selectedFacility) ? selectedFacility : existingAnnex)!;
      state.activeInteriorFacilityId = facility.id;
      state.selectedId = facility.id;
      state.selectedType = "facility";
      return;
    }
    state.activeInteriorFacilityId = undefined;
    if (view === "region" && (selectedFacility || existingAnnex)) {
      const facility = selectedFacility ?? existingAnnex!;
      state.selectedId = facility.id;
      state.selectedType = "facility";
      return;
    }
    if (view === "region" || view === "surface") {
      const linked = selectedSurface || (selectedUnderground && getSurfaceRoomAboveUnderground(state, selectedUnderground));
      state.selectedId = linked?.id;
      state.selectedType = linked ? "surface-room" : undefined;
    } else if (view === "underground") {
      if (selectedUnderground) setUndergroundSlice(state, undergroundRoomSectionY(state, selectedUnderground));
      else if (selectedSurface) {
        const portals = selectedSurface.type === "elevator"
          ? getUndergroundPortals(state).filter((portal) => portal.elevator.id === selectedSurface.id) : [];
        const section = portals[0] ? undergroundRoomSectionY(state, portals[0].shaft)
          : isSurfaceRoomOnUndergroundSection(state, selectedSurface)
            ? getSiteSectionSurfaceY(state)
            : Math.min(state.surfaceHeight - 1, selectedSurface.y + Math.floor(selectedSurface.height / 2));
        setUndergroundSlice(state, section);
      }
      const linked = selectedUnderground || (selectedSurface && getUndergroundRoomBelowSurface(state, selectedSurface));
      state.selectedId = linked?.id;
      state.selectedType = linked ? "underground-room" : undefined;
    } else if (view !== previousView) {
      state.selectedId = undefined;
      state.selectedType = undefined;
    }
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
    if (rectanglesOverlap(candidate, getSiteRegionFootprint(state))) {
      return { ok: false, message: "Terrain du bâtiment principal : aménagez-le depuis la vue Surface." };
    }
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
    const occupiedAccess = state.surfaceRooms.some((room) => room.accessPoints?.some((access) => access.cycle
      && [access.cycle.from, access.cycle.to].some((point) => pointInRect(point, x, y, width, height))));
    if (occupiedAccess) return { ok: false, message: "Attendez la fin du cycle ou évacuez le sas avant de construire sur son accès." };
    if (!payCost(state.resources, definition.cost)) return { ok: false, message: "Ressources insuffisantes." };
    const room = createSurfaceRoom(type, x, y);
    state.surfaceRooms.push(room);
    room.accessPoints = createDefaultSurfaceAccesses(state, room);
    state.selectedId = room.id;
    state.selectedType = "surface-room";
    autoAssignStaff(state);
    logHistory(state, `${definition.name} aménagé à la surface.`);
    return { ok: true, message: `${definition.name} prêt à être utilisé.` };
  }

  function isSurfaceAccessConfig(value: unknown): value is SurfaceAccessConfig {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const config = value as Record<string, unknown>;
    const boundedInteger = (entry: unknown, minimum: number, maximum: number): boolean =>
      typeof entry === "number" && Number.isSafeInteger(entry) && entry >= minimum && entry <= maximum;
    return SURFACE_ACCESS_SIDES.includes(config.side as SurfaceAccessSide)
      && boundedInteger(config.offset, 0, 255)
      && (config.kind === "door" || config.kind === "airlock")
      && typeof config.enabled === "boolean"
      && boundedInteger(config.minClearance, 0, 5)
      && Array.isArray(config.allowedTraffic) && config.allowedTraffic.length <= SURFACE_ACCESS_TRAFFIC.length
      && Array.from(config.allowedTraffic).every((entry) => SURFACE_ACCESS_TRAFFIC.includes(entry as SurfaceTraffic))
      && new Set(config.allowedTraffic).size === config.allowedTraffic.length
      && (config.direction === "both" || config.direction === "in" || config.direction === "out")
      && boundedInteger(config.queueCapacity, 1, 16)
      && typeof config.powered === "boolean" && typeof config.airSupply === "boolean";
  }

  function copySurfaceAccessConfig(config: SurfaceAccessConfig): SurfaceAccessConfig {
    // Copy only editable fields. Extra JSON/DOM properties cannot replace an ID,
    // the live queue, a cycle, or the original investment used for refunds.
    return {
      side: config.side, offset: config.offset, kind: config.kind, enabled: config.enabled,
      minClearance: config.minClearance, allowedTraffic: [...config.allowedTraffic],
      direction: config.direction, queueCapacity: config.queueCapacity,
      powered: config.powered, airSupply: config.airSupply
    };
  }

  function refundSurfaceAccessCost(state: GameState, access: SurfaceAccess): void {
    const cost = SURFACE_ACCESS_COSTS[access.kind];
    addResource(state.resources, "funds", clamp(access.paidFunds, 0, cost.funds) * 0.35);
    addResource(state.resources, "parts", clamp(access.paidParts, 0, cost.parts) * 0.4);
  }

  function surfaceAccessPlacementError(state: GameState, room: SurfaceRoom, config: SurfaceAccessConfig,
    existingId?: string, checkObstruction = true): string | undefined {
    if (room.type === "corridor") return "Les accès se placent sur les limites d'une salle, pas sur un couloir.";
    const sideLength = config.side === "north" || config.side === "south" ? room.width : room.height;
    if (config.offset >= sideLength) return "La position dépasse la longueur du mur choisi.";
    const cells = getSurfaceAccessCells(room, config);
    if ([cells.inside, cells.outside].some((point) => point.x < 0 || point.y < 0
      || point.x >= state.surfaceWidth || point.y >= state.surfaceHeight)) return "Cet accès débouche hors du complexe.";
    if (getSurfaceAccesses(state, room).some((access) => access.id !== existingId
      && access.side === config.side && access.offset === config.offset)) return "Un accès occupe déjà cette portion du mur.";
    if (checkObstruction && state.surfaceRooms.some((other) => other.id !== room.id && other.type !== "corridor"
      && pointInRect(cells.outside, other.x, other.y, other.width, other.height))) return "L'autre côté de l'accès doit être libre ou donner sur un couloir.";
    return undefined;
  }

  export function addSurfaceAccess(state: GameState, roomId: string, config: SurfaceAccessConfig): { ok: boolean; message: string } {
    const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
    if (!room) return { ok: false, message: "Salle introuvable." };
    if (!isSurfaceAccessConfig(config)) return { ok: false, message: "Configuration d'accès invalide." };
    const error = surfaceAccessPlacementError(state, room, config);
    if (error) return { ok: false, message: error };
    const cost = SURFACE_ACCESS_COSTS[config.kind];
    if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes pour cet accès." };
    const access: SurfaceAccess = {
      ...copySurfaceAccessConfig(config), id: uid("access"), queue: [], passedCount: 0,
      paidFunds: cost.funds, paidParts: cost.parts
    };
    room.accessPoints = [...getSurfaceAccesses(state, room), access];
    logHistory(state, `${config.kind === "airlock" ? "Sas" : "Porte"} ajouté : ${getSurfaceDefinition(room.type).name}.`);
    return { ok: true, message: config.kind === "airlock" ? "Sas interverrouillé installé." : "Porte installée." };
  }

  export function updateSurfaceAccess(state: GameState, roomId: string, accessId: string, config: SurfaceAccessConfig): { ok: boolean; message: string } {
    const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
    if (!room) return { ok: false, message: "Salle introuvable." };
    const accesses = getSurfaceAccesses(state, room);
    const access = accesses.find((candidate) => candidate.id === accessId);
    if (!access) return { ok: false, message: "Accès introuvable." };
    if (!isSurfaceAccessConfig(config)) return { ok: false, message: "Configuration d'accès invalide." };
    if (config.kind !== access.kind) return { ok: false, message: "Démontez cet accès avant d'installer un autre type." };
    const moved = config.side !== access.side || config.offset !== access.offset;
    const policyChanged = config.minClearance !== access.minClearance || config.direction !== access.direction
      || config.allowedTraffic.length !== access.allowedTraffic.length
      || config.allowedTraffic.some((traffic) => !access.allowedTraffic.includes(traffic));
    if ((moved || policyChanged) && (access.cycle || access.queue.length > 0)) {
      return { ok: false, message: "Évacuez le sas et sa file avant de déplacer l'accès ou de modifier ses autorisations." };
    }
    if (config.queueCapacity < access.queue.length) return { ok: false, message: "La capacité ne peut pas être inférieure à la file actuelle." };
    const error = surfaceAccessPlacementError(state, room, config, access.id, moved);
    if (error) return { ok: false, message: error };
    Object.assign(access, copySurfaceAccessConfig(config));
    room.accessPoints = accesses;
    return { ok: true, message: "Réglages d'accès enregistrés." };
  }

  export function removeSurfaceAccess(state: GameState, roomId: string, accessId: string): { ok: boolean; message: string } {
    const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
    if (!room) return { ok: false, message: "Salle introuvable." };
    const accesses = getSurfaceAccesses(state, room);
    const access = accesses.find((candidate) => candidate.id === accessId);
    if (!access) return { ok: false, message: "Accès introuvable." };
    if (access.cycle) return { ok: false, message: "Le sas est occupé. Terminez le cycle ou évacuez d'abord son occupant." };
    evacuateSurfaceAccess(state, room, access);
    room.accessPoints = accesses.filter((candidate) => candidate.id !== accessId);
    refundSurfaceAccessCost(state, access);
    logHistory(state, `Accès démonté : ${getSurfaceDefinition(room.type).name}.`);
    return { ok: true, message: "Accès démonté. Une part des matériaux et du coût payé a été récupérée." };
  }

  export function evacuateSurfaceAccessAction(state: GameState, roomId: string, accessId: string): { ok: boolean; message: string } {
    const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
    if (!room) return { ok: false, message: "Salle introuvable." };
    const accesses = getSurfaceAccesses(state, room);
    const access = accesses.find((candidate) => candidate.id === accessId);
    if (!access) return { ok: false, message: "Accès introuvable." };
    if (access.kind !== "airlock") return { ok: false, message: "L'évacuation manuelle concerne uniquement les sas." };
    evacuateSurfaceAccess(state, room, access);
    room.accessPoints = accesses;
    logHistory(state, `Évacuation manuelle du sas vers le côté d'origine : ${getSurfaceDefinition(room.type).name}.`);
    return { ok: true, message: "Sas évacué du côté d'origine et verrouillé. Aucun passage n'a été compté." };
  }

  export function buildUndergroundRoom(state: GameState, type: UndergroundRoomType, x: number, level: number,
    sectionY = getSiteSectionSurfaceY(state)): { ok: boolean; message: string } {
    const definition = getUndergroundDefinition(type);
    if (!Number.isInteger(sectionY) || sectionY < 0 || sectionY >= state.surfaceHeight)
      return { ok: false, message: "Coupe souterraine hors limites." };
    if (!isUndergroundDefinitionUnlocked(state, definition)) return { ok: false, message: "Module non autorisé ou recherche manquante." };
    if (level < 0 || level >= state.undergroundLevels || x < 0 || x + definition.width > state.undergroundWidth) return { ok: false, message: "Construction hors des limites géologiques." };
    if (level >= 5 && !isResearchUnlockActive(state, "level-5-plus") && state.mode !== "sandbox") return { ok: false, message: "L'excavation profonde n'est pas encore maîtrisée." };
    const candidate = { x, y: sectionY, level, width: definition.width };
    if (state.undergroundRooms.some((room) => undergroundOverlap(candidate,
      { ...room, y: undergroundRoomSectionY(state, room) })))
      return { ok: false, message: "Ce volume est déjà occupé sur cette coupe." };
    const depthCostMultiplier = 1 + level * 0.12;
    const scaledCost: Cost = {};
    Object.entries(definition.cost).forEach(([key, amount]) => {
      scaledCost[key as keyof Cost] = Math.ceil((amount as number) * depthCostMultiplier);
    });
    if (!payCost(state.resources, scaledCost)) return { ok: false, message: "Ressources insuffisantes pour cette profondeur." };
    const room = createUndergroundRoom(type, x, level);
    room.y = sectionY;
    state.undergroundRooms.push(room);
    state.selectedId = room.id;
    state.selectedType = "underground-room";
    autoAssignStaff(state);
    logHistory(state, `${definition.name} construit au niveau -${level + 1}, coupe Y=${sectionY}.`);
    return { ok: true, message: `${definition.name} opérationnel au niveau -${level + 1}, coupe ${sectionY + 1}.` };
  }

  export function setUndergroundSeal(state: GameState, roomId: string, sealed: boolean): { ok: boolean; message: string } {
    const room = state.undergroundRooms.find((entry) => entry.id === roomId);
    if (!room) return { ok: false, message: "Module souterrain introuvable." };
    if (room.sealed === sealed) return { ok: true, message: "État déjà appliqué." };
    room.sealed = sealed;
    logHistory(state, `${getUndergroundDefinition(room.type).name} : ${sealed ? "secteur scellé" : "accès rétabli"}.`);
    return { ok: true, message: sealed ? "Secteur scellé : circulation interdite." : "Secteur rouvert : itinéraires recalculés." };
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
      if (room.accessPoints?.some((access) => access.cycle)) return { ok: false, message: "Évacuez les sas occupés avant de démanteler cette salle." };
      const definition = getSurfaceDefinition(room.type);
      room.accessPoints?.forEach((access) => {
        evacuateSurfaceAccess(state, room, access);
        refundSurfaceAccessCost(state, access);
      });
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
    state.surfaceRooms.forEach((room) => {
      room.staffAssigned = room.staffAssigned.filter((id) => id !== staffId);
      room.accessPoints?.forEach((access) => {
        access.queue = access.queue.filter((request) => request.staffId !== staffId);
        if (access.cycle?.staffId === staffId) access.cycle = undefined;
      });
    });
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
      const undergroundRoom = underground ? state.undergroundRooms.find((entry) => entry.id === roomId) : undefined;
      const candidates = available
        .filter((member) => member.role === role && !assigned.has(member.id)
          && (!undergroundRoom || member.clearance >= getUndergroundClearanceRequirement(undergroundRoom)))
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

    state.undergroundRooms
      .filter((room) => room.enabled && room.scpId)
      .forEach((room) => {
        const scp = state.scps.find((entry) => entry.id === room.scpId);
        if (!scp) return;
        const definition = getSCPDefinition(scp.definitionId);
        Object.entries(definition.requirements.staff).forEach(([role, count]) => assignRole(room.id, role as StaffRole, count ?? 0, true));
      });

    state.surfaceRooms
      .filter((room) => room.enabled)
      .sort((a, b) => getSurfaceDefinition(b.type).security - getSurfaceDefinition(a.type).security)
      .forEach((room) => {
        const definition = getSurfaceDefinition(room.type);
        Object.entries(definition.requiredRoles).forEach(([role, count]) => assignRole(room.id, role as StaffRole, count ?? 0, false));
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

  // Missing legacy fields can be migrated. Supplied malformed fields must never
  // replace a collection with a fresh roster or enter the running simulation.
  function hasValidLoadedFields(candidate: unknown, defaults: GameState): boolean {
    type Check = (value: unknown) => boolean;
    const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
    const text: Check = (value) => typeof value === "string";
    const id: Check = (value) => typeof value === "string" && value.length > 0;
    const boolean: Check = (value) => typeof value === "boolean";
    const finite: Check = (value) => typeof value === "number" && Number.isFinite(value);
    const integer = (min: number, max = Number.MAX_SAFE_INTEGER): Check => (value) => finite(value) && Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
    const oneOf = (values: readonly unknown[]): Check => (value) => values.includes(value);
    const array = (check: Check): Check => (value) => Array.isArray(value) && value.length <= 10_000 && value.every(check);
    const shape = (value: unknown, checks: Record<string, Check>, required: string[] = []): boolean =>
      record(value) && required.every((key) => value[key] !== undefined)
      && Object.entries(checks).every(([key, check]) => value[key] === undefined || check(value[key]));
    const numericRecord = (value: unknown, required: string[] = []): boolean =>
      record(value) && required.every((key) => finite(value[key])) && Object.values(value).every(finite);
    const primitive: Check = (value) => text(value) || boolean(value) || finite(value);
    const stringArray = array(text);
    const views = ["region", "surface", "underground", "command", "management"];
    const layers = ["region", "surface", "underground"];
    const roles = Object.keys(ROLE_LABELS);
    const statuses = ["working", "moving", "resting", "eating", "queued", "training", "injured", "quarantined", "off-duty", "dead"];
    const gridKeys = ["regionWidth", "regionHeight", "surfaceWidth", "surfaceHeight", "undergroundWidth", "undergroundLevels"];
    if (!record(candidate) || !gridKeys.every((key) => candidate[key] === undefined || integer(1, key === "undergroundLevels" ? 64 : 256)(candidate[key]))) return false;
    const schemaMarker = record(candidate.flags) ? candidate.flags["load-schema-version"] : undefined;
    if (schemaMarker !== undefined && !integer(0, LOAD_SCHEMA_VERSION)(schemaMarker)) return false;
    const size = (key: keyof GameState): number => Number(candidate[key] ?? defaults[key]);
    const point: Check = (value) => shape(value, { x: finite, y: finite }, ["x", "y"]) && record(value)
      && Number(value.x) >= 0 && Number(value.x) < size("surfaceWidth") && Number(value.y) >= 0 && Number(value.y) < size("surfaceHeight");
    const layerPoint: Check = (value) => {
      if (!shape(value, { x: finite, y: finite, layer: oneOf(layers),
        level: integer(0, size("undergroundLevels") - 1),
        sectionY: (v) => finite(v) && Number(v) >= 0 && Number(v) < size("surfaceHeight") }, ["x", "y", "layer"]) || !record(value)) return false;
      const width = size(value.layer === "surface" ? "surfaceWidth" : value.layer === "region" ? "regionWidth" : "undergroundWidth");
      const height = size(value.layer === "surface" ? "surfaceHeight" : value.layer === "region" ? "regionHeight" : "undergroundLevels");
      return Number(value.x) >= 0 && Number(value.x) < width && Number(value.y) >= 0 && Number(value.y) < height;
    };
    const workItem: Check = (value) => shape(value, {
      id, kind: oneOf(["access", "patient", "delivery", "anomaly", "repair", "research", "training", "inspection"]),
      severity: finite, progress: finite, createdAt: finite, expiresAt: finite, source: text,
      metadata: (entry) => record(entry) && Object.values(entry).every(primitive)
    }, ["id", "kind", "severity", "progress", "createdAt", "expiresAt"]);
    const accessPoint: Check = (value) => point(value) && record(value)
      && integer(0)(value.x) && integer(0)(value.y);
    const accessRequest: Check = (value) => shape(value, {
      staffId: id, from: accessPoint, to: accessPoint, requestedAt: integer(0), expiresAt: integer(1)
    }, ["staffId", "from", "to", "requestedAt", "expiresAt"]) && record(value)
      && Number(value.expiresAt) > Number(value.requestedAt);
    const accessCycle: Check = (value) => accessRequest(value) && shape(value, {
      phase: oneOf(["entering", "equalizing", "exiting"]), remaining: integer(1, 2)
    }, ["phase", "remaining"]) && record(value)
      && Number(value.remaining) <= (value.phase === "equalizing" ? 2 : 1);
    const access: Check = (value) => {
      if (!isSurfaceAccessConfig(value) || !shape(value, {
        id, queue: array(accessRequest), cycle: accessCycle, passedCount: integer(0),
        paidFunds: finite, paidParts: finite
      }, ["id", "queue", "passedCount", "paidFunds", "paidParts"]) || !record(value)) return false;
      const cost = SURFACE_ACCESS_COSTS[value.kind];
      const queue = value.queue as SurfaceAccessRequest[];
      return queue.length <= value.queueCapacity
        && (value.kind === "airlock" || (queue.length === 0 && value.cycle === undefined))
        && Number(value.paidFunds) >= 0 && Number(value.paidFunds) <= cost.funds
        && Number(value.paidParts) >= 0 && Number(value.paidParts) <= cost.parts;
    };
    const roomArrays = { staffAssigned: stringArray, upgrades: stringArray };
    const surfaceRoom: Check = (value) => {
      if (!shape(value, {
        id, type: oneOf(SURFACE_ROOM_DEFINITIONS.map((entry) => entry.type)),
        x: integer(0), y: integer(0), width: integer(1, 256), height: integer(1, 256),
        level: integer(1), condition: finite, cleanliness: finite, enabled: boolean,
        powerPriority: finite, name: text, ...roomArrays, queue: array(workItem), accessPoints: array(access)
      }, ["id", "type", "x", "y", "width", "height", "level", "condition", "cleanliness"]) || !record(value)) return false;
      if (Number(value.x) + Number(value.width) > size("surfaceWidth") || Number(value.y) + Number(value.height) > size("surfaceHeight")) return false;
      if (value.accessPoints !== undefined) {
        const accesses = value.accessPoints as SurfaceAccess[];
        if (value.type === "corridor" && accesses.length > 0) return false;
        const edges = new Set<string>();
        for (const entry of accesses) {
          const length = entry.side === "north" || entry.side === "south" ? Number(value.width) : Number(value.height);
          if (entry.offset >= length) return false;
          const edge = `${entry.side}:${entry.offset}`;
          if (edges.has(edge)) return false;
          edges.add(edge);
          const cells = getSurfaceAccessCells(value as unknown as SurfaceRoom, entry);
          if (!accessPoint(cells.inside) || !accessPoint(cells.outside)) return false;
        }
      }
      return true;
    };
    const undergroundRoom: Check = (value) => {
      if (!shape(value, {
        id, type: oneOf(UNDERGROUND_ROOM_DEFINITIONS.map((entry) => entry.type)),
        x: integer(0), y: integer(0, size("surfaceHeight") - 1),
        level: integer(0, size("undergroundLevels") - 1), width: integer(1, 256),
        condition: finite, enabled: boolean, sealed: boolean, powerPriority: finite, name: text, scpId: text, ...roomArrays
      }, ["id", "type", "x", "level", "width", "condition"]) || !record(value)) return false;
      return Number(value.x) + Number(value.width) <= size("undergroundWidth");
    };
    const facility: Check = (value) => {
      if (!shape(value, {
        id, type: oneOf(REGION_FACILITY_DEFINITIONS.map((entry) => entry.type)),
        x: integer(0), y: integer(0), width: integer(1, 256), height: integer(1, 256),
        level: integer(1), condition: finite, staffed: boolean, enabled: boolean
      }, ["id", "type", "x", "y", "width", "height", "level", "condition"]) || !record(value)) return false;
      return Number(value.x) + Number(value.width) <= size("regionWidth") && Number(value.y) + Number(value.height) <= size("regionHeight");
    };
    const member: Check = (value) => shape(value, {
      id, name: text, role: oneOf(roles), clearance: integer(0, 5), salary: finite,
      skills: (entry) => numericRecord(entry, Object.keys(defaults.staff[0].skills)),
      needs: (entry) => numericRecord(entry, Object.keys(defaults.staff[0].needs)),
      traits: stringArray, status: oneOf(statuses), position: layerPoint, target: layerPoint,
      targetRoomId: text, assignmentRoomId: text, path: array(point), pathIndex: integer(0),
      shift: oneOf(["day", "night"]), experience: finite, loyalty: finite, compromised: boolean, taskProgress: finite,
      routeBlockedReason: (entry) => typeof entry === "string" && entry.length <= 512,
      undergroundLink: (entry) => shape(entry, {
        fromId: id, toId: id, crossingX: finite
      }, ["fromId", "toId", "crossingX"])
    }, ["id", "name", "role", "clearance", "salary", "skills", "needs", "traits", "status", "position", "experience"]);
    const scpIds = SCP_DEFINITIONS.map((entry) => entry.id);
    const scp: Check = (value) => shape(value, {
      id, definitionId: oneOf(scpIds), contained: boolean, discovered: boolean, roomId: text,
      researchProgress: finite, knowledge: finite, breachRisk: finite, mood: finite, health: finite,
      activeEffect: text, procedureId: text, daysContained: finite, incidents: finite, transferred: boolean
    }, ["id", "definitionId", "contained", "discovered", "researchProgress", "knowledge", "breachRisk", "mood", "health", "daysContained", "incidents"]);
    const procedure: Check = (value) => shape(value, {
      id, scpId: oneOf(scpIds), version: integer(1), observationLevel: finite, assignedStaff: finite,
      maintenanceFrequency: finite, backupPower: boolean, analogBackup: boolean, biometricMonitoring: boolean,
      opticalMonitoring: boolean, automatedLockdown: boolean, humaneCare: boolean, restrictedTesting: boolean,
      isolatedNetwork: boolean, redundantVentilation: boolean, trainingRequired: finite, notes: text,
      compliance: finite, complexity: finite
    }, ["id", "scpId", "version", "observationLevel", "assignedStaff", "maintenanceFrequency", "trainingRequired", "compliance", "complexity"]);
    const severity = oneOf(["info", "minor", "major", "critical"]);
    const effect: Check = (value) => shape(value, {
      type: oneOf(["resource", "reputation", "queue", "crisis", "staff", "scp", "flag", "log"]),
      key: text, amount: finite, value: primitive, target: text
    }, ["type"]);
    const eventChoice: Check = (value) => shape(value, {
      id, label: text, description: text, cost: (entry) => numericRecord(entry),
      effects: array(effect), requirement: text
    }, ["id", "label", "description", "effects"]);
    const event: Check = (value) => shape(value, {
      id, templateId: text, title: text, body: text, severity, choices: array(eventChoice),
      createdAt: finite, resolved: boolean, blocking: boolean
    }, ["id", "templateId", "title", "body", "severity", "choices", "createdAt", "resolved", "blocking"]);
    const zone: Check = (value) => shape(value, {
      id, name: text, layer: oneOf(layers), level: integer(0, size("undergroundLevels") - 1),
      security: finite, population: finite, casualties: finite, contamination: finite,
      power: finite, sealed: boolean, evacuated: boolean, threat: finite
    }, ["id", "name", "layer", "security", "population", "casualties", "contamination", "power", "sealed", "evacuated", "threat"]);
    const order: Check = (value) => shape(value, {
      id, type: oneOf(["lockdown", "evacuate", "deploy-security", "deploy-mtf", "restore-power", "decontaminate", "medical-response", "seal-ventilation", "amnestic-response"]),
      zoneId: text, progress: finite, duration: finite, assigned: finite,
      status: oneOf(["queued", "active", "completed", "failed"])
    }, ["id", "type", "zoneId", "progress", "duration", "assigned", "status"]);
    const objective: Check = (value) => shape(value, { id, progress: finite, complete: boolean }, ["id"]);
    const chapter: Check = (value) => shape(value, { id, complete: boolean, objectives: array(objective) }, ["id"]);
    const notification: Check = (value) => shape(value, {
      id, time: finite, title: text, message: text, severity, read: boolean
    }, ["id", "time", "title", "message", "severity", "read"]);
    const camera: Check = (value) => shape(value, {
      zoom: (entry) => finite(entry) && Number(entry) > 0 && Number(entry) <= 100,
      offsetX: finite, offsetY: finite
    });
    // Validate inherited geometry too when a partial save changes map dimensions.
    if (!array(facility)(candidate.regionFacilities === undefined ? defaults.regionFacilities : candidate.regionFacilities)
      || !array(surfaceRoom)(candidate.surfaceRooms === undefined ? defaults.surfaceRooms : candidate.surfaceRooms)
      || !array(undergroundRoom)(candidate.undergroundRooms === undefined ? defaults.undergroundRooms : candidate.undergroundRooms)
      || !array(member)(candidate.staff === undefined ? defaults.staff : candidate.staff)) return false;
    return shape(candidate, {
      mode: oneOf(["campaign", "sandbox"]), view: oneOf(views), speed: oneOf([0, 1, 2, 4]), previousSpeed: oneOf([0, 1, 2, 4]),
      seed: finite, savedAt: finite, day: integer(1), minuteOfDay: integer(0, 1439), elapsedMinutes: integer(0),
      currentChapter: integer(0, defaults.campaign.length - 1), lastAutosave: finite, gameOver: boolean, victory: boolean,
      settings: (value) => shape(value, {
        difficulty: oneOf(["story", "standard", "director", "keter"]), reducedMotion: boolean, highContrast: boolean,
        audio: boolean, autoPauseCritical: boolean, tutorial: boolean, language: oneOf(["fr"])
      }),
      resources: (value) => numericRecord(value), reputation: (value) => numericRecord(value),
      regionFacilities: array(facility), surfaceRooms: array(surfaceRoom), undergroundRooms: array(undergroundRoom),
      staff: array(member), workItems: array(workItem), scps: array(scp), procedures: array(procedure),
      researchNodes: array((value) => shape(value, { id, completed: boolean }, ["id"])), events: array(event),
      campaign: array(chapter), notifications: array(notification), history: stringArray,
      currentEventId: text, selectedId: text, activeInteriorFacilityId: text,
      selectedType: oneOf(["facility", "surface-room", "underground-room", "staff", "scp", "zone"]),
      flags: (value) => record(value) && Object.values(value).every(primitive),
      camera: (value) => shape(value, Object.fromEntries(views.map((view) => [view, camera]))),
      crisis: (value) => shape(value, {
        active: boolean, type: text, title: text, description: text, severity: finite, elapsed: finite,
        siteIntegrity: finite, veilExposure: finite, threatProgress: finite, sourceScpId: text,
        zones: array(zone), orders: array(order), log: stringArray, resolved: oneOf(["success", "failure"])
      })
    });
  }


  function hasValidSurfaceAccessReferences(state: GameState): boolean {
    const members = new Map(state.staff.map((member) => [member.id, member]));
    if (members.size !== state.staff.length || new Set(state.surfaceRooms.map((room) => room.id)).size !== state.surfaceRooms.length) return false;
    const accessIds = new Set<string>();
    const travellers = new Set<string>();
    const samePoint = (left: Point, right: Point): boolean => left.x === right.x && left.y === right.y;
    for (const room of state.surfaceRooms) {
      for (const access of room.accessPoints ?? []) {
        if (accessIds.has(access.id)) return false;
        accessIds.add(access.id);
        const cells = getSurfaceAccessCells(room, access);
        const requests = access.cycle ? [...access.queue, access.cycle] : access.queue;
        for (const request of requests) {
          const member = members.get(request.staffId);
          if (!member || member.status === "dead" || member.position.layer !== "surface"
            || !samePoint(member.position, request.from) || travellers.has(request.staffId)
            || request.requestedAt > state.elapsedMinutes) return false;
          const enters = samePoint(request.from, cells.outside) && samePoint(request.to, cells.inside);
          const leaves = samePoint(request.from, cells.inside) && samePoint(request.to, cells.outside);
          if (!enters && !leaves) return false;
          travellers.add(request.staffId);
        }
      }
    }
    return true;
  }

  function copySurfaceAccessRequest(request: SurfaceAccessRequest): SurfaceAccessRequest {
    return {
      staffId: request.staffId,
      from: { x: request.from.x, y: request.from.y },
      to: { x: request.to.x, y: request.to.y },
      requestedAt: request.requestedAt, expiresAt: request.expiresAt
    };
  }

  function normalizeLoadedState(candidate: unknown): GameState | undefined {
    if (!candidate || typeof candidate !== "object") return undefined;
    const raw = candidate as Partial<GameState>;
    if (typeof raw.version !== "string") return undefined;
    // A newer build may contain fields and semantics this runtime cannot safely interpret.
    const parseVersion = (value: string): number[] | undefined => {
      if (!/^\d+\.\d+\.\d+$/.test(value)) return undefined;
      const parts = value.split(".").map(Number);
      return parts.every(Number.isSafeInteger) ? parts : undefined;
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
    if (!hasValidLoadedFields(candidate, defaults)) return undefined;
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
      camera: {
        region: objectValue(raw.camera?.region, defaults.camera.region),
        surface: objectValue(raw.camera?.surface, defaults.camera.surface),
        underground: objectValue(raw.camera?.underground, defaults.camera.underground),
        command: objectValue(raw.camera?.command, defaults.camera.command),
        management: objectValue(raw.camera?.management, defaults.camera.management)
      },
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
    if (state.activeInteriorFacilityId && !state.regionFacilities.some((facility) =>
      facility.id === state.activeInteriorFacilityId && isRegionFacilityEnterable(facility))) {
      state.activeInteriorFacilityId = undefined;
    }
    if (state.currentEventId && !state.events?.some((event) => event.id === state.currentEventId && !event.resolved)) state.currentEventId = undefined;
    state.regionFacilities.forEach((facility) => {
      facility.enabled = facility.enabled !== false;
      facility.staffed = facility.staffed ?? (facility.type !== "watchtower" && facility.type !== "checkpoint");
    });
    state.surfaceRooms.forEach((room) => {
      room.staffAssigned = room.staffAssigned ?? [];
      room.queue = room.queue ?? [];
      room.upgrades = room.upgrades ?? [];
      room.enabled = room.enabled !== false;
      room.powerPriority = room.powerPriority ?? (["elevator", "medical", "command-center"].includes(room.type) ? 3 : 2);
    });
    // Missing entrances are migrated once. An explicitly empty array describes
    // a sealed room and must never be replaced with automatic doors.
    state.surfaceRooms.forEach((room) => {
      room.accessPoints = room.accessPoints === undefined ? createDefaultSurfaceAccesses(state, room)
        : room.accessPoints.map((access) => ({
          ...copySurfaceAccessConfig(access), id: access.id,
          queue: access.queue.map(copySurfaceAccessRequest),
          cycle: access.cycle ? { ...copySurfaceAccessRequest(access.cycle), phase: access.cycle.phase, remaining: access.cycle.remaining } : undefined,
          passedCount: access.passedCount, paidFunds: access.paidFunds, paidParts: access.paidParts
        }));
    });
    if (!hasValidSurfaceAccessReferences(state)) return undefined;
    state.undergroundRooms.forEach((room) => {
      // A historical room without Y belongs to the former single A-A cut.
      room.y = undergroundRoomSectionY(state, room);
      room.staffAssigned = room.staffAssigned ?? [];
      room.upgrades = room.upgrades ?? [];
      room.enabled = room.enabled !== false;
      room.sealed = Boolean(room.sealed);
      const tags = getUndergroundDefinition(room.type).tags;
      room.powerPriority = room.powerPriority ?? (tags.includes("keter") || tags.includes("bio") ? 3 : 2);
    });
    const roomIds = new Set(state.undergroundRooms.map((room) => room.id));
    for (const member of state.staff) {
      const link = member.undergroundLink;
      if (!link) continue;
      const from = state.undergroundRooms.find((room) => room.id === link.fromId);
      const to = state.undergroundRooms.find((room) => room.id === link.toId);
      const section = member.position.sectionY ?? getLegacyUndergroundSectionY(state);
      if (!from || !to || member.position.layer !== "underground"
        || from.level !== to.level || (member.position.level ?? member.position.y) !== from.level
        || Math.abs(undergroundRoomSectionY(state, from) - undergroundRoomSectionY(state, to)) !== 1
        || Math.min(from.x + from.width, to.x + to.width) <= Math.max(from.x, to.x)
        || link.crossingX <= Math.max(from.x, to.x)
        || link.crossingX >= Math.min(from.x + from.width, to.x + to.width)
        || Math.abs(member.position.x - link.crossingX) > 0.0001
        || section < Math.min(undergroundRoomSectionY(state, from), undergroundRoomSectionY(state, to))
        || section > Math.max(undergroundRoomSectionY(state, from), undergroundRoomSectionY(state, to))) {
        return undefined;
      }
    }
    state.staff.forEach((member, index) => {
      if (member.position.layer === "underground" && member.position.sectionY === undefined)
        member.position.sectionY = getLegacyUndergroundSectionY(state);
      if (member.target?.layer === "underground" && member.target.sectionY === undefined)
        member.target.sectionY = getLegacyUndergroundSectionY(state);
      if (member.undergroundLink && (!roomIds.has(member.undergroundLink.fromId)
        || !roomIds.has(member.undergroundLink.toId))) member.undergroundLink = undefined;
      member.path = member.path ?? [];
      member.pathIndex = member.pathIndex ?? 0;
      member.shift = member.shift ?? (index % 3 === 0 ? "night" : "day");
      member.loyalty = clamp(Number(member.loyalty ?? 70), 0, 100);
      member.compromised = Boolean(member.compromised);
      member.taskProgress = clamp(Number(member.taskProgress ?? 0), 0, 100);
      member.routeBlockedReason = undefined;
    });
    state.scps = state.scps.filter((scp) => SCP_DEFINITIONS.some((definition) => definition.id === scp.definitionId));
    state.procedures = state.procedures.map((procedure) => ({ ...createDefaultProcedure(procedure.scpId), ...procedure }));
    defaults.scps.forEach((defaultScp) => {
      if (!state.scps.some((scp) => scp.definitionId === defaultScp.definitionId)) state.scps.push(defaultScp);
    });
    state.scps.forEach((scp) => {
      scp.activeEffect = scp.activeEffect ?? (scp.contained ? "Confinement à réévaluer" : "En attente de transfert");
      scp.transferred = scp.transferred ?? scp.contained;
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
      return loaded ? { ...defaultNode, completed: loaded.completed ?? defaultNode.completed } : defaultNode;
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

