namespace SCPGame {
  export type SCPService = "power" | "water" | "air";
  export interface SCPFailureEffect {
    /** Operational failure of the Site's equipment, not a claim about an entity's biology. */
    effect: string;
    compliance: number;
    hourlyPressure: number;
    studyMultiplier: number;
    priority: "monitor" | "major" | "critical";
  }
  export interface SCPBehaviorProfile {
    id: string;
    domain: string;
    power: SCPFailureEffect;
    water: SCPFailureEffect;
    air: SCPFailureEffect;
    protocol: string;
    response: string;
    responseCost: Cost;
    cooldownMinutes?: number;
    source: string;
  }
  export interface SCPFault {
    service: SCPService | "procedure" | "staff" | "structure";
    effect: string;
    priority: "monitor" | "major" | "critical";
  }
  export interface SCPBehaviorReport {
    profile: SCPBehaviorProfile;
    faults: SCPFault[];
    utilities: UndergroundUtilityStatus;
    compliancePenalty: number;
    hourlyPressure: number;
    studyMultiplier: number;
    localTeam: number;
    acidFeedOperational: boolean;
    mechanismOperational: boolean;
    anomalyStillPresent: boolean;
  }
  // Independent, testable mechanics for every SCP already included in the game.
  // Canon pages are cited in documentation. These are gameplay abstractions,
  // not assertions that all 12 entities run on mains electricity or tap water.
  const failure = (effect: string, compliance: number, hourlyPressure: number,
    studyMultiplier: number, priority: SCPFailureEffect["priority"] = "major"): SCPFailureEffect =>
    ({ effect, compliance, hourlyPressure, studyMultiplier, priority });

