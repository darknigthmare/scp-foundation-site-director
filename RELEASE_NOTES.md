# Notes de version — 1.0.0

## Stabilisation professionnelle finale — 4 septembre 2026

- La campagne démarre désormais sur de vrais objectifs de construction et de recrutement, sans auto-validation au premier tick.
- Le système de sauvegarde compare manuel/autosave par date, migre les anciennes sauvegardes et conserve les événements non résolus.
- La compatibilité de confinement exige maintenant une vraie cellule, les tags SCP requis, le niveau de confinement et la sécurité minimale.
- Les blindages augmentent réellement confinement et sécurité ; une cellule Keter renforcée peut donc satisfaire les exigences de SCP-682.
- Les ordres de crise valident les effectifs avant paiement et ne créent plus de personnel fantôme.
- Le personnel gagne des rotations jour/nuit, une action de contrôle interne et une formation qui récompense à la fin.
- Les blessés et quarantaines conservent leur statut, disposent d'une file médicale ciblée unique et retrouvent une affectation après guérison.
- Les procédures avancées exigent leur recherche, utilisent les effectifs réels et imposent des minima de formation, maintenance et complexité calculée.
- La progression SCP attribue une récompense unique, l'objectif Keter exige 1 440 minutes stables consécutives et les conséquences différées d'événements expirent correctement, y compris après migration.
- La grille Canvas est navigable au clavier, son zoom est contextuel et le rendu ne se recalcule plus en continu lorsque rien ne change.
- Les modales piègent et restaurent le focus, neutralisent l'arrière-plan et respectent la pause du joueur ; les contrôles natifs ne déclenchent plus les raccourcis globaux.
- Le panneau mobile **Détails/Masquer**, les cibles tactiles, les cinq ressources et les réglages d'accessibilité restent disponibles sur petit écran.
- L'attribution SCP et la licence CC BY-SA 3.0 sont accessibles dans l'interface publiée.
- La PWA r4 embarque des icônes PNG 192/512 originales, la licence et les attributions hors ligne ; le cache évite les soft-404 et la configuration Vercel ajoute CSP, Permissions-Policy et anti-framing.

Validation actuelle : `npm test` réussit avec 12/12 tests métier, build TypeScript et validation structurelle renforcée.

Publication vérifiée le 4 septembre 2026 : commit jeu `9518fd2`, déploiement Vercel production `dpl_9P9ryQ7adVRtQCaCUZmv6RDFzCiy`, alias public, headers, PWA hors ligne, desktop et mobile validés.

Cette archive contient la première version jouable de **SCP Foundation: Site Director — Deep Protocol**.

Le jeu peut être lancé localement, installé comme PWA ou déployé comme site statique. Le dossier `dist/` est le build final ; le reste contient le code source, les documents de conception, les tests et le prompt de reprise Codex.

## Point fort de cette version

Les systèmes ne sont pas quatre écrans indépendants. Les ressources de la Région alimentent le complexe, le personnel de Surface traite les besoins et files, les cellules souterraines évaluent la conformité réelle des SCP, et les crises exploitent les faiblesses cumulées du Site.

## Limites assumées

- rendu 2.5D Canvas plutôt que WebGL 3D intégral ;
- opérations mondiales encore abstraites ;
- 12 SCP conçus en profondeur plutôt qu’un catalogue superficiel ;
- pas de multijoueur ni de modding dans la 1.0.

Ces limites sont couvertes par `docs/ROADMAP.md`.
