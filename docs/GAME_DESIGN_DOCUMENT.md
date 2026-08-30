# Game Design Document

# SCP Foundation: Site Director — Deep Protocol

**Version de référence : 1.0.0**  
**Genre :** city-builder, management sim, construction verticale, stratégie tactique avec pause  
**Plateforme actuelle :** navigateur desktop/tablette/mobile, PWA hors ligne  
**Perspective :** région isométrique, complexe de surface en plan de gestion, souterrain en coupe latérale, commandement abstrait tactique

---

## 1. Vision

Le joueur incarne le directeur d’un Site de la Fondation SCP. Sa responsabilité n’est pas seulement d’empiler des cellules : il doit créer une organisation cohérente capable de dissimuler son existence, de recruter et protéger son personnel, de réceptionner des anomalies inconnues, de rédiger des procédures crédibles et de survivre lorsque plusieurs systèmes échouent simultanément.

Le jeu repose sur une idée centrale : **une brèche n’est presque jamais causée par un seul monstre, mais par une chaîne de petites décisions organisationnelles**. Un quai mal placé surcharge un sas. Une file retarde une relève. Une relève tardive réduit l’observation. Une panne secondaire rend alors une procédure théoriquement parfaite impossible à appliquer.

Le plaisir vient de trois phases complémentaires :

1. concevoir un Site élégant et efficace ;
2. observer son fonctionnement quotidien et corriger les goulots ;
3. constater, lors d’une crise, si l’architecture et les procédures résistent réellement.

---

## 2. Piliers de conception

### 2.1 Le confinement est un système, pas une barre de vie

Chaque SCP impose une combinaison de géométrie, sécurité, ressources, surveillance, compétences, règles de personnel et décisions éthiques. La classe d’objet ne remplace pas l’analyse de ces besoins.

### 2.2 Les quatre couches doivent s’influencer

La ville et la couverture alimentent le Site. Le complexe de surface prépare les hommes, le matériel et les anomalies. Le souterrain exécute les confinements. Le commandement arbitre les urgences. Aucun mode ne doit fonctionner comme un mini-jeu isolé.

### 2.3 Les flux sont du gameplay

Les personnes, blessés, caisses, anomalies, déchets, informations et ordres suivent des parcours. Les files et croisements créent des risques réels. La proximité n’est pas toujours positive : centraliser améliore la productivité mais réduit la redondance.

### 2.4 Le joueur écrit ses propres procédures

Une procédure doit être suffisante, applicable et compréhensible. Ajouter toutes les précautions augmente la conformité théorique mais aussi la complexité, les coûts et les erreurs humaines.

### 2.5 L’horreur naît de la simulation

Le jeu privilégie les signaux faibles : un badge utilisé à une heure anormale, une voix non authentifiée, une baisse de pression, une salle oubliée sur le plan, un technicien qui ne revient pas. Les crises spectaculaires sont la conséquence visible d’une situation déjà dégradée.

---

## 3. Structure globale

### 3.1 Région

Vue de dessus en perspective consacrée à la couverture et aux grandes infrastructures.

Responsabilités :

- choisir la façade publique du Site ;
- construire routes, parkings, logements et accès sécurisés ;
- fournir énergie et eau ;
- recevoir des stocks et évacuer les déchets ;
- maintenir une crédibilité publique ;
- limiter la suspicion des autorités, journalistes et riverains ;
- préparer les moyens de transport des équipes et convois.

Variables principales : couverture, suspicion, entretien, capacité énergétique, eau, production de fournitures et coût journalier.

### 3.2 Complexe de surface

Vue rapprochée inspirée des jeux de gestion hospitalière. Le joueur dessine le fonctionnement interne du Site de surface : contrôle des accès, administration, médical, recherche, réception des anomalies, sécurité et vie quotidienne.

Responsabilités :

- placer les salles et couloirs ;
- équilibrer capacité, personnel, propreté et maintenance ;
- éviter les files ;
- séparer les flux propres, contaminés, publics et classifiés ;
- recruter, former et affecter les employés ;
- analyser les anomalies avant transfert ;
- assurer la relève des équipes profondes ;
- préparer les interventions.

### 3.3 Niveaux inférieurs

Vue latérale en coupe. Le joueur excave plusieurs niveaux et installe les cellules, services techniques et redondances.

Responsabilités :

- creuser galeries et puits ;
- choisir la profondeur adaptée ;
- construire les cellules par spécialité ;
- distribuer énergie, air, accès et sécurité ;
- transférer chaque SCP vers un module compatible ;
- surveiller la conformité des procédures ;
- isoler ou sacrifier des zones pendant une brèche.

### 3.4 Commandement

Vue tactique synthétique pendant les exercices et incidents.