  export const SCP_BEHAVIOR_PROFILES: Record<string, SCPBehaviorProfile> = {
    "scp-173": {
      id: "scp-173", domain: "Observation humaine et fermeture du sas",
      power: failure("L'éclairage et les capteurs sont indisponibles ; la surveillance visuelle reste humaine.", 18, 4.5, 0.25, "critical"),
      water: failure("Le nettoyage contrôlé de la cellule est suspendu.", 3, 0.3, 0.9, "monitor"),
      air: failure("Le renouvellement d'air de l'équipe d'observation n'est plus assuré.", 8, 1, 0.5),
      protocol: "Trois agents avant toute entrée, deux observateurs continus et portes relockées.",
      response: "Organiser une relève d'observation", responseCost: { funds: 150, parts: 1 },
      source: "https://scp-wiki.wikidot.com/scp-173"
    },
    "scp-096": {
      id: "scp-096", domain: "Sécurité informationnelle, détecteurs non optiques",
      power: failure("Les capteurs de pression et les détecteurs du confinement ne sont plus fiables.", 17, 3.5, 0.12, "critical"),
      water: failure("L'entretien technique du cube sécurisé est retardé ; aucune réaction hydrique propre à l'entité.", 2, 0.1, 0.9, "monitor"),
      air: failure("Le confinement hermétique et les inspections deviennent plus difficiles.", 9, 1.4, 0.55),
      protocol: "Aucune image, vidéo ou optique ; surveillance indirecte, isolement des médias.",
      response: "Consigner toute surveillance optique", responseCost: { funds: 100, intel: 1 },
      source: "https://scp-wiki.wikidot.com/scp-096"
    },
    "scp-049": {
      id: "scp-049", domain: "Soins humains, escorte et confinement des créations",
      power: failure("L'interphonie et les équipements de surveillance des entretiens sont hors service.", 6, 0.8, 0.55),
      water: failure("Le nettoyage médical et la gestion des déchets biologiques sont interrompus.", 8, 1.2, 0.5),
      air: failure("Les conditions sanitaires et la sécurité de l'équipe médicale se dégradent.", 10, 1.5, 0.35),
      protocol: "Interdire les contacts humains non autorisés, maintenir escorte et soins adaptés.",
      response: "Rétablir le protocole humain", responseCost: { medical: 2, funds: 150 },
      source: "https://scp-wiki.wikidot.com/scp-049"
    },
    "scp-106": {
      id: "scp-106", domain: "Confinement suspendu, corrosion et surveillance",
      power: failure("L'éclairage secondaire et le système d'alerte du confinement suspendu sont dégradés.", 15, 3.5, 0.3, "critical"),
      water: failure("Les équipes ne peuvent plus nettoyer correctement les résidus corrosifs.", 4, 0.8, 0.8),
      air: failure("L'environnement de maintenance et la sécurité du personnel sont dégradés.", 6, 1, 0.55),
      protocol: "Contrôler l'état des parois, les distances de sécurité et l'isolement du secteur.",
      response: "Inspection anti-corrosion", responseCost: { parts: 4, funds: 300 },
      source: "https://scp-wiki.wikidot.com/scp-106"
    },
    "scp-939": {
      id: "scp-939", domain: "Pression négative, environnement et ordres vocaux",
      power: failure("La régulation climatique et les contrôles de communication sont hors service.", 14, 3.2, 0.2, "critical"),
      water: failure("L'humidification et la décontamination des accès sont dégradées.", 10, 1.8, 0.6),
      air: failure("La pression négative des cellules et la décontamination ne sont plus assurées.", 22, 4.4, 0.1, "critical"),
      protocol: "Authentifier les ordres, maintenir la pression négative et isoler les accès.",
      response: "Authentifier les communications", responseCost: { intel: 2, funds: 150 },
      source: "https://scp-wiki.wikidot.com/scp-939"
    },
    "scp-914": {
      id: "scp-914", domain: "Mécanisme à ressort, essais préalablement autorisés",
      power: failure("Les appareils de mesure sont arrêtés ; le ressort mécanique de SCP-914 reste utilisable.", 0, 0, 0, "monitor"),
      water: failure("Le nettoyage du laboratoire est suspendu ; la machine n'utilise pas l'eau du réseau pour tourner.", 0, 0, 1, "monitor"),
      air: failure("Les essais supervisés sont suspendus pour protéger le personnel, pas la mécanique.", 0, 0, 0.2, "monitor"),
      protocol: "Enregistrer les entrées, réserver des essais autorisés et interdire les tissus vivants.",
      response: "Effectuer un essai matériel approuvé", responseCost: { parts: 2, funds: 150 },
      source: "https://scp-wiki.wikidot.com/scp-914"
    },
    "scp-294": {
      id: "scp-294", domain: "Requêtes contrôlées, prélèvement et traçabilité",
      power: failure("Le terminal de commande est indisponible ; aucune requête de liquide autorisée.", 9, 0.9, 0, "major"),
      water: failure("L'hygiène du point de prélèvement est interrompue ; le liquide anormal ne dépend pas du réseau d'eau.", 3, 0.1, 0.6, "monitor"),
      air: failure("Le prélèvement de liquides inconnus est interrompu jusqu'au contrôle atmosphérique.", 5, 0.3, 0.1),
      protocol: "Vérifier les demandes avant saisie, tracer et isoler chaque échantillon.",
      response: "Tester une requête sûre", responseCost: { funds: 75, intel: 1 },
      source: "https://scp-wiki.wikidot.com/scp-294"
    },
    "scp-682": {
      id: "scp-682", domain: "Bain d'acide relié et alimentation chimique",
      power: failure("Pompes et surveillance du confinement acide arrêtées.", 24, 5.8, 0.1, "critical"),
      water: failure("Circuit de dilution et refroidissement isolé ; alimentation acide non conforme.", 18, 4.6, 0.2, "critical"),
      air: failure("L'extraction des vapeurs corrosives du circuit de confinement est indisponible.", 13, 2.6, 0.2, "critical"),
      protocol: "Immersion dans l'acide, maintenance de la pompe, interdiction des interactions directes.",
      response: "Réamorcer le bain acide", responseCost: { chemicals: 4, parts: 2 },
      source: "https://scp-wiki.wikidot.com/scp-682"
    },
    "scp-999": {
      id: "scp-999", domain: "Bien-être et visites supervisées à proximité",
      power: failure("L'éclairage de l'espace de visite est réduit ; SCP-999 reste actif.", 0, 0, 0.75, "monitor"),
      water: failure("Le nettoyage de son enclos est retardé, sans interrompre ses déplacements.", 3, 0.2, 0.8, "monitor"),
      air: failure("Les visites du personnel sont suspendues par précaution sanitaire.", 3, 0.2, 0.15, "monitor"),
      protocol: "Permettre les interactions douces hors confinement d'urgence et assurer nourriture/entretien.",
      response: "Visite de soutien accompagnée", responseCost: { food: 1 },
      source: "https://scp-wiki.wikidot.com/scp-999"
    },
    "scp-131": {
      id: "scp-131", domain: "Recensement horaire et circulation autorisée",
      power: failure("Le suivi électronique des deux entités n'est plus disponible ; elles continuent à se déplacer.", 4, 0.8, 0.5, "monitor"),
      water: failure("La propreté des secteurs visités se dégrade, sans désactiver les entités.", 1, 0.1, 0.95, "monitor"),
      air: failure("Les rondes hors cellule sont limitées pour protéger le personnel.", 2, 0.3, 0.5, "monitor"),
      protocol: "Vérifier la présence du duo chaque heure et empêcher l'accès aux zones interdites.",
      response: "Effectuer le recensement", responseCost: { funds: 50 }, cooldownMinutes: 60,
      source: "https://scp-wiki.wikidot.com/scp-131"
    },
    "scp-087": {
      id: "scp-087", domain: "Porte d'accès verrouillée, aucun voyage autorisé",
      power: failure("La serrure électromécanique reste en défaut sécurisé ; suivi de porte interrompu.", 12, 2.6, 0.1, "critical"),
      water: failure("Le nettoyage extérieur de l'accès est différé ; l'escalier ne dépend pas de l'eau.", 0, 0, 1, "monitor"),
      air: failure("La sécurité des équipes près de la porte devient incertaine.", 4, 0.5, 0.6, "monitor"),
      protocol: "Maintenir la porte close, arrêter toute exploration et contrôler le verrou électromécanique.",
      response: "Consigner l'accès interdit", responseCost: { parts: 1, funds: 100 },
      source: "https://scp-wiki.wikidot.com/scp-087"
    },
    "scp-008": {
      id: "scp-008", domain: "Barrières aux fluides biologiques et quarantaine",
      power: failure("La surveillance et les systèmes de quarantaine mécanique perdent l'alimentation.", 19, 3.6, 0.1, "critical"),
      water: failure("La décontamination et le lavage des équipes sont indisponibles ; le prion n'est pas hydrique.", 12, 2.2, 0.2, "critical"),
      air: failure("Le renouvellement d'air sûr de l'équipe est interrompu ; le prion n'est pas aérien.", 14, 2.0, 0.15, "critical"),
      protocol: "Empêcher tout contact avec les fluides, triage sécurisé et quarantaine des personnes exposées.",
      response: "Isoler les fluides et nettoyer", responseCost: { medical: 2, chemicals: 2 },
      source: "https://scp-wiki.wikidot.com/scp-008"
    }
  };

