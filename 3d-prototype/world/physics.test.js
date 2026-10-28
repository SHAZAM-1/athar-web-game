import { describe, expect, it } from 'vitest';
import { createPhysicsState, PHYSICS, stepHorizontal, stepVertical } from './physics.js';

describe('Athar movement physics', () => {
  it('accelerates smoothly and reaches a finite running speed', () => {
    const state = createPhysicsState();
    for (let i = 0; i < 120; i++) stepHorizontal(state, 0, -1, 1 / 60, { running: true });
    expect(state.vz).toBeLessThan(0);
    expect(Math.abs(state.vz)).toBeLessThanOrEqual(PHYSICS.runSpeed);
    expect(state.z).toBeLessThan(0);
  });

  it('normalizes diagonal input so it is not faster than straight movement', () => {
    const straight = createPhysicsState();
    const diagonal = createPhysicsState();
    for (let i = 0; i < 120; i++) {
      stepHorizontal(straight, 1, 0, 1 / 60);
      stepHorizontal(diagonal, 1, -1, 1 / 60);
    }
    expect(Math.hypot(diagonal.vx, diagonal.vz)).toBeLessThanOrEqual(PHYSICS.walkSpeed + 0.001);
  });

  it('stops movement at obstacles', () => {
    const state = createPhysicsState();
    const obstacles = [{ x: 2, z: 0, r: 1 }];
    for (let i = 0; i < 120; i++) stepHorizontal(state, 1, 0, 1 / 60, { obstacles });
    expect(state.x).toBeLessThan(2);
    expect(state.vx).toBe(0);
  });

  it('clamps player coordinates to world boundaries', () => {
    const state = createPhysicsState(PHYSICS.worldLimit - 0.1, 0);
    for (let i = 0; i < 60; i++) stepHorizontal(state, 1, 0, 1 / 60);
    expect(state.x).toBe(PHYSICS.worldLimit);
  });

  it('keeps the balloon at a bounded altitude and lets it rise', () => {
    const state = createPhysicsState();
    for (let i = 0; i < 180; i++) stepVertical(state, 1 / 60, { mode: 'balloon', rise: true });
    expect(state.altitude).toBeGreaterThan(0);
    expect(state.altitude).toBeLessThanOrEqual(PHYSICS.maxBalloonAltitude);
  });

  it('applies gravity to wings and lands at ground level', () => {
    const state = createPhysicsState();
    state.altitude = 5;
    for (let i = 0; i < 180; i++) stepVertical(state, 1 / 60, { mode: 'wings' });
    expect(state.altitude).toBe(0);
    expect(state.verticalVelocity).toBe(0);
  });

  it('does not produce NaN from invalid delta time', () => {
    const state = createPhysicsState();
    stepHorizontal(state, 1, 0, Number.NaN);
    stepVertical(state, Number.NaN, { mode: 'wings', rise: true });
    expect(Number.isFinite(state.x)).toBe(true);
    expect(Number.isFinite(state.altitude)).toBe(true);
  });
});
