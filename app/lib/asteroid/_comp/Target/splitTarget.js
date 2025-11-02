/**
 * Configuration for target splitting behavior
 * 
 * @property {number} VELOCITY_MULTIPLIER - Multiplies parent velocity by this factor.
 *   Range: 1.0-3.0. Higher values create faster, more challenging split targets.
 *   Default 2.0 doubles velocity for dynamic gameplay.
 * 
 * @property {number} SPREAD_FACTOR - Random velocity variation for divergence.
 *   Range: 0.0-1.0. Controls how much fragments spread apart.
 *   Default 0.3 creates noticeable divergence without excessive scatter.
 * 
 * @property {number} BASE_DIVERGENCE - Minimum velocity added for separation.
 *   Range: 0.0-0.1. Ensures fragments separate even when parent is slow/stationary.
 *   Default 0.02 provides subtle separation in all cases.
 */
const SPLIT_CONFIG = {
  VELOCITY_MULTIPLIER: 2,   // How much faster split targets move
  SPREAD_FACTOR: 0.3,       // Random velocity spread for divergence
  BASE_DIVERGENCE: 0.02,    // Base velocity added for separation
};

export function splitTarget(target, nowFn = Date.now) {
  const newSize = target.size * 0.5;
  const newMass = newSize; // Phase 9: Mass based on size
  const offsetRange = target.size + 1; // Use original size + buffer for spread
  const spawnTime = nowFn();
  const newColor =
    newSize > 4
      ? '#0000ff'
      : newSize > 3
      ? '#800080'
      : newSize > 2
      ? '#ff4500'
      : newSize > 1
      ? '#00ffff'
      : '#ffff00';
  
  // Phase 9: Double velocity magnitude and add random spread
  const velocityMultiplier = SPLIT_CONFIG.VELOCITY_MULTIPLIER;
  const spreadFactor = SPLIT_CONFIG.SPREAD_FACTOR;
  
  const baseVx = (target.vx || 0) * velocityMultiplier;
  const baseVy = (target.vy || 0) * velocityMultiplier;
  const baseVz = (target.vz || 0) * velocityMultiplier;
  
  return [
    {
      id: `${target.id}-1`,
      x: target.x + offsetRange,
      y: target.y + Math.random() * offsetRange - offsetRange / 2,
      z: target.z + Math.random() * offsetRange - offsetRange / 2,
      isHit: false,
      size: newSize,
      mass: newMass,
      // Add rightward velocity component + spread
      vx: baseVx + (SPLIT_CONFIG.BASE_DIVERGENCE + Math.random() * spreadFactor),
      vy: baseVy + (Math.random() - 0.5) * spreadFactor,
      vz: baseVz + (Math.random() - 0.5) * spreadFactor,
      color: newColor,
      spawnTime,
    },
    {
      id: `${target.id}-2`,
      x: target.x - offsetRange,
      y: target.y + Math.random() * offsetRange - offsetRange / 2,
      z: target.z + Math.random() * offsetRange - offsetRange / 2,
      isHit: false,
      size: newSize,
      mass: newMass,
      // Add leftward velocity component + spread
      vx: baseVx - (SPLIT_CONFIG.BASE_DIVERGENCE + Math.random() * spreadFactor),
      vy: baseVy + (Math.random() - 0.5) * spreadFactor,
      vz: baseVz + (Math.random() - 0.5) * spreadFactor,
      color: newColor,
      spawnTime,
    },
  ];
}
