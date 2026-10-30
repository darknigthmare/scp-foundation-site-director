# Game development skill workflow — SCP Site Director

Reference: https://github.com/gamedev-skills/awesome-gamedev-agent-skills

## Rules
- Preserve the four linked views and authoritative GameState.
- Keep TypeScript strict and offline/PWA support.
- For movement use game-ai: validate obstacles and access rights; never route through closed zones.
- For accessibility use game-ui-ux: reduced motion must not change simulation outcomes.
- For save changes use save-systems: version checks, migrations, old-save regression tests.
- For performance use performance-optimization: measure before optimizing.
- Before merging run npm test, browser smoke test, save/load and responsive checks. Record actual results, never claim unrun tests passed.

## First corrections to implement
1. Make reduced-motion a rendering-only setting; staff movement must use identical simulation speed.
2. Add obstacle-aware routing with explicit unreachable state and tests.
3. Reject unsupported newer saves safely, preserve older saves and test migrations.

## Release integrity
The GitHub main branch reports v1.0.0; later versions discussed elsewhere must be compared and reconciled before updating release claims.

## Applied continuation: routing, saves and browser evidence

The implementation keeps the existing TypeScript/Canvas engine and the shared
GameState. The relevant upstream references are
[game-ai](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/game-ai/SKILL.md)
and [save-systems](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/save-systems/SKILL.md).

- `planSurfaceRoute` is a pure route calculation: `undefined` means unreachable,
  an empty path means already at the destination, and waypoints describe a route.
  Staff can leave their origin room; other occupied footprints remain obstacles.
  The arrival cell stays inside the destination, including one-cell rooms.
- Route metadata lives in a WeakMap, outside saved GameState. A changed room
  footprint, enabled state, destination or imported state causes a new plan.
  Failed searches are throttled and immediately invalidated by a map change.
- Staff choose a reachable food, rest or treatment destination. Closed/deleted
  destinations stop movement. Room work requires present, working personnel;
  treatment requests with a staff identifier wait for the patient's arrival.
  Moving a treatment request preserves its original deadline.
- Imported collections, nested records, numeric values, geometry and version
  components are checked before normalization. Supported historical omissions
  receive defaults; malformed present values reject the import rather than
  replacing whole collections with a new game. Camera defaults merge per view.
- The PWA cache revision is refreshed alongside the gameplay sources.
- Crisis-card names wrap within their measured width, with a shared header
  height and separate status badges. Hit-testing uses the same card geometry.

### Verification commands and evidence

`npm ci && npm test` compiles with the locked TypeScript toolchain, executes all
`tests/*.test.mjs`, and checks the build.
`python -m pip install playwright==1.56.0` and
`python -m playwright install --with-deps chromium` prepare the browser test;
then run `python tests/smoke.py` against the compiled game.

The browser test serves the actual build over HTTP. It uses native browser
storage and a persistent profile to verify page reload, complete browser restart
and offline PWA resume, as well as construction, SCP transfer, management,
crisis commands and the 430 x 932 mobile layout. The mobile check also measures
the actual Canvas text bounds and requires the full zone names, catching
overlapping or truncated labels inside cards. Results and screenshots are
written to `test-results/smoke/`, including failure evidence. CI uploads
`scp-build` and `scp-browser-smoke`; inspect the run for the exact commit before
claiming success.

### Scope still open

The door/airlock editor and clearance-aware surface passages are now implemented.
Full underground itineraries, freely drawn rooms and autonomous public/cargo/SCP
traffic remain separate work. The existing abstract underground transfer is
preserved. This tranche does not establish that the planned Operations release
is complete, and does not replace testing against authentic historical release
archives or physical devices.


Recorded execution evidence: [routing/save/mobile QA](qa/2026-10-29/ROUTING_SAVE_MOBILE.md).

## Applied continuation: real surface accesses

- Door thresholds are grid edges. Route planning and actual movement use the same
  permission rules: clearance, traffic profile, direction and operational state.
- Airlocks admit a single occupant from a bounded FIFO. Their persisted phases
  never permit both leaves open, freeze on power/air failure and resume safely.
  Manual evacuation returns to the source side and counts no passage.
- Admission, expiry, cancellation, changed needs, death, dismissal and loading
  preserve reservation ownership. Paid construction/refunds are atomic.
- The UI exposes physical wall placement, rules, power/air availability, queue,
  occupant and failures. Default room entrances are explicit and configurable.