  /** Physical, powered hydraulic feed to an acid system, not merely a module on the same level. */
  export function scp682HasWorkingAcidFeed(state: GameState, target: UndergroundRoom): boolean {
    const utilities = getUndergroundUtilityMap(state);
    if (!utilities.get(target.id)?.power || !utilities.get(target.id)?.water) return false;
    const known = new Set([target.id]);
    let frontier = [target];
    for (let distance = 0; distance <= 5; distance += 1) {
      const next: UndergroundRoom[] = [];
      for (const room of frontier) {
        if (room.type === "acid-system" && room.condition > 30 && room.enabled
          && utilities.get(room.id)?.power && utilities.get(room.id)?.water) return true;
        for (const other of state.undergroundRooms) {
          if (known.has(other.id) || !other.enabled || other.condition <= 15
            || !undergroundRoomsTouch(state, room, other)) continue;
          const conduit = getUndergroundConduitBetween(state, room, other);
          if (!conduit?.power || !conduit.water || !utilities.get(other.id)?.power || !utilities.get(other.id)?.water) continue;
          known.add(other.id); next.push(other);
        }
      }
      frontier = next;
    }
    return false;
  }

  export function scp131CanAssist173(state: GameState, room: UndergroundRoom): boolean {
    const companion = state.scps.find((scp) => scp.definitionId === "scp-131" && scp.contained);
    const home = state.undergroundRooms.find((candidate) => candidate.id === companion?.roomId);
    const procedure = state.procedures.find((candidate) => candidate.id === companion?.procedureId);
    return Boolean(home && procedure && home.enabled && !home.sealed && !room.sealed
      && home.level === room.level && undergroundRoomSectionY(state, home) === undergroundRoomSectionY(state, room)
      && (undergroundRoomsTouch(state, home, room) || home.id === room.id)
      && procedure.humaneCare);
  }

