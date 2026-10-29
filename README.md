# SCP Foundation: Site Director — Deep Protocol

**Base 1.0.0 — build jouable hors ligne, tranche Operations : accès de surface**  
City-builder régional, gestion opérationnelle du complexe de surface, confinement vertical souterrain et commandement tactique de crise.

![Gestion du complexe de surface](tests/surface.png)

## Ce qui est livré

Cette version transforme le concept initial en un jeu web complet et jouable, sans dépendance d’exécution ni asset externe. La simulation relie réellement les quatre échelles du Site :

- **Région** : couverture publique, routes, énergie, eau, logistique, logements et suspicion.
- **Complexe de surface** : construction pièce par pièce, personnel, files d’attente, entretien, diagnostic, décontamination et réception des anomalies.
- **Niveaux inférieurs** : excavation, cellules spécialisées, réseaux critiques, transferts SCP et procédures de confinement.
- **Commandement** : crises en temps réel avec pause, ordres tactiques, intégrité du Site, maintien du Voile et pertes humaines.

Le build contient notamment :

- 14 installations régionales ;
- 25 types de salles de surface ;
- 18 modules souterrains ;
- 12 SCP jouables, chacun avec contraintes et incidents spécifiques ;
- 12 recherches interconnectées ;
- personnel individuel, métiers, traits, besoins, salaires, formation et compromission ;
- économie, énergie, eau, stocks, maintenance, propreté et files de service ;
- éditeur de procédures de confinement avec conformité et complexité ;
- campagne en 6 directives et mode bac à sable ;
- événements à choix, inspections, brèches, biohazards, infiltrations et exercices ;
- sauvegarde locale, autosauvegarde, export/import JSON, PWA hors ligne ;
- interface responsive pour ordinateur, tablette et mobile ;
- audio procédural, contraste renforcé et réduction des animations.

La représentation est une **3D stylisée en 2.5D/isométrique par Canvas** : région en perspective, surface en plan de gestion et souterrain en coupe latérale. L’architecture est prête pour une future couche WebGL réellement volumétrique sans devoir réécrire la simulation.

## Accès de surface — tranche Operations

Les salles de surface disposent maintenant de portes et de sas placés sur leurs murs. Le panneau **Portes et sas** permet de choisir l'emplacement, l'habilitation minimale, les flux autorisés et le sens de circulation. Le personnel emprunte réellement les passages autorisés ; un refus d'accès arrête son trajet et apparaît dans sa fiche.

Les sas traitent une personne à la fois, dans l'ordre d'arrivée, avec admission, égalisation et sortie. Une panne d'électricité ou d'air ferme les deux portes et suspend le cycle. L'évacuation manuelle replace l'occupant du côté d'origine et verrouille le passage, sans compter de traversée. La file, le cycle et le compteur sont sauvegardés.

Les sauvegardes antérieures reçoivent des portes compatibles sans remplacer leurs salles ni leur personnel. Les réglages d'accès s'appliquent à chaque passage : sécuriser une salle exige de configurer tous ses accès.

Cette tranche conserve la version de base 1.0.0. Le dessin libre des salles, les itinéraires souterrains physiques, les flux autonomes de public/fret/SCP et les autres systèmes de la version Operations complète restent dans la feuille de route.

## Lancement rapide

### Archive avec le build fourni

Le paquet cumulatif contient le code, un dossier `dist/` jouable, le rapport navigateur, les captures et des empreintes SHA-256. Avec Node.js 18 ou plus récent, lancer `npm start` depuis le dossier extrait, puis ouvrir `http://127.0.0.1:4173`. La recompilation n'est nécessaire que pour modifier les sources.

Le workflow GitHub Actions produit l'artefact **scp-operations-package** après la réussite des tests. `release/BUILD_INFO.json` identifie le commit et le bundle ; `release/FILES_SHA256SUMS.txt` décrit les fichiers de l'archive. Le `SHA256SUMS.txt` historique à la racine conserve son rôle de provenance de l'archive initiale.

### Windows

Double-cliquer sur :

```text
Lancer_Site_Director.bat
```

### macOS ou Linux

```bash
chmod +x launch_site_director.sh
./launch_site_director.sh
```

### Lancement manuel

Node.js 18 ou plus récent est requis pour le petit serveur local :

```bash
npm install
npm run build
npm start
```

Puis ouvrir `http://127.0.0.1:4173`.

Le dossier `dist/` est autonome et peut être publié tel quel sur Vercel, Netlify, GitHub Pages ou tout hébergement statique.

## Contrôles

| Action | Souris / tactile | Clavier |
|---|---|---|
| Déplacer le curseur de grille | Pointer ou toucher | Flèches, `Home` pour recentrer |
| Sélectionner / construire | Clic ou toucher | `Entrée` sur le Canvas |
| Déplacer la caméra | Glisser | — |
| Zoomer | Molette | Canvas focalisé : `+`, `-`, `PageUp`, `PageDown` |
| Région | Navigation latérale | `1` |
| Surface | Navigation latérale | `2` |
| Sous-sol | Navigation latérale | `3` |
| Commandement | Navigation latérale | `4` |
| Gestion | Navigation latérale | `5` |
| Pause / reprise | Barre supérieure | `Espace` |
| Accélérer | Barre supérieure | `+` |
| Ralentir | Barre supérieure | `-` |
| Annuler construction / fermer | Bouton Annuler | `Échap` |

