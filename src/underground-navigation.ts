namespace SCPGame {
  export function getUndergroundClearanceRequirement(room: UndergroundRoom): number {
    switch (room.type) {
      case "keter-containment":
      case "heavy-containment":
      case "acid-system":
      case "temporal-lock": return 4;
      case "euclid-containment":
      case "bio-containment":
      case "infohazard-vault": return 3;
      case "research-lab":
      case "security-post": return 2;
      case "safe-containment":
      case "humanoid-cell":
      case "medical-bay": return 1;
      default: return 0;
    }
  }

  export function canStaffEnterUndergroundRoom(room: UndergroundRoom, member?: StaffMember): boolean {
    return room.enabled && !room.sealed && room.condition > 15
      && (!member || member.clearance >= getUndergroundClearanceRequirement(room));
  }

  export function undergroundRoomCenter(room: UndergroundRoom): Point {
    return { x: room.x + room.width / 2, y: room.level };
  }

  export function areUndergroundRoomsConnected(left: UndergroundRoom, right: UndergroundRoom): boolean {
    if (!canStaffEnterUndergroundRoom(left) || !canStaffEnterUndergroundRoom(right)) return false;
    if (left.level === right.level) {
      return left.x + left.width === right.x || right.x + right.width === left.x;
    }
    return left.type === "elevator-shaft" && right.type === "elevator-shaft"
      && Math.abs(left.level - right.level) === 1 && left.x === right.x && left.width === right.width;
  }

  // Weighted shortest route through actual room footprints and aligned shafts.
  // No sealed room, gap in the rock or missing vertical link is traversable.
  export function planUndergroundRoute(state: GameState, from: LayerPoint,
    destination: UndergroundRoom, member?: StaffMember): UndergroundRoom[] | undefined {
    const level = from.level ?? from.y;
    if (from.layer !== "underground" || !Number.isFinite(from.x)
      || !Number.isInteger(level) || level < 0 || level >= state.undergroundLevels
      || from.x < 0 || from.x > state.undergroundWidth
      || !state.undergroundRooms.includes(destination) || !canStaffEnterUndergroundRoom(destination, member)) return undefined;
    const rooms = state.undergroundRooms.filter((room) => canStaffEnterUndergroundRoom(room, member));
    const origins = rooms.filter((room) => room.level === level
      && from.x >= room.x && from.x <= room.x + room.width);
    if (!origins.length) return undefined;
    const distance = new Map<string, number>();
    const previous = new Map<string, UndergroundRoom>();
    const visited = new Set<string>();
    origins.forEach((room) => distance.set(room.id, Math.abs(undergroundRoomCenter(room).x - from.x)));

    while (visited.size < rooms.length) {
      let current: UndergroundRoom | undefined;
      let best = Infinity;
      for (const room of rooms) {
        const score = distance.get(room.id) ?? Infinity;
        if (!visited.has(room.id) && score < best) { current = room; best = score; }
      }
      if (!current) break;
      if (current.id === destination.id) {
        const route: UndergroundRoom[] = [current];
        while (previous.has(route[0].id)) route.unshift(previous.get(route[0].id)!);
        return route;
      }
      visited.add(current.id);
      for (const neighbour of rooms) {
        if (visited.has(neighbour.id) || !areUndergroundRoomsConnected(current, neighbour)) continue;
        const vertical = current.level !== neighbour.level;
        const cost = vertical ? 6 : Math.abs(undergroundRoomCenter(neighbour).x - undergroundRoomCenter(current).x) + 0.5;
        const candidate = best + cost;
        if (candidate < (distance.get(neighbour.id) ?? Infinity)) {
          distance.set(neighbour.id, candidate);
          previous.set(neighbour.id, current);
        }
      }
    }
    return undefined;
  }

  export interface UndergroundPortal {
    elevator: SurfaceRoom;
    shaft: UndergroundRoom;
  }

  // Only the aligned elevator footprint on the same longitudinal section
  // reaches the shaft: no connections between unrelated buildings.
  export function getUndergroundPortals(state: GameState): UndergroundPortal[] {
    const elevators = state.surfaceRooms.filter((room) => room.type === "elevator" && room.enabled && room.condition > 15);
    const shafts = state.undergroundRooms.filter((room) =>
      room.type === "elevator-shaft" && room.level === 0 && canStaffEnterUndergroundRoom(room));
    const portals: UndergroundPortal[] = [];
    for (const elevator of elevators) {
      for (const shaft of shafts) {
        if (isShaftUnderSurfaceElevator(state, shaft, elevator)) {
          portals.push({ elevator, shaft });
        }
      }
    }
    return portals;
  }

  export function hasUndergroundElevatorConnection(state: GameState,
    destination: UndergroundRoom, member?: StaffMember): boolean {
    return getUndergroundPortals(state).some(({ shaft }) =>
      planUndergroundRoute(state, { layer: "underground", ...undergroundRoomCenter(shaft), level: 0 }, destination, member) !== undefined);
  }
}
