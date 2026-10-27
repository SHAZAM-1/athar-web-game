export type GrassRepulsion = { direction: -1 | 0 | 1; strength: number };

/** A slow, layered breeze with no sharp gusts. */
export function calculateBreeze(timeSeconds: number): number {
  if (!Number.isFinite(timeSeconds)) return 0;
  return Math.sin(timeSeconds * 0.32) * 0.38 + Math.sin(timeSeconds * 0.11) * 0.22;
}

/** Grass and grain lean away from the traveller, then spring gently upright. */
export function getGrassRepulsion(
  bladeX: number,
  bladeY: number,
  characterX: number,
  characterY: number,
  radius = 42,
): GrassRepulsion {
  if (![bladeX, bladeY, characterX, characterY, radius].every(Number.isFinite) || radius <= 0) {
    return { direction: 0, strength: 0 };
  }
  const dx = bladeX - characterX;
  const dy = bladeY - characterY;
  const distance = Math.hypot(dx, dy);
  if (distance >= radius) return { direction: 0, strength: 0 };
  return {
    direction: dx < 0 ? -1 : dx > 0 ? 1 : 0,
    strength: Math.max(0, Math.min(1, 1 - distance / radius)),
  };
}
