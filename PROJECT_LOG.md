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

### Red-check audit and fixes
- **Initial CI failure (PR #1):** TypeScript rejected a scene property named `lights` because it collided with Phaser's inherited `Scene.lights` manager. Renamed the field to `lightObjects`; later CI passed.
- **Initial security audit failure (PR #1):** the original dependency tree reported one moderate and two critical vulnerabilities. Vitest was upgraded to 4.1.12, and subsequent `npm audit --audit-level=moderate` runs reported zero vulnerabilities.
- **First Pages deployment failure:** build, audit, typecheck, and all four unit tests passed, but Pages was not enabled in repository settings.
- **Second Pages deployment failure:** the workflow tried `configure-pages` with `enablement: true`; GitHub rejected creation of the Pages site with `Resource not accessible by integration`. This is a repository-permission/setup blocker, not an application build defect. A repository administrator must select **Settings → Pages → Build and deployment → Source: GitHub Actions**, then rerun deployment.
- **Bundle-size warning:** Phaser's production bundle is about 1.49 MB minified (about 342 KB gzip). Treat code-splitting and real-device loading as an outstanding performance task, not a passed quality gate.
- **Environment warning:** the Pages workflow uses Node.js 22. The repository does not yet have a package lockfile, so it cannot use `npm ci`.
- **Latest red deployment run (#40420333444):** dependency installation failed before audit, typecheck, tests, or build ran, with npm's internal error `Cannot read properties of null (reading 'edgesOut')`. Added up to three install attempts, cache clearing between attempts, and disabled npm's implicit audit during install; the explicit security audit remains a separate required step.

### Validation status
- PR #4 CI passed: security audit, TypeScript typecheck, 4/4 unit tests, and production build.
- The latest deployment run failed during dependency installation; the new retry behavior still needs a fresh run to validate it.
- GitHub Pages deployment is still blocked until the repository administrator enables **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- Mobile-browser, touch, reduced-motion, and audio testing has not yet been performed.
- No claim is made that the preview is live until a deployment run succeeds.

### Next
1. Confirm the dependency-install retry fix passes in GitHub Actions.
2. Apply the one-time Pages setting in repository Settings and rerun deployment.
3. Validate the preview on a phone and desktop.
4. Improve touch feedback, hints, reduced-motion behavior, and the puzzle's learnability.
5. Reduce initial payload and profile loading on real devices.
6. Start the Crystal Realm only after the first realm passes playtesting.
