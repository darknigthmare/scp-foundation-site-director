# QA — Portes et sas souterrains sur jonctions physiques

**Date :** 30 octobre 2026. **Base du jeu :** 1.0.0. **Tranche :** Operations / contrôles des arêtes X/Y souterraines.

## Fonctionnalités implémentées

- Portes et sas installables uniquement entre deux volumes souterrains adjacents au même niveau, en X ou Y, avec paiement atomique et prévention des doublons.
- Habilitation de 0 à 5, direction de passage, verrouillage, contrôle du courant et de l'air des sas. Les itinéraires du personnel empruntent les mêmes règles que les portes représentées dans la coupe.
- Porte réservée pendant un passage physique : si elle se ferme à mi-pas, le membre revient physiquement du côté d'origine, sans traversée fictive comptée.
- Sas interverrouillé, un occupant, file FIFO bornée, quatre minutes d'égalisation, déplacement après admission, panne énergie/air suspendant le cycle, évacuation manuelle, traversées cumulées. Pas de téléportation pendant les cycles ni lors de leur reprise.
- Sauvegarde des files et cycles, contrôle des références d'accès et des occupations, migration de l'absence historique d'accès, rejet d'un schéma futur ou mal formé (marqueur de schéma 5).
- Démontage bloqué si un sas est occupé, remboursement partiel basé sur les paiements réels. Démolition d'un module occupé refusée pour éviter les agents bloqués dans la roche.

## Validation

- **Tests métier validés dans GitHub Actions : 132/132 réussis** (13 tests supplémentaires relatifs aux portes et sas ; compilation TypeScript stricte, validation structurelle).
- **Navigateur local : non vérifié** (l'accès à `127.0.0.1` dans Chromium renvoie `ERR_BLOCKED_BY_ADMINISTRATOR` dans cet environnement). Le parcours Chromium GitHub Actions est la validation autoritative des interactions et captures.
- **CI du commit fonctionnel :** [GitHub Actions #41060363210](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41060363210) — succès, **132/132 tests métier, 21/21 étapes Chromium, 0 message navigateur**. Capture `underground-airlock.png` et ZIP cumulatif disponibles dans les artefacts de cette exécution. La retouche de rendu transversal et le nouveau packaging ont également passé [la CI complète #41061053227](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41061053227) : **132/132 tests, 21/21 étapes Chromium, 0 message navigateur**. L'archive `scp-builder-operations-underground-airlocks.zip` (122 fichiers) a été générée et contrôlée ; son SHA-256 est `436df0bc17cb86558cb948233c0885c0e8453f4444e3c76a1d73402b32010582`. La somme SHA-256 de `dist/game.js` est `c5685dae61bf16474f50a53a7eeb3d8925a92306776104b62894a43c1bee4639`.

## Limites

Les accès contrôlent les liens X/Y de l'infrastructure souterraine ; la gestion d'une porte au milieu d'une longue salle, un sas vertical par puits et des réseaux physiques de pression/décontamination sont des extensions futures. Les quatre zones consultables des annexes ne sont pas encore des pièces autonomes. Le rendu reste en coupe 2.5D + mini-carte, pas une vraie scène volumétrique 3D. Le jeu s'appuie sur SCP sous les attributions CC BY-SA appropriées ; les plans techniques proposés ne constituent pas une reconstruction canonique exacte.

**La PR reste ouverte, en brouillon, non fusionnée ; Operations 1.1 complète non revendiquée.**
