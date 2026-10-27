import { describe, expect, it } from 'vitest';
import { REALM_QUESTS, getRealmQuestByName } from './realm-quests.js';
import { REALMS } from './realm-registry.js';

describe('3D realm quest content', () => {
  it('provides one three-object quest for each of the twelve realms', () => {
    expect(REALM_QUESTS).toHaveLength(12);
    expect(REALM_QUESTS.map((quest) => quest.realm)).toEqual(REALMS.map((realm) => realm.name));
    for (const quest of REALM_QUESTS) {
      expect(quest.objects).toHaveLength(3);
      expect(quest.completionXP).toBe(100);
      expect(quest.objects.reduce((sum, object) => sum + object.xp, 0)).toBe(75);
    }
  });

  it('keeps object IDs unique and coordinates normalized', () => {
    const ids = REALM_QUESTS.flatMap((quest) => quest.objects.map((object) => object.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const quest of REALM_QUESTS) for (const object of quest.objects) {
      expect(object.x).toBeGreaterThanOrEqual(0);
      expect(object.x).toBeLessThanOrEqual(1);
      expect(object.y).toBeGreaterThanOrEqual(0);
      expect(object.y).toBeLessThanOrEqual(1);
      expect(object.hint.length).toBeGreaterThan(0);
    }
  });

  it('looks up a realm quest by its display name', () => {
    expect(getRealmQuestByName('The Crystal Realm')?.id).toBe('crystal-prism-song');
    expect(getRealmQuestByName('Unknown Realm')).toBeUndefined();
  });
});
