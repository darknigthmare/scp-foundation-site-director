# Rapport QA — version 1.0.0

**Date : 28 août 2026**  
**Build testé : `dist/`**

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
