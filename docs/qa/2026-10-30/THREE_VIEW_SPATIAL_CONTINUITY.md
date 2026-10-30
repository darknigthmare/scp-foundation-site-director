# Validation — cohérence spatiale des vues Région, Surface et Sous-sol

**Date :** 30 octobre 2026. **Projet :** SCP Foundation: Site Director. **Base :** 1.0.0 — tranche Operations / trois vues reliées.

## Révision vérifiée

- [Commit fonctionnel de la PR #1](https://github.com/darknigthmare/scp-foundation-site-director/commit/a1be3e822777a920c38c89f5ae48c0ab04349261).
- [Exécution de validation GitHub Actions #41037080028](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41037080028) : **succès**.
- **101 tests métier exécutés, 101 réussis, 0 échec** ; TypeScript strict et validation structurelle réussis.
- **18 étapes de parcours Chromium sur 18 réussies** ; liste `browser_messages` vide.
- Le parcours navigateur exerce un profil persistant, l'import et la reprise de sauvegardes, le hors ligne PWA, les ports/sas de surface, l'éditeur tactile et, en plus, les passages entre trois vues.
- [Artefact avec captures navigateur](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41037080028/artifacts/12967844652) : `site-roof.png`, `site-interior.png`, `site-section.png`, `site-room-linked.png`, `smoke-report.json`.
- [Build compilé de cette exécution](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41037080028/artifacts/12968192939).
- [Paquet cumulatif de cette exécution](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41037080028/artifacts/12968203672).

## Corrections implémentées

### La ville montre le même complexe

`src/site-spatial.ts` définit une emprise permanente du bâtiment principal dans la région et une transformation biunivoque des coordonnées **Région ↔ Surface**. Chaque toit visible dans la ville est calculé directement depuis une salle `surfaceRooms` actuelle, sans dupliquer les bâtiments ni leurs IDs dans la sauvegarde. Un clic au sein d'un toit isométrique sélectionne à la précision sous-tuile la même salle que dans l'intérieur.

Les `regionFacilities` sont des équipements extérieurs distincts : centrale, eau, parking, voirie et autres annexes. L'emprise du bâtiment principal est réservée aux nouvelles salles et non aux nouvelles annexes régionales. Les annexes d'anciennes sauvegardes chevauchant ce terrain sont néanmoins conservées et signalées, jamais déplacées ni effacées automatiquement.

### La Surface et la coupe souterraine correspondent

La Surface dessine la **coupe A-A** sur l'axe Y=14 de l'installation initiale. La partie supérieure du Sous-sol affiche les pièces de surface intersectant réellement cet axe, aux mêmes abscisses projetées. Le même ascenseur et sa vraie cage peuvent être sélectionnés d'un plan à l'autre, y compris si la cage se situe dans un bord de la salle d'ascenseur plutôt qu'au centre.

Le nouveau contrôle des connexions verticales ne tolère plus un ascenseur à un autre bout du bâtiment ni sur un axe Y différent : le puits doit être à l'aplomb de l'emprise réelle de l'ascenseur. Les déplacements souterrains chronométrés et les itinéraires de galeries déjà livrés sont conservés.

### Navigation entre vues et régressions

La sélection d'une salle est préservée entre Région et Surface ; depuis le Sous-sol, le bouton de remontée sélectionne la pièce au-dessus si une vraie correspondance existe. Une salle hors de la coupe A-A n'obtient pas un faux étage souterrain. Neuf nouveaux tests vérifient les conversions de coordonnées, le clic sur une toiture à précision sous-tuile, l'alignement des ascenseurs, le refus des faux puits, la projection d'une cellule, l'absence de fausse 3D, les nouvelles toitures après construction et démolition, la parcelle réservée et la compatibilité des sauvegardes d'annexes.

L'ancien ensemble de **92 tests** reste vert, notamment le transit physique, les scénarios de panne, les sas et la reprise après sauvegarde.

## Qualité constatée et limites

Les quatre captures du nouveau scénario confirment visuellement le nouveau plan de toitures, le plan intérieur et la bande de coupe, avec les IDs des salles sélectionnées. L'étiquette des niveaux trop à gauche a été corrigée ensuite ; cette retouche n'affecte ni les coordonnées ni le gameplay.

**Important :** ce lot ne crée **pas** un véritable monde 3D à coordonnées (x,y,z). Le Sous-sol est encore une coupe (x,niveau), à un seul axe Y. Il reste à implémenter des bâtiments régionaux indépendants possédant chacun leur intérieur, plusieurs coupes souterraines en Y, des tunnels branchés en deux dimensions, des escaliers, des sas souterrains dédiés, les étages et une caméra 3D volumétrique. Le test mobile actuel est un viewport Chromium et **pas** Safari/iOS natif.

La PR demeure ouverte, en brouillon, non fusionnée ; la version complète Operations 1.1 n'est pas déclarée livrée.
