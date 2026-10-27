import { describe, expect, it } from 'vitest';
import {
  awardDiscovery,
  getRankProgress,
  parseProgression,
  XP_PER_DISCOVERY,
} from './progression';

describe('Athar XP progression', () => {
  it('starts at Bronze and shows the XP needed for Silver', () => {
    expect(getRankProgress(0)).toMatchObject({
      rank: 'Bronze',
      nextRank: 'Silver',
      xp: 0,
      nextRankXP: 100,
      progressPercent: 0,
    });
  });

  it('moves through rank thresholds correctly', () => {
    expect(getRankProgress(100).rank).toBe('Silver');
    expect(getRankProgress(300).rank).toBe('Gold');
    expect(getRankProgress(600).rank).toBe('Platinum');
    expect(getRankProgress(1_000).rank).toBe('Diamond');
    expect(getRankProgress(1_500).rank).toBe('Master');
    expect(getRankProgress(2_500)).toMatchObject({
      rank: 'Grandmaster',
      nextRank: null,
      progressPercent: 100,
    });
  });

  it('awards XP once for a discovery and prevents repeat farming', () => {
    const first = awardDiscovery({ xp: 0, completedDiscoveries: [] }, 'whispering-first-discovery');
    expect(first.awarded).toBe(XP_PER_DISCOVERY);
    expect(first.progression.xp).toBe(100);

    const repeat = awardDiscovery(first.progression, 'whispering-first-discovery');
    expect(repeat.awarded).toBe(0);
    expect(repeat.progression.xp).toBe(100);
  });

  it('safely handles missing, malformed, and untrusted saved data', () => {
    expect(parseProgression(null)).toEqual({ xp: 0, completedDiscoveries: [] });
    expect(parseProgression('{not-json')).toEqual({ xp: 0, completedDiscoveries: [] });
    expect(parseProgression(JSON.stringify({
      xp: -12.4,
      completedDiscoveries: ['whispering', 12, 'whispering', ''],
    }))).toEqual({ xp: 0, completedDiscoveries: ['whispering'] });
  });

  it('does not allow invalid XP totals to produce negative progress', () => {
    expect(getRankProgress(-50)).toMatchObject({ xp: 0, rank: 'Bronze', progressPercent: 0 });
    expect(getRankProgress(Number.NaN).xp).toBe(0);
  });
});
