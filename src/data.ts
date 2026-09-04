namespace SCPGame {
  export const GAME_VERSION = "1.0.0";
  export const SAVE_KEY = "scp-site-director-save-v1";
  export const AUTOSAVE_KEY = "scp-site-director-autosave-v1";

  export const ROLE_LABELS: Record<StaffRole, string> = {
    director: "Direction",
    researcher: "Recherche",
    guard: "Sécurité",
    engineer: "Ingénierie",
    medic: "Médical",
    logistics: "Logistique",
    admin: "Administration",
    mtf: "FTM"
  };

  export const RESOURCE_LABELS: Record<ResourceKey, string> = {
    funds: "Crédits",
    power: "Énergie",
    water: "Eau",
    food: "Rations",
    medical: "Médical",
    parts: "Pièces",
    chemicals: "Produits chimiques",
    ammo: "Munitions",
    intel: "Renseignement",
    research: "Recherche"
  };

  export const REGION_FACILITY_DEFINITIONS: RegionFacilityDefinition[] = [
    {
      type: "cover-office",
      name: "Siège de couverture",
      icon: "▣",
      description: "Façade administrative publique et centre de cohérence documentaire.",
      cost: { funds: 6500, parts: 12 },
      upkeep: 180,
      coverImpact: 8,
      suspicionImpact: -2,
      size: { x: 2, y: 2 },
      unlockedAt: 0
    },
    {
      type: "road",
      name: "Route sécurisée",
      icon: "═",
      description: "Améliore les convois et justifie les flux de véhicules de la couverture.",
      cost: { funds: 450, parts: 1 },
      upkeep: 8,
      coverImpact: 1,
      size: { x: 1, y: 1 },
      unlockedAt: 0
    },
    {
      type: "parking",
      name: "Parking du personnel",
      icon: "P",
      description: "Réduit les retards d'équipe et les files d'accès au Site.",
      cost: { funds: 1800, parts: 3 },
      upkeep: 35,
      coverImpact: 2,
      suspicionImpact: -1,
      size: { x: 2, y: 2 },
      unlockedAt: 0
    },
    {
      type: "power-plant",
      name: "Centrale de couverture",
      icon: "⚡",
      description: "Production énergétique principale avec justification industrielle publique.",
      cost: { funds: 9200, parts: 20 },
      upkeep: 260,
      powerProduction: 95,
      suspicionImpact: 2,
      size: { x: 3, y: 2 },
      unlockedAt: 0
    },
    {
      type: "water-treatment",
      name: "Traitement des eaux",
      icon: "≈",
      description: "Produit et filtre l'eau du Site, y compris les effluents sensibles.",
      cost: { funds: 7200, parts: 18 },
      upkeep: 210,
      waterProduction: 85,
      coverImpact: 2,
      size: { x: 3, y: 2 },
      unlockedAt: 0
    },
    {
      type: "supply-depot",
      name: "Dépôt logistique",
      icon: "▤",
      description: "Réception et redistribution des rations, pièces, médicaments et consommables.",
      cost: { funds: 5200, parts: 10 },
      upkeep: 145,
      supplyProduction: { food: 5, medical: 2, parts: 2 },
      size: { x: 3, y: 2 },
      unlockedAt: 0
    },
    {
      type: "housing",
      name: "Résidence sécurisée",
      icon: "⌂",
      description: "Logements de garde pour le personnel essentiel et ses rotations.",
      cost: { funds: 4800, parts: 8 },
      upkeep: 115,
      coverImpact: 3,
      size: { x: 2, y: 2 },
      unlockedAt: 1
    },
    {
      type: "helipad",
      name: "Héliport",
      icon: "H",
      description: "Accélère les opérations FTM et les évacuations, mais attire l'attention.",
      cost: { funds: 8500, parts: 16 },
      upkeep: 240,
      suspicionImpact: 5,
      size: { x: 3, y: 3 },
      unlockedAt: 2
    },
    {
      type: "rail-terminal",
      name: "Terminal ferroviaire",
      icon: "⇆",
      description: "Capacité de fret lourd et couverture idéale pour les transferts massifs.",
      cost: { funds: 12000, parts: 28 },
      upkeep: 310,
      coverImpact: 4,
      suspicionImpact: 2,
      supplyProduction: { chemicals: 4, parts: 4 },
      size: { x: 4, y: 2 },
      unlockedAt: 3
    },
    {
      type: "public-clinic",
      name: "Clinique publique",
      icon: "+",
      description: "Façade médicale crédible servant aussi de triage avancé.",
      cost: { funds: 7600, parts: 14, medical: 5 },
      upkeep: 230,
      coverImpact: 7,
      suspicionImpact: -3,
      supplyProduction: { medical: 3 },
      size: { x: 3, y: 2 },
      unlockedAt: 2
    },
    {
      type: "data-center",
      name: "Centre de données",
      icon: "▦",
      description: "Justifie la consommation électrique et renforce SCiPnet.",
      cost: { funds: 9800, parts: 22 },
      upkeep: 290,
      powerProduction: -20,
      coverImpact: 5,
      supplyProduction: { intel: 4 },
      size: { x: 3, y: 2 },
      unlockedAt: 3
    },
    {
      type: "checkpoint",
      name: "Point de contrôle routier",
      icon: "◇",
      description: "Filtre les véhicules et réduit le risque d'infiltration.",
      cost: { funds: 2600, parts: 5 },
      upkeep: 75,
      suspicionImpact: 1,
      size: { x: 2, y: 1 },
      unlockedAt: 1
    },
    {
      type: "watchtower",
      name: "Tour de surveillance",
      icon: "△",
      description: "Détection périmétrique et observation de la région.",
      cost: { funds: 3400, parts: 7 },
      upkeep: 90,
      suspicionImpact: 2,
      size: { x: 1, y: 1 },
      unlockedAt: 2
    },
    {
      type: "green-zone",
      name: "Zone paysagère",
      icon: "♧",
      description: "Masque les structures, absorbe le bruit et améliore l'apparence publique.",
      cost: { funds: 1200, water: 2 },
      upkeep: 25,
      coverImpact: 3,
      suspicionImpact: -2,
      size: { x: 2, y: 2 },
      unlockedAt: 0
    }
  ];

  export const SURFACE_ROOM_DEFINITIONS: SurfaceRoomDefinition[] = [
    {
      type: "corridor",
      name: "Couloir sécurisé",
      icon: "·",
      description: "Circulation principale du personnel et des petits équipements.",
      cost: { funds: 100, parts: 1 },
      upkeep: 1,
      powerUse: 0.2,
      waterUse: 0,
      minSize: { x: 1, y: 1 },
      capacity: 8,
      requiredRoles: {},
      services: ["circulation"],
      security: 1,
      containment: 0,
      unlockedAt: 0
    },
    {
      type: "reception",
      name: "Accueil de couverture",
      icon: "R",
      description: "Reçoit visiteurs autorisés et employés de façade sans exposer le véritable Site.",
      cost: { funds: 1800, parts: 3 },
      upkeep: 25,
      powerUse: 2,
      waterUse: 1,
      minSize: { x: 3, y: 2 },
      capacity: 8,
      requiredRoles: { admin: 1 },
      services: ["access", "cover"],
      security: 1,
      containment: 0,
      unlockedAt: 0
    },
    {
      type: "checkpoint",
      name: "Contrôle d'accès",
      icon: "S",
      description: "Contrôle badges, biométrie et effets personnels. Les files mal gérées créent des retards.",
      cost: { funds: 2600, parts: 6 },
      upkeep: 50,
      powerUse: 4,
      waterUse: 0,
      minSize: { x: 3, y: 2 },
      capacity: 6,
      requiredRoles: { guard: 2 },
      services: ["access", "security"],
      security: 5,
      containment: 1,
      unlockedAt: 0
    },
    {
      type: "administration",
      name: "Administration",
      icon: "A",
      description: "Planification des équipes, budgets, rapports et cohérence de la couverture.",
      cost: { funds: 2200, parts: 4 },
      upkeep: 45,
      powerUse: 3,
      waterUse: 0.5,
      minSize: { x: 3, y: 2 },
      capacity: 6,
      requiredRoles: { admin: 2 },
      services: ["administration", "cover"],
      security: 2,
      containment: 0,
      unlockedAt: 0
    },
    {
      type: "access-office",
      name: "Bureau des habilitations",
      icon: "ID",
      description: "Délivre badges, compartimente l'information et enquête sur les anomalies d'accès.",
      cost: { funds: 3200, parts: 6, intel: 2 },
      upkeep: 70,
      powerUse: 4,
      waterUse: 0.5,
      minSize: { x: 3, y: 2 },
      capacity: 5,
      requiredRoles: { admin: 1, guard: 1 },
      services: ["access", "intel"],
      security: 6,
      containment: 1,
      unlockedAt: 1
    },
    {
      type: "archive",
      name: "Archives classifiées",
      icon: "AR",
      description: "Stockage analogique et numérique des dossiers, avec compartimentation des niveaux d'accès.",
      cost: { funds: 3800, parts: 8, intel: 2 },
      upkeep: 80,
      powerUse: 5,
      waterUse: 0,
      minSize: { x: 3, y: 2 },
      capacity: 4,
      requiredRoles: { admin: 1, researcher: 1 },
      services: ["intel", "research"],
      security: 5,
      containment: 2,
      unlockedAt: 1
    },
    {
      type: "medical",
      name: "Infirmerie",
      icon: "+",
      description: "Triage, stabilisation et traitement des blessures ordinaires ou anormales.",
      cost: { funds: 4200, parts: 9, medical: 8 },
      upkeep: 110,
      powerUse: 6,
      waterUse: 3,
      minSize: { x: 4, y: 3 },
      capacity: 8,
      requiredRoles: { medic: 2 },
      services: ["patient", "medical"],
      security: 2,
      containment: 1,
      unlockedAt: 0
    },
    {
      type: "quarantine",
      name: "Quarantaine",
      icon: "Q",
      description: "Isolement des personnes ou échantillons suspects avant diagnostic complet.",
      cost: { funds: 5600, parts: 12, medical: 10 },
      upkeep: 140,
      powerUse: 8,
      waterUse: 4,
      minSize: { x: 4, y: 3 },
      capacity: 6,
      requiredRoles: { medic: 1, guard: 1 },
      services: ["patient", "quarantine", "anomaly"],
      security: 5,
      containment: 5,
      unlockedAt: 1
    },
    {
      type: "decontamination",
      name: "Décontamination",
      icon: "D",
      description: "Nettoyage NBC et séparation des flux propres et contaminés.",
      cost: { funds: 4800, parts: 10, chemicals: 6 },
      upkeep: 125,
      powerUse: 7,
      waterUse: 7,
      minSize: { x: 3, y: 3 },
      capacity: 5,
      requiredRoles: { medic: 1, logistics: 1 },
      services: ["decontamination", "patient", "anomaly"],
      security: 4,
      containment: 4,
      unlockedAt: 1
    },
    {
      type: "intake",
      name: "Réception des anomalies",
      icon: "IN",
      description: "Triage des objets et entités récupérés avant transfert en confinement.",
      cost: { funds: 6200, parts: 14, chemicals: 3 },
      upkeep: 160,
      powerUse: 8,
      waterUse: 3,
      minSize: { x: 5, y: 3 },
      capacity: 8,
      requiredRoles: { logistics: 2, guard: 2, researcher: 1 },
      services: ["delivery", "anomaly", "security"],
      security: 6,
      containment: 5,
      unlockedAt: 0
    },
    {
      type: "laboratory",
      name: "Laboratoire d'analyse",
      icon: "L",
      description: "Diagnostic chimique, biologique et matériel des anomalies inconnues.",
      cost: { funds: 5200, parts: 12, chemicals: 5 },
      upkeep: 145,
      powerUse: 9,
      waterUse: 3,
      minSize: { x: 4, y: 3 },
      capacity: 5,
      requiredRoles: { researcher: 2 },
      services: ["anomaly", "research"],
      security: 3,
      containment: 3,
      unlockedAt: 0
    },
    {
      type: "research",
      name: "Centre de recherche",
      icon: "Σ",
      description: "Produit des points de recherche et augmente la connaissance des dossiers SCP.",
      cost: { funds: 6800, parts: 15, intel: 4 },
      upkeep: 190,
      powerUse: 11,
      waterUse: 2,
      minSize: { x: 5, y: 3 },
      capacity: 8,
      requiredRoles: { researcher: 3 },
      services: ["research", "intel"],
      security: 4,
      containment: 2,
      unlockedAt: 1
    },
    {
      type: "staff-room",
      name: "Salle de repos",
      icon: "☕",
      description: "Réduit fatigue et stress. Indispensable pour limiter les erreurs humaines.",
      cost: { funds: 1800, parts: 3, food: 2 },
      upkeep: 40,
      powerUse: 2,
      waterUse: 1,
      minSize: { x: 3, y: 2 },
      capacity: 8,
      requiredRoles: {},
      services: ["rest"],
      security: 1,
      containment: 0,
      unlockedAt: 0
    },
    {
      type: "canteen",
      name: "Réfectoire",
      icon: "C",
      description: "Nourrit les équipes et stabilise le moral pendant les longues alertes.",
      cost: { funds: 2600, parts: 5, food: 8 },
      upkeep: 65,
      powerUse: 4,
      waterUse: 3,
      minSize: { x: 4, y: 3 },
      capacity: 14,
      requiredRoles: { logistics: 1 },
      services: ["food", "rest"],
      security: 1,
      containment: 0,
      unlockedAt: 0
    },
    {
      type: "restroom",
      name: "Sanitaires",
      icon: "WC",
      description: "Évite les pertes de temps et maintient l'hygiène du personnel.",
      cost: { funds: 900, parts: 2 },
      upkeep: 20,
      powerUse: 1,
      waterUse: 4,
      minSize: { x: 2, y: 2 },
      capacity: 5,
      requiredRoles: {},
      services: ["hygiene"],
      security: 0,
      containment: 0,
      unlockedAt: 0
    },
    {
      type: "maintenance",
      name: "Atelier de maintenance",
      icon: "W",
      description: "Répare les équipements, produit des pièces et réduit les pannes en cascade.",
      cost: { funds: 3600, parts: 10 },
      upkeep: 90,
      powerUse: 6,
      waterUse: 1,
      minSize: { x: 4, y: 3 },
      capacity: 6,
      requiredRoles: { engineer: 2 },
      services: ["repair", "parts"],
      security: 2,
      containment: 1,
      unlockedAt: 0
    },
    {
      type: "warehouse",
      name: "Entrepôt sécurisé",
      icon: "WH",
      description: "Augmente les réserves et évite que les fournitures sensibles traversent les zones publiques.",
      cost: { funds: 3300, parts: 8 },
      upkeep: 70,
      powerUse: 3,
      waterUse: 0,
      minSize: { x: 5, y: 3 },
      capacity: 20,
      requiredRoles: { logistics: 2 },
      services: ["delivery", "logistics"],
      security: 3,
      containment: 2,
      unlockedAt: 0
    },
    {
      type: "armory",
      name: "Armurerie",
      icon: "AM",
      description: "Stockage des armes, munitions et équipements d'intervention.",
      cost: { funds: 4400, parts: 8, ammo: 12 },
      upkeep: 105,
      powerUse: 3,
      waterUse: 0,
      minSize: { x: 3, y: 2 },
      capacity: 10,
      requiredRoles: { guard: 1 },
      services: ["security", "ammo"],
      security: 7,
      containment: 2,
      unlockedAt: 1
    },
    {
      type: "briefing",
      name: "Salle de briefing",
      icon: "B",
      description: "Prépare les équipes et améliore la conformité aux procédures.",
      cost: { funds: 2800, parts: 5, intel: 2 },
      upkeep: 65,
      powerUse: 4,
      waterUse: 0,
      minSize: { x: 4, y: 2 },
      capacity: 10,
      requiredRoles: { guard: 1, researcher: 1 },
      services: ["training", "procedure"],
      security: 3,
      containment: 1,
      unlockedAt: 1
    },
    {
      type: "command-center",
      name: "Centre de commandement",
      icon: "O5",
      description: "Coordonne alarmes, verrouillages, communications et décisions du directeur.",
      cost: { funds: 9500, parts: 20, intel: 8 },
      upkeep: 260,
      powerUse: 15,
      waterUse: 1,
      minSize: { x: 6, y: 4 },
      capacity: 10,
      requiredRoles: { director: 1, admin: 2, guard: 2 },
      services: ["command", "intel", "security"],
      security: 8,
      containment: 3,
      unlockedAt: 2
    },
    {
      type: "training",
      name: "Centre de formation",
      icon: "T",
      description: "Augmente les compétences, l'expérience et la résistance aux protocoles complexes.",
      cost: { funds: 4700, parts: 9, intel: 3 },
      upkeep: 120,
      powerUse: 6,
      waterUse: 1,
      minSize: { x: 4, y: 3 },
      capacity: 8,
      requiredRoles: { researcher: 1, guard: 1 },
      services: ["training"],
      security: 2,
      containment: 1,
      unlockedAt: 2
    },
    {
      type: "mtf-bay",
      name: "Caserne FTM",
      icon: "FTM",
      description: "Réduit le délai d'intervention et permet le déploiement d'unités spécialisées.",
      cost: { funds: 11000, parts: 24, ammo: 20 },
      upkeep: 320,
      powerUse: 10,
      waterUse: 4,
      minSize: { x: 6, y: 4 },
      capacity: 16,
      requiredRoles: { mtf: 4, logistics: 1 },
      services: ["security", "mtf", "training"],
      security: 10,
      containment: 4,
      unlockedAt: 3
    },
    {
      type: "waste-processing",
      name: "Traitement des déchets",
      icon: "X",
      description: "Neutralise déchets chimiques, biologiques et documents sensibles.",
      cost: { funds: 5200, parts: 12, chemicals: 4 },
      upkeep: 135,
      powerUse: 8,
      waterUse: 5,
      minSize: { x: 4, y: 3 },
      capacity: 8,
      requiredRoles: { logistics: 1, engineer: 1 },
      services: ["waste", "decontamination"],
      security: 4,
      containment: 5,
      unlockedAt: 2
    },
    {
      type: "power-distribution",
      name: "Distribution électrique",
      icon: "PD",
      description: "Priorise les secteurs critiques et réduit les effets des pannes générales.",
      cost: { funds: 4300, parts: 14 },
      upkeep: 95,
      powerUse: -10,
      waterUse: 0,
      minSize: { x: 3, y: 3 },
      capacity: 4,
      requiredRoles: { engineer: 1 },
      services: ["power", "repair"],
      security: 3,
      containment: 2,
      unlockedAt: 1
    },
    {
      type: "elevator",
      name: "Ascenseur sécurisé",
      icon: "⇩",
      description: "Connexion verticale vers les niveaux inférieurs. Un goulot d'étranglement critique.",
      cost: { funds: 6500, parts: 18 },
      upkeep: 150,
      powerUse: 10,
      waterUse: 0,
      minSize: { x: 3, y: 3 },
      capacity: 12,
      requiredRoles: { engineer: 1, guard: 1 },
      services: ["vertical", "delivery", "access"],
      security: 6,
      containment: 5,
      unlockedAt: 0
    }
  ];

  export const UNDERGROUND_ROOM_DEFINITIONS: UndergroundRoomDefinition[] = [
    {
      type: "excavated",
      name: "Galerie excavée",
      icon: "□",
      description: "Volume brut prêt à être aménagé.",
      cost: { funds: 900, parts: 2 },
      upkeep: 2,
      powerUse: 0,
      waterUse: 0,
      width: 2,
      containment: 0,
      security: 0,
      tags: ["excavated"],
      unlockedAt: 0
    },
    {
      type: "elevator-shaft",
      name: "Puits d'ascenseur",
      icon: "⇅",
      description: "Relie les niveaux au complexe de surface.",
      cost: { funds: 3800, parts: 10 },
      upkeep: 65,
      powerUse: 5,
      waterUse: 0,
      width: 1,
      containment: 2,
      security: 3,
      tags: ["access", "vertical"],
      unlockedAt: 0
    },
    {
      type: "service-tunnel",
      name: "Tunnel de service",
      icon: "—",
      description: "Circulation technique et itinéraire de secours.",
      cost: { funds: 1200, parts: 3 },
      upkeep: 10,
      powerUse: 1,
      waterUse: 0,
      width: 2,
      containment: 1,
      security: 1,
      tags: ["access", "service"],
      unlockedAt: 0
    },
    {
      type: "safe-containment",
      name: "Confinement Safe",
      icon: "S",
      description: "Cellule standard pour objets facilement confinables.",
      cost: { funds: 5200, parts: 12 },
      upkeep: 110,
      powerUse: 5,
      waterUse: 1,
      width: 3,
      containment: 5,
      security: 4,
      tags: ["safe", "standard"],
      unlockedAt: 0
    },
    {
      type: "euclid-containment",
      name: "Confinement Euclid",
      icon: "E",
      description: "Cellule adaptable avec double sas et surveillance redondante.",
      cost: { funds: 7800, parts: 18, intel: 2 },
      upkeep: 180,
      powerUse: 9,
      waterUse: 2,
      width: 3,
      containment: 7,
      security: 6,
      tags: ["euclid", "standard", "observation"],
      unlockedAt: 1
    },
    {
      type: "keter-containment",
      name: "Confinement Keter",
      icon: "K",
      description: "Structure lourde, réseaux isolés et corridors sacrificiels.",
      cost: { funds: 14500, parts: 32, chemicals: 6, intel: 6 },
      upkeep: 390,
      powerUse: 18,
      waterUse: 4,
      width: 4,
      containment: 10,
      security: 9,
      tags: ["keter", "heavy", "isolated"],
      unlockedAt: 3
    },
    {
      type: "humanoid-cell",
      name: "Cellule humanoïde",
      icon: "H",
      description: "Confinement habitable avec entretien, soins et observation comportementale.",
      cost: { funds: 6800, parts: 14, medical: 4 },
      upkeep: 160,
      powerUse: 7,
      waterUse: 3,
      width: 3,
      containment: 6,
      security: 6,
      tags: ["humanoid", "euclid", "humane"],
      unlockedAt: 1
    },
    {
      type: "bio-containment",
      name: "Confinement biologique",
      icon: "BIO",
      description: "Pression négative, filtration indépendante et incinération locale.",
      cost: { funds: 9800, parts: 22, medical: 8, chemicals: 8 },
      upkeep: 240,
      powerUse: 14,
      waterUse: 5,
      width: 4,
      containment: 8,
      security: 6,
      tags: ["bio", "isolated", "negative-pressure"],
      unlockedAt: 2
    },
    {
      type: "infohazard-vault",
      name: "Coffre infohazard",
      icon: "Ψ",
      description: "Réseaux analogiques, absence d'optique et filtrage des informations dangereuses.",
      cost: { funds: 10500, parts: 20, intel: 10 },
      upkeep: 260,
      powerUse: 12,
      waterUse: 1,
      width: 4,
      containment: 8,
      security: 8,
      tags: ["infohazard", "isolated", "analog"],
      unlockedAt: 2
    },
    {
      type: "heavy-containment",
      name: "Confinement lourd",
      icon: "HC",
      description: "Parois multicouches, suspension et systèmes de verrouillage renforcés.",
      cost: { funds: 12800, parts: 30, chemicals: 4 },
      upkeep: 330,
      powerUse: 16,
      waterUse: 3,
      width: 4,
      containment: 9,
      security: 8,
      tags: ["heavy", "isolated", "suspension"],
      unlockedAt: 2
    },
    {
      type: "research-lab",
      name: "Laboratoire profond",
      icon: "RL",
      description: "Recherche contrôlée au plus près des cellules de confinement.",
      cost: { funds: 7200, parts: 16, intel: 4 },
      upkeep: 180,
      powerUse: 10,
      waterUse: 2,
      width: 3,
      containment: 4,
      security: 4,
      tags: ["research", "observation"],
      unlockedAt: 1
    },
    {
      type: "security-post",
      name: "Poste de sécurité",
      icon: "SP",
      description: "Réduit le temps de réponse et surveille les corridors profonds.",
      cost: { funds: 4200, parts: 9, ammo: 6 },
      upkeep: 110,
      powerUse: 5,
      waterUse: 1,
      width: 2,
      containment: 4,
      security: 8,
      tags: ["security", "response"],
      unlockedAt: 0
    },
    {
      type: "medical-bay",
      name: "Poste médical profond",
      icon: "+",
      description: "Stabilisation rapide avant évacuation vers la surface.",
      cost: { funds: 4800, parts: 10, medical: 6 },
      upkeep: 125,
      powerUse: 6,
      waterUse: 3,
      width: 2,
      containment: 2,
      security: 2,
      tags: ["medical", "response"],
      unlockedAt: 1
    },
    {
      type: "power-node",
      name: "Nœud énergétique",
      icon: "⚡",
      description: "Batteries locales et alimentation prioritaire des cellules critiques.",
      cost: { funds: 5400, parts: 16 },
      upkeep: 100,
      powerUse: -18,
      waterUse: 0,
      width: 2,
      containment: 2,
      security: 3,
      tags: ["power", "backup"],
      unlockedAt: 1
    },
    {
      type: "air-filtration",
      name: "Filtration autonome",
      icon: "AIR",
      description: "Isole la ventilation d'un niveau et limite les contaminations croisées.",
      cost: { funds: 5900, parts: 14, chemicals: 4 },
      upkeep: 125,
      powerUse: 8,
      waterUse: 1,
      width: 2,
      containment: 5,
      security: 2,
      tags: ["air", "isolated", "negative-pressure"],
      unlockedAt: 1
    },
    {
      type: "emergency-shelter",
      name: "Abri d'urgence",
      icon: "SH",
      description: "Zone protégée pour le personnel lors des verrouillages de niveau.",
      cost: { funds: 4600, parts: 10, food: 6, medical: 4 },
      upkeep: 90,
      powerUse: 4,
      waterUse: 2,
      width: 3,
      containment: 4,
      security: 5,
      tags: ["shelter", "evacuation"],
      unlockedAt: 2
    },
    {
      type: "acid-system",
      name: "Système acide",
      icon: "AC",
      description: "Cuves, pompes et neutralisation nécessaires aux procédures corrosives.",
      cost: { funds: 11800, parts: 24, chemicals: 20 },
      upkeep: 310,
      powerUse: 14,
      waterUse: 6,
      width: 3,
      containment: 8,
      security: 5,
      tags: ["acid", "heavy", "chemical"],
      unlockedAt: 4
    },
    {
      type: "temporal-lock",
      name: "Verrou temporel",
      icon: "TΔ",
      description: "Infrastructure expérimentale pour phénomènes temporels et géométriques.",
      cost: { funds: 18000, parts: 34, intel: 14, research: 30 },
      upkeep: 480,
      powerUse: 24,
      waterUse: 2,
      width: 4,
      containment: 11,
      security: 8,
      tags: ["temporal", "reality", "isolated"],
      unlockedAt: 5
    }
  ];

  export const SCP_DEFINITIONS: SCPDefinition[] = [
    {
      id: "scp-173",
      designation: "SCP-173",
      name: "La Sculpture",
      objectClass: "Euclid",
      icon: "173",
      description: "Entité mobile lorsqu'elle n'est pas directement observée. Sa procédure dépend de la coordination humaine et de l'éclairage.",
      risk: 7,
      disruption: 4,
      requirements: {
        roomTags: ["euclid", "observation"],
        minContainment: 7,
        minSecurity: 5,
        powerReliability: 0.8,
        staff: { guard: 3 },
        suppliesPerDay: { parts: 0.2 },
        procedureFlags: ["observation", "backup-power", "training"]
      },
      researchValue: 8,
      moraleEffect: -2,
      uniqueRule: "Trois observateurs formés et un éclairage fiable réduisent fortement le risque.",
      unlockedAt: 0
    },
    {
      id: "scp-096",
      designation: "SCP-096",
      name: "L'Homme timide",
      objectClass: "Euclid",
      icon: "096",
      description: "Le danger principal est informationnel : toute image non filtrée peut déclencher une crise à distance.",
      risk: 9,
      disruption: 9,
      requirements: {
        roomTags: ["infohazard", "isolated", "analog"],
        minContainment: 8,
        minSecurity: 8,
        powerReliability: 0.7,
        staff: { guard: 2, researcher: 1 },
        suppliesPerDay: { intel: 0.3 },
        procedureFlags: ["no-optical", "analog-backup", "isolated-network"]
      },
      researchValue: 12,
      moraleEffect: -4,
      uniqueRule: "La surveillance optique augmente immédiatement le risque ; les capteurs indirects sont indispensables.",
      unlockedAt: 2
    },
    {
      id: "scp-049",
      designation: "SCP-049",
      name: "Le Docteur",
      objectClass: "Euclid",
      icon: "049",
      description: "Entité humanoïde coopérative par intermittence. Le confinement dépend du dialogue, de l'approvisionnement et du contrôle biologique.",
      risk: 6,
      disruption: 5,
      requirements: {
        roomTags: ["humanoid", "humane"],
        minContainment: 6,
        minSecurity: 6,
        powerReliability: 0.5,
        staff: { guard: 2, medic: 1, researcher: 1 },
        suppliesPerDay: { medical: 0.4, chemicals: 0.2 },
        procedureFlags: ["humane-care", "restricted-testing", "biological-control"]
      },
      researchValue: 10,
      moraleEffect: -2,
      uniqueRule: "Les conditions humaines et les entretiens réguliers stabilisent son humeur ; les tests non autorisés créent des instances hostiles.",
      unlockedAt: 1
    },
    {
      id: "scp-106",
      designation: "SCP-106",
      name: "Le Vieil Homme",
      objectClass: "Keter",
      icon: "106",
      description: "Entité corrosive capable de traverser les structures et d'exploiter les failles techniques.",
      risk: 10,
      disruption: 8,
      requirements: {
        roomTags: ["heavy", "isolated", "suspension"],
        minContainment: 9,
        minSecurity: 8,
        powerReliability: 0.95,
        staff: { guard: 4, engineer: 2 },
        suppliesPerDay: { chemicals: 1.2, parts: 0.8 },
        procedureFlags: ["backup-power", "maintenance", "automated-lockdown"]
      },
      researchValue: 16,
      moraleEffect: -6,
      uniqueRule: "Les dommages structurels et les conduites mal entretenues deviennent des voies de brèche.",
      unlockedAt: 3
    },
    {
      id: "scp-939",
      designation: "SCP-939",
      name: "À plusieurs voix",
      objectClass: "Keter",
      icon: "939",
      description: "Prédateurs imitant la parole humaine. Les communications et les identités doivent être authentifiées hors réseau.",
      risk: 9,
      disruption: 7,
      requirements: {
        roomTags: ["bio", "isolated", "negative-pressure"],
        minContainment: 8,
        minSecurity: 7,
        powerReliability: 0.8,
        staff: { guard: 3, medic: 1 },
        suppliesPerDay: { medical: 0.4, chemicals: 0.5 },
        procedureFlags: ["biometric-monitoring", "analog-backup", "isolated-network"]
      },
      researchValue: 14,
      moraleEffect: -5,
      uniqueRule: "Une radio non authentifiée peut donner de faux ordres pendant une crise.",
      unlockedAt: 3
    },
    {
      id: "scp-914",
      designation: "SCP-914",
      name: "La Machine mécanique",
      objectClass: "Safe",
      icon: "914",
      description: "Dispositif transformant les objets selon plusieurs réglages. Très utile, mais les essais improvisés ont des conséquences imprévisibles.",
      risk: 4,
      disruption: 4,
      requirements: {
        roomTags: ["safe", "standard"],
        minContainment: 5,
        minSecurity: 5,
        powerReliability: 0.4,
        staff: { guard: 1, researcher: 2 },
        suppliesPerDay: { parts: 0.2 },
        procedureFlags: ["restricted-testing", "access-control"]
      },
      researchValue: 15,
      moraleEffect: 1,
      uniqueRule: "Peut convertir des pièces et équipements, mais les personnels curieux tentent parfois des tests non autorisés.",
      unlockedAt: 1
    },
    {
      id: "scp-294",
      designation: "SCP-294",
      name: "La Machine à café",
      objectClass: "Euclid",
      icon: "294",
      description: "Distributeur capable de produire une vaste gamme de liquides à partir d'une requête textuelle.",
      risk: 5,
      disruption: 5,
      requirements: {
        roomTags: ["safe", "standard"],
        minContainment: 5,
        minSecurity: 6,
        powerReliability: 0.5,
        staff: { guard: 1, researcher: 1 },
        suppliesPerDay: { water: 0.4 },
        procedureFlags: ["restricted-testing", "access-control", "isolated-network"]
      },
      researchValue: 9,
      moraleEffect: 2,
      uniqueRule: "Les requêtes mal formulées ou malveillantes peuvent déclencher un incident chimique ou biologique.",
      unlockedAt: 1
    },
    {
      id: "scp-682",
      designation: "SCP-682",
      name: "Le Reptile difficile à détruire",
      objectClass: "Keter",
      icon: "682",
      description: "Entité extrêmement hostile et adaptative. Son maintien exige une infrastructure chimique lourde et une surveillance constante.",
      risk: 12,
      disruption: 10,
      requirements: {
        roomTags: ["keter", "heavy", "acid"],
        minContainment: 10,
        minSecurity: 10,
        powerReliability: 0.98,
        staff: { guard: 5, engineer: 3, researcher: 2 },
        suppliesPerDay: { chemicals: 2.5, parts: 1.2, ammo: 0.4 },
        procedureFlags: ["backup-power", "maintenance", "automated-lockdown", "restricted-testing"]
      },
      researchValue: 22,
      moraleEffect: -10,
      uniqueRule: "Consomme rapidement les réserves chimiques et s'adapte aux procédures négligées.",
      unlockedAt: 5
    },
    {
      id: "scp-999",
      designation: "SCP-999",
      name: "La Masse chatouilleuse",
      objectClass: "Safe",
      icon: "999",
      description: "Entité bienveillante améliorant fortement le moral du personnel et réduisant le stress.",
      risk: 1,
      disruption: 1,
      requirements: {
        roomTags: ["humanoid", "humane"],
        minContainment: 3,
        minSecurity: 1,
        powerReliability: 0.2,
        staff: { researcher: 1 },
        suppliesPerDay: { food: 0.5 },
        procedureFlags: ["humane-care"]
      },
      researchValue: 5,
      moraleEffect: 8,
      uniqueRule: "Des périodes de visite contrôlée peuvent restaurer le moral des équipes stressées.",
      unlockedAt: 0
    },
    {
      id: "scp-131",
      designation: "SCP-131",
      name: "Les Œillets",
      objectClass: "Safe",
      icon: "131",
      description: "Petites entités curieuses et coopératives, utiles à l'observation mais difficiles à garder dans un secteur précis.",
      risk: 2,
      disruption: 2,
      requirements: {
        roomTags: ["safe", "standard"],
        minContainment: 3,
        minSecurity: 2,
        powerReliability: 0.2,
        staff: { researcher: 1 },
        suppliesPerDay: { food: 0.2 },
        procedureFlags: ["humane-care", "access-control"]
      },
      researchValue: 4,
      moraleEffect: 4,
      uniqueRule: "Peuvent assister certaines procédures d'observation, mais leur déplacement non autorisé augmente la confusion des flux.",
      unlockedAt: 0
    },
    {
      id: "scp-087",
      designation: "SCP-087",
      name: "L'Escalier",
      objectClass: "Euclid",
      icon: "087",
      description: "Structure anormale descendante. Les expéditions génèrent du renseignement mais exposent le personnel à des risques croissants.",
      risk: 7,
      disruption: 5,
      requirements: {
        roomTags: ["isolated", "heavy"],
        minContainment: 7,
        minSecurity: 6,
        powerReliability: 0.5,
        staff: { guard: 2, researcher: 2, medic: 1 },
        suppliesPerDay: { medical: 0.2, parts: 0.2 },
        procedureFlags: ["restricted-testing", "training", "automated-lockdown"]
      },
      researchValue: 18,
      moraleEffect: -4,
      uniqueRule: "Chaque expédition peut révéler des données rares, mais augmente le stress et le risque d'événement inconnu.",
      unlockedAt: 4
    },
    {
      id: "scp-008",
      designation: "SCP-008",
      name: "Prion zombie",
      objectClass: "Euclid",
      icon: "008",
      description: "Agent biologique extrêmement dangereux exigeant une quarantaine stricte et une ventilation indépendante.",
      risk: 9,
      disruption: 8,
      requirements: {
        roomTags: ["bio", "isolated", "negative-pressure"],
        minContainment: 8,
        minSecurity: 7,
        powerReliability: 0.9,
        staff: { medic: 2, guard: 2, engineer: 1 },
        suppliesPerDay: { medical: 0.8, chemicals: 0.8 },
        procedureFlags: ["biological-control", "redundant-ventilation", "automated-lockdown"]
      },
      researchValue: 15,
      moraleEffect: -6,
      uniqueRule: "Une erreur de triage en surface peut transformer une simple blessure en crise multisectorielle.",
      unlockedAt: 3
    }
  ];

  export const RESEARCH_NODE_TEMPLATES: Omit<ResearchNode, "completed">[] = [
    {
      id: "grid-redundancy",
      name: "Réseaux redondants",
      description: "Réduit les pénalités de panne et déverrouille les nœuds énergétiques profonds.",
      cost: 35,
      prerequisites: [],
      unlocks: ["power-node", "backup-power"],
      category: "infrastructure"
    },
    {
      id: "deep-excavation",
      name: "Excavation profonde",
      description: "Autorise l'aménagement au-delà du niveau -4 et réduit les coûts géologiques.",
      cost: 45,
      prerequisites: ["grid-redundancy"],
      unlocks: ["level-5-plus"],
      category: "infrastructure"
    },
    {
      id: "advanced-containment",
      name: "Confinement adaptatif",
      description: "Déverrouille les cellules Euclid, lourdes et leurs mises à niveau.",
      cost: 40,
      prerequisites: [],
      unlocks: ["euclid-containment", "heavy-containment"],
      category: "containment"
    },
    {
      id: "keter-doctrine",
      name: "Doctrine Keter",
      description: "Déverrouille les cellules Keter et les corridors sacrificiels.",
      cost: 90,
      prerequisites: ["advanced-containment", "grid-redundancy"],
      unlocks: ["keter-containment", "acid-system"],
      category: "containment"
    },
    {
      id: "biohazard-protocols",
      name: "Protocoles biologiques",
      description: "Améliore la quarantaine, les traitements et la filtration autonome.",
      cost: 55,
      prerequisites: [],
      unlocks: ["bio-containment", "air-filtration", "biological-control", "redundant-ventilation"],
      category: "medical"
    },
    {
      id: "memetic-screening",
      name: "Filtrage mémétique",
      description: "Déverrouille les coffres infohazard et réduit la propagation informationnelle.",
      cost: 70,
      prerequisites: ["advanced-containment"],
      unlocks: ["infohazard-vault", "isolated-network"],
      category: "memetics"
    },
    {
      id: "mtf-readiness",
      name: "Disponibilité FTM",
      description: "Déverrouille la caserne FTM et accélère les interventions de crise.",
      cost: 65,
      prerequisites: [],
      unlocks: ["mtf-bay", "deploy-mtf"],
      category: "security"
    },
    {
      id: "identity-authentication",
      name: "Authentification hors réseau",
      description: "Réduit l'efficacité des imitations, infiltrations et ordres falsifiés.",
      cost: 50,
      prerequisites: ["memetic-screening"],
      unlocks: ["biometric-monitoring", "analog-backup"],
      category: "security"
    },
    {
      id: "automated-lockdown",
      name: "Verrouillage automatisé",
      description: "Permet de sceller plus rapidement les zones pendant une crise.",
      cost: 60,
      prerequisites: ["grid-redundancy"],
      unlocks: ["automated-lockdown"],
      category: "security"
    },
    {
      id: "ethical-care",
      name: "Confinement coopératif",
      description: "Améliore le moral, réduit l'hostilité des humanoïdes et renforce l'éthique.",
      cost: 45,
      prerequisites: [],
      unlocks: ["humane-care"],
      category: "medical"
    },
    {
      id: "predictive-maintenance",
      name: "Maintenance prédictive",
      description: "Réduit l'usure et signale les pannes avant leur propagation.",
      cost: 40,
      prerequisites: [],
      unlocks: ["maintenance-forecast"],
      category: "logistics"
    },
    {
      id: "temporal-engineering",
      name: "Ingénierie temporelle",
      description: "Déverrouille les infrastructures de fin de campagne pour les phénomènes de classe K.",
      cost: 150,
      prerequisites: ["keter-doctrine", "memetic-screening", "deep-excavation"],
      unlocks: ["temporal-lock"],
      category: "containment"
    }
  ];

  export interface EventTemplate {
    id: string;
    title: string;
    body: string;
    severity: EventSeverity;
    minDay: number;
    weight: number;
    blocking: boolean;
    choices: EventChoice[];
  }

  export const EVENT_TEMPLATES: EventTemplate[] = [
    {
      id: "early-convoy",
      title: "Convoi arrivé en avance",
      body: "Un convoi contenant une anomalie non caractérisée arrive alors que le quai principal est encore occupé. Le laisser attendre augmente l'exposition de surface.",
      severity: "major",
      minDay: 1,
      weight: 8,
      blocking: true,
      choices: [
        {
          id: "reroute",
          label: "Détourner vers le garage secondaire",
          description: "Réduit le retard, mais augmente la contamination et la charge de l'infirmerie.",
          effects: [
            { type: "queue", key: "anomaly", amount: 2, target: "intake" },
            { type: "queue", key: "patient", amount: 2, target: "medical" },
            { type: "reputation", key: "cover", amount: -2 },
            { type: "log", value: "Le convoi est entré par un itinéraire non certifié." }
          ]
        },
        {
          id: "hold",
          label: "Maintenir le convoi hors périmètre",
          description: "Le triage reste propre, mais la couverture et la réputation de commandement souffrent.",
          effects: [
            { type: "reputation", key: "command", amount: -3 },
            { type: "reputation", key: "cover", amount: -1 },
            { type: "resource", key: "funds", amount: -1200 },
            { type: "log", value: "Le convoi a attendu sous escorte extérieure." }
          ]
        },
        {
          id: "emergency-intake",
          label: "Ouvrir un triage d'urgence",
          description: "Coûteux, mais maîtrisé si les consommables sont disponibles.",
          cost: { funds: 2200, medical: 3, chemicals: 2 },
          effects: [
            { type: "reputation", key: "command", amount: 2 },
            { type: "queue", key: "anomaly", amount: 1, target: "intake" },
            { type: "log", value: "Un triage provisoire a été activé." }
          ]
        }
      ]
    },
    {
      id: "public-inspection",
      title: "Inspection de la couverture",
      body: "Une inspection environnementale demande un accès immédiat à la centrale et au traitement des eaux. Plusieurs itinéraires croisent des zones classifiées.",
      severity: "major",
      minDay: 2,
      weight: 7,
      blocking: true,
      choices: [
        {
          id: "guided-tour",
          label: "Organiser une visite contrôlée",
          description: "Nécessite une administration solide ; sinon les inspecteurs remarqueront des incohérences.",
          effects: [
            { type: "queue", key: "inspection", amount: 3, target: "reception" },
            { type: "reputation", key: "cover", amount: 2 },
            { type: "log", value: "La façade publique prend en charge les inspecteurs." }
          ]
        },
        {
          id: "delay",
          label: "Retarder par voie juridique",
          description: "Achète du temps, mais augmente la suspicion régionale.",
          cost: { funds: 1800, intel: 2 },
          effects: [
            { type: "reputation", key: "cover", amount: -1 },
            { type: "reputation", key: "command", amount: -1 },
            { type: "flag", key: "inspection-delayed", value: true },
            { type: "log", value: "L'inspection est reportée, pas annulée." }
          ]
        },
        {
          id: "amnestic",
          label: "Neutraliser l'inspection",
          description: "Efficace à court terme, lourd sur le plan éthique et informationnel.",
          cost: { medical: 5, intel: 4 },
          effects: [
            { type: "reputation", key: "ethics", amount: -6 },
            { type: "reputation", key: "cover", amount: 4 },
            { type: "log", value: "Les inspecteurs ont quitté le Site sans souvenir exploitable." }
          ]
        }
      ]
    },
    {
      id: "night-shift-fatigue",
      title: "Fatigue de l'équipe de nuit",
      body: "Plusieurs agents accumulent les doubles rotations. Les changements de garde commencent à dépasser les tolérances des procédures.",
      severity: "minor",
      minDay: 1,
      weight: 9,
      blocking: false,
      choices: [
        {
          id: "rest",
          label: "Imposer une rotation de repos",
          description: "Réduit temporairement les effectifs, mais protège la conformité à long terme.",
          effects: [
            { type: "staff", key: "stress", amount: -18, target: "night" },
            { type: "staff", key: "fatigue", amount: -24, target: "night" },
            { type: "reputation", key: "personnel", amount: 3 }
          ]
        },
        {
          id: "overtime",
          label: "Maintenir les postes",
          description: "La sécurité immédiate reste complète, au prix d'erreurs futures.",
          effects: [
            { type: "staff", key: "fatigue", amount: 18, target: "night" },
            { type: "reputation", key: "personnel", amount: -3 },
            { type: "flag", key: "night-overtime", value: true }
          ]
        }
      ]
    },
    {
      id: "supply-shortage",
      title: "Pénurie de consommables",
      body: "Un fournisseur de la couverture a bloqué une livraison. Les réserves médicales et chimiques risquent de passer sous le seuil de sécurité.",
      severity: "major",
      minDay: 3,
      weight: 7,
      blocking: true,
      choices: [
        {
          id: "premium",
          label: "Acheter sur un circuit prioritaire",
          description: "Rétablit immédiatement les stocks à coût élevé.",
          cost: { funds: 5500 },
          effects: [
            { type: "resource", key: "medical", amount: 10 },
            { type: "resource", key: "chemicals", amount: 10 },
            { type: "reputation", key: "command", amount: 1 }
          ]
        },
        {
          id: "ration",
          label: "Rationner les secteurs non critiques",
          description: "Préserve le confinement mais augmente le stress et ralentit les soins.",
          effects: [
            { type: "reputation", key: "personnel", amount: -4 },
            { type: "flag", key: "rationing", value: true },
            { type: "log", value: "Le rationnement des consommables est actif." }
          ]
        },
        {
          id: "requisition",
          label: "Réquisitionner via la couverture",
          description: "Solution rapide qui augmente la suspicion locale.",
          effects: [
            { type: "resource", key: "medical", amount: 7 },
            { type: "resource", key: "chemicals", amount: 7 },
            { type: "reputation", key: "cover", amount: -5 }
          ]
        }
      ]
    },
    {
      id: "infiltration-clue",
      title: "Anomalie d'accès",
      body: "Un badge de niveau 3 a été utilisé dans deux secteurs distants à moins de trente secondes d'intervalle.",
      severity: "critical",
      minDay: 4,
      weight: 5,
      blocking: true,
      choices: [
        {
          id: "lock-identity",
          label: "Suspendre toutes les identités concernées",
          description: "Perturbe les opérations mais limite immédiatement le mouvement de l'infiltré.",
          effects: [
            { type: "queue", key: "access", amount: 5, target: "access-office" },
            { type: "reputation", key: "personnel", amount: -2 },
            { type: "flag", key: "infiltration-contained", value: true },
            { type: "log", value: "Les accès suspects ont été neutralisés." }
          ]
        },
        {
          id: "shadow",
          label: "Surveiller sans intervenir",
          description: "Peut révéler un réseau plus vaste, mais le risque de sabotage augmente.",
          effects: [
            { type: "resource", key: "intel", amount: 6 },
            { type: "flag", key: "infiltration-shadowed", value: true },
            { type: "log", value: "La sécurité interne suit discrètement la piste." }
          ]
        },
        {
          id: "force-search",
          label: "Verrouillage et fouille générale",
          description: "Méthode brutale et coûteuse qui peut provoquer une crise si l'infiltré est déjà armé.",
          cost: { ammo: 4 },
          effects: [
            { type: "crisis", value: "infiltration" },
            { type: "reputation", key: "personnel", amount: -5 }
          ]
        }
      ]
    },
    {
      id: "ethical-review",
      title: "Audit du Comité d'éthique",
      body: "Le Comité demande les rapports d'expériences, les conditions de détention et les décisions de sacrifice opérationnel du trimestre.",
      severity: "major",
      minDay: 5,
      weight: 5,
      blocking: true,
      choices: [
        {
          id: "full-cooperation",
          label: "Coopération complète",
          description: "Ralentit la recherche, mais renforce la confiance interne.",
          effects: [
            { type: "resource", key: "research", amount: -12 },
            { type: "reputation", key: "ethics", amount: 7 },
            { type: "reputation", key: "personnel", amount: 3 }
          ]
        },
        {
          id: "redact",
          label: "Transmettre une version expurgée",
          description: "Préserve les programmes sensibles, mais une incohérence peut déclencher une enquête.",
          effects: [
            { type: "resource", key: "intel", amount: -3 },
            { type: "reputation", key: "ethics", amount: -2 },
            { type: "flag", key: "ethics-redacted", value: true }
          ]
        }
      ]
    },
    {
      id: "grid-failure",
      title: "Défaillance du réseau principal",
      body: "La couverture énergétique a subi une panne. Les cellules profondes réclament une alimentation prioritaire et plusieurs ascenseurs sont arrêtés.",
      severity: "critical",
      minDay: 3,
      weight: 6,
      blocking: true,
      choices: [
        {
          id: "critical-only",
          label: "Alimenter uniquement le confinement",
          description: "Protège les SCP, mais bloque les services de surface et crée des files d'attente.",
          effects: [
            { type: "queue", key: "access", amount: 4, target: "checkpoint" },
            { type: "queue", key: "patient", amount: 2, target: "medical" },
            { type: "flag", key: "surface-blackout", value: true },
            { type: "log", value: "Toute l'énergie disponible est dirigée vers le confinement." }
          ]
        },
        {
          id: "balanced",
          label: "Répartir la charge",
          description: "Maintient les opérations, mais chaque SCP gagne du risque pendant la réparation.",
          effects: [
            { type: "scp", key: "breachRisk", amount: 9, target: "all" },
            { type: "resource", key: "parts", amount: -5 },
            { type: "log", value: "La charge est répartie entre les couches du Site." }
          ]
        },
        {
          id: "emergency-repair",
          label: "Réparation d'urgence complète",
          description: "Consomme les réserves et expose les ingénieurs, mais rétablit rapidement le réseau.",
          cost: { parts: 10, funds: 1800 },
          effects: [
            { type: "staff", key: "stress", amount: 8, target: "engineer" },
            { type: "reputation", key: "command", amount: 2 }
          ]
        }
      ]
    },
    {
      id: "unknown-patient",
      title: "Patient aux symptômes incohérents",
      body: "Un agent de récupération présente une température instable, des souvenirs contradictoires et une biométrie changeante.",
      severity: "critical",
      minDay: 3,
      weight: 5,
      blocking: true,
      choices: [
        {
          id: "quarantine",
          label: "Quarantaine maximale",
          description: "Consomme des ressources mais empêche une propagation immédiate.",
          cost: { medical: 3, chemicals: 2 },
          effects: [
            { type: "queue", key: "patient", amount: 1, target: "quarantine" },
            { type: "reputation", key: "command", amount: 1 },
            { type: "log", value: "Le patient est placé en isolement complet." }
          ]
        },
        {
          id: "general-medical",
          label: "Poursuivre le diagnostic standard",
          description: "Économique, mais une erreur déclenchera une contamination de surface.",
          effects: [
            { type: "queue", key: "patient", amount: 3, target: "medical" },
            { type: "crisis", value: "biohazard" }
          ]
        }
      ]
    }
  ];

  export const CAMPAIGN_TEMPLATE: CampaignChapter[] = [
    {
      id: "chapter-0",
      index: 0,
      title: "Directive 00 — La couverture",
      briefing: "Le commandement régional vous confie un ancien complexe industriel. Rendez la surface crédible, organisez les premiers flux et préparez l'accès aux niveaux inférieurs.",
      objectives: [
        { id: "build-cover", title: "Façade crédible", description: "Exploiter au moins 9 installations régionales non routières.", progress: 0, target: 9, complete: false, reward: { funds: 5000, intel: 4 }, condition: "region-facilities" },
        { id: "surface-core", title: "Cœur opérationnel", description: "Disposer d'accueil, contrôle, infirmerie, atelier, ascenseur, laboratoire, entrepôt et repos.", progress: 0, target: 8, complete: false, reward: { funds: 4500, parts: 8 }, condition: "surface-core" },
        { id: "staff-20", title: "Première équipe renforcée", description: "Employer au moins 20 personnes actives pour couvrir les rotations.", progress: 0, target: 20, complete: false, reward: { funds: 3000, food: 6 }, condition: "staff-count" }
      ],
      unlockedScps: ["scp-131", "scp-999", "scp-173"],
      rewardText: "Autorisation d'ouverture du premier secteur Euclid.",
      complete: false
    },
    {
      id: "chapter-1",
      index: 1,
      title: "Directive 01 — Premier confinement",
      briefing: "Les premières anomalies arrivent. Le Site doit prouver qu'il sait diagnostiquer, transférer et maintenir un objet sans exposition publique.",
      objectives: [
        { id: "contain-one", title: "Sécuriser une anomalie", description: "Contenir au moins un SCP dans une cellule compatible.", progress: 0, target: 1, complete: false, reward: { research: 20, funds: 4000 }, condition: "contained-scps" },
        { id: "procedure", title: "Procédure conforme", description: "Atteindre 75 % de conformité sur une procédure active.", progress: 0, target: 75, complete: false, reward: { intel: 5, research: 10 }, condition: "procedure-compliance" },
        { id: "research-50", title: "Premiers résultats", description: "Accumuler 50 points de recherche.", progress: 0, target: 50, complete: false, reward: { funds: 5000, parts: 10 }, condition: "research-resource" }
      ],
      unlockedScps: ["scp-049", "scp-914", "scp-294"],
      rewardText: "Accès aux dossiers humanoïdes et aux anomalies utilisables.",
      complete: false
    },
    {
      id: "chapter-2",
      index: 2,
      title: "Directive 02 — Site vivant",
      briefing: "L'activité augmente. Les files, la fatigue, la maintenance et la compartimentation deviennent aussi dangereuses que les anomalies elles-mêmes.",
      objectives: [
        { id: "morale", title: "Personnel stable", description: "Maintenir une réputation du personnel d'au moins 65.", progress: 0, target: 65, complete: false, reward: { funds: 5500, food: 10, medical: 5 }, condition: "personnel-reputation" },
        { id: "queues", title: "Flux maîtrisés", description: "Réduire toutes les files critiques sous 4 éléments.", progress: 0, target: 1, complete: false, reward: { intel: 6, parts: 8 }, condition: "queues-controlled" },
        { id: "research-tech", title: "Réseaux redondants", description: "Achever 2 recherches technologiques.", progress: 0, target: 2, complete: false, reward: { funds: 6500, research: 20 }, condition: "research-completed" }
      ],
      unlockedScps: ["scp-096"],
      rewardText: "Autorisation de construire un secteur infohazard.",
      complete: false
    },
    {
      id: "chapter-3",
      index: 3,
      title: "Directive 03 — Rupture contrôlée",
      briefing: "Le commandement exige un exercice de brèche réel. Votre architecture, vos procédures et vos équipes seront évaluées en situation de crise.",
      objectives: [
        { id: "crisis-win", title: "Résoudre une crise", description: "Terminer une crise majeure avec succès.", progress: 0, target: 1, complete: false, reward: { funds: 9000, ammo: 12 }, condition: "crisis-success" },
        { id: "mtf", title: "Capacité d'intervention", description: "Employer au moins 4 opérateurs FTM ou disposer d'une caserne FTM.", progress: 0, target: 4, complete: false, reward: { funds: 7000, intel: 8 }, condition: "mtf-capability" },
        { id: "cover-70", title: "Voile intact", description: "Maintenir la couverture au-dessus de 70 après l'exercice.", progress: 0, target: 70, complete: false, reward: { research: 25, funds: 5000 }, condition: "cover-reputation" }
      ],
      unlockedScps: ["scp-008", "scp-939", "scp-106"],
      rewardText: "Dossiers Keter et biologiques autorisés.",
      complete: false
    },
    {
      id: "chapter-4",
      index: 4,
      title: "Directive 04 — La guerre invisible",
      briefing: "Des accès incohérents, des convois suivis et des fuites documentaires indiquent l'action d'un Groupe d'intérêt hostile.",
      objectives: [
        { id: "intel-50", title: "Renseignement consolidé", description: "Accumuler 50 points de renseignement.", progress: 0, target: 50, complete: false, reward: { funds: 8000, research: 20 }, condition: "intel-resource" },
        { id: "security", title: "Architecture compartimentée", description: "Construire 3 postes ou salles de sécurité avancés.", progress: 0, target: 3, complete: false, reward: { ammo: 15, parts: 12 }, condition: "security-rooms" },
        { id: "ethics", title: "Autorité légitime", description: "Maintenir l'éthique au-dessus de 55 et le personnel au-dessus de 55.", progress: 0, target: 1, complete: false, reward: { funds: 10000 }, condition: "ethical-authority" }
      ],
      unlockedScps: ["scp-087"],
      rewardText: "Le Site devient un centre régional autonome.",
      complete: false
    },
    {
      id: "chapter-5",
      index: 5,
      title: "Directive 05 — Deep Protocol",
      briefing: "Une anomalie de niveau terminal exige une installation capable de fonctionner même lorsque la réalité, l'information ou le commandement cessent d'être fiables.",
      objectives: [
        { id: "deep-levels", title: "Profondeur stratégique", description: "Aménager au moins 6 niveaux souterrains distincts.", progress: 0, target: 6, complete: false, reward: { funds: 15000, parts: 20 }, condition: "underground-levels" },
        { id: "temporal", title: "Verrou terminal", description: "Achever la recherche Ingénierie temporelle et construire un verrou temporel.", progress: 0, target: 1, complete: false, reward: { research: 40, intel: 15 }, condition: "temporal-lock" },
        { id: "contain-keter", title: "Confinement extrême", description: "Maintenir un SCP Keter avec moins de 25 % de risque pendant une journée.", progress: 0, target: 1, complete: false, reward: { funds: 20000 }, condition: "stable-keter" }
      ],
      unlockedScps: ["scp-682"],
      rewardText: "Le Site est reconnu comme installation de classe Deep Protocol.",
      complete: false
    }
  ];

  export const STAFF_FIRST_NAMES = [
    "Ariane", "Maya", "Lina", "Camille", "Nora", "Élise", "Sofia", "Manon", "Inès", "Clara",
    "Victor", "Elias", "Noé", "Adam", "Lucas", "Hugo", "Mathis", "Louis", "Nolan", "Arthur",
    "Samira", "Yuna", "Roxane", "Naomi", "Jade", "Maëlle", "Sarah", "Léa", "Eva", "Lou",
    "Malik", "Yanis", "Rayan", "Jules", "Simon", "Théo", "Nils", "Alex", "Sacha", "Milo"
  ];

  export const STAFF_LAST_NAMES = [
    "Moreau", "Vidal", "Mercier", "Fournier", "Roux", "Lambert", "Dubois", "Perrin", "Garnier", "Faure",
    "Nguyen", "Martin", "Bernard", "Petit", "Leroy", "Muller", "Fontaine", "Blanc", "Giraud", "Henry",
    "Keller", "Lopez", "Dumas", "Renard", "Collet", "Marchand", "Barbier", "Lacroix", "Bailly", "Caron"
  ];

  export const STAFF_TRAITS = [
    "Méthodique", "Courageux", "Curieux", "Empathique", "Paranoïaque", "Calme", "Autoritaire", "Ambitieux",
    "Distrait", "Endurant", "Loyal", "Sceptique", "Rigoureux", "Improvisateur", "Insomniaque", "Diplomate"
  ];

  export function getRegionDefinition(type: RegionFacilityType): RegionFacilityDefinition {
    const result = REGION_FACILITY_DEFINITIONS.find((entry) => entry.type === type);
    if (!result) throw new Error(`Définition régionale inconnue: ${type}`);
    return result;
  }

  export function getSurfaceDefinition(type: SurfaceRoomType): SurfaceRoomDefinition {
    const result = SURFACE_ROOM_DEFINITIONS.find((entry) => entry.type === type);
    if (!result) throw new Error(`Définition de surface inconnue: ${type}`);
    return result;
  }

  export function getUndergroundDefinition(type: UndergroundRoomType): UndergroundRoomDefinition {
    const result = UNDERGROUND_ROOM_DEFINITIONS.find((entry) => entry.type === type);
    if (!result) throw new Error(`Définition souterraine inconnue: ${type}`);
    return result;
  }

  export function getSCPDefinition(id: string): SCPDefinition {
    const result = SCP_DEFINITIONS.find((entry) => entry.id === id);
    if (!result) throw new Error(`SCP inconnu: ${id}`);
    return result;
  }
}
