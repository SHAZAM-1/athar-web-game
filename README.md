# Athar — A quiet puzzle adventure

Athar (أثر) is an original, mobile-first browser puzzle game about hidden rules, discovery, and the traces a player leaves behind.

## Current prototype

The first playable experiment is **The Whispering Realm**. Discover the hidden three-light sequence to reveal a luminous rune. The visuals are procedural placeholders while the core interaction is being validated.

## Stack

- TypeScript
- Phaser 3
- Vite
- Vitest

## Requirements

- Node.js 22 or newer
- npm

## Run locally

```bash
npm ci
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

## Project direction

Athar's long-term roadmap contains 12 distinct realms. The first prototype is deliberately limited to one realm; the Crystal and Abyssal realms will follow only after the core loop passes usability, quality, and performance checks.

The intended direction is calm, luminous, atmospheric, and original. Each realm should eventually have a meaningful mechanic, palette, ambience, and cross-world clues—not just a visual reskin.

## Preview deployment

The GitHub Actions workflow validates and deploys the prototype to GitHub Pages when changes reach `main`. **One-time repository setup is required:** an administrator must open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The workflow token available to automation cannot enable Pages for this repository, so the workflow intentionally does not attempt that privileged operation. After this setting is saved, rerun the **Deploy preview to GitHub Pages** workflow from the Actions tab. The published URL will appear in the successful deployment run.

## Status

This is an early prototype, not a finished game. The ambient tone is a placeholder. Save progress, onboarding, accessibility review, performance profiling, and real-device playtesting still require dedicated validation.

See [PROJECT_LOG.md](./PROJECT_LOG.md) for decisions, changes, and validation status.
