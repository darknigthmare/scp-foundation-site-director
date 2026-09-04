# Rapport QA — version 1.0.0

## Passe de publication — 4 septembre 2026

**Résultat local et production : réussi.** Le bundle courant a été testé dans un vrai navigateur à 1280 × 720 et 390 × 844, puis sous réseau bloqué après prise de contrôle du service worker. Le commit jeu `9518fd2` a été poussé sur `main` et déployé explicitement sur l'alias public.

| Étape | Résultat vérifié |
|---|---|
| `npm test` | Réussi : build TypeScript, 12/12 tests métier, validation structurelle |
| `tsc --noEmit` | Réussi en mode strict |
| `npm audit --audit-level=high` | 0 vulnérabilité |
| Syntaxe bundle, service worker et serveur | Réussie avec `node --check` |
| Desktop 1280 × 720 | Création, pause, navigation, grille/zoom clavier, Gestion, sauvegarde/import, recherche et crise réussis |
| Mobile 390 × 844 | 5 ressources visibles, largeur 390/390, navigation accessible, feuille Détails ouverte/fermée |
| Axe WCAG 2 A/AA | 0 violation desktop et mobile ; 1 contrôle incomplet car les fonds sont des dégradés |
| Console / erreurs page | Aucun message, aucune erreur |
| PWA r4 | Contrôleur actif, cache unique r4, démarrage sous réseau bloqué réussi |
| Licence hors ligne | `ATTRIBUTION.md` et `LICENSE.md` lus avec succès depuis le cache |
| Web Vitals local | TTFB 3 ms, FCP/LCP 1 648 ms, CLS 0 |
| HTTP local | Assets distribués en 200 ; `.env`, `.git/config`, sources, docs internes et source map en 404 ; traversées encodées/malformées en 400 |
| Vercel production | Déploiement `dpl_9P9ryQ7adVRtQCaCUZmv6RDFzCiy` en état Ready, alias `scp-foundation-site-director.vercel.app` |
| HTTP production | Racine, manifeste, SW, PNG et documents légaux en 200 ; chemins sensibles et source map en 404 ; traversal encodé en 400 |
| Headers production | CSP avec `object-src 'none'`, anti-framing, `nosniff`, Referrer-Policy, Permissions-Policy et HSTS présents |
| Navigateur production | Nouvelle campagne, pause, Surface desktop et mobile 390/390 réussies ; console et erreurs vides ; Axe 0 violation |
| PWA production hors ligne | Contrôleur r4 actif, cache légal présent, rechargement et lecture d'attribution réussis sous réseau bloqué |
| Web Vitals production | TTFB 12,6 ms, FCP/LCP 1 820 ms, CLS 0 |

Les 12 non-régressions métier couvrent : objectif initial, sauvegarde la plus récente, exclusion des salles support, cellule Keter renforcée pour SCP-682, ordre de crise sans paiement fantôme, migration partielle simulable, expiration des anciens effets différés, premier transfert/relocalisation, verrouillage et minima des procédures, file médicale unique, stabilité Keter pendant 1 440 minutes consécutives et neutralisation d'une compromission interne.

Captures acceptées sur le bundle courant :

- [Surface desktop](qa/2026-09-04/06-surface-final.png)
- [Gestion et sauvegarde](qa/2026-09-04/11-management-release.png)
- [Exercice de crise](qa/2026-09-04/12-crisis-release.png)
- [Région mobile](qa/2026-09-04/16-mobile-region-release.png)
- [Feuille Détails mobile](qa/2026-09-04/17-mobile-panel-open-release.png)
- [Surface sur l'alias production](qa/2026-09-04/19-production-surface.png)
- [Mobile sur l'alias production](qa/2026-09-04/20-production-mobile.png)

## Preuve historique — 28 août 2026

**Date : 28 août 2026**  
**Build testé : ancien `dist/`**

## Résultat global

**Réussi.** Le build TypeScript compile sans erreur, la validation structurelle passe et le smoke test navigateur couvre la boucle principale.

## Matrice exécutée

| Étape | Résultat |
|---|---|
| Chargement de l’écran titre | Réussi |
| Création d’une partie bac à sable | Réussi |
| Construction réelle en Région | Réussi |
| Construction réelle en Surface | Réussi |
| Construction réelle en Sous-sol | Réussi |
| Transfert d’un SCP vers une cellule compatible | Réussi |
| Ouverture Gestion, recrutement, recherche et modification de procédure | Réussi |
| Sauvegarde et rechargement | Réussi |
| Déclenchement d’une crise et ordre tactique | Réussi |
| Responsive mobile 430 × 932 | Réussi |
| Erreurs JavaScript console/page | Aucune |

Rapport machine : `tests/smoke-report.json`.

## Vérification de placement

Les crédits ont réellement diminué, ce qui confirme que le test n’a pas seulement changé de vue :

- Région : 72 k → 65,5 k ;
- Surface : 65,5 k → 63,7 k ;
- Sous-sol : 63,7 k → 62,5 k.

## Captures

- `tests/start.png`
- `tests/region.png`
- `tests/region-built.png`
- `tests/surface.png`
- `tests/underground.png`
- `tests/scp-contained.png`
- `tests/management.png`
- `tests/crisis.png`
- `tests/mobile.png`

## Défaut important corrigé

Le `body` utilisait `data-view` pour le style. Le gestionnaire de clic délégué recherchait auparavant tout ancêtre `[data-view]`, ce qui faisait remonter un clic Canvas jusqu’au `body`, rappelait `setView` et annulait immédiatement la sélection. La correction :

- limite les boutons de navigation à `#left-nav [data-view]` ;
- limite la délégation à `button[data-view]` ;
- conserve le `data-view` du `body` uniquement pour le CSS.

Cela a fiabilisé sélection, amélioration, réparation, démolition et transfert SCP.

## Limitation de l’environnement de test

L’environnement Chromium utilisé pour la validation bloque la navigation vers les origines locales et réseau par politique administrateur. Le smoke test charge donc le HTML/CSS/JS compilé dans une page contrôlée. Pour tester les sauvegardes sur cette origine opaque, il injecte une implémentation mémoire de `localStorage` uniquement dans le test. Le code de production utilise le véritable `localStorage` lorsqu’il est servi normalement par `npm start` ou un hébergeur.

## Commandes de reproduction

```bash
npm install
npm run build
npm run check
python tests/smoke.py
```

## Checklist manuelle recommandée avant publication commerciale

- campagne complète sur chaque difficulté ;
- session de plusieurs heures pour surveiller les dérives économiques ;
- test de migration depuis chaque ancienne version de sauvegarde ;
- Safari iOS, Firefox, Chrome Android et Edge ;
- lecteur d’écran et navigation clavier approfondie ;
- reprise après mise en veille mobile ;
- test PWA installé et mise à jour du cache ;
- audit juridique final des ajouts de contenu ou médias.