  export function getSCPNearbyStaff(state: GameState, room: UndergroundRoom): StaffMember[] {
    return state.staff.filter((member) => member.position.layer === "underground" && member.position.level === room.level
      && (member.position.sectionY ?? getLegacyUndergroundSectionY(state)) === undergroundRoomSectionY(state, room)
      && Math.abs(member.position.x - (room.x + room.width / 2)) <= room.width / 2 + 0.6
      && member.status === "working" && member.needs.health > 0);
  }

  export function inspectSCPBehavior(state: GameState, scp: SCPInstance): SCPBehaviorReport | undefined {
    const profile = SCP_BEHAVIOR_PROFILES[scp.definitionId];
    const room = state.undergroundRooms.find((item) => item.id === scp.roomId);
    const procedure = state.procedures.find((item) => item.id === scp.procedureId);
    if (!profile || !scp.contained || !room || !procedure) return undefined;
    const utilities = getUndergroundUtilityStatus(state, room);
    const faults: SCPFault[] = [];
    let compliancePenalty = 0;
    let hourlyPressure = 0;
    let studyMultiplier = 1;
    const mark = (service: SCPFault["service"], effect: string, penalty: number, pressure: number,
      study: number, priority: SCPFault["priority"]): void => {
      faults.push({ service, effect, priority });
      compliancePenalty += penalty;
      hourlyPressure += pressure;
      studyMultiplier *= study;
    };
    (["power", "water", "air"] as const).forEach((service) => {
      if (utilities[service]) return;
      const outage = profile[service];
      // Keep benign/independent failures in diagnostics without inventing SCP incapacitation.
      mark(service, outage.effect, outage.compliance, outage.hourlyPressure,
        outage.studyMultiplier, outage.priority);
    });
    const local = getSCPNearbyStaff(state, room);
    const flags = scp.definitionId;
    const acidFeedOperational = flags === "scp-682" && scp682HasWorkingAcidFeed(state, room);
    switch (flags) {
      case "scp-173": {
        const watching = local.filter((member) => member.role === "guard" || member.role === "mtf").length;
        if ((watching > 0 && watching < 3) || procedure.observationLevel < 75) {
          mark("staff", "Trois personnes doivent superviser toute entrée et deux conserver le contact visuel.",
            watching > 0 && watching < 3 ? 8 : 2,
            watching > 0 && watching < 3 ? 3.5 : 0.3,
            watching > 0 && watching < 3 ? 0.4 : 0.9, "critical");
        }
        break;
      }
      case "scp-096":
        if (procedure.opticalMonitoring) mark("procedure", "Surveillance optique interdite : risque d'exposition à une image de SCP-096.",
          35, 8, 0, "critical");
        if (!procedure.isolatedNetwork && !procedure.analogBackup) mark("procedure", "Fuite de données visuelles non suffisamment contrôlée.",
          10, 2, 0.25, "critical");
        break;
      case "scp-049":
        if (!procedure.humaneCare || !procedure.restrictedTesting) mark("procedure", "Entretiens non sécurisés et absence de soins coopératifs.",
          14, 2.2, 0.5, "major");
        break;
      case "scp-106":
        if (room.condition < 75 || procedure.maintenanceFrequency < 70) mark("structure", "Corrosion ou contrôles du confinement suspendu insuffisants.",
          18, 3, 0.4, "critical");
        break;
      case "scp-939":
        if (!procedure.analogBackup || !procedure.isolatedNetwork || !procedure.biometricMonitoring)
          mark("procedure", "Les ordres vocaux ne sont pas authentifiés hors réseau.", 14, 2.4, 0.35, "critical");
        break;
      case "scp-914":
        if (!procedure.restrictedTesting) mark("procedure", "Essais sans autorisation ou sans relevé d'entrée/sortie.",
          18, 2.1, 0.15, "major");
        break;
      case "scp-294":
        if (!procedure.restrictedTesting || !procedure.isolatedNetwork)
          mark("procedure", "Catalogue de requêtes non filtré ou échantillons non tracés.",
            17, 2.2, 0.2, "major");
        break;
      case "scp-682":
        if (!acidFeedOperational) mark("structure", "Bain acide indisponible : aucune alimentation chimique opérationnelle jusqu'à la cellule.",
          34, 7.5, 0.05, "critical");
        if (state.resources.chemicals < 4) mark("structure", "Réserve d'acide de secours épuisée.",
          10, 2.2, 0.3, "critical");
        break;
      case "scp-999":
        if (!procedure.humaneCare || state.resources.food <= 0)
          mark("procedure", "Enclos ou nourriture non conformes ; les visites sont suspendues.", 7, 0.5, 0.8, "monitor");
        break;
      case "scp-131": {
        const lastCount = Number(state.flags[`scp-131-census:${scp.id}:at`] ?? -1);
        if (lastCount < 0 || state.elapsedMinutes - lastCount > 60)
          mark("procedure", "Recensement horaire des deux entités manquant.", 6, 0.8, 0.65, "monitor");
        break;
      }
      case "scp-087":
        if (!procedure.restrictedTesting) mark("procedure", "Accès de l'escalier non interdit : exploration non autorisée.",
          20, 4.5, 0.1, "critical");
        break;
      case "scp-008":
        if (!procedure.redundantVentilation || !procedure.automatedLockdown)
          mark("procedure", "Barrière aux fluides corporels et triage sans redondance.",
            17, 3.5, 0.15, "critical");
        break;
    }
    // Research is a staffed operation, not a global progress bar. Biological
    // work may be supervised by a medic; controlled device trials also require
    // the named restricted-testing procedure and local instrumentation.
    const hasResearcher = local.some((member) => member.role === "researcher"
      || scp.definitionId === "scp-008" && member.role === "medic");
    if (!hasResearcher) studyMultiplier = 0;
    if ((flags === "scp-914" || flags === "scp-294") && !procedure.restrictedTesting)
      studyMultiplier = 0;
    return { profile, faults, utilities, compliancePenalty,
      hourlyPressure, studyMultiplier: Math.max(0, Math.min(1, studyMultiplier)),
      localTeam: local.length, acidFeedOperational,
      mechanismOperational: flags !== "scp-294" || utilities.power,
      anomalyStillPresent: true };
  }