## Première partie recommandée

1. Lancer une **campagne en difficulté Standard**.
2. En Région, développer la couverture, l’énergie, l’eau et les approvisionnements.
3. En Surface, compléter les flux essentiels : accueil, contrôle, médical, maintenance, entrepôt, recherche et ascenseur.
4. En Sous-sol, créer les galeries, puits, postes de sécurité et cellules compatibles.
5. Dans Gestion, recruter les rôles manquants et lancer les recherches prioritaires.
6. Transférer un premier SCP, ouvrir son dossier et ajuster sa procédure jusqu’à dépasser 75 % de conformité.
7. Depuis Commandement, déclencher un exercice lorsque les équipes et réseaux sont prêts.

## Sauvegardes

- **Sauvegarde manuelle** depuis le menu Gestion.
- **Autosauvegarde** périodique et à la fermeture de la page.
- **Export JSON** pour archiver ou transférer une partie.
- **Import JSON** avec validation, bornage, migration et normalisation des anciens champs.
- **Continuer/Charger** choisit la copie la plus récente entre sauvegarde manuelle et autosauvegarde, selon son horodatage.

Clés locales utilisées :

```text
scp-site-director-save-v1
scp-site-director-autosave-v1
```

## Build, validation et tests

```bash
npm run build
npm run check
npm test
```

`npm test` reconstruit le bundle TypeScript, exécute tous les tests métier de `tests/*.test.mjs` et contrôle la structure publiable, les icônes PWA, la licence et l'attribution. Les scénarios couvrent aussi les règles d'accès, les files et cycles des sas, les pannes et la validation des sauvegardes.

Test navigateur complet facultatif, si Python et Playwright sont disponibles :

```bash
python tests/smoke.py
```

Le rapport du passage courant et les captures sont écrits dans `test-results/smoke/`, puis téléversés par la CI. Le navigateur utilise un serveur HTTP et le stockage natif, avec reprise après rechargement, fermeture complète et perte du réseau. Les fichiers historiques dans `tests/` restent des preuves datées.

## Structure du dépôt

```text
.
├── src/
│   ├── types.ts          # modèle de données
│   ├── data.ts           # catalogue de contenu
│   ├── utils.ts          # fonctions partagées
│   ├── access.ts         # passages, profils et cycles des sas
│   ├── state.ts          # création, sauvegarde et actions
│   ├── simulation.ts     # économie, agents, SCP et crises
│   ├── renderers.ts      # vues Canvas multi-couches
│   ├── ui.ts             # panneaux, modales et interactions
│   └── main.ts           # boucle de jeu, caméra et audio
├── public/               # manifeste, icône et service worker
├── dist/                 # build directement publiable
├── scripts/              # build, serveur et validation
├── tests/                # smoke test et captures
├── docs/                 # GDD, manuel, architecture, QA et suite Codex
├── index.html
├── styles.css
└── package.json
```

## Documents importants

- [Document de game design complet](docs/GAME_DESIGN_DOCUMENT.md)
- [Manuel du directeur de Site](docs/USER_MANUAL.md)
- [Architecture technique](docs/ARCHITECTURE.md)
- [Catalogue du contenu](docs/CONTENT_CATALOG.md)
- [Rapport QA](docs/QA_REPORT.md)
- [Notes de version](RELEASE_NOTES.md)
- [Feuille de route](docs/ROADMAP.md)
- [Prompt cumulatif pour poursuivre avec Codex](docs/PROMPT_CODEX_CONTINUATION.md)
- [Attributions SCP](ATTRIBUTION.md)
- [Licence](LICENSE.md)

## Publication Vercel

Le fichier `vercel.json` est déjà configuré pour servir `dist/`. Après import du dépôt :

```text
Build command : npm run build
Output directory : dist
```

## Positionnement de la version 1.0

Cette version est une simulation de gestion complète et jouable, pensée comme un **socle de production**. Elle ne prétend pas être déjà un jeu commercial 3D à gros budget : les personnages, salles et incidents sont représentés de façon procédurale en 2.5D, afin de concentrer le développement sur la profondeur systémique, la stabilité et l’interconnexion du gameplay. La feuille de route prévoit le rendu WebGL, l’éditeur de salles volumétriques, le modding et davantage de SCP sans casser les sauvegardes existantes.

## Licence et attribution

Le projet dérive de contenus de l’univers SCP Foundation. Voir `LICENSE.md` et `ATTRIBUTION.md` avant toute redistribution ou modification. Aucun visuel, son ou fichier média du wiki SCP n’est intégré au build : l’interface, les symboles et les rendus sont générés localement par le projet.