- Browser checks cover editor actions, native save persistence, an active-cycle
  import/reload/resume and the mobile editor in addition to earlier scenarios.
- CI produces `scp-operations-package` only after a passing browser run. The ZIP
  includes the tested dist, cumulative source, screenshots and SHA-256 metadata.


## 30 octobre 2026 — itinéraires souterrains validés

Suite concrète des guides game-ai, save-systems et QA : la navigation profonde
ne traverse plus la roche. `src/underground-navigation.ts` calcule les itinéraires
par modules adjacents et puits alignés ; il vérifie modules scellés, état,
habilitations et disponibilité des ascenseurs. Le retour à la surface est un
trajet réel, pas une téléportation. Les déplacements verticaux de quatre
minutes sont suspendus en l'absence d'électricité, et leur progression
est conservée dans le format de sauvegarde existant.

L'auto-affectation donne priorité aux équipes de confinement SCP afin que les
services de surface ne récupèrent pas ces spécialistes pendant une
normalisation de sauvegarde. Une équipe encore en transit ne participe plus
à la conformité SCP. Les chemins physiques sont recalculés en cours de jeu
en cas de fermeture et d'ouverture de secteur.

Exécution GitHub Actions [41031043683](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41031043683) :
92 tests métier, 17 étapes Chromium, zéro message navigateur ; archive complète
et captures générées. La CI est maintenant fixée sur Ubuntu 24.04, car
Playwright 1.56 refuse les dépendances Chromium sous Ubuntu 26.04.
Voir [le rapport QA](qa/2026-10-30/UNDERGROUND_NETWORK.md).

## 30 octobre 2026 — fidélité visuelle et cartographie partagée

Le guide game-ai est appliqué aussi à la fidélité des vues, pas seulement aux
itinéraires. `src/site-spatial.ts` définit une projection déterministe et
réversible entre la région et les salles réellement présentes dans GameState.
La vue Région calcule les toitures depuis `surfaceRooms` ; elle ne copie pas
la liste de bâtiments dans une sauvegarde parallèle. Les annexes régionales
restent des équipements extérieurs distincts.

La Surface affiche la coupe A-A ; le Sous-sol ne prétend plus être un plan 3D
complet et affiche les vraies salles traversées par cette coupe. Les cages
verticales doivent aboutir dans l'emprise d'un ascenseur au bon axe. Les
liaisons de sélection passent par les identifiants réels. La parcelle du Site
est réservée à l'intérieur et les anciennes annexes ne sont pas migrées
silencieusement. Les tests de géométrie, navigation de vue, construction,
démolition, sauvegardes et le scénario navigateur complémentaire font partie
du contrôle de la PR.

Rapport : `docs/qa/2026-10-30/THREE_VIEW_SPATIAL_CONTINUITY.md`.

## 30 octobre 2026 — sous-sol multi-axes et inspection des annexes

La source autoritative reste GameState. `UndergroundRoom.y` distingue l'axe transversal des niveaux
de profondeur, tandis que les anciens modules sans Y sont migrés sur la coupe
historique. `StaffMember.undergroundLink` conserve les jonctions physiques en cours,
pour éviter de téléporter une personne lors de la fermeture d'une galerie ou
d'un rechargement. La vue coupe et la mini-carte X–Y lisent les mêmes modules.

Les intérieurs d'annexes sont des représentations inspectables calculées
depuis `regionFacilities` : leurs activités, capacités et coûts ne sont pas
dupliqués. Les déplacements autonomes dans ces annexes sont encore à faire.

Les contrôles incluent les jonctions inter-coupes, accès par ascenseurs,
permissions, retrait d'une route pendant son franchissement, migrations de
sauvegardes, construction sur plusieurs coupes et inspection des annexes.
Rapport : `docs/qa/2026-10-30/THREE_AXIS_UNDERGROUND_AND_ANNEXES.md`.

## QA vérifiée — 30 octobre 2026

La navigation Surface générale n'ouvre jamais involontairement une annexe :
l'action explicite `enter-annex` gère ce changement d'intérieur. Un sélecteur
accessible `underground-slice-jump` permet de passer directement entre les
coupes sans parcourir une à une toutes les coordonnées Y. Le pipeline
[41044273246](https://github.com/darknigthmare/scp-foundation-site-director/actions/runs/41044273246)
a validé **119 tests Node, 20 étapes Chromium et 0 message navigateur**,
y compris reprise des sauvegardes après fermeture et rechargement hors ligne.
