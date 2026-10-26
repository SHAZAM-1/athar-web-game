import { describe, expect, it } from 'vitest';
import { advanceDiscovery } from './discovery';

describe('Whispering Realm discovery sequence', () => {
  it('advances only when the expected light is tapped', () => {
    const first = advanceDiscovery(0, 0);
    expect(first.progress).toBe(1);
    expect(first.solved).toBe(false);

    const second = advanceDiscovery(first.progress, 2);
    expect(second.progress).toBe(2);
    expect(second.solved).toBe(false);
  });

  it('solves after the three lights are tapped in order', () => {
    const first = advanceDiscovery(0, 0);
    const second = advanceDiscovery(first.progress, 2);
    const third = advanceDiscovery(second.progress, 1);

    expect(third.progress).toBe(3);
    expect(third.solved).toBe(true);
    expect(third.message).toContain('world remembers your touch');
  });

  it('resets progress when a wrong light is tapped', () => {
    const first = advanceDiscovery(0, 0);
    const wrong = advanceDiscovery(first.progress, 1);

    expect(wrong.progress).toBe(0);
    expect(wrong.solved).toBe(false);
    expect(wrong.message).toContain('try another path');
  });

  it('keeps the solved state stable on later taps', () => {
    const afterSolve = advanceDiscovery(3, 0);
    expect(afterSolve.progress).toBe(3);
    expect(afterSolve.solved).toBe(true);
  });
});
