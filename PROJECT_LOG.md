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
- `.github/workflows/project-doctor.yml`: scheduled and branch-push health checks.
- `tools/project-doctor/`: diagnostic engine, incident memory, safe-fix registry, and self-tests.
- `README.md`: setup and current limitations.

### Red-check audit and fixes
- **Initial CI failure (PR #1):** TypeScript rejected a scene property named `lights` because it collided with Phaser's inherited `Scene.lights` manager. Renamed the field to `lightObjects`; later CI passed.
- **Initial security audit failure (PR #1):** the original dependency tree reported one moderate and two critical vulnerabilities. Vitest was upgraded to 4.1.12, and subsequent `npm audit --audit-level=moderate` runs reported zero vulnerabilities.
- **First Pages deployment failure:** build, audit, typecheck, and all four unit tests passed, but Pages was not enabled in repository settings.
- **Second Pages deployment failure:** the workflow tried `configure-pages` with `enablement: true`; GitHub rejected creation of the Pages site with `Resource not accessible by integration`. This is a repository-permission/setup blocker, not an application build defect. A repository administrator must select **Settings → Pages → Build and deployment → Source: GitHub Actions**, then rerun deployment.
- **Bundle-size warning:** Phaser's production bundle is about 1.49 MB minified (about 342 KB gzip). Treat code-splitting and real-device loading as an outstanding performance task, not a passed quality gate.
- **Environment warning:** the Pages workflow uses Node.js 22. The repository does not yet have a package lockfile, so it cannot use `npm ci`.
- **Latest red deployment run (#40420333444):** dependency installation failed before audit, typecheck, tests, or build ran, with npm's internal error `Cannot read properties of null (reading 'edgesOut')`. Added up to three install attempts, cache clearing between attempts, and disabled npm's implicit audit during install; the explicit security audit remains a separate required step.
- **Project Doctor (PR #6):** adds all-branch isolated-worktree checks, incident-signature diagnosis, a versioned memory of Athar-specific failures, and exact-match safe-fix proposals. It has read-only Git permissions and cannot push, commit, open PRs, or merge. The first learned safe-fix recipe corrects the known Whispering Realm hint typo on branches where it remains.

### Project Doctor guardrails
- A green report requires the branch's dependency install, security audit, typecheck, tests, build, and diff checks to pass.
- Safe fixes are exact-match only, validated in disposable worktrees, and exported as patch artifacts; unverified patches are not presented as successful.
- Unknown failures are not guessed at. The report records evidence, confidence, root-cause hypotheses, and concrete next steps.
- Verified incidents are stored in `tools/project-doctor/knowledge.json`; fixes require review before entering the memory or safe-fix registry.
- The Doctor is deterministic, not an LLM, and cannot change Athar's game goals or expand the product scope.

### Validation status
- PR #4 CI passed: security audit, TypeScript typecheck, 4/4 unit tests, and production build.
- PR #5 CI passed, including the explicit security audit, typecheck, 4/4 unit tests, and production build; its npm retry mitigation is now merged.
- The Project Doctor branch scan is new and still requires its own CI run to validate runtime behavior.
- GitHub Pages deployment is still blocked until the repository administrator enables **Settings → Pages → Build and deployment → Source: GitHub Actions**.
- Mobile-browser, touch, reduced-motion, and audio testing has not yet been performed.
- No claim is made that the preview is live until a deployment run succeeds.

### Next
1. Validate Project Doctor syntax, self-tests, branch scanning, and report artifacts in CI.
2. Review any red-branch report and apply only verified patches.
3. Apply the one-time Pages setting in repository Settings and rerun deployment.
4. Validate the preview on a phone and desktop.
5. Improve touch feedback, hints, reduced-motion behavior, and the puzzle's learnability.
6. Reduce initial payload and profile loading on real devices.
7. Start the Crystal Realm only after the first realm passes playtesting.
