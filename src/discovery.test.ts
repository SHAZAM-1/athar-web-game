import { describe, expect, it } from 'vitest';
import { getDiscoveryMessage } from './discovery';

describe('getDiscoveryMessage', () => {
  it('returns the warm-light response for the second light', () => {
    expect(getDiscoveryMessage(1)).toContain('warm light');
  });

  it('returns the default discovery response for other lights', () => {
    expect(getDiscoveryMessage(0)).toContain('world remembers your touch');
    expect(getDiscoveryMessage(2)).toContain('world remembers your touch');
  });
});
