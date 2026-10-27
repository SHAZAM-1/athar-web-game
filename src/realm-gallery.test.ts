import { describe, expect, it } from 'vitest';
import { REALM_CREATURES } from './realm-creatures';
import { renderCreatureSvg } from './realm-gallery';

describe('rendered guardian bestiary artwork', () => {
  it('renders a named SVG illustration with each guardian palette', () => {
    expect(REALM_CREATURES).toHaveLength(12);
    for (const creature of REALM_CREATURES) {
      const svg = renderCreatureSvg(creature);
      expect(svg).toContain('<svg');
      expect(svg).toContain(`aria-label="${creature.name}, ${creature.species}"`);
      expect(svg).toContain(`#${creature.body.toString(16).padStart(6, '0')}`);
      expect(svg).toContain(`#${creature.glow.toString(16).padStart(6, '0')}`);
      expect(svg).toContain(`#${creature.accent.toString(16).padStart(6, '0')}`);
      expect(svg).toContain('<g class="guardian-creature">');
    }
  });

  it('uses twelve distinct creature forms rather than repeating one silhouette', () => {
    expect(new Set(REALM_CREATURES.map((creature) => creature.form)).size).toBe(12);
  });
});
