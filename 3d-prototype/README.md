# Athar — 3D Open-World Prototype

This is a separate experimental 3D prototype. It does not replace the existing Phaser game.

## Run locally
From the repository root, run a static server such as: npx vite --host 127.0.0.1
Then open http://127.0.0.1:5173/3d-prototype/.

The prototype imports Three.js from jsDelivr, so the first run needs an internet connection.

## Controls
- Click ENTER THE WILDS to start.
- WASD or arrow keys to move.
- Move the mouse to look around (pointer lock).
- Shift to run.
- Walk close to a glowing shard to collect it.
- Forest trees block movement; find a path around them.
- After collecting all five shards, return to the ancient ring near the starting area and press E to awaken Luma.

## Current prototype
- Procedurally generated stylized terrain, hills, forest, rocks, flowers, and an ancient ruin.
- Third-person player and follow camera.
- Five collectible glowing shards and a quest counter.
- Atmospheric fog, lighting, and responsive HUD.

## Not finished yet
This is a playable visual/gameplay foundation, not a complete open-world release. It still needs proper character models and animation, collision against trees/ruins, terrain streaming or region loading, audio, save data, real puzzle interactions, accessibility options, performance profiling, and the remaining Guardian realms. Generated geometry is a placeholder for a later art pass.