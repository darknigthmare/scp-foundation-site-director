# Validation — navigation, sauvegardes et cartes mobiles

Date : 29 octobre 2026.

## Sources et preuves

- Dépôt : `darknigthmare/scp-foundation-site-director`.
- Branche : `fix/gamedev-skills-foundation-20261029`, PR #1.
- Commit source testé : `7ab984ec0bdbcb40ec56c3226bb5ab6675c63ae1`.
- [Exécution GitHub Actions complète](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/40919804961).
- Build : artefact `scp-build` n°12918051305.
- Captures et rapport : artefact `scp-browser-smoke` n°12918240994.
- Rapport machine conservé dans [browser-report.json](browser-report.json).

## Résultats exécutés

| Contrôle | Résultat |
| --- | --- |
| Installation depuis package-lock.json | Réussie sur GitHub Actions |
| Compilation TypeScript stricte et assemblage dist | Réussis |
| Tests core + navigation | 42 réussis, 0 échec |
| Validation structurelle du build | Réussie |
| Parcours Chromium sur le build servi par HTTP | 13 étapes réussies |
| Console et exceptions du navigateur durant le parcours | Aucun message collecté |
| Rechargement HTTP avec sauvegarde native | Progression conservée |
| Fermeture complète puis redémarrage de Chromium | Progression conservée |
| Reprise hors ligne par le service worker | Progression conservée |
| Vue mobile 430 × 932 | Aucun débordement horizontal ; textes des cartes de crise dans leurs limites |

Le parcours desktop utilise une fenêtre 1600 × 1000. Les 13 étapes couvrent le
démarrage, une partie bac à sable, les constructions Région/Surface/Sous-sol, le
transfert d'un SCP, la gestion et les procédures, la sauvegarde/charge, les trois
reprises, un ordre de crise et le mobile.

Les reprises comparent l'état actif re-sauvegardé après chargement, notamment
ressources, temps, bâtiments, salles, identités/positions/besoins du personnel,
SCP, procédures, recherches et chapitre. Le stockage n'est plus simulé par un
objet JavaScript en mémoire.

## Régressions couvertes

- Sortie de la salle d'origine et retour au poste après un service.
- Contournement des empreintes occupées et recalcul pendant un déplacement.
- Choix d'une salle de service atteignable ; arrêt et reprise après fermeture.
- Ancien trajet importé recalculé avant usage ; coordonnées et extrémités bloquées.
- Salle fermée prioritaire sur un couloir superposé ; sortie possible de son occupant.
- Réduction des animations sans effet sur un déplacement réel.
- Personnel affecté et patients effectivement arrivés avant progression des files.
- Échéance conservée lorsqu'une demande de soins change de salle.
- Import refusé pour des collections ou valeurs imbriquées malformées ; aucun
  remplacement silencieux de l'équipe par celle d'une nouvelle partie.
- Valeurs manquantes compatibles complétées, ressources et identifiants conservés,
  autre emplacement chargé si le plus récent est invalide.
- Noms complets des zones de crise répartis sur plusieurs lignes, sans recouvrir
  la carte voisine ; contrôle des glyphes réellement dessinés dans Chromium.

## Intégrité du build livré

Les fichiers compilés sont recopiés depuis l'artefact CI vérifié, sans modification
manuelle du JavaScript généré.

| Fichier | SHA-256 |
| --- | --- |
| `dist/game.js` | `1a6b09250df5db9bd50633cee60a2b3f55f6866c89874aebd58032f43e01e46c` |
| `dist/service-worker.js` | `b69ec0d68710d51c8a07853d9cb8c3cd317519a31287ccf717cefc2b775dc3d8` |

SHA-256 de l'archive CI du build :
`7af8a9d0f453cdd41efd46d94f188d99efc56be13b825bcb2a3a566a63785773`.

Le manifeste `SHA256SUMS.txt` historique conserve sa fonction de provenance de
l'archive d'origine, telle que décrite dans `SOURCE_PROVENANCE.md`.

## Limites

Ces résultats portent sur Chromium Linux et un viewport mobile simulé, sans
validation d'un iPhone/Safari physique. Le scénario de compatibilité 0.9.0 est
une fixture de migration ; il ne représente pas un audit de toutes les archives
historiques.

Les entrées/sorties reposent encore sur les empreintes des salles. L'éditeur de
portes/sas, les habilitations sur les passages, les itinéraires souterrains
physiques et une campagne complète restent à traiter. La simulation et les
transferts souterrains abstraits existants sont conservés.

La base du dépôt reste la version 1.0.0. Ce lot ne constitue pas une annonce de
livraison de toute la version Operations et ne résout pas la comparaison avec
d'éventuelles versions de projet plus récentes hors de ce dépôt.
