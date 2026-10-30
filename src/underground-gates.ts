namespace SCPGame {
  /** A door/airlock owns one physical, bidirectional graph edge. */
  export const UNDERGROUND_GATE_COSTS = {
    door: { funds: 650, parts: 2 },
    airlock: { funds: 2600, parts: 7 }
  } as const;

  export function getUndergroundGateBetween(state: GameState, left: UndergroundRoom, right: UndergroundRoom): UndergroundGate | undefined {
    return (state.undergroundGates ?? []).find((gate) => gate.roomAId === left.id && gate.roomBId === right.id
      || gate.roomAId === right.id && gate.roomBId === left.id);
  }

  export function getUndergroundGateStatus(state: GameState, gate: UndergroundGate): string {
    if (!gate.enabled) return 'Verrouillé';
    if (gate.kind === 'airlock' && (!gate.powered || state.resources.power <= 5 || Boolean(state.flags['surface-blackout']))) return 'Panne électrique — vantaux fermés';
    if (gate.kind === 'airlock' && !gate.airSupply) return 'Air indisponible — sas arrêté';
    if (gate.kind === 'airlock') {
      const a = state.undergroundRooms.find((room) => room.id === gate.roomAId);
      const b = state.undergroundRooms.find((room) => room.id === gate.roomBId);
      if (!a || !b) return 'Sas sans liaison technique valide';
      const statusA = getUndergroundUtilityStatus(state, a);
      const statusB = getUndergroundUtilityStatus(state, b);
      if (!statusA.power || !statusB.power) return 'Sas hors circuit électrique';
      if (!statusA.air || !statusB.air) return 'Sas sans ventilation raccordée';
    }
    if (gate.cycle?.phase === 'equalizing') return `Égalisation — ${gate.cycle.remaining} min`;
    if (gate.cycle?.phase === 'crossing') return 'Transit en cours — accès occupé';
    if (gate.cycle?.phase === 'retreating') return 'Retour sécurisé vers le côté d’origine';
    if (gate.queue.length) return `File FIFO — ${gate.queue.length}/${gate.queueCapacity}`;
    return gate.kind === 'airlock' ? 'Sas disponible — deux portes fermées' : 'Porte disponible';
  }

  /** No implicit wall bypass for explicit doors; missing gates preserve legacy open corridors. */
  export function canTraverseUndergroundGate(state: GameState, from: UndergroundRoom,
    to: UndergroundRoom, member?: StaffMember): boolean {
    if (!undergroundRoomsTouch(state, from, to)
      || !canStaffEnterUndergroundRoom(from, member) || !canStaffEnterUndergroundRoom(to, member)) return false;
    const gate = getUndergroundGateBetween(state, from, to);
    if (!gate) return true;
    if (!gate.enabled || (member && member.clearance < gate.minClearance)) return false;
    if (gate.direction !== 'both') {
      const permitted = gate.direction === 'a-to-b' ? gate.roomAId === from.id : gate.roomBId === from.id;
      if (!permitted) return false;
    }
    if (gate.kind === 'airlock' && (!gate.powered || !gate.airSupply || state.resources.power <= 5
      || Boolean(state.flags['surface-blackout'])
      || !getUndergroundUtilityStatus(state, from).power
      || !getUndergroundUtilityStatus(state, to).power
      || !getUndergroundUtilityStatus(state, from).air
      || !getUndergroundUtilityStatus(state, to).air)) return false;
    return true;
  }

  export function installUndergroundGate(state: GameState, fromId: string, toId: string,
    kind: UndergroundGate['kind']): { ok: boolean; message: string } {
    const from = state.undergroundRooms.find((room) => room.id === fromId);
    const to = state.undergroundRooms.find((room) => room.id === toId);
    if (!from || !to || from.id === to.id || !undergroundRoomsTouch(state, from, to)
      || from.level !== to.level) return { ok: false, message: 'Porte impossible : deux modules doivent partager une vraie cloison X/Y du même niveau.' };
    if (getUndergroundGateBetween(state, from, to)) return { ok: false, message: 'Une porte ou un sas contrôle déjà cette liaison.' };
    if (kind !== 'door' && kind !== 'airlock') return { ok: false, message: 'Type d’accès souterrain inconnu.' };
    const cost = UNDERGROUND_GATE_COSTS[kind];
    if (!payCost(state.resources, cost)) return { ok: false, message: 'Crédits ou pièces insuffisants pour cet accès.' };
    const gate: UndergroundGate = {
      id: uid('underground-gate'), roomAId: from.id, roomBId: to.id, kind,
      enabled: true, minClearance: Math.max(getUndergroundClearanceRequirement(from), getUndergroundClearanceRequirement(to)) as UndergroundGate['minClearance'],
      direction: 'both', powered: true, airSupply: true, queueCapacity: 4,
      queue: [], passedCount: 0, paidFunds: cost.funds, paidParts: cost.parts
    };
    (state.undergroundGates ??= []).push(gate);
    logHistory(state, `${kind === 'airlock' ? 'Sas' : 'Porte'} installé sur la liaison ${getUndergroundDefinition(from.type).name} / ${getUndergroundDefinition(to.type).name}.`);
    return { ok: true, message: kind === 'airlock' ? 'Sas souterrain installé et interverrouillé.' : 'Porte souterraine installée.' };
  }

  export function configureUndergroundGate(state: GameState, gateId: string,
    updates: Partial<Pick<UndergroundGate, 'enabled' | 'powered' | 'airSupply' | 'minClearance' | 'direction'>>): { ok: boolean; message: string } {
    const gate = (state.undergroundGates ?? []).find((entry) => entry.id === gateId);
    if (!gate) return { ok: false, message: 'Accès souterrain introuvable.' };
    if (updates.minClearance !== undefined && (!Number.isInteger(updates.minClearance)
      || updates.minClearance < 0 || updates.minClearance > 5)) return { ok: false, message: 'Habilitation invalide.' };
    if (updates.direction !== undefined && !['both', 'a-to-b', 'b-to-a'].includes(updates.direction))
      return { ok: false, message: 'Sens de passage invalide.' };
    for (const [key, value] of Object.entries(updates)) {
      if (!['enabled', 'powered', 'airSupply', 'minClearance', 'direction'].includes(key))
        return { ok: false, message: 'Réglage de sas inconnu.' };
      if (['enabled', 'powered', 'airSupply'].includes(key) && typeof value !== 'boolean')
        return { ok: false, message: 'Réglage de sas invalide.' };
    }
    Object.assign(gate, updates);
    return { ok: true, message: `Accès configuré : ${getUndergroundGateStatus(state, gate)}.` };
  }

  export function removeUndergroundGate(state: GameState, gateId: string): { ok: boolean; message: string } {
    const gates = state.undergroundGates ?? [];
    const index = gates.findIndex((gate) => gate.id === gateId);
    if (index < 0) return { ok: false, message: 'Accès souterrain introuvable.' };
    const gate = gates[index];
    if (gate.cycle) return { ok: false, message: 'Évacuez le sas avant démontage.' };
    gates.splice(index, 1);
    addResource(state.resources, 'funds', gate.paidFunds * 0.4);
    addResource(state.resources, 'parts', gate.paidParts * 0.4);
    return { ok: true, message: 'Accès démonté, ressources partiellement récupérées.' };
  }

  // Gate queues are FIFO. A single occupant can equalize or cross at a time.
  export function requestUndergroundGate(state: GameState, gate: UndergroundGate,
    member: StaffMember, from: UndergroundRoom, to: UndergroundRoom): void {
    if (!canTraverseUndergroundGate(state, from, to, member)) return;
    const current = gate.cycle;
    if (current?.staffId === member.id) return;
    if (!gate.queue.includes(member.id) && gate.queue.length < gate.queueCapacity) gate.queue.push(member.id);
    if (!gate.cycle && gate.queue[0] === member.id) {
      gate.queue.shift();
      gate.cycle = { staffId: member.id, fromId: from.id, toId: to.id, phase: 'equalizing', remaining: 4 };
    }
    member.status = 'queued';
    member.routeBlockedReason = getUndergroundGateStatus(state, gate);
  }

  function moveToGateDestination(state: GameState, member: StaffMember, from: UndergroundRoom,
    to: UndergroundRoom): boolean {
    const targetY = undergroundRoomSectionY(state, to);
    const sectionY = member.position.sectionY ?? getLegacyUndergroundSectionY(state);
    const nextX = from.level === to.level && targetY !== undergroundRoomSectionY(state, from)
      ? (Math.max(from.x, to.x) + Math.min(from.x + from.width, to.x + to.width)) / 2
      : undergroundRoomCenter(to).x;
    // Progress is always on one axis per tick, including return after a lock.
    const dx = nextX - member.position.x;
    if (Math.abs(dx) > 0.00001) {
      member.position.x += Math.sign(dx) * Math.min(Math.abs(dx), 0.55);
      return false;
    }
    if (Math.abs(sectionY - targetY) > 0.00001) {
      const delta = targetY - sectionY;
      member.position.sectionY = sectionY + Math.sign(delta) * Math.min(Math.abs(delta), 0.55);
      return false;
    }
    const finalX = undergroundRoomCenter(to).x;
    const last = finalX - member.position.x;
    if (Math.abs(last) > 0.00001) {
      member.position.x += Math.sign(last) * Math.min(Math.abs(last), 0.55);
      return false;
    }
    member.position.x = finalX;
    member.position.sectionY = targetY;
    member.position.y = to.level;
    member.position.level = to.level;
    return true;
  }

  /** Returns true if an airlock owns this agent's movement during this minute. */
  export function processUndergroundGateCycle(state: GameState, member: StaffMember): boolean {
    const gate = (state.undergroundGates ?? []).find((entry) => entry.cycle?.staffId === member.id);
    if (!gate || !gate.cycle || member.position.layer !== 'underground') return false;
    const cycle = gate.cycle;
    const from = state.undergroundRooms.find((room) => room.id === cycle.fromId);
    const to = state.undergroundRooms.find((room) => room.id === cycle.toId);
    if (!from || !to) return true; // Keep the cycle contained until a validated intervention.
    const permitted = canTraverseUndergroundGate(state, from, to, member);
    if (cycle.phase === 'equalizing') {
      if (!permitted) {
        member.status = 'queued';
        member.routeBlockedReason = getUndergroundGateStatus(state, gate);
        return true;
      }
      cycle.remaining = Math.max(0, cycle.remaining - 1);
      member.status = 'queued';
      member.routeBlockedReason = getUndergroundGateStatus(state, gate);
      if (cycle.remaining === 0) cycle.phase = 'crossing';
      return true;
    }
    // An electrical/air outage suspends a powered cycle in place. A manual
    // lockdown or revoked authorization, by contrast, triggers a slow retreat.
    if (cycle.phase === 'crossing' && !permitted) {
      const utilityFailure = gate.enabled && gate.kind === 'airlock' &&
        (!gate.powered || !gate.airSupply || state.resources.power <= 5 || Boolean(state.flags['surface-blackout'])
          || !getUndergroundUtilityStatus(state, from).power
          || !getUndergroundUtilityStatus(state, to).power
          || !getUndergroundUtilityStatus(state, from).air
          || !getUndergroundUtilityStatus(state, to).air);
      if (utilityFailure) {
        member.status = 'queued';
        member.routeBlockedReason = getUndergroundGateStatus(state, gate);
        return true;
      }
      cycle.phase = 'retreating';
    }
    const destination = cycle.phase === 'retreating' ? from : to;
    // A locked gate cannot teleport a person caught halfway through it.
    const arrived = moveToGateDestination(state, member, from, destination);
    if (!['dead', 'injured', 'quarantined'].includes(member.status)) member.status = 'moving';
    member.routeBlockedReason = cycle.phase === 'retreating'
      ? 'Accès fermé : retour physique côté d’origine' : undefined;
    if (arrived) {
      if (cycle.phase === 'crossing') gate.passedCount++;
      gate.cycle = undefined;
      member.path = [];
      member.pathIndex = 0;
      member.target = undefined;
      member.targetRoomId = undefined;
      if (cycle.phase === 'retreating') member.status = 'queued';
    }
    return true;
  }

  export function evacuateUndergroundGate(state: GameState, gateId: string): { ok: boolean; message: string } {
    const gate = (state.undergroundGates ?? []).find((entry) => entry.id === gateId);
    if (!gate) return { ok: false, message: 'Sas introuvable.' };
    if (gate.cycle) {
      const cycle = gate.cycle;
      if (cycle.phase === 'equalizing') {
        // The occupant has never left the source room during equalization.
        const member = state.staff.find((entry) => entry.id === cycle.staffId);
        if (member) {
          member.routeBlockedReason = 'Évacuation vers le côté d’origine sans traversée.';
          member.status = 'queued';
        }
        gate.cycle = undefined;
      } else cycle.phase = 'retreating';
    }
    gate.queue = [];
    gate.enabled = false;
    return { ok: true, message: 'Sas verrouillé : évacuation sans franchissement comptabilisé.' };
  }

  export function maintainUndergroundGates(state: GameState): void {
    const valid = new Set(state.staff.filter((member) => member.status !== 'dead' && member.position.layer === 'underground').map((member) => member.id));
    for (const gate of state.undergroundGates ?? []) {
      gate.queue = gate.queue.filter((id, index) => valid.has(id) && gate.queue.indexOf(id) === index && gate.cycle?.staffId !== id);
      // A dead worker cannot occupy an airlock forever.
      if (gate.cycle && !valid.has(gate.cycle.staffId)) gate.cycle = undefined;
    }
  }
}
