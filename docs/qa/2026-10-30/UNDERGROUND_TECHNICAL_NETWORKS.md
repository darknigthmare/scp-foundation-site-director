# QA — Circuits physiques souterrains : électricité, eau et air

**Date :** 30 octobre 2026. **Édition :** Operations — réseaux techniques. **Base du jeu :** 1.0.0.

## Portée fonctionnelle

- Trois circuits indépendants sur les contacts physiques des modules X/Y/profondeur ; chaque lien technique est indépendant des portes de circulation.
- Un nouveau module nécessite de poser ses gaines. Une sauvegarde antérieure sans champ `undergroundConduits` est migrée sur les **jonctions réellement contiguës**, sans coût artificiel. Une sauvegarde au nouveau format ne peut supprimer ce champ afin de réactiver des conduits désactivés.
- Un conduit coûte 850 fonds et 4 pièces ; commutation d'une vanne gratuite et immédiate ; démolition remboursée à 40 % des paiements historiques. Dépenses atomiques, refus des doublons, des roche sans cloison et des ID forgés.
- Le réseau électrique démarre des puits sous des ascenseurs de surface actifs ; un nœud énergétique assure un secours local avec batterie et réserves disponibles. L'eau part des puits alimentés ; la ventilation des puits ou des filtres profonds électriquement alimentés. Les modules détruits/désactivés coupent le transit. Le verrouillage des portes n'est pas un interrupteur général de fluides.
- Panne de réseau local : pénalités de conformité SCP, arrêt de recherche d'un laboratoire souterrain, suspension des sas sans électricité/air aux deux extrémités et des ascenseurs aux puits hors tension. Le réseau est recalculé à chaque état sans stockage redondant de résultats.
- Panneaux d'état et commande des trois vannes, indicateurs graphiques sur les salles souterraines et test navigateur.

## Vérification

- Local avant soumission de la PR : **148/148 tests métier**, compilation TypeScript stricte, contrôle structurel réussis. Les **16 tests nouveaux** sont dans `tests/underground-utilities.test.mjs` (défauts de circuit, couts, migrations, voies alternatives, secours, recherche et sas). Le nouvel état navigateur sera renseigné depuis le rapport CI plutôt que supposé réussi.
- **CI GitHub** : à renseigner après la livraison sur la PR (ne pas confondre les chiffres de ce lot avec les anciennes exécutions).

## Limites et fidélité

La distribution est physique sur le graphe des modules, mais n'est pas une simulation à particules des fluides, des pressions, de la ventilation tridimensionnelle ou des effets atmosphériques. Aucune carte de conduites détaillées à l'intérieur de chaque grande pièce, ni intégration des réseaux des annexes extérieures. Le rendu est toujours 2.5D avec mini-carte 2D. Les sites SCP varient selon les œuvres : **aucun plan canonique unique 1:1 n'est revendiqué**. Les changements respectent le Site construit dans la partie plutôt que fabriquer des bâtiments absents.

**PR en brouillon et non fusionnée ; la totalité d'Operations 1.1 n'est pas déclarée livrée.**
