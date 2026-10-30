namespace SCPGame {
  export const SURFACE_TRAFFIC_TYPES: SurfaceTraffic[] = ["public", "staff", "security", "medical", "contaminated", "freight", "anomaly"];
  const ACCESS_WAIT_MINUTES = 60;

  function sameAccessCell(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  function accessCellInBounds(state: GameState, point: Point): boolean {
    return Number.isInteger(point.x) && Number.isInteger(point.y)
      && point.x >= 0 && point.y >= 0 && point.x < state.surfaceWidth && point.y < state.surfaceHeight;
  }

  export function getSurfaceAccessCells(room: SurfaceRoom, access: Pick<SurfaceAccess, "side" | "offset">): { inside: Point; outside: Point } {
    switch (access.side) {
      case "north": return { inside: { x: room.x + access.offset, y: room.y }, outside: { x: room.x + access.offset, y: room.y - 1 } };
      case "south": return { inside: { x: room.x + access.offset, y: room.y + room.height - 1 }, outside: { x: room.x + access.offset, y: room.y + room.height } };
      case "east": return { inside: { x: room.x + room.width - 1, y: room.y + access.offset }, outside: { x: room.x + room.width, y: room.y + access.offset } };
      case "west": return { inside: { x: room.x, y: room.y + access.offset }, outside: { x: room.x - 1, y: room.y + access.offset } };
    }
  }

  export function isSurfaceAccessPassageClear(state: GameState, room: SurfaceRoom, access: Pick<SurfaceAccess, "side" | "offset">): boolean {
    const length = access.side === "north" || access.side === "south" ? room.width : room.height;
    if (!Number.isInteger(access.offset) || access.offset < 0 || access.offset >= length) return false;
    const cells = getSurfaceAccessCells(room, access);
    if (!accessCellInBounds(state, cells.inside) || !accessCellInBounds(state, cells.outside)) return false;
    return !state.surfaceRooms.some((other) => other.id !== room.id
      && pointInRect(cells.outside, other.x, other.y, other.width, other.height)
      && (other.type !== "corridor" || !other.enabled));
  }

  // Deterministic migration: one free manual entrance per usable wall, nearest
  // its midpoint. Existing room, staff and save identities are never replaced.
  export function createDefaultSurfaceAccesses(state: GameState, room: SurfaceRoom): SurfaceAccess[] {
    if (room.type === "corridor") return [];
    const accesses: SurfaceAccess[] = [];
    for (const side of ["north", "east", "south", "west"] as SurfaceAccessSide[]) {
      const length = side === "north" || side === "south" ? room.width : room.height;
      const center = Math.floor(length / 2);
      const offsets = Array.from({ length }, (_, index) => index).sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b);
      const offset = offsets.find((candidate) => isSurfaceAccessPassageClear(state, room, { side, offset: candidate }));
      if (offset === undefined) continue;
      accesses.push({
        id: `access-${room.id}-${side}`, side, offset, kind: "door", enabled: true,
        minClearance: 0, allowedTraffic: [...SURFACE_TRAFFIC_TYPES], direction: "both",
        queueCapacity: 4, powered: true, airSupply: true, queue: [], passedCount: 0, paidFunds: 0, paidParts: 0
      });
    }
    return accesses;
  }

  export function getSurfaceAccesses(state: GameState, room: SurfaceRoom): SurfaceAccess[] {
    return room.accessPoints ?? createDefaultSurfaceAccesses(state, room);
  }

  export function getStaffSurfaceTraffic(member: StaffMember): SurfaceTraffic {
    if (member.needs.contamination > 65 || member.status === "quarantined") return "contaminated";
    if (member.role === "guard" || member.role === "mtf") return "security";
    if (member.role === "medic") return "medical";
    if (member.role === "logistics") return "freight";
    return "staff";
  }

  function accessPowerAvailable(state: GameState, access: SurfaceAccess): boolean {
    return access.powered && state.resources.power > 1 && !Boolean(state.flags["surface-blackout"]);
  }

  function accessReady(state: GameState, room: SurfaceRoom, access: SurfaceAccess): boolean {
    return access.enabled && isSurfaceAccessPassageClear(state, room, access)
      && (access.kind === "door" || room.enabled && accessPowerAvailable(state, access) && access.airSupply);
  }

  function accessPermitsMember(access: SurfaceAccess, member?: StaffMember): boolean {
    return (member?.clearance ?? 5) >= access.minClearance
      && access.allowedTraffic.includes(member ? getStaffSurfaceTraffic(member) : "staff");
  }

  function accessMatchesStep(room: SurfaceRoom, access: SurfaceAccess, from: Point, to: Point): boolean {
    const { inside, outside } = getSurfaceAccessCells(room, access);
    return sameAccessCell(from, outside) && sameAccessCell(to, inside)
      || sameAccessCell(from, inside) && sameAccessCell(to, outside);
  }

  function accessPermitsStep(state: GameState, room: SurfaceRoom, access: SurfaceAccess, from: Point, to: Point, member?: StaffMember): boolean {
    return accessReady(state, room, access) && accessAllowsWaiting(state, room, access, from, to, member);
  }

  function accessAllowsWaiting(state: GameState, room: SurfaceRoom, access: SurfaceAccess, from: Point, to: Point, member?: StaffMember): boolean {
    if (!accessMatchesStep(room, access, from, to) || !isSurfaceAccessPassageClear(state, room, access) || !accessPermitsMember(access, member)) return false;
    const entering = sameAccessCell(to, getSurfaceAccessCells(room, access).inside);
    return (!entering || room.enabled) && (access.direction === "both" || access.direction === (entering ? "in" : "out"));
  }

  function cellInsideAccessRoom(state: GameState, room: SurfaceRoom, point: Point): boolean {
    if (!pointInRect(point, room.x, room.y, room.width, room.height)) return false;
    // Old synthetic/legacy layouts may carve a corridor through an unconfigured
    // footprint. Explicit access layouts never get this wall-bypass exception.
    return !(room.accessPoints === undefined && room.enabled && state.surfaceRooms.some((other) =>
      other.type === "corridor" && other.enabled && pointInRect(point, other.x, other.y, other.width, other.height)));
  }

  function accessesForStep(state: GameState, from: Point, to: Point, member?: StaffMember): { room: SurfaceRoom; access: SurfaceAccess }[] | undefined {
    if (Math.abs(from.x - to.x) + Math.abs(from.y - to.y) !== 1) return undefined;
    const result: { room: SurfaceRoom; access: SurfaceAccess }[] = [];
    for (const room of state.surfaceRooms) {
      if (room.type === "corridor") continue;
      const before = cellInsideAccessRoom(state, room, from);
      const after = cellInsideAccessRoom(state, room, to);
      if (before === after) continue;
      const access = getSurfaceAccesses(state, room).find((candidate) => accessPermitsStep(state, room, candidate, from, to, member));
      if (!access) return undefined;
      result.push({ room, access });
    }
    return result.filter((entry) => entry.access.kind === "airlock").length > 1 ? undefined : result;
  }

  export function canTraverseSurfaceAccessEdge(state: GameState, from: Point, to: Point, member?: StaffMember): boolean {
    return accessesForStep(state, from, to, member) !== undefined;
  }

  export function getSurfaceAccessStatus(state: GameState, room: SurfaceRoom, access: SurfaceAccess): string {
    if (!access.enabled) return "Verrouillé";
    if (!isSurfaceAccessPassageClear(state, room, access)) return "Passage obstrué";
    if (access.kind === "door") return room.enabled ? "Porte disponible" : "Sortie seule · salle fermée";
    if (!room.enabled) return "Salle fermée · sas arrêté";
    if (!accessPowerAvailable(state, access)) return "Panne électrique · deux portes fermées";
    if (!access.airSupply) return "Air indisponible · deux portes fermées";
    const member = access.cycle ? state.staff.find((entry) => entry.id === access.cycle?.staffId) : undefined;
    if (access.cycle && (!member || !accessPermitsStep(state, room, access, access.cycle.from, access.cycle.to, member))) return "Autorisation perdue · évacuation nécessaire";
    if (access.cycle?.phase === "entering") return "Admission · porte d'entrée ouverte";
    if (access.cycle?.phase === "equalizing") return "Égalisation · deux portes fermées";
    if (access.cycle?.phase === "exiting") return "Sortie · porte de sortie ouverte";
    return access.queue.length ? `En attente · ${access.queue.length}/${access.queueCapacity}` : "Sas disponible · deux portes fermées";
  }

  export function getSurfaceAccessDoorState(state: GameState, room: SurfaceRoom, access: SurfaceAccess): { entryOpen: boolean; exitOpen: boolean } {
    if (!accessReady(state, room, access)) return { entryOpen: false, exitOpen: false };
    if (access.kind === "door") return { entryOpen: true, exitOpen: false };
    const member = access.cycle ? state.staff.find((entry) => entry.id === access.cycle?.staffId) : undefined;
    if (!access.cycle || !member || member.status === "dead"
      || !accessPermitsStep(state, room, access, access.cycle.from, access.cycle.to, member)) return { entryOpen: false, exitOpen: false };
    return { entryOpen: access.cycle.phase === "entering", exitOpen: access.cycle.phase === "exiting" };
  }

  function resetAccessStaffRoute(member: StaffMember): void {
    member.target = undefined;
    member.targetRoomId = undefined;
    member.path = [];
    member.pathIndex = 0;
    if (member.status !== "injured" && member.status !== "quarantined" && member.status !== "dead" && member.status !== "training") member.status = "queued";
  }

  export function cancelStaffSurfaceAccess(state: GameState, staffId: string): void {
    for (const room of state.surfaceRooms) {
      for (const access of room.accessPoints ?? []) {
        access.queue = access.queue.filter((entry) => entry.staffId !== staffId);
        if (access.cycle?.staffId === staffId) access.cycle = undefined;
      }
    }
  }

  export function evacuateSurfaceAccess(state: GameState, room: SurfaceRoom, access: SurfaceAccess): void {
    const requests = [...access.queue, ...(access.cycle ? [access.cycle] : [])];
    for (const request of requests) {
      const member = state.staff.find((entry) => entry.id === request.staffId && entry.status !== "dead");
      if (!member) continue;
      if (access.cycle?.staffId === member.id) member.position = { layer: "surface", ...request.from };
      resetAccessStaffRoute(member);
      member.routeBlockedReason = "Évacuation côté d'origine · accès verrouillé.";
    }
    access.queue = [];
    access.cycle = undefined;
    access.enabled = false;
  }

  export function isStaffInSurfaceAccess(state: GameState, member: StaffMember): boolean {
    for (const room of state.surfaceRooms) {
      const access = (room.accessPoints ?? []).find((entry) => entry.cycle?.staffId === member.id);
      if (!access) continue;
      member.routeBlockedReason = getSurfaceAccessStatus(state, room, access);
      if (member.status !== "injured" && member.status !== "quarantined" && member.status !== "training") member.status = "queued";
      return true;
    }
    return false;
  }

  export function getStaffSurfaceAccessWait(state: GameState, member: StaffMember): { room: SurfaceRoom; access: SurfaceAccess; request: SurfaceAccessRequest } | undefined {
    for (const room of state.surfaceRooms) {
      for (const access of room.accessPoints ?? []) {
        const request = access.queue.find((entry) => entry.staffId === member.id);
        const next = member.path[member.pathIndex];
        if (request && next && member.position.layer === "surface" && sameAccessCell(member.position, request.from)
          && sameAccessCell(next, request.to) && accessAllowsWaiting(state, room, access, request.from, request.to, member)) {
          return { room, access, request };
        }
      }
    }
    return undefined;
  }

  // Waypoints retain the source of the current step so a door closing halfway
  // through a crossing cannot make floor(position) silently admit the person.
  // A blocked crossing retreats along the same segment at ordinary walk speed.
  export function processPartialSurfaceAccessStep(state: GameState, member: StaffMember): boolean {
    if (member.position.layer !== "surface" || Number.isInteger(member.position.x) && Number.isInteger(member.position.y)) return false;
    const to = member.path[member.pathIndex];
    if (!to || !Number.isInteger(to.x) || !Number.isInteger(to.y)) return false;
    let from = member.path[member.pathIndex - 1];
    if (!from && member.pathIndex === 0) {
      // Saves from before source waypoints existed can still recover one valid
      // adjacent fractional step; distant/stale waypoints are never trusted.
      if (to.y === member.position.y && Math.abs(to.x - member.position.x) < 1) {
        from = { x: to.x > member.position.x ? Math.floor(member.position.x) : Math.ceil(member.position.x), y: to.y };
      } else if (to.x === member.position.x && Math.abs(to.y - member.position.y) < 1) {
        from = { x: to.x, y: to.y > member.position.y ? Math.floor(member.position.y) : Math.ceil(member.position.y) };
      }
    }
    if (!from || !Number.isInteger(from.x) || !Number.isInteger(from.y)
      || Math.abs(from.x - to.x) + Math.abs(from.y - to.y) !== 1
      || member.position.x < Math.min(from.x, to.x) || member.position.x > Math.max(from.x, to.x)
      || member.position.y < Math.min(from.y, to.y) || member.position.y > Math.max(from.y, to.y)) return false;
    const source = from;
    const boundary = state.surfaceRooms.some((room) => room.type !== "corridor"
      && cellInsideAccessRoom(state, room, source) !== cellInsideAccessRoom(state, room, to));
    if (!boundary) return false;
    const crossings = accessesForStep(state, from, to, member);
    // A newly installed airlock cannot inherit an unreserved manual crossing.
    const allowed = crossings !== undefined && crossings.every((entry) => entry.access.kind === "door");
    const goal = allowed ? to : from;
    const dx = goal.x - member.position.x;
    const dy = goal.y - member.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0.55 + 1e-10) {
      member.position.x = goal.x;
      member.position.y = goal.y;
      if (allowed) {
        member.pathIndex += 1;
        for (const crossing of crossings ?? []) crossing.access.passedCount += 1;
      } else resetAccessStaffRoute(member);
    } else {
      member.position.x += dx / distance * 0.55;
      member.position.y += dy / distance * 0.55;
    }
    member.routeBlockedReason = allowed ? undefined : "Passage interrompu · retour du côté d'origine.";
    if (member.status !== "injured" && member.status !== "quarantined" && member.status !== "training") member.status = allowed ? "moving" : "queued";
    return true;
  }

  // Returns true when an access gate consumed this minute's movement. An
  // ordinary manual door lets the usual continuous movement code take over.
  export function processSurfaceAccessStep(state: GameState, member: StaffMember, target: Point): boolean {
    if (!Number.isInteger(member.position.x) || !Number.isInteger(member.position.y)
      || !Number.isInteger(target.x) || !Number.isInteger(target.y)) return false;
    if (sameAccessCell(member.position, target)) return false;
    const waiting = getStaffSurfaceAccessWait(state, member);
    if (waiting && sameAccessCell(waiting.request.to, target)) {
      member.routeBlockedReason = accessReady(state, waiting.room, waiting.access)
        ? `File du sas · position ${waiting.access.queue.indexOf(waiting.request) + 1}/${waiting.access.queue.length}.`
        : getSurfaceAccessStatus(state, waiting.room, waiting.access);
      if (member.status !== "injured" && member.status !== "quarantined") member.status = "queued";
      return true;
    }
    const crossings = accessesForStep(state, member.position, target, member);
    if (!crossings) {
      resetAccessStaffRoute(member);
      member.routeBlockedReason = "Passage refusé : porte fermée, accès obstrué ou habilitation insuffisante.";
      return true;
    }
    const controlled = crossings.find((entry) => entry.access.kind === "airlock");
    if (!controlled) return false;
    const { access } = controlled;
    if (!access.queue.some((entry) => entry.staffId === member.id)) {
      if (access.queue.length >= access.queueCapacity) {
        member.routeBlockedReason = "File du sas complète · attente devant le passage.";
        if (member.status !== "injured" && member.status !== "quarantined") member.status = "queued";
        return true;
      }
      cancelStaffSurfaceAccess(state, member.id);
      access.queue.push({ staffId: member.id, from: { x: member.position.x, y: member.position.y }, to: { ...target },
        requestedAt: state.elapsedMinutes, expiresAt: state.elapsedMinutes + ACCESS_WAIT_MINUTES });
    }
    member.routeBlockedReason = `File du sas · position ${access.queue.findIndex((entry) => entry.staffId === member.id) + 1}/${access.queue.length}.`;
    if (member.status !== "injured" && member.status !== "quarantined") member.status = "queued";
    return true;
  }

  function accessRequestMember(state: GameState, request: SurfaceAccessRequest): StaffMember | undefined {
    return state.staff.find((member) => member.id === request.staffId && member.status !== "dead"
      && member.position.layer === "surface" && sameAccessCell(member.position, request.from));
  }

  export function updateSurfaceAccesses(state: GameState): void {
    for (const room of state.surfaceRooms) {
      for (const access of room.accessPoints ?? []) {
        if (access.kind !== "airlock") continue;
        access.queue = access.queue.filter((request) => {
          const member = accessRequestMember(state, request);
          if (!member) return false;
          if (request.expiresAt <= state.elapsedMinutes) {
            member.needs.stress = clamp(member.needs.stress + 1, 0, 100);
            member.routeBlockedReason = "Attente au sas expirée · nouvelle tentative nécessaire.";
            return false;
          }
          const next = member.path[member.pathIndex];
          return !!next && sameAccessCell(next, request.to)
            && member.status !== "off-duty" && member.status !== "training"
            && accessAllowsWaiting(state, room, access, request.from, request.to, member);
        });

        if (access.cycle) {
          const cycle = access.cycle;
          const member = accessRequestMember(state, cycle);
          if (!member || !accessMatchesStep(room, access, cycle.from, cycle.to)) {
            access.cycle = undefined;
            continue;
          }
          // Power/air loss and locks never open either leaf or advance time.
          if (!accessPermitsStep(state, room, access, cycle.from, cycle.to, member)) {
            member.routeBlockedReason = getSurfaceAccessStatus(state, room, access);
            continue;
          }
          cycle.remaining -= 1;
          if (cycle.remaining > 0) continue;
          if (cycle.phase === "entering") {
            cycle.phase = "equalizing";
            cycle.remaining = 2;
          } else if (cycle.phase === "equalizing") {
            cycle.phase = "exiting";
            cycle.remaining = 1;
          } else {
            member.position = { layer: "surface", ...cycle.to };
            resetAccessStaffRoute(member);
            member.routeBlockedReason = undefined;
            access.passedCount += 1;
            access.cycle = undefined;
          }
          if (access.cycle) member.routeBlockedReason = getSurfaceAccessStatus(state, room, access);
          // Admission happens on a later tick, so completion cannot move a
          // second person or process a freshly admitted cycle in the same tick.
          continue;
        }

        if (!accessReady(state, room, access)) continue;
        const next = access.queue.shift();
        if (next) {
          access.cycle = { ...next, from: { ...next.from }, to: { ...next.to }, phase: "entering", remaining: 1 };
          const member = accessRequestMember(state, next);
          if (member) member.routeBlockedReason = getSurfaceAccessStatus(state, room, access);
        }
      }
    }
  }

  export function describeSurfaceRouteFailure(state: GameState, member: StaffMember, rooms: SurfaceRoom[]): string {
    if (rooms.length === 0) return "Aucune salle ouverte ne répond à cette destination.";
    const accesses = rooms.flatMap((room) => getSurfaceAccesses(state, room).map((access) => ({ room, access })));
    if (accesses.length === 0) return "Destination sans entrée : ajoutez une porte sur une limite libre.";
    if (accesses.every(({ access }) => member.clearance < access.minClearance)) return "Habilitation insuffisante pour les accès de cette destination.";
    if (accesses.every(({ access }) => !access.allowedTraffic.includes(getStaffSurfaceTraffic(member)))) return "Circulation refusée pour le profil de cet agent.";
    if (accesses.every(({ room, access }) => !accessReady(state, room, access))) return "Accès indisponibles : vérifiez verrouillage, obstacles, énergie et air des sas.";
    return "Aucun itinéraire autorisé : vérifiez les portes, les sens de passage et les obstacles.";
  }
}
