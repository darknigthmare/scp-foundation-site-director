# Prompt cumulatif pour poursuivre le projet avec Codex

Copier intégralement ce prompt dans une nouvelle session Codex en joignant le dossier du projet.

---

Tu reprends le projet **SCP Foundation: Site Director — Deep Protocol**, version 1.0.0. Il s’agit déjà d’un jeu web jouable, pas d’un brouillon. Travaille directement dans le dépôt existant et améliore-le cumulativement sans supprimer, simplifier ou remplacer les systèmes déjà livrés.

## Postulat immuable

Le jeu combine quatre couches interconnectées :

1. Région/city-builder pour la ville, la couverture, les accès, les réseaux et les fournisseurs.
2. Complexe de surface de type management hospitalier, avec construction intérieure, salles, employés, files, besoins, diagnostic, sécurité et logistique.
3. Complexe souterrain vertical en coupe, avec excavation, cellules SCP, réseaux critiques, transferts et procédures.
4. Commandement tactique avec pause pour les brèches, contaminations, pannes, infiltrations et atteintes au Voile.

La Gestion transversale couvre personnel, dossiers, recherche, finances, sauvegardes et paramètres.

## Règles de travail

- Commence par lire `README.md`, `docs/GAME_DESIGN_DOCUMENT.md`, `docs/ARCHITECTURE.md`, `docs/QA_REPORT.md`, `docs/ROADMAP.md`, `ATTRIBUTION.md` et tout le code source.
- Considère chaque fonctionnalité existante comme une régression interdite.
- Ne remplace pas le projet par une maquette, une page statique ou un nouveau prototype séparé.
- Conserve les quatre vues et leur interconnexion.
- Conserve le fonctionnement hors ligne, le responsive, l’import/export et les sauvegardes.
- Toute modification du schéma de `GameState` doit migrer les sauvegardes antérieures.
- Le rendu n’est jamais la source de vérité : `GameState` et la simulation restent autoritaires.
- Maintiens TypeScript strict, zéro erreur de compilation et zéro erreur console.
- Préfère les systèmes data-driven. N’ajoute pas des dizaines de conditions dispersées dans l’UI.
- Toute nouvelle anomalie doit avoir une mécanique unique, une cellule/procédure cohérente, un test et une attribution.
- N’intègre aucun média externe sans source et licence compatible. Les rendus originaux/procéduraux sont préférables.
- Ne prétends pas qu’une fonctionnalité est terminée si elle n’est pas testable dans le build.

## Architecture actuelle

- TypeScript namespace compilé en `dist/game.js`.
- `src/types.ts` : contrats.
- `src/data.ts` : contenu.
- `src/state.ts` : état, sauvegardes et actions.
- `src/simulation.ts` : simulation.
- `src/renderers.ts` : Canvas multi-couches.
- `src/ui.ts` : DOM et interactions.
- `src/main.ts` : boucle, caméra, audio et PWA.
- `tests/smoke.py` : scénario navigateur complet.

## Première passe demandée

Réalise la version **1.1 Operations** à fond :

1. Ajoute un véritable outil de dessin/redimensionnement des salles de surface, avec prévisualisation, validation d’emprise et remboursement cohérent.
2. Ajoute des portes et sas placés sur les limites des salles, avec contrôle d’accès et capacité de file.
3. Ajoute un pathfinding de grille robuste et des itinéraires distincts pour public, personnel, contamination, fret et anomalie.
4. Transforme le diagnostic d’une anomalie en chaîne de salles : intake → quarantaine/décontamination → analyse → recherche → autorisation de transfert.
5. Ajoute des plannings d’équipes, relèves et formation obligatoire par procédure.
6. Ajoute une chronologie après crise montrant l’origine, les défaillances successives et les ordres.
7. Ajoute au moins huit SCP supplémentaires, chacun conçu individuellement, sans doublon de mécanique.
8. Ajoute vingt événements contextuels et plusieurs inspections.
9. Améliore l’accessibilité, le tactile et la lisibilité des petites résolutions.
10. Étends les tests automatisés pour couvrir chaque nouveau système.

## Contraintes de qualité

- UI cohérente avec l’identité industrielle actuelle.
- Pas de texte tronqué dans les cartes principales.
- Pas de clic qui traverse une modale ou change de vue involontairement.
- Toutes les constructions doivent pouvoir être sélectionnées, réparées, améliorées et démolies.
- Les files doivent avoir une cause, une destination, une expiration et une conséquence visibles.
- Les besoins du personnel doivent provoquer des déplacements explicables.
- Les procédures doivent être évaluées contre les moyens physiques réels du Site.
- Les crises doivent pouvoir être gagnées ou perdues sans script arbitraire.
- L’économie doit rester jouable en campagne Standard.

## Validation obligatoire avant livraison

Exécute :

```bash
npm install
npm run build
npm run check
python tests/smoke.py
```

Ajoute des tests ciblés. Vérifie desktop 1600×1000 et mobile 430×932. Corrige toute erreur console, collision UI, sauvegarde corrompue ou régression de sélection.

## Livrables

- source complète mise à jour ;
- `dist/` publiable ;
- documentation actualisée ;
- changelog ;
- rapport QA ;
- captures des nouvelles fonctions ;
- archive ZIP cumulative avec SHA-256 ;
- aucun fichier temporaire, debug ou secret.

À la fin, résume précisément ce qui fonctionne, ce qui a été testé et les limites restantes. Ne présente jamais une intention de feuille de route comme une fonctionnalité déjà implémentée.
