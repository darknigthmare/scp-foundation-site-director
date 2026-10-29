namespace SCPGame {
  const SIMULATION_MINUTES_PER_REAL_SECOND = 6;
  const CRISIS_ORDER_ROLES: Partial<Record<CrisisOrderType, StaffRole>> = {
    "deploy-security": "guard",
    "deploy-mtf": "mtf",
    "restore-power": "engineer",
    "lockdown": "engineer",
    "seal-ventilation": "engineer",
    "medical-response": "medic",
    "decontaminate": "medic",
    "amnestic-response": "admin"
  };

  export function getSimulationMinutesPerRealSecond(): number {
    return SIMULATION_MINUTES_PER_REAL_SECOND;
  }

  export function advanceSimulation(state: GameState, wholeMinutes: number): void {
    if (state.speed === 0 || state.gameOver || state.victory) return;
    const steps = Math.min(wholeMinutes, 240);
    for (let index = 0; index < steps; index += 1) {
      simulateMinute(state);
      if ((state.speed as number) === 0 || state.gameOver || state.victory) break;
    }
  }

  function simulateMinute(state: GameState): void {
    state.elapsedMinutes += 1;
    state.minuteOfDay += 1;
    if (state.minuteOfDay >= 1440) {
      state.minuteOfDay -= 1440;
      state.day += 1;
      dailyUpdate(state);
    }

    updateUtilityReserves(state);
    updateStaff(state);
    updateKeterStability(state);

    if (state.elapsedMinutes % 10 === 0) processSurfaceQueues(state);
    if (state.elapsedMinutes % 30 === 0) updateRoomCondition(state);
    if (state.elapsedMinutes % 60 === 0) {
      updateSCPContainment(state);
      produceResearchAndIntel(state);
      spawnRoutineWork(state);
      updateReputation(state);
      updateInternalSecurity(state);
      updateDeferredConsequences(state);
      updateCampaign(state);
      maybeSpawnRandomEvent(state);
    }

    if (state.crisis.active) updateCrisis(state);

    if (state.elapsedMinutes - state.lastAutosave >= 360) {
      saveGame(state, true);
      state.lastAutosave = state.elapsedMinutes;
    }
  }

  function calculateUtilityBalance(state: GameState): { powerProduction: number; powerUse: number; waterProduction: number; waterUse: number } {
    let powerProduction = 35;
    let waterProduction = 30;
    let powerUse = 18 + state.staff.filter((member) => member.status !== "dead").length * 0.12;
    let waterUse = 12 + state.staff.filter((member) => member.status !== "dead").length * 0.08;

    state.regionFacilities.filter((facility) => facility.enabled).forEach((facility) => {
      const definition = getRegionDefinition(facility.type);
      const condition = facility.condition / 100;
      if (definition.powerProduction) {
        if (definition.powerProduction > 0) powerProduction += definition.powerProduction * facility.level * condition;
        else powerUse += Math.abs(definition.powerProduction) * condition;
      }
      if (definition.waterProduction) waterProduction += definition.waterProduction * facility.level * condition;
    });

    state.surfaceRooms.filter((room) => room.enabled).forEach((room) => {
      const definition = getSurfaceDefinition(room.type);
      if (definition.powerUse < 0) powerProduction += Math.abs(definition.powerUse) * room.level * room.condition / 100;
      else powerUse += definition.powerUse * room.level;
      waterUse += definition.waterUse * room.level;
    });

    state.undergroundRooms.filter((room) => room.enabled).forEach((room) => {
      const definition = getUndergroundDefinition(room.type);
      if (definition.powerUse < 0) powerProduction += Math.abs(definition.powerUse) * room.condition / 100;
      else powerUse += definition.powerUse;
      waterUse += definition.waterUse;
    });

    if (Boolean(state.flags["surface-blackout"])) powerUse *= 0.78;
    return { powerProduction, powerUse, waterProduction, waterUse };
  }

  function updateUtilityReserves(state: GameState): void {
    const balance = calculateUtilityBalance(state);
    state.resources.powerCapacity = Math.max(100, Math.round(balance.powerProduction * 1.4));
    state.resources.waterCapacity = Math.max(100, Math.round(balance.waterProduction * 1.5));
    const powerDeltaPerMinute = (balance.powerProduction - balance.powerUse) / 180;
    const waterDeltaPerMinute = (balance.waterProduction - balance.waterUse) / 220;
    state.resources.power = clamp(state.resources.power + powerDeltaPerMinute, 0, state.resources.powerCapacity);
    state.resources.water = clamp(state.resources.water + waterDeltaPerMinute, 0, state.resources.waterCapacity);

    if (state.resources.power <= 1 && !Boolean(state.flags["power-critical-notified"])) {
      state.flags["power-critical-notified"] = true;
      addNotification(state, "Énergie critique", "Les systèmes non prioritaires commencent à s'arrêter.", "critical");
      if (state.settings.autoPauseCritical) state.speed = 0;
    } else if (state.resources.power > 15) {
      state.flags["power-critical-notified"] = false;
    }

    if (state.resources.water <= 1 && !Boolean(state.flags["water-critical-notified"])) {
      state.flags["water-critical-notified"] = true;
      addNotification(state, "Eau critique", "Décontamination, soins et filtration sont dégradés.", "major");
    } else if (state.resources.water > 12) {
      state.flags["water-critical-notified"] = false;
    }
  }

  function isOnShift(member: StaffMember, minuteOfDay: number): boolean {
    const isDay = minuteOfDay >= 360 && minuteOfDay < 1080;
    return member.shift === "day" ? isDay : !isDay;
  }

  function findSurfaceRoomByService(state: GameState, service: string): SurfaceRoom | undefined {
    return state.surfaceRooms
      .filter((room) => room.enabled && getSurfaceDefinition(room.type).services.includes(service))
      .sort((a, b) => a.queue.length - b.queue.length)[0];
  }

  function getRoomCenter(room: SurfaceRoom): Point {
    return { x: room.x + room.width / 2, y: room.y + room.height / 2 };
  }

  function setStaffTarget(state: GameState, member: StaffMember, room?: SurfaceRoom): void {
    if (!room) {
      member.target = undefined;
      member.targetRoomId = undefined;
      member.path = [];
      return;
    }
    const center = getRoomCenter(room);
    member.target = { layer: "surface", x: center.x, y: center.y };
    member.targetRoomId = room.id;
    const start = { x: Math.round(member.position.x), y: Math.round(member.position.y) };
    const goal = { x: Math.round(center.x), y: Math.round(center.y) };
    const blocked = new Set<string>();
    for (const occupied of state.surfaceRooms) {
      if (occupied.type === "corridor" || occupied.id === room.id) continue;
      for (let x = occupied.x; x < occupied.x + occupied.width; x += 1) {
        for (let y = occupied.y; y < occupied.y + occupied.height; y += 1) {
          blocked.add(`${x},${y}`);
        }
      }
    }
    blocked.delete(`${start.x},${start.y}`);
    blocked.delete(`${goal.x},${goal.y}`);
    member.path = getManhattanPath(start, goal, state.surfaceWidth, state.surfaceHeight, blocked);
    member.pathIndex = 0;
    if (member.path.length === 0 && (start.x !== goal.x || start.y !== goal.y)) {
      member.status = "working";
      return;
    }
    if (!["injured", "quarantined", "eating", "resting"].includes(member.status)) member.status = "moving";
  }

  function queueStaffTreatment(state: GameState, member: StaffMember, room: SurfaceRoom, source: string, severity: number): void {
    const alreadyQueued = room.queue.some((item) => item.kind === "patient" && item.metadata?.staffId === member.id)
      || state.workItems.some((item) => item.kind === "patient" && item.metadata?.staffId === member.id);
    if (alreadyQueued) return;
    const item = createWorkItem("patient", severity, state.elapsedMinutes, source);
    item.metadata = { staffId: member.id };
    room.queue.push(item);
  }

  function updateStaff(state: GameState): void {
    const moraleBonus = state.scps.reduce((sum, scp) => {
      if (!scp.contained) return sum;
      return sum + getSCPDefinition(scp.definitionId).moraleEffect;
    }, 0);

    state.staff.forEach((member) => {
      if (member.status === "dead") return;
      const onShift = isOnShift(member, state.minuteOfDay);
      const difficulty = getDifficultyMultiplier(state.settings.difficulty);

      if (!onShift && member.status !== "training" && member.status !== "injured" && member.status !== "quarantined") {
        member.status = "off-duty";
        member.needs.fatigue = clamp(member.needs.fatigue - 0.07, 0, 100);
        member.needs.stress = clamp(member.needs.stress - 0.035 - moraleBonus * 0.0008, 0, 100);
        member.needs.hunger = clamp(member.needs.hunger + 0.018, 0, 100);
        member.needs.morale = clamp(member.needs.morale + 0.015, 0, 100);
        return;
      }

      if (member.status === "training") {
        member.taskProgress += 0.4;
        member.needs.fatigue = clamp(member.needs.fatigue + 0.03, 0, 100);
        if (member.taskProgress >= 100) {
          member.status = "working";
          member.taskProgress = 0;
          member.experience = clamp(member.experience + 9, 0, 100);
          Object.keys(member.skills).forEach((key) => {
            const skill = key as keyof SkillSet;
            const specialist = member.role === "researcher" && skill === "research" || member.role === "guard" && skill === "security" || member.role === "engineer" && skill === "engineering" || member.role === "medic" && skill === "medicine";
            member.skills[skill] = clamp(member.skills[skill] + (specialist ? 5 : 1), 0, 100);
          });
          addNotification(state, "Formation terminée", `${member.name} a achevé sa formation.`, "info");
        }
        return;
      }

      member.needs.fatigue = clamp(member.needs.fatigue + 0.018 * difficulty, 0, 100);
      member.needs.hunger = clamp(member.needs.hunger + 0.022 * difficulty, 0, 100);
      member.needs.stress = clamp(member.needs.stress + (state.crisis.active ? 0.07 : 0.006) * difficulty - moraleBonus * 0.0005, 0, 100);
      member.needs.morale = clamp(member.needs.morale + (state.reputation.personnel - 55) * 0.0004 - member.needs.stress * 0.0003, 0, 100);

      if (member.needs.contamination > 65 && member.status !== "quarantined") {
        member.status = "quarantined";
        const quarantine = findSurfaceRoomByService(state, "quarantine");
        if (quarantine) {
          queueStaffTreatment(state, member, quarantine, "Contamination du personnel", 8);
          setStaffTarget(state, member, quarantine);
        }
        return;
      }

      if (member.needs.health < 45 && member.status !== "injured") {
        member.status = "injured";
        const medical = findSurfaceRoomByService(state, "medical");
        if (medical) {
          queueStaffTreatment(state, member, medical, "Blessure du personnel", 6);
          setStaffTarget(state, member, medical);
        }
        return;
      }

      let desiredRoom: SurfaceRoom | undefined;
      if (member.status === "quarantined") {
        desiredRoom = findSurfaceRoomByService(state, "quarantine");
        if (desiredRoom) queueStaffTreatment(state, member, desiredRoom, "Suivi de quarantaine", 8);
      } else if (member.status === "injured") {
        desiredRoom = findSurfaceRoomByService(state, "medical");
        if (desiredRoom) queueStaffTreatment(state, member, desiredRoom, "Soins du personnel", 6);
      } else if (member.needs.hunger > 72) {
        desiredRoom = findSurfaceRoomByService(state, "food");
        member.status = "eating";
      } else if (member.needs.fatigue > 75 || member.needs.stress > 78) {
        desiredRoom = findSurfaceRoomByService(state, "rest");
        member.status = "resting";
      } else if (member.assignmentRoomId) {
        const surfaceRoom = state.surfaceRooms.find((room) => room.id === member.assignmentRoomId);
        const undergroundRoom = state.undergroundRooms.find((room) => room.id === member.assignmentRoomId);
        if (surfaceRoom) {
          desiredRoom = surfaceRoom;
          if (member.status !== "moving") member.status = "working";
        } else if (undergroundRoom) {
          member.position = { layer: "underground", x: undergroundRoom.x + undergroundRoom.width / 2, y: undergroundRoom.level, level: undergroundRoom.level };
          member.target = undefined;
          member.status = "working";
          applyWorkFatigue(member, undergroundRoom.scpId ? 1.4 : 1);
          return;
        }
      } else {
        desiredRoom = findSurfaceRoomByService(state, member.role === "researcher" ? "research" : member.role === "engineer" ? "repair" : member.role === "medic" ? "medical" : member.role === "guard" || member.role === "mtf" ? "security" : member.role === "logistics" ? "logistics" : "administration");
      }

      if (desiredRoom && member.targetRoomId !== desiredRoom.id && member.position.layer === "surface") {
        setStaffTarget(state, member, desiredRoom);
      }

      if (member.position.layer === "underground" && desiredRoom) {
        const elevator = state.surfaceRooms.find((room) => room.type === "elevator");
        member.position = elevator ? { layer: "surface", ...getRoomCenter(elevator) } : { layer: "surface", x: 22, y: 14 };
        setStaffTarget(state, member, desiredRoom);
      }

      if (member.path.length > member.pathIndex && member.position.layer === "surface") {
        const target = member.path[member.pathIndex];
        // Accessibility preferences affect rendering only, never simulation outcomes.
        const speed = 0.55;
        const dx = target.x - member.position.x;
        const dy = target.y - member.position.y;
        const distance = Math.hypot(dx, dy);
        if (distance <= speed) {
          member.position.x = target.x;
          member.position.y = target.y;
          member.pathIndex += 1;
        } else {
          member.position.x += dx / distance * speed;
          member.position.y += dy / distance * speed;
        }
      } else if (desiredRoom && member.position.layer === "surface") {
        if (member.status === "injured" || member.status === "quarantined") {
          member.needs.stress = clamp(member.needs.stress - 0.03, 0, 100);
        } else if (getSurfaceDefinition(desiredRoom.type).services.includes("food")) {
          member.needs.hunger = clamp(member.needs.hunger - 0.45, 0, 100);
          member.needs.morale = clamp(member.needs.morale + 0.05, 0, 100);
          if (member.needs.hunger < 25) member.status = "working";
        } else if (getSurfaceDefinition(desiredRoom.type).services.includes("rest")) {
          member.needs.fatigue = clamp(member.needs.fatigue - 0.32, 0, 100);
          member.needs.stress = clamp(member.needs.stress - 0.22, 0, 100);
          if (member.needs.fatigue < 35 && member.needs.stress < 45) member.status = "working";
        } else {
          member.status = "working";
          applyWorkFatigue(member, 1);
        }
      }

      if (member.needs.fatigue > 92 || member.needs.stress > 94) {
        const overtimeMultiplier = Boolean(state.flags["night-overtime"]) ? 1.8 : 1;
        const errorChance = 0.0007 * difficulty * overtimeMultiplier;
        if (simulationChance(state, `staff-error-${member.id}`, errorChance)) {
          member.needs.health = clamp(member.needs.health - 8, 0, 100);
          state.reputation.personnel = clamp(state.reputation.personnel - 0.5, 0, 100);
          logHistory(state, `Erreur opérationnelle liée à la fatigue de ${member.name}.`);
        }
      }
    });
  }

  function applyWorkFatigue(member: StaffMember, multiplier: number): void {
    member.needs.fatigue = clamp(member.needs.fatigue + 0.012 * multiplier, 0, 100);
    member.taskProgress = (member.taskProgress + 0.1 * multiplier) % 100;
    if (member.traits.includes("Endurant")) member.needs.fatigue = clamp(member.needs.fatigue - 0.005, 0, 100);
    if (member.traits.includes("Calme")) member.needs.stress = clamp(member.needs.stress - 0.004, 0, 100);
  }

  function createWorkItem(kind: WorkItem["kind"], severity: number, now: number, source: string): WorkItem {
    return {
      id: uid("work"),
      kind,
      severity,
      progress: 0,
      createdAt: now,
      expiresAt: now + 360 + severity * 45,
      source
    };
  }

  export function addQueueItem(state: GameState, kind: WorkItem["kind"], severity: number, preferredService: string, source = "Opération courante"): void {
    const room = findSurfaceRoomByService(state, preferredService);
    const item = createWorkItem(kind, severity, state.elapsedMinutes, source);
    if (room) room.queue.push(item);
    else state.workItems.push(item);
  }

  function spawnRoutineWork(state: GameState): void {
    if (state.elapsedMinutes - Number(state.flags["last-work-spawn"] ?? 0) < 60) return;
    state.flags["last-work-spawn"] = state.elapsedMinutes;
    const rng = new SeededRandom(state.seed + state.elapsedMinutes * 17);
    const staffCount = state.staff.filter((member) => member.status !== "dead").length;
    const activity = 1 + Math.floor((staffCount + state.scps.filter((scp) => scp.transferred).length * 5) / 18);
    for (let index = 0; index < activity; index += 1) {
      const roll = rng.next();
      if (roll < 0.24) addQueueItem(state, "access", rng.int(1, 4), "access", "Contrôle quotidien");
      else if (roll < 0.42) addQueueItem(state, "delivery", rng.int(1, 4), "delivery", "Livraison de couverture");
      else if (roll < 0.58) addQueueItem(state, "patient", rng.int(1, 4), "medical", "Incident mineur");
      else if (roll < 0.76) addQueueItem(state, "repair", rng.int(1, 5), "repair", "Maintenance préventive");
      else addQueueItem(state, "research", rng.int(1, 5), "research", "Analyse documentaire");
    }

    if (state.scps.some((scp) => scp.discovered && !scp.transferred) && rng.chance(0.15)) {
      addQueueItem(state, "anomaly", rng.int(4, 8), "anomaly", "Dossier en attente de transfert");
    }
  }

  function roomServiceEfficiency(state: GameState, room: SurfaceRoom): number {
    const definition = getSurfaceDefinition(room.type);
    const staff = room.staffAssigned
      .map((id) => state.staff.find((member) => member.id === id))
      .filter((member): member is StaffMember => Boolean(member && member.status !== "dead" && member.status !== "off-duty"));
    const required = Object.values(definition.requiredRoles).reduce((sum, count) => sum + (count ?? 0), 0);
    const staffing = required === 0 ? 1 : clamp(staff.length / required, 0, 1.4);
    const wellness = staff.length === 0 ? (required === 0 ? 1 : 0.25) : staff.reduce((sum, member) => sum + (1 - member.needs.fatigue / 180 - member.needs.stress / 220), 0) / staff.length;
    const utility = state.resources.power > 5 && state.resources.water > 3 ? 1 : 0.55;
    const condition = room.condition / 100 * 0.7 + room.cleanliness / 100 * 0.3;
    return clamp(staffing * wellness * utility * condition * (1 + (room.level - 1) * 0.15), 0.05, 2.2);
  }

  function processSurfaceQueues(state: GameState): void {
    state.surfaceRooms.forEach((room) => {
      if (!room.enabled || room.queue.length === 0) return;
      const definition = getSurfaceDefinition(room.type);
      const efficiency = roomServiceEfficiency(state, room);
      const capacity = Math.max(1, Math.floor(definition.capacity / 4));
      room.queue.slice(0, capacity).forEach((item) => {
        item.progress += efficiency * (12 / Math.max(1, item.severity));
      });
      const completed = room.queue.filter((item) => item.progress >= 100);
      completed.forEach((item) => completeWorkItem(state, room, item));
      room.queue = room.queue.filter((item) => item.progress < 100);

      const expired = room.queue.filter((item) => state.elapsedMinutes > item.expiresAt);
      expired.forEach((item) => failWorkItem(state, room, item));
      room.queue = room.queue.filter((item) => state.elapsedMinutes <= item.expiresAt);
    });

    state.workItems = state.workItems.filter((item) => {
      if (state.elapsedMinutes > item.expiresAt) {
        state.reputation.command = clamp(state.reputation.command - item.severity * 0.4, 0, 100);
        return false;
      }
      const service = item.kind === "patient" ? "medical" : item.kind === "delivery" ? "delivery" : item.kind === "anomaly" ? "anomaly" : item.kind === "repair" ? "repair" : item.kind === "research" ? "research" : item.kind === "inspection" ? "cover" : "access";
      const room = findSurfaceRoomByService(state, service);
      if (room) {
        room.queue.push(item);
        return false;
      }
      return true;
    });
  }

  function completeWorkItem(state: GameState, room: SurfaceRoom, item: WorkItem): void {
    switch (item.kind) {
      case "access":
        state.reputation.cover = clamp(state.reputation.cover + 0.12, 0, 100);
        state.resources.intel += item.severity * 0.05;
        break;
      case "patient":
        state.resources.medical = Math.max(0, state.resources.medical - item.severity * 0.08);
        state.reputation.personnel = clamp(state.reputation.personnel + 0.15, 0, 100);
        healStaff(state, item.severity * 1.4, typeof item.metadata?.staffId === "string" ? item.metadata.staffId : undefined);
        break;
      case "delivery":
        state.resources.food += 0.5 + item.severity * 0.3;
        state.resources.parts += 0.3 + item.severity * 0.2;
        break;
      case "anomaly":
        state.resources.research += 0.8 + item.severity * 0.4;
        state.resources.intel += 0.4 + item.severity * 0.2;
        break;
      case "repair":
        state.resources.parts = Math.max(0, state.resources.parts - item.severity * 0.05);
        repairLowestConditionRoom(state, 2 + item.severity);
        break;
      case "research":
        state.resources.research += 0.5 + item.severity * 0.35;
        break;
      case "training":
        state.staff.filter((member) => member.status === "training").forEach((member) => member.experience = clamp(member.experience + 1, 0, 100));
        break;
      case "inspection":
        state.reputation.cover = clamp(state.reputation.cover + 0.8, 0, 100);
        state.reputation.suspicion = clamp(state.reputation.suspicion - 0.4, 0, 100);
        break;
    }
    room.cleanliness = clamp(room.cleanliness - item.severity * 0.4, 0, 100);
  }

  function failWorkItem(state: GameState, room: SurfaceRoom, item: WorkItem): void {
    const penalty = item.severity * 0.5;
    if (item.kind === "access" || item.kind === "inspection") {
      state.reputation.cover = clamp(state.reputation.cover - penalty, 0, 100);
      state.reputation.suspicion = clamp(state.reputation.suspicion + penalty * 0.6, 0, 100);
    } else if (item.kind === "patient") {
      state.reputation.personnel = clamp(state.reputation.personnel - penalty, 0, 100);
      injureRandomStaff(state, item.severity * 2);
    } else if (item.kind === "anomaly") {
      state.reputation.command = clamp(state.reputation.command - penalty, 0, 100);
      if (item.severity >= 7) startCrisis(state, "intake-breach");
    } else if (item.kind === "repair") {
      room.condition = clamp(room.condition - item.severity * 2, 0, 100);
    } else {
      state.reputation.command = clamp(state.reputation.command - penalty * 0.4, 0, 100);
    }
    logHistory(state, `Échec de traitement : ${item.source ?? item.kind}.`);
  }

  function healStaff(state: GameState, amount: number, staffId?: string): void {
    const injured = state.staff
      .filter((member) => (!staffId || member.id === staffId) && (member.status === "injured" || member.status === "quarantined" || member.needs.health < 100 || member.needs.contamination > 0))
      .sort((a, b) => a.needs.health - b.needs.health)[0];
    if (!injured) return;
    injured.needs.health = clamp(injured.needs.health + amount, 0, 100);
    injured.needs.contamination = clamp(injured.needs.contamination - amount * 0.4, 0, 100);
    if (injured.needs.health > 72 && injured.needs.contamination < 35) {
      injured.status = "working";
      injured.target = undefined;
      injured.targetRoomId = undefined;
      injured.path = [];
      autoAssignStaff(state);
    }
  }

  function injureRandomStaff(state: GameState, amount: number): void {
    const candidates = state.staff.filter((member) => member.status !== "dead");
    if (candidates.length === 0) return;
    const member = candidates[simulationIndex(state, "injure-staff", candidates.length)];
    member.needs.health = clamp(member.needs.health - amount, 0, 100);
    if (member.needs.health <= 0) {
      member.status = "dead";
      state.reputation.personnel = clamp(state.reputation.personnel - 5, 0, 100);
      logHistory(state, `${member.name} est décédé en service.`);
    }
  }

  function repairLowestConditionRoom(state: GameState, amount: number): void {
    const surface = [...state.surfaceRooms].sort((a, b) => a.condition - b.condition)[0];
    const underground = [...state.undergroundRooms].sort((a, b) => a.condition - b.condition)[0];
    if (!surface && !underground) return;
    if (!underground || (surface && surface.condition <= underground.condition)) {
      surface.condition = clamp(surface.condition + amount, 0, 100);
      surface.cleanliness = clamp(surface.cleanliness + amount * 0.6, 0, 100);
    } else {
      underground.condition = clamp(underground.condition + amount, 0, 100);
    }
  }

  function updateRoomCondition(state: GameState): void {
    const difficulty = getDifficultyMultiplier(state.settings.difficulty);
    state.regionFacilities.forEach((facility) => {
      facility.condition = clamp(facility.condition - 0.015 * difficulty * (1 + facility.level * 0.08), 0, 100);
    });
    state.surfaceRooms.forEach((room) => {
      const traffic = room.queue.length * 0.01;
      room.condition = clamp(room.condition - (0.01 + traffic) * difficulty, 0, 100);
      room.cleanliness = clamp(room.cleanliness - (0.035 + traffic * 2) * difficulty, 0, 100);
    });
    state.undergroundRooms.forEach((room) => {
      const scpWear = room.scpId ? getSCPDefinition(state.scps.find((scp) => scp.id === room.scpId)?.definitionId ?? "scp-173").risk * 0.002 : 0;
      room.condition = clamp(room.condition - (0.012 + scpWear) * difficulty * (1 + room.level * 0.08), 0, 100);
    });
  }

  export function evaluateProcedureCompliance(state: GameState, scp: SCPInstance): number {
    if (!scp.roomId || !scp.contained) return 0;
    const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
    const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
    if (!room || !procedure) return 0;
    const scpDefinition = getSCPDefinition(scp.definitionId);
    const roomDefinition = getUndergroundDefinition(room.type);
    let score = 20;

    score += clamp((getEffectiveRoomContainment(room) - scpDefinition.requirements.minContainment + 2) * 7, -25, 24);
    score += clamp((getEffectiveRoomSecurity(room) - scpDefinition.requirements.minSecurity + 2) * 5, -20, 18);
    const tagMatches = scpDefinition.requirements.roomTags.filter((tag) => roomDefinition.tags.includes(tag)).length;
    score += tagMatches * 5;
    score += (room.condition - 60) * 0.22;

    const assignedMembers = room.staffAssigned
      .map((id) => state.staff.find((member) => member.id === id))
      .filter((member): member is StaffMember => Boolean(member && !["dead", "off-duty", "injured", "quarantined", "training"].includes(member.status)));
    const requiredStaff = Object.values(scpDefinition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0);
    const plannedStaff = Math.max(requiredStaff, procedure.assignedStaff);
    score += plannedStaff === 0 ? 8 : clamp(assignedMembers.length / plannedStaff * 15, 0, 18);
    const avgTraining = assignedMembers.length ? assignedMembers.reduce((sum, member) => sum + member.experience, 0) / assignedMembers.length : 0;
    score += clamp((avgTraining - procedure.trainingRequired) * 0.15, -12, 8);

    const powerRatio = state.resources.powerCapacity > 0 ? state.resources.power / state.resources.powerCapacity : 0;
    if (powerRatio >= scpDefinition.requirements.powerReliability) score += 10;
    else score -= (scpDefinition.requirements.powerReliability - powerRatio) * 35;

    const flags = scpDefinition.requirements.procedureFlags;
    if (flags.includes("backup-power")) score += procedure.backupPower ? 6 : -12;
    if (flags.includes("analog-backup")) score += procedure.analogBackup ? 5 : -10;
    if (flags.includes("biometric-monitoring")) score += procedure.biometricMonitoring ? 6 : -12;
    if (flags.includes("no-optical")) score += procedure.opticalMonitoring ? -40 : 12;
    if (flags.includes("automated-lockdown")) score += procedure.automatedLockdown ? 6 : -8;
    if (flags.includes("humane-care")) score += procedure.humaneCare ? 7 : -10;
    if (flags.includes("restricted-testing")) score += procedure.restrictedTesting ? 6 : -9;
    if (flags.includes("isolated-network")) score += procedure.isolatedNetwork ? 7 : -12;
    if (flags.includes("redundant-ventilation")) score += procedure.redundantVentilation ? 8 : -14;
    if (flags.includes("observation")) score += clamp((procedure.observationLevel - 50) * 0.18, -8, 9);
    if (flags.includes("maintenance")) score += clamp((procedure.maintenanceFrequency - 55) * 0.16, -8, 8);

    const complexityPenalty = Math.max(0, procedure.complexity - 55) * Math.max(0, 60 - avgTraining) * 0.004;
    score -= complexityPenalty;
    score += scp.knowledge * 0.08;

    if (scp.definitionId === "scp-173") {
      if (assignedMembers.length < 3) score -= 25;
      if (procedure.observationLevel >= 80) score += 8;
      const eyes = state.scps.find((candidate) => candidate.definitionId === "scp-131" && candidate.contained);
      if (eyes && eyes.roomId && state.undergroundRooms.find((candidate) => candidate.id === eyes.roomId)?.level === room.level) score += 5;
    }
    if (scp.definitionId === "scp-096" && procedure.opticalMonitoring) score -= 50;
    if (scp.definitionId === "scp-049") score += procedure.humaneCare ? 8 : -15;
    if (scp.definitionId === "scp-106") score += procedure.maintenanceFrequency >= 75 ? 8 : -12;
    if (scp.definitionId === "scp-939") score += procedure.biometricMonitoring && procedure.analogBackup ? 10 : -15;
    if ((scp.definitionId === "scp-914" || scp.definitionId === "scp-294") && !procedure.restrictedTesting) score -= 14;
    if (scp.definitionId === "scp-682") {
      const acidSystem = state.undergroundRooms.some((candidate) => candidate.level === room.level && candidate.type === "acid-system");
      score += acidSystem ? 18 : -35;
    }
    if (scp.definitionId === "scp-008") score += procedure.redundantVentilation ? 12 : -20;

    return clamp(score, 0, 100);
  }

  function updateSCPContainment(state: GameState): void {
    const difficulty = getDifficultyMultiplier(state.settings.difficulty);
    state.scps.filter((scp) => scp.contained).forEach((scp) => {
      const definition = getSCPDefinition(scp.definitionId);
      const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
      const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
      if (!procedure || !room) return;
      const compliance = evaluateProcedureCompliance(state, scp);
      procedure.compliance = round(compliance, 1);

      let supplyShortage = 0;
      Object.entries(definition.requirements.suppliesPerDay).forEach(([key, perDay]) => {
        const hourly = (perDay ?? 0) / 24;
        if (getResource(state.resources, key as ResourceKey) >= hourly) addResource(state.resources, key as ResourceKey, -hourly);
        else supplyShortage += 8;
      });

      const basePressure = definition.risk * 0.12 * difficulty;
      const complianceEffect = (50 - compliance) * 0.035;
      const conditionPenalty = Math.max(0, 65 - room.condition) * 0.04;
      const randomNoise = (Math.sin((state.elapsedMinutes + definition.risk * 19) / 73) + 1) * 0.04;
      scp.breachRisk = clamp(scp.breachRisk + basePressure + complianceEffect + conditionPenalty + supplyShortage + randomNoise - (compliance > 75 ? 0.9 : 0), 0, 120);
      const previousResearchProgress = scp.researchProgress;
      scp.researchProgress = clamp(scp.researchProgress + Math.max(0.1, compliance / 120), 0, 100);
      scp.knowledge = clamp(scp.knowledge + compliance / 700, 0, 100);
      const researchFlag = `scp-research-complete:${scp.definitionId}`;
      if (previousResearchProgress < 100 && scp.researchProgress >= 100 && !Boolean(state.flags[researchFlag])) {
        state.flags[researchFlag] = true;
        state.resources.research += definition.researchValue;
        scp.knowledge = clamp(scp.knowledge + 12, 0, 100);
        addNotification(state, `Étude ${definition.designation} consolidée`, `Le dossier accorde ${definition.researchValue} points de recherche.`, "info");
        logHistory(state, `Programme d'étude ${definition.designation} achevé.`);
      }
      scp.daysContained += 1 / 24;
      scp.mood = clamp(scp.mood + (procedure.humaneCare ? 0.4 : -0.25) - definition.risk * 0.015, 0, 100);

      if (scp.definitionId === "scp-999") {
        state.staff.forEach((member) => {
          member.needs.stress = clamp(member.needs.stress - 0.25, 0, 100);
          member.needs.morale = clamp(member.needs.morale + 0.15, 0, 100);
        });
        scp.breachRisk = clamp(scp.breachRisk - 2, 0, 100);
      }
      if (scp.definitionId === "scp-914" && compliance > 75 && simulationChance(state, `scp-914-${scp.id}`, 0.18)) state.resources.parts += 1.5;
      if (scp.definitionId === "scp-294" && compliance > 70 && simulationChance(state, `scp-294-${scp.id}`, 0.15)) state.resources.medical += 0.6;
      if (scp.definitionId === "scp-087" && !procedure.restrictedTesting && simulationChance(state, `scp-087-${scp.id}`, 0.08)) scp.breachRisk += 8;

      if (compliance >= 80) scp.activeEffect = "Confinement nominal";
      else if (compliance >= 60) scp.activeEffect = "Confinement sous surveillance";
      else if (compliance >= 40) scp.activeEffect = "Procédure dégradée";
      else scp.activeEffect = "Risque critique";

      if (scp.breachRisk >= 100 && !state.crisis.active) {
        startCrisis(state, "scp-breach", scp.id);
      }
    });
  }

  function produceResearchAndIntel(state: GameState): void {
    const researchRooms = state.surfaceRooms.filter((room) => room.enabled && ["research", "laboratory", "archive"].includes(room.type));
    let research = 0;
    let intel = 0;
    researchRooms.forEach((room) => {
      const efficiency = roomServiceEfficiency(state, room);
      if (room.type === "research") research += 0.8 * efficiency;
      if (room.type === "laboratory") research += 0.45 * efficiency;
      if (room.type === "archive") { research += 0.2 * efficiency; intel += 0.3 * efficiency; }
    });
    state.undergroundRooms.filter((room) => room.type === "research-lab" && room.enabled).forEach((room) => {
      research += 0.5 * room.condition / 100;
    });
    state.resources.research += research;
    state.resources.intel += intel;
  }

  function updateReputation(state: GameState): void {
    const averageMorale = state.staff.length ? state.staff.filter((member) => member.status !== "dead").reduce((sum, member) => sum + member.needs.morale, 0) / Math.max(1, state.staff.filter((member) => member.status !== "dead").length) : 50;
    const averageStress = state.staff.length ? state.staff.filter((member) => member.status !== "dead").reduce((sum, member) => sum + member.needs.stress, 0) / Math.max(1, state.staff.filter((member) => member.status !== "dead").length) : 50;
    state.reputation.personnel = clamp(state.reputation.personnel + (averageMorale - 60) * 0.003 - averageStress * 0.0015, 0, 100);

    const regionalCover = state.regionFacilities.reduce((sum, facility) => sum + (getRegionDefinition(facility.type).coverImpact ?? 0) * 0.004, 0);
    const queuePressure = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length, 0);
    state.reputation.cover = clamp(state.reputation.cover + regionalCover - queuePressure * 0.006 - state.reputation.suspicion * 0.002, 0, 100);
    state.reputation.suspicion = clamp(state.reputation.suspicion + Math.max(0, 55 - state.reputation.cover) * 0.005 - regionalCover * 0.3, 0, 100);

    const averageCompliance = state.scps.filter((scp) => scp.contained).length
      ? state.scps.filter((scp) => scp.contained).reduce((sum, scp) => sum + evaluateProcedureCompliance(state, scp), 0) / state.scps.filter((scp) => scp.contained).length
      : 65;
    state.reputation.command = clamp(state.reputation.command + (averageCompliance - 60) * 0.004 - (state.crisis.active ? 0.15 : 0), 0, 100);

    const humaneProcedures = state.procedures.filter((procedure) => procedure.humaneCare).length;
    const activeProcedures = Math.max(1, state.scps.filter((scp) => scp.contained).length);
    state.reputation.ethics = clamp(state.reputation.ethics + (humaneProcedures / activeProcedures - 0.5) * 0.025, 0, 100);
  }

  function dailyUpdate(state: GameState): void {
    const activeStaff = state.staff.filter((member) => member.status !== "dead");
    const salary = activeStaff.reduce((sum, member) => sum + member.salary, 0);
    const facilityUpkeep = state.regionFacilities.reduce((sum, facility) => sum + getRegionDefinition(facility.type).upkeep * facility.level, 0);
    const surfaceUpkeep = state.surfaceRooms.reduce((sum, room) => sum + getSurfaceDefinition(room.type).upkeep * room.level, 0);
    const undergroundUpkeep = state.undergroundRooms.reduce((sum, room) => sum + getUndergroundDefinition(room.type).upkeep, 0);
    const income = 8500 + state.reputation.command * 95 + state.reputation.cover * 35;
    const costs = salary + facilityUpkeep + surfaceUpkeep + undergroundUpkeep;
    state.resources.funds = Math.max(0, state.resources.funds + income - costs);

    const foodNeed = activeStaff.length * 0.42;
    if (state.resources.food >= foodNeed) state.resources.food -= foodNeed;
    else {
      activeStaff.forEach((member) => {
        member.needs.hunger = clamp(member.needs.hunger + 18, 0, 100);
        member.needs.morale = clamp(member.needs.morale - 8, 0, 100);
      });
      state.reputation.personnel = clamp(state.reputation.personnel - 4, 0, 100);
    }

    state.regionFacilities.filter((facility) => facility.enabled).forEach((facility) => {
      const production = getRegionDefinition(facility.type).supplyProduction;
      if (!production) return;
      Object.entries(production).forEach(([key, value]) => {
        if (typeof value === "number") addResource(state.resources, key as ResourceKey, value * facility.level);
      });
    });

    if (Boolean(state.flags["rationing"])) {
      activeStaff.forEach((member) => member.needs.morale = clamp(member.needs.morale - 2, 0, 100));
      if (state.resources.medical > 15 && state.resources.chemicals > 15) state.flags["rationing"] = false;
    }
    state.flags["surface-blackout"] = false;

    addNotification(state, `Rapport journalier J${state.day}`, `Budget : +${formatNumber(income)} / -${formatNumber(costs)}. Personnel actif : ${activeStaff.length}.`, costs > income ? "major" : "info");
    logHistory(state, `Clôture journalière : revenus ${formatNumber(income)}, coûts ${formatNumber(costs)}.`);

    if (state.resources.funds <= 0) {
      state.reputation.command = clamp(state.reputation.command - 5, 0, 100);
      state.reputation.personnel = clamp(state.reputation.personnel - 4, 0, 100);
    }
    if (state.reputation.cover <= 5 || state.reputation.suspicion >= 98) {
      state.gameOver = true;
      state.speed = 0;
      addNotification(state, "Rupture du Voile", "La couverture du Site s'est effondrée. Le commandement vous relève de vos fonctions.", "critical");
    }
  }

  function maybeSpawnRandomEvent(state: GameState): void {
    if (state.currentEventId || state.crisis.active) return;
    const last = Number(state.flags["last-random-event"] ?? 0);
    if (state.elapsedMinutes - last < 360) return;
    const difficulty = getDifficultyMultiplier(state.settings.difficulty);
    const chance = 0.08 * difficulty + state.reputation.suspicion * 0.0006;
    const rng = new SeededRandom(state.seed + state.elapsedMinutes * 31);
    if (!rng.chance(chance)) return;
    const candidates = EVENT_TEMPLATES.filter((template) => template.minDay <= state.day);
    const template = choiceWeighted(rng, candidates);
    if (!template) return;
    spawnEvent(state, template.id);
  }

  export function spawnEvent(state: GameState, templateId: string): void {
    const template = EVENT_TEMPLATES.find((entry) => entry.id === templateId);
    if (!template) return;
    const event: GameEvent = {
      id: uid("event"),
      templateId: template.id,
      title: template.title,
      body: template.body,
      severity: template.severity,
      choices: deepClone(template.choices),
      createdAt: state.elapsedMinutes,
      resolved: false,
      blocking: template.blocking
    };
    state.events.unshift(event);
    state.currentEventId = event.id;
    state.flags["last-random-event"] = state.elapsedMinutes;
    if (template.blocking) {
      state.flags["event-player-paused"] = state.speed === 0;
      if (state.speed > 0) state.previousSpeed = state.speed;
      state.speed = 0;
    }
    addNotification(state, template.title, template.body, template.severity);
  }

  export function resolveEventChoice(state: GameState, eventId: string, choiceId: string): { ok: boolean; message: string } {
    const event = state.events.find((entry) => entry.id === eventId);
    if (!event || event.resolved) return { ok: false, message: "Événement indisponible." };
    const choice = event.choices.find((entry) => entry.id === choiceId);
    if (!choice) return { ok: false, message: "Décision inconnue." };
    if (choice.cost && !payCost(state.resources, choice.cost)) return { ok: false, message: "Ressources insuffisantes pour cette décision." };

    choice.effects.forEach((effect) => applyEventEffect(state, effect));
    event.resolved = true;
    state.currentEventId = undefined;
    logHistory(state, `${event.title} — décision : ${choice.label}.`);
    const playerWasPaused = Boolean(state.flags["event-player-paused"]);
    state.flags["event-player-paused"] = false;
    if (!playerWasPaused && !state.crisis.active && state.speed === 0) state.speed = state.previousSpeed || 1;
    return { ok: true, message: choice.label };
  }

  function applyEventEffect(state: GameState, effect: EventEffect): void {
    switch (effect.type) {
      case "resource":
        if (effect.key && typeof effect.amount === "number") addResource(state.resources, effect.key as ResourceKey, effect.amount);
        break;
      case "reputation":
        if (effect.key && typeof effect.amount === "number") {
          const key = effect.key as ReputationKey;
          state.reputation[key] = clamp(state.reputation[key] + effect.amount, 0, 100);
        }
        break;
      case "queue":
        if (effect.key && typeof effect.amount === "number") {
          const kind = effect.key as WorkItem["kind"];
          for (let index = 0; index < effect.amount; index += 1) addQueueItem(state, kind, 3 + index, effect.target ?? "access", "Conséquence d'événement");
        }
        break;
      case "crisis":
        startCrisis(state, String(effect.value ?? "generic"));
        break;
      case "staff":
        if (effect.key && typeof effect.amount === "number") {
          state.staff.filter((member) => effect.target === "night" ? member.shift === "night" : effect.target === member.role || effect.target === "all").forEach((member) => {
            if (effect.key === "stress") member.needs.stress = clamp(member.needs.stress + effect.amount!, 0, 100);
            if (effect.key === "fatigue") member.needs.fatigue = clamp(member.needs.fatigue + effect.amount!, 0, 100);
            if (effect.key === "morale") member.needs.morale = clamp(member.needs.morale + effect.amount!, 0, 100);
          });
        }
        break;
      case "scp":
        if (effect.key && typeof effect.amount === "number") {
          state.scps.filter((scp) => effect.target === "all" || scp.id === effect.target || scp.definitionId === effect.target).forEach((scp) => {
            if (effect.key === "breachRisk") scp.breachRisk = clamp(scp.breachRisk + effect.amount!, 0, 120);
            if (effect.key === "mood") scp.mood = clamp(scp.mood + effect.amount!, 0, 100);
          });
        }
        break;
      case "flag":
        if (effect.key) {
          state.flags[effect.key] = effect.value ?? true;
          state.flags[`${effect.key}:at`] = state.elapsedMinutes;
        }
        break;
      case "log":
        logHistory(state, String(effect.value ?? "Événement enregistré."));
        break;
    }
  }

  function createCrisisZones(state: GameState, sourceScpId?: string): CrisisZone[] {
    const zones: CrisisZone[] = [
      { id: "surface-access", name: "Surface — accès et accueil", layer: "surface", security: 45, population: Math.ceil(state.staff.length * 0.2), casualties: 0, contamination: 0, power: 100, sealed: false, evacuated: false, threat: 8 },
      { id: "surface-operations", name: "Surface — opérations", layer: "surface", security: 55, population: Math.ceil(state.staff.length * 0.45), casualties: 0, contamination: 0, power: 100, sealed: false, evacuated: false, threat: 5 },
      { id: "surface-medical", name: "Surface — médical et quarantaine", layer: "surface", security: 35, population: Math.ceil(state.staff.length * 0.15), casualties: 0, contamination: 0, power: 100, sealed: false, evacuated: false, threat: 3 }
    ];
    const usedLevels = [...new Set(state.undergroundRooms.map((room) => room.level))].sort((a, b) => a - b);
    usedLevels.forEach((level) => {
      const rooms = state.undergroundRooms.filter((room) => room.level === level);
      const source = rooms.some((room) => room.scpId === sourceScpId);
      const security = rooms.reduce((sum, room) => sum + getUndergroundDefinition(room.type).security, 0) * 4;
      zones.push({
        id: `level-${level}`,
        name: `Niveau -${level + 1}`,
        layer: "underground",
        level,
        security: clamp(security, 20, 100),
        population: state.staff.filter((member) => member.position.layer === "underground" && member.position.level === level).length + rooms.filter((room) => room.staffAssigned.length > 0).length,
        casualties: 0,
        contamination: 0,
        power: 100,
        sealed: false,
        evacuated: false,
        threat: source ? 75 : Math.max(2, 12 - level)
      });
    });
    return zones;
  }

  export function startCrisis(state: GameState, type: string, sourceScpId?: string): void {
    if (state.crisis.active) return;
    const sourceScp = sourceScpId ? state.scps.find((entry) => entry.id === sourceScpId || entry.definitionId === sourceScpId) : undefined;
    const sourceDefinition = sourceScp ? getSCPDefinition(sourceScp.definitionId) : undefined;
    const severity = sourceDefinition ? clamp(sourceDefinition.risk, 5, 12) : type === "biohazard" ? 9 : type === "infiltration" ? 7 : 6;
    const title = sourceDefinition ? `Brèche de ${sourceDefinition.designation}` : type === "biohazard" ? "Contamination biologique" : type === "infiltration" ? "Sabotage interne" : type === "intake-breach" ? "Brèche au triage" : "Crise de confinement";
    state.crisis = {
      active: true,
      type,
      title,
      description: sourceDefinition ? `${sourceDefinition.name} n'est plus sous contrôle nominal. Isolez les zones, protégez le personnel et rétablissez la procédure.` : "Une situation multisectorielle menace la continuité du Site.",
      severity,
      elapsed: 0,
      siteIntegrity: 100,
      veilExposure: Math.max(0, state.reputation.suspicion * 0.2),
      threatProgress: 65 + severity * 3,
      sourceScpId: sourceScp?.id,
      zones: createCrisisZones(state, sourceScp?.id),
      orders: [],
      log: [`${formatTime(state.day, state.minuteOfDay)} — Alerte générale déclenchée.`]
    };
    if (sourceScp) {
      sourceScp.contained = false;
      sourceScp.incidents += 1;
      sourceScp.activeEffect = "Brèche active";
      const room = state.undergroundRooms.find((entry) => entry.id === sourceScp.roomId);
      if (room) room.sealed = false;
    }
    state.previousSpeed = state.speed || state.previousSpeed || 1;
    state.speed = 0;
    state.view = "command";
    state.currentEventId = undefined;
    addNotification(state, title, state.crisis.description, "critical");
    logHistory(state, title);
  }

  export function issueCrisisOrder(state: GameState, type: CrisisOrderType, zoneId: string): { ok: boolean; message: string } {
    if (!state.crisis.active) return { ok: false, message: "Aucune crise active." };
    const zone = state.crisis.zones.find((entry) => entry.id === zoneId);
    if (!zone) return { ok: false, message: "Zone inconnue." };
    if (state.crisis.orders.some((order) => order.zoneId === zoneId && order.type === type && order.status !== "failed")) return { ok: false, message: "Cet ordre est déjà en cours." };

    const costs: Partial<Record<CrisisOrderType, Cost>> = {
      "lockdown": { parts: 1 },
      "evacuate": {},
      "deploy-security": { ammo: 2 },
      "deploy-mtf": { ammo: 5, medical: 1 },
      "restore-power": { parts: 4 },
      "decontaminate": { chemicals: 3, medical: 1 },
      "medical-response": { medical: 3 },
      "seal-ventilation": { parts: 2, chemicals: 1 },
      "amnestic-response": { medical: 4, intel: 2 }
    };
    const cost = costs[type] ?? {};
    const assigned = getAvailableCrisisStaff(state, type);
    if (assigned <= 0) return { ok: false, message: "Aucun effectif disponible pour cet ordre." };
    if (type === "deploy-mtf" && assigned < 2 && !state.surfaceRooms.some((room) => room.type === "mtf-bay")) return { ok: false, message: "Aucune capacité FTM disponible." };
    if (!payCost(state.resources, cost)) return { ok: false, message: "Ressources insuffisantes." };

    const durations: Record<CrisisOrderType, number> = {
      "lockdown": 18,
      "evacuate": 35,
      "deploy-security": 30,
      "deploy-mtf": 24,
      "restore-power": 42,
      "decontaminate": 55,
      "medical-response": 32,
      "seal-ventilation": 28,
      "amnestic-response": 45
    };
    const order: CrisisOrder = {
      id: uid("order"),
      type,
      zoneId,
      progress: 0,
      duration: durations[type],
      assigned,
      status: "queued"
    };
    state.crisis.orders.push(order);
    state.crisis.log.unshift(`${formatTime(state.day, state.minuteOfDay)} — Ordre « ${crisisOrderLabel(type)} » transmis à ${zone.name}.`);
    if (state.speed === 0) state.speed = 1;
    return { ok: true, message: `Ordre transmis à ${zone.name}.` };
  }

  export function crisisOrderLabel(type: CrisisOrderType): string {
    const labels: Record<CrisisOrderType, string> = {
      "lockdown": "Verrouiller",
      "evacuate": "Évacuer",
      "deploy-security": "Déployer la sécurité",
      "deploy-mtf": "Déployer une FTM",
      "restore-power": "Rétablir l'énergie",
      "decontaminate": "Décontaminer",
      "medical-response": "Réponse médicale",
      "seal-ventilation": "Sceller la ventilation",
      "amnestic-response": "Réponse amnésique"
    };
    return labels[type];
  }

  function updateCrisis(state: GameState): void {
    const crisis = state.crisis;
    crisis.elapsed += 1;
    crisis.orders.forEach((order) => {
      if (order.status === "completed" || order.status === "failed") return;
      order.status = "active";
      const competence = order.type === "deploy-mtf" || order.type === "deploy-security"
        ? averageRoleSkill(state, order.type === "deploy-mtf" ? "mtf" : "guard", "security")
        : order.type === "restore-power" || order.type === "lockdown" || order.type === "seal-ventilation"
          ? averageRoleSkill(state, "engineer", "engineering")
          : order.type === "medical-response" || order.type === "decontaminate"
            ? averageRoleSkill(state, "medic", "medicine")
            : averageRoleSkill(state, "admin", "administration");
      const speed = 1 + order.assigned * 0.08 + competence / 100 * 0.55;
      order.progress += speed;
      if (order.progress >= order.duration) completeCrisisOrder(state, order);
    });

    if (crisis.elapsed % 5 === 0) {
      let totalThreat = 0;
      crisis.zones.forEach((zone) => {
        if (zone.evacuated) zone.population = Math.max(0, zone.population - 1);
        const spread = zone.sealed ? 0.25 : 1;
        zone.threat = clamp(zone.threat + crisis.severity * 0.18 * spread - zone.security * 0.006, 0, 100);
        if (crisis.type === "biohazard" || crisis.sourceScpId && getSCPDefinition(state.scps.find((scp) => scp.id === crisis.sourceScpId)?.definitionId ?? "scp-173").id === "scp-008") {
          zone.contamination = clamp(zone.contamination + zone.threat * 0.015 * (zone.sealed ? 0.5 : 1), 0, 100);
        }
        if (zone.threat > 55 && zone.population > 0 && simulationChance(state, `crisis-casualty-${zone.id}`, 0.08 * crisis.severity / 10)) {
          zone.casualties += 1;
          zone.population = Math.max(0, zone.population - 1);
          crisis.siteIntegrity = clamp(crisis.siteIntegrity - 1.8, 0, 100);
        }
        totalThreat += zone.threat;
      });
      const responsePower = crisis.orders.filter((order) => order.status === "completed" && ["deploy-security", "deploy-mtf", "lockdown", "decontaminate"].includes(order.type)).length * 5;
      crisis.threatProgress = clamp(totalThreat / Math.max(1, crisis.zones.length) + crisis.severity * 2 - responsePower, 0, 120);
      crisis.siteIntegrity = clamp(crisis.siteIntegrity - Math.max(0, crisis.threatProgress - 65) * 0.02, 0, 100);
      crisis.veilExposure = clamp(crisis.veilExposure + Math.max(0, crisis.threatProgress - 55) * 0.013 + (crisis.zones.some((zone) => zone.layer === "surface" && zone.threat > 50) ? 0.35 : 0), 0, 100);
    }

    if (crisis.threatProgress <= 12 && crisis.elapsed > 25) resolveCrisis(state, true);
    else if (crisis.siteIntegrity <= 0 || crisis.veilExposure >= 100) resolveCrisis(state, false);
    else if (crisis.elapsed > 720) resolveCrisis(state, crisis.threatProgress < 45);
  }

  function averageRoleSkill(state: GameState, role: StaffRole, skill: keyof SkillSet): number {
    const members = state.staff.filter((member) => member.role === role && isStaffAvailableForCrisis(state, member));
    if (members.length === 0) return 10;
    return members.reduce((sum, member) => sum + member.skills[skill], 0) / members.length;
  }

  function updateKeterStability(state: GameState): void {
    const stableKeter = state.scps.some((scp) => scp.contained && getSCPDefinition(scp.definitionId).objectClass === "Keter" && scp.breachRisk < 25);
    const minutes = stableKeter ? Number(state.flags["stable-keter-minutes"] ?? 0) + 1 : 0;
    state.flags["stable-keter-minutes"] = minutes;
    state.flags["stable-keter-days"] = Math.floor(minutes / 1440);
  }

  function updateInternalSecurity(state: GameState): void {
    const active = state.staff.filter((member) => member.status !== "dead" && member.role !== "director");
    if (active.length === 0) return;
    const authentication = isResearchUnlockActive(state, "biometric-monitoring") || isResearchUnlockActive(state, "analog-backup");
    const contained = Boolean(state.flags["infiltration-contained"]);
    const chance = clamp(0.0015 + state.reputation.suspicion / 5000, 0.0015, 0.022) * (authentication ? 0.45 : 1) * (contained ? 0.35 : 1);
    if (!active.some((member) => member.compromised) && simulationChance(state, "internal-compromise", chance)) {
      const candidate = [...active].sort((a, b) => a.loyalty - b.loyalty || a.id.localeCompare(b.id))[0];
      candidate.compromised = true;
      candidate.loyalty = clamp(candidate.loyalty - 8, 0, 100);
      addNotification(state, "Anomalie d'habilitation", "La sécurité interne signale des accès incohérents. Lancez des vérifications ciblées.", "major");
      logHistory(state, "SCiPnet détecte une signature d'accès interne incohérente.");
    }
    if (state.elapsedMinutes % 360 === 0) {
      const threats = active.filter((member) => member.compromised);
      if (threats.length > 0) {
        state.resources.intel = Math.max(0, state.resources.intel - threats.length);
        state.reputation.suspicion = clamp(state.reputation.suspicion + threats.length * 0.7, 0, 100);
        addQueueItem(state, "access", 3 + threats.length, "access", "Trafic d'identité incohérent");
      }
    }
  }

  function updateDeferredConsequences(state: GameState): void {
    const age = (key: string): number => state.elapsedMinutes - Number(state.flags[`${key}:at`] ?? state.elapsedMinutes);
    if (Boolean(state.flags["inspection-delayed"]) && age("inspection-delayed") >= 720) {
      state.flags["inspection-delayed"] = false;
      state.reputation.suspicion = clamp(state.reputation.suspicion + 2, 0, 100);
      addQueueItem(state, "inspection", 8, "cover", "Inspection reprogrammée");
      addNotification(state, "Inspection reprogrammée", "Le délai est écoulé : l'équipe de couverture doit maintenant absorber un audit renforcé.", "major");
    }
    if (Boolean(state.flags["night-overtime"]) && age("night-overtime") >= 720) {
      state.flags["night-overtime"] = false;
      addNotification(state, "Relève nocturne normalisée", "La surtension opérationnelle de nuit prend fin.", "info");
    }
    if (Boolean(state.flags["infiltration-shadowed"]) && age("infiltration-shadowed") >= 360) {
      state.flags["infiltration-shadowed"] = false;
      const threat = state.staff.find((member) => member.compromised);
      if (threat) {
        threat.compromised = false;
        threat.loyalty = clamp(threat.loyalty + 4, 0, 100);
      }
      state.resources.intel += threat ? 6 : 3;
      state.reputation.suspicion = clamp(state.reputation.suspicion - 1, 0, 100);
      addNotification(state, "Filature conclue", threat ? "Le réseau hostile a été cartographié et son relais interne neutralisé." : "La piste ne révèle aucun relais actif, mais fournit des signatures utiles.", "info");
    }
    if (Boolean(state.flags["infiltration-contained"]) && age("infiltration-contained") >= 1440) {
      state.flags["infiltration-contained"] = false;
    }
    if (Boolean(state.flags["ethics-redacted"]) && age("ethics-redacted") >= 1440) {
      state.flags["ethics-redacted"] = false;
      state.reputation.ethics = clamp(state.reputation.ethics - 2, 0, 100);
      state.reputation.command = clamp(state.reputation.command - 1, 0, 100);
      addQueueItem(state, "inspection", 6, "cover", "Recoupement du Comité d'éthique");
      addNotification(state, "Recoupement éthique", "Des incohérences dans le rapport expurgé provoquent un contrôle complémentaire.", "major");
    }
  }

  function getAvailableCrisisStaff(state: GameState, type: CrisisOrderType): number {
    const role = CRISIS_ORDER_ROLES[type];
    if (!role) return state.staff.some((member) => member.role === "director" && member.status !== "dead") ? 1 : 0;
    const activeOrders = state.crisis.orders.filter((order) => order.status !== "completed" && order.status !== "failed");
    const alreadyCommitted = activeOrders.reduce((sum, order) => CRISIS_ORDER_ROLES[order.type] === role ? sum + order.assigned : sum, 0);
    const available = state.staff.filter((member) => member.role === role && isStaffAvailableForCrisis(state, member)).length;
    const roomReserve = type === "deploy-mtf" && state.surfaceRooms.some((room) => room.type === "mtf-bay" && room.enabled) ? 2 : 0;
    return Math.max(0, available + roomReserve - alreadyCommitted);
  }

  function isStaffAvailableForCrisis(state: GameState, member: StaffMember): boolean {
    return member.status !== "dead" && member.status !== "quarantined" && member.status !== "injured" && member.status !== "training" && (member.status !== "off-duty" || state.crisis.active);
  }

  function completeCrisisOrder(state: GameState, order: CrisisOrder): void {
    order.status = "completed";
    const zone = state.crisis.zones.find((entry) => entry.id === order.zoneId);
    if (!zone) return;
    switch (order.type) {
      case "lockdown": zone.sealed = true; zone.security = clamp(zone.security + 12, 0, 100); zone.threat = clamp(zone.threat - 8, 0, 100); break;
      case "evacuate": zone.evacuated = true; zone.population = Math.max(0, Math.floor(zone.population * 0.25)); break;
      case "deploy-security": zone.security = clamp(zone.security + 28, 0, 100); zone.threat = clamp(zone.threat - 20, 0, 100); break;
      case "deploy-mtf": zone.security = clamp(zone.security + 45, 0, 100); zone.threat = clamp(zone.threat - 36, 0, 100); state.crisis.threatProgress = clamp(state.crisis.threatProgress - 10, 0, 120); break;
      case "restore-power": zone.power = 100; zone.security = clamp(zone.security + 8, 0, 100); break;
      case "decontaminate": zone.contamination = clamp(zone.contamination - 55, 0, 100); zone.threat = clamp(zone.threat - 12, 0, 100); break;
      case "medical-response": zone.casualties = Math.max(0, zone.casualties - 1); state.crisis.siteIntegrity = clamp(state.crisis.siteIntegrity + 4, 0, 100); break;
      case "seal-ventilation": zone.sealed = true; zone.contamination = clamp(zone.contamination - 12, 0, 100); break;
      case "amnestic-response": state.crisis.veilExposure = clamp(state.crisis.veilExposure - 24, 0, 100); state.reputation.ethics = clamp(state.reputation.ethics - 2, 0, 100); break;
    }
    state.crisis.log.unshift(`${formatTime(state.day, state.minuteOfDay)} — ${crisisOrderLabel(order.type)} terminé dans ${zone.name}.`);
  }

  function resolveCrisis(state: GameState, success: boolean): void {
    const crisis = state.crisis;
    crisis.active = false;
    crisis.resolved = success ? "success" : "failure";
    state.speed = 0;
    const casualties = crisis.zones.reduce((sum, zone) => sum + zone.casualties, 0);
    if (success) {
      state.flags["crisis-success-count"] = Number(state.flags["crisis-success-count"] ?? 0) + 1;
      state.reputation.command = clamp(state.reputation.command + 4 - casualties * 0.4, 0, 100);
      state.reputation.cover = clamp(state.reputation.cover - crisis.veilExposure * 0.05, 0, 100);
      state.resources.intel += 5 + crisis.severity;
      if (crisis.sourceScpId) {
        const scp = state.scps.find((entry) => entry.id === crisis.sourceScpId);
        if (scp) {
          scp.contained = true;
          scp.breachRisk = 32 + crisis.severity;
          scp.activeEffect = "Reconfinement sous surveillance";
          const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
          if (procedure) {
            procedure.version += 1;
            procedure.notes = `${procedure.notes}\nAddendum automatique : brèche résolue J${state.day}, ${casualties} victime(s).`;
          }
        }
      }
      addNotification(state, "Crise résolue", `Le Site est stabilisé. ${casualties} victime(s), exposition du Voile ${Math.round(crisis.veilExposure)} %.`, casualties > 0 ? "major" : "info");
      logHistory(state, `Crise résolue avec ${casualties} victime(s).`);
    } else {
      state.reputation.command = clamp(state.reputation.command - 15, 0, 100);
      state.reputation.cover = clamp(state.reputation.cover - 20, 0, 100);
      state.reputation.personnel = clamp(state.reputation.personnel - 12, 0, 100);
      addNotification(state, "Échec de confinement", `Le Site a perdu le contrôle de la situation. ${casualties} victime(s).`, "critical");
      logHistory(state, `Échec de crise, intégrité ${Math.round(crisis.siteIntegrity)} %, Voile ${Math.round(crisis.veilExposure)} %.`);
      if (crisis.siteIntegrity <= 0 || crisis.veilExposure >= 100) state.gameOver = true;
    }
    updateCampaign(state);
  }

  function updateCampaign(state: GameState): void {
    if (state.mode !== "campaign" || state.victory) return;
    const chapter = state.campaign[state.currentChapter];
    if (!chapter || chapter.complete) return;
    chapter.objectives.forEach((objective) => {
      const progress = evaluateObjective(state, objective.condition);
      objective.progress = clamp(progress, 0, objective.target);
      if (!objective.complete && objective.progress >= objective.target) {
        objective.complete = true;
        addCost(state.resources, objective.reward);
        addNotification(state, `Objectif : ${objective.title}`, `Objectif accompli. Récompense : ${costToString(objective.reward) || "autorisation spéciale"}.`, "info");
      }
    });
    if (chapter.objectives.every((objective) => objective.complete)) {
      chapter.complete = true;
      addNotification(state, `Chapitre terminé : ${chapter.title}`, chapter.rewardText, "info");
      logHistory(state, `${chapter.title} achevé.`);
      if (state.currentChapter >= state.campaign.length - 1) {
        state.victory = true;
        state.speed = 0;
        saveGame(state, false);
      } else {
        state.currentChapter += 1;
        unlockChapterScps(state, state.currentChapter);
        const next = state.campaign[state.currentChapter];
        addNotification(state, next.title, next.briefing, "major");
      }
    }
  }

  function unlockChapterScps(state: GameState, chapterIndex: number): void {
    const chapter = state.campaign[chapterIndex];
    if (!chapter) return;
    chapter.unlockedScps.forEach((definitionId) => {
      const scp = state.scps.find((entry) => entry.definitionId === definitionId);
      if (scp) scp.discovered = true;
    });
  }

  function evaluateObjective(state: GameState, condition: string): number {
    switch (condition) {
      case "region-facilities": return state.regionFacilities.filter((facility) => facility.type !== "road").length;
      case "surface-core": {
        const required: SurfaceRoomType[] = ["reception", "checkpoint", "medical", "maintenance", "elevator", "laboratory", "warehouse", "staff-room"];
        return required.filter((type) => state.surfaceRooms.some((room) => room.type === type)).length;
      }
      case "staff-count": return state.staff.filter((member) => member.status !== "dead").length;
      case "contained-scps": return state.scps.filter((scp) => scp.contained).length;
      case "procedure-compliance": return Math.max(0, ...state.procedures.map((procedure) => procedure.compliance));
      case "research-resource": return state.resources.research;
      case "personnel-reputation": return state.reputation.personnel;
      case "queues-controlled": return state.surfaceRooms.every((room) => room.queue.length < 4) && state.workItems.length < 4 ? 1 : 0;
      case "research-completed": return state.researchNodes.filter((node) => node.completed).length;
      case "crisis-success": return Number(state.flags["crisis-success-count"] ?? 0);
      case "mtf-capability": return Math.max(state.staff.filter((member) => member.role === "mtf" && member.status !== "dead").length, state.surfaceRooms.some((room) => room.type === "mtf-bay") ? 4 : 0);
      case "cover-reputation": return state.reputation.cover;
      case "intel-resource": return state.resources.intel;
      case "security-rooms": return state.surfaceRooms.filter((room) => ["checkpoint", "armory", "command-center", "mtf-bay", "access-office"].includes(room.type)).length + state.undergroundRooms.filter((room) => room.type === "security-post").length;
      case "ethical-authority": return state.reputation.ethics >= 55 && state.reputation.personnel >= 55 ? 1 : 0;
      case "underground-levels": return new Set(state.undergroundRooms.map((room) => room.level)).size;
      case "temporal-lock": return state.researchNodes.some((node) => node.id === "temporal-engineering" && node.completed) && state.undergroundRooms.some((room) => room.type === "temporal-lock") ? 1 : 0;
      case "stable-keter": return Number(state.flags["stable-keter-days"] ?? 0) >= 1 ? 1 : 0;
      default: return 0;
    }
  }

  function simulationChance(state: GameState, channel: string, probability: number): boolean {
    const roll = Math.abs(Math.sin((state.seed + state.elapsedMinutes * 13 + hashString(channel) * 7) * 12.9898)) % 1;
    return roll < probability;
  }

  function simulationIndex(state: GameState, channel: string, length: number): number {
    if (length <= 1) return 0;
    const roll = Math.abs(Math.sin((state.seed + state.elapsedMinutes * 31 + hashString(channel) * 11) * 78.233)) % 1;
    return Math.min(length - 1, Math.floor(roll * length));
  }

  function hashString(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
    return hash;
  }
}
