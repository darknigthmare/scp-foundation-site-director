namespace SCPGame {
  /**
   * Cartographie unique des trois échelles. La vue Région représente les
   * volumes extérieurs, la Surface leur plan intérieur, et le Sous-sol une
   * COUPE longitudinale (un x et une profondeur, pas encore un plan 3D).
   *
   * Ces transformations dérivent des dimensions de GameState. Aucun bâtiment
   * miroir ni copie des salles n'est ajouté aux sauvegardes existantes.
   */
  export interface SiteRectangle { x: number; y: number; width: number; height: number; }

  export function getSiteRegionFootprint(state: GameState): SiteRectangle {
    // Le complexe principal se situe au sud-est de l'agglomération, distinct
    // des annexes régionales déjà construites. La zone est réservée à ce Site.
    const width = Math.min(9, Math.max(1, state.regionWidth - 1));
    const height = Math.min(5, Math.max(1, state.regionHeight - 1));
    return {
      x: Math.max(0, state.regionWidth - width - 1),
      y: Math.max(0, state.regionHeight - height),
      width, height
    };
  }

  export function surfaceToRegionPosition(state: GameState, point: Point): Point {
    const bounds = getSiteRegionFootprint(state);
    return {
      x: bounds.x + point.x * bounds.width / state.surfaceWidth,
      y: bounds.y + point.y * bounds.height / state.surfaceHeight
    };
  }

  export function regionToSurfacePosition(state: GameState, point: Point): Point | undefined {
    const bounds = getSiteRegionFootprint(state);
    if (point.x < bounds.x || point.y < bounds.y || point.x >= bounds.x + bounds.width || point.y >= bounds.y + bounds.height) return undefined;
    return {
      x: (point.x - bounds.x) * state.surfaceWidth / bounds.width,
      y: (point.y - bounds.y) * state.surfaceHeight / bounds.height
    };
  }

  export function getSurfaceRegionFootprint(state: GameState, room: SurfaceRoom): SiteRectangle {
    const origin = surfaceToRegionPosition(state, room);
    const end = surfaceToRegionPosition(state, { x: room.x + room.width, y: room.y + room.height });
    return { x: origin.x, y: origin.y, width: end.x - origin.x, height: end.y - origin.y };
  }

  export function getSurfaceRoomAtRegionPosition(state: GameState, point: Point): SurfaceRoom | undefined {
    const local = regionToSurfacePosition(state, point);
    if (!local) return undefined;
    return [...state.surfaceRooms].reverse().find((room) =>
      room.type !== "corridor" && pointInRect(local, room.x, room.y, room.width, room.height))
      ?? [...state.surfaceRooms].reverse().find((room) => pointInRect(local, room.x, room.y, room.width, room.height));
  }

  // Le plan souterrain actuel n'a pas de coordonnée Y : il représente une
  // section sous la rangée des ascenseurs, pas tout le volume 3D du Site.
  export function getSiteSectionSurfaceY(state: GameState): number {
    return Math.max(0, state.surfaceHeight - 3);
  }

  export function undergroundXToSurfaceX(state: GameState, undergroundX: number): number {
    return undergroundX + (state.surfaceWidth - state.undergroundWidth) / 2;
  }

  export function surfaceXToUndergroundX(state: GameState, surfaceX: number): number {
    return surfaceX - (state.surfaceWidth - state.undergroundWidth) / 2;
  }

  export function isSurfaceRoomOnUndergroundSection(state: GameState, room: SurfaceRoom): boolean {
    const y = getSiteSectionSurfaceY(state);
    return room.y <= y && room.y + room.height > y;
  }

  export function getSurfaceRoomAboveUnderground(state: GameState, room: UndergroundRoom): SurfaceRoom | undefined {
    const x = undergroundXToSurfaceX(state, room.x + room.width / 2);
    const y = getSiteSectionSurfaceY(state);
    const candidates = state.surfaceRooms.filter((candidate) => pointInRect({ x, y },
      candidate.x, candidate.y, candidate.width, candidate.height));
    return candidates.find((candidate) => candidate.type !== "corridor") ?? candidates[0];
  }

  export function getUndergroundRoomBelowSurface(state: GameState, room: SurfaceRoom): UndergroundRoom | undefined {
    if (!isSurfaceRoomOnUndergroundSection(state, room)) return undefined;
    if (room.type === "elevator") {
      // Selecting an elevator must highlight its ACTUAL shaft, even if the
      // shaft is on the edge instead of the exact center of its four-cell room.
      return getUndergroundPortals(state).find(({ elevator }) => elevator.id === room.id)?.shaft;
    }
    const left = surfaceXToUndergroundX(state, room.x);
    const right = surfaceXToUndergroundX(state, room.x + room.width);
    return state.undergroundRooms.filter((candidate) => candidate.level === 0)
      .map((candidate) => ({ room: candidate, overlap: Math.max(0,
        Math.min(right, candidate.x + candidate.width) - Math.max(left, candidate.x)) }))
      .filter((candidate) => candidate.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)[0]?.room;
  }

  /** A real shaft must emerge inside a surface elevator, in the cut plane. */
  export function isShaftUnderSurfaceElevator(state: GameState,
    shaft: UndergroundRoom, elevator: SurfaceRoom): boolean {
    if (shaft.type !== "elevator-shaft" || shaft.level !== 0 || elevator.type !== "elevator") return false;
    const sectionY = getSiteSectionSurfaceY(state);
    const shaftX = undergroundXToSurfaceX(state, shaft.x + shaft.width / 2);
    return elevator.enabled && elevator.condition > 15
      && sectionY >= elevator.y && sectionY < elevator.y + elevator.height
      && shaftX >= elevator.x && shaftX < elevator.x + elevator.width;
  }

  export function getRegionCampusOverlap(state: GameState): RegionFacility[] {
    const footprint = getSiteRegionFootprint(state);
    return state.regionFacilities.filter((item) =>
      item.x < footprint.x + footprint.width && item.x + item.width > footprint.x
      && item.y < footprint.y + footprint.height && item.y + item.height > footprint.y);
  }
}
