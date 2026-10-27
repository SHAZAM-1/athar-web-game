import { describe, expect, it } from 'vitest';
import { getRealmSky, REALM_SKIES } from './realm-skies';

describe('peaceful sky identities', () => {
  it('defines a unique sky identity for all twelve planned realms', () => {
    expect(REALM_SKIES).toHaveLength(12);
    expect(new Set(REALM_SKIES.map((sky) => sky.realm)).size).toBe(12);
    for (const sky of REALM_SKIES) {
      expect(Number.isInteger(sky.upper)).toBe(true);
      expect(Number.isInteger(sky.horizon)).toBe(true);
      expect(Number.isInteger(sky.stars)).toBe(true);
      expect(Number.isInteger(sky.aurora)).toBe(true);
      expect(Number.isInteger(sky.auroraAccent)).toBe(true);
      expect(['moon', 'sun', 'ringed-planet', 'none']).toContain(sky.celestial);
    }
  });

  it('returns the Whispering Realm sky and safely handles unknown realms', () => {
    expect(getRealmSky('The Whispering Realm')?.skyMood).toBe('aurora');
    expect(getRealmSky('not a realm')).toBeUndefined();
  });
});
