import { describe, expect, it } from 'vitest';
import { getRealmLandscape, REALM_LANDSCAPES } from './realm-landscapes';

describe('realm meadow palettes', () => {
  it('provides a distinct landscape palette for each of the twelve planned realms', () => {
    expect(REALM_LANDSCAPES).toHaveLength(12);
    expect(new Set(REALM_LANDSCAPES.map((landscape) => landscape.realm)).size).toBe(12);
    for (const landscape of REALM_LANDSCAPES) {
      expect(landscape.grassPrimary).not.toBe(landscape.grainPrimary);
      expect(Number.isInteger(landscape.farLand)).toBe(true);
      expect(Number.isInteger(landscape.nearLand)).toBe(true);
    }
  });

  it('returns the active Whispering Realm palette and handles unknown realms', () => {
    expect(getRealmLandscape('The Whispering Realm')?.grainPrimary).toBe(0xf1d98a);
    expect(getRealmLandscape('not a realm')).toBeUndefined();
  });
});
