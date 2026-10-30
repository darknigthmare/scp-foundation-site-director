namespace SCPGame {
  /** Technical lines follow built, touching (X,Y,depth) modules, never open rock. */
  export type UndergroundUtilityKind = "power" | "water" | "air";
  export const UNDERGROUND_CONDUIT_COST = { funds: 850, parts: 4 } as const;

  export function getUndergroundConduitBetween(state: GameState, first: UndergroundRoom,
    second: UndergroundRoom): UndergroundConduit | undefined {
    return (state.undergroundConduits ?? []).find((line) =>
      line.roomAId === first.id && line.roomBId === second.id
      || line.roomBId === first.id && line.roomAId === second.id);
  }

  function isServiceRoomUsable(room: UndergroundRoom): boolean {
    // Sealed cells retain utility shafts: closing a personnel door is not
    // equivalent to cutting embedded cables, pipes, or ventilation ducts.
    return room.enabled && room.condition > 15;
  }

  export function createLegacyUndergroundConduits(state: GameState): UndergroundConduit[] {
    const result: UndergroundConduit[] = [];
    for (let i = 0; i < state.undergroundRooms.length; i++) {
      for (let j = i + 1; j < state.undergroundRooms.length; j++) {
        const first = state.undergroundRooms[i], second = state.undergroundRooms[j];
        if (!undergroundRoomsTouch(state, first, second)) continue;
        result.push({ roomAId: first.id, roomBId: second.id, power: true, water: true, air: true,
          paidFunds: 0, paidParts: 0 });
      }
    }
    return result;
  }

  export function installUndergroundConduit(state: GameState, roomAId: string,
    roomBId: string): { ok: boolean; message: string } {
    const first = state.undergroundRooms.find((room) => room.id === roomAId);
    const second = state.undergroundRooms.find((room) => room.id === roomBId);
    if (!first || !second || !undergroundRoomsTouch(state, first, second))
      return { ok: false, message: "Une gaine technique exige deux modules réellement contigus." };
    if (getUndergroundConduitBetween(state, first, second))
      return { ok: false, message: "Cette liaison technique existe déjà." };
    if (!payCost(state.resources, UNDERGROUND_CONDUIT_COST))
      return { ok: false, message: "Crédits ou pièces insuffisants pour poser la gaine." };
    (state.undergroundConduits ??= []).push({ roomAId, roomBId, power: true, water: true, air: true,
      paidFunds: UNDERGROUND_CONDUIT_COST.funds, paidParts: UNDERGROUND_CONDUIT_COST.parts });
    logHistory(state, "Gaine technique raccordée : courant, eau et ventilation.");
    return { ok: true, message: "Gaine technique installée : électricité, eau et air raccordés." };
  }

  export function toggleUndergroundConduit(state: GameState, roomAId: string, roomBId: string,
    kind: UndergroundUtilityKind): { ok: boolean; message: string } {
    if (!["power", "water", "air"].includes(kind))
      return { ok: false, message: "Réseau inconnu." };
    const first = state.undergroundRooms.find((room) => room.id === roomAId);
    const second = state.undergroundRooms.find((room) => room.id === roomBId);
    if (!first || !second || !undergroundRoomsTouch(state, first, second))
      return { ok: false, message: "Cette liaison physique n'existe plus." };
    const conduit = getUndergroundConduitBetween(state, first, second);
    if (!conduit) return { ok: false, message: "Installez d'abord une gaine technique." };
    conduit[kind] = !conduit[kind];
    return { ok: true, message: `${kind === "power" ? "Électricité" : kind === "water" ? "Eau" : "Air"} : ${conduit[kind] ? "raccordé" : "isolé"}.` };
  }

  export function removeUndergroundConduit(state: GameState, roomAId: string,
    roomBId: string): { ok: boolean; message: string } {
    const lines = state.undergroundConduits ?? [];
    const index = lines.findIndex((line) => line.roomAId === roomAId && line.roomBId === roomBId
      || line.roomBId === roomAId && line.roomAId === roomBId);
    if (index < 0) return { ok: false, message: "Gaine introuvable." };
    const [line] = lines.splice(index, 1);
    addResource(state.resources, "funds", line.paidFunds * 0.4);
    addResource(state.resources, "parts", line.paidParts * 0.4);
    return { ok: true, message: "Gaine démontée : remboursement partiel des frais réellement payés." };
  }

  export interface UndergroundUtilityStatus { power: boolean; water: boolean; air: boolean; }

  export function getUndergroundUtilityMap(state: GameState): Map<string, UndergroundUtilityStatus> {
    const result = new Map<string, UndergroundUtilityStatus>();
    const rooms = state.undergroundRooms.filter(isServiceRoomUsable);
    for (const room of state.undergroundRooms) {
      result.set(room.id, { power: false, water: false, air: false });
    }
    const byId = new Map(rooms.map((room) => [room.id, room]));
    const links = (state.undergroundConduits ?? []).filter((line) => {
      const a = byId.get(line.roomAId), b = byId.get(line.roomBId);
      return Boolean(a && b && undergroundRoomsTouch(state, a, b));
    });
    // Pipes and cables can remain live inside a closed security sector.
    // Source detection checks actual elevator-to-shaft geometry, not whether
    // personnel are currently permitted to enter that shaft.
    const portals = rooms.filter((room) => room.type === "elevator-shaft" && room.level === 0
      && state.surfaceRooms.some((surface) => surface.type === "elevator" && surface.enabled
        && surface.condition > 15 && isShaftUnderSurfaceElevator(state, room, surface)))
      .map((room) => room.id);
    const globalPower = state.resources.power > 5 && !Boolean(state.flags["surface-blackout"]);
    const globalWater = state.resources.water > 3;

    const propagate = (kind: UndergroundUtilityKind, seeds: string[]): void => {
      const reachable = new Set(seeds.filter((id) => byId.has(id)));
      const queue = [...reachable];
      for (let i = 0; i < queue.length; i++) {
        const current = queue[i];
        for (const line of links) {
          if (!line[kind]) continue;
          const neighbour = line.roomAId === current ? line.roomBId
            : line.roomBId === current ? line.roomAId : undefined;
          if (neighbour && !reachable.has(neighbour)) {
            reachable.add(neighbour);
            queue.push(neighbour);
          }
        }
      }
      for (const id of reachable) result.get(id)![kind] = true;
    };

    // Underground battery nodes are local emergency sources. They do not create
    // energy from nothing: the Site must still have some reserve in storage.
    const batteryNodes = state.resources.power > 1
      ? rooms.filter((room) => room.type === "power-node").map((room) => room.id) : [];
    propagate("power", [...(globalPower ? portals : []), ...batteryNodes]);
    propagate("water", globalWater ? portals : []);
    const poweredFilters = rooms.filter((room) => room.type === "air-filtration"
      && result.get(room.id)?.power).map((room) => room.id);
    propagate("air", [...(globalPower ? portals : []), ...poweredFilters]);
    return result;
  }

  export function getUndergroundUtilityStatus(state: GameState,
    room: UndergroundRoom): UndergroundUtilityStatus {
    return getUndergroundUtilityMap(state).get(room.id) ?? { power: false, water: false, air: false };
  }
}
