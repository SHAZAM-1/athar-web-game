/**
 * Pure quest-progress logic (no DOM/Three.js) so XP rules are unit-testable.
 * Awards object XP once per object, and the completion bonus only on the
 * pickup that transitions a quest from incomplete to complete.
 */
export function applyQuestPickup(found, totalXP, quest, objectId) {
  const realmFound = Array.isArray(found[quest.realmId]) ? found[quest.realmId] : [];
  const object = quest.objects.find((item) => item.id === objectId);
  if (!object || realmFound.includes(objectId)) {
    return { found, totalXP, awarded: 0, completed: false };
  }
  const nextFound = [...realmFound, objectId];
  const completed = quest.objects.every((item) => nextFound.includes(item.id));
  const awarded = object.xp + (completed ? quest.completionXP : 0);
  return {
    found: { ...found, [quest.realmId]: nextFound },
    totalXP: totalXP + awarded,
    awarded,
    completed,
  };
}