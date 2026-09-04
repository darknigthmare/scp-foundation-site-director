"use strict";
var SCPGame;
(function (SCPGame) {
    SCPGame.GAME_VERSION = "1.0.0";
    SCPGame.SAVE_KEY = "scp-site-director-save-v1";
    SCPGame.AUTOSAVE_KEY = "scp-site-director-autosave-v1";
    SCPGame.ROLE_LABELS = {
        director: "Direction",
        researcher: "Recherche",
        guard: "Sécurité",
        engineer: "Ingénierie",
        medic: "Médical",
        logistics: "Logistique",
        admin: "Administration",
        mtf: "FTM"
    };
    SCPGame.RESOURCE_LABELS = {
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
    SCPGame.REGION_FACILITY_DEFINITIONS = [
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
    SCPGame.SURFACE_ROOM_DEFINITIONS = [
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
    SCPGame.UNDERGROUND_ROOM_DEFINITIONS = [
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
    SCPGame.SCP_DEFINITIONS = [
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
    SCPGame.RESEARCH_NODE_TEMPLATES = [
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
    SCPGame.EVENT_TEMPLATES = [
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
    SCPGame.CAMPAIGN_TEMPLATE = [
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
    SCPGame.STAFF_FIRST_NAMES = [
        "Ariane", "Maya", "Lina", "Camille", "Nora", "Élise", "Sofia", "Manon", "Inès", "Clara",
        "Victor", "Elias", "Noé", "Adam", "Lucas", "Hugo", "Mathis", "Louis", "Nolan", "Arthur",
        "Samira", "Yuna", "Roxane", "Naomi", "Jade", "Maëlle", "Sarah", "Léa", "Eva", "Lou",
        "Malik", "Yanis", "Rayan", "Jules", "Simon", "Théo", "Nils", "Alex", "Sacha", "Milo"
    ];
    SCPGame.STAFF_LAST_NAMES = [
        "Moreau", "Vidal", "Mercier", "Fournier", "Roux", "Lambert", "Dubois", "Perrin", "Garnier", "Faure",
        "Nguyen", "Martin", "Bernard", "Petit", "Leroy", "Muller", "Fontaine", "Blanc", "Giraud", "Henry",
        "Keller", "Lopez", "Dumas", "Renard", "Collet", "Marchand", "Barbier", "Lacroix", "Bailly", "Caron"
    ];
    SCPGame.STAFF_TRAITS = [
        "Méthodique", "Courageux", "Curieux", "Empathique", "Paranoïaque", "Calme", "Autoritaire", "Ambitieux",
        "Distrait", "Endurant", "Loyal", "Sceptique", "Rigoureux", "Improvisateur", "Insomniaque", "Diplomate"
    ];
    function getRegionDefinition(type) {
        const result = SCPGame.REGION_FACILITY_DEFINITIONS.find((entry) => entry.type === type);
        if (!result)
            throw new Error(`Définition régionale inconnue: ${type}`);
        return result;
    }
    SCPGame.getRegionDefinition = getRegionDefinition;
    function getSurfaceDefinition(type) {
        const result = SCPGame.SURFACE_ROOM_DEFINITIONS.find((entry) => entry.type === type);
        if (!result)
            throw new Error(`Définition de surface inconnue: ${type}`);
        return result;
    }
    SCPGame.getSurfaceDefinition = getSurfaceDefinition;
    function getUndergroundDefinition(type) {
        const result = SCPGame.UNDERGROUND_ROOM_DEFINITIONS.find((entry) => entry.type === type);
        if (!result)
            throw new Error(`Définition souterraine inconnue: ${type}`);
        return result;
    }
    SCPGame.getUndergroundDefinition = getUndergroundDefinition;
    function getSCPDefinition(id) {
        const result = SCPGame.SCP_DEFINITIONS.find((entry) => entry.id === id);
        if (!result)
            throw new Error(`SCP inconnu: ${id}`);
        return result;
    }
    SCPGame.getSCPDefinition = getSCPDefinition;
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    class SeededRandom {
        constructor(seed) {
            this.value = seed >>> 0;
        }
        next() {
            this.value += 0x6d2b79f5;
            let t = this.value;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
        int(min, max) {
            return Math.floor(this.next() * (max - min + 1)) + min;
        }
        pick(items) {
            return items[this.int(0, items.length - 1)];
        }
        chance(probability) {
            return this.next() < probability;
        }
    }
    SCPGame.SeededRandom = SeededRandom;
    let idCounter = 0;
    function uid(prefix = "id") {
        idCounter += 1;
        return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
    }
    SCPGame.uid = uid;
    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
    SCPGame.clamp = clamp;
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }
    SCPGame.lerp = lerp;
    function round(value, digits = 0) {
        const factor = 10 ** digits;
        return Math.round(value * factor) / factor;
    }
    SCPGame.round = round;
    function formatNumber(value) {
        if (Math.abs(value) >= 1000000)
            return `${round(value / 1000000, 1)} M`;
        if (Math.abs(value) >= 1000)
            return `${round(value / 1000, 1)} k`;
        return Math.round(value).toLocaleString("fr-FR");
    }
    SCPGame.formatNumber = formatNumber;
    function formatTime(day, minuteOfDay) {
        const hour = Math.floor(minuteOfDay / 60);
        const minute = Math.floor(minuteOfDay % 60);
        return `J${day} · ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
    SCPGame.formatTime = formatTime;
    function getDifficultyMultiplier(difficulty) {
        switch (difficulty) {
            case "story": return 0.72;
            case "standard": return 1;
            case "director": return 1.28;
            case "keter": return 1.6;
        }
    }
    SCPGame.getDifficultyMultiplier = getDifficultyMultiplier;
    function canAfford(resources, cost) {
        return Object.entries(cost).every(([key, amount]) => {
            if (!amount)
                return true;
            const resourceKey = key;
            const available = getResource(resources, resourceKey);
            return available >= amount;
        });
    }
    SCPGame.canAfford = canAfford;
    function payCost(resources, cost) {
        if (!canAfford(resources, cost))
            return false;
        Object.entries(cost).forEach(([key, amount]) => {
            if (!amount)
                return;
            addResource(resources, key, -amount);
        });
        return true;
    }
    SCPGame.payCost = payCost;
    function addCost(resources, cost) {
        Object.entries(cost).forEach(([key, amount]) => {
            if (!amount)
                return;
            addResource(resources, key, amount);
        });
    }
    SCPGame.addCost = addCost;
    function getResource(resources, key) {
        switch (key) {
            case "funds": return resources.funds;
            case "power": return resources.power;
            case "water": return resources.water;
            case "food": return resources.food;
            case "medical": return resources.medical;
            case "parts": return resources.parts;
            case "chemicals": return resources.chemicals;
            case "ammo": return resources.ammo;
            case "intel": return resources.intel;
            case "research": return resources.research;
        }
    }
    SCPGame.getResource = getResource;
    function addResource(resources, key, amount) {
        switch (key) {
            case "funds":
                resources.funds = Math.max(0, resources.funds + amount);
                break;
            case "power":
                resources.power = clamp(resources.power + amount, 0, resources.powerCapacity);
                break;
            case "water":
                resources.water = clamp(resources.water + amount, 0, resources.waterCapacity);
                break;
            case "food":
                resources.food = Math.max(0, resources.food + amount);
                break;
            case "medical":
                resources.medical = Math.max(0, resources.medical + amount);
                break;
            case "parts":
                resources.parts = Math.max(0, resources.parts + amount);
                break;
            case "chemicals":
                resources.chemicals = Math.max(0, resources.chemicals + amount);
                break;
            case "ammo":
                resources.ammo = Math.max(0, resources.ammo + amount);
                break;
            case "intel":
                resources.intel = Math.max(0, resources.intel + amount);
                break;
            case "research":
                resources.research = Math.max(0, resources.research + amount);
                break;
        }
    }
    SCPGame.addResource = addResource;
    function costToString(cost) {
        return Object.entries(cost)
            .filter(([, amount]) => Boolean(amount))
            .map(([key, amount]) => `${SCPGame.RESOURCE_LABELS[key]} ${formatNumber(amount)}`)
            .join(" · ");
    }
    SCPGame.costToString = costToString;
    function pointInRect(point, x, y, width, height) {
        return point.x >= x && point.x < x + width && point.y >= y && point.y < y + height;
    }
    SCPGame.pointInRect = pointInRect;
    function rectanglesOverlap(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }
    SCPGame.rectanglesOverlap = rectanglesOverlap;
    function undergroundOverlap(a, b) {
        return a.level === b.level && a.x < b.x + b.width && a.x + a.width > b.x;
    }
    SCPGame.undergroundOverlap = undergroundOverlap;
    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }
    SCPGame.deepClone = deepClone;
    function choiceWeighted(rng, entries) {
        if (entries.length === 0)
            return undefined;
        const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = rng.next() * total;
        for (const entry of entries) {
            roll -= entry.weight;
            if (roll <= 0)
                return entry;
        }
        return entries[entries.length - 1];
    }
    SCPGame.choiceWeighted = choiceWeighted;
    function getManhattanPath(start, target, width, height, blocked) {
        const queue = [start];
        const cameFrom = new Map();
        const startKey = `${start.x},${start.y}`;
        const targetKey = `${target.x},${target.y}`;
        cameFrom.set(startKey, "");
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        while (queue.length > 0) {
            const current = queue.shift();
            const currentKey = `${current.x},${current.y}`;
            if (currentKey === targetKey)
                break;
            for (const direction of directions) {
                const next = { x: current.x + direction.x, y: current.y + direction.y };
                const key = `${next.x},${next.y}`;
                if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height)
                    continue;
                if (blocked?.has(key) && key !== targetKey)
                    continue;
                if (cameFrom.has(key))
                    continue;
                cameFrom.set(key, currentKey);
                queue.push(next);
            }
        }
        if (!cameFrom.has(targetKey))
            return [];
        const result = [];
        let currentKey = targetKey;
        while (currentKey && currentKey !== startKey) {
            const [x, y] = currentKey.split(",").map(Number);
            result.push({ x, y });
            currentKey = cameFrom.get(currentKey) ?? "";
        }
        result.reverse();
        return result;
    }
    SCPGame.getManhattanPath = getManhattanPath;
    function sanitizeText(value) {
        return value.replace(/[<>]/g, "").slice(0, 600);
    }
    SCPGame.sanitizeText = sanitizeText;
    function downloadText(filename, content, type = "application/json") {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }
    SCPGame.downloadText = downloadText;
    function roleColor(role) {
        switch (role) {
            case "director": return "#f2d27a";
            case "researcher": return "#70b7ff";
            case "guard": return "#ff8a7a";
            case "engineer": return "#ffb65c";
            case "medic": return "#7ce2b0";
            case "logistics": return "#c6a0ff";
            case "admin": return "#d4d7dc";
            case "mtf": return "#f35d7c";
        }
    }
    SCPGame.roleColor = roleColor;
    function objectClassColor(objectClass) {
        switch (objectClass) {
            case "Safe": return "#6fd18b";
            case "Euclid": return "#f1ca64";
            case "Keter": return "#f06666";
            case "Thaumiel": return "#6fa8ff";
            case "Neutralized": return "#a0a4aa";
        }
    }
    SCPGame.objectClassColor = objectClassColor;
    function severityColor(severity) {
        switch (severity) {
            case "info": return "#6fa8ff";
            case "minor": return "#d7c56f";
            case "major": return "#f1a45b";
            case "critical": return "#f06666";
        }
    }
    SCPGame.severityColor = severityColor;
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    const CONTAINMENT_ROOM_TAGS = ["safe", "euclid", "keter", "humanoid", "bio", "infohazard", "heavy", "temporal"];
    const LOAD_SCHEMA_VERSION = 2;
    const PROCEDURE_OPTION_UNLOCKS = {
        backupPower: "backup-power",
        analogBackup: "analog-backup",
        biometricMonitoring: "biometric-monitoring",
        automatedLockdown: "automated-lockdown",
        humaneCare: "humane-care",
        isolatedNetwork: "isolated-network",
        redundantVentilation: "biological-control"
    };
    function createEmptyCrisis() {
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
    SCPGame.createEmptyCrisis = createEmptyCrisis;
    function createDefaultProcedure(scpId) {
        const definition = SCPGame.getSCPDefinition(scpId);
        const isEarlySafe = definition.objectClass === "Safe" && definition.risk <= 4;
        return {
            id: SCPGame.uid("proc"),
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
    SCPGame.createDefaultProcedure = createDefaultProcedure;
    function baseSkillsForRole(role, rng) {
        const base = {
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
            case "director":
                base.administration += boost;
                base.security += 18;
                base.research += 15;
                break;
            case "researcher":
                base.research += boost;
                base.memetics += rng.int(10, 28);
                break;
            case "guard":
                base.security += boost;
                base.engineering += 8;
                break;
            case "engineer":
                base.engineering += boost;
                base.logistics += 12;
                break;
            case "medic":
                base.medicine += boost;
                base.research += 10;
                break;
            case "logistics":
                base.logistics += boost;
                base.engineering += 8;
                break;
            case "admin":
                base.administration += boost;
                base.logistics += 10;
                break;
            case "mtf":
                base.security += boost + 12;
                base.medicine += 8;
                base.engineering += 8;
                break;
        }
        Object.keys(base).forEach((key) => {
            base[key] = SCPGame.clamp(base[key], 0, 100);
        });
        return base;
    }
    function createStaffMember(role, rng, index = 0) {
        const salaryBase = {
            director: 520,
            researcher: 290,
            guard: 230,
            engineer: 270,
            medic: 285,
            logistics: 205,
            admin: 215,
            mtf: 380
        };
        const traits = [rng.pick(SCPGame.STAFF_TRAITS)];
        if (rng.chance(0.28)) {
            const second = rng.pick(SCPGame.STAFF_TRAITS.filter((trait) => trait !== traits[0]));
            traits.push(second);
        }
        const clearanceBase = {
            director: 4,
            researcher: 2,
            guard: 2,
            engineer: 1,
            medic: 2,
            logistics: 1,
            admin: 2,
            mtf: 3
        };
        const clearance = SCPGame.clamp(clearanceBase[role] + (rng.chance(0.22) ? 1 : 0), 0, 5);
        return {
            id: SCPGame.uid("staff"),
            name: `${rng.pick(SCPGame.STAFF_FIRST_NAMES)} ${rng.pick(SCPGame.STAFF_LAST_NAMES)}`,
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
    SCPGame.createStaffMember = createStaffMember;
    function createFacility(type, x, y) {
        const definition = SCPGame.getRegionDefinition(type);
        return {
            id: SCPGame.uid("facility"),
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
    function createSurfaceRoom(type, x, y, width, height) {
        const definition = SCPGame.getSurfaceDefinition(type);
        return {
            id: SCPGame.uid("surface"),
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
    function createUndergroundRoom(type, x, level, width) {
        const definition = SCPGame.getUndergroundDefinition(type);
        return {
            id: SCPGame.uid("underground"),
            type,
            x,
            level,
            width: width ?? definition.width,
            condition: 100,
            staffAssigned: [],
            upgrades: [],
            enabled: true,
            powerPriority: definition.tags.includes("keter") || definition.tags.includes("bio") ? 3 : 2,
            sealed: false
        };
    }
    function createInitialFacilities() {
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
    function createInitialSurfaceRooms() {
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
    function createInitialUndergroundRooms() {
        return [
            createUndergroundRoom("elevator-shaft", 18, 0, 1),
            createUndergroundRoom("elevator-shaft", 18, 1, 1),
            createUndergroundRoom("elevator-shaft", 18, 2, 1),
            createUndergroundRoom("service-tunnel", 8, 0, 5),
            createUndergroundRoom("security-post", 14, 0, 2),
            createUndergroundRoom("safe-containment", 2, 0, 3),
            createUndergroundRoom("euclid-containment", 4, 1, 3),
            createUndergroundRoom("research-lab", 10, 1, 3),
            createUndergroundRoom("power-node", 14, 1, 2),
            createUndergroundRoom("air-filtration", 14, 2, 2)
        ];
    }
    function createInitialStaff(seed) {
        const rng = new SCPGame.SeededRandom(seed + 77);
        const roles = [
            "director", "admin", "admin", "researcher", "researcher", "researcher",
            "guard", "guard", "guard", "guard", "engineer", "engineer", "medic", "medic", "logistics", "logistics"
        ];
        return roles.map((role, index) => createStaffMember(role, rng, index));
    }
    function createInitialScps(currentChapter = 0) {
        return SCPGame.SCP_DEFINITIONS.map((definition) => {
            const discovered = definition.unlockedAt <= currentChapter;
            return {
                id: SCPGame.uid("scp-instance"),
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
    function createNewGame(mode, difficulty, seed = Date.now() % 2147483647) {
        const difficultyMultiplier = SCPGame.getDifficultyMultiplier(difficulty);
        const scps = createInitialScps(mode === "sandbox" ? 5 : 0);
        const procedures = scps.map((scp) => createDefaultProcedure(scp.definitionId));
        scps.forEach((scp) => {
            const procedure = procedures.find((candidate) => candidate.scpId === scp.definitionId);
            scp.procedureId = procedure?.id ?? "";
        });
        const state = {
            version: SCPGame.GAME_VERSION,
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
                funds: Math.round(72000 / difficultyMultiplier),
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
            researchNodes: SCPGame.RESEARCH_NODE_TEMPLATES.map((node) => ({ ...SCPGame.deepClone(node), completed: mode === "sandbox" })),
            events: [],
            crisis: createEmptyCrisis(),
            campaign: SCPGame.deepClone(SCPGame.CAMPAIGN_TEMPLATE),
            currentChapter: mode === "sandbox" ? 5 : 0,
            notifications: [],
            history: [],
            flags: {
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
        autoAssignStaff(state);
        logHistory(state, "Prise de commandement du Site Deep Protocol.");
        addNotification(state, "Bienvenue, Directeur", "Stabilisez la couverture, organisez la surface et préparez les premiers confinements.", "info");
        return state;
    }
    SCPGame.createNewGame = createNewGame;
    function getUnlockTier(state) {
        if (state.mode === "sandbox")
            return 99;
        return state.currentChapter;
    }
    SCPGame.getUnlockTier = getUnlockTier;
    function isResearchUnlockActive(state, unlock) {
        return state.researchNodes.some((node) => node.completed && node.unlocks.includes(unlock));
    }
    SCPGame.isResearchUnlockActive = isResearchUnlockActive;
    function getProcedureOptionUnlock(key) {
        return PROCEDURE_OPTION_UNLOCKS[key];
    }
    SCPGame.getProcedureOptionUnlock = getProcedureOptionUnlock;
    function isProcedureOptionUnlocked(state, key) {
        const unlock = getProcedureOptionUnlock(key);
        return !unlock || isResearchUnlockActive(state, unlock);
    }
    SCPGame.isProcedureOptionUnlocked = isProcedureOptionUnlocked;
    function isRegionDefinitionUnlocked(state, definition) {
        return definition.unlockedAt <= getUnlockTier(state);
    }
    SCPGame.isRegionDefinitionUnlocked = isRegionDefinitionUnlocked;
    function isSurfaceDefinitionUnlocked(state, definition) {
        if (definition.unlockedAt > getUnlockTier(state))
            return false;
        if (definition.type === "mtf-bay")
            return state.mode === "sandbox" || isResearchUnlockActive(state, "mtf-bay") || state.currentChapter >= 3;
        return true;
    }
    SCPGame.isSurfaceDefinitionUnlocked = isSurfaceDefinitionUnlocked;
    function isUndergroundDefinitionUnlocked(state, definition) {
        if (definition.unlockedAt > getUnlockTier(state))
            return false;
        const researchGate = {
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
        if (!unlock)
            return true;
        return state.mode === "sandbox" || isResearchUnlockActive(state, unlock) || state.currentChapter >= definition.unlockedAt + 1;
    }
    SCPGame.isUndergroundDefinitionUnlocked = isUndergroundDefinitionUnlocked;
    function logHistory(state, message) {
        state.history.unshift(`${SCPGame.formatTime(state.day, state.minuteOfDay)} — ${message}`);
        if (state.history.length > 180)
            state.history.length = 180;
    }
    SCPGame.logHistory = logHistory;
    function addNotification(state, title, message, severity = "info") {
        state.notifications.unshift({
            id: SCPGame.uid("note"),
            time: state.elapsedMinutes,
            title,
            message,
            severity,
            read: false
        });
        if (state.notifications.length > 60)
            state.notifications.length = 60;
    }
    SCPGame.addNotification = addNotification;
    function setView(state, view) {
        state.view = view;
        state.buildSelection = undefined;
        state.selectedId = undefined;
        state.selectedType = undefined;
    }
    SCPGame.setView = setView;
    function setSpeed(state, speed) {
        if (state.crisis.active && speed === 4)
            speed = 2;
        if (speed > 0)
            state.previousSpeed = speed;
        state.speed = speed;
    }
    SCPGame.setSpeed = setSpeed;
    function togglePause(state) {
        state.speed = state.speed === 0 ? (state.previousSpeed || 1) : 0;
    }
    SCPGame.togglePause = togglePause;
    function startBuild(state, layer, type) {
        state.buildSelection = { layer, type, rotation: 0 };
        state.selectedId = undefined;
        state.selectedType = undefined;
    }
    SCPGame.startBuild = startBuild;
    function cancelBuild(state) {
        state.buildSelection = undefined;
    }
    SCPGame.cancelBuild = cancelBuild;
    function buildRegionFacility(state, type, x, y) {
        const definition = SCPGame.getRegionDefinition(type);
        if (!isRegionDefinitionUnlocked(state, definition))
            return { ok: false, message: "Installation non autorisée à ce stade." };
        if (x < 0 || y < 0 || x + definition.size.x > state.regionWidth || y + definition.size.y > state.regionHeight)
            return { ok: false, message: "Construction hors de la carte." };
        const candidate = { x, y, width: definition.size.x, height: definition.size.y };
        if (state.regionFacilities.some((facility) => SCPGame.rectanglesOverlap(candidate, facility)))
            return { ok: false, message: "La zone est déjà occupée." };
        if (!SCPGame.payCost(state.resources, definition.cost))
            return { ok: false, message: "Ressources insuffisantes." };
        const facility = createFacility(type, x, y);
        state.regionFacilities.push(facility);
        state.selectedId = facility.id;
        state.selectedType = "facility";
        state.reputation.cover = SCPGame.clamp(state.reputation.cover + (definition.coverImpact ?? 0), 0, 100);
        state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion + (definition.suspicionImpact ?? 0), 0, 100);
        logHistory(state, `${definition.name} construit dans la région.`);
        return { ok: true, message: `${definition.name} opérationnel.` };
    }
    SCPGame.buildRegionFacility = buildRegionFacility;
    function buildSurfaceRoom(state, type, x, y) {
        const definition = SCPGame.getSurfaceDefinition(type);
        if (!isSurfaceDefinitionUnlocked(state, definition))
            return { ok: false, message: "Salle non autorisée ou recherche manquante." };
        const width = definition.minSize.x;
        const height = definition.minSize.y;
        if (x < 0 || y < 0 || x + width > state.surfaceWidth || y + height > state.surfaceHeight)
            return { ok: false, message: "Construction hors du complexe." };
        const candidate = { x, y, width, height };
        if (state.surfaceRooms.some((room) => SCPGame.rectanglesOverlap(candidate, room)))
            return { ok: false, message: "La zone est déjà occupée." };
        if (!SCPGame.payCost(state.resources, definition.cost))
            return { ok: false, message: "Ressources insuffisantes." };
        const room = createSurfaceRoom(type, x, y);
        state.surfaceRooms.push(room);
        state.selectedId = room.id;
        state.selectedType = "surface-room";
        autoAssignStaff(state);
        logHistory(state, `${definition.name} aménagé à la surface.`);
        return { ok: true, message: `${definition.name} prêt à être utilisé.` };
    }
    SCPGame.buildSurfaceRoom = buildSurfaceRoom;
    function buildUndergroundRoom(state, type, x, level) {
        const definition = SCPGame.getUndergroundDefinition(type);
        if (!isUndergroundDefinitionUnlocked(state, definition))
            return { ok: false, message: "Module non autorisé ou recherche manquante." };
        if (level < 0 || level >= state.undergroundLevels || x < 0 || x + definition.width > state.undergroundWidth)
            return { ok: false, message: "Construction hors des limites géologiques." };
        if (level >= 5 && !isResearchUnlockActive(state, "level-5-plus") && state.mode !== "sandbox")
            return { ok: false, message: "L'excavation profonde n'est pas encore maîtrisée." };
        const candidate = { x, level, width: definition.width };
        if (state.undergroundRooms.some((room) => SCPGame.undergroundOverlap(candidate, room)))
            return { ok: false, message: "Ce volume est déjà occupé." };
        const depthCostMultiplier = 1 + level * 0.12;
        const scaledCost = {};
        Object.entries(definition.cost).forEach(([key, amount]) => {
            scaledCost[key] = Math.ceil(amount * depthCostMultiplier);
        });
        if (!SCPGame.payCost(state.resources, scaledCost))
            return { ok: false, message: "Ressources insuffisantes pour cette profondeur." };
        const room = createUndergroundRoom(type, x, level);
        state.undergroundRooms.push(room);
        state.selectedId = room.id;
        state.selectedType = "underground-room";
        autoAssignStaff(state);
        logHistory(state, `${definition.name} construit au niveau -${level + 1}.`);
        return { ok: true, message: `${definition.name} opérationnel au niveau -${level + 1}.` };
    }
    SCPGame.buildUndergroundRoom = buildUndergroundRoom;
    function upgradeSelected(state) {
        if (!state.selectedId || !state.selectedType)
            return { ok: false, message: "Aucun élément sélectionné." };
        if (state.selectedType === "facility") {
            const facility = state.regionFacilities.find((entry) => entry.id === state.selectedId);
            if (!facility)
                return { ok: false, message: "Installation introuvable." };
            const cost = { funds: 3000 * facility.level, parts: 5 * facility.level };
            if (!SCPGame.payCost(state.resources, cost))
                return { ok: false, message: "Ressources insuffisantes." };
            facility.level += 1;
            facility.condition = 100;
            return { ok: true, message: `Installation améliorée au niveau ${facility.level}.` };
        }
        if (state.selectedType === "surface-room") {
            const room = state.surfaceRooms.find((entry) => entry.id === state.selectedId);
            if (!room)
                return { ok: false, message: "Salle introuvable." };
            const cost = { funds: 2500 * room.level, parts: 5 * room.level };
            if (!SCPGame.payCost(state.resources, cost))
                return { ok: false, message: "Ressources insuffisantes." };
            room.level += 1;
            room.condition = 100;
            room.cleanliness = 100;
            room.upgrades.push(`Optimisation ${room.level}`);
            return { ok: true, message: `Salle améliorée au niveau ${room.level}.` };
        }
        if (state.selectedType === "underground-room") {
            const room = state.undergroundRooms.find((entry) => entry.id === state.selectedId);
            if (!room)
                return { ok: false, message: "Module introuvable." };
            const cost = { funds: 4000 + room.upgrades.length * 2000, parts: 8 + room.upgrades.length * 3 };
            if (!SCPGame.payCost(state.resources, cost))
                return { ok: false, message: "Ressources insuffisantes." };
            room.condition = 100;
            room.upgrades.push(`Blindage ${room.upgrades.length + 1}`);
            return { ok: true, message: "Blindage et redondance améliorés." };
        }
        return { ok: false, message: "Cet élément ne peut pas être amélioré." };
    }
    SCPGame.upgradeSelected = upgradeSelected;
    function demolishSelected(state) {
        if (!state.selectedId || !state.selectedType)
            return { ok: false, message: "Aucun élément sélectionné." };
        if (state.selectedType === "facility") {
            const index = state.regionFacilities.findIndex((entry) => entry.id === state.selectedId);
            if (index < 0)
                return { ok: false, message: "Installation introuvable." };
            const facility = state.regionFacilities[index];
            const definition = SCPGame.getRegionDefinition(facility.type);
            state.regionFacilities.splice(index, 1);
            SCPGame.addResource(state.resources, "funds", (definition.cost.funds ?? 0) * 0.35);
            SCPGame.addResource(state.resources, "parts", (definition.cost.parts ?? 0) * 0.4);
            state.selectedId = undefined;
            state.selectedType = undefined;
            return { ok: true, message: "Installation démontée et matériaux récupérés." };
        }
        if (state.selectedType === "surface-room") {
            const index = state.surfaceRooms.findIndex((entry) => entry.id === state.selectedId);
            if (index < 0)
                return { ok: false, message: "Salle introuvable." };
            const room = state.surfaceRooms[index];
            if (room.type === "elevator" && state.undergroundRooms.some((entry) => entry.type === "elevator-shaft"))
                return { ok: false, message: "Impossible de retirer l'ascenseur tant que les puits inférieurs existent." };
            const definition = SCPGame.getSurfaceDefinition(room.type);
            state.surfaceRooms.splice(index, 1);
            SCPGame.addResource(state.resources, "funds", (definition.cost.funds ?? 0) * 0.35);
            SCPGame.addResource(state.resources, "parts", (definition.cost.parts ?? 0) * 0.4);
            state.staff.forEach((member) => {
                if (member.assignmentRoomId === room.id)
                    member.assignmentRoomId = undefined;
            });
            state.selectedId = undefined;
            state.selectedType = undefined;
            autoAssignStaff(state);
            return { ok: true, message: "Salle démantelée." };
        }
        if (state.selectedType === "underground-room") {
            const index = state.undergroundRooms.findIndex((entry) => entry.id === state.selectedId);
            if (index < 0)
                return { ok: false, message: "Module introuvable." };
            const room = state.undergroundRooms[index];
            if (room.scpId)
                return { ok: false, message: "Transférez le SCP avant de démanteler sa cellule." };
            const definition = SCPGame.getUndergroundDefinition(room.type);
            state.undergroundRooms.splice(index, 1);
            SCPGame.addResource(state.resources, "funds", (definition.cost.funds ?? 0) * 0.3);
            SCPGame.addResource(state.resources, "parts", (definition.cost.parts ?? 0) * 0.4);
            state.selectedId = undefined;
            state.selectedType = undefined;
            return { ok: true, message: "Module souterrain condamné et récupéré." };
        }
        return { ok: false, message: "Cet élément ne peut pas être démoli." };
    }
    SCPGame.demolishSelected = demolishSelected;
    function repairSelected(state) {
        if (!state.selectedId || !state.selectedType)
            return { ok: false, message: "Aucun élément sélectionné." };
        const target = state.selectedType === "facility"
            ? state.regionFacilities.find((entry) => entry.id === state.selectedId)
            : state.selectedType === "surface-room"
                ? state.surfaceRooms.find((entry) => entry.id === state.selectedId)
                : state.selectedType === "underground-room"
                    ? state.undergroundRooms.find((entry) => entry.id === state.selectedId)
                    : undefined;
        if (!target)
            return { ok: false, message: "Élément introuvable." };
        const cost = { funds: 800, parts: 3 };
        if (!SCPGame.payCost(state.resources, cost))
            return { ok: false, message: "Ressources insuffisantes." };
        if (state.selectedType === "facility") {
            target.condition = 100;
        }
        else if (state.selectedType === "surface-room") {
            target.condition = 100;
            target.cleanliness = 100;
        }
        else if (state.selectedType === "underground-room") {
            target.condition = 100;
        }
        return { ok: true, message: "Maintenance corrective terminée." };
    }
    SCPGame.repairSelected = repairSelected;
    function hireStaff(state, role) {
        const hireCost = {
            director: 6000,
            researcher: 2200,
            guard: 1800,
            engineer: 2100,
            medic: 2300,
            logistics: 1600,
            admin: 1700,
            mtf: 4200
        };
        if (role === "director" && state.staff.some((member) => member.role === "director" && member.status !== "dead"))
            return { ok: false, message: "Le Site possède déjà un directeur actif." };
        if (role === "mtf" && state.mode !== "sandbox" && state.currentChapter < 3 && !isResearchUnlockActive(state, "mtf-bay"))
            return { ok: false, message: "Recrutement FTM non autorisé." };
        if (state.resources.funds < hireCost[role])
            return { ok: false, message: "Crédits insuffisants." };
        state.resources.funds -= hireCost[role];
        const rng = new SCPGame.SeededRandom(state.seed + state.staff.length * 971 + state.elapsedMinutes);
        const member = createStaffMember(role, rng, state.staff.length);
        state.staff.push(member);
        autoAssignStaff(state);
        logHistory(state, `${member.name} rejoint le Site comme ${SCPGame.ROLE_LABELS[role]}.`);
        return { ok: true, message: `${member.name} recruté.` };
    }
    SCPGame.hireStaff = hireStaff;
    function dismissStaff(state, staffId) {
        const index = state.staff.findIndex((member) => member.id === staffId);
        if (index < 0)
            return { ok: false, message: "Personnel introuvable." };
        const member = state.staff[index];
        if (member.role === "director")
            return { ok: false, message: "Le directeur ne peut pas se renvoyer lui-même." };
        state.staff.splice(index, 1);
        state.surfaceRooms.forEach((room) => room.staffAssigned = room.staffAssigned.filter((id) => id !== staffId));
        state.undergroundRooms.forEach((room) => room.staffAssigned = room.staffAssigned.filter((id) => id !== staffId));
        state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - 1, 0, 100);
        return { ok: true, message: `${member.name} a quitté le Site.` };
    }
    SCPGame.dismissStaff = dismissStaff;
    function autoAssignStaff(state) {
        state.surfaceRooms.forEach((room) => room.staffAssigned = []);
        state.undergroundRooms.forEach((room) => room.staffAssigned = []);
        const unavailable = ["dead", "quarantined", "injured", "training"];
        const available = state.staff.filter((member) => !unavailable.includes(member.status));
        const assigned = new Set();
        const assignRole = (roomId, role, count, underground = false) => {
            const candidates = available
                .filter((member) => member.role === role && !assigned.has(member.id))
                .sort((a, b) => b.experience - a.experience);
            const selected = candidates.slice(0, count);
            selected.forEach((member) => {
                assigned.add(member.id);
                member.assignmentRoomId = roomId;
                if (underground) {
                    const room = state.undergroundRooms.find((entry) => entry.id === roomId);
                    room?.staffAssigned.push(member.id);
                }
                else {
                    const room = state.surfaceRooms.find((entry) => entry.id === roomId);
                    room?.staffAssigned.push(member.id);
                }
            });
        };
        state.surfaceRooms
            .filter((room) => room.enabled)
            .sort((a, b) => SCPGame.getSurfaceDefinition(b.type).security - SCPGame.getSurfaceDefinition(a.type).security)
            .forEach((room) => {
            const definition = SCPGame.getSurfaceDefinition(room.type);
            Object.entries(definition.requiredRoles).forEach(([role, count]) => assignRole(room.id, role, count ?? 0, false));
        });
        state.undergroundRooms
            .filter((room) => room.enabled && room.scpId)
            .forEach((room) => {
            const scp = state.scps.find((entry) => entry.id === room.scpId);
            if (!scp)
                return;
            const definition = SCPGame.getSCPDefinition(scp.definitionId);
            Object.entries(definition.requirements.staff).forEach(([role, count]) => assignRole(room.id, role, count ?? 0, true));
        });
        available.filter((member) => !assigned.has(member.id)).forEach((member) => {
            member.assignmentRoomId = undefined;
        });
    }
    SCPGame.autoAssignStaff = autoAssignStaff;
    function trainStaff(state, staffId) {
        const member = state.staff.find((entry) => entry.id === staffId);
        if (!member)
            return { ok: false, message: "Personnel introuvable." };
        if (["dead", "quarantined", "injured", "training"].includes(member.status))
            return { ok: false, message: "Ce membre n'est pas disponible pour une formation." };
        const trainingRoom = state.surfaceRooms.find((room) => room.type === "training" && room.enabled);
        const briefingRoom = state.surfaceRooms.find((room) => room.type === "briefing" && room.enabled);
        if (!trainingRoom && !briefingRoom)
            return { ok: false, message: "Construisez un centre de formation ou une salle de briefing." };
        const cost = { funds: 900, intel: 1 };
        if (!SCPGame.payCost(state.resources, cost))
            return { ok: false, message: "Ressources insuffisantes." };
        member.status = "training";
        member.taskProgress = 0;
        member.targetRoomId = trainingRoom?.id ?? briefingRoom?.id;
        autoAssignStaff(state);
        return { ok: true, message: `${member.name} suit une formation spécialisée.` };
    }
    SCPGame.trainStaff = trainStaff;
    function setStaffShift(state, staffId, shift) {
        const member = state.staff.find((entry) => entry.id === staffId);
        if (!member)
            return { ok: false, message: "Personnel introuvable." };
        if (member.role === "director")
            return { ok: false, message: "Le directeur conserve une astreinte permanente." };
        member.shift = shift;
        member.needs.stress = SCPGame.clamp(member.needs.stress + 2, 0, 100);
        autoAssignStaff(state);
        return { ok: true, message: `${member.name} passe en équipe de ${shift === "day" ? "jour" : "nuit"}.` };
    }
    SCPGame.setStaffShift = setStaffShift;
    function vetStaff(state, staffId) {
        const member = state.staff.find((entry) => entry.id === staffId);
        if (!member)
            return { ok: false, message: "Personnel introuvable." };
        const cost = { funds: 700, intel: 1 };
        if (!SCPGame.payCost(state.resources, cost))
            return { ok: false, message: "Ressources insuffisantes." };
        const threatNeutralized = member.compromised;
        member.loyalty = SCPGame.clamp(member.loyalty + 8, 0, 100);
        member.compromised = false;
        member.needs.stress = SCPGame.clamp(member.needs.stress + 4, 0, 100);
        state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - 0.4, 0, 100);
        if (threatNeutralized) {
            state.resources.intel += 4;
            state.reputation.command = SCPGame.clamp(state.reputation.command + 2, 0, 100);
            state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion - 2, 0, 100);
            addNotification(state, "Menace interne neutralisée", `${member.name} a été isolé du réseau opérationnel puis revalidé.`, "major");
            logHistory(state, `Contrôle de sécurité : compromission de ${member.name} neutralisée.`);
            return { ok: true, message: `Compromission détectée et neutralisée chez ${member.name}.` };
        }
        logHistory(state, `Contrôle de sécurité préventif terminé pour ${member.name}.`);
        return { ok: true, message: `${member.name} a été revalidé, aucun indicateur hostile.` };
    }
    SCPGame.vetStaff = vetStaff;
    function researchNode(state, nodeId) {
        const node = state.researchNodes.find((entry) => entry.id === nodeId);
        if (!node)
            return { ok: false, message: "Recherche introuvable." };
        if (node.completed)
            return { ok: false, message: "Recherche déjà achevée." };
        if (!node.prerequisites.every((id) => state.researchNodes.some((entry) => entry.id === id && entry.completed)))
            return { ok: false, message: "Prérequis manquants." };
        if (state.resources.research < node.cost)
            return { ok: false, message: "Points de recherche insuffisants." };
        state.resources.research -= node.cost;
        node.completed = true;
        addNotification(state, "Recherche terminée", `${node.name} est maintenant disponible.`, "info");
        logHistory(state, `Recherche achevée : ${node.name}.`);
        return { ok: true, message: `${node.name} déverrouillé.` };
    }
    SCPGame.researchNode = researchNode;
    function updateProcedure(state, scpId, updates) {
        const scp = state.scps.find((entry) => entry.id === scpId || entry.definitionId === scpId);
        if (!scp)
            return { ok: false, message: "SCP introuvable." };
        const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
        if (!procedure)
            return { ok: false, message: "Procédure introuvable." };
        const definition = SCPGame.getSCPDefinition(scp.definitionId);
        const requiredStaff = Object.values(definition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0);
        const minimumTraining = SCPGame.clamp(18 + definition.risk * 4, 20, 78);
        const booleanKeys = ["backupPower", "analogBackup", "biometricMonitoring", "opticalMonitoring", "automatedLockdown", "humaneCare", "restrictedTesting", "isolatedNetwork", "redundantVentilation"];
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
        if (Number.isFinite(observation))
            procedure.observationLevel = SCPGame.clamp(Math.round(observation), 0, 100);
        if (Number.isFinite(assigned))
            procedure.assignedStaff = SCPGame.clamp(Math.round(assigned), requiredStaff, Math.min(18, requiredStaff + 3));
        if (Number.isFinite(maintenance))
            procedure.maintenanceFrequency = SCPGame.clamp(Math.round(maintenance), 20, 100);
        if (Number.isFinite(training))
            procedure.trainingRequired = SCPGame.clamp(Math.round(training), minimumTraining, 100);
        booleanKeys.forEach((key) => {
            if (typeof updates[key] === "boolean")
                procedure[key] = Boolean(updates[key]);
        });
        if (typeof updates.notes === "string")
            procedure.notes = updates.notes;
        const enabledOptions = booleanKeys.filter((key) => Boolean(procedure[key])).length;
        procedure.complexity = SCPGame.clamp(Math.round(24 + definition.risk * 3.2 + enabledOptions * 3 + procedure.observationLevel * 0.08 + procedure.maintenanceFrequency * 0.05), 25, 100);
        procedure.version += 1;
        procedure.notes = SCPGame.sanitizeText(procedure.notes);
        logHistory(state, `Procédure ${SCPGame.getSCPDefinition(scp.definitionId).designation} révisée en version ${procedure.version}.`);
        return { ok: true, message: `Procédure v${procedure.version} enregistrée.` };
    }
    SCPGame.updateProcedure = updateProcedure;
    function getEffectiveRoomContainment(room) {
        return SCPGame.getUndergroundDefinition(room.type).containment + room.upgrades.length;
    }
    SCPGame.getEffectiveRoomContainment = getEffectiveRoomContainment;
    function getEffectiveRoomSecurity(room) {
        return SCPGame.getUndergroundDefinition(room.type).security + room.upgrades.length;
    }
    SCPGame.getEffectiveRoomSecurity = getEffectiveRoomSecurity;
    function getCompatibleRooms(state, scp) {
        const definition = SCPGame.getSCPDefinition(scp.definitionId);
        return state.undergroundRooms.filter((room) => {
            if (room.id === scp.roomId)
                return false;
            if (room.scpId && room.scpId !== scp.id)
                return false;
            const roomDefinition = SCPGame.getUndergroundDefinition(room.type);
            const isContainmentRoom = roomDefinition.tags.some((tag) => CONTAINMENT_ROOM_TAGS.includes(tag));
            const tagMatch = definition.requirements.roomTags.some((tag) => roomDefinition.tags.includes(tag));
            return isContainmentRoom
                && tagMatch
                && getEffectiveRoomContainment(room) >= definition.requirements.minContainment
                && getEffectiveRoomSecurity(room) >= definition.requirements.minSecurity;
        });
    }
    SCPGame.getCompatibleRooms = getCompatibleRooms;
    function transferSCP(state, scpId, roomId) {
        const scp = state.scps.find((entry) => entry.id === scpId || entry.definitionId === scpId);
        if (!scp)
            return { ok: false, message: "Dossier introuvable." };
        if (!scp.discovered)
            return { ok: false, message: "Dossier non autorisé." };
        const definition = SCPGame.getSCPDefinition(scp.definitionId);
        const candidates = getCompatibleRooms(state, scp);
        const room = roomId ? candidates.find((entry) => entry.id === roomId) : candidates[0];
        if (!room)
            return { ok: false, message: `Aucune cellule compatible avec ${definition.designation}.` };
        if (room.id === scp.roomId)
            return { ok: false, message: `${definition.designation} occupe déjà cette cellule.` };
        const wasTransferred = scp.transferred;
        const relocationFactor = wasTransferred ? 0.55 : 1;
        const transferCost = {
            funds: Math.round((1800 + definition.risk * 280) * relocationFactor),
            ammo: Math.max(0, Math.ceil(definition.risk / (wasTransferred ? 5 : 3))),
            medical: Math.max(0, Math.ceil(definition.risk / (wasTransferred ? 8 : 5)))
        };
        if (!SCPGame.payCost(state.resources, transferCost))
            return { ok: false, message: `Ressources insuffisantes pour sécuriser ${wasTransferred ? "la relocalisation" : "le transfert"}.` };
        const previousRisk = scp.breachRisk;
        if (scp.roomId) {
            const previous = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
            if (previous)
                previous.scpId = undefined;
        }
        room.scpId = scp.id;
        scp.roomId = room.id;
        scp.contained = true;
        scp.transferred = true;
        scp.activeEffect = "Confinement en stabilisation";
        scp.breachRisk = wasTransferred ? Math.max(previousRisk, definition.risk * 1.8) : Math.max(8, definition.risk * 1.8);
        autoAssignStaff(state);
        addNotification(state, `${definition.designation} transféré`, `${definition.name} est maintenant au niveau -${room.level + 1}.`, definition.objectClass === "Keter" ? "major" : "info");
        logHistory(state, `${definition.designation} transféré vers ${SCPGame.getUndergroundDefinition(room.type).name}.`);
        return { ok: true, message: `${definition.designation} confiné au niveau -${room.level + 1}.` };
    }
    SCPGame.transferSCP = transferSCP;
    function saveGame(state, autosave = false) {
        try {
            state.savedAt = Date.now();
            const serialized = JSON.stringify(state);
            localStorage.setItem(autosave ? SCPGame.AUTOSAVE_KEY : SCPGame.SAVE_KEY, serialized);
            state.lastAutosave = state.elapsedMinutes;
            return true;
        }
        catch (error) {
            console.error("Échec de sauvegarde", error);
            return false;
        }
    }
    SCPGame.saveGame = saveGame;
    function loadGame(autosave = false) {
        try {
            const raw = localStorage.getItem(autosave ? SCPGame.AUTOSAVE_KEY : SCPGame.SAVE_KEY);
            if (!raw)
                return undefined;
            return normalizeLoadedState(JSON.parse(raw));
        }
        catch (error) {
            console.error("Échec de chargement", error);
            return undefined;
        }
    }
    SCPGame.loadGame = loadGame;
    function loadLatestGame() {
        const manual = loadGame(false);
        const auto = loadGame(true);
        if (!manual)
            return auto;
        if (!auto)
            return manual;
        return (auto.savedAt || 0) > (manual.savedAt || 0) ? auto : manual;
    }
    SCPGame.loadLatestGame = loadLatestGame;
    function hasSavedGame() {
        try {
            return Boolean(localStorage.getItem(SCPGame.SAVE_KEY) || localStorage.getItem(SCPGame.AUTOSAVE_KEY));
        }
        catch (error) {
            console.warn("Stockage local indisponible", error);
            return false;
        }
    }
    SCPGame.hasSavedGame = hasSavedGame;
    function exportSave(state) {
        SCPGame.downloadText(`scp-site-director-J${state.day}.json`, JSON.stringify(state, null, 2));
    }
    SCPGame.exportSave = exportSave;
    function importSave(raw) {
        try {
            if (raw.length > 4000000)
                throw new Error("Sauvegarde trop volumineuse");
            return normalizeLoadedState(JSON.parse(raw));
        }
        catch (error) {
            console.error(error);
            return undefined;
        }
    }
    SCPGame.importSave = importSave;
    function continueAfterVictory(state) {
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
    SCPGame.continueAfterVictory = continueAfterVictory;
    function normalizeLoadedState(candidate) {
        if (!candidate || typeof candidate !== "object")
            return undefined;
        const raw = candidate;
        if (typeof raw.version !== "string")
            return undefined;
        const mode = raw.mode === "sandbox" ? "sandbox" : "campaign";
        const difficulty = ["story", "standard", "director", "keter"].includes(String(raw.settings?.difficulty)) ? raw.settings.difficulty : "standard";
        const seed = Number.isFinite(raw.seed) ? Number(raw.seed) : Date.now();
        const defaults = createNewGame(mode, difficulty, seed);
        const objectValue = (value, fallback) => value && typeof value === "object" && !Array.isArray(value) ? { ...fallback, ...value } : fallback;
        const arrayValue = (value, fallback) => Array.isArray(value) && value.every((entry) => entry && typeof entry === "object") ? value : fallback;
        const state = {
            ...defaults,
            ...raw,
            version: SCPGame.GAME_VERSION,
            seed,
            mode,
            settings: objectValue(raw.settings, defaults.settings),
            resources: objectValue(raw.resources, defaults.resources),
            reputation: objectValue(raw.reputation, defaults.reputation),
            regionFacilities: arrayValue(raw.regionFacilities, defaults.regionFacilities),
            surfaceRooms: arrayValue(raw.surfaceRooms, defaults.surfaceRooms),
            undergroundRooms: arrayValue(raw.undergroundRooms, defaults.undergroundRooms),
            staff: arrayValue(raw.staff, defaults.staff),
            workItems: arrayValue(raw.workItems, defaults.workItems),
            scps: arrayValue(raw.scps, defaults.scps),
            procedures: arrayValue(raw.procedures, defaults.procedures),
            researchNodes: arrayValue(raw.researchNodes, defaults.researchNodes),
            events: arrayValue(raw.events, defaults.events),
            crisis: objectValue(raw.crisis, defaults.crisis),
            campaign: arrayValue(raw.campaign, defaults.campaign),
            notifications: arrayValue(raw.notifications, defaults.notifications),
            history: Array.isArray(raw.history) ? raw.history.filter((entry) => typeof entry === "string").slice(-500) : defaults.history,
            flags: objectValue(raw.flags, defaults.flags),
            camera: objectValue(raw.camera, defaults.camera),
            buildSelection: undefined
        };
        state.savedAt = typeof state.savedAt === "number" && Number.isFinite(state.savedAt) ? state.savedAt : Date.now() - Math.max(0, 1000000 - (state.elapsedMinutes || 0));
        state.speed = 0;
        state.previousSpeed = state.previousSpeed || 1;
        state.buildSelection = undefined;
        ["inspection-delayed", "night-overtime", "infiltration-shadowed", "infiltration-contained", "ethics-redacted"].forEach((key) => {
            const timestamp = Number(state.flags[`${key}:at`]);
            if (Boolean(state.flags[key]) && !Number.isFinite(timestamp))
                state.flags[`${key}:at`] = state.elapsedMinutes;
        });
        state.flags["load-schema-version"] = LOAD_SCHEMA_VERSION;
        if (state.currentEventId && !state.events?.some((event) => event.id === state.currentEventId && !event.resolved))
            state.currentEventId = undefined;
        state.surfaceRooms.forEach((room) => { room.staffAssigned = room.staffAssigned ?? []; room.queue = room.queue ?? []; room.upgrades = room.upgrades ?? []; });
        state.undergroundRooms.forEach((room) => { room.staffAssigned = room.staffAssigned ?? []; room.upgrades = room.upgrades ?? []; room.enabled = room.enabled !== false; room.sealed = Boolean(room.sealed); });
        state.staff.forEach((member, index) => {
            member.path = member.path ?? [];
            member.pathIndex = member.pathIndex ?? 0;
            member.shift = member.shift ?? (index % 3 === 0 ? "night" : "day");
            member.loyalty = SCPGame.clamp(Number(member.loyalty ?? 70), 0, 100);
            member.compromised = Boolean(member.compromised);
            member.taskProgress = SCPGame.clamp(Number(member.taskProgress ?? 0), 0, 100);
        });
        state.scps = state.scps.filter((scp) => SCPGame.SCP_DEFINITIONS.some((definition) => definition.id === scp.definitionId));
        defaults.scps.forEach((defaultScp) => {
            if (!state.scps.some((scp) => scp.definitionId === defaultScp.definitionId))
                state.scps.push(defaultScp);
        });
        state.scps.forEach((scp) => {
            let procedure = state.procedures.find((entry) => entry.id === scp.procedureId || entry.scpId === scp.definitionId);
            if (!procedure) {
                procedure = createDefaultProcedure(scp.definitionId);
                state.procedures.push(procedure);
            }
            scp.procedureId = procedure.id;
            ["backupPower", "analogBackup", "biometricMonitoring", "automatedLockdown", "humaneCare", "isolatedNetwork", "redundantVentilation"].forEach((key) => {
                if (!isProcedureOptionUnlocked(state, key))
                    procedure[key] = false;
            });
        });
        state.researchNodes = defaults.researchNodes.map((defaultNode) => {
            const loaded = state.researchNodes.find((node) => node.id === defaultNode.id);
            return loaded ? { ...defaultNode, completed: Boolean(loaded.completed) } : defaultNode;
        });
        state.campaign = defaults.campaign.map((defaultChapter) => {
            const loaded = state.campaign.find((chapter) => chapter.id === defaultChapter.id);
            if (!loaded)
                return defaultChapter;
            return {
                ...defaultChapter,
                complete: Boolean(loaded.complete),
                objectives: defaultChapter.objectives.map((defaultObjective) => {
                    const loadedObjective = loaded.objectives?.find((objective) => objective.id === defaultObjective.id);
                    return loadedObjective ? { ...defaultObjective, progress: Number(loadedObjective.progress) || 0, complete: Boolean(loadedObjective.complete) } : defaultObjective;
                })
            };
        });
        state.crisis.zones = arrayValue(state.crisis.zones, []);
        state.crisis.orders = arrayValue(state.crisis.orders, []);
        state.crisis.log = Array.isArray(state.crisis.log) ? state.crisis.log.filter((entry) => typeof entry === "string") : [];
        autoAssignStaff(state);
        return state;
    }
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    const SIMULATION_MINUTES_PER_REAL_SECOND = 6;
    const CRISIS_ORDER_ROLES = {
        "deploy-security": "guard",
        "deploy-mtf": "mtf",
        "restore-power": "engineer",
        "lockdown": "engineer",
        "seal-ventilation": "engineer",
        "medical-response": "medic",
        "decontaminate": "medic",
        "amnestic-response": "admin"
    };
    function getSimulationMinutesPerRealSecond() {
        return SIMULATION_MINUTES_PER_REAL_SECOND;
    }
    SCPGame.getSimulationMinutesPerRealSecond = getSimulationMinutesPerRealSecond;
    function advanceSimulation(state, wholeMinutes) {
        if (state.speed === 0 || state.gameOver || state.victory)
            return;
        const steps = Math.min(wholeMinutes, 240);
        for (let index = 0; index < steps; index += 1) {
            simulateMinute(state);
            if (state.speed === 0 || state.gameOver || state.victory)
                break;
        }
    }
    SCPGame.advanceSimulation = advanceSimulation;
    function simulateMinute(state) {
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
        if (state.elapsedMinutes % 10 === 0)
            processSurfaceQueues(state);
        if (state.elapsedMinutes % 30 === 0)
            updateRoomCondition(state);
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
        if (state.crisis.active)
            updateCrisis(state);
        if (state.elapsedMinutes - state.lastAutosave >= 360) {
            SCPGame.saveGame(state, true);
            state.lastAutosave = state.elapsedMinutes;
        }
    }
    function calculateUtilityBalance(state) {
        let powerProduction = 35;
        let waterProduction = 30;
        let powerUse = 18 + state.staff.filter((member) => member.status !== "dead").length * 0.12;
        let waterUse = 12 + state.staff.filter((member) => member.status !== "dead").length * 0.08;
        state.regionFacilities.filter((facility) => facility.enabled).forEach((facility) => {
            const definition = SCPGame.getRegionDefinition(facility.type);
            const condition = facility.condition / 100;
            if (definition.powerProduction) {
                if (definition.powerProduction > 0)
                    powerProduction += definition.powerProduction * facility.level * condition;
                else
                    powerUse += Math.abs(definition.powerProduction) * condition;
            }
            if (definition.waterProduction)
                waterProduction += definition.waterProduction * facility.level * condition;
        });
        state.surfaceRooms.filter((room) => room.enabled).forEach((room) => {
            const definition = SCPGame.getSurfaceDefinition(room.type);
            if (definition.powerUse < 0)
                powerProduction += Math.abs(definition.powerUse) * room.level * room.condition / 100;
            else
                powerUse += definition.powerUse * room.level;
            waterUse += definition.waterUse * room.level;
        });
        state.undergroundRooms.filter((room) => room.enabled).forEach((room) => {
            const definition = SCPGame.getUndergroundDefinition(room.type);
            if (definition.powerUse < 0)
                powerProduction += Math.abs(definition.powerUse) * room.condition / 100;
            else
                powerUse += definition.powerUse;
            waterUse += definition.waterUse;
        });
        if (Boolean(state.flags["surface-blackout"]))
            powerUse *= 0.78;
        return { powerProduction, powerUse, waterProduction, waterUse };
    }
    function updateUtilityReserves(state) {
        const balance = calculateUtilityBalance(state);
        state.resources.powerCapacity = Math.max(100, Math.round(balance.powerProduction * 1.4));
        state.resources.waterCapacity = Math.max(100, Math.round(balance.waterProduction * 1.5));
        const powerDeltaPerMinute = (balance.powerProduction - balance.powerUse) / 180;
        const waterDeltaPerMinute = (balance.waterProduction - balance.waterUse) / 220;
        state.resources.power = SCPGame.clamp(state.resources.power + powerDeltaPerMinute, 0, state.resources.powerCapacity);
        state.resources.water = SCPGame.clamp(state.resources.water + waterDeltaPerMinute, 0, state.resources.waterCapacity);
        if (state.resources.power <= 1 && !Boolean(state.flags["power-critical-notified"])) {
            state.flags["power-critical-notified"] = true;
            SCPGame.addNotification(state, "Énergie critique", "Les systèmes non prioritaires commencent à s'arrêter.", "critical");
            if (state.settings.autoPauseCritical)
                state.speed = 0;
        }
        else if (state.resources.power > 15) {
            state.flags["power-critical-notified"] = false;
        }
        if (state.resources.water <= 1 && !Boolean(state.flags["water-critical-notified"])) {
            state.flags["water-critical-notified"] = true;
            SCPGame.addNotification(state, "Eau critique", "Décontamination, soins et filtration sont dégradés.", "major");
        }
        else if (state.resources.water > 12) {
            state.flags["water-critical-notified"] = false;
        }
    }
    function isOnShift(member, minuteOfDay) {
        const isDay = minuteOfDay >= 360 && minuteOfDay < 1080;
        return member.shift === "day" ? isDay : !isDay;
    }
    function findSurfaceRoomByService(state, service) {
        return state.surfaceRooms
            .filter((room) => room.enabled && SCPGame.getSurfaceDefinition(room.type).services.includes(service))
            .sort((a, b) => a.queue.length - b.queue.length)[0];
    }
    function getRoomCenter(room) {
        return { x: room.x + room.width / 2, y: room.y + room.height / 2 };
    }
    function setStaffTarget(state, member, room) {
        if (!room) {
            member.target = undefined;
            member.targetRoomId = undefined;
            member.path = [];
            return;
        }
        const center = getRoomCenter(room);
        member.target = { layer: "surface", x: center.x, y: center.y };
        member.targetRoomId = room.id;
        member.path = SCPGame.getManhattanPath({ x: Math.round(member.position.x), y: Math.round(member.position.y) }, { x: Math.round(center.x), y: Math.round(center.y) }, state.surfaceWidth, state.surfaceHeight);
        member.pathIndex = 0;
        if (!["injured", "quarantined", "eating", "resting"].includes(member.status))
            member.status = "moving";
    }
    function queueStaffTreatment(state, member, room, source, severity) {
        const alreadyQueued = room.queue.some((item) => item.kind === "patient" && item.metadata?.staffId === member.id)
            || state.workItems.some((item) => item.kind === "patient" && item.metadata?.staffId === member.id);
        if (alreadyQueued)
            return;
        const item = createWorkItem("patient", severity, state.elapsedMinutes, source);
        item.metadata = { staffId: member.id };
        room.queue.push(item);
    }
    function updateStaff(state) {
        const moraleBonus = state.scps.reduce((sum, scp) => {
            if (!scp.contained)
                return sum;
            return sum + SCPGame.getSCPDefinition(scp.definitionId).moraleEffect;
        }, 0);
        state.staff.forEach((member) => {
            if (member.status === "dead")
                return;
            const onShift = isOnShift(member, state.minuteOfDay);
            const difficulty = SCPGame.getDifficultyMultiplier(state.settings.difficulty);
            if (!onShift && member.status !== "training" && member.status !== "injured" && member.status !== "quarantined") {
                member.status = "off-duty";
                member.needs.fatigue = SCPGame.clamp(member.needs.fatigue - 0.07, 0, 100);
                member.needs.stress = SCPGame.clamp(member.needs.stress - 0.035 - moraleBonus * 0.0008, 0, 100);
                member.needs.hunger = SCPGame.clamp(member.needs.hunger + 0.018, 0, 100);
                member.needs.morale = SCPGame.clamp(member.needs.morale + 0.015, 0, 100);
                return;
            }
            if (member.status === "training") {
                member.taskProgress += 0.4;
                member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + 0.03, 0, 100);
                if (member.taskProgress >= 100) {
                    member.status = "working";
                    member.taskProgress = 0;
                    member.experience = SCPGame.clamp(member.experience + 9, 0, 100);
                    Object.keys(member.skills).forEach((key) => {
                        const skill = key;
                        const specialist = member.role === "researcher" && skill === "research" || member.role === "guard" && skill === "security" || member.role === "engineer" && skill === "engineering" || member.role === "medic" && skill === "medicine";
                        member.skills[skill] = SCPGame.clamp(member.skills[skill] + (specialist ? 5 : 1), 0, 100);
                    });
                    SCPGame.addNotification(state, "Formation terminée", `${member.name} a achevé sa formation.`, "info");
                }
                return;
            }
            member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + 0.018 * difficulty, 0, 100);
            member.needs.hunger = SCPGame.clamp(member.needs.hunger + 0.022 * difficulty, 0, 100);
            member.needs.stress = SCPGame.clamp(member.needs.stress + (state.crisis.active ? 0.07 : 0.006) * difficulty - moraleBonus * 0.0005, 0, 100);
            member.needs.morale = SCPGame.clamp(member.needs.morale + (state.reputation.personnel - 55) * 0.0004 - member.needs.stress * 0.0003, 0, 100);
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
            let desiredRoom;
            if (member.status === "quarantined") {
                desiredRoom = findSurfaceRoomByService(state, "quarantine");
                if (desiredRoom)
                    queueStaffTreatment(state, member, desiredRoom, "Suivi de quarantaine", 8);
            }
            else if (member.status === "injured") {
                desiredRoom = findSurfaceRoomByService(state, "medical");
                if (desiredRoom)
                    queueStaffTreatment(state, member, desiredRoom, "Soins du personnel", 6);
            }
            else if (member.needs.hunger > 72) {
                desiredRoom = findSurfaceRoomByService(state, "food");
                member.status = "eating";
            }
            else if (member.needs.fatigue > 75 || member.needs.stress > 78) {
                desiredRoom = findSurfaceRoomByService(state, "rest");
                member.status = "resting";
            }
            else if (member.assignmentRoomId) {
                const surfaceRoom = state.surfaceRooms.find((room) => room.id === member.assignmentRoomId);
                const undergroundRoom = state.undergroundRooms.find((room) => room.id === member.assignmentRoomId);
                if (surfaceRoom) {
                    desiredRoom = surfaceRoom;
                    if (member.status !== "moving")
                        member.status = "working";
                }
                else if (undergroundRoom) {
                    member.position = { layer: "underground", x: undergroundRoom.x + undergroundRoom.width / 2, y: undergroundRoom.level, level: undergroundRoom.level };
                    member.target = undefined;
                    member.status = "working";
                    applyWorkFatigue(member, undergroundRoom.scpId ? 1.4 : 1);
                    return;
                }
            }
            else {
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
                const speed = state.settings.reducedMotion ? 0.35 : 0.55;
                const dx = target.x - member.position.x;
                const dy = target.y - member.position.y;
                const distance = Math.hypot(dx, dy);
                if (distance <= speed) {
                    member.position.x = target.x;
                    member.position.y = target.y;
                    member.pathIndex += 1;
                }
                else {
                    member.position.x += dx / distance * speed;
                    member.position.y += dy / distance * speed;
                }
            }
            else if (desiredRoom && member.position.layer === "surface") {
                if (member.status === "injured" || member.status === "quarantined") {
                    member.needs.stress = SCPGame.clamp(member.needs.stress - 0.03, 0, 100);
                }
                else if (SCPGame.getSurfaceDefinition(desiredRoom.type).services.includes("food")) {
                    member.needs.hunger = SCPGame.clamp(member.needs.hunger - 0.45, 0, 100);
                    member.needs.morale = SCPGame.clamp(member.needs.morale + 0.05, 0, 100);
                    if (member.needs.hunger < 25)
                        member.status = "working";
                }
                else if (SCPGame.getSurfaceDefinition(desiredRoom.type).services.includes("rest")) {
                    member.needs.fatigue = SCPGame.clamp(member.needs.fatigue - 0.32, 0, 100);
                    member.needs.stress = SCPGame.clamp(member.needs.stress - 0.22, 0, 100);
                    if (member.needs.fatigue < 35 && member.needs.stress < 45)
                        member.status = "working";
                }
                else {
                    member.status = "working";
                    applyWorkFatigue(member, 1);
                }
            }
            if (member.needs.fatigue > 92 || member.needs.stress > 94) {
                const overtimeMultiplier = Boolean(state.flags["night-overtime"]) ? 1.8 : 1;
                const errorChance = 0.0007 * difficulty * overtimeMultiplier;
                if (simulationChance(state, `staff-error-${member.id}`, errorChance)) {
                    member.needs.health = SCPGame.clamp(member.needs.health - 8, 0, 100);
                    state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - 0.5, 0, 100);
                    SCPGame.logHistory(state, `Erreur opérationnelle liée à la fatigue de ${member.name}.`);
                }
            }
        });
    }
    function applyWorkFatigue(member, multiplier) {
        member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + 0.012 * multiplier, 0, 100);
        member.taskProgress = (member.taskProgress + 0.1 * multiplier) % 100;
        if (member.traits.includes("Endurant"))
            member.needs.fatigue = SCPGame.clamp(member.needs.fatigue - 0.005, 0, 100);
        if (member.traits.includes("Calme"))
            member.needs.stress = SCPGame.clamp(member.needs.stress - 0.004, 0, 100);
    }
    function createWorkItem(kind, severity, now, source) {
        return {
            id: SCPGame.uid("work"),
            kind,
            severity,
            progress: 0,
            createdAt: now,
            expiresAt: now + 360 + severity * 45,
            source
        };
    }
    function addQueueItem(state, kind, severity, preferredService, source = "Opération courante") {
        const room = findSurfaceRoomByService(state, preferredService);
        const item = createWorkItem(kind, severity, state.elapsedMinutes, source);
        if (room)
            room.queue.push(item);
        else
            state.workItems.push(item);
    }
    SCPGame.addQueueItem = addQueueItem;
    function spawnRoutineWork(state) {
        if (state.elapsedMinutes - Number(state.flags["last-work-spawn"] ?? 0) < 60)
            return;
        state.flags["last-work-spawn"] = state.elapsedMinutes;
        const rng = new SCPGame.SeededRandom(state.seed + state.elapsedMinutes * 17);
        const staffCount = state.staff.filter((member) => member.status !== "dead").length;
        const activity = 1 + Math.floor((staffCount + state.scps.filter((scp) => scp.transferred).length * 5) / 18);
        for (let index = 0; index < activity; index += 1) {
            const roll = rng.next();
            if (roll < 0.24)
                addQueueItem(state, "access", rng.int(1, 4), "access", "Contrôle quotidien");
            else if (roll < 0.42)
                addQueueItem(state, "delivery", rng.int(1, 4), "delivery", "Livraison de couverture");
            else if (roll < 0.58)
                addQueueItem(state, "patient", rng.int(1, 4), "medical", "Incident mineur");
            else if (roll < 0.76)
                addQueueItem(state, "repair", rng.int(1, 5), "repair", "Maintenance préventive");
            else
                addQueueItem(state, "research", rng.int(1, 5), "research", "Analyse documentaire");
        }
        if (state.scps.some((scp) => scp.discovered && !scp.transferred) && rng.chance(0.15)) {
            addQueueItem(state, "anomaly", rng.int(4, 8), "anomaly", "Dossier en attente de transfert");
        }
    }
    function roomServiceEfficiency(state, room) {
        const definition = SCPGame.getSurfaceDefinition(room.type);
        const staff = room.staffAssigned
            .map((id) => state.staff.find((member) => member.id === id))
            .filter((member) => Boolean(member && member.status !== "dead" && member.status !== "off-duty"));
        const required = Object.values(definition.requiredRoles).reduce((sum, count) => sum + (count ?? 0), 0);
        const staffing = required === 0 ? 1 : SCPGame.clamp(staff.length / required, 0, 1.4);
        const wellness = staff.length === 0 ? (required === 0 ? 1 : 0.25) : staff.reduce((sum, member) => sum + (1 - member.needs.fatigue / 180 - member.needs.stress / 220), 0) / staff.length;
        const utility = state.resources.power > 5 && state.resources.water > 3 ? 1 : 0.55;
        const condition = room.condition / 100 * 0.7 + room.cleanliness / 100 * 0.3;
        return SCPGame.clamp(staffing * wellness * utility * condition * (1 + (room.level - 1) * 0.15), 0.05, 2.2);
    }
    function processSurfaceQueues(state) {
        state.surfaceRooms.forEach((room) => {
            if (!room.enabled || room.queue.length === 0)
                return;
            const definition = SCPGame.getSurfaceDefinition(room.type);
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
                state.reputation.command = SCPGame.clamp(state.reputation.command - item.severity * 0.4, 0, 100);
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
    function completeWorkItem(state, room, item) {
        switch (item.kind) {
            case "access":
                state.reputation.cover = SCPGame.clamp(state.reputation.cover + 0.12, 0, 100);
                state.resources.intel += item.severity * 0.05;
                break;
            case "patient":
                state.resources.medical = Math.max(0, state.resources.medical - item.severity * 0.08);
                state.reputation.personnel = SCPGame.clamp(state.reputation.personnel + 0.15, 0, 100);
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
                state.staff.filter((member) => member.status === "training").forEach((member) => member.experience = SCPGame.clamp(member.experience + 1, 0, 100));
                break;
            case "inspection":
                state.reputation.cover = SCPGame.clamp(state.reputation.cover + 0.8, 0, 100);
                state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion - 0.4, 0, 100);
                break;
        }
        room.cleanliness = SCPGame.clamp(room.cleanliness - item.severity * 0.4, 0, 100);
    }
    function failWorkItem(state, room, item) {
        const penalty = item.severity * 0.5;
        if (item.kind === "access" || item.kind === "inspection") {
            state.reputation.cover = SCPGame.clamp(state.reputation.cover - penalty, 0, 100);
            state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion + penalty * 0.6, 0, 100);
        }
        else if (item.kind === "patient") {
            state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - penalty, 0, 100);
            injureRandomStaff(state, item.severity * 2);
        }
        else if (item.kind === "anomaly") {
            state.reputation.command = SCPGame.clamp(state.reputation.command - penalty, 0, 100);
            if (item.severity >= 7)
                startCrisis(state, "intake-breach");
        }
        else if (item.kind === "repair") {
            room.condition = SCPGame.clamp(room.condition - item.severity * 2, 0, 100);
        }
        else {
            state.reputation.command = SCPGame.clamp(state.reputation.command - penalty * 0.4, 0, 100);
        }
        SCPGame.logHistory(state, `Échec de traitement : ${item.source ?? item.kind}.`);
    }
    function healStaff(state, amount, staffId) {
        const injured = state.staff
            .filter((member) => (!staffId || member.id === staffId) && (member.status === "injured" || member.status === "quarantined" || member.needs.health < 100 || member.needs.contamination > 0))
            .sort((a, b) => a.needs.health - b.needs.health)[0];
        if (!injured)
            return;
        injured.needs.health = SCPGame.clamp(injured.needs.health + amount, 0, 100);
        injured.needs.contamination = SCPGame.clamp(injured.needs.contamination - amount * 0.4, 0, 100);
        if (injured.needs.health > 72 && injured.needs.contamination < 35) {
            injured.status = "working";
            injured.target = undefined;
            injured.targetRoomId = undefined;
            injured.path = [];
            SCPGame.autoAssignStaff(state);
        }
    }
    function injureRandomStaff(state, amount) {
        const candidates = state.staff.filter((member) => member.status !== "dead");
        if (candidates.length === 0)
            return;
        const member = candidates[simulationIndex(state, "injure-staff", candidates.length)];
        member.needs.health = SCPGame.clamp(member.needs.health - amount, 0, 100);
        if (member.needs.health <= 0) {
            member.status = "dead";
            state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - 5, 0, 100);
            SCPGame.logHistory(state, `${member.name} est décédé en service.`);
        }
    }
    function repairLowestConditionRoom(state, amount) {
        const surface = [...state.surfaceRooms].sort((a, b) => a.condition - b.condition)[0];
        const underground = [...state.undergroundRooms].sort((a, b) => a.condition - b.condition)[0];
        if (!surface && !underground)
            return;
        if (!underground || (surface && surface.condition <= underground.condition)) {
            surface.condition = SCPGame.clamp(surface.condition + amount, 0, 100);
            surface.cleanliness = SCPGame.clamp(surface.cleanliness + amount * 0.6, 0, 100);
        }
        else {
            underground.condition = SCPGame.clamp(underground.condition + amount, 0, 100);
        }
    }
    function updateRoomCondition(state) {
        const difficulty = SCPGame.getDifficultyMultiplier(state.settings.difficulty);
        state.regionFacilities.forEach((facility) => {
            facility.condition = SCPGame.clamp(facility.condition - 0.015 * difficulty * (1 + facility.level * 0.08), 0, 100);
        });
        state.surfaceRooms.forEach((room) => {
            const traffic = room.queue.length * 0.01;
            room.condition = SCPGame.clamp(room.condition - (0.01 + traffic) * difficulty, 0, 100);
            room.cleanliness = SCPGame.clamp(room.cleanliness - (0.035 + traffic * 2) * difficulty, 0, 100);
        });
        state.undergroundRooms.forEach((room) => {
            const scpWear = room.scpId ? SCPGame.getSCPDefinition(state.scps.find((scp) => scp.id === room.scpId)?.definitionId ?? "scp-173").risk * 0.002 : 0;
            room.condition = SCPGame.clamp(room.condition - (0.012 + scpWear) * difficulty * (1 + room.level * 0.08), 0, 100);
        });
    }
    function evaluateProcedureCompliance(state, scp) {
        if (!scp.roomId || !scp.contained)
            return 0;
        const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
        const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
        if (!room || !procedure)
            return 0;
        const scpDefinition = SCPGame.getSCPDefinition(scp.definitionId);
        const roomDefinition = SCPGame.getUndergroundDefinition(room.type);
        let score = 20;
        score += SCPGame.clamp((SCPGame.getEffectiveRoomContainment(room) - scpDefinition.requirements.minContainment + 2) * 7, -25, 24);
        score += SCPGame.clamp((SCPGame.getEffectiveRoomSecurity(room) - scpDefinition.requirements.minSecurity + 2) * 5, -20, 18);
        const tagMatches = scpDefinition.requirements.roomTags.filter((tag) => roomDefinition.tags.includes(tag)).length;
        score += tagMatches * 5;
        score += (room.condition - 60) * 0.22;
        const assignedMembers = room.staffAssigned
            .map((id) => state.staff.find((member) => member.id === id))
            .filter((member) => Boolean(member && !["dead", "off-duty", "injured", "quarantined", "training"].includes(member.status)));
        const requiredStaff = Object.values(scpDefinition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0);
        const plannedStaff = Math.max(requiredStaff, procedure.assignedStaff);
        score += plannedStaff === 0 ? 8 : SCPGame.clamp(assignedMembers.length / plannedStaff * 15, 0, 18);
        const avgTraining = assignedMembers.length ? assignedMembers.reduce((sum, member) => sum + member.experience, 0) / assignedMembers.length : 0;
        score += SCPGame.clamp((avgTraining - procedure.trainingRequired) * 0.15, -12, 8);
        const powerRatio = state.resources.powerCapacity > 0 ? state.resources.power / state.resources.powerCapacity : 0;
        if (powerRatio >= scpDefinition.requirements.powerReliability)
            score += 10;
        else
            score -= (scpDefinition.requirements.powerReliability - powerRatio) * 35;
        const flags = scpDefinition.requirements.procedureFlags;
        if (flags.includes("backup-power"))
            score += procedure.backupPower ? 6 : -12;
        if (flags.includes("analog-backup"))
            score += procedure.analogBackup ? 5 : -10;
        if (flags.includes("biometric-monitoring"))
            score += procedure.biometricMonitoring ? 6 : -12;
        if (flags.includes("no-optical"))
            score += procedure.opticalMonitoring ? -40 : 12;
        if (flags.includes("automated-lockdown"))
            score += procedure.automatedLockdown ? 6 : -8;
        if (flags.includes("humane-care"))
            score += procedure.humaneCare ? 7 : -10;
        if (flags.includes("restricted-testing"))
            score += procedure.restrictedTesting ? 6 : -9;
        if (flags.includes("isolated-network"))
            score += procedure.isolatedNetwork ? 7 : -12;
        if (flags.includes("redundant-ventilation"))
            score += procedure.redundantVentilation ? 8 : -14;
        if (flags.includes("observation"))
            score += SCPGame.clamp((procedure.observationLevel - 50) * 0.18, -8, 9);
        if (flags.includes("maintenance"))
            score += SCPGame.clamp((procedure.maintenanceFrequency - 55) * 0.16, -8, 8);
        const complexityPenalty = Math.max(0, procedure.complexity - 55) * Math.max(0, 60 - avgTraining) * 0.004;
        score -= complexityPenalty;
        score += scp.knowledge * 0.08;
        if (scp.definitionId === "scp-173") {
            if (assignedMembers.length < 3)
                score -= 25;
            if (procedure.observationLevel >= 80)
                score += 8;
            const eyes = state.scps.find((candidate) => candidate.definitionId === "scp-131" && candidate.contained);
            if (eyes && eyes.roomId && state.undergroundRooms.find((candidate) => candidate.id === eyes.roomId)?.level === room.level)
                score += 5;
        }
        if (scp.definitionId === "scp-096" && procedure.opticalMonitoring)
            score -= 50;
        if (scp.definitionId === "scp-049")
            score += procedure.humaneCare ? 8 : -15;
        if (scp.definitionId === "scp-106")
            score += procedure.maintenanceFrequency >= 75 ? 8 : -12;
        if (scp.definitionId === "scp-939")
            score += procedure.biometricMonitoring && procedure.analogBackup ? 10 : -15;
        if ((scp.definitionId === "scp-914" || scp.definitionId === "scp-294") && !procedure.restrictedTesting)
            score -= 14;
        if (scp.definitionId === "scp-682") {
            const acidSystem = state.undergroundRooms.some((candidate) => candidate.level === room.level && candidate.type === "acid-system");
            score += acidSystem ? 18 : -35;
        }
        if (scp.definitionId === "scp-008")
            score += procedure.redundantVentilation ? 12 : -20;
        return SCPGame.clamp(score, 0, 100);
    }
    SCPGame.evaluateProcedureCompliance = evaluateProcedureCompliance;
    function updateSCPContainment(state) {
        const difficulty = SCPGame.getDifficultyMultiplier(state.settings.difficulty);
        state.scps.filter((scp) => scp.contained).forEach((scp) => {
            const definition = SCPGame.getSCPDefinition(scp.definitionId);
            const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
            const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
            if (!procedure || !room)
                return;
            const compliance = evaluateProcedureCompliance(state, scp);
            procedure.compliance = SCPGame.round(compliance, 1);
            let supplyShortage = 0;
            Object.entries(definition.requirements.suppliesPerDay).forEach(([key, perDay]) => {
                const hourly = (perDay ?? 0) / 24;
                if (SCPGame.getResource(state.resources, key) >= hourly)
                    SCPGame.addResource(state.resources, key, -hourly);
                else
                    supplyShortage += 8;
            });
            const basePressure = definition.risk * 0.12 * difficulty;
            const complianceEffect = (50 - compliance) * 0.035;
            const conditionPenalty = Math.max(0, 65 - room.condition) * 0.04;
            const randomNoise = (Math.sin((state.elapsedMinutes + definition.risk * 19) / 73) + 1) * 0.04;
            scp.breachRisk = SCPGame.clamp(scp.breachRisk + basePressure + complianceEffect + conditionPenalty + supplyShortage + randomNoise - (compliance > 75 ? 0.9 : 0), 0, 120);
            const previousResearchProgress = scp.researchProgress;
            scp.researchProgress = SCPGame.clamp(scp.researchProgress + Math.max(0.1, compliance / 120), 0, 100);
            scp.knowledge = SCPGame.clamp(scp.knowledge + compliance / 700, 0, 100);
            const researchFlag = `scp-research-complete:${scp.definitionId}`;
            if (previousResearchProgress < 100 && scp.researchProgress >= 100 && !Boolean(state.flags[researchFlag])) {
                state.flags[researchFlag] = true;
                state.resources.research += definition.researchValue;
                scp.knowledge = SCPGame.clamp(scp.knowledge + 12, 0, 100);
                SCPGame.addNotification(state, `Étude ${definition.designation} consolidée`, `Le dossier accorde ${definition.researchValue} points de recherche.`, "info");
                SCPGame.logHistory(state, `Programme d'étude ${definition.designation} achevé.`);
            }
            scp.daysContained += 1 / 24;
            scp.mood = SCPGame.clamp(scp.mood + (procedure.humaneCare ? 0.4 : -0.25) - definition.risk * 0.015, 0, 100);
            if (scp.definitionId === "scp-999") {
                state.staff.forEach((member) => {
                    member.needs.stress = SCPGame.clamp(member.needs.stress - 0.25, 0, 100);
                    member.needs.morale = SCPGame.clamp(member.needs.morale + 0.15, 0, 100);
                });
                scp.breachRisk = SCPGame.clamp(scp.breachRisk - 2, 0, 100);
            }
            if (scp.definitionId === "scp-914" && compliance > 75 && simulationChance(state, `scp-914-${scp.id}`, 0.18))
                state.resources.parts += 1.5;
            if (scp.definitionId === "scp-294" && compliance > 70 && simulationChance(state, `scp-294-${scp.id}`, 0.15))
                state.resources.medical += 0.6;
            if (scp.definitionId === "scp-087" && !procedure.restrictedTesting && simulationChance(state, `scp-087-${scp.id}`, 0.08))
                scp.breachRisk += 8;
            if (compliance >= 80)
                scp.activeEffect = "Confinement nominal";
            else if (compliance >= 60)
                scp.activeEffect = "Confinement sous surveillance";
            else if (compliance >= 40)
                scp.activeEffect = "Procédure dégradée";
            else
                scp.activeEffect = "Risque critique";
            if (scp.breachRisk >= 100 && !state.crisis.active) {
                startCrisis(state, "scp-breach", scp.id);
            }
        });
    }
    function produceResearchAndIntel(state) {
        const researchRooms = state.surfaceRooms.filter((room) => room.enabled && ["research", "laboratory", "archive"].includes(room.type));
        let research = 0;
        let intel = 0;
        researchRooms.forEach((room) => {
            const efficiency = roomServiceEfficiency(state, room);
            if (room.type === "research")
                research += 0.8 * efficiency;
            if (room.type === "laboratory")
                research += 0.45 * efficiency;
            if (room.type === "archive") {
                research += 0.2 * efficiency;
                intel += 0.3 * efficiency;
            }
        });
        state.undergroundRooms.filter((room) => room.type === "research-lab" && room.enabled).forEach((room) => {
            research += 0.5 * room.condition / 100;
        });
        state.resources.research += research;
        state.resources.intel += intel;
    }
    function updateReputation(state) {
        const averageMorale = state.staff.length ? state.staff.filter((member) => member.status !== "dead").reduce((sum, member) => sum + member.needs.morale, 0) / Math.max(1, state.staff.filter((member) => member.status !== "dead").length) : 50;
        const averageStress = state.staff.length ? state.staff.filter((member) => member.status !== "dead").reduce((sum, member) => sum + member.needs.stress, 0) / Math.max(1, state.staff.filter((member) => member.status !== "dead").length) : 50;
        state.reputation.personnel = SCPGame.clamp(state.reputation.personnel + (averageMorale - 60) * 0.003 - averageStress * 0.0015, 0, 100);
        const regionalCover = state.regionFacilities.reduce((sum, facility) => sum + (SCPGame.getRegionDefinition(facility.type).coverImpact ?? 0) * 0.004, 0);
        const queuePressure = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length, 0);
        state.reputation.cover = SCPGame.clamp(state.reputation.cover + regionalCover - queuePressure * 0.006 - state.reputation.suspicion * 0.002, 0, 100);
        state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion + Math.max(0, 55 - state.reputation.cover) * 0.005 - regionalCover * 0.3, 0, 100);
        const averageCompliance = state.scps.filter((scp) => scp.contained).length
            ? state.scps.filter((scp) => scp.contained).reduce((sum, scp) => sum + evaluateProcedureCompliance(state, scp), 0) / state.scps.filter((scp) => scp.contained).length
            : 65;
        state.reputation.command = SCPGame.clamp(state.reputation.command + (averageCompliance - 60) * 0.004 - (state.crisis.active ? 0.15 : 0), 0, 100);
        const humaneProcedures = state.procedures.filter((procedure) => procedure.humaneCare).length;
        const activeProcedures = Math.max(1, state.scps.filter((scp) => scp.contained).length);
        state.reputation.ethics = SCPGame.clamp(state.reputation.ethics + (humaneProcedures / activeProcedures - 0.5) * 0.025, 0, 100);
    }
    function dailyUpdate(state) {
        const activeStaff = state.staff.filter((member) => member.status !== "dead");
        const salary = activeStaff.reduce((sum, member) => sum + member.salary, 0);
        const facilityUpkeep = state.regionFacilities.reduce((sum, facility) => sum + SCPGame.getRegionDefinition(facility.type).upkeep * facility.level, 0);
        const surfaceUpkeep = state.surfaceRooms.reduce((sum, room) => sum + SCPGame.getSurfaceDefinition(room.type).upkeep * room.level, 0);
        const undergroundUpkeep = state.undergroundRooms.reduce((sum, room) => sum + SCPGame.getUndergroundDefinition(room.type).upkeep, 0);
        const income = 8500 + state.reputation.command * 95 + state.reputation.cover * 35;
        const costs = salary + facilityUpkeep + surfaceUpkeep + undergroundUpkeep;
        state.resources.funds = Math.max(0, state.resources.funds + income - costs);
        const foodNeed = activeStaff.length * 0.42;
        if (state.resources.food >= foodNeed)
            state.resources.food -= foodNeed;
        else {
            activeStaff.forEach((member) => {
                member.needs.hunger = SCPGame.clamp(member.needs.hunger + 18, 0, 100);
                member.needs.morale = SCPGame.clamp(member.needs.morale - 8, 0, 100);
            });
            state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - 4, 0, 100);
        }
        state.regionFacilities.filter((facility) => facility.enabled).forEach((facility) => {
            const production = SCPGame.getRegionDefinition(facility.type).supplyProduction;
            if (!production)
                return;
            Object.entries(production).forEach(([key, value]) => {
                if (typeof value === "number")
                    SCPGame.addResource(state.resources, key, value * facility.level);
            });
        });
        if (Boolean(state.flags["rationing"])) {
            activeStaff.forEach((member) => member.needs.morale = SCPGame.clamp(member.needs.morale - 2, 0, 100));
            if (state.resources.medical > 15 && state.resources.chemicals > 15)
                state.flags["rationing"] = false;
        }
        state.flags["surface-blackout"] = false;
        SCPGame.addNotification(state, `Rapport journalier J${state.day}`, `Budget : +${SCPGame.formatNumber(income)} / -${SCPGame.formatNumber(costs)}. Personnel actif : ${activeStaff.length}.`, costs > income ? "major" : "info");
        SCPGame.logHistory(state, `Clôture journalière : revenus ${SCPGame.formatNumber(income)}, coûts ${SCPGame.formatNumber(costs)}.`);
        if (state.resources.funds <= 0) {
            state.reputation.command = SCPGame.clamp(state.reputation.command - 5, 0, 100);
            state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - 4, 0, 100);
        }
        if (state.reputation.cover <= 5 || state.reputation.suspicion >= 98) {
            state.gameOver = true;
            state.speed = 0;
            SCPGame.addNotification(state, "Rupture du Voile", "La couverture du Site s'est effondrée. Le commandement vous relève de vos fonctions.", "critical");
        }
    }
    function maybeSpawnRandomEvent(state) {
        if (state.currentEventId || state.crisis.active)
            return;
        const last = Number(state.flags["last-random-event"] ?? 0);
        if (state.elapsedMinutes - last < 360)
            return;
        const difficulty = SCPGame.getDifficultyMultiplier(state.settings.difficulty);
        const chance = 0.08 * difficulty + state.reputation.suspicion * 0.0006;
        const rng = new SCPGame.SeededRandom(state.seed + state.elapsedMinutes * 31);
        if (!rng.chance(chance))
            return;
        const candidates = SCPGame.EVENT_TEMPLATES.filter((template) => template.minDay <= state.day);
        const template = SCPGame.choiceWeighted(rng, candidates);
        if (!template)
            return;
        spawnEvent(state, template.id);
    }
    function spawnEvent(state, templateId) {
        const template = SCPGame.EVENT_TEMPLATES.find((entry) => entry.id === templateId);
        if (!template)
            return;
        const event = {
            id: SCPGame.uid("event"),
            templateId: template.id,
            title: template.title,
            body: template.body,
            severity: template.severity,
            choices: SCPGame.deepClone(template.choices),
            createdAt: state.elapsedMinutes,
            resolved: false,
            blocking: template.blocking
        };
        state.events.unshift(event);
        state.currentEventId = event.id;
        state.flags["last-random-event"] = state.elapsedMinutes;
        if (template.blocking) {
            state.flags["event-player-paused"] = state.speed === 0;
            if (state.speed > 0)
                state.previousSpeed = state.speed;
            state.speed = 0;
        }
        SCPGame.addNotification(state, template.title, template.body, template.severity);
    }
    SCPGame.spawnEvent = spawnEvent;
    function resolveEventChoice(state, eventId, choiceId) {
        const event = state.events.find((entry) => entry.id === eventId);
        if (!event || event.resolved)
            return { ok: false, message: "Événement indisponible." };
        const choice = event.choices.find((entry) => entry.id === choiceId);
        if (!choice)
            return { ok: false, message: "Décision inconnue." };
        if (choice.cost && !SCPGame.payCost(state.resources, choice.cost))
            return { ok: false, message: "Ressources insuffisantes pour cette décision." };
        choice.effects.forEach((effect) => applyEventEffect(state, effect));
        event.resolved = true;
        state.currentEventId = undefined;
        SCPGame.logHistory(state, `${event.title} — décision : ${choice.label}.`);
        const playerWasPaused = Boolean(state.flags["event-player-paused"]);
        state.flags["event-player-paused"] = false;
        if (!playerWasPaused && !state.crisis.active && state.speed === 0)
            state.speed = state.previousSpeed || 1;
        return { ok: true, message: choice.label };
    }
    SCPGame.resolveEventChoice = resolveEventChoice;
    function applyEventEffect(state, effect) {
        switch (effect.type) {
            case "resource":
                if (effect.key && typeof effect.amount === "number")
                    SCPGame.addResource(state.resources, effect.key, effect.amount);
                break;
            case "reputation":
                if (effect.key && typeof effect.amount === "number") {
                    const key = effect.key;
                    state.reputation[key] = SCPGame.clamp(state.reputation[key] + effect.amount, 0, 100);
                }
                break;
            case "queue":
                if (effect.key && typeof effect.amount === "number") {
                    const kind = effect.key;
                    for (let index = 0; index < effect.amount; index += 1)
                        addQueueItem(state, kind, 3 + index, effect.target ?? "access", "Conséquence d'événement");
                }
                break;
            case "crisis":
                startCrisis(state, String(effect.value ?? "generic"));
                break;
            case "staff":
                if (effect.key && typeof effect.amount === "number") {
                    state.staff.filter((member) => effect.target === "night" ? member.shift === "night" : effect.target === member.role || effect.target === "all").forEach((member) => {
                        if (effect.key === "stress")
                            member.needs.stress = SCPGame.clamp(member.needs.stress + effect.amount, 0, 100);
                        if (effect.key === "fatigue")
                            member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + effect.amount, 0, 100);
                        if (effect.key === "morale")
                            member.needs.morale = SCPGame.clamp(member.needs.morale + effect.amount, 0, 100);
                    });
                }
                break;
            case "scp":
                if (effect.key && typeof effect.amount === "number") {
                    state.scps.filter((scp) => effect.target === "all" || scp.id === effect.target || scp.definitionId === effect.target).forEach((scp) => {
                        if (effect.key === "breachRisk")
                            scp.breachRisk = SCPGame.clamp(scp.breachRisk + effect.amount, 0, 120);
                        if (effect.key === "mood")
                            scp.mood = SCPGame.clamp(scp.mood + effect.amount, 0, 100);
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
                SCPGame.logHistory(state, String(effect.value ?? "Événement enregistré."));
                break;
        }
    }
    function createCrisisZones(state, sourceScpId) {
        const zones = [
            { id: "surface-access", name: "Surface — accès et accueil", layer: "surface", security: 45, population: Math.ceil(state.staff.length * 0.2), casualties: 0, contamination: 0, power: 100, sealed: false, evacuated: false, threat: 8 },
            { id: "surface-operations", name: "Surface — opérations", layer: "surface", security: 55, population: Math.ceil(state.staff.length * 0.45), casualties: 0, contamination: 0, power: 100, sealed: false, evacuated: false, threat: 5 },
            { id: "surface-medical", name: "Surface — médical et quarantaine", layer: "surface", security: 35, population: Math.ceil(state.staff.length * 0.15), casualties: 0, contamination: 0, power: 100, sealed: false, evacuated: false, threat: 3 }
        ];
        const usedLevels = [...new Set(state.undergroundRooms.map((room) => room.level))].sort((a, b) => a - b);
        usedLevels.forEach((level) => {
            const rooms = state.undergroundRooms.filter((room) => room.level === level);
            const source = rooms.some((room) => room.scpId === sourceScpId);
            const security = rooms.reduce((sum, room) => sum + SCPGame.getUndergroundDefinition(room.type).security, 0) * 4;
            zones.push({
                id: `level-${level}`,
                name: `Niveau -${level + 1}`,
                layer: "underground",
                level,
                security: SCPGame.clamp(security, 20, 100),
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
    function startCrisis(state, type, sourceScpId) {
        if (state.crisis.active)
            return;
        const sourceScp = sourceScpId ? state.scps.find((entry) => entry.id === sourceScpId || entry.definitionId === sourceScpId) : undefined;
        const sourceDefinition = sourceScp ? SCPGame.getSCPDefinition(sourceScp.definitionId) : undefined;
        const severity = sourceDefinition ? SCPGame.clamp(sourceDefinition.risk, 5, 12) : type === "biohazard" ? 9 : type === "infiltration" ? 7 : 6;
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
            log: [`${SCPGame.formatTime(state.day, state.minuteOfDay)} — Alerte générale déclenchée.`]
        };
        if (sourceScp) {
            sourceScp.contained = false;
            sourceScp.incidents += 1;
            sourceScp.activeEffect = "Brèche active";
            const room = state.undergroundRooms.find((entry) => entry.id === sourceScp.roomId);
            if (room)
                room.sealed = false;
        }
        state.previousSpeed = state.speed || state.previousSpeed || 1;
        state.speed = 0;
        state.view = "command";
        state.currentEventId = undefined;
        SCPGame.addNotification(state, title, state.crisis.description, "critical");
        SCPGame.logHistory(state, title);
    }
    SCPGame.startCrisis = startCrisis;
    function issueCrisisOrder(state, type, zoneId) {
        if (!state.crisis.active)
            return { ok: false, message: "Aucune crise active." };
        const zone = state.crisis.zones.find((entry) => entry.id === zoneId);
        if (!zone)
            return { ok: false, message: "Zone inconnue." };
        if (state.crisis.orders.some((order) => order.zoneId === zoneId && order.type === type && order.status !== "failed"))
            return { ok: false, message: "Cet ordre est déjà en cours." };
        const costs = {
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
        if (assigned <= 0)
            return { ok: false, message: "Aucun effectif disponible pour cet ordre." };
        if (type === "deploy-mtf" && assigned < 2 && !state.surfaceRooms.some((room) => room.type === "mtf-bay"))
            return { ok: false, message: "Aucune capacité FTM disponible." };
        if (!SCPGame.payCost(state.resources, cost))
            return { ok: false, message: "Ressources insuffisantes." };
        const durations = {
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
        const order = {
            id: SCPGame.uid("order"),
            type,
            zoneId,
            progress: 0,
            duration: durations[type],
            assigned,
            status: "queued"
        };
        state.crisis.orders.push(order);
        state.crisis.log.unshift(`${SCPGame.formatTime(state.day, state.minuteOfDay)} — Ordre « ${crisisOrderLabel(type)} » transmis à ${zone.name}.`);
        if (state.speed === 0)
            state.speed = 1;
        return { ok: true, message: `Ordre transmis à ${zone.name}.` };
    }
    SCPGame.issueCrisisOrder = issueCrisisOrder;
    function crisisOrderLabel(type) {
        const labels = {
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
    SCPGame.crisisOrderLabel = crisisOrderLabel;
    function updateCrisis(state) {
        const crisis = state.crisis;
        crisis.elapsed += 1;
        crisis.orders.forEach((order) => {
            if (order.status === "completed" || order.status === "failed")
                return;
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
            if (order.progress >= order.duration)
                completeCrisisOrder(state, order);
        });
        if (crisis.elapsed % 5 === 0) {
            let totalThreat = 0;
            crisis.zones.forEach((zone) => {
                if (zone.evacuated)
                    zone.population = Math.max(0, zone.population - 1);
                const spread = zone.sealed ? 0.25 : 1;
                zone.threat = SCPGame.clamp(zone.threat + crisis.severity * 0.18 * spread - zone.security * 0.006, 0, 100);
                if (crisis.type === "biohazard" || crisis.sourceScpId && SCPGame.getSCPDefinition(state.scps.find((scp) => scp.id === crisis.sourceScpId)?.definitionId ?? "scp-173").id === "scp-008") {
                    zone.contamination = SCPGame.clamp(zone.contamination + zone.threat * 0.015 * (zone.sealed ? 0.5 : 1), 0, 100);
                }
                if (zone.threat > 55 && zone.population > 0 && simulationChance(state, `crisis-casualty-${zone.id}`, 0.08 * crisis.severity / 10)) {
                    zone.casualties += 1;
                    zone.population = Math.max(0, zone.population - 1);
                    crisis.siteIntegrity = SCPGame.clamp(crisis.siteIntegrity - 1.8, 0, 100);
                }
                totalThreat += zone.threat;
            });
            const responsePower = crisis.orders.filter((order) => order.status === "completed" && ["deploy-security", "deploy-mtf", "lockdown", "decontaminate"].includes(order.type)).length * 5;
            crisis.threatProgress = SCPGame.clamp(totalThreat / Math.max(1, crisis.zones.length) + crisis.severity * 2 - responsePower, 0, 120);
            crisis.siteIntegrity = SCPGame.clamp(crisis.siteIntegrity - Math.max(0, crisis.threatProgress - 65) * 0.02, 0, 100);
            crisis.veilExposure = SCPGame.clamp(crisis.veilExposure + Math.max(0, crisis.threatProgress - 55) * 0.013 + (crisis.zones.some((zone) => zone.layer === "surface" && zone.threat > 50) ? 0.35 : 0), 0, 100);
        }
        if (crisis.threatProgress <= 12 && crisis.elapsed > 25)
            resolveCrisis(state, true);
        else if (crisis.siteIntegrity <= 0 || crisis.veilExposure >= 100)
            resolveCrisis(state, false);
        else if (crisis.elapsed > 720)
            resolveCrisis(state, crisis.threatProgress < 45);
    }
    function averageRoleSkill(state, role, skill) {
        const members = state.staff.filter((member) => member.role === role && isStaffAvailableForCrisis(state, member));
        if (members.length === 0)
            return 10;
        return members.reduce((sum, member) => sum + member.skills[skill], 0) / members.length;
    }
    function updateKeterStability(state) {
        const stableKeter = state.scps.some((scp) => scp.contained && SCPGame.getSCPDefinition(scp.definitionId).objectClass === "Keter" && scp.breachRisk < 25);
        const minutes = stableKeter ? Number(state.flags["stable-keter-minutes"] ?? 0) + 1 : 0;
        state.flags["stable-keter-minutes"] = minutes;
        state.flags["stable-keter-days"] = Math.floor(minutes / 1440);
    }
    function updateInternalSecurity(state) {
        const active = state.staff.filter((member) => member.status !== "dead" && member.role !== "director");
        if (active.length === 0)
            return;
        const authentication = SCPGame.isResearchUnlockActive(state, "biometric-monitoring") || SCPGame.isResearchUnlockActive(state, "analog-backup");
        const contained = Boolean(state.flags["infiltration-contained"]);
        const chance = SCPGame.clamp(0.0015 + state.reputation.suspicion / 5000, 0.0015, 0.022) * (authentication ? 0.45 : 1) * (contained ? 0.35 : 1);
        if (!active.some((member) => member.compromised) && simulationChance(state, "internal-compromise", chance)) {
            const candidate = [...active].sort((a, b) => a.loyalty - b.loyalty || a.id.localeCompare(b.id))[0];
            candidate.compromised = true;
            candidate.loyalty = SCPGame.clamp(candidate.loyalty - 8, 0, 100);
            SCPGame.addNotification(state, "Anomalie d'habilitation", "La sécurité interne signale des accès incohérents. Lancez des vérifications ciblées.", "major");
            SCPGame.logHistory(state, "SCiPnet détecte une signature d'accès interne incohérente.");
        }
        if (state.elapsedMinutes % 360 === 0) {
            const threats = active.filter((member) => member.compromised);
            if (threats.length > 0) {
                state.resources.intel = Math.max(0, state.resources.intel - threats.length);
                state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion + threats.length * 0.7, 0, 100);
                addQueueItem(state, "access", 3 + threats.length, "access", "Trafic d'identité incohérent");
            }
        }
    }
    function updateDeferredConsequences(state) {
        const age = (key) => state.elapsedMinutes - Number(state.flags[`${key}:at`] ?? state.elapsedMinutes);
        if (Boolean(state.flags["inspection-delayed"]) && age("inspection-delayed") >= 720) {
            state.flags["inspection-delayed"] = false;
            state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion + 2, 0, 100);
            addQueueItem(state, "inspection", 8, "cover", "Inspection reprogrammée");
            SCPGame.addNotification(state, "Inspection reprogrammée", "Le délai est écoulé : l'équipe de couverture doit maintenant absorber un audit renforcé.", "major");
        }
        if (Boolean(state.flags["night-overtime"]) && age("night-overtime") >= 720) {
            state.flags["night-overtime"] = false;
            SCPGame.addNotification(state, "Relève nocturne normalisée", "La surtension opérationnelle de nuit prend fin.", "info");
        }
        if (Boolean(state.flags["infiltration-shadowed"]) && age("infiltration-shadowed") >= 360) {
            state.flags["infiltration-shadowed"] = false;
            const threat = state.staff.find((member) => member.compromised);
            if (threat) {
                threat.compromised = false;
                threat.loyalty = SCPGame.clamp(threat.loyalty + 4, 0, 100);
            }
            state.resources.intel += threat ? 6 : 3;
            state.reputation.suspicion = SCPGame.clamp(state.reputation.suspicion - 1, 0, 100);
            SCPGame.addNotification(state, "Filature conclue", threat ? "Le réseau hostile a été cartographié et son relais interne neutralisé." : "La piste ne révèle aucun relais actif, mais fournit des signatures utiles.", "info");
        }
        if (Boolean(state.flags["infiltration-contained"]) && age("infiltration-contained") >= 1440) {
            state.flags["infiltration-contained"] = false;
        }
        if (Boolean(state.flags["ethics-redacted"]) && age("ethics-redacted") >= 1440) {
            state.flags["ethics-redacted"] = false;
            state.reputation.ethics = SCPGame.clamp(state.reputation.ethics - 2, 0, 100);
            state.reputation.command = SCPGame.clamp(state.reputation.command - 1, 0, 100);
            addQueueItem(state, "inspection", 6, "cover", "Recoupement du Comité d'éthique");
            SCPGame.addNotification(state, "Recoupement éthique", "Des incohérences dans le rapport expurgé provoquent un contrôle complémentaire.", "major");
        }
    }
    function getAvailableCrisisStaff(state, type) {
        const role = CRISIS_ORDER_ROLES[type];
        if (!role)
            return state.staff.some((member) => member.role === "director" && member.status !== "dead") ? 1 : 0;
        const activeOrders = state.crisis.orders.filter((order) => order.status !== "completed" && order.status !== "failed");
        const alreadyCommitted = activeOrders.reduce((sum, order) => CRISIS_ORDER_ROLES[order.type] === role ? sum + order.assigned : sum, 0);
        const available = state.staff.filter((member) => member.role === role && isStaffAvailableForCrisis(state, member)).length;
        const roomReserve = type === "deploy-mtf" && state.surfaceRooms.some((room) => room.type === "mtf-bay" && room.enabled) ? 2 : 0;
        return Math.max(0, available + roomReserve - alreadyCommitted);
    }
    function isStaffAvailableForCrisis(state, member) {
        return member.status !== "dead" && member.status !== "quarantined" && member.status !== "injured" && member.status !== "training" && (member.status !== "off-duty" || state.crisis.active);
    }
    function completeCrisisOrder(state, order) {
        order.status = "completed";
        const zone = state.crisis.zones.find((entry) => entry.id === order.zoneId);
        if (!zone)
            return;
        switch (order.type) {
            case "lockdown":
                zone.sealed = true;
                zone.security = SCPGame.clamp(zone.security + 12, 0, 100);
                zone.threat = SCPGame.clamp(zone.threat - 8, 0, 100);
                break;
            case "evacuate":
                zone.evacuated = true;
                zone.population = Math.max(0, Math.floor(zone.population * 0.25));
                break;
            case "deploy-security":
                zone.security = SCPGame.clamp(zone.security + 28, 0, 100);
                zone.threat = SCPGame.clamp(zone.threat - 20, 0, 100);
                break;
            case "deploy-mtf":
                zone.security = SCPGame.clamp(zone.security + 45, 0, 100);
                zone.threat = SCPGame.clamp(zone.threat - 36, 0, 100);
                state.crisis.threatProgress = SCPGame.clamp(state.crisis.threatProgress - 10, 0, 120);
                break;
            case "restore-power":
                zone.power = 100;
                zone.security = SCPGame.clamp(zone.security + 8, 0, 100);
                break;
            case "decontaminate":
                zone.contamination = SCPGame.clamp(zone.contamination - 55, 0, 100);
                zone.threat = SCPGame.clamp(zone.threat - 12, 0, 100);
                break;
            case "medical-response":
                zone.casualties = Math.max(0, zone.casualties - 1);
                state.crisis.siteIntegrity = SCPGame.clamp(state.crisis.siteIntegrity + 4, 0, 100);
                break;
            case "seal-ventilation":
                zone.sealed = true;
                zone.contamination = SCPGame.clamp(zone.contamination - 12, 0, 100);
                break;
            case "amnestic-response":
                state.crisis.veilExposure = SCPGame.clamp(state.crisis.veilExposure - 24, 0, 100);
                state.reputation.ethics = SCPGame.clamp(state.reputation.ethics - 2, 0, 100);
                break;
        }
        state.crisis.log.unshift(`${SCPGame.formatTime(state.day, state.minuteOfDay)} — ${crisisOrderLabel(order.type)} terminé dans ${zone.name}.`);
    }
    function resolveCrisis(state, success) {
        const crisis = state.crisis;
        crisis.active = false;
        crisis.resolved = success ? "success" : "failure";
        state.speed = 0;
        const casualties = crisis.zones.reduce((sum, zone) => sum + zone.casualties, 0);
        if (success) {
            state.flags["crisis-success-count"] = Number(state.flags["crisis-success-count"] ?? 0) + 1;
            state.reputation.command = SCPGame.clamp(state.reputation.command + 4 - casualties * 0.4, 0, 100);
            state.reputation.cover = SCPGame.clamp(state.reputation.cover - crisis.veilExposure * 0.05, 0, 100);
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
            SCPGame.addNotification(state, "Crise résolue", `Le Site est stabilisé. ${casualties} victime(s), exposition du Voile ${Math.round(crisis.veilExposure)} %.`, casualties > 0 ? "major" : "info");
            SCPGame.logHistory(state, `Crise résolue avec ${casualties} victime(s).`);
        }
        else {
            state.reputation.command = SCPGame.clamp(state.reputation.command - 15, 0, 100);
            state.reputation.cover = SCPGame.clamp(state.reputation.cover - 20, 0, 100);
            state.reputation.personnel = SCPGame.clamp(state.reputation.personnel - 12, 0, 100);
            SCPGame.addNotification(state, "Échec de confinement", `Le Site a perdu le contrôle de la situation. ${casualties} victime(s).`, "critical");
            SCPGame.logHistory(state, `Échec de crise, intégrité ${Math.round(crisis.siteIntegrity)} %, Voile ${Math.round(crisis.veilExposure)} %.`);
            if (crisis.siteIntegrity <= 0 || crisis.veilExposure >= 100)
                state.gameOver = true;
        }
        updateCampaign(state);
    }
    function updateCampaign(state) {
        if (state.mode !== "campaign" || state.victory)
            return;
        const chapter = state.campaign[state.currentChapter];
        if (!chapter || chapter.complete)
            return;
        chapter.objectives.forEach((objective) => {
            const progress = evaluateObjective(state, objective.condition);
            objective.progress = SCPGame.clamp(progress, 0, objective.target);
            if (!objective.complete && objective.progress >= objective.target) {
                objective.complete = true;
                SCPGame.addCost(state.resources, objective.reward);
                SCPGame.addNotification(state, `Objectif : ${objective.title}`, `Objectif accompli. Récompense : ${SCPGame.costToString(objective.reward) || "autorisation spéciale"}.`, "info");
            }
        });
        if (chapter.objectives.every((objective) => objective.complete)) {
            chapter.complete = true;
            SCPGame.addNotification(state, `Chapitre terminé : ${chapter.title}`, chapter.rewardText, "info");
            SCPGame.logHistory(state, `${chapter.title} achevé.`);
            if (state.currentChapter >= state.campaign.length - 1) {
                state.victory = true;
                state.speed = 0;
                SCPGame.saveGame(state, false);
            }
            else {
                state.currentChapter += 1;
                unlockChapterScps(state, state.currentChapter);
                const next = state.campaign[state.currentChapter];
                SCPGame.addNotification(state, next.title, next.briefing, "major");
            }
        }
    }
    function unlockChapterScps(state, chapterIndex) {
        const chapter = state.campaign[chapterIndex];
        if (!chapter)
            return;
        chapter.unlockedScps.forEach((definitionId) => {
            const scp = state.scps.find((entry) => entry.definitionId === definitionId);
            if (scp)
                scp.discovered = true;
        });
    }
    function evaluateObjective(state, condition) {
        switch (condition) {
            case "region-facilities": return state.regionFacilities.filter((facility) => facility.type !== "road").length;
            case "surface-core": {
                const required = ["reception", "checkpoint", "medical", "maintenance", "elevator", "laboratory", "warehouse", "staff-room"];
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
    function simulationChance(state, channel, probability) {
        const roll = Math.abs(Math.sin((state.seed + state.elapsedMinutes * 13 + hashString(channel) * 7) * 12.9898)) % 1;
        return roll < probability;
    }
    function simulationIndex(state, channel, length) {
        if (length <= 1)
            return 0;
        const roll = Math.abs(Math.sin((state.seed + state.elapsedMinutes * 31 + hashString(channel) * 11) * 78.233)) % 1;
        return Math.min(length - 1, Math.floor(roll * length));
    }
    function hashString(value) {
        let hash = 0;
        for (let index = 0; index < value.length; index += 1)
            hash = (hash * 31 + value.charCodeAt(index)) | 0;
        return hash;
    }
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    const SURFACE_COLORS = {
        corridor: "#303842",
        reception: "#557c80",
        checkpoint: "#78585c",
        administration: "#59687d",
        "access-office": "#675d7f",
        archive: "#554f69",
        medical: "#52786b",
        quarantine: "#7a6642",
        decontamination: "#47777c",
        intake: "#765b45",
        laboratory: "#466a83",
        research: "#4d6386",
        "staff-room": "#5e7158",
        canteen: "#7c6b49",
        restroom: "#536a73",
        maintenance: "#735c3e",
        warehouse: "#665c50",
        armory: "#70474b",
        briefing: "#62617a",
        "command-center": "#69485d",
        training: "#5c6b54",
        "mtf-bay": "#78454f",
        "waste-processing": "#5e6550",
        "power-distribution": "#7a7040",
        elevator: "#3f5966"
    };
    const UNDERGROUND_COLORS = {
        excavated: "#49443d",
        "elevator-shaft": "#3f5561",
        "service-tunnel": "#4c5358",
        "safe-containment": "#4e745f",
        "euclid-containment": "#74673f",
        "keter-containment": "#783f45",
        "humanoid-cell": "#596b72",
        "bio-containment": "#4f735f",
        "infohazard-vault": "#5f4e75",
        "heavy-containment": "#5f5555",
        "research-lab": "#435f78",
        "security-post": "#70464b",
        "medical-bay": "#4e715f",
        "power-node": "#766f42",
        "air-filtration": "#426c72",
        "emergency-shelter": "#59674f",
        "acid-system": "#64743d",
        "temporal-lock": "#654d76"
    };
    const REGION_COLORS = {
        "cover-office": "#647587",
        road: "#4d5258",
        parking: "#585d63",
        "power-plant": "#766d45",
        "water-treatment": "#476d76",
        "supply-depot": "#695b4f",
        housing: "#5f735d",
        helipad: "#5e6168",
        "rail-terminal": "#5e554f",
        "public-clinic": "#527568",
        "data-center": "#4f6479",
        checkpoint: "#744b50",
        watchtower: "#63585a",
        "green-zone": "#4e704d"
    };
    function resizeCanvas(runtime) {
        const rect = runtime.canvas.getBoundingClientRect();
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        const width = Math.max(320, Math.floor(rect.width * ratio));
        const height = Math.max(260, Math.floor(rect.height * ratio));
        if (runtime.canvas.width !== width || runtime.canvas.height !== height) {
            runtime.canvas.width = width;
            runtime.canvas.height = height;
            runtime.context.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
    }
    SCPGame.resizeCanvas = resizeCanvas;
    function renderCanvas(runtime) {
        resizeCanvas(runtime);
        const ctx = runtime.context;
        const rect = runtime.canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        drawBackdrop(ctx, rect.width, rect.height, runtime.state.view);
        switch (runtime.state.view) {
            case "region":
                drawRegion(runtime, rect.width, rect.height);
                break;
            case "surface":
                drawSurface(runtime, rect.width, rect.height);
                break;
            case "underground":
                drawUnderground(runtime, rect.width, rect.height);
                break;
            case "command":
                drawCommand(runtime, rect.width, rect.height);
                break;
            case "management":
                drawManagementBackdrop(runtime, rect.width, rect.height);
                break;
        }
    }
    SCPGame.renderCanvas = renderCanvas;
    function drawBackdrop(ctx, width, height, view) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (view === "region") {
            gradient.addColorStop(0, "#19252a");
            gradient.addColorStop(1, "#101719");
        }
        else if (view === "underground") {
            gradient.addColorStop(0, "#16171a");
            gradient.addColorStop(1, "#090a0c");
        }
        else {
            gradient.addColorStop(0, "#151b20");
            gradient.addColorStop(1, "#0d1114");
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "rgba(255,255,255,0.025)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 28) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += 28) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    function regionMetrics(runtime, width) {
        const camera = runtime.state.camera.region;
        const tileW = Math.max(26, Math.min(54, width / 15)) * camera.zoom;
        const tileH = tileW * 0.48;
        return {
            tileW,
            tileH,
            originX: width * 0.5 + camera.offsetX,
            originY: 54 + camera.offsetY
        };
    }
    function regionToScreen(runtime, width, x, y) {
        const metrics = regionMetrics(runtime, width);
        return {
            x: metrics.originX + (x - y) * metrics.tileW * 0.5,
            y: metrics.originY + (x + y) * metrics.tileH * 0.5
        };
    }
    function screenToRegionCell(runtime, clientX, clientY) {
        const rect = runtime.canvas.getBoundingClientRect();
        const metrics = regionMetrics(runtime, rect.width);
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;
        const dx = (localX - metrics.originX) / (metrics.tileW * 0.5);
        const dy = (localY - metrics.originY) / (metrics.tileH * 0.5);
        return { x: Math.floor((dx + dy) / 2), y: Math.floor((dy - dx) / 2) };
    }
    SCPGame.screenToRegionCell = screenToRegionCell;
    function drawDiamond(ctx, center, tileW, tileH, fill, stroke = "rgba(255,255,255,.12)") {
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + tileW / 2, center.y + tileH / 2);
        ctx.lineTo(center.x, center.y + tileH);
        ctx.lineTo(center.x - tileW / 2, center.y + tileH / 2);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }
    function drawRegion(runtime, width, height) {
        const state = runtime.state;
        const ctx = runtime.context;
        const metrics = regionMetrics(runtime, width);
        const hover = runtime.hoveredCell;
        for (let y = 0; y < state.regionHeight; y += 1) {
            for (let x = 0; x < state.regionWidth; x += 1) {
                const point = regionToScreen(runtime, width, x, y);
                const noise = Math.sin(x * 1.71 + y * 2.31) * 0.03;
                const color = y < 2 ? `rgba(48,71,69,${0.78 + noise})` : `rgba(48,67,55,${0.78 + noise})`;
                drawDiamond(ctx, point, metrics.tileW, metrics.tileH, color);
            }
        }
        drawRegionalCity(ctx, runtime, width, height);
        const facilities = [...state.regionFacilities].sort((a, b) => (a.x + a.y) - (b.x + b.y));
        facilities.forEach((facility) => drawRegionFacility(ctx, runtime, facility, width));
        if (hover && state.view === "region") {
            const point = regionToScreen(runtime, width, hover.x, hover.y);
            const valid = hover.x >= 0 && hover.y >= 0 && hover.x < state.regionWidth && hover.y < state.regionHeight;
            drawDiamond(ctx, point, metrics.tileW, metrics.tileH, valid ? "rgba(106,210,175,.22)" : "rgba(230,92,92,.22)", valid ? "#72d2b0" : "#e05c5c");
        }
        drawCanvasTitle(ctx, "RÉGION ET COUVERTURE", "Routes publiques, fournisseurs, réseaux, ville et discrétion opérationnelle", width);
        drawLegend(ctx, width, height, [
            ["Couverture", Math.round(state.reputation.cover), "#73c9a3"],
            ["Suspicion", Math.round(state.reputation.suspicion), "#e58b65"],
            ["Installations", state.regionFacilities.length, "#9ab7cf"]
        ]);
    }
    function drawRegionalCity(ctx, runtime, width, height) {
        const metrics = regionMetrics(runtime, width);
        ctx.save();
        ctx.globalAlpha = 0.45;
        for (let index = 0; index < 14; index += 1) {
            const x = 1 + index % 6;
            const y = 9 + Math.floor(index / 6);
            const base = regionToScreen(runtime, width, x, y);
            const h = 8 + (index * 7 % 18);
            ctx.fillStyle = index % 3 === 0 ? "#4b5660" : "#414b50";
            ctx.fillRect(base.x - metrics.tileW * 0.15, base.y + metrics.tileH * 0.28 - h, metrics.tileW * 0.3, h);
            ctx.fillStyle = "rgba(240,210,124,.3)";
            ctx.fillRect(base.x - 3, base.y + metrics.tileH * 0.3 - h + 4, 2, 2);
            ctx.fillRect(base.x + 3, base.y + metrics.tileH * 0.3 - h + 8, 2, 2);
        }
        ctx.restore();
        if (width >= 620) {
            ctx.fillStyle = "rgba(220,229,233,.55)";
            ctx.font = "11px system-ui";
            ctx.fillText("AGGLOMÉRATION CIVILE", 18, height - 22);
        }
    }
    function drawRegionFacility(ctx, runtime, facility, width) {
        const state = runtime.state;
        const metrics = regionMetrics(runtime, width);
        const definition = SCPGame.getRegionDefinition(facility.type);
        const selected = state.selectedType === "facility" && state.selectedId === facility.id;
        const base = regionToScreen(runtime, width, facility.x + facility.width / 2 - 0.5, facility.y + facility.height / 2 - 0.5);
        const footprintW = metrics.tileW * (facility.width + facility.height) * 0.25;
        const footprintH = metrics.tileH * (facility.width + facility.height) * 0.25;
        const height3d = facility.type === "watchtower" ? 38 : facility.type === "power-plant" ? 30 : 18 + facility.level * 4;
        ctx.save();
        ctx.shadowColor = selected ? "rgba(118,220,188,.7)" : "rgba(0,0,0,.45)";
        ctx.shadowBlur = selected ? 14 : 7;
        ctx.fillStyle = REGION_COLORS[facility.type];
        ctx.fillRect(base.x - footprintW / 2, base.y + footprintH / 2 - height3d, footprintW, height3d);
        ctx.fillStyle = "rgba(255,255,255,.1)";
        ctx.fillRect(base.x - footprintW / 2, base.y + footprintH / 2 - height3d, footprintW, 4);
        ctx.fillStyle = "rgba(0,0,0,.28)";
        ctx.fillRect(base.x + footprintW * 0.25, base.y + footprintH / 2 - height3d + 5, footprintW * 0.12, height3d - 5);
        ctx.restore();
        ctx.strokeStyle = selected ? "#77dab7" : "rgba(255,255,255,.2)";
        ctx.strokeRect(base.x - footprintW / 2, base.y + footprintH / 2 - height3d, footprintW, height3d);
        ctx.textAlign = "center";
        ctx.fillStyle = "#edf3f2";
        ctx.font = "700 11px system-ui";
        ctx.fillText(definition.icon, base.x, base.y + footprintH / 2 - height3d / 2 + 4);
        if (width >= 620 || selected) {
            ctx.font = "10px system-ui";
            ctx.fillStyle = "rgba(234,241,241,.82)";
            ctx.fillText(definition.name, base.x, base.y + footprintH / 2 + 13);
        }
        ctx.textAlign = "left";
        if (facility.condition < 55)
            drawWarningBadge(ctx, base.x + footprintW / 2 - 5, base.y + footprintH / 2 - height3d - 4, "!");
    }
    function surfaceMetrics(runtime, width, height) {
        const camera = runtime.state.camera.surface;
        const cell = Math.max(18, Math.min(38, Math.min(width / (runtime.state.surfaceWidth + 2), (height - 80) / (runtime.state.surfaceHeight + 2)))) * camera.zoom;
        return {
            cell,
            originX: (width - runtime.state.surfaceWidth * cell) / 2 + camera.offsetX,
            originY: 62 + camera.offsetY
        };
    }
    function screenToSurfaceCell(runtime, clientX, clientY) {
        const rect = runtime.canvas.getBoundingClientRect();
        const metrics = surfaceMetrics(runtime, rect.width, rect.height);
        return {
            x: Math.floor((clientX - rect.left - metrics.originX) / metrics.cell),
            y: Math.floor((clientY - rect.top - metrics.originY) / metrics.cell)
        };
    }
    SCPGame.screenToSurfaceCell = screenToSurfaceCell;
    function drawSurface(runtime, width, height) {
        const state = runtime.state;
        const ctx = runtime.context;
        const metrics = surfaceMetrics(runtime, width, height);
        const totalW = state.surfaceWidth * metrics.cell;
        const totalH = state.surfaceHeight * metrics.cell;
        ctx.fillStyle = "#1e252a";
        ctx.fillRect(metrics.originX - 7, metrics.originY - 7, totalW + 14, totalH + 14);
        ctx.strokeStyle = "rgba(255,255,255,.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= state.surfaceWidth; x += 1) {
            ctx.beginPath();
            ctx.moveTo(metrics.originX + x * metrics.cell, metrics.originY);
            ctx.lineTo(metrics.originX + x * metrics.cell, metrics.originY + totalH);
            ctx.stroke();
        }
        for (let y = 0; y <= state.surfaceHeight; y += 1) {
            ctx.beginPath();
            ctx.moveTo(metrics.originX, metrics.originY + y * metrics.cell);
            ctx.lineTo(metrics.originX + totalW, metrics.originY + y * metrics.cell);
            ctx.stroke();
        }
        [...state.surfaceRooms].sort((a, b) => a.type === "corridor" ? -1 : b.type === "corridor" ? 1 : 0).forEach((room) => drawSurfaceRoom(ctx, runtime, room, metrics));
        drawSurfaceStaff(ctx, runtime, metrics);
        if (runtime.hoveredCell) {
            const hover = runtime.hoveredCell;
            const build = state.buildSelection?.layer === "surface" ? SCPGame.getSurfaceDefinition(state.buildSelection.type) : undefined;
            const w = build?.minSize.x ?? 1;
            const h = build?.minSize.y ?? 1;
            const valid = hover.x >= 0 && hover.y >= 0 && hover.x + w <= state.surfaceWidth && hover.y + h <= state.surfaceHeight;
            ctx.fillStyle = valid ? "rgba(106,210,175,.2)" : "rgba(230,92,92,.2)";
            ctx.strokeStyle = valid ? "#73d4b2" : "#e05c5c";
            ctx.lineWidth = 2;
            ctx.fillRect(metrics.originX + hover.x * metrics.cell, metrics.originY + hover.y * metrics.cell, w * metrics.cell, h * metrics.cell);
            ctx.strokeRect(metrics.originX + hover.x * metrics.cell, metrics.originY + hover.y * metrics.cell, w * metrics.cell, h * metrics.cell);
        }
        drawCanvasTitle(ctx, "COMPLEXE DE SURFACE", "Gestion opérationnelle, files d'attente, salles, besoins et flux humains", width);
        const queues = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length, 0) + state.workItems.length;
        drawLegend(ctx, width, height, [
            ["Personnel", state.staff.filter((member) => member.status !== "dead").length, "#9ab7cf"],
            ["Files", queues, queues > 12 ? "#e36e68" : "#d5bd6a"],
            ["Énergie", Math.round(state.resources.power), "#d6c868"]
        ]);
    }
    function drawSurfaceRoom(ctx, runtime, room, metrics) {
        const state = runtime.state;
        const definition = SCPGame.getSurfaceDefinition(room.type);
        const selected = state.selectedType === "surface-room" && state.selectedId === room.id;
        const x = metrics.originX + room.x * metrics.cell;
        const y = metrics.originY + room.y * metrics.cell;
        const w = room.width * metrics.cell;
        const h = room.height * metrics.cell;
        ctx.save();
        ctx.shadowColor = selected ? "rgba(116,221,186,.7)" : "rgba(0,0,0,.28)";
        ctx.shadowBlur = selected ? 12 : 4;
        ctx.fillStyle = SURFACE_COLORS[room.type];
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.restore();
        ctx.fillStyle = "rgba(255,255,255,.08)";
        ctx.fillRect(x + 4, y + 4, w - 8, Math.max(3, metrics.cell * 0.12));
        ctx.strokeStyle = selected ? "#79d9b8" : room.condition < 45 ? "#dc6d65" : "rgba(230,238,239,.24)";
        ctx.lineWidth = selected ? 2 : 1;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        ctx.textAlign = "center";
        ctx.fillStyle = "#f0f4f4";
        ctx.font = `${Math.max(9, Math.min(15, metrics.cell * 0.38))}px system-ui`;
        ctx.fillText(definition.icon, centerX, centerY - 2);
        if (w > 65 && h > 42) {
            ctx.font = `600 ${Math.max(8, Math.min(11, metrics.cell * 0.28))}px system-ui`;
            ctx.fillStyle = "rgba(244,248,248,.9)";
            const label = definition.name.length > 22 ? `${definition.name.slice(0, 20)}…` : definition.name;
            ctx.fillText(label, centerX, centerY + 14);
        }
        ctx.textAlign = "left";
        if (room.queue.length > 0) {
            drawPill(ctx, x + w - 19, y + 11, String(room.queue.length), room.queue.length > 5 ? "#d95e5e" : "#c99e55");
        }
        if (room.staffAssigned.length > 0 && w > 52) {
            drawPill(ctx, x + 18, y + h - 10, `${room.staffAssigned.length}👤`, "#526f84");
        }
        if (room.condition < 55 || room.cleanliness < 45) {
            drawWarningBadge(ctx, x + w - 8, y + h - 8, room.condition < 35 ? "!!" : "!");
        }
    }
    function drawSurfaceStaff(ctx, runtime, metrics) {
        const state = runtime.state;
        state.staff.filter((member) => member.status !== "dead" && member.position.layer === "surface").forEach((member, index) => {
            const x = metrics.originX + (member.position.x + 0.15 + (index % 3) * 0.08) * metrics.cell;
            const y = metrics.originY + (member.position.y + 0.2 + (index % 2) * 0.1) * metrics.cell;
            const radius = SCPGame.clamp(metrics.cell * 0.14, 3, 6);
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = SCPGame.roleColor(member.role);
            ctx.fill();
            ctx.strokeStyle = member.compromised ? "#ff274f" : "rgba(255,255,255,.6)";
            ctx.stroke();
            if (state.selectedType === "staff" && state.selectedId === member.id) {
                ctx.beginPath();
                ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = "#79d9b8";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            if (member.needs.stress > 80 || member.needs.fatigue > 85) {
                ctx.fillStyle = "#f1c56c";
                ctx.font = "9px system-ui";
                ctx.fillText("!", x + radius + 1, y - radius);
            }
        });
    }
    function undergroundMetrics(runtime, width, height) {
        const camera = runtime.state.camera.underground;
        const cellW = Math.max(24, Math.min(48, width / (runtime.state.undergroundWidth + 2))) * camera.zoom;
        const levelH = Math.max(48, Math.min(74, (height - 100) / runtime.state.undergroundLevels)) * camera.zoom;
        return {
            cellW,
            levelH,
            originX: (width - runtime.state.undergroundWidth * cellW) / 2 + camera.offsetX,
            originY: 72 + camera.offsetY
        };
    }
    function screenToUndergroundCell(runtime, clientX, clientY) {
        const rect = runtime.canvas.getBoundingClientRect();
        const metrics = undergroundMetrics(runtime, rect.width, rect.height);
        return {
            x: Math.floor((clientX - rect.left - metrics.originX) / metrics.cellW),
            y: Math.floor((clientY - rect.top - metrics.originY) / metrics.levelH)
        };
    }
    SCPGame.screenToUndergroundCell = screenToUndergroundCell;
    function drawUnderground(runtime, width, height) {
        const state = runtime.state;
        const ctx = runtime.context;
        const metrics = undergroundMetrics(runtime, width, height);
        const totalW = state.undergroundWidth * metrics.cellW;
        for (let level = 0; level < state.undergroundLevels; level += 1) {
            const y = metrics.originY + level * metrics.levelH;
            const rock = level % 2 === 0 ? "#25221f" : "#211f1d";
            ctx.fillStyle = rock;
            ctx.fillRect(metrics.originX - 14, y, totalW + 28, metrics.levelH - 2);
            ctx.strokeStyle = "rgba(255,255,255,.06)";
            ctx.beginPath();
            ctx.moveTo(metrics.originX - 14, y);
            ctx.lineTo(metrics.originX + totalW + 14, y);
            ctx.stroke();
            ctx.fillStyle = "rgba(217,226,226,.45)";
            ctx.font = "10px system-ui";
            ctx.fillText(`NIVEAU -${level + 1}`, metrics.originX - 70, y + metrics.levelH / 2 + 3);
            for (let x = 0; x < state.undergroundWidth; x += 1) {
                if ((x + level * 3) % 7 === 0) {
                    ctx.fillStyle = "rgba(120,110,96,.08)";
                    ctx.beginPath();
                    ctx.arc(metrics.originX + x * metrics.cellW + 8, y + 14 + (x % 3) * 8, 3 + (x % 4), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        state.undergroundRooms.forEach((room) => drawUndergroundRoom(ctx, runtime, room, metrics));
        drawUndergroundStaff(ctx, runtime, metrics);
        if (runtime.hoveredCell) {
            const hover = runtime.hoveredCell;
            const build = state.buildSelection?.layer === "underground" ? SCPGame.getUndergroundDefinition(state.buildSelection.type) : undefined;
            const roomWidth = build?.width ?? 1;
            const valid = hover.x >= 0 && hover.y >= 0 && hover.x + roomWidth <= state.undergroundWidth && hover.y < state.undergroundLevels;
            ctx.fillStyle = valid ? "rgba(106,210,175,.18)" : "rgba(230,92,92,.18)";
            ctx.strokeStyle = valid ? "#73d4b2" : "#e05c5c";
            ctx.lineWidth = 2;
            ctx.fillRect(metrics.originX + hover.x * metrics.cellW, metrics.originY + hover.y * metrics.levelH + 4, roomWidth * metrics.cellW, metrics.levelH - 10);
            ctx.strokeRect(metrics.originX + hover.x * metrics.cellW, metrics.originY + hover.y * metrics.levelH + 4, roomWidth * metrics.cellW, metrics.levelH - 10);
        }
        drawCanvasTitle(ctx, "COMPLEXE SOUTERRAIN", "Excavation verticale, réseaux critiques, cellules uniques et confinement profond", width);
        const contained = state.scps.filter((scp) => scp.contained).length;
        const maxRisk = Math.max(0, ...state.scps.filter((scp) => scp.contained).map((scp) => scp.breachRisk));
        drawLegend(ctx, width, height, [
            ["Niveaux", new Set(state.undergroundRooms.map((room) => room.level)).size, "#9ab7cf"],
            ["SCP confinés", contained, "#73c9a3"],
            ["Risque max", Math.round(maxRisk), maxRisk > 70 ? "#e36e68" : "#d5bd6a"]
        ]);
    }
    function drawUndergroundRoom(ctx, runtime, room, metrics) {
        const state = runtime.state;
        const definition = SCPGame.getUndergroundDefinition(room.type);
        const selected = state.selectedType === "underground-room" && state.selectedId === room.id;
        const x = metrics.originX + room.x * metrics.cellW;
        const y = metrics.originY + room.level * metrics.levelH + 5;
        const w = room.width * metrics.cellW;
        const h = metrics.levelH - 11;
        ctx.save();
        ctx.shadowColor = selected ? "rgba(116,221,186,.8)" : "rgba(0,0,0,.5)";
        ctx.shadowBlur = selected ? 12 : 5;
        ctx.fillStyle = UNDERGROUND_COLORS[room.type];
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.restore();
        ctx.strokeStyle = selected ? "#79d9b8" : room.sealed ? "#e3b960" : room.condition < 45 ? "#dc6d65" : "rgba(235,241,241,.25)";
        ctx.lineWidth = selected ? 2 : 1;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        if (room.type === "elevator-shaft") {
            ctx.strokeStyle = "rgba(225,235,237,.45)";
            ctx.beginPath();
            ctx.moveTo(x + w * 0.35, y + 6);
            ctx.lineTo(x + w * 0.35, y + h - 6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + w * 0.65, y + 6);
            ctx.lineTo(x + w * 0.65, y + h - 6);
            ctx.stroke();
        }
        ctx.textAlign = "center";
        ctx.fillStyle = "#f1f4f4";
        ctx.font = `700 ${Math.max(9, Math.min(13, metrics.cellW * 0.3))}px system-ui`;
        ctx.fillText(definition.icon, x + w / 2, y + h / 2 - 3);
        if (w > 75) {
            ctx.font = "9px system-ui";
            ctx.fillStyle = "rgba(239,244,244,.8)";
            ctx.fillText(definition.name.length > 24 ? `${definition.name.slice(0, 22)}…` : definition.name, x + w / 2, y + h / 2 + 12);
        }
        ctx.textAlign = "left";
        if (room.scpId) {
            const scp = state.scps.find((entry) => entry.id === room.scpId);
            if (scp) {
                const scpDefinition = SCPGame.getSCPDefinition(scp.definitionId);
                drawPill(ctx, x + w - 27, y + 12, scpDefinition.designation.replace("SCP-", ""), SCPGame.objectClassColor(scpDefinition.objectClass));
                const riskWidth = Math.max(12, w - 14);
                ctx.fillStyle = "rgba(0,0,0,.35)";
                ctx.fillRect(x + 7, y + h - 8, riskWidth, 3);
                ctx.fillStyle = scp.breachRisk > 75 ? "#e85e65" : scp.breachRisk > 45 ? "#d7b45d" : "#65c98e";
                ctx.fillRect(x + 7, y + h - 8, riskWidth * SCPGame.clamp(scp.breachRisk / 100, 0, 1), 3);
            }
        }
        if (room.condition < 55)
            drawWarningBadge(ctx, x + 8, y + 9, "!");
    }
    function drawUndergroundStaff(ctx, runtime, metrics) {
        runtime.state.staff.filter((member) => member.status !== "dead" && member.position.layer === "underground").forEach((member, index) => {
            const level = member.position.level ?? Math.round(member.position.y);
            const x = metrics.originX + (member.position.x + (index % 3) * 0.12) * metrics.cellW;
            const y = metrics.originY + level * metrics.levelH + metrics.levelH * 0.72;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = SCPGame.roleColor(member.role);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,.55)";
            ctx.stroke();
        });
    }
    function commandCards(runtime, width, height) {
        const zones = runtime.state.crisis.zones;
        const columns = width < 760 ? 2 : 3;
        const gap = 14;
        const cardWidth = Math.min(260, (width - 40 - gap * (columns - 1)) / columns);
        const cardHeight = 116;
        return zones.map((zone, index) => ({
            zone,
            x: 20 + (index % columns) * (cardWidth + gap),
            y: 82 + Math.floor(index / columns) * (cardHeight + gap),
            width: cardWidth,
            height: cardHeight
        })).filter((card) => card.y < height - 30);
    }
    function screenToCommandZone(runtime, clientX, clientY) {
        const rect = runtime.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return commandCards(runtime, rect.width, rect.height).find((card) => SCPGame.pointInRect({ x, y }, card.x, card.y, card.width, card.height))?.zone;
    }
    SCPGame.screenToCommandZone = screenToCommandZone;
    function drawCommand(runtime, width, height) {
        const state = runtime.state;
        const ctx = runtime.context;
        const crisis = state.crisis;
        drawCanvasTitle(ctx, crisis.active ? crisis.title.toUpperCase() : "CENTRE DE COMMANDEMENT", crisis.active ? crisis.description : "Aucune alerte critique en cours — les exercices restent disponibles", width);
        if (!crisis.active && !crisis.resolved) {
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(225,234,235,.75)";
            ctx.font = "600 18px system-ui";
            ctx.fillText("ÉTAT NOMINAL", width / 2, height / 2 - 10);
            ctx.font = "13px system-ui";
            ctx.fillStyle = "rgba(225,234,235,.55)";
            ctx.fillText("Le centre de commandement surveille les flux, alarmes et communications.", width / 2, height / 2 + 18);
            ctx.textAlign = "left";
            return;
        }
        if (!crisis.active && crisis.resolved) {
            drawCrisisSummary(ctx, crisis, width, height);
            return;
        }
        const cards = commandCards(runtime, width, height);
        cards.forEach((card) => {
            const selected = state.selectedType === "zone" && state.selectedId === card.zone.id;
            ctx.fillStyle = selected ? "rgba(71,102,100,.72)" : "rgba(31,39,44,.92)";
            ctx.fillRect(card.x, card.y, card.width, card.height);
            ctx.strokeStyle = selected ? "#78d7b7" : card.zone.threat > 65 ? "#db6868" : "rgba(235,241,241,.16)";
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect(card.x, card.y, card.width, card.height);
            ctx.fillStyle = "#eef3f3";
            ctx.font = "700 12px system-ui";
            ctx.fillText(card.zone.name, card.x + 12, card.y + 20);
            ctx.font = "10px system-ui";
            ctx.fillStyle = "rgba(231,237,238,.65)";
            ctx.fillText(`Population ${card.zone.population} · Victimes ${card.zone.casualties}`, card.x + 12, card.y + 38);
            drawMiniBar(ctx, card.x + 12, card.y + 49, card.width - 24, 8, card.zone.threat, "Menace", card.zone.threat > 65 ? "#df6669" : "#d3ad5a");
            drawMiniBar(ctx, card.x + 12, card.y + 72, card.width - 24, 6, card.zone.security, "Sécurité", "#68a9d3");
            drawMiniBar(ctx, card.x + 12, card.y + 93, card.width - 24, 6, card.zone.contamination, "Contam.", "#72bd75");
            if (card.zone.sealed)
                drawPill(ctx, card.x + card.width - 34, card.y + 18, "SCELLÉ", "#9c7d42");
            if (card.zone.evacuated)
                drawPill(ctx, card.x + card.width - 34, card.y + 36, "ÉVAC.", "#55768d");
        });
        drawLegend(ctx, width, height, [
            ["Intégrité", Math.round(crisis.siteIntegrity), crisis.siteIntegrity < 40 ? "#e36e68" : "#73c9a3"],
            ["Voile", Math.round(crisis.veilExposure), crisis.veilExposure > 60 ? "#e36e68" : "#d5bd6a"],
            ["Menace", Math.round(crisis.threatProgress), crisis.threatProgress > 65 ? "#e36e68" : "#d5bd6a"]
        ]);
    }
    function drawCrisisSummary(ctx, crisis, width, height) {
        ctx.textAlign = "center";
        ctx.fillStyle = crisis.resolved === "success" ? "#72d09a" : "#e26b6b";
        ctx.font = "700 24px system-ui";
        ctx.fillText(crisis.resolved === "success" ? "SITE STABILISÉ" : "ÉCHEC DE CONFINEMENT", width / 2, height / 2 - 55);
        ctx.font = "13px system-ui";
        ctx.fillStyle = "rgba(231,238,239,.72)";
        const casualties = crisis.zones.reduce((sum, zone) => sum + zone.casualties, 0);
        ctx.fillText(`Intégrité ${Math.round(crisis.siteIntegrity)} % · Exposition ${Math.round(crisis.veilExposure)} % · ${casualties} victime(s)`, width / 2, height / 2 - 20);
        ctx.fillText("Le rapport après action et les addenda de procédure sont disponibles dans Gestion.", width / 2, height / 2 + 10);
        ctx.textAlign = "left";
    }
    function drawManagementBackdrop(runtime, width, height) {
        const ctx = runtime.context;
        ctx.fillStyle = "rgba(26,33,38,.86)";
        ctx.fillRect(22, 74, width - 44, height - 104);
        ctx.strokeStyle = "rgba(255,255,255,.08)";
        ctx.strokeRect(22, 74, width - 44, height - 104);
        ctx.fillStyle = "rgba(108,191,162,.12)";
        for (let index = 0; index < 6; index += 1) {
            ctx.fillRect(42 + index * ((width - 100) / 6), 100, 2, height - 160);
        }
        drawCanvasTitle(ctx, "GESTION DU SITE", "Personnel, procédures, recherche, dossiers SCP, rapports et progression", width);
    }
    function selectAtCanvas(runtime, clientX, clientY) {
        const state = runtime.state;
        if (state.view === "region") {
            selectAtGridCell(runtime, screenToRegionCell(runtime, clientX, clientY));
        }
        else if (state.view === "surface") {
            selectAtGridCell(runtime, screenToSurfaceCell(runtime, clientX, clientY));
        }
        else if (state.view === "underground") {
            selectAtGridCell(runtime, screenToUndergroundCell(runtime, clientX, clientY));
        }
        else if (state.view === "command") {
            const zone = screenToCommandZone(runtime, clientX, clientY);
            state.selectedId = zone?.id;
            state.selectedType = zone ? "zone" : undefined;
        }
    }
    SCPGame.selectAtCanvas = selectAtCanvas;
    function selectAtGridCell(runtime, cell) {
        const state = runtime.state;
        if (state.view === "region") {
            const facility = [...state.regionFacilities].reverse().find((entry) => SCPGame.pointInRect(cell, entry.x, entry.y, entry.width, entry.height));
            state.selectedId = facility?.id;
            state.selectedType = facility ? "facility" : undefined;
        }
        else if (state.view === "surface") {
            const room = [...state.surfaceRooms].reverse().find((entry) => SCPGame.pointInRect(cell, entry.x, entry.y, entry.width, entry.height));
            if (room) {
                state.selectedId = room.id;
                state.selectedType = "surface-room";
            }
            else {
                const staff = state.staff.find((member) => member.position.layer === "surface" && Math.hypot(member.position.x - cell.x, member.position.y - cell.y) < 0.8);
                state.selectedId = staff?.id;
                state.selectedType = staff ? "staff" : undefined;
            }
        }
        else if (state.view === "underground") {
            const room = [...state.undergroundRooms].reverse().find((entry) => entry.level === cell.y && cell.x >= entry.x && cell.x < entry.x + entry.width);
            state.selectedId = room?.id;
            state.selectedType = room ? "underground-room" : undefined;
        }
    }
    SCPGame.selectAtGridCell = selectAtGridCell;
    function drawCanvasTitle(ctx, title, subtitle, width) {
        ctx.fillStyle = "rgba(9,13,16,.72)";
        ctx.fillRect(0, 0, width, 54);
        ctx.fillStyle = "#ecf2f2";
        ctx.font = "700 15px system-ui";
        ctx.fillText(title, 18, 22);
        ctx.fillStyle = "rgba(226,235,236,.58)";
        ctx.font = "11px system-ui";
        ctx.fillText(subtitle.length > 100 ? `${subtitle.slice(0, 98)}…` : subtitle, 18, 40);
    }
    function drawLegend(ctx, width, height, entries) {
        const itemWidth = 110;
        const total = entries.length * itemWidth;
        const startX = Math.max(8, width - total - 10);
        const y = height - 34;
        ctx.fillStyle = "rgba(8,12,14,.78)";
        ctx.fillRect(startX - 8, y - 9, total + 8, 30);
        entries.forEach(([label, value, color], index) => {
            const x = startX + index * itemWidth;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + 5, y + 5, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(232,239,239,.58)";
            ctx.font = "9px system-ui";
            ctx.fillText(label, x + 14, y + 2);
            ctx.fillStyle = "#f0f4f4";
            ctx.font = "700 11px system-ui";
            ctx.fillText(String(value), x + 14, y + 15);
        });
    }
    function drawPill(ctx, x, y, text, color) {
        const width = Math.max(20, text.length * 5 + 10);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x - width / 2, y - 8, width, 16, 8);
        ctx.fill();
        ctx.fillStyle = "#101416";
        ctx.font = "700 8px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y + 3);
        ctx.textAlign = "left";
    }
    function drawWarningBadge(ctx, x, y, text) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#df6a62";
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "700 9px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y + 3);
        ctx.textAlign = "left";
    }
    function drawMiniBar(ctx, x, y, width, height, value, label, color) {
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * SCPGame.clamp(value / 100, 0, 1), height);
        ctx.fillStyle = "rgba(236,242,242,.62)";
        ctx.font = "8px system-ui";
        ctx.fillText(`${label} ${Math.round(value)}%`, x, y - 2);
    }
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    let activeRuntime;
    let modalMode = "none";
    let procedureScpId = "";
    let renderedModalKey = "";
    let modalReturnFocus;
    let modalPausedGame = false;
    let renderedEndScreenKey = "";
    function escapeHtml(value) {
        return value.replace(/[&<>'"]/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[character] ?? character));
    }
    function percent(value) {
        return `${Math.round(value)} %`;
    }
    function focusSignature(element) {
        if (element.id)
            return `id:${element.id}`;
        const attributes = ["data-action", "data-view", "data-speed", "data-tab", "data-type", "data-role", "data-staff", "data-node", "data-scp", "data-room", "data-zone", "data-order", "data-setting"];
        const selectors = attributes
            .filter((name) => element.hasAttribute(name))
            .map((name) => `[${name}="${String(element.getAttribute(name)).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`);
        return selectors.length ? `selector:${element.tagName.toLowerCase()}${selectors.join("")}` : undefined;
    }
    function findFocusTarget(container, signature) {
        if (signature.startsWith("id:")) {
            const target = document.getElementById(signature.slice(3));
            return target && container.contains(target) ? target : null;
        }
        return container.querySelector(signature.slice("selector:".length));
    }
    function replaceHtmlPreservingInteraction(container, html) {
        if (container.innerHTML === html)
            return;
        const active = document.activeElement instanceof HTMLElement && container.contains(document.activeElement) ? document.activeElement : undefined;
        const signature = active ? focusSignature(active) : undefined;
        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;
        const nestedScroll = Array.from(container.querySelectorAll("[data-preserve-scroll]")).map((element) => ({
            key: String(element.dataset.preserveScroll),
            top: element.scrollTop,
            left: element.scrollLeft
        }));
        container.innerHTML = html;
        container.scrollTop = scrollTop;
        container.scrollLeft = scrollLeft;
        nestedScroll.forEach((entry) => {
            const element = container.querySelector(`[data-preserve-scroll="${entry.key}"]`);
            if (element) {
                element.scrollTop = entry.top;
                element.scrollLeft = entry.left;
            }
        });
        if (signature)
            findFocusTarget(container, signature)?.focus({ preventScroll: true });
    }
    function setPageInert(inert) {
        const appShell = document.getElementById("app-shell");
        const startScreen = document.getElementById("start-screen");
        const endScreen = document.getElementById("end-screen");
        const startVisible = Boolean(startScreen && !startScreen.classList.contains("hidden"));
        const endVisible = Boolean(endScreen && !endScreen.classList.contains("hidden"));
        if (appShell)
            appShell.inert = inert || startVisible || endVisible;
        if (startScreen)
            startScreen.inert = inert;
        if (endScreen)
            endScreen.inert = inert;
    }
    function prepareModal(state, returnFocus) {
        if (modalMode === "none")
            modalReturnFocus = returnFocus;
        const startScreen = document.getElementById("start-screen");
        if (startScreen?.classList.contains("hidden") && state.speed > 0) {
            state.previousSpeed = state.speed;
            state.speed = 0;
            modalPausedGame = true;
        }
    }
    function closeModal(state) {
        modalMode = "none";
        if (modalPausedGame && !state.currentEventId && document.getElementById("start-screen")?.classList.contains("hidden")) {
            state.speed = state.previousSpeed || 1;
        }
        modalPausedGame = false;
    }
    function initializeUI(runtime) {
        activeRuntime = runtime;
        document.addEventListener("click", handleDelegatedClick);
        document.addEventListener("change", handleDelegatedChange);
        document.addEventListener("input", handleDelegatedInput);
        document.addEventListener("keydown", handleKeyboard);
        const fileInput = document.getElementById("import-file");
        fileInput?.addEventListener("change", handleImportFile);
        refreshUI(runtime, true);
    }
    SCPGame.initializeUI = initializeUI;
    function showStartScreen() {
        const screen = document.getElementById("start-screen");
        if (screen)
            screen.classList.remove("hidden");
        setPageInert(modalMode !== "none");
        const continueButton = document.getElementById("continue-button");
        if (continueButton) {
            const available = SCPGame.hasSavedGame();
            continueButton.disabled = !available;
            continueButton.textContent = available ? "Continuer" : "Aucune sauvegarde";
        }
    }
    SCPGame.showStartScreen = showStartScreen;
    function hideStartScreen() {
        const screen = document.getElementById("start-screen");
        if (screen)
            screen.classList.add("hidden");
        setPageInert(modalMode !== "none");
    }
    SCPGame.hideStartScreen = hideStartScreen;
    function refreshUI(runtime, force = false) {
        activeRuntime = runtime;
        if (force)
            runtime.canvasDirty = true;
        const state = runtime.state;
        updateTopBar(state);
        updateNavigation(state);
        updateObjectiveStrip(state);
        updateRightPanel(runtime);
        updateManagementOverlay(runtime);
        updateNotifications(state);
        updateModal(runtime);
        updateEndScreen(state);
        runtime.uiDirty = false;
        if (force)
            document.body.classList.toggle("high-contrast", state.settings.highContrast);
    }
    SCPGame.refreshUI = refreshUI;
    function updateTopBar(state) {
        setText("time-display", SCPGame.formatTime(state.day, state.minuteOfDay));
        setText("funds-display", SCPGame.formatNumber(state.resources.funds));
        setText("power-display", `${Math.round(state.resources.power)}/${Math.round(state.resources.powerCapacity)}`);
        setText("water-display", `${Math.round(state.resources.water)}/${Math.round(state.resources.waterCapacity)}`);
        setText("research-display", SCPGame.formatNumber(state.resources.research));
        setText("intel-display", SCPGame.formatNumber(state.resources.intel));
        const alert = document.getElementById("alert-indicator");
        if (alert) {
            alert.textContent = state.crisis.active ? "ALERTE ROUGE" : state.reputation.suspicion > 70 ? "VOILE FRAGILE" : "SITE NOMINAL";
            alert.className = `alert-indicator ${state.crisis.active ? "critical" : state.reputation.suspicion > 70 ? "warning" : "nominal"}`;
        }
        document.querySelectorAll("[data-speed]").forEach((button) => {
            button.classList.toggle("active", Number(button.dataset.speed) === state.speed);
            button.setAttribute("aria-pressed", String(Number(button.dataset.speed) === state.speed));
        });
    }
    function updateNavigation(state) {
        document.querySelectorAll("#left-nav [data-view]").forEach((button) => {
            button.classList.toggle("active", button.dataset.view === state.view);
        });
        document.body.dataset.view = state.view;
    }
    function updateObjectiveStrip(state) {
        const container = document.getElementById("objective-strip");
        if (!container)
            return;
        if (state.mode === "sandbox") {
            replaceHtmlPreservingInteraction(container, `<strong>Bac à sable</strong><span>Construisez librement, testez les procédures et déclenchez des exercices depuis le commandement.</span>`);
            return;
        }
        const chapter = state.campaign[state.currentChapter];
        if (!chapter)
            return;
        const current = chapter.objectives.find((objective) => !objective.complete) ?? chapter.objectives[chapter.objectives.length - 1];
        replaceHtmlPreservingInteraction(container, `
      <strong>${escapeHtml(chapter.title)}</strong>
      <span>${escapeHtml(current.title)} — ${escapeHtml(current.description)}</span>
      <div class="objective-progress"><i style="width:${SCPGame.clamp(current.progress / current.target * 100, 0, 100)}%"></i></div>
      <small>${SCPGame.round(current.progress, 1)} / ${current.target}</small>
    `);
    }
    function updateRightPanel(runtime) {
        const panel = document.getElementById("right-panel");
        if (!panel)
            return;
        const state = runtime.state;
        const mobileOpen = panel.classList.contains("mobile-open");
        let html = `<div class="panel-heading"><span>${viewLabel(state.view)}</span><div class="panel-actions"><button class="panel-toggle" data-action="toggle-panel" aria-expanded="${mobileOpen}" aria-controls="right-panel">${mobileOpen ? "Masquer" : "Détails"}</button><button class="icon-button" data-action="help" title="Aide" aria-label="Ouvrir l'aide">Aide</button></div></div>`;
        if (state.view === "region")
            html += renderRegionPanel(state);
        else if (state.view === "surface")
            html += renderSurfacePanel(state);
        else if (state.view === "underground")
            html += renderUndergroundPanel(state);
        else if (state.view === "command")
            html += renderCommandPanel(state);
        else
            html += renderManagementSummary(state);
        replaceHtmlPreservingInteraction(panel, html);
    }
    function viewLabel(view) {
        const labels = {
            region: "Région",
            surface: "Complexe de surface",
            underground: "Niveaux inférieurs",
            command: "Commandement",
            management: "Gestion"
        };
        return labels[view];
    }
    function renderRegionPanel(state) {
        const selected = state.selectedType === "facility" ? state.regionFacilities.find((entry) => entry.id === state.selectedId) : undefined;
        if (selected) {
            const definition = SCPGame.getRegionDefinition(selected.type);
            return `
        ${renderSelectionHeader(definition.icon, definition.name, `Niveau ${selected.level}`)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
                ["État", percent(selected.condition)],
                ["Entretien", `${SCPGame.formatNumber(definition.upkeep * selected.level)}/j`],
                ["Couverture", signed(definition.coverImpact ?? 0)],
                ["Suspicion", signed(definition.suspicionImpact ?? 0)]
            ])}
        ${renderSelectionActions()}
        <hr>
        ${renderBuildCatalog(state, "region")}
      `;
        }
        return `
      ${renderReputationOverview(state)}
      <p class="hint">Sélectionnez une installation pour consulter son état, ou choisissez une construction puis cliquez sur la carte.</p>
      ${renderBuildCatalog(state, "region")}
    `;
    }
    function renderSurfacePanel(state) {
        if (state.selectedType === "staff") {
            const member = state.staff.find((entry) => entry.id === state.selectedId);
            if (member)
                return `${renderStaffDetails(member)}<hr>${renderBuildCatalog(state, "surface")}`;
        }
        const selected = state.selectedType === "surface-room" ? state.surfaceRooms.find((entry) => entry.id === state.selectedId) : undefined;
        if (selected) {
            const definition = SCPGame.getSurfaceDefinition(selected.type);
            const efficiency = selected.staffAssigned.length === 0 && Object.keys(definition.requiredRoles).length > 0 ? "Sous-effectif" : "Opérationnelle";
            return `
        ${renderSelectionHeader(definition.icon, definition.name, efficiency)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
                ["État", percent(selected.condition)],
                ["Propreté", percent(selected.cleanliness)],
                ["File", String(selected.queue.length)],
                ["Personnel", String(selected.staffAssigned.length)]
            ])}
        ${renderAssignedStaff(state, selected.staffAssigned)}
        ${renderSelectionActions()}
        <hr>
        ${renderBuildCatalog(state, "surface")}
      `;
        }
        const queues = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length, 0) + state.workItems.length;
        return `
      <section class="summary-card">
        <h3>Activité opérationnelle</h3>
        ${renderMetricGrid([
            ["Personnel", String(state.staff.filter((member) => member.status !== "dead").length)],
            ["Files totales", String(queues)],
            ["Moral", percent(state.reputation.personnel)],
            ["Blessés", String(state.staff.filter((member) => member.status === "injured").length)]
        ])}
      </section>
      <p class="hint">Les salles fonctionnent comme dans un jeu de gestion hospitalière : capacité, personnel, file, maintenance et trajets influencent directement le Site.</p>
      ${renderBuildCatalog(state, "surface")}
    `;
    }
    function renderUndergroundPanel(state) {
        const selected = state.selectedType === "underground-room" ? state.undergroundRooms.find((entry) => entry.id === state.selectedId) : undefined;
        if (selected) {
            const definition = SCPGame.getUndergroundDefinition(selected.type);
            const scp = selected.scpId ? state.scps.find((entry) => entry.id === selected.scpId) : undefined;
            return `
        ${renderSelectionHeader(definition.icon, definition.name, `Niveau -${selected.level + 1}`)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
                ["État", percent(selected.condition)],
                ["Confinement", String(SCPGame.getEffectiveRoomContainment(selected))],
                ["Sécurité", String(SCPGame.getEffectiveRoomSecurity(selected))],
                ["Équipe", String(selected.staffAssigned.length)]
            ])}
        ${scp ? renderContainedScpCard(state, scp) : renderCompatibleTransfers(state, selected)}
        ${renderSelectionActions()}
        <hr>
        ${renderBuildCatalog(state, "underground")}
      `;
        }
        return `
      <section class="summary-card">
        <h3>Confinement profond</h3>
        ${renderMetricGrid([
            ["SCP confinés", String(state.scps.filter((scp) => scp.contained).length)],
            ["Cellules libres", String(state.undergroundRooms.filter((room) => !room.scpId && SCPGame.getUndergroundDefinition(room.type).containment >= 4).length)],
            ["Niveaux", String(new Set(state.undergroundRooms.map((room) => room.level)).size)],
            ["Risque max", percent(Math.max(0, ...state.scps.filter((scp) => scp.contained).map((scp) => scp.breachRisk)))]
        ])}
      </section>
      ${renderUncontainedScps(state)}
      ${renderBuildCatalog(state, "underground")}
    `;
    }
    function renderCommandPanel(state) {
        if (!state.crisis.active) {
            const resolved = state.crisis.resolved;
            return `
        <section class="summary-card">
          <h3>${resolved ? "Rapport après action" : "État nominal"}</h3>
          <p class="muted">${resolved ? `Dernier résultat : ${state.crisis.resolved === "success" ? "crise résolue" : "échec"}.` : "Les alarmes, portes, réseaux et équipes sont coordonnés ici."}</p>
          ${resolved ? `<button class="wide-button" data-action="ack-crisis">Archiver le rapport</button>` : ""}
        </section>
        <section class="summary-card">
          <h3>Exercices contrôlés</h3>
          <button class="wide-button warning" data-action="start-drill" data-drill="power">Panne multisectorielle</button>
          <button class="wide-button warning" data-action="start-drill" data-drill="biohazard">Exercice biologique</button>
          <button class="wide-button warning" data-action="start-drill" data-drill="infiltration">Exercice d'infiltration</button>
        </section>
      `;
        }
        const selected = state.selectedType === "zone" ? state.crisis.zones.find((entry) => entry.id === state.selectedId) : [...state.crisis.zones].sort((a, b) => b.threat - a.threat)[0];
        if (!selected)
            return "";
        const orders = ["lockdown", "evacuate", "deploy-security", "deploy-mtf", "restore-power", "decontaminate", "medical-response", "seal-ventilation", "amnestic-response"];
        return `
      <div class="zone-selector" role="group" aria-label="Zones de crise">
        ${state.crisis.zones.map((zone) => `<button data-action="select-zone" data-zone="${zone.id}" aria-pressed="${zone.id === selected.id}"><span>${escapeHtml(zone.name)}</span><b>${Math.round(zone.threat)} %</b></button>`).join("")}
      </div>
      ${renderSelectionHeader("!", selected.name, `Menace ${Math.round(selected.threat)} %`)}
      ${renderMetricGrid([
            ["Population", String(selected.population)],
            ["Victimes", String(selected.casualties)],
            ["Sécurité", percent(selected.security)],
            ["Contamination", percent(selected.contamination)]
        ])}
      <h3 class="section-title">Ordres disponibles</h3>
      <div class="order-grid">
        ${orders.map((order) => `<button data-action="crisis-order" data-order="${order}" data-zone="${selected.id}">${SCPGame.crisisOrderLabel(order)}</button>`).join("")}
      </div>
      <button class="wide-button" data-action="resume-crisis">${state.speed === 0 ? "Reprendre la simulation" : "Mettre en pause"}</button>
      <h3 class="section-title">Journal de crise</h3>
      <div class="compact-log">${state.crisis.log.slice(0, 8).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>
    `;
    }
    function renderManagementSummary(state) {
        return `
      ${renderReputationOverview(state)}
      <section class="summary-card">
        <h3>Résumé du Site</h3>
        ${renderMetricGrid([
            ["Personnel", String(state.staff.length)],
            ["SCP connus", String(state.scps.filter((scp) => scp.discovered).length)],
            ["Recherches", String(state.researchNodes.filter((node) => node.completed).length)],
            ["Incidents", String(state.scps.reduce((sum, scp) => sum + scp.incidents, 0))]
        ])}
      </section>
      <p class="hint">Les onglets de gestion occupent le panneau central.</p>
    `;
    }
    function renderSelectionHeader(icon, title, subtitle) {
        return `<div class="selection-header"><div class="selection-icon">${escapeHtml(icon)}</div><div><h2>${escapeHtml(title)}</h2><span>${escapeHtml(subtitle)}</span></div></div>`;
    }
    function renderSelectionActions() {
        return `<div class="action-row"><button data-action="upgrade-selected">Améliorer</button><button data-action="repair-selected">Réparer</button><button data-action="demolish-selected" class="danger">Démolir</button></div>`;
    }
    function renderMetricGrid(entries) {
        return `<div class="metric-grid">${entries.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`;
    }
    function signed(value) {
        return `${value >= 0 ? "+" : ""}${value}`;
    }
    function renderReputationOverview(state) {
        return `
      <section class="summary-card">
        <h3>Équilibre stratégique</h3>
        ${renderProgressMetric("Commandement", state.reputation.command)}
        ${renderProgressMetric("Personnel", state.reputation.personnel)}
        ${renderProgressMetric("Couverture", state.reputation.cover)}
        ${renderProgressMetric("Éthique", state.reputation.ethics)}
        ${renderProgressMetric("Suspicion", state.reputation.suspicion, true)}
      </section>
    `;
    }
    function renderProgressMetric(label, value, dangerHigh = false) {
        const danger = dangerHigh ? value > 65 : value < 40;
        const warning = dangerHigh ? value > 40 : value < 65;
        return `<div class="progress-metric"><span>${escapeHtml(label)}</span><div><i class="${danger ? "danger" : warning ? "warning" : "good"}" style="width:${SCPGame.clamp(value, 0, 100)}%"></i></div><b>${Math.round(value)}</b></div>`;
    }
    function renderBuildCatalog(state, layer) {
        const selection = state.buildSelection;
        let items = [];
        if (layer === "region") {
            items = SCPGame.REGION_FACILITY_DEFINITIONS.map((definition) => ({ type: definition.type, name: definition.name, icon: definition.icon, cost: definition.cost, description: definition.description, unlocked: SCPGame.isRegionDefinitionUnlocked(state, definition) }));
        }
        else if (layer === "surface") {
            items = SCPGame.SURFACE_ROOM_DEFINITIONS.filter((definition) => definition.type !== "corridor").map((definition) => ({ type: definition.type, name: definition.name, icon: definition.icon, cost: definition.cost, description: definition.description, unlocked: SCPGame.isSurfaceDefinitionUnlocked(state, definition) }));
        }
        else {
            items = SCPGame.UNDERGROUND_ROOM_DEFINITIONS.map((definition) => ({ type: definition.type, name: definition.name, icon: definition.icon, cost: definition.cost, description: definition.description, unlocked: SCPGame.isUndergroundDefinitionUnlocked(state, definition) }));
        }
        return `
      <div class="catalog-heading"><h3>Construction</h3>${selection?.layer === layer ? `<button data-action="cancel-build">Annuler</button>` : ""}</div>
      ${selection?.layer === layer ? `<p class="build-active">Placement : <strong>${escapeHtml(items.find((item) => item.type === selection.type)?.name ?? String(selection.type))}</strong></p>` : ""}
      <div class="build-catalog">
        ${items.map((item) => `
          <button class="build-item ${selection?.type === item.type ? "active" : ""}" data-action="build" data-layer="${layer}" data-type="${item.type}" ${item.unlocked ? "" : "disabled"} title="${escapeHtml(item.description)}">
            <span>${escapeHtml(item.icon)}</span>
            <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(SCPGame.costToString(item.cost) || "Gratuit")}</small></div>
          </button>
        `).join("")}
      </div>
    `;
    }
    function renderAssignedStaff(state, ids) {
        if (ids.length === 0)
            return `<p class="status-warning">Aucun personnel assigné automatiquement.</p>`;
        return `<div class="assigned-list">${ids.map((id) => {
            const member = state.staff.find((entry) => entry.id === id);
            return member ? `<button data-action="select-staff" data-staff="${member.id}"><i style="background:${SCPGame.roleColor(member.role)}"></i>${escapeHtml(member.name)}</button>` : "";
        }).join("")}</div>`;
    }
    function renderStaffDetails(member) {
        return `
      ${renderSelectionHeader(member.role === "mtf" ? "FTM" : "●", member.name, `${SCPGame.ROLE_LABELS[member.role]} · Niveau ${member.clearance}`)}
      <div class="trait-list">${member.traits.map((trait) => `<span>${escapeHtml(trait)}</span>`).join("")}</div>
      ${renderMetricGrid([
            ["Santé", percent(member.needs.health)],
            ["Moral", percent(member.needs.morale)],
            ["Fatigue", percent(member.needs.fatigue)],
            ["Stress", percent(member.needs.stress)]
        ])}
      <div class="skill-list">
        ${renderSkill("Recherche", member.skills.research)}
        ${renderSkill("Sécurité", member.skills.security)}
        ${renderSkill("Ingénierie", member.skills.engineering)}
        ${renderSkill("Médecine", member.skills.medicine)}
      </div>
      <div class="action-row"><button data-action="train-staff" data-staff="${member.id}">Former</button>${member.role !== "director" ? `<button class="danger" data-action="dismiss-staff" data-staff="${member.id}">Renvoyer</button>` : ""}</div>
      <div class="action-row"><button data-action="set-shift" data-staff="${member.id}" data-shift="day" ${member.shift === "day" ? "disabled" : ""}>Équipe jour</button><button data-action="set-shift" data-staff="${member.id}" data-shift="night" ${member.shift === "night" ? "disabled" : ""}>Équipe nuit</button><button data-action="vet-staff" data-staff="${member.id}">Contrôle interne</button></div>
    `;
    }
    function renderSkill(label, value) {
        return `<div><span>${escapeHtml(label)}</span><div><i style="width:${value}%"></i></div><b>${Math.round(value)}</b></div>`;
    }
    function renderContainedScpCard(state, scp) {
        const definition = SCPGame.getSCPDefinition(scp.definitionId);
        const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
        return `
      <section class="scp-card" style="--class-color:${SCPGame.objectClassColor(definition.objectClass)}">
        <header><strong>${definition.designation}</strong><span>${definition.objectClass}</span></header>
        <h3>${escapeHtml(definition.name)}</h3>
        ${renderProgressMetric("Conformité", procedure?.compliance ?? 0)}
        ${renderProgressMetric("Risque", scp.breachRisk, true)}
        <p>${escapeHtml(scp.activeEffect)}</p>
        <button class="wide-button" data-action="open-procedure" data-scp="${scp.id}">Modifier la procédure</button>
      </section>
    `;
    }
    function renderCompatibleTransfers(state, room) {
        const candidates = state.scps.filter((scp) => scp.discovered && (!scp.contained || scp.roomId === room.id) && SCPGame.getCompatibleRooms(state, scp).some((entry) => entry.id === room.id));
        if (candidates.length === 0)
            return `<p class="hint">Aucun dossier compatible disponible pour cette cellule.</p>`;
        return `<div class="transfer-list"><h3>Transferts compatibles</h3>${candidates.map((scp) => {
            const definition = SCPGame.getSCPDefinition(scp.definitionId);
            return `<button data-action="transfer-scp" data-scp="${scp.id}" data-room="${room.id}"><strong>${definition.designation}</strong><span>${escapeHtml(definition.name)} · ${definition.objectClass}</span></button>`;
        }).join("")}</div>`;
    }
    function renderUncontainedScps(state) {
        const available = state.scps.filter((scp) => scp.discovered && !scp.contained);
        if (available.length === 0)
            return "";
        return `<section class="summary-card"><h3>Dossiers en attente</h3><div class="transfer-list">${available.slice(0, 6).map((scp) => {
            const definition = SCPGame.getSCPDefinition(scp.definitionId);
            return `<button data-action="focus-scp" data-scp="${scp.id}"><strong>${definition.designation}</strong><span>${escapeHtml(definition.name)} · risque ${definition.risk}</span></button>`;
        }).join("")}</div></section>`;
    }
    function updateManagementOverlay(runtime) {
        const overlay = document.getElementById("management-overlay");
        if (!overlay)
            return;
        const canvas = document.getElementById("game-canvas");
        const managementActive = runtime.state.view === "management";
        if (canvas) {
            canvas.inert = managementActive;
            canvas.tabIndex = managementActive ? -1 : 0;
            canvas.toggleAttribute("aria-hidden", managementActive);
        }
        if (!managementActive) {
            overlay.classList.add("hidden");
            return;
        }
        overlay.classList.remove("hidden");
        const state = runtime.state;
        const tab = String(state.flags["management-tab"] ?? "dashboard");
        replaceHtmlPreservingInteraction(overlay, `
      <div class="management-shell">
        <nav class="management-tabs">
          ${managementTabButton("dashboard", "Tableau de bord", tab)}
          ${managementTabButton("staff", "Personnel", tab)}
          ${managementTabButton("scps", "Dossiers SCP", tab)}
          ${managementTabButton("research", "Recherche", tab)}
          ${managementTabButton("campaign", "Campagne", tab)}
          ${managementTabButton("reports", "Rapports", tab)}
          ${managementTabButton("settings", "Sauvegarde", tab)}
        </nav>
        <div class="management-content" data-preserve-scroll="management-content">${renderManagementTab(state, tab)}</div>
      </div>
    `);
    }
    function managementTabButton(id, label, active) {
        return `<button data-action="management-tab" data-tab="${id}" class="${id === active ? "active" : ""}">${escapeHtml(label)}</button>`;
    }
    function renderManagementTab(state, tab) {
        switch (tab) {
            case "staff": return renderStaffManagement(state);
            case "scps": return renderScpManagement(state);
            case "research": return renderResearchManagement(state);
            case "campaign": return renderCampaignManagement(state);
            case "reports": return renderReports(state);
            case "settings": return renderSettings(state);
            default: return renderDashboard(state);
        }
    }
    function renderDashboard(state) {
        const active = state.staff.filter((member) => member.status !== "dead");
        const averageFatigue = active.reduce((sum, member) => sum + member.needs.fatigue, 0) / Math.max(1, active.length);
        const averageStress = active.reduce((sum, member) => sum + member.needs.stress, 0) / Math.max(1, active.length);
        const activeScps = state.scps.filter((scp) => scp.contained);
        const averageCompliance = activeScps.reduce((sum, scp) => sum + SCPGame.evaluateProcedureCompliance(state, scp), 0) / Math.max(1, activeScps.length);
        return `
      <div class="dashboard-grid">
        <section><h2>Site Deep Protocol</h2><p>${SCPGame.formatTime(state.day, state.minuteOfDay)} · ${state.mode === "campaign" ? "Campagne" : "Bac à sable"} · difficulté ${state.settings.difficulty}</p>${renderReputationOverview(state)}</section>
        <section><h3>Capacité humaine</h3>${renderMetricGrid([["Actifs", String(active.length)], ["Fatigue moyenne", percent(averageFatigue)], ["Stress moyen", percent(averageStress)], ["Décès", String(state.staff.filter((member) => member.status === "dead").length)]])}</section>
        <section><h3>Confinement</h3>${renderMetricGrid([["SCP actifs", String(activeScps.length)], ["Conformité", percent(averageCompliance)], ["Incidents", String(state.scps.reduce((sum, scp) => sum + scp.incidents, 0))], ["Cellules", String(state.undergroundRooms.filter((room) => SCPGame.getUndergroundDefinition(room.type).containment >= 4).length)]])}</section>
        <section><h3>Stocks critiques</h3>${renderMetricGrid([["Rations", SCPGame.formatNumber(state.resources.food)], ["Médical", SCPGame.formatNumber(state.resources.medical)], ["Pièces", SCPGame.formatNumber(state.resources.parts)], ["Chimie", SCPGame.formatNumber(state.resources.chemicals)]])}</section>
      </div>
    `;
    }
    function renderStaffManagement(state) {
        const roles = Object.keys(SCPGame.ROLE_LABELS);
        return `
      <div class="management-header"><div><h2>Personnel</h2><p>Recrutement, formation, habilitations, santé et charge opérationnelle.</p></div></div>
      <div class="hire-strip">${roles.filter((role) => role !== "director").map((role) => `<button data-action="hire-staff" data-role="${role}">+ ${SCPGame.ROLE_LABELS[role]}</button>`).join("")}</div>
      <div class="data-table staff-table">
        <div class="table-row table-head"><span>Nom</span><span>Rôle</span><span>État</span><span>Moral</span><span>Fatigue</span><span>Actions</span></div>
        ${state.staff.map((member) => `
          <div class="table-row">
            <span><i class="role-dot" style="background:${SCPGame.roleColor(member.role)}"></i>${escapeHtml(member.name)}<small>Niv. ${member.clearance} · loyauté ${Math.round(member.loyalty)} · ${member.traits.map(escapeHtml).join(", ")}</small></span>
            <span>${SCPGame.ROLE_LABELS[member.role]}<small>${member.shift === "day" ? "Jour" : "Nuit"}</small></span>
            <span>${escapeHtml(member.status)}${member.compromised ? "<small class=\"status-danger\">risque interne</small>" : ""}</span>
            <span>${Math.round(member.needs.morale)}%</span>
            <span>${Math.round(member.needs.fatigue)}%</span>
            <span><button data-action="select-staff" data-staff="${member.id}">Voir</button><button data-action="train-staff" data-staff="${member.id}">Former</button><button data-action="vet-staff" data-staff="${member.id}">Vérifier</button></span>
          </div>
        `).join("")}
      </div>
    `;
    }
    function renderScpManagement(state) {
        return `
      <div class="management-header"><div><h2>Dossiers SCP</h2><p>Connaissance, cellule, risque et procédure de confinement.</p></div></div>
      <div class="scp-management-grid">
        ${state.scps.filter((scp) => scp.discovered).map((scp) => {
            const definition = SCPGame.getSCPDefinition(scp.definitionId);
            const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
            const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
            return `
            <article class="scp-management-card" style="--class-color:${SCPGame.objectClassColor(definition.objectClass)}">
              <header><strong>${definition.designation}</strong><span>${definition.objectClass}</span></header>
              <h3>${escapeHtml(definition.name)}</h3>
              <p>${escapeHtml(definition.description)}</p>
              ${renderMetricGrid([["Confiné", scp.contained ? "Oui" : "Non"], ["Risque", percent(scp.breachRisk)], ["Connaissance", percent(scp.knowledge)], ["Cellule", room ? `-${room.level + 1}` : "—"]])}
              <div class="action-row"><button data-action="open-procedure" data-scp="${scp.id}">Procédure v${procedure?.version ?? 1}</button>${!scp.contained ? `<button data-action="focus-scp" data-scp="${scp.id}">Transférer</button>` : ""}</div>
            </article>
          `;
        }).join("")}
      </div>
    `;
    }
    function renderResearchManagement(state) {
        return `
      <div class="management-header"><div><h2>Recherche</h2><p>${SCPGame.formatNumber(state.resources.research)} points disponibles. Les technologies déverrouillent de véritables capacités de construction et de procédure.</p></div></div>
      <div class="research-grid">
        ${state.researchNodes.map((node) => {
            const prerequisitesMet = node.prerequisites.every((id) => state.researchNodes.some((entry) => entry.id === id && entry.completed));
            return `<article class="research-card ${node.completed ? "completed" : prerequisitesMet ? "available" : "locked"}"><span>${escapeHtml(node.category)}</span><h3>${escapeHtml(node.name)}</h3><p>${escapeHtml(node.description)}</p><small>Coût ${node.cost} · Prérequis ${node.prerequisites.length || "aucun"}</small>${node.completed ? `<b>TERMINÉE</b>` : `<button data-action="research" data-node="${node.id}" ${prerequisitesMet ? "" : "disabled"}>Rechercher</button>`}</article>`;
        }).join("")}
      </div>
    `;
    }
    function renderCampaignManagement(state) {
        if (state.mode === "sandbox")
            return `<div class="management-header"><div><h2>Bac à sable</h2><p>Tous les chapitres et dossiers sont autorisés. Les objectifs de campagne sont désactivés.</p></div></div>`;
        return `
      <div class="management-header"><div><h2>Directives de campagne</h2><p>Progression stratégique du mandat de directeur.</p></div></div>
      <div class="campaign-list">
        ${state.campaign.map((chapter) => `<article class="chapter-card ${chapter.complete ? "complete" : chapter.index === state.currentChapter ? "current" : chapter.index > state.currentChapter ? "locked" : ""}"><header><span>${chapter.index.toString().padStart(2, "0")}</span><div><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.briefing)}</p></div></header>${chapter.objectives.map((objective) => `<div class="objective-line ${objective.complete ? "complete" : ""}"><span>${objective.complete ? "✓" : "○"}</span><div><strong>${escapeHtml(objective.title)}</strong><small>${escapeHtml(objective.description)}</small></div><b>${SCPGame.round(objective.progress, 1)}/${objective.target}</b></div>`).join("")}</article>`).join("")}
      </div>
    `;
    }
    function renderReports(state) {
        return `
      <div class="management-header"><div><h2>Rapports et journal</h2><p>Reconstitution des événements, décisions et incidents du Site.</p></div></div>
      <div class="reports-layout">
        <section><h3>Historique opérationnel</h3><div class="report-log">${state.history.map((line) => `<p>${escapeHtml(line)}</p>`).join("") || "<p>Aucun rapport.</p>"}</div></section>
        <section><h3>Notifications</h3><div class="report-log">${state.notifications.map((note) => `<p><b>${escapeHtml(note.title)}</b><br>${escapeHtml(note.message)}</p>`).join("")}</div></section>
      </div>
    `;
    }
    function renderSettings(state) {
        return `
      <div class="management-header"><div><h2>Sauvegarde et paramètres</h2><p>La sauvegarde automatique s'effectue toutes les six heures de jeu.</p></div></div>
      <div class="settings-grid">
        <section><h3>Partie</h3><button class="wide-button" data-action="save">Sauvegarder</button><button class="wide-button" data-action="load">Charger</button><button class="wide-button" data-action="export">Exporter en JSON</button><button class="wide-button" data-action="import">Importer une sauvegarde</button><button class="wide-button danger" data-action="new-game">Nouvelle partie</button></section>
        <section><h3>Accessibilité</h3>${renderToggle("audio", "Audio procédural", state.settings.audio)}${renderToggle("auto-pause", "Pause automatique critique", state.settings.autoPauseCritical)}${renderToggle("reduced-motion", "Mouvements réduits", state.settings.reducedMotion)}${renderToggle("high-contrast", "Contraste renforcé", state.settings.highContrast)}${renderToggle("tutorial", "Conseils contextuels", state.settings.tutorial)}</section>
        <section><h3>Informations</h3><p>Version ${SCPGame.GAME_VERSION}</p><p>Graine ${state.seed}</p><p>Difficulté ${state.settings.difficulty}</p><p>Mode ${state.mode}</p><button class="wide-button" data-action="credits">Attribution et licence</button></section>
      </div>
    `;
    }
    function renderToggle(key, label, checked) {
        return `<label class="toggle-row"><span>${escapeHtml(label)}</span><input type="checkbox" data-setting="${key}" ${checked ? "checked" : ""}><i></i></label>`;
    }
    function updateNotifications(state) {
        const badge = document.getElementById("notification-count");
        const unread = state.notifications.filter((note) => !note.read).length;
        if (badge) {
            badge.textContent = String(unread);
            badge.classList.toggle("hidden", unread === 0);
        }
    }
    function updateModal(runtime) {
        const root = document.getElementById("modal-root");
        if (!root)
            return;
        const state = runtime.state;
        const currentEvent = state.currentEventId ? state.events.find((entry) => entry.id === state.currentEventId && !entry.resolved) : undefined;
        if (currentEvent)
            modalMode = "event";
        if (modalMode === "none") {
            setPageInert(false);
            root.classList.add("hidden");
            if (root.innerHTML)
                root.innerHTML = "";
            if (renderedModalKey && modalReturnFocus?.isConnected)
                modalReturnFocus.focus({ preventScroll: true });
            modalReturnFocus = undefined;
            renderedModalKey = "";
            return;
        }
        setPageInert(true);
        root.classList.remove("hidden");
        root.tabIndex = -1;
        const modalKey = modalMode === "event" && currentEvent ? `event:${currentEvent.id}` : modalMode === "procedure" ? `procedure:${procedureScpId}:${state.procedures.find((procedure) => procedure.scpId === procedureScpId || state.scps.find((scp) => scp.id === procedureScpId)?.procedureId === procedure.id)?.version ?? 0}` : modalMode;
        if (modalKey === renderedModalKey)
            return;
        if (modalMode === "event" && currentEvent)
            root.innerHTML = renderEventModal(state, currentEvent);
        else if (modalMode === "procedure")
            root.innerHTML = renderProcedureModal(state, procedureScpId);
        else if (modalMode === "import")
            root.innerHTML = renderImportModal();
        else if (modalMode === "new-game")
            root.innerHTML = renderNewGameModal();
        else if (modalMode === "help")
            root.innerHTML = renderHelpModal();
        else if (modalMode === "credits")
            root.innerHTML = renderCreditsModal();
        else {
            modalMode = "none";
            root.classList.add("hidden");
            renderedModalKey = "";
            return;
        }
        renderedModalKey = modalKey;
        root.setAttribute("aria-labelledby", root.querySelector("h2")?.id || "modal-title");
        window.setTimeout(() => (root.querySelector("button, input, select, textarea") ?? root).focus?.(), 0);
    }
    function renderEventModal(state, event) {
        return `<div class="modal-card event-modal ${event.severity}"><header><span>${event.severity.toUpperCase()}</span><h2 id="modal-title">${escapeHtml(event.title)}</h2></header><p>${escapeHtml(event.body)}</p><div class="event-choices">${event.choices.map((choice) => `<button data-action="event-choice" data-event="${event.id}" data-choice="${choice.id}"><strong>${escapeHtml(choice.label)}</strong><span>${escapeHtml(choice.description)}</span>${choice.cost ? `<small>${escapeHtml(SCPGame.costToString(choice.cost))}</small>` : ""}</button>`).join("")}</div></div>`;
    }
    function renderProcedureModal(state, scpId) {
        const scp = state.scps.find((entry) => entry.id === scpId || entry.definitionId === scpId);
        if (!scp)
            return `<div class="modal-card"><p>Dossier introuvable.</p><button data-action="close-modal">Fermer</button></div>`;
        const definition = SCPGame.getSCPDefinition(scp.definitionId);
        const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
        if (!procedure)
            return `<div class="modal-card"><p>Procédure introuvable.</p><button data-action="close-modal">Fermer</button></div>`;
        const requiredStaff = Object.values(definition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0);
        const minimumTraining = SCPGame.clamp(18 + definition.risk * 4, 20, 78);
        const assignedActual = state.undergroundRooms.find((room) => room.id === scp.roomId)?.staffAssigned.length ?? 0;
        return `
      <div class="modal-card procedure-modal">
        <header><div><span>PROCÉDURE v${procedure.version}</span><h2 id="modal-title">${definition.designation} — ${escapeHtml(definition.name)}</h2></div><button data-action="close-modal" aria-label="Fermer">×</button></header>
        <p>${escapeHtml(definition.uniqueRule)}</p>
        <div class="procedure-layout">
          <section>
            ${renderRange("observationLevel", "Niveau d'observation", procedure.observationLevel)}
            ${renderRange("assignedStaff", "Effectif prévu", procedure.assignedStaff, requiredStaff, Math.min(18, requiredStaff + 3))}
            ${renderRange("maintenanceFrequency", "Fréquence de maintenance", procedure.maintenanceFrequency, 20, 100)}
            ${renderRange("trainingRequired", "Formation exigée", procedure.trainingRequired, minimumTraining, 100)}
            ${renderMetricGrid([["Effectif réel", `${assignedActual} / ${procedure.assignedStaff}`], ["Complexité calculée", percent(procedure.complexity)]])}
          </section>
          <section class="procedure-checks">
            ${procedureCheck(state, "backupPower", "Alimentation de secours", procedure.backupPower)}
            ${procedureCheck(state, "analogBackup", "Sauvegarde analogique", procedure.analogBackup)}
            ${procedureCheck(state, "biometricMonitoring", "Suivi biométrique", procedure.biometricMonitoring)}
            ${procedureCheck(state, "opticalMonitoring", "Surveillance optique", procedure.opticalMonitoring)}
            ${procedureCheck(state, "automatedLockdown", "Verrouillage automatique", procedure.automatedLockdown)}
            ${procedureCheck(state, "humaneCare", "Conditions coopératives", procedure.humaneCare)}
            ${procedureCheck(state, "restrictedTesting", "Tests strictement autorisés", procedure.restrictedTesting)}
            ${procedureCheck(state, "isolatedNetwork", "Réseau isolé", procedure.isolatedNetwork)}
            ${procedureCheck(state, "redundantVentilation", "Ventilation redondante", procedure.redundantVentilation)}
          </section>
        </div>
        <label class="notes-field">Notes et addenda<textarea id="procedure-notes">${escapeHtml(procedure.notes)}</textarea></label>
        <footer><div>${renderProgressMetric("Conformité actuelle", SCPGame.evaluateProcedureCompliance(state, scp))}</div><button data-action="save-procedure" data-scp="${scp.id}">Enregistrer la nouvelle version</button></footer>
      </div>
    `;
    }
    function renderRange(key, label, value, min = 0, max = 100) {
        return `<label class="range-row"><span>${escapeHtml(label)} <b data-range-value="${String(key)}">${Math.round(value)}</b></span><input type="range" min="${min}" max="${max}" value="${value}" data-procedure-range="${String(key)}"></label>`;
    }
    function procedureCheck(state, key, label, checked) {
        const unlocked = SCPGame.isProcedureOptionUnlocked(state, key);
        const unlock = SCPGame.getProcedureOptionUnlock(key);
        const research = state.researchNodes.find((node) => unlock && node.unlocks.includes(unlock));
        const lockedLabel = unlocked ? "" : ` — recherche : ${research?.name ?? unlock}`;
        return `<label title="${escapeHtml(lockedLabel)}"><input type="checkbox" data-procedure-check="${String(key)}" ${checked ? "checked" : ""} ${unlocked ? "" : "disabled"}><span>${escapeHtml(label)}${unlocked ? "" : `<small>${escapeHtml(lockedLabel)}</small>`}</span></label>`;
    }
    function renderImportModal() {
        return `<div class="modal-card"><header><h2 id="modal-title">Importer une sauvegarde</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><p>Sélectionnez un fichier JSON exporté par le jeu.</p><button class="wide-button" data-action="choose-import">Choisir le fichier</button></div>`;
    }
    function renderNewGameModal() {
        return `<div class="modal-card new-game-modal"><header><h2 id="modal-title">Nouvelle direction de Site</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><label>Mode<select id="new-mode"><option value="campaign">Campagne Deep Protocol</option><option value="sandbox">Bac à sable complet</option></select></label><label>Difficulté<select id="new-difficulty"><option value="story">Narratif</option><option value="standard" selected>Standard</option><option value="director">Directeur</option><option value="keter">Keter</option></select></label><p>La partie actuelle reste disponible seulement si vous la sauvegardez avant de recommencer.</p><button class="wide-button danger" data-action="confirm-new-game">Créer le Site</button></div>`;
    }
    function renderHelpModal() {
        return `<div class="modal-card help-modal"><header><h2 id="modal-title">Manuel opérationnel</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><div class="help-grid"><section><h3>1. Région</h3><p>Construisez une couverture cohérente, sécurisez les accès et produisez énergie, eau et fournitures.</p></section><section><h3>2. Surface</h3><p>Placez les salles, maîtrisez les files et évitez que le personnel épuisé compromette les opérations.</p></section><section><h3>3. Sous-sol</h3><p>Construisez une cellule adaptée, transférez le SCP puis révisez sa procédure selon les risques réels.</p></section><section><h3>4. Crise</h3><p>Sélectionnez une zone et combinez verrouillage, évacuation, sécurité, FTM, énergie et décontamination.</p></section></div><p><kbd>1</kbd> Région · <kbd>2</kbd> Surface · <kbd>3</kbd> Sous-sol · <kbd>4</kbd> Commandement · <kbd>5</kbd> Gestion · <kbd>Espace</kbd> Pause · <kbd>Échap</kbd> Annuler</p><button class="wide-button" data-action="credits">Attribution et licence</button></div>`;
    }
    function renderCreditsModal() {
        return `<div class="modal-card help-modal"><header><h2 id="modal-title">Attribution et licence</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><p>SCP Foundation: Site Director est une adaptation non officielle de l'univers SCP Foundation. Le jeu, son code, ses textes dérivés et ses assets originaux sont distribués sous Creative Commons Attribution-ShareAlike 3.0.</p><div class="help-grid"><section><h3>Sources SCP</h3><p>Contenus de référence issus du SCP Wiki pour SCP-008, SCP-049, SCP-087, SCP-096, SCP-106, SCP-131, SCP-173, SCP-294, SCP-682, SCP-914, SCP-939 et SCP-999. Les auteurs et liens détaillés restent disponibles hors ligne.</p></section><section><h3>Assets</h3><p>Aucun visuel officiel du wiki SCP n'est copié. L'interface, les symboles, les rendus Canvas et l'audio sont originaux ou générés procéduralement pour ce jeu.</p></section></div><p><a href="./ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">Attributions détaillées</a> · <a href="./LICENSE.md" target="_blank" rel="noopener noreferrer">Avis de licence</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">Texte CC BY-SA 3.0</a> · <a href="https://github.com/darknigthmare/scp-foundation-site-director" target="_blank" rel="noopener noreferrer">Code source</a></p></div>`;
    }
    function updateEndScreen(state) {
        const root = document.getElementById("end-screen");
        if (!root)
            return;
        if (!state.gameOver && !state.victory) {
            root.classList.add("hidden");
            if (root.innerHTML)
                root.innerHTML = "";
            renderedEndScreenKey = "";
            setPageInert(modalMode !== "none");
            return;
        }
        const key = state.victory ? "victory" : "game-over";
        if (renderedEndScreenKey === key)
            return;
        root.classList.remove("hidden");
        root.innerHTML = `<div><span>${state.victory ? "MANDAT ACCOMPLI" : "DIRECTION RÉVOQUÉE"}</span><h1>${state.victory ? "SITE DEEP PROTOCOL" : "RUPTURE DU VOILE"}</h1><p>${state.victory ? "Votre installation est devenue un modèle régional capable de contenir les menaces terminales." : "Le Site ne peut plus poursuivre son activité sous cette couverture."}</p>${state.victory ? `<button data-action="continue-after-victory">Continuer le Site</button>` : ""}<button data-action="new-game">Nouvelle partie</button><button data-action="load">Charger</button></div>`;
        renderedEndScreenKey = key;
        setPageInert(modalMode !== "none");
    }
    function handleDelegatedClick(event) {
        const target = event.target.closest("[data-action], button[data-view], [data-speed]");
        if (!target || !activeRuntime)
            return;
        const runtime = activeRuntime;
        const state = runtime.state;
        if (target.dataset.view) {
            SCPGame.setView(state, target.dataset.view);
            runtime.uiDirty = true;
            refreshUI(runtime, true);
            return;
        }
        if (target.dataset.speed !== undefined) {
            SCPGame.setSpeed(state, Number(target.dataset.speed));
            runtime.uiDirty = true;
            return;
        }
        const action = target.dataset.action;
        if (!action)
            return;
        if (["help", "open-procedure", "import", "new-game", "credits"].includes(action))
            prepareModal(state, target);
        let result;
        switch (action) {
            case "pause":
                SCPGame.togglePause(state);
                break;
            case "help":
                modalMode = "help";
                break;
            case "close-modal":
                closeModal(state);
                break;
            case "toggle-panel": {
                const panel = document.getElementById("right-panel");
                const open = !panel?.classList.contains("mobile-open");
                panel?.classList.toggle("mobile-open", open);
                target.setAttribute("aria-expanded", String(open));
                target.textContent = open ? "Masquer" : "Détails";
                break;
            }
            case "build":
                SCPGame.startBuild(state, target.dataset.layer, target.dataset.type);
                break;
            case "cancel-build":
                SCPGame.cancelBuild(state);
                break;
            case "upgrade-selected":
                result = SCPGame.upgradeSelected(state);
                break;
            case "repair-selected":
                result = SCPGame.repairSelected(state);
                break;
            case "demolish-selected":
                result = SCPGame.demolishSelected(state);
                break;
            case "select-staff": {
                state.selectedId = target.dataset.staff;
                state.selectedType = "staff";
                state.view = "surface";
                break;
            }
            case "hire-staff":
                result = SCPGame.hireStaff(state, target.dataset.role);
                break;
            case "train-staff":
                result = SCPGame.trainStaff(state, String(target.dataset.staff));
                break;
            case "set-shift":
                result = SCPGame.setStaffShift(state, String(target.dataset.staff), target.dataset.shift === "night" ? "night" : "day");
                break;
            case "vet-staff":
                result = SCPGame.vetStaff(state, String(target.dataset.staff));
                break;
            case "dismiss-staff":
                result = SCPGame.dismissStaff(state, String(target.dataset.staff));
                break;
            case "research":
                result = SCPGame.researchNode(state, String(target.dataset.node));
                break;
            case "transfer-scp":
                result = SCPGame.transferSCP(state, String(target.dataset.scp), String(target.dataset.room));
                break;
            case "focus-scp":
                focusSCPForTransfer(state, String(target.dataset.scp));
                break;
            case "open-procedure":
                procedureScpId = String(target.dataset.scp);
                modalMode = "procedure";
                break;
            case "save-procedure":
                result = saveProcedureFromModal(state, String(target.dataset.scp));
                if (result.ok)
                    closeModal(state);
                break;
            case "event-choice":
                result = SCPGame.resolveEventChoice(state, String(target.dataset.event), String(target.dataset.choice));
                modalMode = "none";
                modalPausedGame = false;
                break;
            case "management-tab":
                state.flags["management-tab"] = String(target.dataset.tab);
                break;
            case "crisis-order":
                result = SCPGame.issueCrisisOrder(state, target.dataset.order, String(target.dataset.zone));
                break;
            case "select-zone":
                state.selectedId = String(target.dataset.zone);
                state.selectedType = "zone";
                break;
            case "resume-crisis":
                SCPGame.togglePause(state);
                break;
            case "start-drill":
                SCPGame.startCrisis(state, String(target.dataset.drill));
                break;
            case "ack-crisis":
                state.crisis = SCPGame.createEmptyCrisis();
                break;
            case "save":
                result = { ok: SCPGame.saveGame(state), message: "Sauvegarde locale enregistrée." };
                break;
            case "load": {
                const loaded = SCPGame.loadLatestGame();
                if (loaded) {
                    runtime.state = loaded;
                    activeRuntime.state = loaded;
                    hideStartScreen();
                    result = { ok: true, message: "Sauvegarde chargée." };
                }
                else
                    result = { ok: false, message: "Aucune sauvegarde disponible." };
                break;
            }
            case "export":
                SCPGame.exportSave(state);
                result = { ok: true, message: "Sauvegarde exportée." };
                break;
            case "import":
                modalMode = "import";
                break;
            case "choose-import":
                document.getElementById("import-file")?.click();
                break;
            case "new-game":
                modalMode = "new-game";
                break;
            case "confirm-new-game":
                createGameFromModal(runtime);
                break;
            case "continue-after-victory":
                SCPGame.continueAfterVictory(state);
                break;
            case "credits":
                modalMode = "credits";
                break;
            case "open-notifications":
                openNotifications(state);
                break;
        }
        if (result)
            showToast(result.message, result.ok ? "success" : "error");
        runtime.uiDirty = true;
        refreshUI(runtime, true);
    }
    function handleDelegatedChange(event) {
        if (!activeRuntime)
            return;
        const input = event.target;
        if (!input.dataset.setting)
            return;
        const state = activeRuntime.state;
        const key = input.dataset.setting;
        if (key === "audio")
            state.settings.audio = input.checked;
        if (key === "auto-pause")
            state.settings.autoPauseCritical = input.checked;
        if (key === "reduced-motion")
            state.settings.reducedMotion = input.checked;
        if (key === "high-contrast") {
            state.settings.highContrast = input.checked;
            document.body.classList.toggle("high-contrast", input.checked);
        }
        if (key === "tutorial")
            state.settings.tutorial = input.checked;
        activeRuntime.uiDirty = true;
        activeRuntime.canvasDirty = true;
    }
    function handleDelegatedInput(event) {
        const input = event.target;
        const key = input.dataset.procedureRange;
        if (!key)
            return;
        const label = document.querySelector(`[data-range-value="${key}"]`);
        if (label)
            label.textContent = input.value;
    }
    function handleKeyboard(event) {
        if (!activeRuntime)
            return;
        const state = activeRuntime.state;
        if (modalMode !== "none") {
            if (event.key === "Tab")
                trapModalFocus(event);
            else if (event.key === "Escape" && modalMode !== "event") {
                event.preventDefault();
                closeModal(state);
                activeRuntime.uiDirty = true;
                refreshUI(activeRuntime, true);
            }
            return;
        }
        if (!document.getElementById("start-screen")?.classList.contains("hidden"))
            return;
        const target = event.target;
        if (target.closest("button, a, input, textarea, select, [contenteditable='true']"))
            return;
        const views = { "1": "region", "2": "surface", "3": "underground", "4": "command", "5": "management" };
        let handled = true;
        if (views[event.key])
            SCPGame.setView(state, views[event.key]);
        else if (event.code === "Space") {
            event.preventDefault();
            SCPGame.togglePause(state);
        }
        else if (event.key === "Escape")
            SCPGame.cancelBuild(state);
        else if (event.key === "+" || event.key === "=")
            SCPGame.setSpeed(state, Math.min(4, state.speed === 0 ? 1 : state.speed * 2));
        else if (event.key === "-")
            SCPGame.setSpeed(state, Math.max(0, state.speed / 2));
        else
            handled = false;
        if (!handled)
            return;
        activeRuntime.uiDirty = true;
        refreshUI(activeRuntime, true);
    }
    function trapModalFocus(event) {
        const root = document.getElementById("modal-root");
        if (!root)
            return;
        const focusable = Array.from(root.querySelectorAll("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"))
            .filter((element) => !element.classList.contains("hidden"));
        if (focusable.length === 0) {
            event.preventDefault();
            root.focus();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        }
        else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
    function handleImportFile(event) {
        const input = event.target;
        const file = input.files?.[0];
        if (!file || !activeRuntime)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            const imported = SCPGame.importSave(String(reader.result ?? ""));
            if (imported && activeRuntime) {
                activeRuntime.state = imported;
                modalMode = "none";
                modalPausedGame = false;
                showToast("Sauvegarde importée.", "success");
                refreshUI(activeRuntime, true);
            }
            else
                showToast("Fichier incompatible.", "error");
        };
        reader.readAsText(file);
        input.value = "";
    }
    function saveProcedureFromModal(state, scpId) {
        const updates = {};
        document.querySelectorAll("[data-procedure-range]").forEach((input) => {
            const key = input.dataset.procedureRange;
            updates[key] = Number(input.value);
        });
        document.querySelectorAll("[data-procedure-check]").forEach((input) => {
            const key = input.dataset.procedureCheck;
            updates[key] = input.checked;
        });
        const notes = document.getElementById("procedure-notes");
        updates.notes = notes?.value ?? "";
        return SCPGame.updateProcedure(state, scpId, updates);
    }
    function focusSCPForTransfer(state, scpId) {
        const scp = state.scps.find((entry) => entry.id === scpId);
        if (!scp)
            return;
        const room = SCPGame.getCompatibleRooms(state, scp).find((entry) => !entry.scpId);
        state.view = "underground";
        if (room) {
            state.selectedId = room.id;
            state.selectedType = "underground-room";
        }
        else {
            const definition = SCPGame.getSCPDefinition(scp.definitionId);
            showToast(`Construisez une cellule avec : ${definition.requirements.roomTags.join(", ")}.`, "error");
        }
    }
    function createGameFromModal(runtime) {
        const mode = document.getElementById("new-mode")?.value;
        const difficulty = document.getElementById("new-difficulty")?.value;
        runtime.state = SCPGame.createNewGame(mode || "campaign", difficulty || "standard");
        modalMode = "none";
        modalPausedGame = false;
        hideStartScreen();
        showToast("Nouveau Site créé.", "success");
    }
    function openNotifications(state) {
        state.notifications.forEach((note) => note.read = true);
        state.flags["management-tab"] = "reports";
        state.view = "management";
    }
    function showToast(message, type = "info") {
        const toast = document.getElementById("toast");
        if (!toast)
            return;
        toast.textContent = message;
        toast.className = `toast ${type} visible`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");
        window.setTimeout(() => toast.classList.remove("visible"), type === "error" ? 6000 : 3200);
    }
    SCPGame.showToast = showToast;
    function setText(id, value) {
        const element = document.getElementById(id);
        if (element && element.textContent !== value)
            element.textContent = value;
    }
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    class ProceduralAudio {
        constructor() {
            this.lastCrisis = false;
            this.lastClickAt = 0;
        }
        ensure() {
            if (!this.context)
                this.context = new AudioContext();
            if (this.context.state === "suspended")
                void this.context.resume();
        }
        click(enabled) {
            if (!enabled || Date.now() - this.lastClickAt < 45)
                return;
            this.lastClickAt = Date.now();
            this.tone(420, 0.025, 0.025);
        }
        notify(enabled, critical = false) {
            if (!enabled)
                return;
            this.tone(critical ? 175 : 620, critical ? 0.22 : 0.07, critical ? 0.08 : 0.035);
            if (critical)
                window.setTimeout(() => this.tone(140, 0.28, 0.07), 180);
        }
        update(state) {
            if (state.crisis.active && !this.lastCrisis)
                this.notify(state.settings.audio, true);
            this.lastCrisis = state.crisis.active;
        }
        tone(frequency, duration, gainValue) {
            try {
                this.ensure();
                if (!this.context)
                    return;
                const oscillator = this.context.createOscillator();
                const gain = this.context.createGain();
                oscillator.type = "square";
                oscillator.frequency.value = frequency;
                gain.gain.setValueAtTime(gainValue, this.context.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
                oscillator.connect(gain);
                gain.connect(this.context.destination);
                oscillator.start();
                oscillator.stop(this.context.currentTime + duration);
            }
            catch {
                // Le jeu reste pleinement jouable si le navigateur bloque l'audio.
            }
        }
    }
    function boot() {
        const canvas = document.getElementById("game-canvas");
        if (!canvas)
            throw new Error("Canvas principal introuvable.");
        const context = canvas.getContext("2d");
        if (!context)
            throw new Error("Contexte 2D indisponible.");
        const loaded = SCPGame.loadLatestGame();
        const state = loaded ?? SCPGame.createNewGame("campaign", "standard");
        state.speed = 0;
        const runtime = {
            state,
            canvas,
            context,
            lastFrame: performance.now(),
            accumulator: 0,
            pointerDown: false,
            uiDirty: true,
            canvasDirty: true,
            animationFrame: 0
        };
        const audio = new ProceduralAudio();
        SCPGame.initializeUI(runtime);
        bindCanvas(runtime, audio);
        bindGlobalAudio(audio, runtime);
        SCPGame.showStartScreen();
        SCPGame.renderCanvas(runtime);
        runtime.canvasDirty = false;
        const frame = (time) => {
            const deltaSeconds = Math.min(0.12, Math.max(0, (time - runtime.lastFrame) / 1000));
            runtime.lastFrame = time;
            if (runtime.state.speed > 0 && !runtime.state.gameOver && !runtime.state.victory) {
                runtime.accumulator += deltaSeconds * SCPGame.getSimulationMinutesPerRealSecond() * runtime.state.speed;
                const minutes = Math.floor(runtime.accumulator);
                if (minutes > 0) {
                    runtime.accumulator -= minutes;
                    SCPGame.advanceSimulation(runtime.state, minutes);
                    runtime.uiDirty = true;
                    runtime.canvasDirty = true;
                }
            }
            audio.update(runtime.state);
            if (!document.hidden && runtime.canvasDirty) {
                SCPGame.renderCanvas(runtime);
                runtime.canvasDirty = false;
            }
            if (runtime.uiDirty)
                SCPGame.refreshUI(runtime);
            runtime.animationFrame = requestAnimationFrame(frame);
        };
        runtime.animationFrame = requestAnimationFrame(frame);
        window.addEventListener("resize", () => {
            runtime.canvasDirty = true;
            runtime.uiDirty = true;
        });
        document.addEventListener("visibilitychange", () => {
            runtime.lastFrame = performance.now();
            if (!document.hidden) {
                runtime.canvasDirty = true;
                runtime.uiDirty = true;
            }
        });
        window.addEventListener("beforeunload", () => SCPGame.saveGame(runtime.state, true));
        if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
            navigator.serviceWorker.register("./service-worker.js").catch(() => undefined);
        }
    }
    function bindGlobalAudio(audio, runtime) {
        document.addEventListener("pointerdown", (event) => {
            const target = event.target;
            if (target.closest("button"))
                audio.click(runtime.state.settings.audio);
        }, { passive: true });
    }
    function bindCanvas(runtime, audio) {
        const canvas = runtime.canvas;
        let moved = false;
        let lastPointer;
        canvas.addEventListener("pointermove", (event) => {
            runtime.hoveredCell = hoverCellForView(runtime, event.clientX, event.clientY);
            runtime.canvasDirty = true;
            if (runtime.pointerDown && lastPointer) {
                const dx = event.clientX - lastPointer.x;
                const dy = event.clientY - lastPointer.y;
                if (Math.abs(dx) + Math.abs(dy) > 2)
                    moved = true;
                const camera = runtime.state.camera[runtime.state.view];
                if (["region", "surface", "underground"].includes(runtime.state.view)) {
                    camera.offsetX += dx;
                    camera.offsetY += dy;
                    runtime.canvasDirty = true;
                }
            }
            lastPointer = { x: event.clientX, y: event.clientY };
        });
        canvas.addEventListener("pointerdown", (event) => {
            runtime.pointerDown = true;
            moved = false;
            lastPointer = { x: event.clientX, y: event.clientY };
            runtime.dragStart = lastPointer;
            canvas.setPointerCapture(event.pointerId);
        });
        canvas.addEventListener("pointerup", (event) => {
            runtime.pointerDown = false;
            canvas.releasePointerCapture(event.pointerId);
            if (!moved) {
                audio.click(runtime.state.settings.audio);
                handleCanvasActivation(runtime, event.clientX, event.clientY);
            }
            lastPointer = undefined;
            runtime.dragStart = undefined;
            runtime.uiDirty = true;
            runtime.canvasDirty = true;
            SCPGame.refreshUI(runtime, true);
        });
        canvas.addEventListener("pointerleave", () => {
            if (!runtime.pointerDown) {
                runtime.hoveredCell = undefined;
                runtime.canvasDirty = true;
            }
        });
        canvas.addEventListener("wheel", (event) => {
            if (!["region", "surface", "underground"].includes(runtime.state.view))
                return;
            event.preventDefault();
            const camera = runtime.state.camera[runtime.state.view];
            const oldZoom = camera.zoom;
            camera.zoom = SCPGame.clamp(camera.zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.62, 1.5);
            const rect = canvas.getBoundingClientRect();
            const pointerX = event.clientX - rect.left - rect.width / 2;
            const pointerY = event.clientY - rect.top - rect.height / 2;
            const ratio = camera.zoom / oldZoom;
            camera.offsetX -= pointerX * (ratio - 1) * 0.35;
            camera.offsetY -= pointerY * (ratio - 1) * 0.35;
            runtime.canvasDirty = true;
        }, { passive: false });
        canvas.addEventListener("keydown", (event) => {
            if (["+", "=", "-", "PageUp", "PageDown"].includes(event.key)) {
                if (!["region", "surface", "underground"].includes(runtime.state.view))
                    return;
                event.preventDefault();
                event.stopPropagation();
                const camera = runtime.state.camera[runtime.state.view];
                const zoomIn = ["+", "=", "PageUp"].includes(event.key);
                camera.zoom = SCPGame.clamp(camera.zoom * (zoomIn ? 1.1 : 0.9), 0.62, 1.5);
                runtime.canvasDirty = true;
                announceCanvas(`Zoom ${Math.round(camera.zoom * 100)} %.`);
                return;
            }
            const bounds = gridBounds(runtime.state);
            if (!bounds)
                return;
            const current = runtime.hoveredCell ?? { x: Math.floor(bounds.width / 2), y: Math.floor(bounds.height / 2) };
            let next = { ...current };
            if (event.key === "ArrowLeft")
                next.x -= 1;
            else if (event.key === "ArrowRight")
                next.x += 1;
            else if (event.key === "ArrowUp")
                next.y -= 1;
            else if (event.key === "ArrowDown")
                next.y += 1;
            else if (event.key === "Home")
                next = { x: Math.floor(bounds.width / 2), y: Math.floor(bounds.height / 2) };
            else if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                audio.click(runtime.state.settings.audio);
                handleGridCellActivation(runtime, current);
                announceCanvas(`Case ${current.x + 1}, ${current.y + 1} activée.`);
                runtime.uiDirty = true;
                runtime.canvasDirty = true;
                SCPGame.refreshUI(runtime, true);
                return;
            }
            else
                return;
            event.preventDefault();
            event.stopPropagation();
            next.x = SCPGame.clamp(next.x, 0, bounds.width - 1);
            next.y = SCPGame.clamp(next.y, 0, bounds.height - 1);
            runtime.hoveredCell = next;
            runtime.canvasDirty = true;
            announceCanvas(`Curseur colonne ${next.x + 1}, ligne ${next.y + 1}.`);
        });
        canvas.addEventListener("blur", () => {
            runtime.hoveredCell = undefined;
            runtime.canvasDirty = true;
        });
    }
    function hoverCellForView(runtime, clientX, clientY) {
        if (runtime.state.view === "region")
            return SCPGame.screenToRegionCell(runtime, clientX, clientY);
        if (runtime.state.view === "surface")
            return SCPGame.screenToSurfaceCell(runtime, clientX, clientY);
        if (runtime.state.view === "underground")
            return SCPGame.screenToUndergroundCell(runtime, clientX, clientY);
        return undefined;
    }
    function handleCanvasActivation(runtime, clientX, clientY) {
        const cell = hoverCellForView(runtime, clientX, clientY);
        if (cell) {
            handleGridCellActivation(runtime, cell);
            return;
        }
        SCPGame.selectAtCanvas(runtime, clientX, clientY);
    }
    function handleGridCellActivation(runtime, cell) {
        const state = runtime.state;
        const build = state.buildSelection;
        let result;
        if (build && build.layer === "region" && state.view === "region") {
            result = SCPGame.buildRegionFacility(state, build.type, cell.x, cell.y);
        }
        else if (build && build.layer === "surface" && state.view === "surface") {
            result = SCPGame.buildSurfaceRoom(state, build.type, cell.x, cell.y);
        }
        else if (build && build.layer === "underground" && state.view === "underground") {
            result = SCPGame.buildUndergroundRoom(state, build.type, cell.x, cell.y);
        }
        else {
            SCPGame.selectAtGridCell(runtime, cell);
        }
        if (result)
            SCPGame.showToast(result.message, result.ok ? "success" : "error");
    }
    function gridBounds(state) {
        if (state.view === "region")
            return { width: state.regionWidth, height: state.regionHeight };
        if (state.view === "surface")
            return { width: state.surfaceWidth, height: state.surfaceHeight };
        if (state.view === "underground")
            return { width: state.undergroundWidth, height: state.undergroundLevels };
        return undefined;
    }
    function announceCanvas(message) {
        const status = document.getElementById("canvas-status");
        if (status)
            status.textContent = message;
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", boot);
    else
        boot();
})(SCPGame || (SCPGame = {}));
