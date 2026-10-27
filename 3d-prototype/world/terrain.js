import * as THREE from 'three';

/** Deterministic-free helper for procedural world placement. */
export function rand(min, max) {
  return min + Math.random() * (max - min);
}

/** Create a shared standard material with predictable defaults. */
export function mat(color, roughness = 1, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, ...extra });
}

/** Height function shared by terrain, props, collectibles, and the player. */
export function groundY(x, z) {
  return Math.sin(x * 0.035) * 1.8
    + Math.cos(z * 0.04) * 1.6
    + Math.sin((x + z) * 0.018) * 2.1
    + Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.38;
}
