# Athar — A quiet puzzle adventure

Athar (أثر) is an original, mobile-first browser puzzle game about hidden rules, discovery, and the traces a player leaves behind.

## Current prototype

The first playable experiment is **The Whispering Realm**. Discover the hidden three-light sequence to reveal a luminous rune. The visuals are procedural placeholders while the core interaction is being validated. The first clue points players toward the mint light; the same light controls are available to touch, mouse, keyboard, and assistive technology through native buttons.

## Hidden quests, treasures, and gentle wind

The active Whispering Realm now opens beneath a deep twilight sky with dozens of softly twinkling stars, a warm crescent moon, and translucent turquoise-violet aurora ribbons that drift like silk. Each of the twelve planned realms has its own sky identity—unique dusk colours, star tones, aurora hues, and a celestial motif (moon, sun, or ringed planet)—so future scenes can feel like distinct peaceful worlds rather than palette swaps. The active Whispering Realm is the first rendered sky; the other eleven sky identities are ready for their future playable scenes. Beneath it, a quiet magical ocean shimmers around the floating meadow island. Its deep teal water carries soft mint reflections and slow, low-contrast ripples, with colours tuned to the realm. Every planned realm now has its own peaceful ocean palette: violet-lilac for Dreaming, rose-gold for Horizon, emerald for Rootbound, icy blue for Crystal, deep sapphire for Celestial, and more. The Whispering Realm is the first rendered ocean; other ocean palettes are ready for future playable scenes. Every planned realm now has an original magical guardian concept in the creature catalog: a velvet dream moth, sunset glassfox, echoing moonwhale, lanternwing manta, moss-crowned stag, prism-tailed fox, cloud koi, dune glasswing scarab, comet-tailed dragon, fourfold butterfly, and dusk wisp join the Whispering Realm’s tideglow jellyfish. The active Whispering Realm renders its blue jellyfish guardian; the other creature concepts are ready for their future playable scenes. Bright-blue jellyfish with translucent glowing bells and fine tendrils drift near the waterline, while tiny cyan and mint bioluminescent traces glimmer across the shore. Their motion and glow are slow and gentle, with reduced-motion preferences respected. These creatures and shoreline effects currently render only in the active Whispering Realm. The landscape has layered, rolling meadow hills with soft green grass and golden grain. The little traveller can walk through the landscape with arrow keys/WASD or the touch direction pad; nearby stalks lean away around them and settle back gently. A slow, layered breeze sways the field. Small crimson, scarlet, and copper maple-shaped autumn leaves drift down, flutter and spin in the wind, gather softly near the ground, and sometimes lift again when a gentle gust catches them. Three tiny objects become easier to see as a slow, sine-like breeze passes through the scene. Floating motes drift with the wind; there is no timer, fail state, or pressure to hurry. The meadow motion is driven by a small, tested wind/repulsion helper and uses a static wind pose for reduced-motion settings. A separate landscape palette defines distinct grass, grain, and distant-land colours for all 12 planned realms; only the Whispering Realm is currently rendered as a playable scene. Reduced-motion users see the treasures without the animated reveal.

The content catalog defines one distinct hidden-object quest for each of the 12 planned realms. Only the Whispering Realm quest is currently rendered and playable; the other 11 entries are design data for future realms, not finished levels. Each hidden object gives 25 XP once, and completing the three-object quest gives a 100 XP bonus once. Found objects and quest rewards use the existing local progression storage to prevent repeat farming.

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

Repeating an already-recorded discovery does not award XP again. XP can now also come from the Whispering Realm's three hidden treasures and one-time quest completion. Additional rank progression will come from future legitimate discoveries in new puzzles and realms. XP is stored on the current browser/device; it is not yet synced across devices or accounts.

## Stack

- TypeScript
- Phaser 3
- Vite
- Vitest

The realm quest and magical creature catalogs are covered by tests for all 12 realms, unique quest/object IDs and guardian names, object positions, and quest completion. Meadow tests cover smooth bounded breeze values, grass bending around the traveller, invalid geometry, and all 12 realm landscape and ocean palettes. The autumn leaves are procedural shapes and follow the same soft breeze; reduced-motion mode keeps them still.

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
