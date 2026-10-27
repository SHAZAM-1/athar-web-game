import { describe, expect, it } from 'vitest';
import { getRealmById, REALMS } from './realm-registry.js';

describe('3D realm palette registry', () => {
  it('contains all twelve realms in the legacy landscape order', () => {
    expect(REALMS).toHaveLength(12);
    expect(REALMS[0].name).toBe('The Whispering Realm');
    expect(REALMS[8].name).toBe('Silent Sands');
    expect(REALMS[11].name).toBe('The Fading Light Realm');
  });

  it('uses unique stable IDs and valid 24-bit colors for every realm', () => {
    expect(new Set(REALMS.map((realm) => realm.id)).size).toBe(REALMS.length);
    for (const realm of REALMS) {
      expect(realm.id.length).toBeGreaterThan(0);
      for (const key of ['farLand', 'nearLand', 'grassPrimary', 'grassAlternate', 'grainPrimary', 'grainAlternate', 'oceanDeep', 'oceanLight', 'oceanGlow']) {
        expect(Number.isInteger(realm[key])).toBe(true);
        expect(realm[key]).toBeGreaterThanOrEqual(0);
        expect(realm[key]).toBeLessThanOrEqual(0xffffff);
      }
    }
  });

  it('looks up realms by stable ID and returns undefined for unknown IDs', () => {
    expect(getRealmById('crystal')).toBe(REALMS[6]);
    expect(getRealmById('not-a-realm')).toBeUndefined();
  });
});
