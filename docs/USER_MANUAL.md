# Manuel du directeur de Site

## 1. Démarrer

Depuis l’écran titre, choisir **Nouvelle partie**, puis le mode et la difficulté. La campagne guide les déblocages ; le bac à sable rend tout disponible pour expérimenter.

Une nouvelle campagne démarre à vitesse normale. Utiliser les commandes de vitesse en haut à droite ou la barre d’espace ; ouvrir une modale opérationnelle met temporairement la simulation en pause sans écraser une pause décidée par le joueur.

## 2. Lire l’interface

La barre supérieure affiche crédits, énergie, eau, recherche, renseignement, état du Site, jour, heure et vitesse. La navigation gauche change de couche. Le panneau droit sert à construire, inspecter et agir. Sur mobile, **Détails/Masquer** ouvre explicitement ce panneau. La bande inférieure affiche l’objectif actif ou le statut du bac à sable.

## 3. Construire

1. Ouvrir la couche souhaitée.
2. Sélectionner une construction dans le catalogue droit.
3. Cliquer sur une zone libre de la grille.
4. Cliquer sur **Annuler** ou appuyer sur `Échap` pour quitter le mode construction.

Au clavier, focaliser le plan, déplacer le curseur avec les flèches, revenir au centre avec `Home`, puis valider avec `Entrée`. Une annonce discrète restitue la case ou le niveau de zoom aux technologies d'assistance.

Une construction impossible affiche immédiatement sa raison : crédits insuffisants, collision, technologie verrouillée ou niveau invalide.

## 4. Déplacer et zoomer

Maintenir le bouton ou le doigt puis glisser pour déplacer la caméra. Utiliser la molette pour zoomer. Au clavier, lorsque le Canvas est focalisé, `+`, `-`, `PageUp` et `PageDown` règlent le zoom sans modifier la vitesse. La sélection d’un élément ouvre ses statistiques et actions.

## 5. Région

Construire en priorité :

- centrale et traitement des eaux ;
- siège de couverture ;
- route, parking et dépôt ;
- logements pour soutenir le personnel ;
- checkpoint lorsque la suspicion augmente.

Surveiller la capacité électrique et hydraulique, pas seulement les réserves instantanées.

## 6. Surface

Une base fonctionnelle doit proposer : accueil, contrôle d’accès, administration, infirmerie, maintenance, entrepôt, laboratoire, salle de repos, réfectoire, sanitaires et ascenseur.

Les points colorés représentent le personnel. Les pastilles numériques sur les salles indiquent notamment les affectations ou files. Cliquer sur une salle pour voir état, propreté, capacité et personnel.

Une salle sans personnel requis peut exister mais fonctionne mal ou pas du tout. Les files non traitées peuvent expirer et déclencher des pénalités.

## 7. Personnel

Dans **Gestion**, ouvrir le volet Personnel pour recruter. Chaque candidat possède rôle, coût, compétences et traits.

Recommandation initiale :

- 2 chercheurs ;
- 3 gardes ;
- 2 ingénieurs ;
- 2 médecins ;
- 2 logisticiens ;
- 2 administratifs ;
- 1 directeur ;
- renforcer ensuite avec FTM.

Affecter les employés aux salles pertinentes. Les besoins de repos, nourriture et soin sont automatiques, mais exigent les infrastructures correspondantes. Organiser les rotations de jour et de nuit, terminer les formations engagées et lancer des vérifications ciblées lorsqu'une habilitation paraît compromise. Un contrôle justifié neutralise la menace ; un contrôle arbitraire a un coût humain et opérationnel.

## 8. Sous-sol

Commencer par une galerie excavée, un puits d’ascenseur et un tunnel de service. Ajouter ensuite sécurité, alimentation et cellule.

Les pièces profondes sont disposées par niveau. Les modules spéciaux, tels que le système acide ou le verrou temporel, nécessitent une recherche.

## 9. Transférer un SCP

1. Débloquer le dossier via la campagne ou le bac à sable.
2. Construire une cellule dont les tags, confinement et sécurité répondent aux exigences.
3. Sélectionner la cellule.
4. Choisir le SCP compatible dans le panneau.
5. Ouvrir son dossier et vérifier la procédure.

