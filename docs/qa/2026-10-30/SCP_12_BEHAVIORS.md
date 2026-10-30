# QA — réactions opérationnelles des 12 SCP intégrés

**Date :** 30 octobre 2026. **Base :** v1.0.0, tranche Operations.

## Implémenté

- Douze profils SCP et 36 scénarios de panne physique, couvrant électricité, eau et ventilation. Effets distincts sur conformité, pression de brèche horaire, instrumentation et progression des recherches.
- SCP-914 : ressort mécanique toujours actif malgré panne de courant, essais instrumentés suspendus ; gains de pièces uniquement après une expérience autorisée, payée et surveillée.
- SCP-294 : production anormale distincte du réseau d'eau du Site, mais requêtes autorisées sous deux gardes habilités et consommations contrôlées.
- SCP-008 : aucune transmission automatique par l'eau ou l'air ; traitement du personnel et quarantaine restent conditionnés aux systèmes sanitaires.
- SCP-682 : alimentation acide via gaines contiguës et système opérationnel ; un bassin isolé au même étage n'est plus reconnu.
- SCP-999 : effets positifs limités aux personnes présentes et autorisées. SCP-131 : recensement chaque heure et assistance à SCP-173 uniquement à l'aplomb réel.
- SCP-173 : supervision humaine et portes ; 096 : interdiction d'optiques ; 049 : soins coopératifs ; 106 : usure corrosive ; 939 : communications authentifiées ; 087 : explorations interdites.
- Intervention spécifique pour chaque SCP, coût atomique, personnel présent, recherche d'habilitation, délai de réutilisation et indicateur visible en jeu.
- Alertes sur transition d'état sans inonder la console de notifications, rétablissement signalé ; compteurs d'action et recensement conservés dans les anciens champs de sauvegarde (schéma 6).

## Tests

- Local : **216 tests métier réussis sur 216**, compilation TypeScript stricte et validation structurelle réussies.
- **CI du commit fonctionnel :** [GitHub Actions #41077190018](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41077190018) **réussie**, **216/216 tests métier**, **23/23 étapes Chromium**, **aucun message d'erreur navigateur**. Le parcours `SCP-131 : diagnostic individuel, réponse et délai de réutilisation` est passé avec sauvegarde et reprise du jeu.
- **[Build testé](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41077190018/artifacts/12987456840)**, **[captures et rapport Chromium](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41077190018/artifacts/12987581839)** et **[paquet cumulatif compilé](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41077190018/artifacts/12987591786)**.
- L'archive intérieure `scp-builder-operations-scp-12-behaviors.zip` contient **132 entrées**, dont **131 objets validés par leur manifeste SHA-256** ; aucune erreur ZIP. SHA-256 de l'archive intérieure : `604c01623ac6974337236fb8ce94fe492f8dab5deafe8fba7c662f152f79b8a2`. SHA-256 de `dist/game.js` : `0b31ef9dfc0862b687a7b3b6a6553c309cd40fde738cc935a5bcda9765e5bf04`.
- L'artefact publié par ce pipeline est lié à son commit de fusion temporaire `0c1480d...` ; cela **n'indique pas que la PR #2 a été fusionnée dans main**. L'actualisation ultérieure du présent rapport QA constitue un nouveau commit documentaire sans modification fonctionnelle et sera revérifiée par une nouvelle CI.

## Portée non couverte

Le moteur différencie les procédures et réseaux, mais **n'implémente pas** une IA 3D par SCP, la reproduction intégrale des environnements des récits, les sous-dimensions 106/087, les séquences détaillées de toutes les expériences 914/294, la pathologie moléculaire de SCP-008 ou une véritable ligne de vue 3D SCP-173. Ces manques ne doivent pas être déclarés fidèles 1:1.

Le [catalogue détaillé](../../SCP_GAMEPLAY_COVERAGE.md) contient les effets des pannes et les liens primaires vers les douze dossiers SCP.
