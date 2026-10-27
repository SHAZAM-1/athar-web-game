import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { groundY, mat, rand } from './terrain.js';

describe('3D terrain helpers', () => {
  it('returns a stable finite height for the same world coordinate', () => {
    expect(groundY(12, -34)).toBe(groundY(12, -34));
    expect(Number.isFinite(groundY(12, -34))).toBe(true);
  });

  it('keeps terrain heights finite at world boundaries', () => {
    for (const coordinate of [-300, -150, 0, 150, 300]) {
      expect(Number.isFinite(groundY(coordinate, coordinate))).toBe(true);
    }
  });

  it('returns random values within the requested interval', () => {
    for (let i = 0; i < 50; i += 1) {
      const value = rand(-4, 9);
      expect(value).toBeGreaterThanOrEqual(-4);
      expect(value).toBeLessThan(9);
    }
  });

  it('creates a Three.js standard material with the requested color', () => {
    const material = mat('#123456', 0.4);
    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(material.color.getHexString()).toBe('123456');
    expect(material.roughness).toBe(0.4);
    material.dispose();
  });
});
