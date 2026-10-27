import { describe, expect, it } from 'vitest';
import { getRealmQuest, isQuestComplete, REALM_QUESTS } from './realm-content';

describe('hidden realm quests', () => {
  it('provides a distinct quest and three unique hidden objects for all twelve realms', () => {
    expect(REALM_QUESTS).toHaveLength(12);
    expect(new Set(REALM_QUESTS.map((quest) => quest.realm)).size).toBe(12);
    expect(new Set(REALM_QUESTS.map((quest) => quest.id)).size).toBe(12);
    for (const quest of REALM_QUESTS) {
      expect(quest.objects).toHaveLength(3);
      expect(new Set(quest.objects.map((object) => object.id)).size).toBe(3);
      expect(quest.objects.every((object) => object.x >= 0 && object.x <= 1 && object.y >= 0 && object.y <= 1)).toBe(true);
    }
  });

  it('finds the active Whispering Realm quest', () => {
    expect(getRealmQuest('The Whispering Realm')?.title).toBe('Little Things in the Breeze');
    expect(getRealmQuest('unknown realm')).toBeUndefined();
  });

  it('completes only after every hidden object is found', () => {
    const quest = REALM_QUESTS[0];
    expect(isQuestComplete(quest, [quest.objects[0].id, quest.objects[1].id])).toBe(false);
    expect(isQuestComplete(quest, quest.objects.map((object) => object.id))).toBe(true);
  });
});
