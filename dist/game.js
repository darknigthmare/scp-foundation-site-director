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
        return a.level === b.level && (a.y ?? 14) === (b.y ?? 14)
            && a.x < b.x + b.width && a.x + a.width > b.x;
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
    function getManhattanPath(start, target, width, height, blocked, canStep) {
        // Callers choose which room cells are traversable. This grid helper never
        // overrides an obstacle, including one at the start or destination.
        const validCell = (point) => Number.isInteger(point.x) && Number.isInteger(point.y)
            && point.x >= 0 && point.y >= 0 && point.x < width && point.y < height;
        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0
            || !validCell(start) || !validCell(target)
            || blocked?.has(`${start.x},${start.y}`) || blocked?.has(`${target.x},${target.y}`))
            return [];
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
                if (blocked?.has(key))
                    continue;
                if (canStep && !canStep(current, next))
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
    SCPGame.SURFACE_TRAFFIC_TYPES = ["public", "staff", "security", "medical", "contaminated", "freight", "anomaly"];
    const ACCESS_WAIT_MINUTES = 60;
    function sameAccessCell(a, b) {
        return a.x === b.x && a.y === b.y;
    }
    function accessCellInBounds(state, point) {
        return Number.isInteger(point.x) && Number.isInteger(point.y)
            && point.x >= 0 && point.y >= 0 && point.x < state.surfaceWidth && point.y < state.surfaceHeight;
    }
    function getSurfaceAccessCells(room, access) {
        switch (access.side) {
            case "north": return { inside: { x: room.x + access.offset, y: room.y }, outside: { x: room.x + access.offset, y: room.y - 1 } };
            case "south": return { inside: { x: room.x + access.offset, y: room.y + room.height - 1 }, outside: { x: room.x + access.offset, y: room.y + room.height } };
            case "east": return { inside: { x: room.x + room.width - 1, y: room.y + access.offset }, outside: { x: room.x + room.width, y: room.y + access.offset } };
            case "west": return { inside: { x: room.x, y: room.y + access.offset }, outside: { x: room.x - 1, y: room.y + access.offset } };
        }
    }
    SCPGame.getSurfaceAccessCells = getSurfaceAccessCells;
    function isSurfaceAccessPassageClear(state, room, access) {
        const length = access.side === "north" || access.side === "south" ? room.width : room.height;
        if (!Number.isInteger(access.offset) || access.offset < 0 || access.offset >= length)
            return false;
        const cells = getSurfaceAccessCells(room, access);
        if (!accessCellInBounds(state, cells.inside) || !accessCellInBounds(state, cells.outside))
            return false;
        return !state.surfaceRooms.some((other) => other.id !== room.id
            && SCPGame.pointInRect(cells.outside, other.x, other.y, other.width, other.height)
            && (other.type !== "corridor" || !other.enabled));
    }
    SCPGame.isSurfaceAccessPassageClear = isSurfaceAccessPassageClear;
    // Deterministic migration: one free manual entrance per usable wall, nearest
    // its midpoint. Existing room, staff and save identities are never replaced.
    function createDefaultSurfaceAccesses(state, room) {
        if (room.type === "corridor")
            return [];
        const accesses = [];
        for (const side of ["north", "east", "south", "west"]) {
            const length = side === "north" || side === "south" ? room.width : room.height;
            const center = Math.floor(length / 2);
            const offsets = Array.from({ length }, (_, index) => index).sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b);
            const offset = offsets.find((candidate) => isSurfaceAccessPassageClear(state, room, { side, offset: candidate }));
            if (offset === undefined)
                continue;
            accesses.push({
                id: `access-${room.id}-${side}`, side, offset, kind: "door", enabled: true,
                minClearance: 0, allowedTraffic: [...SCPGame.SURFACE_TRAFFIC_TYPES], direction: "both",
                queueCapacity: 4, powered: true, airSupply: true, queue: [], passedCount: 0, paidFunds: 0, paidParts: 0
            });
        }
        return accesses;
    }
    SCPGame.createDefaultSurfaceAccesses = createDefaultSurfaceAccesses;
    function getSurfaceAccesses(state, room) {
        return room.accessPoints ?? createDefaultSurfaceAccesses(state, room);
    }
    SCPGame.getSurfaceAccesses = getSurfaceAccesses;
    function getStaffSurfaceTraffic(member) {
        if (member.needs.contamination > 65 || member.status === "quarantined")
            return "contaminated";
        if (member.role === "guard" || member.role === "mtf")
            return "security";
        if (member.role === "medic")
            return "medical";
        if (member.role === "logistics")
            return "freight";
        return "staff";
    }
    SCPGame.getStaffSurfaceTraffic = getStaffSurfaceTraffic;
    function accessPowerAvailable(state, access) {
        return access.powered && state.resources.power > 1 && !Boolean(state.flags["surface-blackout"]);
    }
    function accessReady(state, room, access) {
        return access.enabled && isSurfaceAccessPassageClear(state, room, access)
            && (access.kind === "door" || room.enabled && accessPowerAvailable(state, access) && access.airSupply);
    }
    function accessPermitsMember(access, member) {
        return (member?.clearance ?? 5) >= access.minClearance
            && access.allowedTraffic.includes(member ? getStaffSurfaceTraffic(member) : "staff");
    }
    function accessMatchesStep(room, access, from, to) {
        const { inside, outside } = getSurfaceAccessCells(room, access);
        return sameAccessCell(from, outside) && sameAccessCell(to, inside)
            || sameAccessCell(from, inside) && sameAccessCell(to, outside);
    }
    function accessPermitsStep(state, room, access, from, to, member) {
        return accessReady(state, room, access) && accessAllowsWaiting(state, room, access, from, to, member);
    }
    function accessAllowsWaiting(state, room, access, from, to, member) {
        if (!accessMatchesStep(room, access, from, to) || !isSurfaceAccessPassageClear(state, room, access) || !accessPermitsMember(access, member))
            return false;
        const entering = sameAccessCell(to, getSurfaceAccessCells(room, access).inside);
        return (!entering || room.enabled) && (access.direction === "both" || access.direction === (entering ? "in" : "out"));
    }
    function cellInsideAccessRoom(state, room, point) {
        if (!SCPGame.pointInRect(point, room.x, room.y, room.width, room.height))
            return false;
        // Old synthetic/legacy layouts may carve a corridor through an unconfigured
        // footprint. Explicit access layouts never get this wall-bypass exception.
        return !(room.accessPoints === undefined && room.enabled && state.surfaceRooms.some((other) => other.type === "corridor" && other.enabled && SCPGame.pointInRect(point, other.x, other.y, other.width, other.height)));
    }
    function accessesForStep(state, from, to, member) {
        if (Math.abs(from.x - to.x) + Math.abs(from.y - to.y) !== 1)
            return undefined;
        const result = [];
        for (const room of state.surfaceRooms) {
            if (room.type === "corridor")
                continue;
            const before = cellInsideAccessRoom(state, room, from);
            const after = cellInsideAccessRoom(state, room, to);
            if (before === after)
                continue;
            const access = getSurfaceAccesses(state, room).find((candidate) => accessPermitsStep(state, room, candidate, from, to, member));
            if (!access)
                return undefined;
            result.push({ room, access });
        }
        return result.filter((entry) => entry.access.kind === "airlock").length > 1 ? undefined : result;
    }
    function canTraverseSurfaceAccessEdge(state, from, to, member) {
        return accessesForStep(state, from, to, member) !== undefined;
    }
    SCPGame.canTraverseSurfaceAccessEdge = canTraverseSurfaceAccessEdge;
    function getSurfaceAccessStatus(state, room, access) {
        if (!access.enabled)
            return "Verrouillé";
        if (!isSurfaceAccessPassageClear(state, room, access))
            return "Passage obstrué";
        if (access.kind === "door")
            return room.enabled ? "Porte disponible" : "Sortie seule · salle fermée";
        if (!room.enabled)
            return "Salle fermée · sas arrêté";
        if (!accessPowerAvailable(state, access))
            return "Panne électrique · deux portes fermées";
        if (!access.airSupply)
            return "Air indisponible · deux portes fermées";
        const member = access.cycle ? state.staff.find((entry) => entry.id === access.cycle?.staffId) : undefined;
        if (access.cycle && (!member || !accessPermitsStep(state, room, access, access.cycle.from, access.cycle.to, member)))
            return "Autorisation perdue · évacuation nécessaire";
        if (access.cycle?.phase === "entering")
            return "Admission · porte d'entrée ouverte";
        if (access.cycle?.phase === "equalizing")
            return "Égalisation · deux portes fermées";
        if (access.cycle?.phase === "exiting")
            return "Sortie · porte de sortie ouverte";
        return access.queue.length ? `En attente · ${access.queue.length}/${access.queueCapacity}` : "Sas disponible · deux portes fermées";
    }
    SCPGame.getSurfaceAccessStatus = getSurfaceAccessStatus;
    function getSurfaceAccessDoorState(state, room, access) {
        if (!accessReady(state, room, access))
            return { entryOpen: false, exitOpen: false };
        if (access.kind === "door")
            return { entryOpen: true, exitOpen: false };
        const member = access.cycle ? state.staff.find((entry) => entry.id === access.cycle?.staffId) : undefined;
        if (!access.cycle || !member || member.status === "dead"
            || !accessPermitsStep(state, room, access, access.cycle.from, access.cycle.to, member))
            return { entryOpen: false, exitOpen: false };
        return { entryOpen: access.cycle.phase === "entering", exitOpen: access.cycle.phase === "exiting" };
    }
    SCPGame.getSurfaceAccessDoorState = getSurfaceAccessDoorState;
    function resetAccessStaffRoute(member) {
        member.target = undefined;
        member.targetRoomId = undefined;
        member.path = [];
        member.pathIndex = 0;
        if (member.status !== "injured" && member.status !== "quarantined" && member.status !== "dead" && member.status !== "training")
            member.status = "queued";
    }
    function cancelStaffSurfaceAccess(state, staffId) {
        for (const room of state.surfaceRooms) {
            for (const access of room.accessPoints ?? []) {
                access.queue = access.queue.filter((entry) => entry.staffId !== staffId);
                if (access.cycle?.staffId === staffId)
                    access.cycle = undefined;
            }
        }
    }
    SCPGame.cancelStaffSurfaceAccess = cancelStaffSurfaceAccess;
    function evacuateSurfaceAccess(state, room, access) {
        const requests = [...access.queue, ...(access.cycle ? [access.cycle] : [])];
        for (const request of requests) {
            const member = state.staff.find((entry) => entry.id === request.staffId && entry.status !== "dead");
            if (!member)
                continue;
            if (access.cycle?.staffId === member.id)
                member.position = { layer: "surface", ...request.from };
            resetAccessStaffRoute(member);
            member.routeBlockedReason = "Évacuation côté d'origine · accès verrouillé.";
        }
        access.queue = [];
        access.cycle = undefined;
        access.enabled = false;
    }
    SCPGame.evacuateSurfaceAccess = evacuateSurfaceAccess;
    function isStaffInSurfaceAccess(state, member) {
        for (const room of state.surfaceRooms) {
            const access = (room.accessPoints ?? []).find((entry) => entry.cycle?.staffId === member.id);
            if (!access)
                continue;
            member.routeBlockedReason = getSurfaceAccessStatus(state, room, access);
            if (member.status !== "injured" && member.status !== "quarantined" && member.status !== "training")
                member.status = "queued";
            return true;
        }
        return false;
    }
    SCPGame.isStaffInSurfaceAccess = isStaffInSurfaceAccess;
    function getStaffSurfaceAccessWait(state, member) {
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
    SCPGame.getStaffSurfaceAccessWait = getStaffSurfaceAccessWait;
    // Waypoints retain the source of the current step so a door closing halfway
    // through a crossing cannot make floor(position) silently admit the person.
    // A blocked crossing retreats along the same segment at ordinary walk speed.
    function processPartialSurfaceAccessStep(state, member) {
        if (member.position.layer !== "surface" || Number.isInteger(member.position.x) && Number.isInteger(member.position.y))
            return false;
        const to = member.path[member.pathIndex];
        if (!to || !Number.isInteger(to.x) || !Number.isInteger(to.y))
            return false;
        let from = member.path[member.pathIndex - 1];
        if (!from && member.pathIndex === 0) {
            // Saves from before source waypoints existed can still recover one valid
            // adjacent fractional step; distant/stale waypoints are never trusted.
            if (to.y === member.position.y && Math.abs(to.x - member.position.x) < 1) {
                from = { x: to.x > member.position.x ? Math.floor(member.position.x) : Math.ceil(member.position.x), y: to.y };
            }
            else if (to.x === member.position.x && Math.abs(to.y - member.position.y) < 1) {
                from = { x: to.x, y: to.y > member.position.y ? Math.floor(member.position.y) : Math.ceil(member.position.y) };
            }
        }
        if (!from || !Number.isInteger(from.x) || !Number.isInteger(from.y)
            || Math.abs(from.x - to.x) + Math.abs(from.y - to.y) !== 1
            || member.position.x < Math.min(from.x, to.x) || member.position.x > Math.max(from.x, to.x)
            || member.position.y < Math.min(from.y, to.y) || member.position.y > Math.max(from.y, to.y))
            return false;
        const source = from;
        const boundary = state.surfaceRooms.some((room) => room.type !== "corridor"
            && cellInsideAccessRoom(state, room, source) !== cellInsideAccessRoom(state, room, to));
        if (!boundary)
            return false;
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
                for (const crossing of crossings ?? [])
                    crossing.access.passedCount += 1;
            }
            else
                resetAccessStaffRoute(member);
        }
        else {
            member.position.x += dx / distance * 0.55;
            member.position.y += dy / distance * 0.55;
        }
        member.routeBlockedReason = allowed ? undefined : "Passage interrompu · retour du côté d'origine.";
        if (member.status !== "injured" && member.status !== "quarantined" && member.status !== "training")
            member.status = allowed ? "moving" : "queued";
        return true;
    }
    SCPGame.processPartialSurfaceAccessStep = processPartialSurfaceAccessStep;
    // Returns true when an access gate consumed this minute's movement. An
    // ordinary manual door lets the usual continuous movement code take over.
    function processSurfaceAccessStep(state, member, target) {
        if (!Number.isInteger(member.position.x) || !Number.isInteger(member.position.y)
            || !Number.isInteger(target.x) || !Number.isInteger(target.y))
            return false;
        if (sameAccessCell(member.position, target))
            return false;
        const waiting = getStaffSurfaceAccessWait(state, member);
        if (waiting && sameAccessCell(waiting.request.to, target)) {
            member.routeBlockedReason = accessReady(state, waiting.room, waiting.access)
                ? `File du sas · position ${waiting.access.queue.indexOf(waiting.request) + 1}/${waiting.access.queue.length}.`
                : getSurfaceAccessStatus(state, waiting.room, waiting.access);
            if (member.status !== "injured" && member.status !== "quarantined")
                member.status = "queued";
            return true;
        }
        const crossings = accessesForStep(state, member.position, target, member);
        if (!crossings) {
            resetAccessStaffRoute(member);
            member.routeBlockedReason = "Passage refusé : porte fermée, accès obstrué ou habilitation insuffisante.";
            return true;
        }
        const controlled = crossings.find((entry) => entry.access.kind === "airlock");
        if (!controlled)
            return false;
        const { access } = controlled;
        if (!access.queue.some((entry) => entry.staffId === member.id)) {
            if (access.queue.length >= access.queueCapacity) {
                member.routeBlockedReason = "File du sas complète · attente devant le passage.";
                if (member.status !== "injured" && member.status !== "quarantined")
                    member.status = "queued";
                return true;
            }
            cancelStaffSurfaceAccess(state, member.id);
            access.queue.push({ staffId: member.id, from: { x: member.position.x, y: member.position.y }, to: { ...target },
                requestedAt: state.elapsedMinutes, expiresAt: state.elapsedMinutes + ACCESS_WAIT_MINUTES });
        }
        member.routeBlockedReason = `File du sas · position ${access.queue.findIndex((entry) => entry.staffId === member.id) + 1}/${access.queue.length}.`;
        if (member.status !== "injured" && member.status !== "quarantined")
            member.status = "queued";
        return true;
    }
    SCPGame.processSurfaceAccessStep = processSurfaceAccessStep;
    function accessRequestMember(state, request) {
        return state.staff.find((member) => member.id === request.staffId && member.status !== "dead"
            && member.position.layer === "surface" && sameAccessCell(member.position, request.from));
    }
    function updateSurfaceAccesses(state) {
        for (const room of state.surfaceRooms) {
            for (const access of room.accessPoints ?? []) {
                if (access.kind !== "airlock")
                    continue;
                access.queue = access.queue.filter((request) => {
                    const member = accessRequestMember(state, request);
                    if (!member)
                        return false;
                    if (request.expiresAt <= state.elapsedMinutes) {
                        member.needs.stress = SCPGame.clamp(member.needs.stress + 1, 0, 100);
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
                    if (cycle.remaining > 0)
                        continue;
                    if (cycle.phase === "entering") {
                        cycle.phase = "equalizing";
                        cycle.remaining = 2;
                    }
                    else if (cycle.phase === "equalizing") {
                        cycle.phase = "exiting";
                        cycle.remaining = 1;
                    }
                    else {
                        member.position = { layer: "surface", ...cycle.to };
                        resetAccessStaffRoute(member);
                        member.routeBlockedReason = undefined;
                        access.passedCount += 1;
                        access.cycle = undefined;
                    }
                    if (access.cycle)
                        member.routeBlockedReason = getSurfaceAccessStatus(state, room, access);
                    // Admission happens on a later tick, so completion cannot move a
                    // second person or process a freshly admitted cycle in the same tick.
                    continue;
                }
                if (!accessReady(state, room, access))
                    continue;
                const next = access.queue.shift();
                if (next) {
                    access.cycle = { ...next, from: { ...next.from }, to: { ...next.to }, phase: "entering", remaining: 1 };
                    const member = accessRequestMember(state, next);
                    if (member)
                        member.routeBlockedReason = getSurfaceAccessStatus(state, room, access);
                }
            }
        }
    }
    SCPGame.updateSurfaceAccesses = updateSurfaceAccesses;
    function describeSurfaceRouteFailure(state, member, rooms) {
        if (rooms.length === 0)
            return "Aucune salle ouverte ne répond à cette destination.";
        const accesses = rooms.flatMap((room) => getSurfaceAccesses(state, room).map((access) => ({ room, access })));
        if (accesses.length === 0)
            return "Destination sans entrée : ajoutez une porte sur une limite libre.";
        if (accesses.every(({ access }) => member.clearance < access.minClearance))
            return "Habilitation insuffisante pour les accès de cette destination.";
        if (accesses.every(({ access }) => !access.allowedTraffic.includes(getStaffSurfaceTraffic(member))))
            return "Circulation refusée pour le profil de cet agent.";
        if (accesses.every(({ room, access }) => !accessReady(state, room, access)))
            return "Accès indisponibles : vérifiez verrouillage, obstacles, énergie et air des sas.";
        return "Aucun itinéraire autorisé : vérifiez les portes, les sens de passage et les obstacles.";
    }
    SCPGame.describeSurfaceRouteFailure = describeSurfaceRouteFailure;
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    function getSiteRegionFootprint(state) {
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
    SCPGame.getSiteRegionFootprint = getSiteRegionFootprint;
    function surfaceToRegionPosition(state, point) {
        const bounds = getSiteRegionFootprint(state);
        return {
            x: bounds.x + point.x * bounds.width / state.surfaceWidth,
            y: bounds.y + point.y * bounds.height / state.surfaceHeight
        };
    }
    SCPGame.surfaceToRegionPosition = surfaceToRegionPosition;
    function regionToSurfacePosition(state, point) {
        const bounds = getSiteRegionFootprint(state);
        if (point.x < bounds.x || point.y < bounds.y || point.x >= bounds.x + bounds.width || point.y >= bounds.y + bounds.height)
            return undefined;
        return {
            x: (point.x - bounds.x) * state.surfaceWidth / bounds.width,
            y: (point.y - bounds.y) * state.surfaceHeight / bounds.height
        };
    }
    SCPGame.regionToSurfacePosition = regionToSurfacePosition;
    function getSurfaceRegionFootprint(state, room) {
        const origin = surfaceToRegionPosition(state, room);
        const end = surfaceToRegionPosition(state, { x: room.x + room.width, y: room.y + room.height });
        return { x: origin.x, y: origin.y, width: end.x - origin.x, height: end.y - origin.y };
    }
    SCPGame.getSurfaceRegionFootprint = getSurfaceRegionFootprint;
    function getSurfaceRoomAtRegionPosition(state, point) {
        const local = regionToSurfacePosition(state, point);
        if (!local)
            return undefined;
        return [...state.surfaceRooms].reverse().find((room) => room.type !== "corridor" && SCPGame.pointInRect(local, room.x, room.y, room.width, room.height))
            ?? [...state.surfaceRooms].reverse().find((room) => SCPGame.pointInRect(local, room.x, room.y, room.width, room.height));
    }
    SCPGame.getSurfaceRoomAtRegionPosition = getSurfaceRoomAtRegionPosition;
    /** Historical Y=14 section of the original single-axis underground map. */
    function getLegacyUndergroundSectionY(state) {
        return Math.max(0, state.surfaceHeight - 3);
    }
    SCPGame.getLegacyUndergroundSectionY = getLegacyUndergroundSectionY;
    function getSiteSectionSurfaceY(state) {
        const requested = state.flags["underground-slice-y"];
        return typeof requested === "number" && Number.isInteger(requested)
            && requested >= 0 && requested < state.surfaceHeight
            ? requested : getLegacyUndergroundSectionY(state);
    }
    SCPGame.getSiteSectionSurfaceY = getSiteSectionSurfaceY;
    function undergroundRoomSectionY(state, room) {
        return room.y ?? getLegacyUndergroundSectionY(state);
    }
    SCPGame.undergroundRoomSectionY = undergroundRoomSectionY;
    function getStaffUndergroundSectionY(state, member) {
        return member.position.sectionY ?? getLegacyUndergroundSectionY(state);
    }
    SCPGame.getStaffUndergroundSectionY = getStaffUndergroundSectionY;
    function setUndergroundSlice(state, y) {
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
    SCPGame.setUndergroundSlice = setUndergroundSlice;
    function getUndergroundPlanLevel(state) {
        const raw = state.flags["underground-plan-level"];
        if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < state.undergroundLevels)
            return raw;
        return state.selectedType === "underground-room"
            ? state.undergroundRooms.find((room) => room.id === state.selectedId)?.level ?? 0 : 0;
    }
    SCPGame.getUndergroundPlanLevel = getUndergroundPlanLevel;
    function setUndergroundPlanLevel(state, level) {
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
    SCPGame.setUndergroundPlanLevel = setUndergroundPlanLevel;
    function undergroundXToSurfaceX(state, undergroundX) {
        return undergroundX + (state.surfaceWidth - state.undergroundWidth) / 2;
    }
    SCPGame.undergroundXToSurfaceX = undergroundXToSurfaceX;
    function surfaceXToUndergroundX(state, surfaceX) {
        return surfaceX - (state.surfaceWidth - state.undergroundWidth) / 2;
    }
    SCPGame.surfaceXToUndergroundX = surfaceXToUndergroundX;
    function isSurfaceRoomOnUndergroundSection(state, room) {
        const y = getSiteSectionSurfaceY(state);
        return room.y <= y && room.y + room.height > y;
    }
    SCPGame.isSurfaceRoomOnUndergroundSection = isSurfaceRoomOnUndergroundSection;
    function getSurfaceRoomAboveUnderground(state, room) {
        const x = undergroundXToSurfaceX(state, room.x + room.width / 2);
        const y = undergroundRoomSectionY(state, room);
        const candidates = state.surfaceRooms.filter((candidate) => SCPGame.pointInRect({ x, y }, candidate.x, candidate.y, candidate.width, candidate.height));
        return candidates.find((candidate) => candidate.type !== "corridor") ?? candidates[0];
    }
    SCPGame.getSurfaceRoomAboveUnderground = getSurfaceRoomAboveUnderground;
    function getUndergroundRoomBelowSurface(state, room) {
        if (!isSurfaceRoomOnUndergroundSection(state, room))
            return undefined;
        if (room.type === "elevator") {
            // Selecting an elevator must highlight its ACTUAL shaft, even if the
            // shaft is on the edge instead of the exact center of its four-cell room.
            return SCPGame.getUndergroundPortals(state).find(({ elevator }) => elevator.id === room.id)?.shaft;
        }
        const left = surfaceXToUndergroundX(state, room.x);
        const right = surfaceXToUndergroundX(state, room.x + room.width);
        const section = getSiteSectionSurfaceY(state);
        return state.undergroundRooms.filter((candidate) => candidate.level === 0
            && undergroundRoomSectionY(state, candidate) === section)
            .map((candidate) => ({ room: candidate, overlap: Math.max(0, Math.min(right, candidate.x + candidate.width) - Math.max(left, candidate.x)) }))
            .filter((candidate) => candidate.overlap > 0)
            .sort((a, b) => b.overlap - a.overlap)[0]?.room;
    }
    SCPGame.getUndergroundRoomBelowSurface = getUndergroundRoomBelowSurface;
    /** A real shaft must emerge inside a surface elevator, in the cut plane. */
    function isShaftUnderSurfaceElevator(state, shaft, elevator) {
        if (shaft.type !== "elevator-shaft" || shaft.level !== 0 || elevator.type !== "elevator")
            return false;
        const sectionY = undergroundRoomSectionY(state, shaft);
        const shaftX = undergroundXToSurfaceX(state, shaft.x + shaft.width / 2);
        return elevator.enabled && elevator.condition > 15
            && sectionY >= elevator.y && sectionY < elevator.y + elevator.height
            && shaftX >= elevator.x && shaftX < elevator.x + elevator.width;
    }
    SCPGame.isShaftUnderSurfaceElevator = isShaftUnderSurfaceElevator;
    function getRegionCampusOverlap(state) {
        const footprint = getSiteRegionFootprint(state);
        return state.regionFacilities.filter((item) => item.x < footprint.x + footprint.width && item.x + item.width > footprint.x
            && item.y < footprint.y + footprint.height && item.y + item.height > footprint.y);
    }
    SCPGame.getRegionCampusOverlap = getRegionCampusOverlap;
    function isRegionFacilityEnterable(facility) {
        return !["road", "green-zone"].includes(facility.type);
    }
    SCPGame.isRegionFacilityEnterable = isRegionFacilityEnterable;
    function getActiveInteriorFacility(state) {
        const id = state.activeInteriorFacilityId;
        if (state.view !== "surface" || !id)
            return undefined;
        return state.regionFacilities.find((facility) => facility.id === id && isRegionFacilityEnterable(facility));
    }
    SCPGame.getActiveInteriorFacility = getActiveInteriorFacility;
    // Annex plans are drawn from the real exterior facility (ID, footprint,
    // condition, function and level). These are inspection-only architectural
    // interiors, not invented staffed simulation rooms or duplicate buildings.
    const ANNEX_ZONE_NAMES = {
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
    function getAnnexInteriorPlan(state, facility) {
        if (!state.regionFacilities.includes(facility) || !isRegionFacilityEnterable(facility))
            return undefined;
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
            buildingName: SCPGame.getRegionDefinition(facility.type).name,
            footprint: { x, y, width, height },
            rooms: [
                { id: `${facility.id}:operations`, name: names[0], function: "Fonction principale", category: "operations", x, y, width: left, height: top },
                { id: `${facility.id}:control`, name: names[1], function: "Supervision", category: "control", x: x + left, y, width: width - left, height: top },
                { id: `${facility.id}:support`, name: names[2], function: "Support et stockage", category: "support", x, y: y + top, width: left, height: height - top },
                { id: `${facility.id}:entry`, name: names[3], function: "Entrée / contrôle", category: "entry", x: x + left, y: y + top, width: width - left, height: height - top }
            ]
        };
    }
    SCPGame.getAnnexInteriorPlan = getAnnexInteriorPlan;
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    /** A door/airlock owns one physical, bidirectional graph edge. */
    SCPGame.UNDERGROUND_GATE_COSTS = {
        door: { funds: 650, parts: 2 },
        airlock: { funds: 2600, parts: 7 }
    };
    function getUndergroundGateBetween(state, left, right) {
        return (state.undergroundGates ?? []).find((gate) => gate.roomAId === left.id && gate.roomBId === right.id
            || gate.roomAId === right.id && gate.roomBId === left.id);
    }
    SCPGame.getUndergroundGateBetween = getUndergroundGateBetween;
    function getUndergroundGateStatus(state, gate) {
        if (!gate.enabled)
            return 'Verrouillé';
        if (gate.kind === 'airlock' && (!gate.powered || state.resources.power <= 5 || Boolean(state.flags['surface-blackout'])))
            return 'Panne électrique — vantaux fermés';
        if (gate.kind === 'airlock' && !gate.airSupply)
            return 'Air indisponible — sas arrêté';
        if (gate.kind === 'airlock') {
            const a = state.undergroundRooms.find((room) => room.id === gate.roomAId);
            const b = state.undergroundRooms.find((room) => room.id === gate.roomBId);
            if (!a || !b)
                return 'Sas sans liaison technique valide';
            const statusA = SCPGame.getUndergroundUtilityStatus(state, a);
            const statusB = SCPGame.getUndergroundUtilityStatus(state, b);
            if (!statusA.power || !statusB.power)
                return 'Sas hors circuit électrique';
            if (!statusA.air || !statusB.air)
                return 'Sas sans ventilation raccordée';
        }
        if (gate.cycle?.phase === 'equalizing')
            return `Égalisation — ${gate.cycle.remaining} min`;
        if (gate.cycle?.phase === 'crossing')
            return 'Transit en cours — accès occupé';
        if (gate.cycle?.phase === 'retreating')
            return 'Retour sécurisé vers le côté d’origine';
        if (gate.queue.length)
            return `File FIFO — ${gate.queue.length}/${gate.queueCapacity}`;
        return gate.kind === 'airlock' ? 'Sas disponible — deux portes fermées' : 'Porte disponible';
    }
    SCPGame.getUndergroundGateStatus = getUndergroundGateStatus;
    /** No implicit wall bypass for explicit doors; missing gates preserve legacy open corridors. */
    function canTraverseUndergroundGate(state, from, to, member) {
        if (!SCPGame.undergroundRoomsTouch(state, from, to)
            || !SCPGame.canStaffEnterUndergroundRoom(from, member) || !SCPGame.canStaffEnterUndergroundRoom(to, member))
            return false;
        const gate = getUndergroundGateBetween(state, from, to);
        if (!gate)
            return true;
        if (!gate.enabled || (member && member.clearance < gate.minClearance))
            return false;
        if (gate.direction !== 'both') {
            const permitted = gate.direction === 'a-to-b' ? gate.roomAId === from.id : gate.roomBId === from.id;
            if (!permitted)
                return false;
        }
        if (gate.kind === 'airlock' && (!gate.powered || !gate.airSupply || state.resources.power <= 5
            || Boolean(state.flags['surface-blackout'])
            || !SCPGame.getUndergroundUtilityStatus(state, from).power
            || !SCPGame.getUndergroundUtilityStatus(state, to).power
            || !SCPGame.getUndergroundUtilityStatus(state, from).air
            || !SCPGame.getUndergroundUtilityStatus(state, to).air))
            return false;
        return true;
    }
    SCPGame.canTraverseUndergroundGate = canTraverseUndergroundGate;
    function installUndergroundGate(state, fromId, toId, kind) {
        const from = state.undergroundRooms.find((room) => room.id === fromId);
        const to = state.undergroundRooms.find((room) => room.id === toId);
        if (!from || !to || from.id === to.id || !SCPGame.undergroundRoomsTouch(state, from, to)
            || from.level !== to.level)
            return { ok: false, message: 'Porte impossible : deux modules doivent partager une vraie cloison X/Y du même niveau.' };
        if (getUndergroundGateBetween(state, from, to))
            return { ok: false, message: 'Une porte ou un sas contrôle déjà cette liaison.' };
        if (kind !== 'door' && kind !== 'airlock')
            return { ok: false, message: 'Type d’accès souterrain inconnu.' };
        const cost = SCPGame.UNDERGROUND_GATE_COSTS[kind];
        if (!SCPGame.payCost(state.resources, cost))
            return { ok: false, message: 'Crédits ou pièces insuffisants pour cet accès.' };
        const gate = {
            id: SCPGame.uid('underground-gate'), roomAId: from.id, roomBId: to.id, kind,
            enabled: true, minClearance: Math.max(SCPGame.getUndergroundClearanceRequirement(from), SCPGame.getUndergroundClearanceRequirement(to)),
            direction: 'both', powered: true, airSupply: true, queueCapacity: 4,
            queue: [], passedCount: 0, paidFunds: cost.funds, paidParts: cost.parts
        };
        (state.undergroundGates ?? (state.undergroundGates = [])).push(gate);
        SCPGame.logHistory(state, `${kind === 'airlock' ? 'Sas' : 'Porte'} installé sur la liaison ${SCPGame.getUndergroundDefinition(from.type).name} / ${SCPGame.getUndergroundDefinition(to.type).name}.`);
        return { ok: true, message: kind === 'airlock' ? 'Sas souterrain installé et interverrouillé.' : 'Porte souterraine installée.' };
    }
    SCPGame.installUndergroundGate = installUndergroundGate;
    function configureUndergroundGate(state, gateId, updates) {
        const gate = (state.undergroundGates ?? []).find((entry) => entry.id === gateId);
        if (!gate)
            return { ok: false, message: 'Accès souterrain introuvable.' };
        if (updates.minClearance !== undefined && (!Number.isInteger(updates.minClearance)
            || updates.minClearance < 0 || updates.minClearance > 5))
            return { ok: false, message: 'Habilitation invalide.' };
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
    SCPGame.configureUndergroundGate = configureUndergroundGate;
    function removeUndergroundGate(state, gateId) {
        const gates = state.undergroundGates ?? [];
        const index = gates.findIndex((gate) => gate.id === gateId);
        if (index < 0)
            return { ok: false, message: 'Accès souterrain introuvable.' };
        const gate = gates[index];
        if (gate.cycle)
            return { ok: false, message: 'Évacuez le sas avant démontage.' };
        gates.splice(index, 1);
        SCPGame.addResource(state.resources, 'funds', gate.paidFunds * 0.4);
        SCPGame.addResource(state.resources, 'parts', gate.paidParts * 0.4);
        return { ok: true, message: 'Accès démonté, ressources partiellement récupérées.' };
    }
    SCPGame.removeUndergroundGate = removeUndergroundGate;
    // Gate queues are FIFO. A single occupant can equalize or cross at a time.
    function requestUndergroundGate(state, gate, member, from, to) {
        if (!canTraverseUndergroundGate(state, from, to, member))
            return;
        const current = gate.cycle;
        if (current?.staffId === member.id)
            return;
        if (!gate.queue.includes(member.id) && gate.queue.length < gate.queueCapacity)
            gate.queue.push(member.id);
        if (!gate.cycle && gate.queue[0] === member.id) {
            gate.queue.shift();
            gate.cycle = { staffId: member.id, fromId: from.id, toId: to.id, phase: 'equalizing', remaining: 4 };
        }
        member.status = 'queued';
        member.routeBlockedReason = getUndergroundGateStatus(state, gate);
    }
    SCPGame.requestUndergroundGate = requestUndergroundGate;
    function moveToGateDestination(state, member, from, to) {
        const targetY = SCPGame.undergroundRoomSectionY(state, to);
        const sectionY = member.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state);
        const nextX = from.level === to.level && targetY !== SCPGame.undergroundRoomSectionY(state, from)
            ? (Math.max(from.x, to.x) + Math.min(from.x + from.width, to.x + to.width)) / 2
            : SCPGame.undergroundRoomCenter(to).x;
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
        const finalX = SCPGame.undergroundRoomCenter(to).x;
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
    function processUndergroundGateCycle(state, member) {
        const gate = (state.undergroundGates ?? []).find((entry) => entry.cycle?.staffId === member.id);
        if (!gate || !gate.cycle || member.position.layer !== 'underground')
            return false;
        const cycle = gate.cycle;
        const from = state.undergroundRooms.find((room) => room.id === cycle.fromId);
        const to = state.undergroundRooms.find((room) => room.id === cycle.toId);
        if (!from || !to)
            return true; // Keep the cycle contained until a validated intervention.
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
            if (cycle.remaining === 0)
                cycle.phase = 'crossing';
            return true;
        }
        // An electrical/air outage suspends a powered cycle in place. A manual
        // lockdown or revoked authorization, by contrast, triggers a slow retreat.
        if (cycle.phase === 'crossing' && !permitted) {
            const utilityFailure = gate.enabled && gate.kind === 'airlock' &&
                (!gate.powered || !gate.airSupply || state.resources.power <= 5 || Boolean(state.flags['surface-blackout'])
                    || !SCPGame.getUndergroundUtilityStatus(state, from).power
                    || !SCPGame.getUndergroundUtilityStatus(state, to).power
                    || !SCPGame.getUndergroundUtilityStatus(state, from).air
                    || !SCPGame.getUndergroundUtilityStatus(state, to).air);
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
        if (!['dead', 'injured', 'quarantined'].includes(member.status))
            member.status = 'moving';
        member.routeBlockedReason = cycle.phase === 'retreating'
            ? 'Accès fermé : retour physique côté d’origine' : undefined;
        if (arrived) {
            if (cycle.phase === 'crossing')
                gate.passedCount++;
            gate.cycle = undefined;
            member.path = [];
            member.pathIndex = 0;
            member.target = undefined;
            member.targetRoomId = undefined;
            if (cycle.phase === 'retreating')
                member.status = 'queued';
        }
        return true;
    }
    SCPGame.processUndergroundGateCycle = processUndergroundGateCycle;
    function evacuateUndergroundGate(state, gateId) {
        const gate = (state.undergroundGates ?? []).find((entry) => entry.id === gateId);
        if (!gate)
            return { ok: false, message: 'Sas introuvable.' };
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
            }
            else
                cycle.phase = 'retreating';
        }
        gate.queue = [];
        gate.enabled = false;
        return { ok: true, message: 'Sas verrouillé : évacuation sans franchissement comptabilisé.' };
    }
    SCPGame.evacuateUndergroundGate = evacuateUndergroundGate;
    function maintainUndergroundGates(state) {
        const valid = new Set(state.staff.filter((member) => member.status !== 'dead' && member.position.layer === 'underground').map((member) => member.id));
        for (const gate of state.undergroundGates ?? []) {
            gate.queue = gate.queue.filter((id, index) => valid.has(id) && gate.queue.indexOf(id) === index && gate.cycle?.staffId !== id);
            // A dead worker cannot occupy an airlock forever.
            if (gate.cycle && !valid.has(gate.cycle.staffId))
                gate.cycle = undefined;
        }
    }
    SCPGame.maintainUndergroundGates = maintainUndergroundGates;
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    SCPGame.UNDERGROUND_CONDUIT_COST = { funds: 850, parts: 4 };
    function getUndergroundConduitBetween(state, first, second) {
        return (state.undergroundConduits ?? []).find((line) => line.roomAId === first.id && line.roomBId === second.id
            || line.roomBId === first.id && line.roomAId === second.id);
    }
    SCPGame.getUndergroundConduitBetween = getUndergroundConduitBetween;
    function isServiceRoomUsable(room) {
        // Sealed cells retain utility shafts: closing a personnel door is not
        // equivalent to cutting embedded cables, pipes, or ventilation ducts.
        return room.enabled && room.condition > 15;
    }
    function createLegacyUndergroundConduits(state) {
        const result = [];
        for (let i = 0; i < state.undergroundRooms.length; i++) {
            for (let j = i + 1; j < state.undergroundRooms.length; j++) {
                const first = state.undergroundRooms[i], second = state.undergroundRooms[j];
                if (!SCPGame.undergroundRoomsTouch(state, first, second))
                    continue;
                result.push({ roomAId: first.id, roomBId: second.id, power: true, water: true, air: true,
                    paidFunds: 0, paidParts: 0 });
            }
        }
        return result;
    }
    SCPGame.createLegacyUndergroundConduits = createLegacyUndergroundConduits;
    function installUndergroundConduit(state, roomAId, roomBId) {
        const first = state.undergroundRooms.find((room) => room.id === roomAId);
        const second = state.undergroundRooms.find((room) => room.id === roomBId);
        if (!first || !second || !SCPGame.undergroundRoomsTouch(state, first, second))
            return { ok: false, message: "Une gaine technique exige deux modules réellement contigus." };
        if (getUndergroundConduitBetween(state, first, second))
            return { ok: false, message: "Cette liaison technique existe déjà." };
        if (!SCPGame.payCost(state.resources, SCPGame.UNDERGROUND_CONDUIT_COST))
            return { ok: false, message: "Crédits ou pièces insuffisants pour poser la gaine." };
        (state.undergroundConduits ?? (state.undergroundConduits = [])).push({ roomAId, roomBId, power: true, water: true, air: true,
            paidFunds: SCPGame.UNDERGROUND_CONDUIT_COST.funds, paidParts: SCPGame.UNDERGROUND_CONDUIT_COST.parts });
        SCPGame.logHistory(state, "Gaine technique raccordée : courant, eau et ventilation.");
        return { ok: true, message: "Gaine technique installée : électricité, eau et air raccordés." };
    }
    SCPGame.installUndergroundConduit = installUndergroundConduit;
    function toggleUndergroundConduit(state, roomAId, roomBId, kind) {
        if (!["power", "water", "air"].includes(kind))
            return { ok: false, message: "Réseau inconnu." };
        const first = state.undergroundRooms.find((room) => room.id === roomAId);
        const second = state.undergroundRooms.find((room) => room.id === roomBId);
        if (!first || !second || !SCPGame.undergroundRoomsTouch(state, first, second))
            return { ok: false, message: "Cette liaison physique n'existe plus." };
        const conduit = getUndergroundConduitBetween(state, first, second);
        if (!conduit)
            return { ok: false, message: "Installez d'abord une gaine technique." };
        conduit[kind] = !conduit[kind];
        return { ok: true, message: `${kind === "power" ? "Électricité" : kind === "water" ? "Eau" : "Air"} : ${conduit[kind] ? "raccordé" : "isolé"}.` };
    }
    SCPGame.toggleUndergroundConduit = toggleUndergroundConduit;
    function removeUndergroundConduit(state, roomAId, roomBId) {
        const lines = state.undergroundConduits ?? [];
        const index = lines.findIndex((line) => line.roomAId === roomAId && line.roomBId === roomBId
            || line.roomBId === roomAId && line.roomAId === roomBId);
        if (index < 0)
            return { ok: false, message: "Gaine introuvable." };
        const [line] = lines.splice(index, 1);
        SCPGame.addResource(state.resources, "funds", line.paidFunds * 0.4);
        SCPGame.addResource(state.resources, "parts", line.paidParts * 0.4);
        return { ok: true, message: "Gaine démontée : remboursement partiel des frais réellement payés." };
    }
    SCPGame.removeUndergroundConduit = removeUndergroundConduit;
    function getUndergroundUtilityMap(state) {
        const result = new Map();
        const rooms = state.undergroundRooms.filter(isServiceRoomUsable);
        for (const room of state.undergroundRooms) {
            result.set(room.id, { power: false, water: false, air: false });
        }
        const byId = new Map(rooms.map((room) => [room.id, room]));
        const links = (state.undergroundConduits ?? []).filter((line) => {
            const a = byId.get(line.roomAId), b = byId.get(line.roomBId);
            return Boolean(a && b && SCPGame.undergroundRoomsTouch(state, a, b));
        });
        // Pipes and cables can remain live inside a closed security sector.
        // Source detection checks actual elevator-to-shaft geometry, not whether
        // personnel are currently permitted to enter that shaft.
        const portals = rooms.filter((room) => room.type === "elevator-shaft" && room.level === 0
            && state.surfaceRooms.some((surface) => surface.type === "elevator" && surface.enabled
                && surface.condition > 15 && SCPGame.isShaftUnderSurfaceElevator(state, room, surface)))
            .map((room) => room.id);
        const globalPower = state.resources.power > 5 && !Boolean(state.flags["surface-blackout"]);
        const globalWater = state.resources.water > 3;
        const propagate = (kind, seeds) => {
            const reachable = new Set(seeds.filter((id) => byId.has(id)));
            const queue = [...reachable];
            for (let i = 0; i < queue.length; i++) {
                const current = queue[i];
                for (const line of links) {
                    if (!line[kind])
                        continue;
                    const neighbour = line.roomAId === current ? line.roomBId
                        : line.roomBId === current ? line.roomAId : undefined;
                    if (neighbour && !reachable.has(neighbour)) {
                        reachable.add(neighbour);
                        queue.push(neighbour);
                    }
                }
            }
            for (const id of reachable)
                result.get(id)[kind] = true;
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
    SCPGame.getUndergroundUtilityMap = getUndergroundUtilityMap;
    function getUndergroundUtilityStatus(state, room) {
        return getUndergroundUtilityMap(state).get(room.id) ?? { power: false, water: false, air: false };
    }
    SCPGame.getUndergroundUtilityStatus = getUndergroundUtilityStatus;
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    function getUndergroundClearanceRequirement(room) {
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
    SCPGame.getUndergroundClearanceRequirement = getUndergroundClearanceRequirement;
    function canStaffEnterUndergroundRoom(room, member) {
        return room.enabled && !room.sealed && room.condition > 15
            && (!member || member.clearance >= getUndergroundClearanceRequirement(room));
    }
    SCPGame.canStaffEnterUndergroundRoom = canStaffEnterUndergroundRoom;
    // For historical compatibility the Point.y field still denotes LEVEL in
    // underground simulation. The transverse coordinate is room.y / point.sectionY.
    function undergroundRoomCenter(room) {
        return { x: room.x + room.width / 2, y: room.level };
    }
    SCPGame.undergroundRoomCenter = undergroundRoomCenter;
    function undergroundRoomPosition(state, room) {
        return { layer: "underground", x: room.x + room.width / 2,
            y: room.level, level: room.level, sectionY: SCPGame.undergroundRoomSectionY(state, room) };
    }
    SCPGame.undergroundRoomPosition = undergroundRoomPosition;
    function undergroundRoomsTouch(state, left, right) {
        if (left.id === right.id)
            return false;
        const ly = SCPGame.undergroundRoomSectionY(state, left);
        const ry = SCPGame.undergroundRoomSectionY(state, right);
        if (left.level === right.level) {
            // Same longitudinal row: cells must share a wall, not a proximity gap.
            if (ly === ry)
                return left.x + left.width === right.x || right.x + right.width === left.x;
            // Adjacent transverse rows connect only across an overlapping x interval.
            return Math.abs(ly - ry) === 1
                && Math.min(left.x + left.width, right.x + right.width) > Math.max(left.x, right.x);
        }
        return left.type === "elevator-shaft" && right.type === "elevator-shaft"
            && Math.abs(left.level - right.level) === 1 && ly === ry
            && left.x === right.x && left.width === right.width;
    }
    SCPGame.undergroundRoomsTouch = undergroundRoomsTouch;
    function areUndergroundRoomsConnected(left, right, state) {
        if (!canStaffEnterUndergroundRoom(left) || !canStaffEnterUndergroundRoom(right))
            return false;
        if (!state) {
            const legacy = { surfaceHeight: 17 };
            return undergroundRoomsTouch(legacy, left, right);
        }
        return SCPGame.canTraverseUndergroundGate(state, left, right);
    }
    SCPGame.areUndergroundRoomsConnected = areUndergroundRoomsConnected;
    function routeTravelCost(state, left, right) {
        if (left.level !== right.level)
            return 6;
        return Math.abs(undergroundRoomCenter(right).x - undergroundRoomCenter(left).x)
            + 3 * Math.abs(SCPGame.undergroundRoomSectionY(state, right) - SCPGame.undergroundRoomSectionY(state, left)) + 0.5;
    }
    /**
     * Dijkstra through physical (x, sectionY, depth) volumes, including
     * horizontal longitudinal links, adjacent-row junctions and aligned shafts.
     * Locked/disabled modules and intermediate clearance are hard constraints.
     */
    function planUndergroundRoute(state, from, destination, member) {
        const level = from.level ?? from.y;
        const sectionY = from.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state);
        if (from.layer !== "underground" || !Number.isFinite(from.x)
            || !Number.isInteger(level) || level < 0 || level >= state.undergroundLevels
            || !Number.isFinite(sectionY) || sectionY < 0 || sectionY >= state.surfaceHeight
            || from.x < 0 || from.x > state.undergroundWidth
            || !state.undergroundRooms.includes(destination) || !canStaffEnterUndergroundRoom(destination, member))
            return undefined;
        const rooms = state.undergroundRooms.filter((room) => canStaffEnterUndergroundRoom(room, member));
        const origins = rooms.filter((room) => room.level === level
            && Math.abs(sectionY - SCPGame.undergroundRoomSectionY(state, room)) < 0.00001
            && from.x >= room.x && from.x <= room.x + room.width);
        if (!origins.length)
            return undefined;
        const distance = new Map();
        const previous = new Map();
        const visited = new Set();
        origins.forEach((room) => distance.set(room.id, Math.abs(undergroundRoomCenter(room).x - from.x)));
        while (visited.size < rooms.length) {
            let current;
            let best = Infinity;
            for (const room of rooms) {
                const score = distance.get(room.id) ?? Infinity;
                if (!visited.has(room.id) && score < best) {
                    current = room;
                    best = score;
                }
            }
            if (!current)
                break;
            if (current.id === destination.id) {
                const route = [current];
                while (previous.has(route[0].id))
                    route.unshift(previous.get(route[0].id));
                return route;
            }
            visited.add(current.id);
            for (const neighbour of rooms) {
                if (visited.has(neighbour.id) || !SCPGame.canTraverseUndergroundGate(state, current, neighbour, member))
                    continue;
                const candidate = best + routeTravelCost(state, current, neighbour);
                if (candidate < (distance.get(neighbour.id) ?? Infinity)) {
                    distance.set(neighbour.id, candidate);
                    previous.set(neighbour.id, current);
                }
            }
        }
        return undefined;
    }
    SCPGame.planUndergroundRoute = planUndergroundRoute;
    /** The shaft's x/y footprint must emerge INSIDE the actual surface lift. */
    function getUndergroundPortals(state) {
        const elevators = state.surfaceRooms.filter((room) => room.type === "elevator" && room.enabled && room.condition > 15);
        const shafts = state.undergroundRooms.filter((room) => room.type === "elevator-shaft" && room.level === 0 && canStaffEnterUndergroundRoom(room));
        const portals = [];
        for (const elevator of elevators) {
            for (const shaft of shafts) {
                if (SCPGame.isShaftUnderSurfaceElevator(state, shaft, elevator))
                    portals.push({ elevator, shaft });
            }
        }
        return portals;
    }
    SCPGame.getUndergroundPortals = getUndergroundPortals;
    function hasUndergroundElevatorConnection(state, destination, member) {
        return getUndergroundPortals(state).some(({ shaft }) => planUndergroundRoute(state, undergroundRoomPosition(state, shaft), destination, member) !== undefined);
    }
    SCPGame.hasUndergroundElevatorConnection = hasUndergroundElevatorConnection;
})(SCPGame || (SCPGame = {}));
var SCPGame;
(function (SCPGame) {
    const CONTAINMENT_ROOM_TAGS = ["safe", "euclid", "keter", "humanoid", "bio", "infohazard", "heavy", "temporal"];
    const LOAD_SCHEMA_VERSION = 6;
    const SURFACE_ACCESS_SIDES = ["north", "east", "south", "west"];
    const SURFACE_ACCESS_TRAFFIC = ["public", "staff", "security", "medical", "contaminated", "freight", "anomaly"];
    const SURFACE_ACCESS_COSTS = {
        door: { funds: 250, parts: 2 },
        airlock: { funds: 1000, parts: 6 }
    };
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
            y: 14,
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
            // Visible galleries fill the genuine gaps in the starting installation.
            createUndergroundRoom("service-tunnel", 5, 0, 3),
            createUndergroundRoom("service-tunnel", 13, 0, 1),
            createUndergroundRoom("service-tunnel", 16, 0, 2),
            createUndergroundRoom("service-tunnel", 7, 1, 3),
            createUndergroundRoom("service-tunnel", 13, 1, 1),
            createUndergroundRoom("service-tunnel", 16, 1, 2),
            createUndergroundRoom("service-tunnel", 16, 2, 2),
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
            undergroundGates: [],
            undergroundConduits: [],
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
                "load-schema-version": LOAD_SCHEMA_VERSION,
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
        state.undergroundConduits = SCPGame.createLegacyUndergroundConduits(state);
        state.surfaceRooms.forEach((room) => room.accessPoints = SCPGame.createDefaultSurfaceAccesses(state, room));
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
        const previousView = state.view;
        const selectedSurface = state.selectedType === "surface-room"
            ? state.surfaceRooms.find((room) => room.id === state.selectedId) : undefined;
        const selectedUnderground = state.selectedType === "underground-room"
            ? state.undergroundRooms.find((room) => room.id === state.selectedId) : undefined;
        const selectedFacility = state.selectedType === "facility"
            ? state.regionFacilities.find((facility) => facility.id === state.selectedId) : undefined;
        const existingAnnex = previousView === "surface" && state.activeInteriorFacilityId
            ? state.regionFacilities.find((facility) => facility.id === state.activeInteriorFacilityId) : undefined;
        state.view = view;
        state.buildSelection = undefined;
        // The global Surface tab always opens the primary Site interior. Viewing
        // a regional building's annex requires the explicit Explore action below.
        state.activeInteriorFacilityId = undefined;
        if (view === "region" && (selectedFacility || existingAnnex)) {
            const facility = selectedFacility ?? existingAnnex;
            state.selectedId = facility.id;
            state.selectedType = "facility";
            return;
        }
        if (view === "region" || view === "surface") {
            const linked = selectedSurface || (selectedUnderground && SCPGame.getSurfaceRoomAboveUnderground(state, selectedUnderground));
            state.selectedId = linked?.id;
            state.selectedType = linked ? "surface-room" : undefined;
        }
        else if (view === "underground") {
            if (selectedUnderground)
                SCPGame.setUndergroundSlice(state, SCPGame.undergroundRoomSectionY(state, selectedUnderground));
            else if (selectedSurface) {
                const portals = selectedSurface.type === "elevator"
                    ? SCPGame.getUndergroundPortals(state).filter((portal) => portal.elevator.id === selectedSurface.id) : [];
                const section = portals[0] ? SCPGame.undergroundRoomSectionY(state, portals[0].shaft)
                    : SCPGame.isSurfaceRoomOnUndergroundSection(state, selectedSurface)
                        ? SCPGame.getSiteSectionSurfaceY(state)
                        : Math.min(state.surfaceHeight - 1, selectedSurface.y + Math.floor(selectedSurface.height / 2));
                SCPGame.setUndergroundSlice(state, section);
            }
            const linked = selectedUnderground || (selectedSurface && SCPGame.getUndergroundRoomBelowSurface(state, selectedSurface));
            state.selectedId = linked?.id;
            state.selectedType = linked ? "underground-room" : undefined;
        }
        else if (view !== previousView) {
            state.selectedId = undefined;
            state.selectedType = undefined;
        }
    }
    SCPGame.setView = setView;
    function openAnnexInterior(state, facilityId) {
        const facility = state.regionFacilities.find((entry) => entry.id === facilityId);
        if (!facility || !SCPGame.isRegionFacilityEnterable(facility))
            return { ok: false, message: "Cette installation ne possède pas de plan intérieur." };
        state.view = "surface";
        state.activeInteriorFacilityId = facility.id;
        state.selectedId = facility.id;
        state.selectedType = "facility";
        state.buildSelection = undefined;
        state.flags["annex-room-selected"] = "";
        return { ok: true, message: `${SCPGame.getRegionDefinition(facility.type).name} : plan intérieur ouvert.` };
    }
    SCPGame.openAnnexInterior = openAnnexInterior;
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
        if (SCPGame.rectanglesOverlap(candidate, SCPGame.getSiteRegionFootprint(state))) {
            return { ok: false, message: "Terrain du bâtiment principal : aménagez-le depuis la vue Surface." };
        }
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
        const occupiedAccess = state.surfaceRooms.some((room) => room.accessPoints?.some((access) => access.cycle
            && [access.cycle.from, access.cycle.to].some((point) => SCPGame.pointInRect(point, x, y, width, height))));
        if (occupiedAccess)
            return { ok: false, message: "Attendez la fin du cycle ou évacuez le sas avant de construire sur son accès." };
        if (!SCPGame.payCost(state.resources, definition.cost))
            return { ok: false, message: "Ressources insuffisantes." };
        const room = createSurfaceRoom(type, x, y);
        state.surfaceRooms.push(room);
        room.accessPoints = SCPGame.createDefaultSurfaceAccesses(state, room);
        state.selectedId = room.id;
        state.selectedType = "surface-room";
        autoAssignStaff(state);
        logHistory(state, `${definition.name} aménagé à la surface.`);
        return { ok: true, message: `${definition.name} prêt à être utilisé.` };
    }
    SCPGame.buildSurfaceRoom = buildSurfaceRoom;
    function isSurfaceAccessConfig(value) {
        if (!value || typeof value !== "object" || Array.isArray(value))
            return false;
        const config = value;
        const boundedInteger = (entry, minimum, maximum) => typeof entry === "number" && Number.isSafeInteger(entry) && entry >= minimum && entry <= maximum;
        return SURFACE_ACCESS_SIDES.includes(config.side)
            && boundedInteger(config.offset, 0, 255)
            && (config.kind === "door" || config.kind === "airlock")
            && typeof config.enabled === "boolean"
            && boundedInteger(config.minClearance, 0, 5)
            && Array.isArray(config.allowedTraffic) && config.allowedTraffic.length <= SURFACE_ACCESS_TRAFFIC.length
            && Array.from(config.allowedTraffic).every((entry) => SURFACE_ACCESS_TRAFFIC.includes(entry))
            && new Set(config.allowedTraffic).size === config.allowedTraffic.length
            && (config.direction === "both" || config.direction === "in" || config.direction === "out")
            && boundedInteger(config.queueCapacity, 1, 16)
            && typeof config.powered === "boolean" && typeof config.airSupply === "boolean";
    }
    function copySurfaceAccessConfig(config) {
        // Copy only editable fields. Extra JSON/DOM properties cannot replace an ID,
        // the live queue, a cycle, or the original investment used for refunds.
        return {
            side: config.side, offset: config.offset, kind: config.kind, enabled: config.enabled,
            minClearance: config.minClearance, allowedTraffic: [...config.allowedTraffic],
            direction: config.direction, queueCapacity: config.queueCapacity,
            powered: config.powered, airSupply: config.airSupply
        };
    }
    function refundSurfaceAccessCost(state, access) {
        const cost = SURFACE_ACCESS_COSTS[access.kind];
        SCPGame.addResource(state.resources, "funds", SCPGame.clamp(access.paidFunds, 0, cost.funds) * 0.35);
        SCPGame.addResource(state.resources, "parts", SCPGame.clamp(access.paidParts, 0, cost.parts) * 0.4);
    }
    function surfaceAccessPlacementError(state, room, config, existingId, checkObstruction = true) {
        if (room.type === "corridor")
            return "Les accès se placent sur les limites d'une salle, pas sur un couloir.";
        const sideLength = config.side === "north" || config.side === "south" ? room.width : room.height;
        if (config.offset >= sideLength)
            return "La position dépasse la longueur du mur choisi.";
        const cells = SCPGame.getSurfaceAccessCells(room, config);
        if ([cells.inside, cells.outside].some((point) => point.x < 0 || point.y < 0
            || point.x >= state.surfaceWidth || point.y >= state.surfaceHeight))
            return "Cet accès débouche hors du complexe.";
        if (SCPGame.getSurfaceAccesses(state, room).some((access) => access.id !== existingId
            && access.side === config.side && access.offset === config.offset))
            return "Un accès occupe déjà cette portion du mur.";
        if (checkObstruction && state.surfaceRooms.some((other) => other.id !== room.id && other.type !== "corridor"
            && SCPGame.pointInRect(cells.outside, other.x, other.y, other.width, other.height)))
            return "L'autre côté de l'accès doit être libre ou donner sur un couloir.";
        return undefined;
    }
    function addSurfaceAccess(state, roomId, config) {
        const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
        if (!room)
            return { ok: false, message: "Salle introuvable." };
        if (!isSurfaceAccessConfig(config))
            return { ok: false, message: "Configuration d'accès invalide." };
        const error = surfaceAccessPlacementError(state, room, config);
        if (error)
            return { ok: false, message: error };
        const cost = SURFACE_ACCESS_COSTS[config.kind];
        if (!SCPGame.payCost(state.resources, cost))
            return { ok: false, message: "Ressources insuffisantes pour cet accès." };
        const access = {
            ...copySurfaceAccessConfig(config), id: SCPGame.uid("access"), queue: [], passedCount: 0,
            paidFunds: cost.funds, paidParts: cost.parts
        };
        room.accessPoints = [...SCPGame.getSurfaceAccesses(state, room), access];
        logHistory(state, `${config.kind === "airlock" ? "Sas" : "Porte"} ajouté : ${SCPGame.getSurfaceDefinition(room.type).name}.`);
        return { ok: true, message: config.kind === "airlock" ? "Sas interverrouillé installé." : "Porte installée." };
    }
    SCPGame.addSurfaceAccess = addSurfaceAccess;
    function updateSurfaceAccess(state, roomId, accessId, config) {
        const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
        if (!room)
            return { ok: false, message: "Salle introuvable." };
        const accesses = SCPGame.getSurfaceAccesses(state, room);
        const access = accesses.find((candidate) => candidate.id === accessId);
        if (!access)
            return { ok: false, message: "Accès introuvable." };
        if (!isSurfaceAccessConfig(config))
            return { ok: false, message: "Configuration d'accès invalide." };
        if (config.kind !== access.kind)
            return { ok: false, message: "Démontez cet accès avant d'installer un autre type." };
        const moved = config.side !== access.side || config.offset !== access.offset;
        const policyChanged = config.minClearance !== access.minClearance || config.direction !== access.direction
            || config.allowedTraffic.length !== access.allowedTraffic.length
            || config.allowedTraffic.some((traffic) => !access.allowedTraffic.includes(traffic));
        if ((moved || policyChanged) && (access.cycle || access.queue.length > 0)) {
            return { ok: false, message: "Évacuez le sas et sa file avant de déplacer l'accès ou de modifier ses autorisations." };
        }
        if (config.queueCapacity < access.queue.length)
            return { ok: false, message: "La capacité ne peut pas être inférieure à la file actuelle." };
        const error = surfaceAccessPlacementError(state, room, config, access.id, moved);
        if (error)
            return { ok: false, message: error };
        Object.assign(access, copySurfaceAccessConfig(config));
        room.accessPoints = accesses;
        return { ok: true, message: "Réglages d'accès enregistrés." };
    }
    SCPGame.updateSurfaceAccess = updateSurfaceAccess;
    function removeSurfaceAccess(state, roomId, accessId) {
        const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
        if (!room)
            return { ok: false, message: "Salle introuvable." };
        const accesses = SCPGame.getSurfaceAccesses(state, room);
        const access = accesses.find((candidate) => candidate.id === accessId);
        if (!access)
            return { ok: false, message: "Accès introuvable." };
        if (access.cycle)
            return { ok: false, message: "Le sas est occupé. Terminez le cycle ou évacuez d'abord son occupant." };
        SCPGame.evacuateSurfaceAccess(state, room, access);
        room.accessPoints = accesses.filter((candidate) => candidate.id !== accessId);
        refundSurfaceAccessCost(state, access);
        logHistory(state, `Accès démonté : ${SCPGame.getSurfaceDefinition(room.type).name}.`);
        return { ok: true, message: "Accès démonté. Une part des matériaux et du coût payé a été récupérée." };
    }
    SCPGame.removeSurfaceAccess = removeSurfaceAccess;
    function evacuateSurfaceAccessAction(state, roomId, accessId) {
        const room = state.surfaceRooms.find((candidate) => candidate.id === roomId);
        if (!room)
            return { ok: false, message: "Salle introuvable." };
        const accesses = SCPGame.getSurfaceAccesses(state, room);
        const access = accesses.find((candidate) => candidate.id === accessId);
        if (!access)
            return { ok: false, message: "Accès introuvable." };
        if (access.kind !== "airlock")
            return { ok: false, message: "L'évacuation manuelle concerne uniquement les sas." };
        SCPGame.evacuateSurfaceAccess(state, room, access);
        room.accessPoints = accesses;
        logHistory(state, `Évacuation manuelle du sas vers le côté d'origine : ${SCPGame.getSurfaceDefinition(room.type).name}.`);
        return { ok: true, message: "Sas évacué du côté d'origine et verrouillé. Aucun passage n'a été compté." };
    }
    SCPGame.evacuateSurfaceAccessAction = evacuateSurfaceAccessAction;
    function buildUndergroundRoom(state, type, x, level, sectionY = SCPGame.getSiteSectionSurfaceY(state)) {
        const definition = SCPGame.getUndergroundDefinition(type);
        if (!Number.isInteger(sectionY) || sectionY < 0 || sectionY >= state.surfaceHeight)
            return { ok: false, message: "Coupe souterraine hors limites." };
        if (!isUndergroundDefinitionUnlocked(state, definition))
            return { ok: false, message: "Module non autorisé ou recherche manquante." };
        if (level < 0 || level >= state.undergroundLevels || x < 0 || x + definition.width > state.undergroundWidth)
            return { ok: false, message: "Construction hors des limites géologiques." };
        if (level >= 5 && !isResearchUnlockActive(state, "level-5-plus") && state.mode !== "sandbox")
            return { ok: false, message: "L'excavation profonde n'est pas encore maîtrisée." };
        const candidate = { x, y: sectionY, level, width: definition.width };
        if (state.undergroundRooms.some((room) => SCPGame.undergroundOverlap(candidate, { ...room, y: SCPGame.undergroundRoomSectionY(state, room) })))
            return { ok: false, message: "Ce volume est déjà occupé sur cette coupe." };
        const depthCostMultiplier = 1 + level * 0.12;
        const scaledCost = {};
        Object.entries(definition.cost).forEach(([key, amount]) => {
            scaledCost[key] = Math.ceil(amount * depthCostMultiplier);
        });
        if (!SCPGame.payCost(state.resources, scaledCost))
            return { ok: false, message: "Ressources insuffisantes pour cette profondeur." };
        const room = createUndergroundRoom(type, x, level);
        room.y = sectionY;
        state.undergroundRooms.push(room);
        state.selectedId = room.id;
        state.selectedType = "underground-room";
        autoAssignStaff(state);
        logHistory(state, `${definition.name} construit au niveau -${level + 1}, coupe Y=${sectionY}.`);
        return { ok: true, message: `${definition.name} opérationnel au niveau -${level + 1}, coupe ${sectionY + 1}.` };
    }
    SCPGame.buildUndergroundRoom = buildUndergroundRoom;
    function setUndergroundSeal(state, roomId, sealed) {
        const room = state.undergroundRooms.find((entry) => entry.id === roomId);
        if (!room)
            return { ok: false, message: "Module souterrain introuvable." };
        if (room.sealed === sealed)
            return { ok: true, message: "État déjà appliqué." };
        room.sealed = sealed;
        logHistory(state, `${SCPGame.getUndergroundDefinition(room.type).name} : ${sealed ? "secteur scellé" : "accès rétabli"}.`);
        return { ok: true, message: sealed ? "Secteur scellé : circulation interdite." : "Secteur rouvert : itinéraires recalculés." };
    }
    SCPGame.setUndergroundSeal = setUndergroundSeal;
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
            if (room.accessPoints?.some((access) => access.cycle))
                return { ok: false, message: "Évacuez les sas occupés avant de démanteler cette salle." };
            const definition = SCPGame.getSurfaceDefinition(room.type);
            room.accessPoints?.forEach((access) => {
                SCPGame.evacuateSurfaceAccess(state, room, access);
                refundSurfaceAccessCost(state, access);
            });
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
            if ((state.undergroundGates ?? []).some((gate) => gate.cycle && (gate.roomAId === room.id || gate.roomBId === room.id)))
                return { ok: false, message: "Évacuez les sas actifs avant de démanteler cette galerie." };
            if (state.staff.some((member) => member.status !== "dead" && member.position.layer === "underground"
                && (member.position.level ?? member.position.y) === room.level
                && Math.abs((member.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state)) - SCPGame.undergroundRoomSectionY(state, room)) < 0.0001
                && member.position.x >= room.x && member.position.x <= room.x + room.width))
                return { ok: false, message: "Évacuez le personnel présent avant de démanteler ce module." };
            for (const line of [...state.undergroundConduits ?? []]) {
                if (line.roomAId === room.id || line.roomBId === room.id)
                    SCPGame.removeUndergroundConduit(state, line.roomAId, line.roomBId);
            }
            for (const gate of [...state.undergroundGates ?? []]) {
                if (gate.roomAId === room.id || gate.roomBId === room.id)
                    SCPGame.removeUndergroundGate(state, gate.id);
            }
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
        state.surfaceRooms.forEach((room) => {
            room.staffAssigned = room.staffAssigned.filter((id) => id !== staffId);
            room.accessPoints?.forEach((access) => {
                access.queue = access.queue.filter((request) => request.staffId !== staffId);
                if (access.cycle?.staffId === staffId)
                    access.cycle = undefined;
            });
        });
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
            const undergroundRoom = underground ? state.undergroundRooms.find((entry) => entry.id === roomId) : undefined;
            const candidates = available
                .filter((member) => member.role === role && !assigned.has(member.id)
                && (!undergroundRoom || member.clearance >= SCPGame.getUndergroundClearanceRequirement(undergroundRoom)))
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
        state.undergroundRooms
            .filter((room) => room.enabled && room.scpId)
            .forEach((room) => {
            const scp = state.scps.find((entry) => entry.id === room.scpId);
            if (!scp)
                return;
            const definition = SCPGame.getSCPDefinition(scp.definitionId);
            Object.entries(definition.requirements.staff).forEach(([role, count]) => assignRole(room.id, role, count ?? 0, true));
        });
        state.surfaceRooms
            .filter((room) => room.enabled)
            .sort((a, b) => SCPGame.getSurfaceDefinition(b.type).security - SCPGame.getSurfaceDefinition(a.type).security)
            .forEach((room) => {
            const definition = SCPGame.getSurfaceDefinition(room.type);
            Object.entries(definition.requiredRoles).forEach(([role, count]) => assignRole(room.id, role, count ?? 0, false));
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
    // Missing legacy fields can be migrated. Supplied malformed fields must never
    // replace a collection with a fresh roster or enter the running simulation.
    function hasValidLoadedFields(candidate, defaults) {
        const record = (value) => !!value && typeof value === "object" && !Array.isArray(value);
        const text = (value) => typeof value === "string";
        const id = (value) => typeof value === "string" && value.length > 0;
        const boolean = (value) => typeof value === "boolean";
        const finite = (value) => typeof value === "number" && Number.isFinite(value);
        const integer = (min, max = Number.MAX_SAFE_INTEGER) => (value) => finite(value) && Number.isInteger(value) && Number(value) >= min && Number(value) <= max;
        const oneOf = (values) => (value) => values.includes(value);
        const array = (check) => (value) => Array.isArray(value) && value.length <= 10000 && value.every(check);
        const shape = (value, checks, required = []) => record(value) && required.every((key) => value[key] !== undefined)
            && Object.entries(checks).every(([key, check]) => value[key] === undefined || check(value[key]));
        const numericRecord = (value, required = []) => record(value) && required.every((key) => finite(value[key])) && Object.values(value).every(finite);
        const primitive = (value) => text(value) || boolean(value) || finite(value);
        const stringArray = array(text);
        const views = ["region", "surface", "underground", "command", "management"];
        const layers = ["region", "surface", "underground"];
        const roles = Object.keys(SCPGame.ROLE_LABELS);
        const statuses = ["working", "moving", "resting", "eating", "queued", "training", "injured", "quarantined", "off-duty", "dead"];
        const gridKeys = ["regionWidth", "regionHeight", "surfaceWidth", "surfaceHeight", "undergroundWidth", "undergroundLevels"];
        if (!record(candidate) || !gridKeys.every((key) => candidate[key] === undefined || integer(1, key === "undergroundLevels" ? 64 : 256)(candidate[key])))
            return false;
        const schemaMarker = record(candidate.flags) ? candidate.flags["load-schema-version"] : undefined;
        if (schemaMarker !== undefined && !integer(0, LOAD_SCHEMA_VERSION)(schemaMarker))
            return false;
        const size = (key) => Number(candidate[key] ?? defaults[key]);
        const point = (value) => shape(value, { x: finite, y: finite }, ["x", "y"]) && record(value)
            && Number(value.x) >= 0 && Number(value.x) < size("surfaceWidth") && Number(value.y) >= 0 && Number(value.y) < size("surfaceHeight");
        const layerPoint = (value) => {
            if (!shape(value, { x: finite, y: finite, layer: oneOf(layers),
                level: integer(0, size("undergroundLevels") - 1),
                sectionY: (v) => finite(v) && Number(v) >= 0 && Number(v) < size("surfaceHeight") }, ["x", "y", "layer"]) || !record(value))
                return false;
            const width = size(value.layer === "surface" ? "surfaceWidth" : value.layer === "region" ? "regionWidth" : "undergroundWidth");
            const height = size(value.layer === "surface" ? "surfaceHeight" : value.layer === "region" ? "regionHeight" : "undergroundLevels");
            return Number(value.x) >= 0 && Number(value.x) < width && Number(value.y) >= 0 && Number(value.y) < height;
        };
        const workItem = (value) => shape(value, {
            id, kind: oneOf(["access", "patient", "delivery", "anomaly", "repair", "research", "training", "inspection"]),
            severity: finite, progress: finite, createdAt: finite, expiresAt: finite, source: text,
            metadata: (entry) => record(entry) && Object.values(entry).every(primitive)
        }, ["id", "kind", "severity", "progress", "createdAt", "expiresAt"]);
        const accessPoint = (value) => point(value) && record(value)
            && integer(0)(value.x) && integer(0)(value.y);
        const accessRequest = (value) => shape(value, {
            staffId: id, from: accessPoint, to: accessPoint, requestedAt: integer(0), expiresAt: integer(1)
        }, ["staffId", "from", "to", "requestedAt", "expiresAt"]) && record(value)
            && Number(value.expiresAt) > Number(value.requestedAt);
        const accessCycle = (value) => accessRequest(value) && shape(value, {
            phase: oneOf(["entering", "equalizing", "exiting"]), remaining: integer(1, 2)
        }, ["phase", "remaining"]) && record(value)
            && Number(value.remaining) <= (value.phase === "equalizing" ? 2 : 1);
        const access = (value) => {
            if (!isSurfaceAccessConfig(value) || !shape(value, {
                id, queue: array(accessRequest), cycle: accessCycle, passedCount: integer(0),
                paidFunds: finite, paidParts: finite
            }, ["id", "queue", "passedCount", "paidFunds", "paidParts"]) || !record(value))
                return false;
            const cost = SURFACE_ACCESS_COSTS[value.kind];
            const queue = value.queue;
            return queue.length <= value.queueCapacity
                && (value.kind === "airlock" || (queue.length === 0 && value.cycle === undefined))
                && Number(value.paidFunds) >= 0 && Number(value.paidFunds) <= cost.funds
                && Number(value.paidParts) >= 0 && Number(value.paidParts) <= cost.parts;
        };
        const roomArrays = { staffAssigned: stringArray, upgrades: stringArray };
        const surfaceRoom = (value) => {
            if (!shape(value, {
                id, type: oneOf(SCPGame.SURFACE_ROOM_DEFINITIONS.map((entry) => entry.type)),
                x: integer(0), y: integer(0), width: integer(1, 256), height: integer(1, 256),
                level: integer(1), condition: finite, cleanliness: finite, enabled: boolean,
                powerPriority: finite, name: text, ...roomArrays, queue: array(workItem), accessPoints: array(access)
            }, ["id", "type", "x", "y", "width", "height", "level", "condition", "cleanliness"]) || !record(value))
                return false;
            if (Number(value.x) + Number(value.width) > size("surfaceWidth") || Number(value.y) + Number(value.height) > size("surfaceHeight"))
                return false;
            if (value.accessPoints !== undefined) {
                const accesses = value.accessPoints;
                if (value.type === "corridor" && accesses.length > 0)
                    return false;
                const edges = new Set();
                for (const entry of accesses) {
                    const length = entry.side === "north" || entry.side === "south" ? Number(value.width) : Number(value.height);
                    if (entry.offset >= length)
                        return false;
                    const edge = `${entry.side}:${entry.offset}`;
                    if (edges.has(edge))
                        return false;
                    edges.add(edge);
                    const cells = SCPGame.getSurfaceAccessCells(value, entry);
                    if (!accessPoint(cells.inside) || !accessPoint(cells.outside))
                        return false;
                }
            }
            return true;
        };
        const undergroundGateCycle = (value) => shape(value, {
            staffId: id, fromId: id, toId: id,
            phase: oneOf(["equalizing", "crossing", "retreating"]), remaining: integer(0, 4)
        }, ["staffId", "fromId", "toId", "phase", "remaining"]);
        const undergroundGate = (value) => {
            if (!shape(value, {
                id, roomAId: id, roomBId: id, kind: oneOf(["door", "airlock"]), enabled: boolean,
                minClearance: integer(0, 5), direction: oneOf(["both", "a-to-b", "b-to-a"]),
                powered: boolean, airSupply: boolean, queueCapacity: integer(1, 8),
                queue: array(id), cycle: undergroundGateCycle, passedCount: integer(0),
                paidFunds: finite, paidParts: finite
            }, ["id", "roomAId", "roomBId", "kind", "enabled", "minClearance", "direction", "powered", "airSupply",
                "queueCapacity", "queue", "passedCount", "paidFunds", "paidParts"]) || !record(value))
                return false;
            const cost = SCPGame.UNDERGROUND_GATE_COSTS[value.kind];
            return value.roomAId !== value.roomBId && value.queue.length <= Number(value.queueCapacity)
                && new Set(value.queue).size === value.queue.length
                && (value.kind === "airlock" || (value.queue.length === 0
                    && (!value.cycle || value.cycle.phase !== "equalizing")))
                && Number(value.paidFunds) >= 0 && Number(value.paidFunds) <= cost.funds
                && Number(value.paidParts) >= 0 && Number(value.paidParts) <= cost.parts
                && (!value.cycle || value.cycle.phase === "equalizing"
                    || value.cycle.remaining === 0);
        };
        const undergroundRoom = (value) => {
            if (!shape(value, {
                id, type: oneOf(SCPGame.UNDERGROUND_ROOM_DEFINITIONS.map((entry) => entry.type)),
                x: integer(0), y: integer(0, size("surfaceHeight") - 1),
                level: integer(0, size("undergroundLevels") - 1), width: integer(1, 256),
                condition: finite, enabled: boolean, sealed: boolean, powerPriority: finite, name: text, scpId: text, ...roomArrays
            }, ["id", "type", "x", "level", "width", "condition"]) || !record(value))
                return false;
            return Number(value.x) + Number(value.width) <= size("undergroundWidth");
        };
        const facility = (value) => {
            if (!shape(value, {
                id, type: oneOf(SCPGame.REGION_FACILITY_DEFINITIONS.map((entry) => entry.type)),
                x: integer(0), y: integer(0), width: integer(1, 256), height: integer(1, 256),
                level: integer(1), condition: finite, staffed: boolean, enabled: boolean
            }, ["id", "type", "x", "y", "width", "height", "level", "condition"]) || !record(value))
                return false;
            return Number(value.x) + Number(value.width) <= size("regionWidth") && Number(value.y) + Number(value.height) <= size("regionHeight");
        };
        const member = (value) => shape(value, {
            id, name: text, role: oneOf(roles), clearance: integer(0, 5), salary: finite,
            skills: (entry) => numericRecord(entry, Object.keys(defaults.staff[0].skills)),
            needs: (entry) => numericRecord(entry, Object.keys(defaults.staff[0].needs)),
            traits: stringArray, status: oneOf(statuses), position: layerPoint, target: layerPoint,
            targetRoomId: text, assignmentRoomId: text, path: array(point), pathIndex: integer(0),
            shift: oneOf(["day", "night"]), experience: finite, loyalty: finite, compromised: boolean, taskProgress: finite,
            routeBlockedReason: (entry) => typeof entry === "string" && entry.length <= 512,
            undergroundLink: (entry) => shape(entry, {
                fromId: id, toId: id, crossingX: finite
            }, ["fromId", "toId", "crossingX"])
        }, ["id", "name", "role", "clearance", "salary", "skills", "needs", "traits", "status", "position", "experience"]);
        const scpIds = SCPGame.SCP_DEFINITIONS.map((entry) => entry.id);
        const scp = (value) => shape(value, {
            id, definitionId: oneOf(scpIds), contained: boolean, discovered: boolean, roomId: text,
            researchProgress: finite, knowledge: finite, breachRisk: finite, mood: finite, health: finite,
            activeEffect: text, procedureId: text, daysContained: finite, incidents: finite, transferred: boolean
        }, ["id", "definitionId", "contained", "discovered", "researchProgress", "knowledge", "breachRisk", "mood", "health", "daysContained", "incidents"]);
        const procedure = (value) => shape(value, {
            id, scpId: oneOf(scpIds), version: integer(1), observationLevel: finite, assignedStaff: finite,
            maintenanceFrequency: finite, backupPower: boolean, analogBackup: boolean, biometricMonitoring: boolean,
            opticalMonitoring: boolean, automatedLockdown: boolean, humaneCare: boolean, restrictedTesting: boolean,
            isolatedNetwork: boolean, redundantVentilation: boolean, trainingRequired: finite, notes: text,
            compliance: finite, complexity: finite
        }, ["id", "scpId", "version", "observationLevel", "assignedStaff", "maintenanceFrequency", "trainingRequired", "compliance", "complexity"]);
        const severity = oneOf(["info", "minor", "major", "critical"]);
        const effect = (value) => shape(value, {
            type: oneOf(["resource", "reputation", "queue", "crisis", "staff", "scp", "flag", "log"]),
            key: text, amount: finite, value: primitive, target: text
        }, ["type"]);
        const eventChoice = (value) => shape(value, {
            id, label: text, description: text, cost: (entry) => numericRecord(entry),
            effects: array(effect), requirement: text
        }, ["id", "label", "description", "effects"]);
        const event = (value) => shape(value, {
            id, templateId: text, title: text, body: text, severity, choices: array(eventChoice),
            createdAt: finite, resolved: boolean, blocking: boolean
        }, ["id", "templateId", "title", "body", "severity", "choices", "createdAt", "resolved", "blocking"]);
        const zone = (value) => shape(value, {
            id, name: text, layer: oneOf(layers), level: integer(0, size("undergroundLevels") - 1),
            security: finite, population: finite, casualties: finite, contamination: finite,
            power: finite, sealed: boolean, evacuated: boolean, threat: finite
        }, ["id", "name", "layer", "security", "population", "casualties", "contamination", "power", "sealed", "evacuated", "threat"]);
        const order = (value) => shape(value, {
            id, type: oneOf(["lockdown", "evacuate", "deploy-security", "deploy-mtf", "restore-power", "decontaminate", "medical-response", "seal-ventilation", "amnestic-response"]),
            zoneId: text, progress: finite, duration: finite, assigned: finite,
            status: oneOf(["queued", "active", "completed", "failed"])
        }, ["id", "type", "zoneId", "progress", "duration", "assigned", "status"]);
        const objective = (value) => shape(value, { id, progress: finite, complete: boolean }, ["id"]);
        const chapter = (value) => shape(value, { id, complete: boolean, objectives: array(objective) }, ["id"]);
        const notification = (value) => shape(value, {
            id, time: finite, title: text, message: text, severity, read: boolean
        }, ["id", "time", "title", "message", "severity", "read"]);
        const camera = (value) => shape(value, {
            zoom: (entry) => finite(entry) && Number(entry) > 0 && Number(entry) <= 100,
            offsetX: finite, offsetY: finite
        });
        // Validate inherited geometry too when a partial save changes map dimensions.
        if (!array(facility)(candidate.regionFacilities === undefined ? defaults.regionFacilities : candidate.regionFacilities)
            || !array(surfaceRoom)(candidate.surfaceRooms === undefined ? defaults.surfaceRooms : candidate.surfaceRooms)
            || !array(undergroundRoom)(candidate.undergroundRooms === undefined ? defaults.undergroundRooms : candidate.undergroundRooms)
            || !array(member)(candidate.staff === undefined ? defaults.staff : candidate.staff))
            return false;
        return shape(candidate, {
            mode: oneOf(["campaign", "sandbox"]), view: oneOf(views), speed: oneOf([0, 1, 2, 4]), previousSpeed: oneOf([0, 1, 2, 4]),
            seed: finite, savedAt: finite, day: integer(1), minuteOfDay: integer(0, 1439), elapsedMinutes: integer(0),
            currentChapter: integer(0, defaults.campaign.length - 1), lastAutosave: finite, gameOver: boolean, victory: boolean,
            settings: (value) => shape(value, {
                difficulty: oneOf(["story", "standard", "director", "keter"]), reducedMotion: boolean, highContrast: boolean,
                audio: boolean, autoPauseCritical: boolean, tutorial: boolean, language: oneOf(["fr"])
            }),
            resources: (value) => numericRecord(value), reputation: (value) => numericRecord(value),
            regionFacilities: array(facility), surfaceRooms: array(surfaceRoom), undergroundRooms: array(undergroundRoom),
            undergroundGates: array(undergroundGate),
            undergroundConduits: array((value) => shape(value, {
                roomAId: id, roomBId: id, power: boolean, water: boolean, air: boolean,
                paidFunds: finite, paidParts: finite
            }, ["roomAId", "roomBId", "power", "water", "air", "paidFunds", "paidParts"])
                && record(value) && value.roomAId !== value.roomBId
                && Number(value.paidFunds) >= 0 && Number(value.paidFunds) <= SCPGame.UNDERGROUND_CONDUIT_COST.funds
                && Number(value.paidParts) >= 0 && Number(value.paidParts) <= SCPGame.UNDERGROUND_CONDUIT_COST.parts),
            staff: array(member), workItems: array(workItem), scps: array(scp), procedures: array(procedure),
            researchNodes: array((value) => shape(value, { id, completed: boolean }, ["id"])), events: array(event),
            campaign: array(chapter), notifications: array(notification), history: stringArray,
            currentEventId: text, selectedId: text, activeInteriorFacilityId: text,
            selectedType: oneOf(["facility", "surface-room", "underground-room", "staff", "scp", "zone"]),
            flags: (value) => record(value) && Object.values(value).every(primitive),
            camera: (value) => shape(value, Object.fromEntries(views.map((view) => [view, camera]))),
            crisis: (value) => shape(value, {
                active: boolean, type: text, title: text, description: text, severity: finite, elapsed: finite,
                siteIntegrity: finite, veilExposure: finite, threatProgress: finite, sourceScpId: text,
                zones: array(zone), orders: array(order), log: stringArray, resolved: oneOf(["success", "failure"])
            })
        });
    }
    function hasValidSurfaceAccessReferences(state) {
        const members = new Map(state.staff.map((member) => [member.id, member]));
        if (members.size !== state.staff.length || new Set(state.surfaceRooms.map((room) => room.id)).size !== state.surfaceRooms.length)
            return false;
        const accessIds = new Set();
        const travellers = new Set();
        const samePoint = (left, right) => left.x === right.x && left.y === right.y;
        for (const room of state.surfaceRooms) {
            for (const access of room.accessPoints ?? []) {
                if (accessIds.has(access.id))
                    return false;
                accessIds.add(access.id);
                const cells = SCPGame.getSurfaceAccessCells(room, access);
                const requests = access.cycle ? [...access.queue, access.cycle] : access.queue;
                for (const request of requests) {
                    const member = members.get(request.staffId);
                    if (!member || member.status === "dead" || member.position.layer !== "surface"
                        || !samePoint(member.position, request.from) || travellers.has(request.staffId)
                        || request.requestedAt > state.elapsedMinutes)
                        return false;
                    const enters = samePoint(request.from, cells.outside) && samePoint(request.to, cells.inside);
                    const leaves = samePoint(request.from, cells.inside) && samePoint(request.to, cells.outside);
                    if (!enters && !leaves)
                        return false;
                    travellers.add(request.staffId);
                }
            }
        }
        return true;
    }
    function copySurfaceAccessRequest(request) {
        return {
            staffId: request.staffId,
            from: { x: request.from.x, y: request.from.y },
            to: { x: request.to.x, y: request.to.y },
            requestedAt: request.requestedAt, expiresAt: request.expiresAt
        };
    }
    function normalizeLoadedState(candidate) {
        if (!candidate || typeof candidate !== "object")
            return undefined;
        const raw = candidate;
        if (typeof raw.version !== "string")
            return undefined;
        // A newer build may contain fields and semantics this runtime cannot safely interpret.
        const parseVersion = (value) => {
            if (!/^\d+\.\d+\.\d+$/.test(value))
                return undefined;
            const parts = value.split(".").map(Number);
            return parts.every(Number.isSafeInteger) ? parts : undefined;
        };
        const incomingVersion = parseVersion(raw.version);
        const supportedVersion = parseVersion(SCPGame.GAME_VERSION);
        if (!incomingVersion || !supportedVersion)
            return undefined;
        for (let index = 0; index < 3; index += 1) {
            if (incomingVersion[index] > supportedVersion[index])
                return undefined;
            if (incomingVersion[index] < supportedVersion[index])
                break;
        }
        const mode = raw.mode === "sandbox" ? "sandbox" : "campaign";
        const difficulty = ["story", "standard", "director", "keter"].includes(String(raw.settings?.difficulty)) ? raw.settings.difficulty : "standard";
        const seed = Number.isFinite(raw.seed) ? Number(raw.seed) : Date.now();
        const defaults = createNewGame(mode, difficulty, seed);
        if (!hasValidLoadedFields(candidate, defaults))
            return undefined;
        // A current-format save must not regain deleted/rejected circuits by
        // pretending that its missing network is a historical omission.
        const marker = raw.flags?.["load-schema-version"];
        if (typeof marker === "number" && marker >= LOAD_SCHEMA_VERSION
            && raw.undergroundConduits === undefined)
            return undefined;
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
            undergroundGates: arrayValue(raw.undergroundGates, []),
            undergroundConduits: raw.undergroundConduits === undefined ? []
                : arrayValue(raw.undergroundConduits, []),
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
            camera: {
                region: objectValue(raw.camera?.region, defaults.camera.region),
                surface: objectValue(raw.camera?.surface, defaults.camera.surface),
                underground: objectValue(raw.camera?.underground, defaults.camera.underground),
                command: objectValue(raw.camera?.command, defaults.camera.command),
                management: objectValue(raw.camera?.management, defaults.camera.management)
            },
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
        if (state.activeInteriorFacilityId && !state.regionFacilities.some((facility) => facility.id === state.activeInteriorFacilityId && SCPGame.isRegionFacilityEnterable(facility))) {
            state.activeInteriorFacilityId = undefined;
        }
        if (state.currentEventId && !state.events?.some((event) => event.id === state.currentEventId && !event.resolved))
            state.currentEventId = undefined;
        state.regionFacilities.forEach((facility) => {
            facility.enabled = facility.enabled !== false;
            facility.staffed = facility.staffed ?? (facility.type !== "watchtower" && facility.type !== "checkpoint");
        });
        state.surfaceRooms.forEach((room) => {
            room.staffAssigned = room.staffAssigned ?? [];
            room.queue = room.queue ?? [];
            room.upgrades = room.upgrades ?? [];
            room.enabled = room.enabled !== false;
            room.powerPriority = room.powerPriority ?? (["elevator", "medical", "command-center"].includes(room.type) ? 3 : 2);
        });
        // Missing entrances are migrated once. An explicitly empty array describes
        // a sealed room and must never be replaced with automatic doors.
        state.surfaceRooms.forEach((room) => {
            room.accessPoints = room.accessPoints === undefined ? SCPGame.createDefaultSurfaceAccesses(state, room)
                : room.accessPoints.map((access) => ({
                    ...copySurfaceAccessConfig(access), id: access.id,
                    queue: access.queue.map(copySurfaceAccessRequest),
                    cycle: access.cycle ? { ...copySurfaceAccessRequest(access.cycle), phase: access.cycle.phase, remaining: access.cycle.remaining } : undefined,
                    passedCount: access.passedCount, paidFunds: access.paidFunds, paidParts: access.paidParts
                }));
        });
        if (!hasValidSurfaceAccessReferences(state))
            return undefined;
        state.undergroundRooms.forEach((room) => {
            // A historical room without Y belongs to the former single A-A cut.
            room.y = SCPGame.undergroundRoomSectionY(state, room);
            room.staffAssigned = room.staffAssigned ?? [];
            room.upgrades = room.upgrades ?? [];
            room.enabled = room.enabled !== false;
            room.sealed = Boolean(room.sealed);
            const tags = SCPGame.getUndergroundDefinition(room.type).tags;
            room.powerPriority = room.powerPriority ?? (tags.includes("keter") || tags.includes("bio") ? 3 : 2);
        });
        // Old saves carried no service circuits, so fully commission exactly the
        // existing contiguous links. New rooms always need explicit construction.
        if (raw.undergroundConduits === undefined)
            state.undergroundConduits = SCPGame.createLegacyUndergroundConduits(state);
        const conduitKeys = new Set();
        for (const conduit of state.undergroundConduits ?? []) {
            const first = state.undergroundRooms.find((room) => room.id === conduit.roomAId);
            const second = state.undergroundRooms.find((room) => room.id === conduit.roomBId);
            const key = [conduit.roomAId, conduit.roomBId].sort().join(":");
            if (!first || !second || !SCPGame.undergroundRoomsTouch(state, first, second)
                || conduitKeys.has(key))
                return undefined;
            conduitKeys.add(key);
        }
        // An old save without gates remains an open physical corridor. Explicit
        // gates are checked against actual adjacent modules, not just string IDs.
        const memberById = new Map(state.staff.map((member) => [member.id, member]));
        const gateIds = new Set();
        const gateEdges = new Set();
        const waitingIds = new Set();
        for (const gate of state.undergroundGates ?? []) {
            const from = state.undergroundRooms.find((room) => room.id === gate.roomAId);
            const to = state.undergroundRooms.find((room) => room.id === gate.roomBId);
            const key = [gate.roomAId, gate.roomBId].sort().join(':');
            if (gateIds.has(gate.id) || gateEdges.has(key) || !from || !to
                || from.level !== to.level || !SCPGame.undergroundRoomsTouch(state, from, to))
                return undefined;
            gateIds.add(gate.id);
            gateEdges.add(key);
            for (const id of [...gate.queue, ...(gate.cycle ? [gate.cycle.staffId] : [])]) {
                const member = memberById.get(id);
                if (!member || member.status === 'dead' || member.position.layer !== 'underground'
                    || waitingIds.has(id))
                    return undefined;
                waitingIds.add(id);
            }
            if (gate.cycle) {
                const cycle = gate.cycle;
                const occupant = memberById.get(cycle.staffId);
                if (!((cycle.fromId === from.id && cycle.toId === to.id)
                    || (cycle.fromId === to.id && cycle.toId === from.id))
                    || (occupant.position.level ?? occupant.position.y) !== from.level
                    || occupant.position.x < Math.min(from.x, to.x) - 0.0001
                    || occupant.position.x > Math.max(from.x + from.width, to.x + to.width) + 0.0001
                    || (occupant.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state))
                        < Math.min(SCPGame.undergroundRoomSectionY(state, from), SCPGame.undergroundRoomSectionY(state, to)) - 0.0001
                    || (occupant.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state))
                        > Math.max(SCPGame.undergroundRoomSectionY(state, from), SCPGame.undergroundRoomSectionY(state, to)) + 0.0001)
                    return undefined;
            }
        }
        const roomIds = new Set(state.undergroundRooms.map((room) => room.id));
        for (const member of state.staff) {
            const link = member.undergroundLink;
            if (!link)
                continue;
            const from = state.undergroundRooms.find((room) => room.id === link.fromId);
            const to = state.undergroundRooms.find((room) => room.id === link.toId);
            const section = member.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state);
            if (!from || !to || member.position.layer !== "underground"
                || from.level !== to.level || (member.position.level ?? member.position.y) !== from.level
                || Math.abs(SCPGame.undergroundRoomSectionY(state, from) - SCPGame.undergroundRoomSectionY(state, to)) !== 1
                || Math.min(from.x + from.width, to.x + to.width) <= Math.max(from.x, to.x)
                || link.crossingX <= Math.max(from.x, to.x)
                || link.crossingX >= Math.min(from.x + from.width, to.x + to.width)
                || Math.abs(member.position.x - link.crossingX) > 0.0001
                || section < Math.min(SCPGame.undergroundRoomSectionY(state, from), SCPGame.undergroundRoomSectionY(state, to))
                || section > Math.max(SCPGame.undergroundRoomSectionY(state, from), SCPGame.undergroundRoomSectionY(state, to))) {
                return undefined;
            }
        }
        state.staff.forEach((member, index) => {
            if (member.position.layer === "underground" && member.position.sectionY === undefined)
                member.position.sectionY = SCPGame.getLegacyUndergroundSectionY(state);
            if (member.target?.layer === "underground" && member.target.sectionY === undefined)
                member.target.sectionY = SCPGame.getLegacyUndergroundSectionY(state);
            if (member.undergroundLink && (!roomIds.has(member.undergroundLink.fromId)
                || !roomIds.has(member.undergroundLink.toId)))
                member.undergroundLink = undefined;
            member.path = member.path ?? [];
            member.pathIndex = member.pathIndex ?? 0;
            member.shift = member.shift ?? (index % 3 === 0 ? "night" : "day");
            member.loyalty = SCPGame.clamp(Number(member.loyalty ?? 70), 0, 100);
            member.compromised = Boolean(member.compromised);
            member.taskProgress = SCPGame.clamp(Number(member.taskProgress ?? 0), 0, 100);
            member.routeBlockedReason = undefined;
        });
        state.scps = state.scps.filter((scp) => SCPGame.SCP_DEFINITIONS.some((definition) => definition.id === scp.definitionId));
        state.procedures = state.procedures.map((procedure) => ({ ...createDefaultProcedure(procedure.scpId), ...procedure }));
        defaults.scps.forEach((defaultScp) => {
            if (!state.scps.some((scp) => scp.definitionId === defaultScp.definitionId))
                state.scps.push(defaultScp);
        });
        state.scps.forEach((scp) => {
            scp.activeEffect = scp.activeEffect ?? (scp.contained ? "Confinement à réévaluer" : "En attente de transfert");
            scp.transferred = scp.transferred ?? scp.contained;
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
            return loaded ? { ...defaultNode, completed: loaded.completed ?? defaultNode.completed } : defaultNode;
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
    // Independent, testable mechanics for every SCP already included in the game.
    // Canon pages are cited in documentation. These are gameplay abstractions,
    // not assertions that all 12 entities run on mains electricity or tap water.
    const failure = (effect, compliance, hourlyPressure, studyMultiplier, priority = "major") => ({ effect, compliance, hourlyPressure, studyMultiplier, priority });
    SCPGame.SCP_BEHAVIOR_PROFILES = {
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
    function scp682HasWorkingAcidFeed(state, target) {
        const utilities = SCPGame.getUndergroundUtilityMap(state);
        if (!utilities.get(target.id)?.power || !utilities.get(target.id)?.water)
            return false;
        const known = new Set([target.id]);
        let frontier = [target];
        for (let distance = 0; distance <= 5; distance += 1) {
            const next = [];
            for (const room of frontier) {
                if (room.type === "acid-system" && room.condition > 30 && room.enabled
                    && utilities.get(room.id)?.power && utilities.get(room.id)?.water)
                    return true;
                for (const other of state.undergroundRooms) {
                    if (known.has(other.id) || !other.enabled || other.condition <= 15
                        || !SCPGame.undergroundRoomsTouch(state, room, other))
                        continue;
                    const conduit = SCPGame.getUndergroundConduitBetween(state, room, other);
                    if (!conduit?.power || !conduit.water || !utilities.get(other.id)?.power || !utilities.get(other.id)?.water)
                        continue;
                    known.add(other.id);
                    next.push(other);
                }
            }
            frontier = next;
        }
        return false;
    }
    SCPGame.scp682HasWorkingAcidFeed = scp682HasWorkingAcidFeed;
    function scp131CanAssist173(state, room) {
        const companion = state.scps.find((scp) => scp.definitionId === "scp-131" && scp.contained);
        const home = state.undergroundRooms.find((candidate) => candidate.id === companion?.roomId);
        const procedure = state.procedures.find((candidate) => candidate.id === companion?.procedureId);
        return Boolean(home && procedure && home.enabled && !home.sealed && !room.sealed
            && home.level === room.level && SCPGame.undergroundRoomSectionY(state, home) === SCPGame.undergroundRoomSectionY(state, room)
            && (SCPGame.undergroundRoomsTouch(state, home, room) || home.id === room.id)
            && procedure.humaneCare);
    }
    SCPGame.scp131CanAssist173 = scp131CanAssist173;
    function getSCPNearbyStaff(state, room) {
        return state.staff.filter((member) => member.position.layer === "underground" && member.position.level === room.level
            && (member.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state)) === SCPGame.undergroundRoomSectionY(state, room)
            && Math.abs(member.position.x - (room.x + room.width / 2)) <= room.width / 2 + 0.6
            && member.status === "working" && member.needs.health > 0);
    }
    SCPGame.getSCPNearbyStaff = getSCPNearbyStaff;
    function inspectSCPBehavior(state, scp) {
        const profile = SCPGame.SCP_BEHAVIOR_PROFILES[scp.definitionId];
        const room = state.undergroundRooms.find((item) => item.id === scp.roomId);
        const procedure = state.procedures.find((item) => item.id === scp.procedureId);
        if (!profile || !scp.contained || !room || !procedure)
            return undefined;
        const utilities = SCPGame.getUndergroundUtilityStatus(state, room);
        const faults = [];
        let compliancePenalty = 0;
        let hourlyPressure = 0;
        let studyMultiplier = 1;
        const mark = (service, effect, penalty, pressure, study, priority) => {
            faults.push({ service, effect, priority });
            compliancePenalty += penalty;
            hourlyPressure += pressure;
            studyMultiplier *= study;
        };
        ["power", "water", "air"].forEach((service) => {
            if (utilities[service])
                return;
            const outage = profile[service];
            // Keep benign/independent failures in diagnostics without inventing SCP incapacitation.
            mark(service, outage.effect, outage.compliance, outage.hourlyPressure, outage.studyMultiplier, outage.priority);
        });
        const local = getSCPNearbyStaff(state, room);
        const flags = scp.definitionId;
        const acidFeedOperational = flags === "scp-682" && scp682HasWorkingAcidFeed(state, room);
        switch (flags) {
            case "scp-173": {
                const watching = local.filter((member) => member.role === "guard" || member.role === "mtf").length;
                if ((watching > 0 && watching < 3) || procedure.observationLevel < 75) {
                    mark("staff", "Trois personnes doivent superviser toute entrée et deux conserver le contact visuel.", watching > 0 && watching < 3 ? 8 : 2, watching > 0 && watching < 3 ? 3.5 : 0.3, watching > 0 && watching < 3 ? 0.4 : 0.9, "critical");
                }
                break;
            }
            case "scp-096":
                if (procedure.opticalMonitoring)
                    mark("procedure", "Surveillance optique interdite : risque d'exposition à une image de SCP-096.", 35, 8, 0, "critical");
                if (!procedure.isolatedNetwork && !procedure.analogBackup)
                    mark("procedure", "Fuite de données visuelles non suffisamment contrôlée.", 10, 2, 0.25, "critical");
                break;
            case "scp-049":
                if (!procedure.humaneCare || !procedure.restrictedTesting)
                    mark("procedure", "Entretiens non sécurisés et absence de soins coopératifs.", 14, 2.2, 0.5, "major");
                break;
            case "scp-106":
                if (room.condition < 75 || procedure.maintenanceFrequency < 70)
                    mark("structure", "Corrosion ou contrôles du confinement suspendu insuffisants.", 18, 3, 0.4, "critical");
                break;
            case "scp-939":
                if (!procedure.analogBackup || !procedure.isolatedNetwork || !procedure.biometricMonitoring)
                    mark("procedure", "Les ordres vocaux ne sont pas authentifiés hors réseau.", 14, 2.4, 0.35, "critical");
                break;
            case "scp-914":
                if (!procedure.restrictedTesting)
                    mark("procedure", "Essais sans autorisation ou sans relevé d'entrée/sortie.", 18, 2.1, 0.15, "major");
                break;
            case "scp-294":
                if (!procedure.restrictedTesting || !procedure.isolatedNetwork)
                    mark("procedure", "Catalogue de requêtes non filtré ou échantillons non tracés.", 17, 2.2, 0.2, "major");
                break;
            case "scp-682":
                if (!acidFeedOperational)
                    mark("structure", "Bain acide indisponible : aucune alimentation chimique opérationnelle jusqu'à la cellule.", 34, 7.5, 0.05, "critical");
                if (state.resources.chemicals < 4)
                    mark("structure", "Réserve d'acide de secours épuisée.", 10, 2.2, 0.3, "critical");
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
                if (!procedure.restrictedTesting)
                    mark("procedure", "Accès de l'escalier non interdit : exploration non autorisée.", 20, 4.5, 0.1, "critical");
                break;
            case "scp-008":
                if (!procedure.redundantVentilation || !procedure.automatedLockdown)
                    mark("procedure", "Barrière aux fluides corporels et triage sans redondance.", 17, 3.5, 0.15, "critical");
                break;
        }
        // Research is a staffed operation, not a global progress bar. Biological
        // work may be supervised by a medic; controlled device trials also require
        // the named restricted-testing procedure and local instrumentation.
        const hasResearcher = local.some((member) => member.role === "researcher"
            || scp.definitionId === "scp-008" && member.role === "medic");
        if (!hasResearcher)
            studyMultiplier = 0;
        if ((flags === "scp-914" || flags === "scp-294") && !procedure.restrictedTesting)
            studyMultiplier = 0;
        return { profile, faults, utilities, compliancePenalty,
            hourlyPressure, studyMultiplier: Math.max(0, Math.min(1, studyMultiplier)),
            localTeam: local.length, acidFeedOperational,
            mechanismOperational: flags !== "scp-294" || utilities.power,
            anomalyStillPresent: true };
    }
    SCPGame.inspectSCPBehavior = inspectSCPBehavior;
    function getSCPResponseAvailability(state, scp) {
        const report = inspectSCPBehavior(state, scp);
        if (!report)
            return { ok: false, message: "SCP non confiné ou procédure introuvable." };
        const last = Number(state.flags[`scp-response:${scp.id}:at`] ?? -100000);
        const cooldown = report.profile.cooldownMinutes ?? 180;
        if (state.elapsedMinutes - last < cooldown)
            return { ok: false, message: `Protocole déjà exécuté : délai de ${cooldown} minutes entre interventions.` };
        if (!SCPGame.canAfford(state.resources, report.profile.responseCost))
            return { ok: false, message: `Matériel insuffisant : ${SCPGame.costToString(report.profile.responseCost)}.` };
        if (state.crisis.active && ["scp-914", "scp-294", "scp-999"].includes(scp.definitionId))
            return { ok: false, message: "Les essais et les visites sont suspendus pendant l'alerte générale." };
        switch (scp.definitionId) {
            case "scp-049":
                if (!SCPGame.isProcedureOptionUnlocked(state, "humaneCare"))
                    return { ok: false, message: "Déverrouillez d'abord les soins coopératifs par la recherche." };
                break;
            case "scp-939":
                if (!SCPGame.isProcedureOptionUnlocked(state, "isolatedNetwork") || !SCPGame.isProcedureOptionUnlocked(state, "analogBackup"))
                    return { ok: false, message: "Déverrouillez le réseau isolé et les communications analogiques." };
                break;
            case "scp-173":
                if (report.localTeam < 3 || !report.utilities.air)
                    return { ok: false, message: "Trois agents physiquement présents et un air respirable sont requis." };
                break;
            case "scp-682":
                if (!report.acidFeedOperational)
                    return { ok: false, message: "Brancher un système acide alimenté en eau et électricité avant réamorçage." };
                break;
            case "scp-914":
            case "scp-294": {
                if (!report.utilities.power || !report.utilities.air || !state.procedures.some((p) => p.id === scp.procedureId && p.restrictedTesting))
                    return { ok: false, message: "Essai impossible sans instrumentation, ventilation et autorisation explicite." };
                const room = state.undergroundRooms.find((candidate) => candidate.id === scp.roomId);
                const staff = getSCPNearbyStaff(state, room);
                if (scp.definitionId === "scp-914") {
                    if (staff.filter((member) => member.role === "guard" || member.role === "mtf").length < 2
                        || !staff.some((member) => member.role === "researcher"))
                        return { ok: false, message: "SCP-914 exige un chercheur et deux gardes sur place pour un essai autorisé." };
                }
                else if (staff.filter((member) => (member.role === "guard" || member.role === "mtf")
                    && member.clearance >= 3).length < 2 || !staff.some((member) => member.clearance >= 2)) {
                    return { ok: false, message: "SCP-294 exige deux gardes niveau 3 et un opérateur habilité niveau 2." };
                }
                break;
            }
            case "scp-999": {
                if (!state.procedures.some((p) => p.id === scp.procedureId && p.humaneCare))
                    return { ok: false, message: "Autorisez les interactions coopératives avant une visite." };
                const room = state.undergroundRooms.find((item) => item.id === scp.roomId);
                if (!report.utilities.air || !getSCPNearbyStaff(state, room).some((member) => member.assignmentRoomId === room.id))
                    return { ok: false, message: "Aucune visite sans personne autorisée présente et ambiance sanitaire sûre." };
                break;
            }
            case "scp-008":
                if (!report.utilities.water)
                    return { ok: false, message: "Aucune décontamination efficace sans conduite d'eau raccordée." };
                break;
        }
        return { ok: true, message: "Protocole d'intervention disponible." };
    }
    SCPGame.getSCPResponseAvailability = getSCPResponseAvailability;
    /** A chosen, paid and cooldown-limited response; never an automatic rescue. */
    function performSCPResponse(state, instanceId) {
        const scp = state.scps.find((entry) => entry.id === instanceId);
        if (!scp)
            return { ok: false, message: "Dossier SCP introuvable." };
        const available = getSCPResponseAvailability(state, scp);
        if (!available.ok)
            return available;
        const profile = SCPGame.SCP_BEHAVIOR_PROFILES[scp.definitionId];
        const procedure = state.procedures.find((entry) => entry.id === scp.procedureId);
        const room = state.undergroundRooms.find((entry) => entry.id === scp.roomId);
        if (!SCPGame.payCost(state.resources, profile.responseCost))
            return { ok: false, message: "Ressources insuffisantes." };
        state.flags[`scp-response:${scp.id}:at`] = state.elapsedMinutes;
        let riskChange = -5;
        let revisedProcedure = false;
        switch (scp.definitionId) {
            case "scp-173":
                procedure.observationLevel = Math.max(procedure.observationLevel, 85);
                revisedProcedure = true;
                riskChange = -9;
                break;
            case "scp-096":
                procedure.opticalMonitoring = false;
                revisedProcedure = true;
                riskChange = -8;
                break;
            case "scp-049":
                procedure.restrictedTesting = true;
                procedure.humaneCare = true;
                revisedProcedure = true;
                scp.mood = SCPGame.clamp(scp.mood + 9, 0, 100);
                break;
            case "scp-106":
                room.condition = SCPGame.clamp(room.condition + 10, 0, 100);
                procedure.maintenanceFrequency = Math.max(procedure.maintenanceFrequency, 78);
                revisedProcedure = true;
                riskChange = -7;
                break;
            case "scp-939":
                procedure.analogBackup = true;
                procedure.isolatedNetwork = true;
                if (SCPGame.isProcedureOptionUnlocked(state, "biometricMonitoring"))
                    procedure.biometricMonitoring = true;
                revisedProcedure = true;
                riskChange = -7;
                break;
            case "scp-914":
                state.resources.parts += 3;
                state.resources.research += 1.5;
                riskChange = 0.8;
                break;
            case "scp-294":
                state.resources.medical += 0.5;
                state.resources.research += 1.2;
                riskChange = 0.5;
                break;
            case "scp-682":
                room.condition = SCPGame.clamp(room.condition + 5, 0, 100);
                riskChange = -10;
                break;
            case "scp-999":
                getSCPNearbyStaff(state, room).forEach((member) => {
                    member.needs.stress = SCPGame.clamp(member.needs.stress - 8, 0, 100);
                    if (member.assignmentRoomId !== room.id)
                        return;
                    member.needs.morale = SCPGame.clamp(member.needs.morale + 10, 0, 100);
                });
                riskChange = -2;
                break;
            case "scp-131":
                state.flags[`scp-131-census:${scp.id}:at`] = state.elapsedMinutes;
                riskChange = -4;
                break;
            case "scp-087":
                procedure.restrictedTesting = true;
                revisedProcedure = true;
                riskChange = -8;
                break;
            case "scp-008":
                getSCPNearbyStaff(state, room).forEach((member) => {
                    member.needs.contamination = SCPGame.clamp(member.needs.contamination - 8, 0, 100);
                });
                riskChange = -7;
                break;
        }
        if (revisedProcedure)
            procedure.version += 1;
        scp.breachRisk = SCPGame.clamp(scp.breachRisk + riskChange, 0, 120);
        procedure.compliance = SCPGame.evaluateProcedureCompliance(state, scp);
        const message = `${SCPGame.getSCPDefinition(scp.definitionId).designation} : ${profile.response.toLowerCase()} effectué.`;
        SCPGame.addNotification(state, "Protocole SCP exécuté", message, "info");
        SCPGame.logHistory(state, message);
        return { ok: true, message };
    }
    SCPGame.performSCPResponse = performSCPResponse;
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
        SCPGame.updateSurfaceAccesses(state);
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
    const UNDERGROUND_MOVE_SPEED = 0.55;
    const VERTICAL_TRANSFER_MINUTES = 4;
    function undergroundPowerAvailable(state, shaft) {
        return state.resources.power > 5 && !Boolean(state.flags["surface-blackout"])
            && (!shaft || SCPGame.getUndergroundUtilityStatus(state, shaft).power);
    }
    function undergroundTransitStatus(member) {
        if (!["injured", "quarantined", "dead"].includes(member.status))
            member.status = "moving";
    }
    function staffIsAtUndergroundRoom(member, room) {
        const point = SCPGame.undergroundRoomCenter(room);
        return member.position.layer === "underground" && (member.position.level ?? member.position.y) === room.level
            && Math.abs(member.position.x - point.x) < 0.0001
            && Math.abs((member.position.sectionY ?? 14) - (room.y ?? 14)) < 0.0001;
    }
    SCPGame.staffIsAtUndergroundRoom = staffIsAtUndergroundRoom;
    function undergroundRouteFailure(member) {
        member.routeBlockedReason = "Galerie coupée, module scellé ou habilitation insuffisante";
        undergroundTransitStatus(member);
        member.status = "queued";
        member.path = [];
        member.pathIndex = 0;
    }
    function moveUndergroundX(member, destinationX) {
        const delta = destinationX - member.position.x;
        member.position.x += Math.sign(delta) * Math.min(Math.abs(delta), UNDERGROUND_MOVE_SPEED);
        member.position.y = member.position.level ?? member.position.y;
    }
    // A transverse junction advances continuously in the third spatial axis.
    // Save the junction IDs instead of recomputing a path from a fractional row.
    function continueUndergroundLink(state, member) {
        const link = member.undergroundLink;
        if (!link || member.position.layer !== "underground")
            return;
        const from = state.undergroundRooms.find((room) => room.id === link.fromId);
        const to = state.undergroundRooms.find((room) => room.id === link.toId);
        const fromOpen = Boolean(from && SCPGame.canStaffEnterUndergroundRoom(from, member));
        const toOpen = Boolean(to && SCPGame.canStaffEnterUndergroundRoom(to, member));
        if (!fromOpen && !toOpen) {
            member.routeBlockedReason = "Jonction inter-coupes isolée des deux côtés";
            member.status = "queued";
            return;
        }
        const allowed = Boolean(fromOpen && toOpen && from && to && SCPGame.areUndergroundRoomsConnected(from, to, state));
        // A sector closed mid-crossing sends the member back along the same
        // junction at normal walking speed, never instantaneously through rock.
        const endpoint = allowed || !fromOpen ? to : from;
        if (!endpoint) {
            member.routeBlockedReason = "Coupe adjacente indisponible";
            member.status = "queued";
            return;
        }
        const goal = SCPGame.undergroundRoomSectionY(state, endpoint);
        const here = member.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state);
        const remaining = goal - here;
        member.position.sectionY = here + Math.sign(remaining) * Math.min(Math.abs(remaining), UNDERGROUND_MOVE_SPEED);
        member.position.x = link.crossingX;
        member.position.y = endpoint.level;
        undergroundTransitStatus(member);
        member.routeBlockedReason = allowed ? undefined : "Secteur fermé : retour à la coupe précédente";
        if (Math.abs(member.position.sectionY - goal) < 0.0001) {
            member.position.sectionY = goal;
            member.undergroundLink = undefined;
        }
    }
    // Follow x/sectionY/depth edges explicitly. Horizontal corridors share a
    // wall, transverse corridors share an x interval and vertical ones share
    // the same shaft footprint at consecutive depths.
    function advanceUndergroundWalk(state, member, destination, intentId = destination.id) {
        var _a;
        if (member.undergroundLink) {
            continueUndergroundLink(state, member);
            return false;
        }
        const route = SCPGame.planUndergroundRoute(state, member.position, destination, member);
        if (!route) {
            undergroundRouteFailure(member);
            return false;
        }
        member.routeBlockedReason = undefined;
        const origin = route[0];
        const next = route[1] ?? origin;
        const nextPoint = SCPGame.undergroundRoomPosition(state, next);
        const originPoint = SCPGame.undergroundRoomPosition(state, origin);
        const wasTarget = member.target?.layer === "underground" && member.targetRoomId === intentId
            && member.target.x === nextPoint.x && member.target.level === next.level
            && member.target.sectionY === nextPoint.sectionY;
        // Explicit airlock: queue at the origin center and equalize before the
        // physical edge traversal. Gates belong to an edge, not to an entire room.
        const gate = origin !== next ? SCPGame.getUndergroundGateBetween(state, origin, next) : undefined;
        if (gate && origin.level === next.level) {
            if (Math.abs(member.position.x - originPoint.x) > 0.0001) {
                member.target = originPoint;
                member.targetRoomId = intentId;
                moveUndergroundX(member, originPoint.x);
                undergroundTransitStatus(member);
                return false;
            }
            member.target = nextPoint;
            member.targetRoomId = intentId;
            if (gate.kind === "airlock")
                SCPGame.requestUndergroundGate(state, gate, member, origin, next);
            else if (!gate.cycle) {
                // A door also reserves the physical edge until the traveller clears
                // its threshold. This prevents a late lock from admitting half a step.
                gate.cycle = { staffId: member.id, fromId: origin.id,
                    toId: next.id, phase: 'crossing', remaining: 0 };
                undergroundTransitStatus(member);
            }
            else {
                member.status = 'queued';
                member.routeBlockedReason = 'Porte occupée — attente de franchissement';
            }
            return false;
        }
        undergroundTransitStatus(member);
        member.path = route.slice(1).map(SCPGame.undergroundRoomCenter);
        member.pathIndex = 0;
        (_a = member.position).sectionY ?? (_a.sectionY = SCPGame.getLegacyUndergroundSectionY(state));
        if (next.level !== (member.position.level ?? member.position.y)) {
            if (Math.abs(member.position.x - originPoint.x) > 0.0001) {
                member.target = originPoint;
                member.targetRoomId = intentId;
                member.taskProgress = 0;
                moveUndergroundX(member, originPoint.x);
                return false;
            }
            if (!wasTarget)
                member.taskProgress = 0;
            member.target = nextPoint;
            member.targetRoomId = intentId;
            if (!undergroundPowerAvailable(state, next)) {
                member.routeBlockedReason = "Ascenseur ou puits sans circuit électrique actif";
                return false;
            }
            member.taskProgress = Math.min(100, member.taskProgress + 100 / VERTICAL_TRANSFER_MINUTES);
            if (member.taskProgress < 100)
                return false;
            member.position = { ...nextPoint };
            member.taskProgress = 0;
            return false;
        }
        const originY = SCPGame.undergroundRoomSectionY(state, origin);
        const nextY = SCPGame.undergroundRoomSectionY(state, next);
        if (originY !== nextY) {
            const left = Math.max(origin.x, next.x);
            const right = Math.min(origin.x + origin.width, next.x + next.width);
            // Keep the crossing inside the shared opening. The midpoint gives a
            // deterministic portal when re-routing a staffed, saved installation.
            const crossingX = (left + right) / 2;
            if (Math.abs(member.position.x - crossingX) > 0.0001) {
                member.target = { ...originPoint, x: crossingX };
                member.targetRoomId = intentId;
                member.taskProgress = 0;
                moveUndergroundX(member, crossingX);
                return false;
            }
            member.undergroundLink = { fromId: origin.id, toId: next.id, crossingX };
            member.target = { ...nextPoint, x: crossingX };
            member.targetRoomId = intentId;
            member.taskProgress = 0;
            continueUndergroundLink(state, member);
            return false;
        }
        // A member already at a cell does not reset accumulated experience.
        if (staffIsAtUndergroundRoom(member, destination)) {
            member.target = SCPGame.undergroundRoomPosition(state, destination);
            member.targetRoomId = intentId;
            member.path = [];
            member.pathIndex = 0;
            member.status = "working";
            return true;
        }
        member.taskProgress = 0;
        member.target = nextPoint;
        member.targetRoomId = intentId;
        moveUndergroundX(member, nextPoint.x);
        if (!staffIsAtUndergroundRoom(member, destination))
            return false;
        member.path = [];
        member.pathIndex = 0;
        member.status = "working";
        return true;
    }
    function selectUndergroundEntry(state, member, destination) {
        let selected;
        let best = Infinity;
        for (const portal of SCPGame.getUndergroundPortals(state)) {
            const below = SCPGame.planUndergroundRoute(state, SCPGame.undergroundRoomPosition(state, portal.shaft), destination, member);
            if (!below)
                continue;
            const above = planSurfaceRoute(state, member.position, portal.elevator, member);
            if (above === undefined)
                continue;
            const distance = above.length + below.length * 2
                + Math.abs(SCPGame.undergroundRoomCenter(destination).x - SCPGame.undergroundRoomCenter(portal.shaft).x) / 2
                + Math.abs(SCPGame.undergroundRoomSectionY(state, destination) - SCPGame.undergroundRoomSectionY(state, portal.shaft)) * 3;
            if (distance < best) {
                best = distance;
                selected = portal;
            }
        }
        return selected;
    }
    // targetRoomId stores the destination and target stores the chosen shaft.
    // Both fields (and taskProgress) already survive save/load; no new schema.
    function continueUndergroundDescent(state, member) {
        const destination = state.undergroundRooms.find((room) => room.id === member.targetRoomId);
        const target = member.target;
        if (!destination || target?.layer !== "underground") {
            clearStaffRoute(member);
            member.taskProgress = 0;
            undergroundRouteFailure(member);
            return;
        }
        const portal = SCPGame.getUndergroundPortals(state).find(({ elevator, shaft }) => Math.abs(SCPGame.undergroundRoomCenter(shaft).x - target.x) < 0.0001
            && (target.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state)) === SCPGame.undergroundRoomSectionY(state, shaft)
            && SCPGame.pointInRect(member.position, elevator.x, elevator.y, elevator.width, elevator.height));
        if (!portal || !SCPGame.planUndergroundRoute(state, SCPGame.undergroundRoomPosition(state, portal.shaft), destination, member)) {
            member.routeBlockedReason = "Ascenseur ou réseau profond indisponible";
            undergroundTransitStatus(member);
            return;
        }
        undergroundTransitStatus(member);
        if (!undergroundPowerAvailable(state, portal.shaft)) {
            member.routeBlockedReason = "Ascenseur ou puits sans circuit électrique actif";
            return;
        }
        member.routeBlockedReason = undefined;
        member.taskProgress = Math.min(100, member.taskProgress + 100 / VERTICAL_TRANSFER_MINUTES);
        if (member.taskProgress < 100)
            return;
        member.position = SCPGame.undergroundRoomPosition(state, portal.shaft);
        member.taskProgress = 0;
        clearStaffRoute(member);
    }
    function chooseUndergroundReturnPortal(state, member) {
        let selected;
        let best = Infinity;
        for (const portal of SCPGame.getUndergroundPortals(state)) {
            const route = SCPGame.planUndergroundRoute(state, member.position, portal.shaft, member);
            if (!route)
                continue;
            // Preserve the selected return lift through a pause or save/load.
            const preferred = portal.elevator.id === member.targetRoomId ? -1000 : 0;
            const score = route.length * 2
                + Math.abs(member.position.x - SCPGame.undergroundRoomCenter(portal.shaft).x)
                + Math.abs((member.position.sectionY ?? SCPGame.getLegacyUndergroundSectionY(state))
                    - SCPGame.undergroundRoomSectionY(state, portal.shaft)) * 3 + preferred;
            if (score < best) {
                best = score;
                selected = portal;
            }
        }
        return selected;
    }
    function advanceUndergroundReturn(state, member) {
        const portal = chooseUndergroundReturnPortal(state, member);
        if (!portal) {
            undergroundRouteFailure(member);
            return;
        }
        const surfacePoint = getRoomCenter(portal.elevator);
        if (!staffIsAtUndergroundRoom(member, portal.shaft)) {
            advanceUndergroundWalk(state, member, portal.shaft, portal.elevator.id);
            return;
        }
        const continuing = member.target?.layer === "surface" && member.targetRoomId === portal.elevator.id;
        if (!continuing)
            member.taskProgress = 0;
        member.target = { layer: "surface", ...surfacePoint };
        member.targetRoomId = portal.elevator.id;
        member.path = [];
        member.pathIndex = 0;
        undergroundTransitStatus(member);
        if (!undergroundPowerAvailable(state, portal.shaft)) {
            member.routeBlockedReason = "Ascenseur ou puits sans circuit électrique actif";
            return;
        }
        member.routeBlockedReason = undefined;
        member.taskProgress = Math.min(100, member.taskProgress + 100 / VERTICAL_TRANSFER_MINUTES);
        if (member.taskProgress < 100)
            return;
        member.position = { layer: "surface", ...surfacePoint };
        member.taskProgress = 0;
        clearStaffRoute(member);
    }
    // Routes are derived from the current map. A loaded save has no cache entry,
    // so its serialized waypoints are rebuilt before the first movement.
    const staffRouteCache = new WeakMap();
    const ROUTE_RETRY_MINUTES = 10;
    function surfaceTopologySignature(state) {
        return JSON.stringify([state.surfaceWidth, state.surfaceHeight, state.resources.power > 1,
            Boolean(state.flags["surface-blackout"]), state.surfaceRooms.map((room) => [room.id, room.type, room.x, room.y, room.width, room.height, room.enabled,
                SCPGame.getSurfaceAccesses(state, room).map((access) => [access.id, access.side, access.offset, access.kind,
                    access.enabled, access.minClearance, access.allowedTraffic, access.direction, access.powered, access.airSupply])])]);
    }
    function roomArrivalCell(room) {
        return { x: Math.floor(room.x + room.width / 2), y: Math.floor(room.y + room.height / 2) };
    }
    function planSurfaceRoute(state, position, room, member) {
        if (!Number.isInteger(state.surfaceWidth) || !Number.isInteger(state.surfaceHeight)
            || state.surfaceWidth <= 0 || state.surfaceHeight <= 0
            || !room.enabled || !state.surfaceRooms.includes(room) || position.layer !== "surface"
            || !Number.isFinite(position.x) || !Number.isFinite(position.y)
            || position.x < 0 || position.y < 0 || position.x >= state.surfaceWidth || position.y >= state.surfaceHeight)
            return undefined;
        if (state.surfaceRooms.some((candidate) => ![candidate.x, candidate.y, candidate.width, candidate.height].every(Number.isInteger)
            || candidate.x < 0 || candidate.y < 0 || candidate.width <= 0 || candidate.height <= 0
            || candidate.x + candidate.width > state.surfaceWidth || candidate.y + candidate.height > state.surfaceHeight))
            return undefined;
        const start = { x: Math.floor(position.x), y: Math.floor(position.y) };
        const goal = roomArrivalCell(room);
        // The origin and destination interiors are walkable. Their wall crossings
        // are separately checked against explicit doors, permissions and direction.
        const origin = state.surfaceRooms.find((candidate) => candidate.type !== "corridor"
            && SCPGame.pointInRect(position, candidate.x, candidate.y, candidate.width, candidate.height));
        const blocked = new Set();
        const closed = new Set();
        for (const occupied of state.surfaceRooms) {
            if (occupied.id === origin?.id || occupied.id === room.id || occupied.type === "corridor" && occupied.enabled)
                continue;
            for (let x = occupied.x; x < occupied.x + occupied.width; x += 1) {
                for (let y = occupied.y; y < occupied.y + occupied.height; y += 1) {
                    blocked.add(`${x},${y}`);
                    if (!occupied.enabled)
                        closed.add(`${x},${y}`);
                }
            }
        }
        for (const corridor of state.surfaceRooms.filter((candidate) => candidate.type === "corridor" && candidate.enabled)) {
            for (let x = corridor.x; x < corridor.x + corridor.width; x += 1) {
                for (let y = corridor.y; y < corridor.y + corridor.height; y += 1) {
                    const key = `${x},${y}`;
                    const explicitWall = state.surfaceRooms.some((occupied) => occupied.type !== "corridor"
                        && occupied.accessPoints !== undefined && occupied.id !== origin?.id && occupied.id !== room.id
                        && SCPGame.pointInRect({ x, y }, occupied.x, occupied.y, occupied.width, occupied.height));
                    if (!closed.has(key) && !explicitWall)
                        blocked.delete(key);
                }
            }
        }
        if (blocked.has(`${start.x},${start.y}`) || blocked.has(`${goal.x},${goal.y}`))
            return undefined;
        const path = SCPGame.getManhattanPath(start, goal, state.surfaceWidth, state.surfaceHeight, blocked, (from, to) => SCPGame.canTraverseSurfaceAccessEdge(state, from, to, member));
        if (path.length === 0 && (start.x !== goal.x || start.y !== goal.y))
            return undefined;
        // Replanning halfway through a step must not connect a fractional position
        // diagonally to a new waypoint. Align inside the current cell on each axis.
        const prefix = [];
        if (position.x !== start.x)
            prefix.push({ x: start.x, y: position.y });
        if (position.y !== start.y)
            prefix.push(start);
        return prefix.concat(path);
    }
    SCPGame.planSurfaceRoute = planSurfaceRoute;
    function clearStaffRoute(member) {
        member.target = undefined;
        member.targetRoomId = undefined;
        member.path = [];
        member.pathIndex = 0;
        staffRouteCache.delete(member);
    }
    function rememberStaffRoute(state, member, topology, intent) {
        staffRouteCache.set(member, {
            state, topology, intent, roomId: member.targetRoomId,
            position: { x: member.position.x, y: member.position.y },
            path: member.path, pathIndex: member.pathIndex, checkedAt: state.elapsedMinutes
        });
    }
    function chooseStaffDestination(state, member, topology, service, assignedRoom) {
        const destinationIntent = assignedRoom ? `room:${assignedRoom.id}` : service ? `service:${service}` : "";
        const intent = `${destinationIntent}:${member.clearance}:${SCPGame.getStaffSurfaceTraffic(member)}`;
        if (!destinationIntent || member.position.layer !== "surface") {
            clearStaffRoute(member);
            member.routeBlockedReason = undefined;
            return undefined;
        }
        const matches = (room) => room.enabled
            && (assignedRoom ? room.id === assignedRoom.id : SCPGame.getSurfaceDefinition(room.type).services.includes(service));
        const waiting = SCPGame.getStaffSurfaceAccessWait(state, member);
        const queuedDestination = waiting ? state.surfaceRooms.find((candidate) => candidate.id === member.targetRoomId && matches(candidate)) : undefined;
        if (queuedDestination) {
            // Preserve FIFO order and the original expiry through temporary outages,
            // while a changed task or access profile still leaves the queue below.
            rememberStaffRoute(state, member, topology, intent);
            return queuedDestination;
        }
        const cache = staffRouteCache.get(member);
        if (cache?.state === state && cache.topology === topology && cache.intent === intent
            && cache.path === member.path && cache.pathIndex === member.pathIndex
            && cache.position.x === member.position.x && cache.position.y === member.position.y) {
            if (cache.roomId && cache.roomId === member.targetRoomId) {
                const cachedRoom = state.surfaceRooms.find((candidate) => candidate.id === cache.roomId && matches(candidate));
                if (cachedRoom) {
                    member.routeBlockedReason = undefined;
                    return cachedRoom;
                }
            }
            else if (!cache.roomId && !member.targetRoomId && state.elapsedMinutes >= cache.checkedAt
                && state.elapsedMinutes - cache.checkedAt < ROUTE_RETRY_MINUTES) {
                return undefined;
            }
        }
        const candidates = state.surfaceRooms.filter(matches).sort((a, b) => a.queue.length - b.queue.length);
        // Keep a usable destination while a task is in progress. Its own patient
        // entry must not make staff alternate between two hospitals every minute.
        const current = candidates.find((candidate) => candidate.id === member.targetRoomId);
        const ordered = current ? [current, ...candidates.filter((candidate) => candidate !== current)] : candidates;
        for (const candidate of ordered) {
            const path = planSurfaceRoute(state, member.position, candidate, member);
            if (path === undefined)
                continue;
            member.target = { layer: "surface", ...getRoomCenter(candidate) };
            member.targetRoomId = candidate.id;
            member.path = path.length ? [{ x: member.position.x, y: member.position.y }, ...path] : [];
            member.pathIndex = path.length ? 1 : 0;
            member.routeBlockedReason = undefined;
            rememberStaffRoute(state, member, topology, intent);
            return candidate;
        }
        clearStaffRoute(member);
        member.routeBlockedReason = SCPGame.describeSurfaceRouteFailure(state, member, candidates);
        rememberStaffRoute(state, member, topology, intent);
        return undefined;
    }
    function staffHasArrived(member, room) {
        const arrival = roomArrivalCell(room);
        return room.enabled && member.position.layer === "surface" && member.targetRoomId === room.id
            && member.pathIndex >= member.path.length
            && member.position.x === arrival.x && member.position.y === arrival.y;
    }
    function queueStaffTreatment(state, member, room, source, severity) {
        const isPatient = (item) => item.kind === "patient" && item.metadata?.staffId === member.id;
        const existing = state.surfaceRooms.flatMap((candidate) => candidate.queue).find(isPatient) || state.workItems.find(isPatient);
        if (existing && room.queue.includes(existing))
            return;
        // A changed route moves the existing request, preserving its deadline.
        state.surfaceRooms.forEach((candidate) => candidate.queue = candidate.queue.filter((item) => !isPatient(item)));
        state.workItems = state.workItems.filter((item) => !isPatient(item));
        const item = existing ?? createWorkItem("patient", severity, state.elapsedMinutes, source);
        item.metadata = { ...item.metadata, staffId: member.id };
        room.queue.push(item);
    }
    function updateStaff(state) {
        const topology = surfaceTopologySignature(state);
        const moraleBonus = state.scps.reduce((sum, scp) => {
            if (!scp.contained)
                return sum;
            return sum + SCPGame.getSCPDefinition(scp.definitionId).moraleEffect;
        }, 0);
        SCPGame.maintainUndergroundGates(state);
        state.staff.forEach((member) => {
            if (member.status === "dead")
                return;
            // Once admitted, finish or safely evacuate this one-edge transit before
            // changing shift, assignment or need destination. No remote work occurs.
            if (SCPGame.isStaffInSurfaceAccess(state, member)) {
                if (member.needs.contamination > 65)
                    member.status = "quarantined";
                else if (member.needs.health < 45 && member.status !== "quarantined")
                    member.status = "injured";
                member.needs.hunger = SCPGame.clamp(member.needs.hunger + 0.022, 0, 100);
                member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + 0.018, 0, 100);
                return;
            }
            if (SCPGame.processPartialSurfaceAccessStep(state, member)) {
                member.needs.hunger = SCPGame.clamp(member.needs.hunger + 0.022, 0, 100);
                member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + 0.018, 0, 100);
                return;
            }
            if (member.position.layer === "underground" && SCPGame.processUndergroundGateCycle(state, member)) {
                member.needs.hunger = SCPGame.clamp(member.needs.hunger + 0.022, 0, 100);
                member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + 0.018, 0, 100);
                return;
            }
            if (member.position.layer === "underground" && member.undergroundLink) {
                continueUndergroundLink(state, member);
                member.needs.hunger = SCPGame.clamp(member.needs.hunger + 0.022, 0, 100);
                member.needs.fatigue = SCPGame.clamp(member.needs.fatigue + 0.018, 0, 100);
                return;
            }
            // An already admitted lift transit finishes before a shift/need change.
            if (member.position.layer === "surface" && member.target?.layer === "underground"
                && state.undergroundRooms.some((room) => room.id === member.targetRoomId)) {
                continueUndergroundDescent(state, member);
                return;
            }
            const onShift = isOnShift(member, state.minuteOfDay);
            const difficulty = SCPGame.getDifficultyMultiplier(state.settings.difficulty);
            if (!onShift && member.position.layer === "underground") {
                advanceUndergroundReturn(state, member);
                return;
            }
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
            if (member.needs.contamination > 65) {
                member.status = "quarantined";
            }
            else if (member.needs.health < 45 && member.status !== "quarantined") {
                member.status = "injured";
            }
            let service;
            let assignedRoom;
            let assignedUndergroundRoom;
            let activity = "working";
            if (member.status === "quarantined") {
                service = "quarantine";
            }
            else if (member.status === "injured") {
                service = "medical";
            }
            else if (member.needs.hunger > 72) {
                service = "food";
                activity = "eating";
            }
            else if (member.needs.fatigue > 75 || member.needs.stress > 78) {
                service = "rest";
                activity = "resting";
            }
            else if (member.assignmentRoomId) {
                const surfaceRoom = state.surfaceRooms.find((room) => room.id === member.assignmentRoomId);
                const undergroundRoom = state.undergroundRooms.find((room) => room.id === member.assignmentRoomId && room.enabled);
                if (surfaceRoom) {
                    assignedRoom = surfaceRoom;
                }
                else if (undergroundRoom) {
                    assignedUndergroundRoom = undergroundRoom;
                    if (member.position.layer === "surface") {
                        const entry = selectUndergroundEntry(state, member, undergroundRoom);
                        if (!entry) {
                            clearStaffRoute(member);
                            undergroundRouteFailure(member);
                            member.routeBlockedReason = "Aucun ascenseur et galerie accessibles pour cette habilitation";
                            return;
                        }
                        assignedRoom = entry.elevator;
                    }
                }
            }
            else {
                service = member.role === "researcher" ? "research" : member.role === "engineer" ? "repair" : member.role === "medic" ? "medical" : member.role === "guard" || member.role === "mtf" ? "security" : member.role === "logistics" ? "logistics" : "administration";
            }
            if (member.position.layer === "underground") {
                if (assignedUndergroundRoom && !service) {
                    if (advanceUndergroundWalk(state, member, assignedUndergroundRoom)) {
                        applyWorkFatigue(member, assignedUndergroundRoom.scpId ? 1.4 : 1);
                    }
                }
                else {
                    advanceUndergroundReturn(state, member);
                }
                return;
            }
            const desiredRoom = chooseStaffDestination(state, member, topology, service, assignedRoom);
            if (desiredRoom && (member.status === "injured" || member.status === "quarantined")) {
                queueStaffTreatment(state, member, desiredRoom, member.status === "quarantined" ? "Suivi de quarantaine" : "Soins du personnel", member.status === "quarantined" ? 8 : 6);
            }
            if (member.status !== "injured" && member.status !== "quarantined") {
                member.status = desiredRoom ? "moving" : "queued";
            }
            if (desiredRoom && member.path.length > member.pathIndex && member.position.layer === "surface") {
                const target = member.path[member.pathIndex];
                const accessHandled = SCPGame.processSurfaceAccessStep(state, member, target);
                // Accessibility preferences affect rendering only, never simulation outcomes.
                const speed = 0.55;
                const dx = target.x - member.position.x;
                const dy = target.y - member.position.y;
                const distance = Math.hypot(dx, dy);
                if (accessHandled) {
                    // Waiting or admitted airlock staff stay on their source cell.
                }
                else if (distance <= speed) {
                    member.position.x = target.x;
                    member.position.y = target.y;
                    member.pathIndex += 1;
                }
                else {
                    member.position.x += dx / distance * speed;
                    member.position.y += dy / distance * speed;
                }
            }
            if (desiredRoom && assignedUndergroundRoom && staffHasArrived(member, desiredRoom)) {
                const entry = selectUndergroundEntry(state, member, assignedUndergroundRoom);
                if (entry && entry.elevator.id === desiredRoom.id) {
                    member.target = SCPGame.undergroundRoomPosition(state, entry.shaft);
                    member.targetRoomId = assignedUndergroundRoom.id;
                    member.taskProgress = 0;
                    member.path = [];
                    member.pathIndex = 0;
                    member.status = "moving";
                    return;
                }
                undergroundRouteFailure(member);
                return;
            }
            if (desiredRoom && staffHasArrived(member, desiredRoom)) {
                if (member.status === "injured" || member.status === "quarantined") {
                    member.needs.stress = SCPGame.clamp(member.needs.stress - 0.03, 0, 100);
                }
                else if (activity === "eating") {
                    member.status = "eating";
                    member.needs.hunger = SCPGame.clamp(member.needs.hunger - 0.45, 0, 100);
                    member.needs.morale = SCPGame.clamp(member.needs.morale + 0.05, 0, 100);
                    if (member.needs.hunger < 25)
                        member.status = "working";
                }
                else if (activity === "resting") {
                    member.status = "resting";
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
            const route = staffRouteCache.get(member);
            if (route) {
                route.position = { x: member.position.x, y: member.position.y };
                route.pathIndex = member.pathIndex;
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
        if (!room.enabled)
            return 0;
        const definition = SCPGame.getSurfaceDefinition(room.type);
        const staff = room.staffAssigned
            .map((id) => state.staff.find((member) => member.id === id))
            .filter((member) => Boolean(member && member.status === "working"
            && member.assignmentRoomId === room.id && staffHasArrived(member, room)));
        const required = Object.values(definition.requiredRoles).reduce((sum, count) => sum + (count ?? 0), 0);
        if (required > 0 && staff.length === 0)
            return 0;
        const staffing = required === 0 ? 1 : SCPGame.clamp(staff.length / required, 0, 1.4);
        const wellness = staff.length === 0 ? (required === 0 ? 1 : 0.25) : staff.reduce((sum, member) => sum + (1 - member.needs.fatigue / 180 - member.needs.stress / 220), 0) / staff.length;
        const utility = state.resources.power > 5 && state.resources.water > 3 ? 1 : 0.55;
        const condition = room.condition / 100 * 0.7 + room.cleanliness / 100 * 0.3;
        return SCPGame.clamp(staffing * wellness * utility * condition * (1 + (room.level - 1) * 0.15), 0.05, 2.2);
    }
    function patientIsPresent(state, room, item) {
        const staffId = item.kind === "patient" ? item.metadata?.staffId : undefined;
        if (typeof staffId !== "string")
            return true;
        const patient = state.staff.find((member) => member.id === staffId);
        return Boolean(patient && patient.status !== "dead" && staffHasArrived(patient, room));
    }
    function processSurfaceQueues(state) {
        state.surfaceRooms.forEach((room) => {
            // Closing a room pauses its service, not the deadline of queued work.
            const expired = room.queue.filter((item) => state.elapsedMinutes > item.expiresAt);
            expired.forEach((item) => failWorkItem(state, room, item));
            room.queue = room.queue.filter((item) => state.elapsedMinutes <= item.expiresAt);
            if (!room.enabled || room.queue.length === 0)
                return;
            const definition = SCPGame.getSurfaceDefinition(room.type);
            const efficiency = roomServiceEfficiency(state, room);
            if (efficiency <= 0)
                return;
            const capacity = Math.max(1, Math.floor(definition.capacity / 4));
            const ready = room.queue.filter((item) => patientIsPresent(state, room, item)).slice(0, capacity);
            ready.forEach((item) => {
                item.progress += efficiency * (12 / Math.max(1, item.severity));
            });
            const completed = ready.filter((item) => item.progress >= 100);
            completed.forEach((item) => completeWorkItem(state, room, item));
            room.queue = room.queue.filter((item) => !completed.includes(item));
        });
        state.workItems = state.workItems.filter((item) => {
            if (state.elapsedMinutes > item.expiresAt) {
                state.reputation.command = SCPGame.clamp(state.reputation.command - item.severity * 0.4, 0, 100);
                return false;
            }
            const service = item.kind === "patient" ? "medical" : item.kind === "delivery" ? "delivery" : item.kind === "anomaly" ? "anomaly" : item.kind === "repair" ? "repair" : item.kind === "research" ? "research" : item.kind === "inspection" ? "cover" : "access";
            const staffId = item.kind === "patient" ? item.metadata?.staffId : undefined;
            const patient = typeof staffId === "string" ? state.staff.find((member) => member.id === staffId) : undefined;
            // A staff treatment request follows the reachable destination selected by
            // that patient. Ordinary external work keeps the queue-based allocation.
            const room = typeof staffId === "string"
                ? state.surfaceRooms.find((candidate) => candidate.id === patient?.targetRoomId && candidate.enabled
                    && SCPGame.getSurfaceDefinition(candidate.type).services.includes(patient?.status === "quarantined" ? "quarantine" : "medical"))
                : findSurfaceRoomByService(state, service);
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
            SCPGame.cancelStaffSurfaceAccess(state, member.id);
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
            .filter((member) => Boolean(member && member.status === "working"
            && SCPGame.canStaffEnterUndergroundRoom(room, member) && staffIsAtUndergroundRoom(member, room)));
        const requiredStaff = Object.values(scpDefinition.requirements.staff).reduce((sum, count) => sum + (count ?? 0), 0);
        const plannedStaff = Math.max(requiredStaff, procedure.assignedStaff);
        score += plannedStaff === 0 ? 8 : SCPGame.clamp(assignedMembers.length / plannedStaff * 15, 0, 18);
        const avgTraining = assignedMembers.length ? assignedMembers.reduce((sum, member) => sum + member.experience, 0) / assignedMembers.length : 0;
        score += SCPGame.clamp((avgTraining - procedure.trainingRequired) * 0.15, -12, 8);
        const utilities = SCPGame.getUndergroundUtilityStatus(state, room);
        const powerRatio = state.resources.powerCapacity > 0 ? state.resources.power / state.resources.powerCapacity : 0;
        // A missing cable affects each SCP's facility differently: mechanical
        // SCP-914 remains capable of turning, while SCP-173 loses illumination,
        // and SCP-682 loses the powered acid bath. The anomaly is not the machine.
        const behavior = SCPGame.inspectSCPBehavior(state, scp);
        if (utilities.power && powerRatio >= scpDefinition.requirements.powerReliability)
            score += 10;
        else if (utilities.power)
            score -= (scpDefinition.requirements.powerReliability - powerRatio) * 35;
        score -= behavior?.compliancePenalty ?? 0;
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
            if (SCPGame.scp131CanAssist173(state, room))
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
            score += behavior?.acidFeedOperational ? 18 : -35;
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
            const behavior = SCPGame.inspectSCPBehavior(state, scp);
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
            scp.breachRisk = SCPGame.clamp(scp.breachRisk + basePressure + complianceEffect + conditionPenalty + supplyShortage + randomNoise
                + (behavior?.hourlyPressure ?? 0) - (compliance > 75 ? 0.9 : 0), 0, 120);
            if (scp.definitionId === "scp-106") {
                room.condition = SCPGame.clamp(room.condition - (procedure.maintenanceFrequency >= 70 ? 0.25 : 1.2), 0, 100);
            }
            const previousResearchProgress = scp.researchProgress;
            // Passive studies require instruments, safe access and someone actually
            // working at the SCP's room. A dark, deserted lab cannot finish a dossier.
            const studyFactor = (behavior?.localTeam ?? 0) > 0 ? (behavior?.studyMultiplier ?? 0) : 0;
            const gain = compliance / 120 * studyFactor;
            scp.researchProgress = SCPGame.clamp(scp.researchProgress + gain, 0, 100);
            scp.knowledge = SCPGame.clamp(scp.knowledge + compliance / 700 * studyFactor, 0, 100);
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
            if (scp.definitionId === "scp-999" && procedure.humaneCare && state.resources.food > 0
                && behavior?.utilities.air && !state.crisis.active) {
                // Only people on the scene receive a calming interaction. A sealed
                // cell does not magically soothe every worker above ground.
                SCPGame.getSCPNearbyStaff(state, room).filter((member) => member.assignmentRoomId === room.id).forEach((member) => {
                    member.needs.stress = SCPGame.clamp(member.needs.stress - 0.25, 0, 100);
                    member.needs.morale = SCPGame.clamp(member.needs.morale + 0.15, 0, 100);
                });
                scp.breachRisk = SCPGame.clamp(scp.breachRisk - 1.2, 0, 100);
            }
            // 914/294 generate resources only through a funded, authorized,
            // supervised player action. SCP-087 exploration stays forbidden.
            if (behavior?.faults.length) {
                const first = behavior.faults.find((fault) => fault.priority === "critical") ?? behavior.faults[0];
                scp.activeEffect = first.effect;
                const issue = `${first.service}:${first.effect}`;
                const key = `scp-operational-warning:${scp.id}`;
                if (state.flags[key] !== issue) {
                    state.flags[key] = issue;
                    SCPGame.addNotification(state, `Diagnostic ${definition.designation}`, first.effect, first.priority === "critical" ? "critical" : first.priority === "major" ? "major" : "minor");
                    SCPGame.logHistory(state, `Diagnostic ${definition.designation} : ${first.effect}`);
                }
            }
            else {
                const key = `scp-operational-warning:${scp.id}`;
                if (state.flags[key] && state.flags[key] !== "ok") {
                    SCPGame.addNotification(state, `${definition.designation} : mesures rétablies`, "Les contrôles particuliers de la cellule sont revenus à un état nominal.", "info");
                    state.flags[key] = "ok";
                }
                if (compliance >= 80)
                    scp.activeEffect = "Confinement nominal";
                else if (compliance >= 60)
                    scp.activeEffect = "Confinement sous surveillance";
                else if (compliance >= 40)
                    scp.activeEffect = "Procédure dégradée";
                else
                    scp.activeEffect = "Risque critique";
            }
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
        const undergroundUtilities = SCPGame.getUndergroundUtilityMap(state);
        state.undergroundRooms.filter((room) => room.type === "research-lab" && room.enabled).forEach((room) => {
            const utilities = undergroundUtilities.get(room.id);
            // Research equipment needs electricity and climate control; power
            // stored at the Site does not run a disconnected laboratory.
            if (utilities?.power && utilities.air)
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
        drawRegionSiteCampus(runtime, width);
        if (hover && state.view === "region") {
            const point = regionToScreen(runtime, width, hover.x, hover.y);
            const valid = hover.x >= 0 && hover.y >= 0 && hover.x < state.regionWidth && hover.y < state.regionHeight;
            drawDiamond(ctx, point, metrics.tileW, metrics.tileH, valid ? "rgba(106,210,175,.22)" : "rgba(230,92,92,.22)", valid ? "#72d2b0" : "#e05c5c");
        }
        drawCanvasTitle(ctx, "RÉGION ET SITE", "Vue extérieure : ville, annexes et toitures du même complexe intérieur", width);
        drawLegend(ctx, width, height, [
            ["Couverture", Math.round(state.reputation.cover), "#73c9a3"],
            ["Suspicion", Math.round(state.reputation.suspicion), "#e58b65"],
            ["Installations", state.regionFacilities.length, "#9ab7cf"]
        ]);
    }
    function drawRegionSiteCampus(runtime, width) {
        const state = runtime.state;
        const ctx = runtime.context;
        const bounds = SCPGame.getSiteRegionFootprint(state);
        const metrics = regionMetrics(runtime, width);
        const polygon = (x, y, w, h) => {
            const a = regionToScreen(runtime, width, x, y);
            const b = regionToScreen(runtime, width, x + w, y);
            const c = regionToScreen(runtime, width, x + w, y + h);
            const d = regionToScreen(runtime, width, x, y + h);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(c.x, c.y);
            ctx.lineTo(d.x, d.y);
            ctx.closePath();
        };
        // Exterior shell and roofs are 100% derived from the current surface-room
        // collection: building/removing a room immediately updates its roof.
        ctx.save();
        polygon(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.fillStyle = "rgba(11,24,31,.96)";
        ctx.strokeStyle = "rgba(104,221,194,.95)";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        const rooms = [...state.surfaceRooms].sort((a, b) => (a.type === "corridor" ? -1 : 0) - (b.type === "corridor" ? -1 : 0));
        for (const room of rooms) {
            const roof = SCPGame.getSurfaceRegionFootprint(state, room);
            const selected = state.selectedType === "surface-room" && state.selectedId === room.id;
            polygon(roof.x, roof.y, roof.width, roof.height);
            ctx.fillStyle = room.type === "corridor" ? "rgba(80,95,103,.85)" : SURFACE_COLORS[room.type];
            ctx.globalAlpha = room.enabled ? 0.87 : 0.28;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = selected ? "#fff1a5" : "rgba(227,241,237,.34)";
            ctx.lineWidth = selected ? 2.5 : 0.7;
            ctx.stroke();
            if (selected || room.type === "elevator") {
                const center = regionToScreen(runtime, width, roof.x + roof.width / 2, roof.y + roof.height / 2);
                ctx.fillStyle = selected ? "#fff1a5" : "#d0e7fa";
                ctx.font = "700 12px system-ui";
                ctx.textAlign = "center";
                ctx.fillText(selected ? SCPGame.getSurfaceDefinition(room.type).name : "⇩", center.x, center.y - 5);
            }
        }
        const label = regionToScreen(runtime, width, bounds.x + bounds.width / 2, bounds.y + bounds.height + 0.5);
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.font = "700 11px system-ui";
        ctx.fillStyle = "#bcebdc";
        ctx.fillText("SITE PRINCIPAL · TOITURES", label.x, label.y);
        ctx.font = "10px system-ui";
        ctx.fillStyle = "rgba(209,233,227,.82)";
        ctx.fillText(`${state.surfaceRooms.filter((room) => room.type !== "corridor").length} salles reliées au plan intérieur`, label.x, label.y + 13);
        // Three-scale reference: horizontal x is maintained in all projections.
        const section = SCPGame.getSiteSectionSurfaceY(state);
        const p1 = SCPGame.surfaceToRegionPosition(state, { x: 0, y: section });
        const p2 = SCPGame.surfaceToRegionPosition(state, { x: state.surfaceWidth, y: section });
        const a = regionToScreen(runtime, width, p1.x, p1.y);
        const b = regionToScreen(runtime, width, p2.x, p2.y);
        ctx.strokeStyle = "rgba(255,214,120,.8)";
        ctx.lineWidth = Math.max(1, metrics.tileW / 45);
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
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
        const annex = SCPGame.getActiveInteriorFacility(state);
        if (annex) {
            drawAnnexInterior(runtime, annex, width, height);
            return;
        }
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
        state.surfaceRooms.forEach((room) => drawSurfaceAccesses(ctx, runtime, room, metrics));
        drawSiteSurfaceSection(ctx, runtime, metrics);
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
        drawCanvasTitle(ctx, "INTÉRIEUR DU SITE", "Même bâtiment que la vue Région · plan des pièces · coupe A-A vers le sous-sol", width);
        const queues = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length
            + SCPGame.getSurfaceAccesses(state, room).reduce((waiting, access) => waiting + access.queue.length, 0), 0) + state.workItems.length;
        drawLegend(ctx, width, height, [
            ["Personnel", state.staff.filter((member) => member.status !== "dead").length, "#9ab7cf"],
            ["Files", queues, queues > 12 ? "#e36e68" : "#d5bd6a"],
            ["Énergie", Math.round(state.resources.power), "#d6c868"]
        ]);
    }
    function drawAnnexInterior(runtime, facility, width, height) {
        const state = runtime.state;
        const ctx = runtime.context;
        const plan = SCPGame.getAnnexInteriorPlan(state, facility);
        if (!plan)
            return;
        const metrics = surfaceMetrics(runtime, width, height);
        const palette = {
            operations: "#2d646b", control: "#395e86", support: "#665d49", entry: "#43685a"
        };
        const cell = metrics.cell;
        const px = metrics.originX + plan.footprint.x * cell;
        const py = metrics.originY + plan.footprint.y * cell;
        const pw = plan.footprint.width * cell;
        const ph = plan.footprint.height * cell;
        ctx.fillStyle = "#18232a";
        ctx.fillRect(px - 12, py - 12, pw + 24, ph + 24);
        ctx.strokeStyle = "#b9d4cf";
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 2, py - 2, pw + 4, ph + 4);
        for (const zone of plan.rooms) {
            const x = metrics.originX + zone.x * cell;
            const y = metrics.originY + zone.y * cell;
            const w = zone.width * cell;
            const h = zone.height * cell;
            const selected = state.flags["annex-room-selected"] === zone.id;
            ctx.fillStyle = facility.enabled ? palette[zone.category] : "#3c4346";
            ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
            ctx.fillStyle = "rgba(255,255,255,.065)";
            for (let step = 0; step < 3; step += 1) {
                const slot = w * (0.23 + step * 0.25);
                ctx.fillRect(x + slot - 4, y + h * 0.25, 8, Math.max(4, h * 0.12));
            }
            ctx.strokeStyle = selected ? "#ffde99" : "rgba(222,242,237,.57)";
            ctx.lineWidth = selected ? 3 : 1.5;
            ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
            ctx.textAlign = "center";
            ctx.fillStyle = "#f4f8f6";
            ctx.font = "700 10px system-ui";
            const parts = zone.name.split(" ");
            const mid = Math.ceil(parts.length / 2);
            ctx.fillText(parts.slice(0, mid).join(" ").slice(0, 25), x + w / 2, y + h / 2 - 4);
            ctx.fillText(parts.slice(mid).join(" ").slice(0, 25), x + w / 2, y + h / 2 + 10);
        }
        ctx.textAlign = "left";
        // The schematic's global volume is linked to the actual regional object;
        // these four zones are explanatory, not extra production or employee slots.
        ctx.fillStyle = "rgba(14,22,26,.92)";
        ctx.fillRect(px, py - 34, pw, 24);
        ctx.fillStyle = "#c9ede3";
        ctx.font = "700 12px system-ui";
        ctx.fillText(`ANNEXE ${facility.id.slice(-6).toUpperCase()} · NIV. ${facility.level}`, px + 7, py - 18);
        drawCanvasTitle(ctx, "INTÉRIEUR DE L'ANNEXE", `${plan.buildingName} · bâtiment de la Région · état ${Math.round(facility.condition)} %`, width);
        drawLegend(ctx, width, height, [
            ["Zones", plan.rooms.length, "#7bcab5"],
            ["État", Math.round(facility.condition), facility.condition < 45 ? "#e36e68" : "#73c9a3"],
            ["Niveau", facility.level, "#9ab7cf"]
        ]);
    }
    function drawSiteSurfaceSection(ctx, runtime, metrics) {
        const state = runtime.state;
        const y = metrics.originY + (SCPGame.getSiteSectionSurfaceY(state) + 0.5) * metrics.cell;
        ctx.save();
        ctx.strokeStyle = "rgba(255,206,118,.7)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(metrics.originX, y);
        ctx.lineTo(metrics.originX + state.surfaceWidth * metrics.cell, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(13,22,27,.9)";
        ctx.fillRect(metrics.originX + 4, y - 21, 118, 16);
        ctx.fillStyle = "#ffdda0";
        ctx.font = "700 10px system-ui";
        ctx.fillText(`COUPE Y=${SCPGame.getSiteSectionSurfaceY(state)} · ${SCPGame.getSiteSectionSurfaceY(state) + 1}/${state.surfaceHeight}`, metrics.originX + 9, y - 9);
        for (const portal of SCPGame.getUndergroundPortals(state)) {
            const center = SCPGame.undergroundXToSurfaceX(state, portal.shaft.x + portal.shaft.width / 2);
            const x = metrics.originX + center * metrics.cell;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(5, metrics.cell * 0.18), 0, Math.PI * 2);
            ctx.fillStyle = "#c5f7e5";
            ctx.fill();
            ctx.strokeStyle = "#17353d";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#12323a";
            ctx.textAlign = "center";
            ctx.font = "700 9px system-ui";
            ctx.fillText("⇅", x, y + 3);
        }
        ctx.textAlign = "left";
        ctx.restore();
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
    function drawSurfaceAccesses(ctx, runtime, room, metrics) {
        if (room.type === "corridor")
            return;
        const state = runtime.state;
        const selected = state.selectedType === "surface-room" && state.selectedId === room.id;
        SCPGame.getSurfaceAccesses(state, room).forEach((access, index) => {
            const cells = SCPGame.getSurfaceAccessCells(room, access);
            const centerX = metrics.originX + ((cells.inside.x + cells.outside.x) / 2 + 0.5) * metrics.cell;
            const centerY = metrics.originY + ((cells.inside.y + cells.outside.y) / 2 + 0.5) * metrics.cell;
            const halfWidth = metrics.cell * 0.29;
            const depth = metrics.cell * 0.17;
            const angle = access.side === "north" ? 0 : access.side === "east" ? Math.PI / 2 : access.side === "south" ? Math.PI : -Math.PI / 2;
            const doorState = SCPGame.getSurfaceAccessDoorState(state, room, access);
            const failure = access.kind === "airlock" && (!access.powered || !access.airSupply || state.resources.power <= 1 || Boolean(state.flags["surface-blackout"]));
            const color = !access.enabled || failure ? "#ef8585" : access.cycle ? "#8dc9ef" : access.kind === "airlock" ? "#e5c878" : "#83e2bb";
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            ctx.fillStyle = "#0b1418";
            ctx.fillRect(-halfWidth - 2, -depth - 2, halfWidth * 2 + 4, depth * 2 + 4);
            ctx.strokeStyle = color;
            ctx.lineWidth = selected ? 2.4 : 1.8;
            if (access.kind === "airlock") {
                ctx.strokeRect(-halfWidth, -depth, halfWidth * 2, depth * 2);
                const enteringFromOutside = !access.cycle || access.cycle.from.x === cells.outside.x && access.cycle.from.y === cells.outside.y;
                const outsideOpen = enteringFromOutside ? doorState.entryOpen : doorState.exitOpen;
                const insideOpen = enteringFromOutside ? doorState.exitOpen : doorState.entryOpen;
                ctx.fillStyle = "#0b1418";
                ctx.fillRect(-halfWidth + 1, -depth - 2, halfWidth * 2 - 2, 4);
                ctx.fillRect(-halfWidth + 1, depth - 2, halfWidth * 2 - 2, 4);
                for (const [leafY, open] of [[-depth, outsideOpen], [depth, insideOpen]]) {
                    ctx.beginPath();
                    if (open) {
                        ctx.moveTo(-halfWidth, leafY);
                        ctx.lineTo(-halfWidth * 0.7, leafY);
                        ctx.moveTo(halfWidth * 0.7, leafY);
                        ctx.lineTo(halfWidth, leafY);
                    }
                    else {
                        ctx.moveTo(-halfWidth, leafY);
                        ctx.lineTo(halfWidth, leafY);
                    }
                    ctx.stroke();
                }
            }
            else {
                ctx.beginPath();
                ctx.moveTo(-halfWidth, 0);
                ctx.lineTo(doorState.entryOpen ? -halfWidth : halfWidth, doorState.entryOpen ? depth * 1.5 : 0);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(halfWidth, -depth * 0.7);
                ctx.lineTo(halfWidth, depth * 0.7);
                ctx.stroke();
            }
            if (!access.enabled || failure) {
                ctx.beginPath();
                ctx.moveTo(-3, -3);
                ctx.lineTo(3, 3);
                ctx.moveTo(3, -3);
                ctx.lineTo(-3, 3);
                ctx.stroke();
            }
            ctx.restore();
            if (selected) {
                const inward = { x: cells.inside.x - cells.outside.x, y: cells.inside.y - cells.outside.y };
                const x = centerX + inward.x * metrics.cell * 0.48;
                const y = centerY + inward.y * metrics.cell * 0.48;
                ctx.save();
                ctx.fillStyle = "#0b161b";
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, Math.max(6, metrics.cell * 0.19), 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = color;
                ctx.font = `700 ${Math.max(8, Math.min(10, metrics.cell * 0.3))}px system-ui`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(String(index + 1), x, y);
                ctx.restore();
            }
        });
    }
    function drawSurfaceStaff(ctx, runtime, metrics) {
        const state = runtime.state;
        const gateOccupants = new Map();
        const waitingStaff = new Map();
        for (const room of state.surfaceRooms) {
            for (const access of SCPGame.getSurfaceAccesses(state, room)) {
                const { inside, outside } = SCPGame.getSurfaceAccessCells(room, access);
                if (access.cycle)
                    gateOccupants.set(access.cycle.staffId, { x: (inside.x + outside.x) / 2 + 0.5, y: (inside.y + outside.y) / 2 + 0.5 });
                access.queue.forEach((request, index) => waitingStaff.set(request.staffId, { point: request.from, index }));
            }
        }
        state.staff.filter((member) => member.status !== "dead" && member.position.layer === "surface").forEach((member, index) => {
            const chamber = gateOccupants.get(member.id);
            const waiting = waitingStaff.get(member.id);
            const staffX = chamber?.x ?? (waiting ? waiting.point.x + 0.15 + (waiting.index % 4) * 0.23 : member.position.x + 0.5 + ((index % 3) - 1) * 0.08);
            const staffY = chamber?.y ?? (waiting ? waiting.point.y + 0.15 + Math.floor(waiting.index / 4) * 0.23 : member.position.y + 0.5 + ((index % 2) - 0.5) * 0.12);
            const x = metrics.originX + staffX * metrics.cell;
            const y = metrics.originY + staffY * metrics.cell;
            const radius = chamber || waiting ? SCPGame.clamp(metrics.cell * 0.075, 1.5, 3) : SCPGame.clamp(metrics.cell * 0.14, 3, 6);
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
            ctx.fillText(`NIVEAU -${level + 1}`, Math.max(10, metrics.originX - 70), y + metrics.levelH / 2 + 3);
            for (let x = 0; x < state.undergroundWidth; x += 1) {
                if ((x + level * 3) % 7 === 0) {
                    ctx.fillStyle = "rgba(120,110,96,.08)";
                    ctx.beginPath();
                    ctx.arc(metrics.originX + x * metrics.cellW + 8, y + 14 + (x % 3) * 8, 3 + (x % 4), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        drawUndergroundSurfaceStrip(ctx, runtime, metrics);
        const cut = SCPGame.getSiteSectionSurfaceY(state);
        const visibleRooms = state.undergroundRooms.filter((room) => SCPGame.undergroundRoomSectionY(state, room) === cut);
        const utilityMap = SCPGame.getUndergroundUtilityMap(state);
        visibleRooms.forEach((room) => drawUndergroundRoom(ctx, runtime, room, metrics, utilityMap));
        // Junctions across the current cut are visible; neighbouring transverse
        // links have directional markers, not fictitious on-screen corridors.
        const accessible = visibleRooms.filter((room) => SCPGame.canStaffEnterUndergroundRoom(room));
        for (let i = 0; i < accessible.length; i += 1) {
            for (let j = i + 1; j < accessible.length; j += 1) {
                const a = accessible[i], b = accessible[j];
                if (!SCPGame.areUndergroundRoomsConnected(a, b, state))
                    continue;
                if (a.level === b.level) {
                    const boundary = a.x + a.width === b.x ? b.x : a.x;
                    ctx.fillStyle = "rgba(129,226,193,.85)";
                    ctx.fillRect(metrics.originX + boundary * metrics.cellW - 2, metrics.originY + a.level * metrics.levelH + metrics.levelH * 0.48 - 5, 4, 10);
                }
                else {
                    const x = metrics.originX + (a.x + a.width / 2) * metrics.cellW;
                    const top = metrics.originY + Math.min(a.level, b.level) * metrics.levelH;
                    ctx.strokeStyle = "rgba(129,226,193,.85)";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x, top + metrics.levelH - 12);
                    ctx.lineTo(x, top + metrics.levelH + 7);
                    ctx.stroke();
                }
            }
        }
        // Report transverse exits on this cut so a player can trace branches.
        for (const room of accessible) {
            for (const other of state.undergroundRooms) {
                if (other === room || SCPGame.undergroundRoomSectionY(state, other) === cut
                    || !SCPGame.areUndergroundRoomsConnected(room, other, state))
                    continue;
                const midpoint = (Math.max(room.x, other.x)
                    + Math.min(room.x + room.width, other.x + other.width)) / 2;
                const x = metrics.originX + midpoint * metrics.cellW;
                const y = metrics.originY + room.level * metrics.levelH
                    + (SCPGame.undergroundRoomSectionY(state, other) > cut ? metrics.levelH * 0.83 : metrics.levelH * 0.17);
                ctx.fillStyle = "#bee6cf";
                ctx.font = "700 14px system-ui";
                ctx.fillText(SCPGame.undergroundRoomSectionY(state, other) > cut ? "↓" : "↑", x - 5, y);
            }
        }
        // A gate remains visible even when locked, unlike a missing corridor.
        for (const gate of state.undergroundGates ?? []) {
            const a = visibleRooms.find((room) => room.id === gate.roomAId);
            const b = visibleRooms.find((room) => room.id === gate.roomBId);
            if (!a || !b || a.level !== b.level)
                continue;
            const boundary = a.x + a.width === b.x ? b.x : b.x + b.width === a.x ? a.x : (Math.max(a.x, b.x) + Math.min(a.x + a.width, b.x + b.width)) / 2;
            const x = metrics.originX + boundary * metrics.cellW;
            const y = metrics.originY + a.level * metrics.levelH + metrics.levelH * .48;
            const open = SCPGame.canTraverseUndergroundGate(state, a, b);
            ctx.save();
            ctx.fillStyle = open ? (gate.kind === 'airlock' ? '#eccf87' : '#9ed6c9') : '#e57372';
            ctx.strokeStyle = '#172a30';
            ctx.lineWidth = 1.3;
            ctx.fillRect(x - 5, y - 9, 10, 18);
            ctx.strokeRect(x - 5, y - 9, 10, 18);
            if (gate.kind === 'airlock') {
                ctx.beginPath();
                ctx.moveTo(x - 2, y - 6);
                ctx.lineTo(x - 2, y + 6);
                ctx.moveTo(x + 2, y - 6);
                ctx.lineTo(x + 2, y + 6);
                ctx.stroke();
            }
            ctx.restore();
        }
        // Transverse gate thresholds must stay visible on this cut even when a
        // lockdown hides the normal green arrow into the neighbouring Y slice.
        for (const gate of state.undergroundGates ?? []) {
            const a = state.undergroundRooms.find((room) => room.id === gate.roomAId);
            const b = state.undergroundRooms.find((room) => room.id === gate.roomBId);
            if (!a || !b || a.level !== b.level)
                continue;
            const ay = SCPGame.undergroundRoomSectionY(state, a);
            const by = SCPGame.undergroundRoomSectionY(state, b);
            if (ay === by || Math.abs(ay - by) !== 1 || (ay !== cut && by !== cut))
                continue;
            const visible = ay === cut ? a : b;
            const other = ay === cut ? b : a;
            const corridorX = (Math.max(a.x, b.x) + Math.min(a.x + a.width, b.x + b.width)) / 2;
            const markerX = metrics.originX + corridorX * metrics.cellW;
            const markerY = metrics.originY + visible.level * metrics.levelH
                + (SCPGame.undergroundRoomSectionY(state, other) > cut ? metrics.levelH * .83 : metrics.levelH * .17);
            const open = SCPGame.canTraverseUndergroundGate(state, visible, other);
            ctx.save();
            ctx.fillStyle = open ? (gate.kind === 'airlock' ? '#eccf87' : '#9ed6c9') : '#e57372';
            ctx.strokeStyle = '#172a30';
            ctx.lineWidth = 1;
            ctx.fillRect(markerX - 6, markerY - 10, 12, 11);
            ctx.strokeRect(markerX - 6, markerY - 10, 12, 11);
            ctx.restore();
        }
        drawUndergroundStaff(ctx, runtime, metrics);
        drawUndergroundPlanInset(runtime, width);
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
        drawCanvasTitle(ctx, "RÉSEAU SOUTERRAIN 3 AXES", `Coupe Y=${SCPGame.getSiteSectionSurfaceY(state)} · ${visibleRooms.length} modules ici · jonctions X/Y et puits profondeur`, width);
        const contained = state.scps.filter((scp) => scp.contained).length;
        const maxRisk = Math.max(0, ...state.scps.filter((scp) => scp.contained).map((scp) => scp.breachRisk));
        drawLegend(ctx, width, height, [
            ["Niveaux", new Set(state.undergroundRooms.map((room) => room.level)).size, "#9ab7cf"],
            ["SCP confinés", contained, "#73c9a3"],
            ["Risque max", Math.round(maxRisk), maxRisk > 70 ? "#e36e68" : "#d5bd6a"]
        ]);
    }
    function undergroundMinimapBounds(runtime, width) {
        if (width < 780)
            return undefined;
        return { x: width - 238, y: 66, width: 218, height: 150 };
    }
    /** Overview of all transverse cuts at a chosen depth, using the SAME rooms. */
    function drawUndergroundPlanInset(runtime, width) {
        const bounds = undergroundMinimapBounds(runtime, width);
        if (!bounds)
            return;
        const state = runtime.state;
        const ctx = runtime.context;
        const level = SCPGame.getUndergroundPlanLevel(state);
        const padding = 8;
        const startY = bounds.y + 26;
        const usableW = bounds.width - padding * 2;
        const usableH = bounds.height - 34;
        const stepX = usableW / state.undergroundWidth;
        const stepY = usableH / state.surfaceHeight;
        ctx.save();
        ctx.fillStyle = "rgba(6,17,24,.96)";
        ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.strokeStyle = "rgba(138,195,192,.7)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.fillStyle = "#d5efe7";
        ctx.font = "700 11px system-ui";
        ctx.fillText(`PLAN HORIZONTAL · NIVEAU -${level + 1}`, bounds.x + 9, bounds.y + 17);
        for (const room of state.undergroundRooms.filter((entry) => entry.level === level)) {
            const x = bounds.x + padding + room.x * stepX;
            const y = startY + SCPGame.undergroundRoomSectionY(state, room) * stepY;
            const w = room.width * stepX;
            ctx.fillStyle = room.sealed || !room.enabled ? "#985451" : UNDERGROUND_COLORS[room.type];
            ctx.fillRect(x + .3, y + .3, Math.max(1, w - .6), Math.max(2, stepY - .6));
            ctx.strokeStyle = state.selectedId === room.id ? "#fff2b5" : "rgba(230,249,240,.34)";
            ctx.lineWidth = state.selectedId === room.id ? 2 : 0.6;
            ctx.strokeRect(x + .3, y + .3, Math.max(1, w - .6), Math.max(2, stepY - .6));
        }
        // The plan and the lateral section use the exact same gate records.
        // Amber = airlock, green = door, red = closed or unpowered threshold.
        for (const gate of state.undergroundGates ?? []) {
            const a = state.undergroundRooms.find((room) => room.id === gate.roomAId);
            const b = state.undergroundRooms.find((room) => room.id === gate.roomBId);
            if (!a || !b || a.level !== level || b.level !== level)
                continue;
            const ay = SCPGame.undergroundRoomSectionY(state, a), by = SCPGame.undergroundRoomSectionY(state, b);
            const pX = ay === by ? (a.x + a.width === b.x ? b.x : a.x)
                : (Math.max(a.x, b.x) + Math.min(a.x + a.width, b.x + b.width)) / 2;
            const pY = ay === by ? ay + .5 : (ay + by + 1) / 2;
            ctx.fillStyle = SCPGame.canTraverseUndergroundGate(state, a, b)
                ? gate.kind === 'airlock' ? '#eccf87' : '#9ed6c9' : '#e57372';
            ctx.fillRect(bounds.x + padding + pX * stepX - 2, startY + pY * stepY - 2, 4, 4);
        }
        const cut = SCPGame.getSiteSectionSurfaceY(state);
        ctx.strokeStyle = "#ffdc91";
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bounds.x + padding, startY + (cut + 0.5) * stepY);
        ctx.lineTo(bounds.x + padding + usableW, startY + (cut + 0.5) * stepY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
    function screenToUndergroundMiniMap(runtime, clientX, clientY) {
        const rect = runtime.canvas.getBoundingClientRect();
        const bounds = undergroundMinimapBounds(runtime, rect.width);
        if (!bounds)
            return undefined;
        const px = clientX - rect.left;
        const py = clientY - rect.top;
        const padding = 8;
        const fromY = bounds.y + 26;
        if (px < bounds.x + padding || px >= bounds.x + bounds.width - padding
            || py < fromY || py >= bounds.y + bounds.height - 8)
            return undefined;
        const x = Math.floor((px - bounds.x - padding) * runtime.state.undergroundWidth / (bounds.width - 2 * padding));
        const sectionY = Math.floor((py - fromY) * runtime.state.surfaceHeight / (bounds.height - 34));
        return { x, sectionY };
    }
    function drawUndergroundSurfaceStrip(ctx, runtime, metrics) {
        const state = runtime.state;
        const sectionY = SCPGame.getSiteSectionSurfaceY(state);
        const roofTop = metrics.originY - 14;
        ctx.save();
        for (const room of state.surfaceRooms) {
            if (!SCPGame.isSurfaceRoomOnUndergroundSection(state, room))
                continue;
            const left = SCPGame.surfaceXToUndergroundX(state, room.x);
            const right = SCPGame.surfaceXToUndergroundX(state, room.x + room.width);
            const visibleLeft = Math.max(0, left);
            const visibleRight = Math.min(state.undergroundWidth, right);
            if (visibleRight <= visibleLeft)
                continue;
            const x = metrics.originX + visibleLeft * metrics.cellW;
            const w = (visibleRight - visibleLeft) * metrics.cellW;
            const active = state.selectedType === "underground-room" && state.undergroundRooms.some((u) => u.id === state.selectedId && SCPGame.getSurfaceRoomAboveUnderground(state, u)?.id === room.id);
            ctx.fillStyle = active ? "#ffe4a5" : SURFACE_COLORS[room.type];
            ctx.fillRect(x + 1, roofTop, Math.max(1, w - 2), 10);
            ctx.strokeStyle = "rgba(255,255,255,.5)";
            ctx.strokeRect(x + 1, roofTop, Math.max(1, w - 2), 10);
        }
        for (const portal of SCPGame.getUndergroundPortals(state).filter((entry) => SCPGame.undergroundRoomSectionY(state, entry.shaft) === sectionY)) {
            const x = metrics.originX + (portal.shaft.x + portal.shaft.width / 2) * metrics.cellW;
            ctx.strokeStyle = "#b3f1dd";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(x, roofTop);
            ctx.lineTo(x, metrics.originY + 8);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(237,236,216,.82)";
        ctx.font = "9px system-ui";
        ctx.textAlign = "left";
        if (metrics.originX > 80)
            ctx.fillText("BÂTIMENT", metrics.originX - 67, roofTop + 8);
        ctx.restore();
        // La bande reste une section précise, tandis que les nouvelles galeries
        // possèdent maintenant une coordonnée transversale et une profondeur réelle.
    }
    function drawUndergroundRoom(ctx, runtime, room, metrics, utilityMap) {
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
        const utilities = utilityMap.get(room.id) ?? { power: false, water: false, air: false };
        // Three bars fit inside even a one-cell lift shaft.
        const barStride = Math.max(4, Math.min(11, (w - 10) / 3));
        for (const [index, ok, color] of [
            [0, utilities.power, "#edd67d"], [1, utilities.water, "#83baf5"],
            [2, utilities.air, "#93e4b5"]
        ]) {
            ctx.fillStyle = ok ? color : "#874c51";
            ctx.fillRect(x + 5 + index * barStride, y + h - 16, Math.max(2, barStride - 2), 3);
        }
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
        runtime.state.staff.filter((member) => member.status !== "dead" && member.position.layer === "underground"
            && Math.abs(SCPGame.getStaffUndergroundSectionY(runtime.state, member) - SCPGame.getSiteSectionSurfaceY(runtime.state)) < 0.55)
            .forEach((member, index) => {
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
    function wrapCanvasLabel(ctx, text, maxWidth) {
        const lines = [];
        let line = "";
        for (const word of text.trim().split(/\s+/)) {
            const next = line ? `${line} ${word}` : word;
            if (ctx.measureText(next).width <= maxWidth) {
                line = next;
                continue;
            }
            if (line)
                lines.push(line);
            line = "";
            // Also retain a long unbroken name without drawing into the next card.
            for (const character of word) {
                if (line && ctx.measureText(line + character).width > maxWidth) {
                    lines.push(line);
                    line = character;
                }
                else
                    line += character;
            }
        }
        if (line)
            lines.push(line);
        return lines.length ? lines : [""];
    }
    function commandCards(runtime, width, height) {
        const zones = runtime.state.crisis.zones;
        const columns = width < 760 ? 2 : 3;
        const gap = 14;
        const cardWidth = Math.min(260, (width - 40 - gap * (columns - 1)) / columns);
        runtime.context.save();
        runtime.context.font = "700 12px system-ui";
        const titles = zones.map((zone) => wrapCanvasLabel(runtime.context, zone.name, cardWidth - 24));
        runtime.context.restore();
        const cardHeight = 128 + (Math.max(1, ...titles.map((lines) => lines.length)) - 1) * 14;
        return zones.map((zone, index) => ({
            zone,
            titleLines: titles[index],
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
            card.titleLines.forEach((line, index) => ctx.fillText(line, card.x + 12, card.y + 20 + index * 14));
            const titleOffset = card.height - 128;
            ctx.font = "10px system-ui";
            ctx.fillStyle = "rgba(231,237,238,.65)";
            ctx.fillText(`Population ${card.zone.population} · Victimes ${card.zone.casualties}`, card.x + 12, card.y + 38 + titleOffset);
            drawMiniBar(ctx, card.x + 12, card.y + 49 + titleOffset, card.width - 24, 8, card.zone.threat, "Menace", card.zone.threat > 65 ? "#df6669" : "#d3ad5a");
            drawMiniBar(ctx, card.x + 12, card.y + 72 + titleOffset, card.width - 24, 6, card.zone.security, "Sécurité", "#68a9d3");
            drawMiniBar(ctx, card.x + 12, card.y + 93 + titleOffset, card.width - 24, 6, card.zone.contamination, "Contam.", "#72bd75");
            if (card.zone.sealed)
                drawPill(ctx, card.x + card.width - 34, card.y + card.height - 10, "SCELLÉ", "#9c7d42");
            if (card.zone.evacuated)
                drawPill(ctx, card.x + card.width - (card.zone.sealed ? 84 : 34), card.y + card.height - 10, "ÉVAC.", "#55768d");
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
            const rect = runtime.canvas.getBoundingClientRect();
            const metrics = regionMetrics(runtime, rect.width);
            const dx = (clientX - rect.left - metrics.originX) / (metrics.tileW * 0.5);
            const dy = (clientY - rect.top - metrics.originY) / (metrics.tileH * 0.5);
            const linked = SCPGame.getSurfaceRoomAtRegionPosition(state, { x: (dx + dy) / 2, y: (dy - dx) / 2 });
            if (linked) {
                state.selectedId = linked.id;
                state.selectedType = "surface-room";
            }
            else {
                selectAtGridCell(runtime, screenToRegionCell(runtime, clientX, clientY));
            }
        }
        else if (state.view === "surface") {
            selectAtGridCell(runtime, screenToSurfaceCell(runtime, clientX, clientY));
        }
        else if (state.view === "underground") {
            const minimap = screenToUndergroundMiniMap(runtime, clientX, clientY);
            if (minimap) {
                SCPGame.setUndergroundSlice(state, minimap.sectionY);
                const level = SCPGame.getUndergroundPlanLevel(state);
                const room = [...state.undergroundRooms].reverse().find((entry) => entry.level === level
                    && SCPGame.undergroundRoomSectionY(state, entry) === minimap.sectionY
                    && minimap.x >= entry.x && minimap.x < entry.x + entry.width);
                state.selectedId = room?.id;
                state.selectedType = room ? "underground-room" : undefined;
            }
            else {
                selectAtGridCell(runtime, screenToUndergroundCell(runtime, clientX, clientY));
            }
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
            const linked = SCPGame.getSurfaceRoomAtRegionPosition(state, { x: cell.x + 0.5, y: cell.y + 0.5 });
            const facility = !linked ? [...state.regionFacilities].reverse().find((entry) => SCPGame.pointInRect(cell, entry.x, entry.y, entry.width, entry.height)) : undefined;
            state.selectedId = linked?.id ?? facility?.id;
            state.selectedType = linked ? "surface-room" : facility ? "facility" : undefined;
        }
        else if (state.view === "surface") {
            const annex = SCPGame.getActiveInteriorFacility(state);
            if (annex) {
                const zone = SCPGame.getAnnexInteriorPlan(state, annex)?.rooms.find((entry) => SCPGame.pointInRect(cell, entry.x, entry.y, entry.width, entry.height));
                state.flags["annex-room-selected"] = zone?.id ?? "";
                state.selectedId = annex.id;
                state.selectedType = "facility";
                return;
            }
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
            const room = [...state.undergroundRooms].reverse().find((entry) => entry.level === cell.y && SCPGame.undergroundRoomSectionY(state, entry) === SCPGame.getSiteSectionSurfaceY(state)
                && cell.x >= entry.x && cell.x < entry.x + entry.width);
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
    let accessEditorRoomId = "";
    let accessEditorAccessId = "";
    let renderedModalKey = "";
    let modalReturnFocus;
    let modalReturnFocusSignature;
    let modalPausedGame = false;
    let renderedEndScreenKey = "";
    const ACCESS_UI_SIDES = { north: "Nord", east: "Est", south: "Sud", west: "Ouest" };
    const ACCESS_UI_TRAFFIC = {
        staff: "Personnel", security: "Sécurité / FTM", medical: "Équipes médicales",
        contaminated: "Personnel contaminé", freight: "Logistique (personnel)",
        public: "Public (réservé)", anomaly: "Anomalies (réservé)"
    };
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
        const attributes = ["data-action", "data-view", "data-speed", "data-tab", "data-type", "data-role", "data-staff", "data-node", "data-scp", "data-room", "data-access", "data-zone", "data-order", "data-setting"];
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
        const expandedDiagnostics = new Set(Array.from(container.querySelectorAll("details.scp-behavior-panel[open]"))
            .map((element) => element.dataset.scp));
        const nestedScroll = Array.from(container.querySelectorAll("[data-preserve-scroll]")).map((element) => ({
            key: String(element.dataset.preserveScroll),
            top: element.scrollTop,
            left: element.scrollLeft
        }));
        container.innerHTML = html;
        container.querySelectorAll("details.scp-behavior-panel").forEach((element) => {
            if (expandedDiagnostics.has(element.dataset.scp))
                element.open = true;
        });
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
        if (modalMode === "none") {
            modalReturnFocus = returnFocus;
            modalReturnFocusSignature = focusSignature(returnFocus);
        }
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
        document.addEventListener("submit", handleSurfaceAccessSubmit);
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
        const linkedRoom = state.selectedType === "surface-room"
            ? state.surfaceRooms.find((room) => room.id === state.selectedId) : undefined;
        if (linkedRoom) {
            const definition = SCPGame.getSurfaceDefinition(linkedRoom.type);
            const roof = SCPGame.getSurfaceRegionFootprint(state, linkedRoom);
            return `
        ${renderSelectionHeader(definition.icon, definition.name, "Toiture du bâtiment principal")}
        <p class="muted">C'est la même salle que dans le plan intérieur. Chaque modification de la Surface actualise ce volume extérieur.</p>
        ${renderMetricGrid([
                ["Repère extérieur X", roof.x.toFixed(2)],
                ["Repère extérieur Y", roof.y.toFixed(2)],
                ["Emprise", `${linkedRoom.width} × ${linkedRoom.height} cases`],
                ["État", percent(linkedRoom.condition)]
            ])}
        <button class="wide-button" data-view="surface">Entrer dans ce bâtiment</button>
        ${SCPGame.isSurfaceRoomOnUndergroundSection(state, linkedRoom) ? `<button class="wide-button" data-view="underground">Voir sa coupe souterraine</button>` : ""}
        <hr>${renderBuildCatalog(state, "region")}
      `;
        }
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
        ${SCPGame.isRegionFacilityEnterable(selected)
                ? `<button class="wide-button" data-action="enter-annex">Explorer l'intérieur de cette annexe</button>
             <p class="hint">Plan intérieur propre à ce bâtiment, lié à son état réel. Les zones sont consultatives et ne génèrent pas de personnel fictif.</p>`
                : `<p class="hint">Installation extérieure sans pièces closes : vue régionale uniquement.</p>`}
        ${renderSelectionActions()}
        <hr>
        ${renderBuildCatalog(state, "region")}
      `;
        }
        return `
      ${renderReputationOverview(state)}
      <section class="summary-card"><h3>Site principal — vue extérieure</h3>
        <p>Les toitures visibles au sud-est sont générées depuis les ${state.surfaceRooms.filter((room) => room.type !== "corridor").length} salles réellement construites dans le même complexe.</p>
        <button class="wide-button" data-view="surface">Entrer dans le bâtiment principal</button>
        <p class="hint">Les autres installations régionales sont des annexes extérieures. La zone du bâtiment principal est réservée.</p>
        ${SCPGame.getRegionCampusOverlap(state).length ? `<p class="staff-route-status">Ancienne sauvegarde : ${SCPGame.getRegionCampusOverlap(state).length} annexe(s) chevauchent l'emprise. Rien n'a été déplacé ni effacé.</p>` : ""}
      </section>
      <p class="hint">Sélectionnez une toiture du Site ou une annexe régionale sur la carte.</p>
      ${renderBuildCatalog(state, "region")}
    `;
    }
    function renderSurfacePanel(state) {
        const annex = SCPGame.getActiveInteriorFacility(state);
        if (annex) {
            const plan = SCPGame.getAnnexInteriorPlan(state, annex);
            const selectedZone = plan.rooms.find((zone) => zone.id === state.flags["annex-room-selected"]);
            const definition = SCPGame.getRegionDefinition(annex.type);
            return `
        ${renderSelectionHeader(definition.icon, plan.buildingName, `Annexe régionale · niveau ${annex.level}`)}
        <p class="muted">Plan intérieur de l'installation extérieure sélectionnée. Les quatre zones sont propres à ce bâtiment et reflètent sa fonction.</p>
        ${renderMetricGrid([
                ["État réel", percent(annex.condition)],
                ["Niveau", String(annex.level)],
                ["Emprise ville", `${annex.width} × ${annex.height}`],
                ["Statut", annex.enabled ? "En service" : "Arrêté"]
            ])}
        ${selectedZone ? `<section class="summary-card"><h3>${escapeHtml(selectedZone.name)}</h3>
          <p>${escapeHtml(selectedZone.function)}</p>
          <p class="hint">Zone d'inspection rattachée à ${escapeHtml(plan.buildingName)}. La production et la sécurité restent gouvernées par l'installation extérieure existante.</p>
        </section>` : ""}
        <section class="summary-card"><h3>Pièces de l'annexe</h3>
          <div class="surface-access-list">${plan.rooms.map((zone) => `<button class="wide-button" data-action="select-annex-zone" data-room="${escapeHtml(zone.id)}" aria-pressed="${selectedZone?.id === zone.id}">${escapeHtml(zone.name)}</button>`).join("")}</div>
        </section>
        <button class="wide-button" data-view="region">Revenir au bâtiment dans la ville</button>
        <button class="wide-button" data-action="open-main-interior">Revenir à l'intérieur du Site principal</button>
        <p class="hint">Les zones de l'annexe sont inspectables ; leur construction individualisée et le déplacement des agents entre bâtiments seront développés séparément. Aucun service fictif n'est ajouté.</p>
      `;
        }
        if (state.selectedType === "staff") {
            const member = state.staff.find((entry) => entry.id === state.selectedId);
            if (member)
                return `${renderStaffDetails(member)}<hr>${renderBuildCatalog(state, "surface")}`;
        }
        const selected = state.selectedType === "surface-room" ? state.surfaceRooms.find((entry) => entry.id === state.selectedId) : undefined;
        if (selected) {
            const definition = SCPGame.getSurfaceDefinition(selected.type);
            const present = state.staff.filter((member) => selected.staffAssigned.includes(member.id) && member.status === "working"
                && member.position.layer === "surface" && member.targetRoomId === selected.id
                && member.position.x === Math.floor(selected.x + selected.width / 2) && member.position.y === Math.floor(selected.y + selected.height / 2)).length;
            const efficiency = !selected.enabled ? "Fermée" : Object.keys(definition.requiredRoles).length > 0
                ? `${present} sur place / ${selected.staffAssigned.length} affectés` : "Libre-service";
            return `
        ${renderSelectionHeader(definition.icon, definition.name, efficiency)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
                ["État", percent(selected.condition)],
                ["Propreté", percent(selected.cleanliness)],
                ["File de service", String(selected.queue.length)],
                ["Personnel", String(selected.staffAssigned.length)]
            ])}
        ${renderAssignedStaff(state, selected.staffAssigned)}
        <p class="hint">Cette salle possède la même emprise dans la vue Région, à une autre échelle.</p>
        <button class="wide-button" data-view="region">Voir ce bâtiment dans la ville</button>
        <button class="wide-button" data-view="underground">Voir la coupe sous cette salle</button>
        <p class="hint">La coupe s'adaptera à l'axe de cette salle. Seuls les modules souterrains réellement construits y apparaîtront.</p>
        ${renderSelectionActions()}
        ${renderSurfaceAccessPanel(state, selected)}
        <hr>
        ${renderBuildCatalog(state, "surface")}
      `;
        }
        const queues = state.surfaceRooms.reduce((sum, room) => sum + room.queue.length
            + SCPGame.getSurfaceAccesses(state, room).reduce((waiting, access) => waiting + access.queue.length, 0), 0) + state.workItems.length;
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
      <section class="summary-card"><h3>Intérieur du bâtiment principal</h3>
        <p>Plan au sol des salles représentées en toiture dans la Région. La ligne jaune affiche la coupe souterraine Y=${SCPGame.getSiteSectionSurfaceY(state)}, sélectionnable parmi ${state.surfaceHeight} axes.</p>
        <button class="wide-button" data-view="region">Voir les toitures depuis la ville</button>
        <button class="wide-button" data-view="underground">Explorer les coupes souterraines</button>
      </section>
      <p class="hint">Les salles fonctionnent comme dans un jeu de gestion hospitalière : capacité, personnel, file, maintenance et trajets influencent directement le Site.</p>
      ${renderBuildCatalog(state, "surface")}
    `;
    }
    function renderSurfaceAccessPanel(state, room) {
        if (room.type === "corridor")
            return `<p class="hint">Les couloirs sont des espaces de circulation. Les portes et sas se placent sur les limites des autres salles.</p>`;
        const accesses = SCPGame.getSurfaceAccesses(state, room);
        return `<section class="surface-access-panel" aria-label="Accès de la salle">
      <div class="catalog-heading"><h3>Portes et sas</h3><button data-action="add-access" data-room="${escapeHtml(room.id)}">Ajouter un accès</button></div>
      <p class="hint">Les passages numérotés sur le plan sont les seules entrées et sorties de cette salle. Pour sécuriser toute la salle, configurez ou verrouillez chacun de ses accès.</p>
      ${accesses.length === 0 ? `<p class="staff-route-status">Salle sans accès : aucun agent ne peut franchir ses limites.</p>` : ""}
      <div class="surface-access-list">${accesses.map((access, index) => {
            const attrs = `data-room="${escapeHtml(room.id)}" data-access="${escapeHtml(access.id)}"`;
            const occupant = access.cycle ? state.staff.find((member) => member.id === access.cycle?.staffId) : undefined;
            const status = SCPGame.getSurfaceAccessStatus(state, room, access);
            const traffic = access.allowedTraffic.map((kind) => ACCESS_UI_TRAFFIC[kind]).join(", ") || "Aucun flux autorisé";
            const direction = access.direction === "in" ? "Entrée seule" : access.direction === "out" ? "Sortie seule" : "Dans les deux sens";
            const waiting = access.queue.map((request) => {
                const member = state.staff.find((entry) => entry.id === request.staffId);
                return `${member?.name ?? "Agent absent"} · ${Math.max(0, Math.ceil(request.expiresAt - state.elapsedMinutes))} min avant expiration`;
            });
            return `<article class="surface-access-card ${access.enabled ? "" : "access-locked"}" data-access-id="${escapeHtml(access.id)}">
          <header><strong><b class="access-number">${index + 1}</b>${access.kind === "airlock" ? "Sas interverrouillé" : "Porte"}</strong><span>${ACCESS_UI_SIDES[access.side]} · case ${access.offset + 1}</span></header>
          <p class="access-status">${escapeHtml(status)}</p>
          <p>Niveau ${access.minClearance} minimum · ${direction}</p>
          <p class="access-traffic-label">${escapeHtml(traffic)}</p>
          ${access.kind === "door" ? `<p>Passages réussis : ${access.passedCount}</p>` : ""}
          ${access.kind === "airlock" ? `<dl class="access-metrics"><div><dt>File</dt><dd>${access.queue.length} / ${access.queueCapacity}</dd></div><div><dt>Passages</dt><dd>${access.passedCount}</dd></div></dl>
            <p>${occupant ? `Dans le sas : ${escapeHtml(occupant.name)} · ${access.cycle?.remaining ?? 0} min dans cette phase` : "Sas libre"}</p>
            ${waiting.length ? `<ol class="access-waiting">${waiting.map((label) => `<li>${escapeHtml(label)}</li>`).join("")}</ol>` : ""}
            <p class="access-supplies">Électricité locale : ${access.powered ? "raccordée" : "coupée"} · Air : ${access.airSupply ? "disponible" : "coupé"}</p>` : ""}
          <div class="action-row"><button data-action="edit-access" ${attrs}>Configurer</button><button data-action="toggle-access" ${attrs}>${access.enabled ? "Verrouiller" : "Déverrouiller"}</button><button class="danger" data-action="remove-access" ${attrs} ${access.cycle ? "disabled" : ""}>Démonter</button></div>
          ${access.kind === "airlock" ? `<div class="action-row"><button data-action="toggle-access-power" ${attrs}>${access.powered ? "Couper l’électricité" : "Rétablir l’électricité"}</button><button data-action="toggle-access-air" ${attrs}>${access.airSupply ? "Couper l’air" : "Rétablir l’air"}</button></div>
            <button class="wide-button warning" data-action="evacuate-access" ${attrs} ${access.cycle || access.queue.length ? "" : "disabled"}>Évacuer côté d’origine et verrouiller</button>` : ""}
        </article>`;
        }).join("")}</div>
      <p class="hint">Démontage : récupération de 35 % des crédits et 40 % des pièces payés. Les accès inclus dans la salle n’offrent aucun remboursement.</p>
    </section>`;
    }
    function accessDefaultConfig(state, room) {
        const config = {
            side: "south", offset: 0, kind: "door", enabled: true, minClearance: 0,
            allowedTraffic: Object.keys(ACCESS_UI_TRAFFIC), direction: "both",
            queueCapacity: 4, powered: true, airSupply: true
        };
        const accesses = SCPGame.getSurfaceAccesses(state, room);
        for (const side of ["south", "north", "east", "west"]) {
            const length = side === "north" || side === "south" ? room.width : room.height;
            for (let offset = 0; offset < length; offset += 1) {
                if (accesses.some((access) => access.side === side && access.offset === offset))
                    continue;
                const { outside } = SCPGame.getSurfaceAccessCells(room, { side, offset });
                if (outside.x < 0 || outside.y < 0 || outside.x >= state.surfaceWidth || outside.y >= state.surfaceHeight)
                    continue;
                if (state.surfaceRooms.some((other) => other.id !== room.id && other.type !== "corridor"
                    && SCPGame.pointInRect(outside, other.x, other.y, other.width, other.height)))
                    continue;
                return { ...config, side, offset };
            }
        }
        return config;
    }
    function renderSurfaceAccessModal(state) {
        const room = state.surfaceRooms.find((candidate) => candidate.id === accessEditorRoomId);
        const access = room && accessEditorAccessId ? SCPGame.getSurfaceAccesses(state, room).find((candidate) => candidate.id === accessEditorAccessId) : undefined;
        if (!room || accessEditorAccessId && !access)
            return `<div class="modal-card"><header><h2 id="modal-title">Accès introuvable</h2><button data-action="close-modal" aria-label="Fermer">×</button></header><p>La salle ou le passage sélectionné n’existe plus.</p></div>`;
        const config = access ?? accessDefaultConfig(state, room);
        return `<form id="surface-access-form" class="modal-card access-modal" aria-describedby="access-editor-description">
      <header><div><span>CONTRÔLE DES ACCÈS</span><h2 id="modal-title">${access ? "Configurer le passage" : "Ajouter une porte ou un sas"}</h2></div><button type="button" data-action="close-modal" aria-label="Fermer">×</button></header>
      <p id="access-editor-description">${escapeHtml(SCPGame.getSurfaceDefinition(room.type).name)}. Choisissez une case sur un mur de la salle. L’emplacement est compté de gauche à droite au nord et au sud, et de haut en bas à l’est et à l’ouest.</p>
      <div class="access-editor-layout">
        <div class="access-field-grid">
          <label for="access-kind">Type<select id="access-kind" ${access ? "disabled" : ""}><option value="door" ${config.kind === "door" ? "selected" : ""}>Porte</option><option value="airlock" ${config.kind === "airlock" ? "selected" : ""}>Sas interverrouillé</option></select></label>
          <label for="access-side">Mur<select id="access-side">${Object.keys(ACCESS_UI_SIDES).map((side) => `<option value="${side}" ${config.side === side ? "selected" : ""}>${ACCESS_UI_SIDES[side]}</option>`).join("")}</select></label>
          <label for="access-offset">Emplacement sur le mur<input id="access-offset" type="number" inputmode="numeric" min="1" max="${config.side === "north" || config.side === "south" ? room.width : room.height}" step="1" value="${config.offset + 1}" required></label>
          <label for="access-clearance">Habilitation minimale<select id="access-clearance">${[0, 1, 2, 3, 4, 5].map((level) => `<option value="${level}" ${config.minClearance === level ? "selected" : ""}>Niveau ${level}</option>`).join("")}</select></label>
          <label for="access-direction">Sens de circulation<select id="access-direction"><option value="both" ${config.direction === "both" ? "selected" : ""}>Entrée et sortie</option><option value="in" ${config.direction === "in" ? "selected" : ""}>Entrée seule</option><option value="out" ${config.direction === "out" ? "selected" : ""}>Sortie seule</option></select></label>
          <label for="access-capacity" data-airlock-field>Places en attente<input id="access-capacity" type="number" inputmode="numeric" min="1" max="16" step="1" value="${config.queueCapacity}" required></label>
        </div>
        <div class="access-preview-block"><div class="access-plan" id="access-preview" role="img"><span>${escapeHtml(SCPGame.getSurfaceDefinition(room.type).name)}<small>${room.width} × ${room.height} cases</small></span><i id="access-preview-marker" aria-hidden="true"></i></div><p id="access-placement-hint" class="hint" aria-live="polite"></p></div>
      </div>
      <fieldset class="access-traffic-options"><legend>Flux autorisés</legend><div>${Object.keys(ACCESS_UI_TRAFFIC).map((traffic) => `<label><input type="checkbox" data-access-traffic="${traffic}" ${config.allowedTraffic.includes(traffic) ? "checked" : ""}>${ACCESS_UI_TRAFFIC[traffic]}</label>`).join("")}</div><p class="hint">Au-delà de 65 % de contamination, le filtre « Personnel contaminé » remplace celui du métier. Public et anomalies sont réservés aux futures circulations dédiées.</p></fieldset>
      <div class="access-switches"><label><input id="access-enabled" type="checkbox" ${config.enabled ? "checked" : ""}> Passage déverrouillé</label><label data-airlock-field><input id="access-powered" type="checkbox" ${config.powered ? "checked" : ""}> Électricité locale raccordée</label><label data-airlock-field><input id="access-air-supply" type="checkbox" ${config.airSupply ? "checked" : ""}> Air disponible</label></div>
      <p class="hint" data-airlock-field>Une personne à la fois, dans l’ordre d’arrivée. Les deux portes ne s’ouvrent jamais ensemble. Une coupure d’électricité ou d’air suspend le cycle, portes fermées. L’évacuation ramène l’occupant du côté d’origine et verrouille le passage.</p>
      ${access?.cycle || access?.queue.length ? `<p class="staff-route-status">Passage occupé : évacuez-le avant de modifier son emplacement, ses habilitations ou son sens. Sa capacité ne peut pas être réduite sous la file actuelle. Vous pouvez encore agir sur son verrouillage et ses alimentations.</p>` : ""}
      <p id="access-form-error" class="status-danger" role="alert"></p>
      <footer><span id="access-cost">${access ? "Configuration sans frais" : "250 crédits · 2 pièces"}</span><button type="submit" data-action="save-access">${access ? "Enregistrer" : "Installer le passage"}</button></footer>
    </form>`;
    }
    function updateSurfaceAccessForm(state) {
        if (modalMode !== "surface-access")
            return;
        const room = state.surfaceRooms.find((candidate) => candidate.id === accessEditorRoomId);
        if (!room)
            return;
        const side = document.getElementById("access-side")?.value;
        const offsetInput = document.getElementById("access-offset");
        if (!offsetInput || !(side in ACCESS_UI_SIDES))
            return;
        const length = side === "north" || side === "south" ? room.width : room.height;
        offsetInput.max = String(length);
        const offset = Number(offsetInput.value) - 1;
        const marker = document.getElementById("access-preview-marker");
        const preview = document.getElementById("access-preview");
        const normalized = SCPGame.clamp((offset + 0.5) / length, 0, 1);
        if (marker) {
            marker.style.left = `${side === "west" ? 0 : side === "east" ? 100 : normalized * 100}%`;
            marker.style.top = `${side === "north" ? 0 : side === "south" ? 100 : normalized * 100}%`;
            marker.classList.toggle("vertical", side === "east" || side === "west");
        }
        preview?.setAttribute("aria-label", `Plan de la salle : accès sur le mur ${ACCESS_UI_SIDES[side]}, emplacement ${offset + 1} sur ${length}.`);
        let message = `${ACCESS_UI_SIDES[side]} · emplacement ${offset + 1} sur ${length}.`;
        let invalid = !Number.isInteger(offset) || offset < 0 || offset >= length;
        if (invalid)
            message = `Choisissez un emplacement entier entre 1 et ${length}.`;
        else {
            const { outside } = SCPGame.getSurfaceAccessCells(room, { side, offset });
            if (outside.x < 0 || outside.y < 0 || outside.x >= state.surfaceWidth || outside.y >= state.surfaceHeight) {
                message += " Ce mur donne hors du complexe.";
                invalid = true;
            }
            else if (SCPGame.getSurfaceAccesses(state, room).some((access) => access.id !== accessEditorAccessId && access.side === side && access.offset === offset)) {
                message += " Un autre accès occupe déjà cette case.";
                invalid = true;
            }
            else if (state.surfaceRooms.some((other) => other.id !== room.id && other.type !== "corridor" && SCPGame.pointInRect(outside, other.x, other.y, other.width, other.height))) {
                message += " Une salle voisine bloque l’autre côté.";
                invalid = true;
            }
            else
                message += " L’autre côté est dégagé.";
        }
        const hint = document.getElementById("access-placement-hint");
        if (hint) {
            hint.textContent = message;
            hint.classList.toggle("status-danger", invalid);
        }
        preview?.classList.toggle("invalid", invalid);
        const airlock = document.getElementById("access-kind")?.value === "airlock";
        document.querySelectorAll("[data-airlock-field]").forEach((element) => { element.hidden = !airlock; });
        const capacity = document.getElementById("access-capacity");
        if (capacity)
            capacity.disabled = !airlock;
        const price = document.getElementById("access-cost");
        if (price)
            price.textContent = accessEditorAccessId ? "Configuration sans frais" : airlock ? "1 000 crédits · 6 pièces" : "250 crédits · 2 pièces";
    }
    function saveSurfaceAccessFromModal(state) {
        const form = document.getElementById("surface-access-form");
        if (!form || !form.reportValidity())
            return { ok: false, message: "Vérifiez les champs du passage." };
        const value = (id) => document.getElementById(id).value;
        const checked = (id) => document.getElementById(id).checked;
        const config = {
            side: value("access-side"), offset: Number(value("access-offset")) - 1,
            kind: value("access-kind"), enabled: checked("access-enabled"),
            minClearance: Number(value("access-clearance")),
            direction: value("access-direction"), queueCapacity: Number(value("access-capacity")),
            powered: checked("access-powered"), airSupply: checked("access-air-supply"),
            allowedTraffic: Array.from(form.querySelectorAll("[data-access-traffic]:checked")).map((input) => input.dataset.accessTraffic)
        };
        const result = accessEditorAccessId ? SCPGame.updateSurfaceAccess(state, accessEditorRoomId, accessEditorAccessId, config) : SCPGame.addSurfaceAccess(state, accessEditorRoomId, config);
        if (result.ok)
            closeModal(state);
        else {
            const error = document.getElementById("access-form-error");
            if (error)
                error.textContent = result.message;
        }
        return result;
    }
    function handleSurfaceAccessSubmit(event) {
        if (!(event.target instanceof HTMLFormElement) || event.target.id !== "surface-access-form" || !activeRuntime)
            return;
        event.preventDefault();
        const result = saveSurfaceAccessFromModal(activeRuntime.state);
        showToast(result.message, result.ok ? "success" : "error");
        activeRuntime.uiDirty = true;
        refreshUI(activeRuntime, true);
    }
    function renderUndergroundSliceControls(state) {
        const y = SCPGame.getSiteSectionSurfaceY(state);
        const visible = state.undergroundRooms.filter((room) => SCPGame.undergroundRoomSectionY(state, room) === y).length;
        const other = state.undergroundRooms.length - visible;
        return `<section class="summary-card" aria-label="Navigation des coupes souterraines">
      <div class="catalog-heading"><h3>Coupe souterraine Y=${y}</h3><span>${y + 1} / ${state.surfaceHeight}</span></div>
      <div class="action-row"><button data-action="underground-slice-prev" ${y <= 0 ? "disabled" : ""}>Coupe précédente</button>
      <button data-action="underground-slice-next" ${y >= state.surfaceHeight - 1 ? "disabled" : ""}>Coupe suivante</button></div>
      <label class="hint" for="underground-slice-jump">Accès direct à une coupe</label>
      <select id="underground-slice-jump" class="underground-slice-jump" data-slice-select aria-label="Choisir la coupe souterraine">
        ${Array.from({ length: state.surfaceHeight }, (_, row) => `<option value="${row}" ${row === y ? "selected" : ""}>Y=${row} · ${state.undergroundRooms.filter((room) => SCPGame.undergroundRoomSectionY(state, room) === row).length} module(s)</option>`).join("")}
      </select>
      <div class="catalog-heading"><h3>Plan horizontal</h3><span>Niveau -${SCPGame.getUndergroundPlanLevel(state) + 1}</span></div>
      <div class="action-row"><button data-action="underground-level-prev" ${SCPGame.getUndergroundPlanLevel(state) <= 0 ? "disabled" : ""}>Niveau au-dessus</button>
      <button data-action="underground-level-next" ${SCPGame.getUndergroundPlanLevel(state) >= state.undergroundLevels - 1 ? "disabled" : ""}>Niveau inférieur</button></div>
      <p class="hint">${visible} module(s) ici · ${other} sur d'autres coupes. Les flèches indiquent les traverses physiques entre coupes voisines. Cliquez sur la mini-carte (ordinateur) pour choisir directement une coupe et un module du niveau affiché.</p>
    </section>`;
    }
    function renderUndergroundGatePanel(state, selected) {
        const neighbours = state.undergroundRooms.filter((room) => room.id !== selected.id
            && room.level === selected.level && SCPGame.undergroundRoomsTouch(state, selected, room))
            .sort((a, b) => SCPGame.undergroundRoomSectionY(state, a) - SCPGame.undergroundRoomSectionY(state, b) || a.x - b.x);
        const existing = (state.undergroundGates ?? []).filter((gate) => gate.roomAId === selected.id || gate.roomBId === selected.id);
        if (!neighbours.length && !existing.length)
            return `<section class="summary-card"><h3>Portes et sas souterrains</h3><p class="hint">Aucune cloison voisine : construisez une galerie contiguë sur l'axe X ou Y.</p></section>`;
        const entries = neighbours.map((room) => {
            const gate = SCPGame.getUndergroundGateBetween(state, selected, room);
            const label = escapeHtml(SCPGame.getUndergroundDefinition(room.type).name);
            const position = `X=${room.x}, Y=${SCPGame.undergroundRoomSectionY(state, room)}, -${room.level + 1}`;
            const direction = gate ? gate.direction === 'both' ? 'Double sens'
                : gate.direction === 'a-to-b' ? `Sens : ${escapeHtml(SCPGame.getUndergroundDefinition(state.undergroundRooms.find((r) => r.id === gate.roomAId).type).name)} → B`
                    : `Sens : B → A` : '';
            if (!gate)
                return `<div class="underground-gate-row"><strong>${label}</strong><small>${position} · passage ouvert (ancien réseau)</small>
        <div class="action-row"><button data-action="add-underground-door" data-room="${escapeHtml(selected.id)}" data-other="${escapeHtml(room.id)}">Installer porte (650)</button>
        <button data-action="add-underground-airlock" data-room="${escapeHtml(selected.id)}" data-other="${escapeHtml(room.id)}">Installer sas (2 600)</button></div></div>`;
            const locked = !gate.enabled || !SCPGame.canTraverseUndergroundGate(state, selected, room);
            const passengers = gate.queue.map((id) => state.staff.find((m) => m.id === id)?.name || id).join(', ');
            const occupant = gate.cycle ? state.staff.find((m) => m.id === gate.cycle?.staffId)?.name || gate.cycle.staffId : '';
            return `<div class="underground-gate-row"><strong>${gate.kind === 'airlock' ? 'Sas' : 'Porte'} — ${label}</strong>
        <small>${position} · ${direction} · habilitation ${gate.minClearance} · franchissements ${gate.passedCount}</small>
        <p class="hint" role="status">${locked ? 'Accès restreint · ' : ''}${escapeHtml(SCPGame.getUndergroundGateStatus(state, gate))}${occupant ? ` · occupant : ${escapeHtml(occupant)}` : ''}${passengers ? ` · file : ${escapeHtml(passengers)}` : ''}</p>
        <div class="action-row"><button data-action="underground-gate-lock" data-gate="${escapeHtml(gate.id)}">${gate.enabled ? 'Verrouiller' : 'Déverrouiller'}</button>
        <button data-action="underground-gate-clearance" data-gate="${escapeHtml(gate.id)}" data-delta="-1" ${gate.minClearance <= 0 ? 'disabled' : ''}>Habilitation −</button>
        <button data-action="underground-gate-clearance" data-gate="${escapeHtml(gate.id)}" data-delta="1" ${gate.minClearance >= 5 ? 'disabled' : ''}>Habilitation +</button></div>
        <div class="action-row"><button data-action="underground-gate-direction" data-gate="${escapeHtml(gate.id)}">Sens : ${gate.direction === 'both' ? '↔' : gate.direction === 'a-to-b' ? 'A → B' : 'B → A'}</button>
        ${gate.kind === 'airlock' ? `<button data-action="underground-gate-power" data-gate="${escapeHtml(gate.id)}">Énergie ${gate.powered ? 'ON' : 'OFF'}</button>
        <button data-action="underground-gate-air" data-gate="${escapeHtml(gate.id)}">Air ${gate.airSupply ? 'OK' : 'NOK'}</button>
        <button data-action="underground-gate-evacuate" data-gate="${escapeHtml(gate.id)}">Évacuer</button>` : ''}
        <button data-action="underground-gate-remove" data-gate="${escapeHtml(gate.id)}">Démonter</button></div>
      </div>`;
        }).join('');
        return `<section class="summary-card underground-gates"><h3>Portes et sas souterrains</h3>
      <p class="hint">Accès installés sur les vraies liaisons X/Y. Sens A↔B selon le côté où le sas a été posé. Un sas ne laisse passer qu'un agent à la fois (file FIFO, égalisation et pannes).</p>${entries}</section>`;
    }
    function renderUndergroundUtilityPanel(state, selected) {
        const connected = state.undergroundRooms.filter((room) => room.id !== selected.id
            && SCPGame.undergroundRoomsTouch(state, selected, room));
        const status = SCPGame.getUndergroundUtilityStatus(state, selected);
        const tags = (name, ok) => `<span class="utility-indicator ${ok ? "utility-online" : "utility-offline"}">${name} : ${ok ? "Raccordé" : "Hors service"}</span>`;
        const entries = connected.map((other) => {
            const line = SCPGame.getUndergroundConduitBetween(state, selected, other);
            const name = escapeHtml(SCPGame.getUndergroundDefinition(other.type).name);
            const attrs = `data-room="${escapeHtml(selected.id)}" data-other="${escapeHtml(other.id)}"`;
            if (!line)
                return `<div class="utility-circuit-row"><strong>${name}</strong>
        <p class="hint">Réseau absent · X=${other.x}, Y=${SCPGame.undergroundRoomSectionY(state, other)}, profondeur ${other.level + 1}</p>
        <button data-action="underground-conduit-install" ${attrs}>Poser une gaine (850 crédits · 4 pièces)</button></div>`;
            const indicators = ["power", "water", "air"]
                .map((kind) => `<button data-action="underground-conduit-toggle" ${attrs} data-kind="${kind}" aria-pressed="${line[kind]}">${kind === "power" ? "Électricité" : kind === "water" ? "Eau" : "Air"} : ${line[kind] ? "Ouvert" : "Isolé"}</button>`).join("");
            return `<div class="utility-circuit-row"><strong>${name}</strong><div class="action-row">${indicators}</div>
        <button data-action="underground-conduit-remove" ${attrs}>Démonter la gaine</button></div>`;
        }).join("");
        return `<section class="summary-card underground-utilities" aria-label="Réseaux techniques du sous-sol">
      <h3>Réseaux techniques physiques</h3>
      <div class="utility-status">${tags("Électricité", status.power)}${tags("Eau", status.water)}${tags("Ventilation", status.air)}</div>
      <p class="hint">Câbles, conduites et gaines entre modules adjacents. Les nouveaux modules exigent un raccordement. Les anciennes galeries conservent leurs liaisons historiques. Les vannes sont indépendantes des portes de personnel.</p>
      ${entries || '<p class="hint">Aucune paroi technique voisine.</p>'}
    </section>`;
    }
    function renderUndergroundPanel(state) {
        const selected = state.selectedType === "underground-room" ? state.undergroundRooms.find((entry) => entry.id === state.selectedId) : undefined;
        if (selected) {
            const definition = SCPGame.getUndergroundDefinition(selected.type);
            const scp = selected.scpId ? state.scps.find((entry) => entry.id === selected.scpId) : undefined;
            const supplies = SCPGame.getUndergroundUtilityStatus(state, selected);
            return `
        ${renderUndergroundSliceControls(state)}
        ${renderSelectionHeader(definition.icon, definition.name, `Niveau -${selected.level + 1} · coupe ${SCPGame.undergroundRoomSectionY(state, selected)}`)}
        <p class="muted">${escapeHtml(definition.description)}</p>
        ${renderMetricGrid([
                ["État", percent(selected.condition)],
                ["Confinement", String(SCPGame.getEffectiveRoomContainment(selected))],
                ["Sécurité", String(SCPGame.getEffectiveRoomSecurity(selected))],
                ["Équipe", String(selected.staffAssigned.length)],
                ["Habilitation", `Niveau ${SCPGame.getUndergroundClearanceRequirement(selected)}`],
                ["Ascenseur", SCPGame.hasUndergroundElevatorConnection(state, selected) ? "Relié" : "Non relié"],
                ["Galerie", selected.sealed ? "Scellée" : "Ouverte"],
                ["Électricité", supplies.power ? "Alimentée" : "Non raccordée"],
                ["Eau", supplies.water ? "Distribuée" : "Coupée"],
                ["Air", supplies.air ? "Ventilé" : "Isolé"],
                ["À l'aplomb", SCPGame.getSurfaceRoomAboveUnderground(state, selected)
                        ? SCPGame.getSurfaceDefinition(SCPGame.getSurfaceRoomAboveUnderground(state, selected).type).name : "Terrain sans pièce"],
                ["Coupe", `Y=${SCPGame.undergroundRoomSectionY(state, selected)} / ${state.surfaceHeight - 1}`]
            ])}
        ${scp ? renderContainedScpCard(state, scp) : renderCompatibleTransfers(state, selected)}
        ${renderSelectionActions()}
        <button class="wide-button" data-view="surface">Voir la salle ou le terrain au-dessus</button>
        <button class="wide-button" data-view="region">Voir la position dans la ville</button>
        <button class="wide-button" data-action="toggle-underground-seal" data-room="${escapeHtml(selected.id)}">${selected.sealed ? "Rouvrir le secteur" : "Sceller le secteur"}</button>
        ${renderUndergroundGatePanel(state, selected)}
        ${renderUndergroundUtilityPanel(state, selected)}
        <hr>
        ${renderBuildCatalog(state, "underground")}
      `;
        }
        return `
      ${renderUndergroundSliceControls(state)}
      <section class="summary-card">
        <h3>Réseau souterrain à trois coordonnées</h3>
        ${renderMetricGrid([
            ["SCP confinés", String(state.scps.filter((scp) => scp.contained).length)],
            ["Cellules libres", String(state.undergroundRooms.filter((room) => !room.scpId && SCPGame.getUndergroundDefinition(room.type).containment >= 4).length)],
            ["Niveaux", String(new Set(state.undergroundRooms.map((room) => room.level)).size)],
            ["Risque max", percent(Math.max(0, ...state.scps.filter((scp) => scp.contained).map((scp) => scp.breachRisk)))]
        ])}
      </section>
      <p class="hint">Les modules sont placés sur l'axe (X, Y, profondeur). La bande supérieure reflète les vrais locaux au-dessus de la coupe Y sélectionnée. Les nouvelles galeries peuvent joindre d'autres coupes avec des traverses visibles ; seules les cages alignées avec les ascenseurs permettent la remontée.</p>
      <button class="wide-button" data-view="surface">Voir le plan intérieur au-dessus</button>
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
      <p class="access-traffic-label">Circulation : ${escapeHtml(ACCESS_UI_TRAFFIC[SCPGame.getStaffSurfaceTraffic(member)])}</p>
      ${member.routeBlockedReason ? `<p class="staff-route-status" role="status">${escapeHtml(member.routeBlockedReason)}</p>` : ""}
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
    function renderSCPBehaviorPanel(state, scp, collapsed = false) {
        const report = SCPGame.inspectSCPBehavior(state, scp);
        if (!report)
            return "";
        const available = SCPGame.getSCPResponseAvailability(state, scp);
        const status = (key) => report.utilities[key] ? "Raccordé" : "Indisponible";
        return `<details class="scp-behavior-panel" data-scp="${escapeHtml(scp.id)}" aria-label="Diagnostic individuel du SCP" ${collapsed ? "" : "open"}>
      <summary>Comportement et réponse spécifique</summary>
      <p class="hint">${escapeHtml(report.profile.domain)}</p>
      ${renderMetricGrid([["Électricité", status("power")], ["Eau", status("water")], ["Ventilation", status("air")],
            ["Étude", `${Math.round(report.studyMultiplier * 100)} %`]])}
      ${report.faults.length ? `<ul class="scp-faults">${report.faults.map((fault) => `<li class="${fault.priority === "critical" ? "status-danger" : "status-warning"}">${escapeHtml(fault.effect)}</li>`).join("")}</ul>`
            : '<p class="hint">Contrôles particuliers nominaux.</p>'}
      <p class="hint">${escapeHtml(report.profile.protocol)}</p>
      <button class="wide-button" data-action="scp-response" data-scp="${escapeHtml(scp.id)}" ${available.ok ? "" : "disabled"}>
        ${escapeHtml(report.profile.response)} · ${escapeHtml(SCPGame.costToString(report.profile.responseCost))}
      </button>
      ${available.ok ? "" : `<p class="hint" role="status">${escapeHtml(available.message)}</p>`}
    </details>`;
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
        ${renderSCPBehaviorPanel(state, scp)}
        <button class="wide-button" data-action="open-procedure" data-scp="${escapeHtml(scp.id)}">Modifier la procédure</button>
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
              ${scp.contained ? renderSCPBehaviorPanel(state, scp, true)
                : `<p class="hint">${escapeHtml(SCPGame.SCP_BEHAVIOR_PROFILES[scp.definitionId]?.protocol ?? "")} — dossier non confiné.</p>`}
              <div class="action-row"><button data-action="open-procedure" data-scp="${escapeHtml(scp.id)}">Procédure v${procedure?.version ?? 1}</button>${!scp.contained ? `<button data-action="focus-scp" data-scp="${escapeHtml(scp.id)}">Transférer</button>` : ""}</div>
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
            if (renderedModalKey) {
                const target = modalReturnFocus?.isConnected ? modalReturnFocus
                    : modalReturnFocusSignature ? findFocusTarget(document.body, modalReturnFocusSignature) : undefined;
                target?.focus({ preventScroll: true });
            }
            modalReturnFocus = undefined;
            modalReturnFocusSignature = undefined;
            renderedModalKey = "";
            return;
        }
        setPageInert(true);
        root.classList.remove("hidden");
        root.tabIndex = -1;
        const modalKey = modalMode === "surface-access" ? `surface-access:${accessEditorRoomId}:${accessEditorAccessId}` : modalMode === "event" && currentEvent ? `event:${currentEvent.id}` : modalMode === "procedure" ? `procedure:${procedureScpId}:${state.procedures.find((procedure) => procedure.scpId === procedureScpId || state.scps.find((scp) => scp.id === procedureScpId)?.procedureId === procedure.id)?.version ?? 0}` : modalMode;
        if (modalKey === renderedModalKey)
            return;
        if (modalMode === "event" && currentEvent)
            root.innerHTML = renderEventModal(state, currentEvent);
        else if (modalMode === "surface-access") {
            root.innerHTML = renderSurfaceAccessModal(state);
            updateSurfaceAccessForm(state);
        }
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
        ${renderSCPBehaviorPanel(state, scp)}
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
        if (["help", "open-procedure", "import", "new-game", "credits", "add-access", "edit-access"].includes(action))
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
            case "add-access":
            case "edit-access":
                accessEditorRoomId = String(target.dataset.room);
                accessEditorAccessId = action === "edit-access" ? String(target.dataset.access) : "";
                modalMode = "surface-access";
                break;
            case "save-access":
                event.preventDefault();
                result = saveSurfaceAccessFromModal(state);
                break;
            case "toggle-access":
            case "toggle-access-power":
            case "toggle-access-air": {
                const room = state.surfaceRooms.find((entry) => entry.id === target.dataset.room);
                const access = room ? SCPGame.getSurfaceAccesses(state, room).find((entry) => entry.id === target.dataset.access) : undefined;
                if (!room || !access)
                    result = { ok: false, message: "Passage introuvable." };
                else {
                    const key = action === "toggle-access" ? "enabled" : action === "toggle-access-power" ? "powered" : "airSupply";
                    result = SCPGame.updateSurfaceAccess(state, room.id, access.id, { ...access, [key]: !access[key] });
                }
                break;
            }
            case "remove-access":
                result = SCPGame.removeSurfaceAccess(state, String(target.dataset.room), String(target.dataset.access));
                break;
            case "underground-level-prev":
                result = SCPGame.setUndergroundPlanLevel(state, SCPGame.getUndergroundPlanLevel(state) - 1);
                break;
            case "underground-level-next":
                result = SCPGame.setUndergroundPlanLevel(state, SCPGame.getUndergroundPlanLevel(state) + 1);
                break;
            case "underground-slice-prev":
                result = SCPGame.setUndergroundSlice(state, SCPGame.getSiteSectionSurfaceY(state) - 1);
                break;
            case "underground-slice-next":
                result = SCPGame.setUndergroundSlice(state, SCPGame.getSiteSectionSurfaceY(state) + 1);
                break;
            case "enter-annex":
                result = SCPGame.openAnnexInterior(state, String(state.selectedId));
                break;
            case "open-main-interior": {
                state.activeInteriorFacilityId = undefined;
                state.flags["annex-room-selected"] = "";
                state.selectedId = undefined;
                state.selectedType = undefined;
                state.buildSelection = undefined;
                state.view = "surface";
                break;
            }
            case "select-annex-zone": {
                const annex = SCPGame.getActiveInteriorFacility(state);
                const zone = annex && SCPGame.getAnnexInteriorPlan(state, annex)?.rooms.find((entry) => entry.id === target.dataset.room);
                if (zone)
                    state.flags["annex-room-selected"] = zone.id;
                else
                    result = { ok: false, message: "Zone de l'annexe introuvable." };
                break;
            }
            case "add-underground-door":
                result = SCPGame.installUndergroundGate(state, String(target.dataset.room), String(target.dataset.other), 'door');
                break;
            case "add-underground-airlock":
                result = SCPGame.installUndergroundGate(state, String(target.dataset.room), String(target.dataset.other), 'airlock');
                break;
            case "underground-conduit-install":
                result = SCPGame.installUndergroundConduit(state, String(target.dataset.room), String(target.dataset.other));
                break;
            case "underground-conduit-toggle":
                result = SCPGame.toggleUndergroundConduit(state, String(target.dataset.room), String(target.dataset.other), target.dataset.kind);
                break;
            case "underground-conduit-remove":
                result = SCPGame.removeUndergroundConduit(state, String(target.dataset.room), String(target.dataset.other));
                break;
            case "underground-gate-lock": {
                const gate = (state.undergroundGates ?? []).find((item) => item.id === target.dataset.gate);
                result = gate ? SCPGame.configureUndergroundGate(state, gate.id, { enabled: !gate.enabled })
                    : { ok: false, message: 'Accès introuvable.' };
                break;
            }
            case "underground-gate-clearance": {
                const gate = (state.undergroundGates ?? []).find((item) => item.id === target.dataset.gate);
                const value = gate ? gate.minClearance + Number(target.dataset.delta) : -1;
                result = gate ? SCPGame.configureUndergroundGate(state, gate.id, { minClearance: value })
                    : { ok: false, message: 'Accès introuvable.' };
                break;
            }
            case "underground-gate-direction": {
                const gate = (state.undergroundGates ?? []).find((item) => item.id === target.dataset.gate);
                const direction = gate?.direction === 'both' ? 'a-to-b' : gate?.direction === 'a-to-b' ? 'b-to-a' : 'both';
                result = gate ? SCPGame.configureUndergroundGate(state, gate.id, { direction })
                    : { ok: false, message: 'Accès introuvable.' };
                break;
            }
            case "underground-gate-power": {
                const gate = (state.undergroundGates ?? []).find((item) => item.id === target.dataset.gate);
                result = gate ? SCPGame.configureUndergroundGate(state, gate.id, { powered: !gate.powered })
                    : { ok: false, message: 'Accès introuvable.' };
                break;
            }
            case "underground-gate-air": {
                const gate = (state.undergroundGates ?? []).find((item) => item.id === target.dataset.gate);
                result = gate ? SCPGame.configureUndergroundGate(state, gate.id, { airSupply: !gate.airSupply })
                    : { ok: false, message: 'Accès introuvable.' };
                break;
            }
            case "underground-gate-remove":
                result = SCPGame.removeUndergroundGate(state, String(target.dataset.gate));
                break;
            case "underground-gate-evacuate":
                result = SCPGame.evacuateUndergroundGate(state, String(target.dataset.gate));
                break;
            case "toggle-underground-seal": {
                const room = state.undergroundRooms.find((entry) => entry.id === target.dataset.room);
                result = room ? SCPGame.setUndergroundSeal(state, room.id, !room.sealed)
                    : { ok: false, message: "Module souterrain introuvable." };
                break;
            }
            case "evacuate-access":
                result = SCPGame.evacuateSurfaceAccessAction(state, String(target.dataset.room), String(target.dataset.access));
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
            case "scp-response":
                result = SCPGame.performSCPResponse(state, String(target.dataset.scp));
                renderedModalKey = "";
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
        if (input.closest("#surface-access-form")) {
            if (input.id === "access-side") {
                const room = activeRuntime.state.surfaceRooms.find((entry) => entry.id === accessEditorRoomId);
                const offset = document.getElementById("access-offset");
                if (room && offset)
                    offset.value = String(SCPGame.clamp(Number(offset.value) || 1, 1, input.value === "north" || input.value === "south" ? room.width : room.height));
            }
            updateSurfaceAccessForm(activeRuntime.state);
            return;
        }
        if (input.dataset.sliceSelect !== undefined) {
            const result = SCPGame.setUndergroundSlice(activeRuntime.state, Number(input.value));
            if (!result.ok)
                showToast(result.message, "error");
            activeRuntime.uiDirty = true;
            refreshUI(activeRuntime, true);
            return;
        }
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
        if (input.closest("#surface-access-form") && activeRuntime) {
            updateSurfaceAccessForm(activeRuntime.state);
            return;
        }
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
        if (cell && runtime.state.buildSelection) {
            handleGridCellActivation(runtime, cell);
            return;
        }
        // A roof occupies a fractional isometric region tile. Using only the
        // floored grid coordinate selects the wrong interior room.
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
            result = SCPGame.getActiveInteriorFacility(state)
                ? { ok: false, message: "Cette annexe dispose d'un plan d'inspection. Retournez au Site principal pour construire." }
                : SCPGame.buildSurfaceRoom(state, build.type, cell.x, cell.y);
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
