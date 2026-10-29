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
