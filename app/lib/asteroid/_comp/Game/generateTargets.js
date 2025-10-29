import { now } from '@/utils/time';

/**
 * Generate initial targets for game restart
 * @param {number} count - Number of targets to generate
 * @param {number} wave - Current wave number (affects speed and difficulty)
 * @returns {Array} Array of target objects
 */
export const generateInitialTargets = (count = 10, wave = 1) => {
  const patterns = [
    // Pattern 1: Cardinal directions
    { x: 15, y: 0, z: 0 },
    { x: -15, y: 0, z: 0 },
    { x: 0, y: 15, z: 0 },
    { x: 0, y: -15, z: 0 },

    // Pattern 2: Upper right quadrant
    { x: 12, y: 15, z: 0 },
    { x: 15, y: 17, z: 0 },
    { x: 18, y: 19, z: 0 },

    // Pattern 3: Upper left quadrant
    { x: -12, y: 15, z: 0 },
    { x: -15, y: 17, z: 0 },
    { x: -18, y: 19, z: 0 },

    // Pattern 4: Additional random positions for higher waves
    { x: -10, y: -12, z: 0 },
    { x: 10, y: -12, z: 0 },
    { x: -18, y: -15, z: 0 },
    { x: 18, y: -15, z: 0 },
    { x: -8, y: 8, z: 0 },
  ];

  // Calculate wave difficulty multipliers
  const speedMultiplier = 1 + (wave - 1) * 0.15; // +15% speed per wave
  const baseSpeed = TARGET_CONFIG.DEFAULT_SPEED * speedMultiplier;
  
  // More targets in later waves (cap at 15 targets)
  const targetCount = Math.min(count, patterns.length);

  return patterns.slice(0, targetCount).map((pos, index) => {
    // Random size between 5-15 (small to large targets)
    const size = 5 + Math.random() * 10;
    // Color based on size: small=green, medium=yellow, large=red
    const color = size < 8 ? '#00ff00' : size < 12 ? '#ffff00' : '#ff4400';
    
    // Add slight variation to speed (±20%)
    const speedVariation = 0.8 + Math.random() * 0.4;
    const finalSpeed = baseSpeed * speedVariation;
    
    return {
      id: index + 1,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      isHit: false,
      size,
      speed: finalSpeed,
      color,
      spawnTime: now(),
    };
  });
};

/**
 * Calculate target count for a given wave
 * @param {number} wave - Wave number
 * @returns {number} Number of targets to spawn
 */
export const getTargetCountForWave = (wave) => {
  // Start with 10 targets, increase by 2 every 2 waves, cap at 15
  const baseCount = 10;
  const increment = Math.floor((wave - 1) / 2) * 2;
  return Math.min(baseCount + increment, 15);
};

/**
 * Target configuration constants
 */
export const TARGET_CONFIG = {
  DEFAULT_SIZE: 10,
  DEFAULT_SPEED: 10,
  DEFAULT_COLOR: '#00ff00',
  INITIAL_COUNT: 10,
};
