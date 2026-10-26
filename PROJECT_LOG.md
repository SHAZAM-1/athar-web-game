# Athar Project Log

## Milestone: First playable prototype and CI

**Status:** Source and automated checks prepared on `feat/athar-foundation`. GitHub Actions must complete before this milestone can be called validated.

### Product decisions
- Web-first and mobile-first; consider PWA packaging after the first playable loop is validated.
- Stack: TypeScript, Phaser 3, Vite, and Vitest.
- First prototype: The Whispering Realm. The Crystal and Abyssal realms remain planned, not started.
- Procedural scene art keeps the first experiment self-contained and low-cost.
- The 12 realms are a long-term roadmap, not a launch requirement.

### Gameplay
- Three lights must be tapped in sequence to reveal the rune.
- An incorrect tap resets progress and gives feedback.
- The initial sequence is an experiment; playtesting should establish whether it is discoverable and satisfying.
- Optional ambient tone can be toggled after a user gesture. It is a placeholder, not final sound design.

### Files
- `package.json`: development, typecheck, test, and production-build scripts.
- `index.html`: semantic shell and initial page metadata.
- `tsconfig.json`: strict TypeScript options.
- `vite.config.ts`: Vite build configuration.
- `src/main.ts`: Phaser scene, sequence interaction, and optional ambient tone.
- `src/discovery.ts`: pure puzzle-state transition logic.
- `src/discovery.test.ts`: unit tests for progression, success, reset, and solved state.
- `.github/workflows/ci.yml`: automated install, typecheck, test, and build.
- `README.md`: setup and current limitations.

### Validation
- GitHub connector read/write access verified.
- First CI attempt exposed a Phaser Scene property-name collision and unused audio-node tracking; the scene field was renamed and the unused tracking removed in follow-up commits.
- Dependency audit found vulnerable Vitest 3.x / Tinypool dependencies. Vitest was upgraded to 4.1.12 and CI now blocks on moderate-or-higher npm audit findings.
- Unit tests and build are configured but must be confirmed by the CI run. No local runtime or mobile-browser playtest has been performed in this environment.
- Do not merge to `main` if required checks fail.
- Next after passing CI: review gameplay on a real mobile viewport, improve hint clarity and accessibility, then consider the next realm.
