export const XP_PER_DISCOVERY = 100;
export const PROGRESSION_STORAGE_KEY = 'athar.progression.v1';

export const RANKS = [
  { name: 'Bronze', minXP: 0 },
  { name: 'Silver', minXP: 100 },
  { name: 'Gold', minXP: 300 },
  { name: 'Platinum', minXP: 600 },
  { name: 'Diamond', minXP: 1_000 },
  { name: 'Master', minXP: 1_500 },
  { name: 'Grandmaster', minXP: 2_500 },
] as const;

export type RankName = (typeof RANKS)[number]['name'];

export type PlayerProgression = {
  xp: number;
  completedDiscoveries: string[];
};

export type RankProgress = {
  rank: RankName;
  nextRank: RankName | null;
  xp: number;
  currentRankXP: number;
  nextRankXP: number | null;
  progressPercent: number;
};

const EMPTY_PROGRESSION: PlayerProgression = {
  xp: 0,
  completedDiscoveries: [],
};

export function parseProgression(raw: string | null): PlayerProgression {
  if (!raw) return { ...EMPTY_PROGRESSION, completedDiscoveries: [] };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...EMPTY_PROGRESSION, completedDiscoveries: [] };
    }

    const candidate = parsed as Partial<PlayerProgression>;
    const xp = typeof candidate.xp === 'number' && Number.isFinite(candidate.xp)
      ? Math.max(0, Math.floor(candidate.xp))
      : 0;
    const completedDiscoveries = Array.isArray(candidate.completedDiscoveries)
      ? [...new Set(candidate.completedDiscoveries.filter(
        (item): item is string => typeof item === 'string' && item.length > 0,
      ))]
      : [];

    return { xp, completedDiscoveries };
  } catch {
    return { ...EMPTY_PROGRESSION, completedDiscoveries: [] };
  }
}

export function awardDiscovery(
  progression: PlayerProgression,
  discoveryId: string,
  xpReward = XP_PER_DISCOVERY,
): { progression: PlayerProgression; awarded: number } {
  if (!discoveryId || progression.completedDiscoveries.includes(discoveryId)) {
    return {
      progression: {
        xp: progression.xp,
        completedDiscoveries: [...progression.completedDiscoveries],
      },
      awarded: 0,
    };
  }

  const reward = Number.isFinite(xpReward) ? Math.max(0, Math.floor(xpReward)) : 0;
  return {
    progression: {
      xp: progression.xp + reward,
      completedDiscoveries: [...progression.completedDiscoveries, discoveryId],
    },
    awarded: reward,
  };
}

export function getRankProgress(totalXP: number): RankProgress {
  const xp = Number.isFinite(totalXP) ? Math.max(0, Math.floor(totalXP)) : 0;
  let rankIndex = 0;

  for (let index = 1; index < RANKS.length; index += 1) {
    if (xp < RANKS[index].minXP) break;
    rankIndex = index;
  }

  const current = RANKS[rankIndex];
  const next = RANKS[rankIndex + 1];

  if (!next) {
    return {
      rank: current.name,
      nextRank: null,
      xp,
      currentRankXP: current.minXP,
      nextRankXP: null,
      progressPercent: 100,
    };
  }

  const span = next.minXP - current.minXP;
  const progressInRank = xp - current.minXP;
  return {
    rank: current.name,
    nextRank: next.name,
    xp,
    currentRankXP: current.minXP,
    nextRankXP: next.minXP,
    progressPercent: Math.min(100, Math.round((progressInRank / span) * 100)),
  };
}
