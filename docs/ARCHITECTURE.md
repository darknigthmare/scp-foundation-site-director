# Architecture technique

## 1. Principes

Le projet est volontairement léger : TypeScript strict compilé en un seul fichier JavaScript, HTML/CSS statiques, Canvas 2D et Web APIs natives. Aucun framework ni dépendance d’exécution n’est nécessaire. Cela facilite l’archivage, le déploiement et la reprise par Codex.

## 2. Compilation

`tsconfig.json` utilise un namespace global `SCPGame`, `module: none` et `outFile: dist/game.js`. L’ordre des fichiers est explicite pour garantir que les types, données et fonctions existent avant le démarrage.

`scripts/build.mjs` :

1. supprime `dist/` ;
2. lance TypeScript ;
3. copie HTML, CSS et contenu de `public/`.

## 3. Modules

### `src/types.ts`

Contrats du jeu : état global, ressources, constructions, personnel, SCP, procédures, crises, événements, campagne et runtime.

### `src/data.ts`

Catalogue data-driven : définitions des constructions, SCP, recherches, événements, campagne, noms et traits. C’est le principal point d’extension de contenu.

### `src/utils.ts`

Mathématiques, formatage, identifiants, choix pondérés, coûts et fonctions génériques.

### `src/state.ts`

Création de partie, migration/normalisation des sauvegardes, sérialisation, construction, amélioration, réparation, démolition, recrutement, recherche, transfert SCP et actions atomiques.

### `src/simulation.ts`

Pas de simulation : économie, production, entretien, besoins, déplacement, files, recherche, conformité des procédures, comportement unique des SCP, campagne, événements et crises.

### `src/renderers.ts`

Rendu Canvas des vues Région, Surface, Sous-sol et Commandement, transformations écran-grille, hit-testing et éléments animés.

### `src/ui.ts`

DOM, catalogues, panneaux de sélection, modales, dossiers, gestion, paramètres, événements, éditeur de procédures, raccourcis et délégation d’événements.

### `src/main.ts`

Boot, boucle `requestAnimationFrame`, accumulation du temps simulé, caméra, pointeur, zoom, sélection, audio procédural et service worker.

## 4. État global

`GameState` est sérialisable en JSON. Il contient uniquement des données ; les définitions immuables restent dans `data.ts`. Ce choix permet :

- sauvegardes simples ;
- relecture déterministe partielle ;
- inspection dans les tests ;
- migration de version ;
- futur mode multijoueur autoritaire.

Le runtime contient Canvas, contexte, pointeur et timing, qui ne sont jamais sauvegardés.

## 5. Boucle temporelle

La boucle graphique tourne à la fréquence du navigateur. Le temps de simulation est accumulé selon la vitesse `0/1/2/4`. Seules des minutes entières sont envoyées à `advanceSimulation`, ce qui évite de lier l’équilibrage au framerate.

Les rafraîchissements DOM sont limités et séparés du rendu Canvas afin de réduire le coût sur mobile.

## 6. Rendu et interactions

Chaque couche possède sa caméra. Les fonctions `screenToRegionCell`, `screenToSurfaceCell` et `screenToUndergroundCell` convertissent les coordonnées. Le clic construit si un outil est actif, sinon il sélectionne.

La délégation DOM cible uniquement les boutons/actions réels. Le `data-view` du `body` est réservé au style et ne participe plus au routage des clics ; cette séparation évite le bug de désélection corrigé pendant la QA.

## 7. Procédures

La conformité est calculée par `evaluateProcedureCompliance`. Les exigences d’un SCP vivent dans sa définition, tandis que les choix du joueur vivent dans `ProcedureState`. Cette séparation permet d’ajouter une anomalie sans modifier l’éditeur.

Pour une mécanique totalement unique, compléter aussi le traitement des SCP dans `simulation.ts`, sans mettre de logique spéciale dans le rendu.

## 8. Crises

`CrisisState` contient type, gravité, zones, menaces, ressources d’intervention et métriques globales. Les ordres sont des actions déterministes qui modifient l’état. La simulation poursuit ensuite la propagation jusqu’à résolution ou échec.

## 9. Sauvegardes et compatibilité

La sauvegarde contient `version`. Toute évolution du schéma doit être absorbée dans la normalisation de `state.ts` :

1. charger les anciennes données ;
2. fusionner avec un état neuf ;
3. compléter les propriétés absentes ;
4. ne jamais supprimer silencieusement du contenu placé ;
5. incrémenter la version de clé seulement si une migration automatique est impossible.

## 10. Ajouter un bâtiment

1. Étendre le type union dans `types.ts`.
2. Ajouter la définition dans `data.ts`.
3. Vérifier que le rendu générique suffit.
4. Ajouter une logique de production/service uniquement si nécessaire.
5. Ajouter un test de placement et mettre à jour le catalogue documentaire.

## 11. Ajouter un SCP

1. Ajouter sa définition et ses exigences.
2. Prévoir une cellule compatible existante ou une nouvelle pièce.
3. Ajouter ses options de procédure.
4. Implémenter sa règle unique dans la simulation.
5. Ajouter le déblocage de campagne ou sandbox.
6. Ajouter attribution et source dans `ATTRIBUTION.md`.
7. Tester transfert, conformité, perte de ressources et brèche.

## 12. Migration vers une vraie 3D WebGL

La simulation et l’UI peuvent être conservées. Il suffit de remplacer progressivement `renderers.ts` par un adaptateur de scène :

- région : terrain, bâtiments instanciés et routes ;
- surface : murs extrudés, coupe de toiture et agents ;
- souterrain : niveaux empilés, coupe dynamique et ascenseurs ;
- sélection : raycasting vers les mêmes identifiants d’état.

Le rendu ne doit jamais devenir la source de vérité. Les scènes reflètent `GameState`, elles ne le possèdent pas.

## 13. Tests

`npm run check` vérifie la présence du build et des systèmes structurants. `tests/smoke.py` charge le build dans Chromium, construit sur les trois couches, transfère un SCP, modifie une procédure, sauvegarde, lance une crise et vérifie le responsive.
