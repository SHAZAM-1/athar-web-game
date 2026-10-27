# Athar — A quiet puzzle adventure

Athar (أثر) is an original, mobile-first browser puzzle game about hidden rules, discovery, and the traces a player leaves behind.

## Current prototype

The first playable experiment is **The Whispering Realm**. Discover the hidden three-light sequence to reveal a luminous rune. The visuals are procedural placeholders while the core interaction is being validated. The first clue points players toward the mint light; the same light controls are available to touch, mouse, keyboard, and assistive technology through native buttons.

## XP and ranks

The first discovery awards **100 XP** once and is recorded in browser local storage when available. The current rank ladder is:

| Rank | XP threshold |
| --- | ---: |
| Bronze | 0 |
| Silver | 100 |
| Gold | 300 |
| Platinum | 600 |
| Diamond | 1,000 |
| Master | 1,500 |
| Grandmaster | 2,500 |

Repeating an already-recorded discovery does not award XP again. At this prototype stage, there is only one XP-earning discovery, so rank progression beyond Silver awaits future puzzles and realms. XP is stored on the current browser/device; it is not yet synced across devices or accounts.

## Stack

- TypeScript
- Phaser 3
- Vite
- Vitest

## Requirements

- Node.js 22 or newer
- npm 11 (CI upgrades npm to the validated major)

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Validate before shipping

```bash
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
```

## Project Doctor

Athar includes a repository-scoped **Project Doctor** that checks every remote branch in isolated Git worktrees. It runs dependency installation, security audit, TypeScript typecheck, unit tests, production build, and whitespace validation. It also matches known failure signatures against the project's incident memory.

```bash
npm run doctor          # Check the current branch
npm run doctor:branches # Check all fetched remote branches
npm run doctor:self-test # Validate the Doctor's memory and safe-fix rules
```

For an exact, reviewed fix recipe, you can apply it to the current working tree:

```bash
npm run doctor:apply-fix -- --id whispering-hint-lightobjects-typo
```

The command refuses to edit unless the exact old text appears exactly once. It changes only the local working tree; review `git diff` and rerun all relevant checks before committing anything.

GitHub Actions runs the Doctor on branch pushes and weekly. Each run uploads a JSON diagnosis report and any patches produced by reviewed exact-match safe-fix recipes. The automated scan never pushes to branches, commits, opens PRs, or merges. Unknown failures are reported with evidence and conservative next steps. See [the Project Doctor policy](./tools/project-doctor/POLICY.md) for its scope and safety rules.

The Doctor is deliberately bounded and deterministic, not an LLM: it learns from the project's verified incident memory and only applies exact, pre-approved fixes. Unknown code failures are not "fixed" by guesswork.

## Project direction

Athar's long-term roadmap contains 12 distinct realms. The first prototype is deliberately limited to one realm; the Crystal and Abyssal realms will follow only after the core loop passes usability, quality, and performance checks.

The intended direction is calm, luminous, atmospheric, and original. Each realm should eventually have a meaningful mechanic, palette, ambience, and cross-world clues—not just a visual reskin.

## Preview deployment

The GitHub Actions workflow validates and deploys the prototype to GitHub Pages when changes reach `main`. The live preview is published at https://shazam-1.github.io/athar-web-game/. If deployment fails, check the **Deploy preview to GitHub Pages** workflow in the Actions tab.

## Status

This is an early prototype, not a finished game. The ambient tone is a placeholder. Save progress, full accessibility review, performance profiling, and real-device playtesting still require dedicated validation. Reduced-motion preferences are respected by the game scene, and the puzzle can be played through native buttons without relying on canvas hit targets.

See [PROJECT_LOG.md](./PROJECT_LOG.md) for decisions, changes, and validation status.