  export function getSCPResponseAvailability(state: GameState, scp: SCPInstance): { ok: boolean; message: string } {
    const report = inspectSCPBehavior(state, scp);
    if (!report) return { ok: false, message: "SCP non confiné ou procédure introuvable." };
    const last = Number(state.flags[`scp-response:${scp.id}:at`] ?? -100000);
    const cooldown = report.profile.cooldownMinutes ?? 180;
    if (state.elapsedMinutes - last < cooldown)
      return { ok: false, message: `Protocole déjà exécuté : délai de ${cooldown} minutes entre interventions.` };
    if (!canAfford(state.resources, report.profile.responseCost))
      return { ok: false, message: `Matériel insuffisant : ${costToString(report.profile.responseCost)}.` };
    if (state.crisis.active && ["scp-914", "scp-294", "scp-999"].includes(scp.definitionId))
      return { ok: false, message: "Les essais et les visites sont suspendus pendant l'alerte générale." };
    switch (scp.definitionId) {
      case "scp-049":
        if (!isProcedureOptionUnlocked(state, "humaneCare"))
          return { ok: false, message: "Déverrouillez d'abord les soins coopératifs par la recherche." };
        break;
      case "scp-939":
        if (!isProcedureOptionUnlocked(state, "isolatedNetwork") || !isProcedureOptionUnlocked(state, "analogBackup"))
          return { ok: false, message: "Déverrouillez le réseau isolé et les communications analogiques." };
        break;
      case "scp-173":
        if (report.localTeam < 3 || !report.utilities.air)
          return { ok: false, message: "Trois agents physiquement présents et un air respirable sont requis." };
        break;
      case "scp-682":
        if (!report.acidFeedOperational) return { ok: false, message: "Brancher un système acide alimenté en eau et électricité avant réamorçage." };
        break;
      case "scp-914":
      case "scp-294": {
        if (!report.utilities.power || !report.utilities.air || !state.procedures.some((p) => p.id === scp.procedureId && p.restrictedTesting))
          return { ok: false, message: "Essai impossible sans instrumentation, ventilation et autorisation explicite." };
        const room = state.undergroundRooms.find((candidate) => candidate.id === scp.roomId)!;
        const staff = getSCPNearbyStaff(state, room);
        if (scp.definitionId === "scp-914") {
          if (staff.filter((member) => member.role === "guard" || member.role === "mtf").length < 2
            || !staff.some((member) => member.role === "researcher"))
            return { ok: false, message: "SCP-914 exige un chercheur et deux gardes sur place pour un essai autorisé." };
        } else if (staff.filter((member) => (member.role === "guard" || member.role === "mtf")
          && member.clearance >= 3).length < 2 || !staff.some((member) => member.clearance >= 2)) {
          return { ok: false, message: "SCP-294 exige deux gardes niveau 3 et un opérateur habilité niveau 2." };
        }
        break;
      }
      case "scp-999": {
        if (!state.procedures.some((p) => p.id === scp.procedureId && p.humaneCare))
          return { ok: false, message: "Autorisez les interactions coopératives avant une visite." };
        const room = state.undergroundRooms.find((item) => item.id === scp.roomId)!;
        if (!report.utilities.air || !getSCPNearbyStaff(state, room).some((member) => member.assignmentRoomId === room.id))
          return { ok: false, message: "Aucune visite sans personne autorisée présente et ambiance sanitaire sûre." };
        break;
      }
      case "scp-008":
        if (!report.utilities.water) return { ok: false, message: "Aucune décontamination efficace sans conduite d'eau raccordée." };
        break;
    }
    return { ok: true, message: "Protocole d'intervention disponible." };
  }

