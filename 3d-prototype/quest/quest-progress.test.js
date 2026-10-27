import { describe, expect, it } from 'vitest';
import { applyQuestPickup } from './quest-progress.js';
import { REALM_QUESTS } from '../realms/realm-quests.js';

const base = REALM_QUESTS[0];
const quest = { ...base, realmId: 'whispering' };
const [a, b, c] = quest.objects.map((o) => o.id);

describe('applyQuestPickup', () => {
  it('awards object XP once and completion bonus on the final pickup only', () => {
    let s = applyQuestPickup({}, 0, quest, a);
    expect(s).toMatchObject({ totalXP: 25, awarded: 25, completed: false });
    s = applyQuestPickup(s.found, s.totalXP, quest, b);
    expect(s.totalXP).toBe(50);
    s = applyQuestPickup(s.found, s.totalXP, quest, c);
    expect(s).toMatchObject({ totalXP: 175, awarded: 125, completed: true });
  });

  it('never re-awards a collected or unknown object', () => {
    const s = applyQuestPickup({ whispering: [a, b, c] }, 175, quest, a);
    expect(s).toMatchObject({ totalXP: 175, awarded: 0, completed: false });
    expect(applyQuestPickup({}, 0, quest, 'nope').awarded).toBe(0);
  });

  it('does not mutate the input state', () => {
    const found = { whispering: [a] };
    applyQuestPickup(found, 25, quest, b);
    expect(found.whispering).toEqual([a]);
  });
});