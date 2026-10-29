# Changelog

## 2026-10-29 — Tranche Operations : accès de surface, base 1.0.0

### Accès et simulation

- Portes et sas placés sur les limites des salles, avec emplacement, habilitation, flux et sens de circulation.
- Itinéraires du personnel contraints par les accès réels, refus expliqué et recalcul après changement des conditions.
- Sas à une personne, file FIFO bornée, cycle admission/égalisation/sortie et compteur de passages terminés.
- Fermeture des deux portes et suspension du cycle lors des pannes électriques, d'air ou du verrouillage ; reprise après rétablissement.
- Évacuation manuelle du côté d'origine, sans traversée comptée, et protection contre la démolition d'un sas occupé.
- Paiement atomique, réglages gratuits et remboursement fondé sur le coût réellement payé.

### Sauvegardes, interface et distribution

- Migration des anciennes salles vers des entrées utilisables, conservation des identifiants et validation des files/cycles enregistrés.
- Éditeur accessible avec aperçu du mur, état des passages, occupant et échéance des demandes ; commandes sur mobile.
- Marqueurs des portes et des vantaux sur le plan, personnel centré dans les cases et représentation des files.
- Tests des accès, des pannes et de la reprise d'un sas en cours, en complément des tests existants.
- Cache PWA r7 ; génération CI d'un ZIP cumulatif avec sources, build, preuves navigateur et SHA-256.

Les salles redimensionnables, les trajets physiques souterrains et les flux autonomes de visiteurs/fret/SCP restent à développer. Cette tranche ne remplace pas une version plus récente éventuellement conservée hors de ce dépôt.


## 1.0.0 — 2026-08-28

### Jeu

- Ajout des quatre couches Région, Surface, Sous-sol et Commandement.
- Ajout du volet Gestion transversal.
- Ajout de la campagne en six directives et du bac à sable.
- Ajout des difficultés Histoire, Standard, Directeur et Keter.
- Ajout de 57 types de constructions répartis entre les trois couches.
- Ajout de 12 SCP avec exigences, transferts, procédures et règles uniques.
- Ajout du personnel individuel, de huit rôles, compétences, traits, besoins, salaires et formation.
- Ajout des files de service, de la maintenance, de la propreté, des stocks, de l’énergie et de l’eau.
- Ajout de l’arbre de recherche en douze nœuds.
- Ajout des événements à décisions.
- Ajout du système de crise à zones et neuf ordres tactiques.
- Ajout des réputations commandement, personnel, couverture et éthique, plus la suspicion.
- Ajout de la sauvegarde locale, autosauvegarde et export/import JSON.

### Interface

- Interface industrielle responsive.
- Navigation clavier `1–5`, espace, plus, moins et échappement.
- Caméra avec déplacement et zoom.
- Mode contraste renforcé, réduction des animations et audio désactivable.
- PWA et cache hors ligne.

### Technique

- TypeScript strict, build statique sans dépendance d’exécution.
- Validation structurelle et smoke test Chromium.
- Correction d’un conflit de propagation qui annulait la sélection Canvas lors d’un clic.
- Configuration Vercel et lanceurs locaux Windows/macOS/Linux.

