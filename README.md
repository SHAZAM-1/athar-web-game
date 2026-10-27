# Athar — 3D fantasy adventure

Athar (أثر) is being rebuilt as a **3D-first browser game**. The root URL now opens the Three.js third-person adventure directly; the old Phaser meadow is no longer the main entry point.

## Play the current 3D build

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The main page loads the 3D world from `3d-prototype/main.js` and its responsive HUD from `3d-prototype/style.css`. Three.js is currently loaded from jsDelivr, so the browser needs an internet connection.

You can also open the same scene directly at `/3d-prototype/`.

## Current playable loop

- Explore a procedural third-person 3D forest with hills, trees, rocks, flowers, ancient ruins, fog, and atmospheric lighting.
- Use WASD/arrow keys to move, mouse to look, Shift to run, and E to interact.
- On touch devices, use the on-screen movement/run/interact controls and drag to look around.
- Collect five glowing shards.
- Find the three rune stones and cycle them to the sequence **2 · 1 · 3**.
- Return to the ancient ring and interact to awaken Luma.

## Important status

This is an active prototype, not a finished commercial-quality game. The world, character, trees, rocks, ruins, and collectibles are still procedural geometry; production 3D models, rigging/animation, richer combat or guardian encounters, save/progression integration, sound design, and device/browser testing remain to be built and verified.

The repository still contains the former Phaser/2D implementation and its tests as legacy source. The root page no longer starts that implementation, but the old modules have **not all been rewritten as 3D equivalents yet**. This distinction is intentional and visible so that the migration is not misrepresented as complete.

## Validation

```bash
npm run typecheck
npm test
npm run build
```

These commands validate the legacy TypeScript/test/build pipeline; they do not, by themselves, prove the Three.js scene works on every browser or device. Browser runtime and mobile-device testing are still required.

## Project Doctor

The repository includes a Project Doctor for branch checks and reviewed safe-fix recipes:

```bash
npm run doctor
npm run doctor:branches
npm run doctor:self-test
```

See `tools/project-doctor/POLICY.md` for scope and safety rules.

## Preview deployment

The existing GitHub Pages workflow publishes the project at https://shazam-1.github.io/athar-web-game/ when its deployment conditions are met.

## Project direction

The target is a cohesive 3D adventure across twelve distinct realms, with meaningful mechanics and atmosphere for each—not a collection of disconnected demos. The migration is in progress; only the Whispering Wilds currently has a playable 3D scene.
