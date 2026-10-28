/**
 * Small deterministic physics layer for Athar's Three.js prototype.
 * World units are metres-ish; all integration is delta-time based.
 */
export const PHYSICS = Object.freeze({
  walkSpeed: 9,
  runSpeed: 16,
  glideSpeed: 13,
  glideRunSpeed: 19,
  acceleration: 34,
  airAcceleration: 15,
  groundFriction: 22,
  airDrag: 1.1,
  playerRadius: 0.72,
  worldLimit: 300,
  gravity: 9.8,
  glideGravity: 2.2,
  terminalFallSpeed: 18,
  jumpImpulse: 8,
  balloonRiseSpeed: 7,
  balloonSinkSpeed: 6,
  maxBalloonAltitude: 38,
  maxGlideAltitude: 32,
});

export function createPhysicsState(x = 0, z = 0) {
  return { x, z, vx: 0, vz: 0, altitude: 0, verticalVelocity: 0, balloonLift: 0 };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Move with acceleration, drag, world bounds, and axis-separated circle collision. */
export function stepHorizontal(state, inputX, inputZ, dt, {
  running = false,
  flying = false,
  obstacles = [],
  radius = PHYSICS.playerRadius,
} = {}) {
  const safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05);
  let ix = Number.isFinite(inputX) ? inputX : 0;
  let iz = Number.isFinite(inputZ) ? inputZ : 0;
  const magnitude = Math.hypot(ix, iz);
  if (magnitude > 1) { ix /= magnitude; iz /= magnitude; }

  const maxSpeed = flying
    ? (running ? PHYSICS.glideRunSpeed : PHYSICS.glideSpeed)
    : (running ? PHYSICS.runSpeed : PHYSICS.walkSpeed);
  const accel = flying ? PHYSICS.airAcceleration : PHYSICS.acceleration;
  const targetX = ix * maxSpeed;
  const targetZ = iz * maxSpeed;
  const blend = Math.min(1, accel * safeDt / Math.max(maxSpeed, 1));
  state.vx += (targetX - state.vx) * blend;
  state.vz += (targetZ - state.vz) * blend;

  if (magnitude < 1e-5) {
    const drag = Math.max(0, 1 - (flying ? PHYSICS.airDrag : PHYSICS.groundFriction) * safeDt / Math.max(maxSpeed, 1));
    state.vx *= drag;
    state.vz *= drag;
    if (Math.abs(state.vx) < 0.015) state.vx = 0;
    if (Math.abs(state.vz) < 0.015) state.vz = 0;
  }

  const nextX = clamp(state.x + state.vx * safeDt, -PHYSICS.worldLimit, PHYSICS.worldLimit);
  const nextZ = clamp(state.z + state.vz * safeDt, -PHYSICS.worldLimit, PHYSICS.worldLimit);
  const collides = (x, z) => obstacles.some(o => Math.hypot(x - o.x, z - o.z) < (o.r || 0) + radius);

  if (!collides(nextX, state.z)) state.x = nextX;
  else state.vx = 0;
  if (!collides(state.x, nextZ)) state.z = nextZ;
  else state.vz = 0;

  state.x = clamp(state.x, -PHYSICS.worldLimit, PHYSICS.worldLimit);
  state.z = clamp(state.z, -PHYSICS.worldLimit, PHYSICS.worldLimit);
  return state;
}

/** Update altitude for walking, gliding, or balloon travel without frame-rate dependence. */
export function stepVertical(state, dt, {
  mode = 'walk',
  rise = false,
  descend = false,
  hasForwardMotion = false,
} = {}) {
  const safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05);
  if (mode === 'balloon') {
    state.balloonLift = Math.min(22, state.balloonLift + safeDt * 2.8);
    if (rise) state.altitude += safeDt * PHYSICS.balloonRiseSpeed;
    if (descend) state.altitude -= safeDt * PHYSICS.balloonSinkSpeed;
    state.altitude = clamp(state.altitude, 0, PHYSICS.maxBalloonAltitude);
    if (state.altitude < state.balloonLift) state.altitude = Math.min(PHYSICS.maxBalloonAltitude, state.altitude + safeDt * 1.5);
    else if (state.altitude > state.balloonLift + 2) state.altitude = Math.max(state.balloonLift + 2, state.altitude - safeDt * 0.8);
  } else if (mode === 'wings') {
    if (rise) state.verticalVelocity = Math.min(PHYSICS.jumpImpulse, state.verticalVelocity + safeDt * 10);
    if (descend) state.verticalVelocity = Math.max(-9, state.verticalVelocity - safeDt * 13);
    if (hasForwardMotion && state.altitude > 0) state.verticalVelocity = Math.max(-1.4, state.verticalVelocity);
    state.verticalVelocity = Math.max(-PHYSICS.terminalFallSpeed, state.verticalVelocity - safeDt * (state.altitude > 0 ? PHYSICS.glideGravity : PHYSICS.gravity));
    state.altitude = clamp(state.altitude + state.verticalVelocity * safeDt, 0, PHYSICS.maxGlideAltitude);
    if (state.altitude === 0 && state.verticalVelocity < 0) state.verticalVelocity = 0;
    state.balloonLift = 0;
  } else {
    state.altitude = Math.max(0, state.altitude - safeDt * 10);
    state.balloonLift = 0;
    state.verticalVelocity = 0;
  }
  return state;
}