Un SCP contenu peut rester instable si la cellule est endommagée, sous-alimentée, mal pourvue ou insuffisamment surveillée.

## 10. Écrire une procédure

Dans Gestion ou depuis le dossier SCP, ouvrir l’éditeur. Les options avancées restent verrouillées tant que la recherche correspondante n'est pas terminée. La conformité augmente lorsque les exigences uniques sont respectées.

L'effectif prévu, la formation et la maintenance sont bornés par le risque du SCP. L'écran distingue l'effectif réellement affecté de la cible documentaire et recalcule la complexité au lieu d'accepter une valeur artificielle. Ne pas maximiser aveuglément toutes les options : la complexité représente le temps, la documentation et le risque d’erreur humaine. Les procédures sont versionnées après modification.

## 11. Recherche

Les recherches consomment les points accumulés par les centres de recherche et laboratoires profonds. Vérifier les prérequis. Les nœuds débloquent constructions, options de procédure ou bonus permanents. Une étude SCP arrivée à 100 % attribue une seule fois sa valeur de recherche et de connaissance.

Priorités sûres : réseaux redondants, maintenance prédictive, excavation profonde, puis spécialisation correspondant aux SCP prévus.

## 12. Crises

En crise, mettre en pause et lire chaque zone. Appliquer les ordres aux zones où ils ont le meilleur effet :

- verrouiller pour limiter les déplacements ;
- évacuer avant que le danger n’augmente ;
- restaurer l’énergie pour sauver les systèmes ;
- fermer la ventilation lors d’un biohazard ;
- déployer la FTM sur les menaces lourdes ;
- utiliser médical et décontamination après sécurisation ;
- protéger le Voile avec une réponse amnésique lorsque l’exposition est externe.

Les ordres ne sont pas gratuits. Une réponse trop large peut épuiser personnel et stocks.

## 13. Événements et inspections

Lire les effets annoncés, mais aussi leurs conséquences différées. Une inspection repoussée revient sous forme d'audit renforcé, les heures supplémentaires nocturnes augmentent temporairement le risque d'erreur, et une filature ou une dissimulation éthique finit par produire son résultat. Les anciennes sauvegardes reçoivent un horodatage de migration afin que ces effets ne deviennent jamais permanents.

## 14. Sauvegarder

Dans Gestion :

- **Sauvegarder** écrit la partie locale ;
- **Charger** restaure la sauvegarde manuelle ou automatique la plus récente ;
- **Exporter** télécharge un JSON ;
- **Importer** valide, normalise et migre un JSON compatible, puis le maintient en pause pour contrôle.

Conserver régulièrement un export externe avant une modification importante du projet.

## 15. Accessibilité, mobile et installation

- Tous les boutons, onglets, interrupteurs et modales principales sont utilisables au clavier ; `Tab` reste piégé dans une modale et le focus revient à son déclencheur à la fermeture.
- Les raccourcis globaux sont suspendus derrière l'écran titre, une modale ou lorsqu'un contrôle natif est focalisé.
- Les réglages proposent mouvements réduits, contraste renforcé, audio procédural, pause critique et conseils contextuels.
- Sur petit écran, les cinq ressources restent visibles et la feuille **Détails/Masquer** respecte la zone sûre inférieure.
- Une fois installée, la PWA met en cache le jeu, ses icônes ainsi que `ATTRIBUTION.md` et `LICENSE.md` pour consultation hors ligne.

## 16. Conseils avancés

- Dupliquer les fonctions critiques plutôt que construire un seul centre parfait.
- Éviter qu’un même couloir serve aux visiteurs, blessés et anomalies.
- Maintenir une réserve de pièces, médical et produits chimiques.
- Préparer la cellule avant d’accepter le transfert.
- Former les équipes de nuit, souvent moins nombreuses.
- Réparer avant qu’une crise ne transforme une panne mineure en brèche.
- Ne pas négliger la couverture : gagner la crise tout en brisant le Voile peut être une défaite stratégique.
