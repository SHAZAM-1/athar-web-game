# Athar — 3D Open-World Prototype

This is the active 3D adventure scene. The repository root now opens this scene as the main game; this folder is no longer an isolated side demo.

## Run locally

From the repository root:

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The root route and `/3d-prototype/` both open the Three.js scene. Three.js currently loads from jsDelivr, so an internet connection is required.

## Controls

- Click **ENTER THE WILDS** to begin.
- WASD or arrow keys to move.
- Mouse movement to look around (pointer lock).
- Shift to run.
- E to interact with rune stones or the ancient ring.
- On touch screens, use the on-screen directional pad and RUN button; drag on the scene to look around and use INTERACT · E to interact.

## First quest: Echoes of Luma

1. Explore the forest and collect all five glowing shards.
2. Find the three rune stones beside the ancient ring.
3. Interact with each stone to cycle its state from 0 through 3.
4. Set the runes to **2 · 1 · 3** from left to right.
5. Return to the ring and interact to awaken Luma.

Progress (collected shard count, player position, rune states, and chapter completion) is autosaved in this browser when local storage is available. Clearing site data or using a different browser/device clears or separates that save.

## Current limits

Terrain, trees, rocks, flowers, ruins, shards, runes, and the player are procedural Three.js geometry. This proves the 3D gameplay loop, but it is not yet a polished final art pass. Rigged character animation, authored environment assets, guardian encounters, all twelve playable realms, accessibility review, performance profiling, and real-browser/device playtesting remain outstanding.

The old Phaser source still exists as legacy code and its TypeScript tests are not a runtime test of this Three.js scene.
