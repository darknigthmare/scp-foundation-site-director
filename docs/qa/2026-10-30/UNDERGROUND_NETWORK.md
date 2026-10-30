# QA — Réseau souterrain et ascenseurs physiques

**Date :** 30 octobre 2026 — **jeu :** SCP Foundation: Site Director (base `1.0.0`, tranche Operations).

## Référence testée

- Commit applicatif testé : [`1a7e262419f9ab75add668f39081ee7ce4361c08`](https://github.com/darknigthmare/scp-foundation-site-director/commit/1a7e262419f9ab75add668f39081ee7ce4361c08)
- Pipeline : [GitHub Actions #41031043683](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41031043683), **succès**.
- Artefacts : [build `scp-build`](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41031043683/artifacts/12964889839), [preuves navigateur](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41031043683/artifacts/12966141441), [paquet cumulatif testé](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41031043683/artifacts/12966131364).
- **92 / 92 tests Node réussis**, zéro échec ; compilation TypeScript stricte et validation structurelle réussies.
- **17 / 17 étapes Chromium réussies**, liste `browser_messages` vide.
- Navigateur de test : profil Chromium persistant, navigateur redémarré, recharge HTTP et reprise hors ligne PWA ; un viewport mobile Chromium est testé, **pas un iPhone/Safari réel**.

## Éléments réellement appliqués

### Réseau et sécurité

Chaque salle souterraine possède une empreinte horizontale et un niveau. Deux modules ne sont connectés que s'ils sont contigus au même étage ; les puits d'ascenseur s'enchaînent exclusivement s'ils sont alignés à chaque niveau. Aucun trajet ne franchit un vide sans module construit. Un module désactivé, scellé ou trop endommagé coupe le passage. Les habilitations 0–5 des modules intermédiaires et de la destination sont prises en compte dans la recherche du chemin. Plusieurs cages peuvent offrir une route de secours, calculée par un plus court chemin pondéré.

### Circulation et sauvegarde

Le personnel rejoint un ascenseur en surface, descend pendant **quatre minutes simulées** avec une alimentation fonctionnelle, puis parcourt les galeries au rythme de **0,55 unité/minute**. Pour un besoin de surface, le trajet retour passe par les galeries et un ascenseur, sans apparition instantanée sur le plan de surface. La coupure d'alimentation suspend le mouvement vertical et la reprise continue la progression. Une sauvegarde effectuée pendant la descente restitue la destination et la progression avec une affectation SCP réellement occupée.

L'auto-affectation réserve en priorité les gardes et spécialistes aux SCP confinés, avant de distribuer les autres aux services de surface. Seuls les agents réellement présents, disponibles et habilités comptent pour la conformité SCP.

### Interface

Une salle sélectionnée affiche **Habilitation**, **Ascenseur**, **Galerie**. Le bouton **Sceller / Rouvrir le secteur** modifie immédiatement les itinéraires. Les raccords de galeries sont représentés sur le plan. Le scénario navigateur teste explicitement ce contrôle et crée la capture `underground-network.png`, présente dans les artefacts.

## Régressions couvertes

Les neuf tests ajoutés dans `tests/underground-network.test.mjs` vérifient : continuité des galeries, durée de descente et vitesse de marche, puits manquants et habilitations, panne électrique, sauvegarde en cours de trajet, scellement/réouverture, contournement par un deuxième puits, retour physique pour manger, et présence réelle du personnel avant bonus de conformité.

Les 83 tests antérieurs continuent de couvrir portes/sas de surface, file FIFO, panne air/électricité, prévention de passage fantôme, mobilité, soins, sauvegardes, campagne et confinement.

## Provenance et intégrité

L'artefact GitHub `scp-build` de cette exécution a pour empreinte extérieure SHA-256 :

`ac2d0767bd39a2c5eabf8314c13c19c39992a53a52bca4b888c9298a966188c9`

Le build `dist/game.js` contenu dans le paquet a l'empreinte :

`e2002a3cd744aa41b3bb88ef7d20cc6e4a3fc72456d848e31c638ebda75cbf6f`

Le paquet ZIP intérieur (nom historique `scp-builder-operations-access.zip`, avant renommage de la série) testé et validé avait l'empreinte :

`058d7af8f90d1b649ed5ec11e6848916668b1410047e207b38e5e79989b4c114`

Le script de livraison a ensuite été renommé pour l'édition « Accès et réseau souterrain ». **Toute archive d'une exécution ultérieure dispose d'un nouveau SHA et d'un fichier `release/BUILD_INFO.json` autoritatif.**

## Limites et suites

- La carte souterraine reste une coupe 2.5D avec un axe horizontal et les niveaux verticaux ; les embranchements 3D complets restent à développer.
- Il n'existe pas encore d'éditeur distinct de portes et sas souterrains. Le scellement concerne actuellement des modules entiers.
- Les animaux/visiteurs/convois autonomes ne circulent pas encore avec ce moteur.
- Les anciens formats de sauvegarde sont couverts par les fixtures et migrations disponibles ; toutes les véritables archives historiques ne sont pas fournies.
- La validation mobile est réalisée dans Chromium avec viewport simulé, et non sur Safari/iOS natif.
- PR conservée ouverte, **en brouillon, non fusionnée**. Version Operations 1.1 complète non revendiquée.
