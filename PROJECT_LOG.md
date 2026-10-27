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

### XP and ranks (in progress)
- Added a local XP progression model with Bronze, Silver, Gold, Platinum, Diamond, Master, and Grandmaster ranks.
- The first Whispering Realm discovery awards 100 XP once; repeat clears cannot farm XP.
- XP and the completed-discovery record are saved in browser local storage when available.
- The progression model has unit tests for rank thresholds, one-time rewards, malformed saved data, and invalid XP values.
- This is a starter foundation: only the first discovery currently awards XP. Additional legitimate rewards should be defined as new puzzles and realms are built; do not add arbitrary repeatable XP farming.

### Hidden quests, wind physics, and cozy direction (in progress)
- Added a content catalog with one hidden-object side quest and three unique objects for each of the 12 planned realms.
- The Whispering Realm is the only playable quest right now: three objects fade into view with a gentle wind cycle and can be collected by tapping/clicking.
- Added slow horizontal drift and soft vertical float to ambient motes; the movement is deliberately subtle and has no timers or fail state.
- Each object awards 25 XP once; finishing the quest awards a 100 XP bonus once. The same saved discovery ledger prevents farming.
- Added a calm, warm-lavender/peach quest panel and polite live status updates. Reduced-motion users see the hidden objects without animated reveals.
- Tests cover all 12 quest entries, unique IDs, normalized object positions, active quest lookup, and completion rules.
- The remaining 11 quests are content definitions only; those realms are not yet implemented as playable scenes.

### Magical skies and peaceful celestial weather (in progress)
- Added a data-driven sky identity for each of the 12 planned realms, including distinct twilight gradients, star colours, aurora hues, and moon/sun/ringed-planet motifs.
- Rendered the Whispering Realm’s first sky: 76 small stars, a warm crescent moon, soft teal and periwinkle aurora ribbons, and a subtle horizon veil; the ribbons move slowly with the breeze.
- Respects reduced-motion settings by freezing the aurora and avoiding star twinkle animation. Other realms have sky-style data only until their playable scenes are implemented.
- Added a catalog test for all twelve sky styles and valid palette/motif data.

### Magical oceans and realm-matched water (in progress)
- Added a gentle ocean palette for every planned realm, with distinct deep-water, surface-light, and magical reflection colours that harmonize with its landscape and sky.
- Rendered a quiet, layered ocean beneath the Whispering Realm: slow low-contrast ripples, sparse luminous flecks, and a calm gradient; the water moves subtly with the breeze.
- Kept the ocean behind the floating island and land layers so it reads as a surrounding sea rather than covering the playable meadow.
- Added catalog assertions for all ocean palette fields. Other eleven oceans are palette data only until their scenes become playable.

### Walkable meadow and responsive wind (in progress)
- Added a layered open-landscape silhouette to the active Whispering Realm, with procedural green grass and golden grain swaying in a slow breeze.
- Added a small hooded traveller controlled by arrow keys/WASD on desktop and a hold-to-walk directional pad on touch screens.
- Grass and grain near the traveller bend away from their position and return naturally as the traveller passes, creating a gentle interaction rather than collision or a penalty.
- Added small procedural red, scarlet, and copper maple-shaped autumn leaves. They fall, flutter and spin, settle near the ground, and can be picked up again by a gentle gust; reduced-motion mode keeps them static.
- Added pure helper functions and unit tests for bounded breeze, radial grass response, and invalid geometry.
- Added a unique landscape palette for each of the 12 planned realms, with tests for the full palette catalog. The reusable palette data is ready for future realm scenes, but only Whispering currently renders a playable meadow.
- The other 11 realm quests remain content definitions only. The terrain drawing is currently integrated in Whispering Realm and should become a realm-themed reusable system as each future realm is actually built; do not imply all realms are playable yet.
- Reduced-motion mode keeps the field static while preserving direct player movement and gameplay.

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
- PR #9's automated CI checks passed. Real-device visual/touch tests have not been performed.

### Remaining quality gates
1. Review CI for the hidden-quests/wind feature before merging it.
2. Verify visual layout and touch targets on real mobile and desktop browsers.
3. Measure production payload and loading on representative devices.
4. Playtest whether the clue, hidden-object reveal, gentle wind, quest, and XP rewards are understandable and satisfying.
5. Only after the core checks pass, design and implement the Crystal Realm, then Abyssal Realm.
