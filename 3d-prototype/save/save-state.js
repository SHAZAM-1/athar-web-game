/** Pure save normalizer (no DOM/Three.js). Accepts v1-v3 saves and malformed data. */
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function parseSave(raw, { shardCount = 5, runeCount = 3, realmCount = 12, bound = 300 } = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const foundQuestObjects = {};
  if (raw.foundQuestObjects && typeof raw.foundQuestObjects === 'object' && !Array.isArray(raw.foundQuestObjects)) {
    for (const [id, ids] of Object.entries(raw.foundQuestObjects)) {
      if (Array.isArray(ids)) foundQuestObjects[id] = [...new Set(ids.filter((v) => typeof v === 'string'))];
    }
  }

  const shards = Array.isArray(raw.shards)
    ? Array.from({ length: shardCount }, (_, i) => raw.shards[i] === true)
    : (() => {
        const legacy = clamp(Math.floor(Number(raw.collected) || 0), 0, shardCount);
        return Array.from({ length: shardCount }, (_, i) => i < legacy);
      })();

  const p = raw.position;
  const position = p && Number.isFinite(p.x) && Number.isFinite(p.z)
    ? { x: clamp(p.x, -bound, bound), z: clamp(p.z, -bound, bound) }
    : null;

  const runes = Array.isArray(raw.runes)
    ? Array.from({ length: runeCount }, (_, i) => {
        const s = Number(raw.runes[i]);
        return Number.isInteger(s) && s >= 0 && s <= 3 ? s : 0;
      })
    : null;

  return {
    foundQuestObjects,
    totalQuestXP: Math.max(0, Math.floor(Number(raw.totalQuestXP) || 0)),
    activeRealmIndex: Number.isInteger(raw.activeRealmIndex) ? clamp(raw.activeRealmIndex, 0, realmCount - 1) : 0,
    shards,
    position,
    runes,
    gameWon: raw.gameWon === true,
  };
}