Responsabilités :

- mettre le temps en pause ;
- lire l’état des zones et les menaces ;
- verrouiller, évacuer, décontaminer ou restaurer ;
- déployer sécurité, médecins ou FTM ;
- protéger le Voile et l’intégrité du Site ;
- accepter que certaines décisions déplacent le risque plutôt qu’elles ne le suppriment.

### 3.5 Gestion

Interface transversale pour les dossiers, le personnel, la recherche, les finances, les sauvegardes et les paramètres.

---

## 4. Boucle de jeu principale

1. Lire la directive et les objectifs actifs.
2. Développer les infrastructures régionales nécessaires.
3. Construire ou optimiser les services de surface.
4. Recruter et former les rôles manquants.
5. Excaver et préparer une cellule compatible.
6. Recevoir ou débloquer un dossier SCP.
7. Transférer l’anomalie.
8. Configurer sa procédure.
9. Produire de la recherche et stabiliser le quotidien.
10. Répondre aux événements, inspections et crises.
11. Étudier le rapport, améliorer le Site et débloquer la directive suivante.

La boucle courte dure quelques minutes : placer une salle, affecter un employé, résorber une file. La boucle moyenne correspond à la préparation et au transfert d’un SCP. La boucle longue couvre une directive entière, avec montée en profondeur, sophistication des réseaux et pression accrue du commandement.

---

## 5. Construction régionale

### 5.1 Grille et emprise

Chaque installation possède une emprise, un coût initial, un entretien, un niveau, un état et des effets. Le placement est libre sur la grille visible. Les installations peuvent être sélectionnées, améliorées, réparées ou démolies.

### 5.2 Couverture

La couverture mesure la crédibilité et la maîtrise du récit public. Elle est améliorée par les bâtiments cohérents, la clinique, les bureaux ou les zones paysagères. Elle diminue après une mauvaise inspection, une crise visible ou une accumulation d’infrastructures manifestement militaires.

### 5.3 Suspicion

La suspicion représente l’attention hostile. Elle n’est pas l’inverse exact de la couverture : un Site peut avoir une façade crédible tout en étant activement surveillé par un Groupe d’intérêt.

### 5.4 Réseaux

Énergie et eau possèdent chacune une capacité et une charge. Une installation peut produire des ressources mais aussi introduire un point de défaillance. Les décisions d’urgence peuvent restreindre l’alimentation à certains secteurs.

### 5.5 Logistique

Le dépôt, le terminal ferroviaire et les accès routiers améliorent la production ou l’arrivée de nourriture, pièces, produits chimiques, matériel médical et munitions. Le jeu simule ces ressources à l’échelle stratégique plutôt que camion par camion dans la version 1.0.

---

## 6. Gestion du complexe de surface

### 6.1 Salles

Chaque salle possède :

- taille et capacité ;
- coût et entretien ;
- consommation d’énergie et d’eau ;
- niveau de sécurité et confinement ;
- rôles requis ;
- services fournis ;
- file de travail ;
- état, propreté et priorité électrique ;
- personnel affecté et améliorations.

### 6.2 Services

Les services couvrent l’accès, le soin, la quarantaine, la décontamination, l’intake, l’analyse, la recherche, la restauration, le repos, les sanitaires, la maintenance, l’entreposage, la sécurité, la formation et le commandement.

### 6.3 Files d’attente

Des tâches sont générées par le temps, les événements ou les crises. Une salle capable de fournir le service les traite selon sa capacité, son personnel, son état et son alimentation. Une file trop longue fait expirer des tâches et produit stress, contamination, perte de réputation ou incidents.

### 6.4 Flux humains

Chaque employé possède une position et un statut. Les besoins augmentent avec le travail : fatigue, faim, stress et contamination. Le personnel recherche les services nécessaires, attend, se déplace et revient à son affectation.

### 6.5 Maintenance et propreté

L’état des salles se dégrade. Les ingénieurs utilisent des pièces pour réparer. La propreté se dégrade avec l’activité, les patients et les anomalies. Une salle sale augmente les risques biologiques et l’inefficacité.

### 6.6 Diagnostic des anomalies

La réception, l’analyse et la recherche représentent le triage d’une anomalie nouvelle. La version 1.0 abstrait les étapes sous forme de files et de progression, tout en laissant la structure ouverte à un futur système de diagnostic multi-salles plus détaillé.

---

## 7. Personnel

### 7.1 Rôles

- Directeur : bonus de coordination et gouvernance.
- Chercheur : recherche et procédures.
- Garde : sécurité, contrôle et réponse initiale.
- Ingénieur : maintenance et réseaux.
- Médecin : soins, quarantaine et décontamination.
- Logistique : stocks, intake et entrepôts.
- Administration : habilitations, dossiers et couverture.
- FTM : réponse aux crises majeures.

