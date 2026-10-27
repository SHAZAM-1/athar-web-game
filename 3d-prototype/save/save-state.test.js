import { describe, expect, it } from 'vitest';
import { parseSave } from './save-state.js';

describe('parseSave', () => {
  it('rejects non-objects', () => {
    for (const v of [null, undefined, 5, 'x', []]) expect(parseSave(v)).toBeNull();
  });
  it('migrates legacy collected count to shard flags', () => {
    expect(parseSave({ collected: 3 }).shards).toEqual([true, true, true, false, false]);
    expect(parseSave({ collected: 99 }).shards.every(Boolean)).toBe(true);
  });
  it('sanitizes malformed v3 data', () => {
    const s = parseSave({
      version: 3, shards: [true, 'x'], runes: [2, 9, -1], activeRealmIndex: 99, totalQuestXP: -5,
      position: { x: 9999, z: NaN }, foundQuestObjects: { a: ['k', 1, 'k'], b: 'no' },
    });
    expect(s.shards).toEqual([true, false, false, false, false]);
    expect(s.runes).toEqual([2, 0, 0]);
    expect(s.activeRealmIndex).toBe(11);
    expect(s.totalQuestXP).toBe(0);
    expect(s.position).toBeNull();
    expect(s.foundQuestObjects).toEqual({ a: ['k'] });
  });
  it('clamps position and keeps gameWon strict', () => {
    expect(parseSave({ position: { x: 999, z: -999 }, gameWon: 'true' })).toMatchObject({ position: { x: 300, z: -300 }, gameWon: false });
  });
});