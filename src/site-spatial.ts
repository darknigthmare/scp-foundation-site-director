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

  /** Historical Y=14 section of the original single-axis underground map. */
  export function getLegacyUndergroundSectionY(state: GameState): number {
    return Math.max(0, state.surfaceHeight - 3);
  }

  export function getSiteSectionSurfaceY(state: GameState): number {
    const requested = state.flags["underground-slice-y"];
    return typeof requested === "number" && Number.isInteger(requested)
      && requested >= 0 && requested < state.surfaceHeight
      ? requested : getLegacyUndergroundSectionY(state);
  }

  export function undergroundRoomSectionY(state: GameState, room: UndergroundRoom): number {
    return room.y ?? getLegacyUndergroundSectionY(state);
  }

  export function getStaffUndergroundSectionY(state: GameState, member: StaffMember): number {
    return member.position.sectionY ?? getLegacyUndergroundSectionY(state);
  }

  export function setUndergroundSlice(state: GameState, y: number): { ok: boolean; message: string } {
    if (!Number.isInteger(y) || y < 0 || y >= state.surfaceHeight)
      return { ok: false, message: "Coupe hors de l'emprise de surface." };
    state.flags["underground-slice-y"] = y;
    if (state.selectedType === "underground-room") {
      const selected = state.undergroundRooms.find((room) => room.id === state.selectedId);
      if (selected && undergroundRoomSectionY(state, selected) !== y) {
        state.selectedId = undefined;
        state.selectedType = undefined;
      }
    }
    return { ok: true, message: `Coupe ${y + 1}/${state.surfaceHeight} sélectionnée.` };
  }


  export function getUndergroundPlanLevel(state: GameState): number {
    const raw = state.flags["underground-plan-level"];
    if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < state.undergroundLevels) return raw;
    return state.selectedType === "underground-room"
      ? state.undergroundRooms.find((room) => room.id === state.selectedId)?.level ?? 0 : 0;
  }

  export function setUndergroundPlanLevel(state: GameState, level: number): { ok: boolean; message: string } {
    if (!Number.isInteger(level) || level < 0 || level >= state.undergroundLevels)
      return { ok: false, message: "Niveau hors limites." };
    state.flags["underground-plan-level"] = level;
    if (state.selectedType === "underground-room") {
      const chosen = state.undergroundRooms.find((room) => room.id === state.selectedId);
      if (chosen && chosen.level !== level) {
        state.selectedId = undefined;
        state.selectedType = undefined;
      }
    }
    return { ok: true, message: `Vue en plan du niveau -${level + 1}.` };
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
    const y = undergroundRoomSectionY(state, room);
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
    const section = getSiteSectionSurfaceY(state);
    return state.undergroundRooms.filter((candidate) => candidate.level === 0
      && undergroundRoomSectionY(state, candidate) === section)
      .map((candidate) => ({ room: candidate, overlap: Math.max(0,
        Math.min(right, candidate.x + candidate.width) - Math.max(left, candidate.x)) }))
      .filter((candidate) => candidate.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)[0]?.room;
  }

  /** A real shaft must emerge inside a surface elevator, in the cut plane. */
  export function isShaftUnderSurfaceElevator(state: GameState,
    shaft: UndergroundRoom, elevator: SurfaceRoom): boolean {
    if (shaft.type !== "elevator-shaft" || shaft.level !== 0 || elevator.type !== "elevator") return false;
    const sectionY = undergroundRoomSectionY(state, shaft);
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

  export interface AnnexInteriorRoom extends SiteRectangle {
    id: string;
    name: string;
    function: string;
    category: "operations" | "control" | "support" | "entry";
  }

  export interface AnnexInteriorPlan {
    facilityId: string;
    buildingName: string;
    footprint: SiteRectangle;
    rooms: AnnexInteriorRoom[];
  }

  export function isRegionFacilityEnterable(facility: RegionFacility): boolean {
    return !["road", "green-zone"].includes(facility.type);
  }

  export function getActiveInteriorFacility(state: GameState): RegionFacility | undefined {
    const id = state.activeInteriorFacilityId;
    if (state.view !== "surface" || !id) return undefined;
    return state.regionFacilities.find((facility) => facility.id === id && isRegionFacilityEnterable(facility));
  }

  // Annex plans are drawn from the real exterior facility (ID, footprint,
  // condition, function and level). These are inspection-only architectural
  // interiors, not invented staffed simulation rooms or duplicate buildings.
  const ANNEX_ZONE_NAMES: Record<RegionFacilityType, [string, string, string, string]> = {
    "cover-office": ["Bureaux de couverture", "SCiPnet public", "Archives administratives", "Accueil visiteurs"],
    "road": ["Chaussée", "Signalisation", "Entretien voirie", "Accès véhicules"],
    "parking": ["Parc véhicules", "Poste de contrôle", "Maintenance auto", "Accès parking"],
    "power-plant": ["Salle des turbines", "Régulation électrique", "Atelier technique", "Sas énergie"],
    "water-treatment": ["Cuves de traitement", "Contrôle qualité", "Stock filtres", "Accès maintenance"],
    "supply-depot": ["Réception palettes", "Gestion des stocks", "Quai technique", "Contrôle livraison"],
    "housing": ["Logements du personnel", "Gestion des résidents", "Salle commune", "Hall résidentiel"],
    "helipad": ["Plateforme hélicoptère", "Contrôle des vols", "Stock aéronautique", "Sas équipage"],
    "rail-terminal": ["Quais ferroviaires", "Poste d'aiguillage", "Stock logistique", "Contrôle fret"],
    "public-clinic": ["Consultations civiles", "Accueil médical", "Réserve sanitaire", "Salle d'attente"],
    "data-center": ["Baies serveurs", "Console réseau", "Groupe secours", "Sas informatique"],
    "checkpoint": ["Inspection sécurité", "Contrôle d'identités", "Équipement garde", "Portique entrée"],
    "watchtower": ["Poste d'observation", "Radio surveillance", "Réserve garde", "Accès escalier"],
    "green-zone": ["Parc paysager", "Gestion des sols", "Entretien vert", "Entrée du parc"]
  };

  export function getAnnexInteriorPlan(state: GameState, facility: RegionFacility): AnnexInteriorPlan | undefined {
    if (!state.regionFacilities.includes(facility) || !isRegionFacilityEnterable(facility)) return undefined;
    // The exterior footprint's aspect ratio controls the size of its plan.
    // Four distinct zones are projected inside a room-sized canvas, without
    // introducing any independent, fictitious SurfaceRoom into GameState.
    const width = Math.min(state.surfaceWidth - 4, Math.max(9, facility.width * 5 + 3));
    const height = Math.min(state.surfaceHeight - 4, Math.max(7, facility.height * 5 + 3));
    const x = Math.floor((state.surfaceWidth - width) / 2);
    const y = Math.floor((state.surfaceHeight - height) / 2);
    const left = Math.floor(width * 0.56);
    const top = Math.floor(height * 0.58);
    const names = ANNEX_ZONE_NAMES[facility.type];
    return {
      facilityId: facility.id,
      buildingName: getRegionDefinition(facility.type).name,
      footprint: { x, y, width, height },
      rooms: [
        { id: `${facility.id}:operations`, name: names[0], function: "Fonction principale", category: "operations", x, y, width: left, height: top },
        { id: `${facility.id}:control`, name: names[1], function: "Supervision", category: "control", x: x + left, y, width: width - left, height: top },
        { id: `${facility.id}:support`, name: names[2], function: "Support et stockage", category: "support", x, y: y + top, width: left, height: height - top },
        { id: `${facility.id}:entry`, name: names[3], function: "Entrée / contrôle", category: "entry", x: x + left, y: y + top, width: width - left, height: height - top }
      ]
    };
  }

}
