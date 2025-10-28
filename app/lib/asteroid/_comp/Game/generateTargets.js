import { now } from '@/utils/time';

/**
 * Generate initial targets for game restart
 * @param {number} count - Number of targets to generate
 * @returns {Array} Array of target objects
 */
export const generateInitialTargets = (count = 10) => {
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
  ];

  return patterns.slice(0, count).map((pos, index) => {
    // Random size between 5-15 (small to large targets)
    const size = 5 + Math.random() * 10;
    // Color based on size: small=green, medium=yellow, large=red
    const color = size < 8 ? '#00ff00' : size < 12 ? '#ffff00' : '#ff4400';
    
    return {
      id: index + 1,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      isHit: false,
      size,
      speed: 10,
      color,
      spawnTime: now(),
    };
  });
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
