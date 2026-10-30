# QA — Annexes explorables et navigation souterraine X–Y–profondeur

**Date :** 30 octobre 2026. **Base du jeu :** 1.0.0, tranche Operations.

## Implémentation

- Intérieur dédié à chaque installation régionale de type bâtiment : quatre zones inspectables, dispositions dérivées de l'installation et état partagé. Les voiries et espaces verts ne sont pas des intérieurs. Les zones ne sont pas encore indépendantes pour les employés/ressources.
- Modules souterrains localisés par coordonnées (X, Y de coupe, profondeur). Coupes Y parcourables, mini-carte horizontale X–Y à profondeur choisie, sélection d'une case pour retrouver la coupe et le module.
- Navigation entre modules côte à côte en X, entre deux coupes Y contiguës pour les modules dont les abscisses se recouvrent, entre profondeurs par puits correctement alignés en X/Y.
- Personnel traversant physiquement les jonctions Y, avec vitesse bornée, contrôle d'habilitation, replanification en cas de secteur fermé et sauvegarde de l'état de traversée (identifiants des deux salles + abscisse du passage). Les ascenseurs demandent toujours du temps et une alimentation électrique.
- Sauvegardes historiques : la coupe unique est placée sur l'axe Y initial, sans modifier les anciennes salles. Les champs et références invalides sont rejetés lors de l'import ; marqueur de schéma 4.

## Vérification

- **Local :** compilation TypeScript stricte, `npm test` réussi : **118/118 tests métier** et validation structurelle. 17 tests métier ajoutés à `tests/underground-3d.test.mjs`.
- **Navigateur local :** non accessible dans l'environnement de préparation (navigation locale refusée avec `ERR_BLOCKED_BY_ADMINISTRATOR`) ; ne pas confondre ce blocage d'environnement avec un échec du jeu. Les parcours Chromium sont confiés à GitHub Actions.
- **CI GitHub :** en attente de validation sur le commit poussé (à actualiser avec le lien, les nombres et les éventuels échecs).

## Limites

Le graphe d'exploration est en trois coordonnées, mais le **rendu reste 2.5D** (coupe latérale et mini-carte horizontale) : il ne s'agit pas encore d'une caméra WebGL 3D. Les intérieurs annexes sont de la consultation structurée, et non de nouvelles salles libres pilotées par la simulation. À faire : bâtiments intérieurs extensibles, escaliers, portes/sas souterrains par liaison, agents entre annexes, plusieurs étages de surface, QA sur matériel Safari/iOS natif.

**La PR reste ouverte, draft et non fusionnée ; la version complète Operations n'est pas revendiquée.**
