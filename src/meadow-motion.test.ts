import { describe, expect, it } from 'vitest';
import { calculateBreeze, getGrassRepulsion } from './meadow-motion';

describe('peaceful meadow motion', () => {
  it('keeps the breeze smooth and bounded', () => {
    for (let time = 0; time < 1000; time += 0.25) {
      expect(calculateBreeze(time)).toBeGreaterThanOrEqual(-0.601);
      expect(calculateBreeze(time)).toBeLessThanOrEqual(0.601);
    }
    expect(calculateBreeze(Number.NaN)).toBe(0);
  });

  it('bends nearby grass away from the traveller and returns to neutral outside the radius', () => {
    expect(getGrassRepulsion(80, 100, 100, 100, 40)).toEqual({ direction: -1, strength: 0.5 });
    expect(getGrassRepulsion(120, 100, 100, 100, 40)).toEqual({ direction: 1, strength: 0.5 });
    expect(getGrassRepulsion(150, 100, 100, 100, 40)).toEqual({ direction: 0, strength: 0 });
    expect(getGrassRepulsion(100, 100, 100, 100, 40).strength).toBe(1);
  });

  it('safely ignores invalid geometry and invalid radii', () => {
    expect(getGrassRepulsion(Number.NaN, 0, 0, 0)).toEqual({ direction: 0, strength: 0 });
    expect(getGrassRepulsion(0, 0, 0, 0, -1)).toEqual({ direction: 0, strength: 0 });
  });
});
