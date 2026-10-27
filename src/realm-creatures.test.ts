import { describe, expect, it } from 'vitest';
import { getRealmCreature, REALM_CREATURES } from './realm-creatures';

describe('magical realm guardians', () => {
  it('defines one distinct creature for every planned realm', () => {
    expect(REALM_CREATURES).toHaveLength(12);
    expect(new Set(REALM_CREATURES.map((creature) => creature.realm)).size).toBe(12);
    expect(new Set(REALM_CREATURES.map((creature) => creature.name)).size).toBe(12);
    for (const creature of REALM_CREATURES) {
      expect(creature.species.length).toBeGreaterThan(0);
      expect(Number.isInteger(creature.body)).toBe(true);
      expect(Number.isInteger(creature.glow)).toBe(true);
      expect(Number.isInteger(creature.accent)).toBe(true);
      expect(creature.description.length).toBeGreaterThan(20);
    }
  });

  it('returns Luma for the playable Whispering Realm and safely handles unknown realms', () => {
    expect(getRealmCreature('The Whispering Realm')?.species).toBe('Tideglow Jellyfish');
    expect(getRealmCreature('not a realm')).toBeUndefined();
  });
});
