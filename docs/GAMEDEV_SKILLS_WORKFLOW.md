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

`npm ci && npm test` compiles with the locked TypeScript toolchain, executes both
`tests/core.test.mjs` and `tests/navigation.test.mjs`, and checks the build.
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

Room entry/exit remains a footprint-based convention. A placed door/airlock
editor, clearance-aware passages and full underground itineraries are separate
work. The existing abstract underground transfer is preserved. These changes do
not establish that the planned Operations release is complete, and do not
replace testing against authentic historical release archives or physical devices.


Recorded execution evidence: [routing/save/mobile QA](qa/2026-10-29/ROUTING_SAVE_MOBILE.md).