  /** A chosen, paid and cooldown-limited response; never an automatic rescue. */
  export function performSCPResponse(state: GameState, instanceId: string): { ok: boolean; message: string } {
    const scp = state.scps.find((entry) => entry.id === instanceId);
    if (!scp) return { ok: false, message: "Dossier SCP introuvable." };
    const available = getSCPResponseAvailability(state, scp);
    if (!available.ok) return available;
    const profile = SCP_BEHAVIOR_PROFILES[scp.definitionId];
    const procedure = state.procedures.find((entry) => entry.id === scp.procedureId)!;
    const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId)!;
    if (!payCost(state.resources, profile.responseCost)) return { ok: false, message: "Ressources insuffisantes." };
    state.flags[`scp-response:${scp.id}:at`] = state.elapsedMinutes;
    let riskChange = -5;
    let revisedProcedure = false;
    switch (scp.definitionId) {
      case "scp-173": procedure.observationLevel = Math.max(procedure.observationLevel, 85);
        revisedProcedure = true; riskChange = -9; break;
      case "scp-096": procedure.opticalMonitoring = false; revisedProcedure = true;
        riskChange = -8; break;
      case "scp-049": procedure.restrictedTesting = true; procedure.humaneCare = true;
        revisedProcedure = true; scp.mood = clamp(scp.mood + 9, 0, 100); break;
      case "scp-106": room.condition = clamp(room.condition + 10, 0, 100);
        procedure.maintenanceFrequency = Math.max(procedure.maintenanceFrequency, 78);
        revisedProcedure = true; riskChange = -7; break;
      case "scp-939": procedure.analogBackup = true; procedure.isolatedNetwork = true;
        if (isProcedureOptionUnlocked(state, "biometricMonitoring")) procedure.biometricMonitoring = true;
        revisedProcedure = true; riskChange = -7; break;
      case "scp-914": state.resources.parts += 3; state.resources.research += 1.5;
        riskChange = 0.8; break;
      case "scp-294": state.resources.medical += 0.5; state.resources.research += 1.2;
        riskChange = 0.5; break;
      case "scp-682": room.condition = clamp(room.condition + 5, 0, 100); riskChange = -10; break;
      case "scp-999":
        getSCPNearbyStaff(state, room).forEach((member) => {
          member.needs.stress = clamp(member.needs.stress - 8, 0, 100);
          if (member.assignmentRoomId !== room.id) return;
          member.needs.morale = clamp(member.needs.morale + 10, 0, 100);
        }); riskChange = -2; break;
      case "scp-131": state.flags[`scp-131-census:${scp.id}:at`] = state.elapsedMinutes;
        riskChange = -4; break;
      case "scp-087": procedure.restrictedTesting = true; revisedProcedure = true;
        riskChange = -8; break;
      case "scp-008":
        getSCPNearbyStaff(state, room).forEach((member) => {
          member.needs.contamination = clamp(member.needs.contamination - 8, 0, 100);
        }); riskChange = -7; break;
    }
    if (revisedProcedure) procedure.version += 1;
    scp.breachRisk = clamp(scp.breachRisk + riskChange, 0, 120);
    procedure.compliance = evaluateProcedureCompliance(state, scp);
    const message = `${getSCPDefinition(scp.definitionId).designation} : ${profile.response.toLowerCase()} effectué.`;
    addNotification(state, "Protocole SCP exécuté", message, "info");
    logHistory(state, message);
    return { ok: true, message };
  }
}
