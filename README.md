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

- Node.js 20 or newer
- npm

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
```

## Project direction

Athar's long-term roadmap contains 12 distinct realms. The first prototype is deliberately limited to one realm; the Crystal and Abyssal realms will follow only after the core loop passes usability, quality, and performance checks.

The intended direction is calm, luminous, atmospheric, and original. Each realm should eventually have a meaningful mechanic, palette, ambience, and cross-world clues—not just a visual reskin.

## Status

This is an early prototype, not a finished game. Sound, save progress, onboarding, accessibility review, performance profiling, and production deployment still require dedicated validation.

See [PROJECT_LOG.md](./PROJECT_LOG.md) for decisions, changes, and validation status.
