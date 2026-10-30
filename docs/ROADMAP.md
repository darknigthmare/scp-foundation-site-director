# Feuille de route cumulative

La règle de développement est de ne jamais remplacer une couche par une autre : chaque version conserve Région, Surface, Sous-sol, Commandement, Gestion, sauvegardes et campagne.

## 1.0 — Deep Protocol

Livré : simulation complète 2.5D, 12 SCP, campagne, bac à sable, personnel, recherche, procédures, événements, crises, PWA et outils de sauvegarde.

## 1.1 — Operations

Tranche appliquée le 29 octobre 2026 sur la base 1.0.0 : éditeur des portes/sas de surface, habilitations et sens de passage, file FIFO et cycle interverrouillé, gestion des pannes et migration des sauvegardes. Tranche du 30 octobre 2026 : déplacements physiques du personnel souterrain, galeries adjacentes, ascenseurs temporisés, puits consécutifs, habilitations intermédiaires, scellement et itinéraires alternatifs. Les visiteurs/convois autonomes, l'éditeur de portes souterraines et le réseau 3D multi-branches restent à faire. La version complète 1.1 n'est pas déclarée livrée.

Tranche du 30 octobre — **cohérence des trois vues ajoutée** : bâtiments du complexe principal projetés en toiture sur la vue Région à partir du plan réel de Surface ; sélection conservée entre la ville, le plan intérieur et la coupe souterraine ; axe de coupe A-A partagé ; vrais alignements ascenseurs/puits ; parcelle du Site réservée ; conservation des installations régionales d'anciennes sauvegardes. Les annexes extérieures restent des entités à part et non des salles d'intérieur.

**Nouvelle tranche appliquée le 30 octobre :** inspection intérieure dédiée des annexes régionales, avec zones descriptives partageant l’état et l’identité de leur installation extérieure ; coupes souterraines Y multiples, mini-carte X–Y par niveau, galeries inter-coupes et ascenseurs alignés en X/Y ; déplacements transversaux physiques, sauvegardes compatibles (schéma 4) et tests de déviation après scellement. **Reste ouvert :** WebGL véritable, salles d’annexes constructibles et avec personnel, étages de surface, escaliers et éditeur de portes/sas souterrains ; visiteurs/convois autonomes.

- dessin de salles par glisser-déposer et redimensionnement ;
- portes, sas et sens de circulation ;
- plans de travail par équipe ;
- vraies affectations de poste et itinéraires ;
- diagnostic multi-étapes des anomalies ;
- chronologie après action ;
- vingt nouveaux événements ;
- dix SCP supplémentaires à forte personnalité systémique.

## 1.2 — Veil

- ville environnante animée ;
- journalistes, inspections, riverains et autorités ;
- réseaux routiers connectés ;
- convois visualisés ;
- opérations de désinformation et amnésiques ;
- fronts de couverture configurables ;
- Groupes d’intérêt et agents infiltrés persistants.

## 1.3 — Containment Engineering

- réseaux physiques de câbles, eau, air et données ;
- pression positive/négative ;
- qualité de l’air et propagation ;
- portes et circuits électriques indépendants ;
- géologie, nappes et stabilité ;
- cellules modulaires construites par composants ;
- essais automatisés de scénarios de panne.

## 2.0 — True 3D Site

- rendu WebGL véritable ;
- caméra orbitale Région et Surface ;
- bâtiments avec toitures escamotables ;
- coupe souterraine dynamique ;
- agents 3D simples et véhicules ;
- LOD, instancing et occlusion ;
- compatibilité de sauvegarde avec la 1.x ;
- mode photo et relecture de crise.

## 2.1 — World Operations

- carte mondiale ;
- choix de Site/Area et biomes ;
- récupération stratégique ;
- composition des FTM ;
- véhicules, itinéraires, météo et renseignement ;
- transferts inter-Sites ;
- conséquences mondiales et scénarios de classe K.

## 2.2 — Canon Campaigns

Campagnes alternatives séparées : Voile brisé, division antimémétique, fin de la mort et autres continuités compatibles, sans les mélanger arbitrairement.

## 3.0 — Creator Platform

- éditeur de SCP data-driven ;
- éditeur de salles et événements ;
- validation de compatibilité de licence ;
- import/export de packs ;
- workshop communautaire ;
- traduction ;
- API de mods sandboxée.

## Portages

- application desktop Tauri ;
- prise en charge manette ;
- cloud saves optionnelles ;
- Steam Deck ;
- tablette avec mode tactile avancé.

## Multijoueur envisagé

Coopération à deux ou quatre rôles : direction, science, sécurité et logistique. Le serveur reste autoritaire, les décisions critiques peuvent exiger plusieurs validations, et la partie doit rester jouable en solo.

