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
- `.github/workflows/ci.yml`: pull-request validation and security audit.
- `.github/workflows/pages.yml`: validated build and GitHub Pages deployment on updates to `main`.
- `README.md`: setup and current limitations.

### Validation
- GitHub Actions passed: security audit, TypeScript typecheck, unit tests, and production build.
- The initial audit identified vulnerable Vitest 3.x / Tinypool dependencies. Vitest was upgraded to 4.1.12; the subsequent moderate-or-higher audit gate passed.
- A real-device mobile-browser and audio review has not yet been performed.
- First deployment attempt built successfully but found that Pages was not enabled. The follow-up enables Pages through configure-pages and retries deployment.
- The Phaser bundle is about 1.49 MB minified (about 342 KB gzip); code-splitting and real-device loading should be reviewed before production.

### Next
1. Validate the preview on a phone and desktop.
2. Improve touch feedback, hints, reduced-motion behavior, and the puzzle's learnability.
3. Add a minimal PWA shell only after the core experience is stable.
4. Start the Crystal Realm only after the first realm passes playtesting.