### 7.2 Compétences

Recherche, sécurité, ingénierie, médecine, logistique, administration et mémétique. Les valeurs individuelles modifient la vitesse de service, la réussite et la résistance à certaines menaces.

### 7.3 Traits

Les traits créent des profils tels que Méthodique, Courageux, Curieux, Empathique, Paranoïaque, Calme, Distrait ou Loyal. Ils modifient besoins, efficacité, stress ou probabilité de comportement risqué.

### 7.4 Habilitation

Chaque employé possède un niveau de 0 à 5. Les postes sensibles, SCP et recherches requièrent des seuils. La connaissance et l’accès physique sont modélisés ensemble dans la version 1.0, mais sont séparables dans l’architecture future.

### 7.5 Formation

Les centres de formation consomment du temps et des ressources pour augmenter expérience, habilitation ou compétence. La formation requise par les procédures réduit le risque humain.

### 7.6 Compromission

Un employé peut devenir compromis lors d’un événement d’infiltration ou d’exposition. Les systèmes de renseignement, authentification et sécurité influencent la détection.

---

## 8. SCP et procédures

### 8.1 Données d’un SCP

Chaque définition contient : désignation, nom, classe, risque, disruption, valeur de recherche, effet moral, tags de salle, confinement minimal, sécurité minimale, fiabilité électrique, personnel requis, consommables et drapeaux de procédure.

### 8.2 Compatibilité de cellule

Un transfert n’est autorisé que vers une pièce souterraine compatible. La qualité finale dépend ensuite de l’état de la cellule, de l’alimentation, du personnel, des fournitures et de la procédure.

### 8.3 Éditeur de procédure

Le joueur règle notamment :

- niveau d’observation ;
- effectif assigné ;
- fréquence de maintenance ;
- alimentation de secours ;
- sauvegarde analogique ;
- biométrie ;
- surveillance optique ;
- verrouillage automatisé ;
- soins humains ;
- restrictions de tests ;
- réseau isolé ;
- ventilation redondante ;
- niveau de formation ;
- notes opérationnelles.

### 8.4 Conformité et complexité

La conformité compare les réglages aux besoins du SCP et à la situation réelle. La complexité augmente avec les options. Une procédure très complète peut devenir lente et coûteuse. L’objectif d’équilibrage est de rendre le meilleur protocole contextuel, pas universel.

### 8.5 Règles uniques livrées

- **SCP-173** : observation, personnel et continuité électrique.
- **SCP-096** : interdiction de surveillance optique, réseau isolé et gestion infohazard.
- **SCP-049** : confinement humanoïde, soins coopératifs, restrictions de test et risque biologique.
- **SCP-106** : confinement lourd, entretien, corrosion et besoin de redondance.
- **SCP-939** : biométrie hors réseau, imitation vocale et sécurité biologique.
- **SCP-914** : anomalie utilisable, recherche et tests réglementés.
- **SCP-294** : bénéfices de recherche/logistique et contrôle d’accès.
- **SCP-682** : système acide, consommation massive et confinement Keter.
- **SCP-999** : besoins simples, effet positif sur le moral et soins humains.
- **SCP-131** : faible coût et potentiel d’assistance à l’observation.
- **SCP-087** : anomalie spatiale, exploration, sécurité et profondeur.
- **SCP-008** : confinement biologique, quarantaine, décontamination et ventilation.

---

## 9. Économie et ressources

### 9.1 Ressources

Crédits, énergie, capacité électrique, eau, capacité hydraulique, nourriture, médical, pièces, produits chimiques, munitions, renseignement et recherche.

### 9.2 Revenus et coûts

Le budget combine dotation de commandement, efficacité de la couverture et coûts du Site. Les dépenses quotidiennes incluent salaires, entretien, SCP et événements. Un déficit prolongé dégrade entretien, moral et réputation de commandement.

### 9.3 Priorités

Les salles et modules possèdent une priorité électrique. Une crise peut forcer le délestage. Le joueur doit décider si l’énergie restante protège les cellules, le médical, les communications ou les ascenseurs.

---

## 10. Recherche

Les douze nœuds forment un arbre court mais interconnecté : réseaux redondants, excavation profonde, confinement adaptatif, doctrine Keter, protocoles biologiques, filtrage mémétique, disponibilité FTM, authentification hors réseau, verrouillage automatisé, confinement coopératif, maintenance prédictive et ingénierie temporelle.

La recherche débloque des constructions, améliore la simulation ou réduit certains risques. Les nœuds de fin exigent plusieurs prérequis pour éviter une progression purement linéaire.

---

## 11. Événements

