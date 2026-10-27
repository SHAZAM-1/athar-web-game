# Athar Project Log

## Milestone 1: First playable prototype

**Status:** Merged to `main`; automated validation passed on pull request #1.

### Product decisions
- Web-first and mobile-first; PWA packaging follows after the first playable loop is validated.
- Stack: TypeScript, Phaser 3, Vite, and Vitest.
- First prototype: The Whispering Realm. The Crystal and Abyssal realms remain planned, not started.
- Procedural scene art keeps the first experiment self-contained and low-cost.
- The 12 realms are a long-term roadmap, not a launch requirement.

### Gameplay
- Three lights must be tapped in sequence to reveal the rune.
- An incorrect tap resets progress and gives feedback.
- The first clue points toward the mint light, then the violet trace; the remaining order is revealed through feedback.
- Native light-control buttons provide a keyboard- and screen-reader-accessible alternative to the canvas hit targets.
- The optional ambient tone can be toggled after a user gesture. It is a placeholder, not final sound design.

### Project Doctor and deployment
- Project Doctor checks remote branches in isolated worktrees, performs dependency/security/type/test/build/diff checks, diagnoses known incidents, and exports exact-match safe-fix proposals. It does not push, commit, open PRs, or merge.
- The Doctor and GitHub Pages deployment workflows have reported successful runs. The preview is available at https://shazam-1.github.io/athar-web-game/.
- The repository still has no package lockfile; npm 11 is used in CI due to a reproducible npm 10 internal dependency-tree error.

### Whispering Realm responsive/accessibility audit
- Removed CSS rules that forced the Phaser canvas to stretch to the full stage dimensions; Phaser `Scale.FIT` now owns the canvas aspect ratio, with the stage centering the fitted canvas.
- Added accessible native buttons for all three lights so gameplay does not depend on pointer-only canvas zones.
- Improved the opening clue and gave the mint light a slightly stronger initial glow.
- Added a solved guard so additional taps do not replay the completion animation.
- Disabled ambient Phaser tweens when `prefers-reduced-motion: reduce` is active.
- Added a regression test for choosing the wrong first light.
- Validation still required in CI: typecheck, tests, production build, security audit, and Project Doctor. No claim is made here that real-device or visual browser tests have run.

### Remaining quality gates
1. Review CI results for the responsive/accessibility patch.
2. Verify visual layout and touch targets on real mobile and desktop browsers.
3. Measure production payload and loading on representative devices.
4. Playtest whether the clue and sequence are understandable and satisfying.
5. Only after these checks pass, design and implement the Crystal Realm, then Abyssal Realm.
