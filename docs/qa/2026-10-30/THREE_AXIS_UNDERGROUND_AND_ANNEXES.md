# QA — Annexes explorables et navigation souterraine X–Y–profondeur

**Date :** 30 octobre 2026. **Base du jeu :** 1.0.0. **Édition :** Operations, tranche réseau multi-axes et intérieurs régionaux.

## Résultats vérifiés

- **[GitHub Actions #41044273246](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41044273246)** : pipeline entièrement réussi sur le commit fonctionnel `73010f3e1f19f7e20f5a824846c42bc6a3a3425e`, **119/119 tests métier, 20/20 étapes Chromium**, compilation TypeScript stricte, validation structurelle et **0 message navigateur**.
- [Build jouable](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41044273246/artifacts/12971192926), [captures et rapport navigateur](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41044273246/artifacts/12972011264), [archive cumulative et sources](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41044273246/artifacts/12971482333).
- L'archive fonctionnelle `scp-builder-operations-spatial-3d-network.zip` contenait **118 entrées**, sans erreur ZIP. Les **117 fichiers du manifeste** ont été recalculés et sont conformes ; son SHA-256 était `b15c0bbf5d57633275c4d87b25417c03f5b6475beaea5975d5a91b677aedb473`. `dist/game.js` : SHA-256 `8f164536892e2b055f05e8779534db669eef78cf6050ef3922047b67e2512637`.
- Le script de livraison a ensuite été renommé pour annoncer précisément le **réseau à trois axes avec rendu 2.5D**. Chaque nouvelle CI possède donc son propre hash ZIP et son `release/BUILD_INFO.json` autoritatif.
- Les builds GitHub Actions déclenchés par `pull_request` sont produits depuis le commit de fusion temporaire du runner (notamment `96e718f6...` dans ce lot) ; celui-ci ne signifie pas que la PR a été fusionnée sur `main`.

## Développements appliqués

**Annexes et cohérence des trois vues.** Chaque annexe régionale bâtie et explorable ouvre, par action explicite « Explorer l'intérieur », quatre zones schématiques propres à son rôle, sans double comptage des ressources. Les routes et espaces verts n'ont pas d'intérieur. Le menu principal « Surface » mène toujours au bâtiment principal, tandis que le retour depuis une annexe permet de retrouver son bâtiment sur la carte Région.

**Topologie souterraine.** Un module est identifié par sa coordonnée horizontale X, son axe transversal Y et sa profondeur. La coupe latérale affiche le Y actif ; la mini-carte X–Y affiche les modules à la profondeur choisie. Les boutons précédent/suivant et la liste « Accès direct à une coupe » permettent de naviguer sans déplacer les modules des autres coupes.

**Déplacements physiques.** Les galeries se connectent par contact en X, par chevauchement en X entre des Y contigus, et verticalement via des puits alignés en X et Y. La marche et les traverses sont progressives, les habilitations/secteurs scellés sont vérifiés, et un franchissement interrompu est repris de façon cohérente. Une panne d'ascenseur suspend le trajet vertical plutôt que téléporter le personnel.

**Sauvegardes.** Les anciennes salles souterraines sans coordonnée Y sont migrées sur l'axe historique (Y=14 pour la géométrie initiale). Les IDs, SCP, pièces, affectations et états restent conservés. Les références invalides sont rejetées ; le marqueur de schéma de chargement est 4. La progression d'une traverse entre coupes est sérialisée.

## Scénarios testés

Les **119 tests Node** comprennent 17 nouveaux cas pour le réseau multi-axes et les annexes, plus une régression sur le menu Surface. Les **20 étapes Chromium** couvrent notamment la construction Région/Surface/Sous-sol, le transfert SCP, les sas, la cohérence des trois vues, la sélection d'une zone d'annexe, le changement de coupe Y et de profondeur, la gestion, les sauvegardes et imports, la reprise HTTP, la fermeture complète du navigateur, le hors-ligne PWA, le mode crise et le viewport mobile.

Captures disponibles dans l'artefact : `annex-power-plant.png`, `annex-control-room.png`, `underground-3d-slice.png`, `underground-plan-second-level.png`, ainsi que les vues de surface, de région et de crise.

## Limites explicites

**Trois coordonnées pour le graphe, rendu toujours en 2.5D**, pas de caméra WebGL 3D. Les quatre zones des annexes sont inspectables mais ne sont pas encore des salles librement constructibles avec agents autonomes. Restent à développer : bâtiments par étage, déplacements entre annexes, portes/sas propres aux traverses souterraines, escaliers, réseaux physiques de ventilation/eau/électricité, convois et visites, et tests Safari/iOS natifs.

**PR ouverte, en brouillon et non fusionnée. Base du jeu 1.0.0 ; version Operations complète non revendiquée.**