Les événements sont présentés comme des dossiers avec plusieurs décisions. Ils touchent la logistique, la couverture, les besoins du personnel, l’éthique, les ressources, les files et les crises.

Exemples livrés :

- convoi arrivé trop tôt ;
- inspection publique ;
- fatigue de l’équipe de nuit ;
- pénurie de fournitures ;
- indice d’infiltration ;
- audit éthique ;
- panne de réseau ;
- patient inconnu.

Un choix peut résoudre le problème immédiat tout en créant une menace différée.

---

## 12. Crises

### 12.1 Déclenchement

Les crises peuvent venir d’un SCP, d’un événement, d’une défaillance structurelle ou d’un exercice volontaire. Les difficultés élevées augmentent la fréquence et la sévérité.

### 12.2 Zones

Le Site est découpé en zones synthétiques avec intégrité, danger, contamination, population et contrôle. Les ordres consomment du temps, des agents ou des ressources.

### 12.3 Ordres

Verrouillage, évacuation, sécurité, FTM, restauration électrique, décontamination, réponse médicale, fermeture de ventilation et réponse amnésique.

### 12.4 Conditions de résolution

Une crise se termine lorsque les menaces sont contrôlées ou lorsque l’intégrité, le Voile ou la population passent sous des seuils critiques. Le résultat influence campagne, réputation, ressources et historique.

### 12.5 Rapport

Le jeu conserve notifications et historique. Une future version ajoutera une chronologie visuelle complète et une relecture des déplacements.

---

## 13. Campagne

### Directive 00 — La couverture

Construire la façade, le cœur opérationnel et une première équipe.

### Directive 01 — Premier confinement

Contenir une anomalie, atteindre une procédure conforme et produire de la recherche.

### Directive 02 — Site vivant

Stabiliser le personnel, les files et les réseaux.

### Directive 03 — Rupture contrôlée

Résoudre une crise majeure, préparer la FTM et protéger le Voile.

### Directive 04 — La guerre invisible

Développer renseignement, compartimentation et légitimité interne.

### Directive 05 — Deep Protocol

Atteindre la profondeur stratégique, construire un verrou terminal et stabiliser un Keter.

---

## 14. Modes et difficultés

### Campagne

Objectifs ordonnés, déblocages et progression structurée.

### Bac à sable

Tout le catalogue de recherche et de construction est disponible. Les exercices permettent de tester une architecture librement.

### Difficultés

- **Histoire** : économie généreuse et incidents modérés.
- **Standard** : équilibre prévu.
- **Directeur** : ressources serrées et erreurs plus coûteuses.
- **Keter** : crises fréquentes, faible tolérance et pression systémique maximale.

---

## 15. UX et accessibilité

- navigation permanente entre les couches ;
- panneau contextuel qui rassemble sélection et catalogue ;
- code couleur accompagné de texte et icônes ;
- interface responsive ;
- option contraste renforcé ;
- réduction des animations ;
- audio désactivable ;
- pause automatique des crises critiques ;
- raccourcis de navigation et vitesse ;
- objectifs visibles sans ouvrir un menu.

---

## 16. Direction artistique et sonore

Le rendu utilise une esthétique industrielle, institutionnelle et brutaliste : gris froids, interfaces documentaires, accent vert de sécurité, rouge d’alerte et typographie système très lisible. Les salles sont codées par fonctions, les agents par rôle et les anomalies par symboles abstraits.

Le son est procédural : clics, notification et alarme générés par Web Audio. Aucun fichier audio externe n’est requis. Le futur mixage pourra ajouter ventilation, portes, générateurs et annonces contextuelles.

---

## 17. Équilibrage

Les paramètres majeurs à surveiller sont :

- vitesse de génération et traitement des files ;
- coût journalier du personnel ;
- dégradation des salles ;
- disponibilité des pièces et produits chimiques ;
- rendement de recherche ;
- pénalité de complexité des procédures ;
- fréquence des événements ;
- poids des réputation et suspicion ;
- puissance relative des ordres de crise.

Les données sont centralisées dans `src/data.ts` et la logique dans `src/simulation.ts`, afin de permettre un équilibrage sans réécrire l’interface.

---

## 18. Définition de « version complète » pour ce build

La version 1.0 possède une boucle démarrage-développement-confinement-crise-fin de campagne, des états de victoire/défaite, une sauvegarde et suffisamment de contenu pour plusieurs styles de Site. Elle constitue donc un jeu de gestion autonome, et non une maquette statique.

Les limites assumées sont le rendu 2.5D, l’absence de multijoueur, le nombre volontairement limité de SCP entièrement personnalisés et l’abstraction des convois extérieurs. Ces éléments sont documentés dans la feuille de route plutôt que simulés superficiellement.
