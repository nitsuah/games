import { now } from '@/utils/time';
import { getTargetColor } from './colorblindModes';

/**
 * Generate initial targets for game restart
 * @param {number} count - Number of targets to generate
 * @param {number} wave - Current wave number (affects speed and difficulty)
 * @param {string} colorblindMode - Colorblind mode setting ('none', 'deuteranopia', 'protanopia', 'tritanopia')
 * @returns {Array} Array of target objects with velocity vectors (Phase 9)
 */
export const generateInitialTargets = (count = 10, wave = 1, colorblindMode = 'none') => {
  const patterns = [
    // Cardinal directions — spread across the doubled boundary
    { x: 50, y: 0, z: 0 },
    { x: -50, y: 0, z: 0 },
    { x: 0, y: 50, z: 0 },
    { x: 0, y: -50, z: 0 },

    // Diagonal quadrants
    { x: 55, y: 55, z: 10 },
    { x: -55, y: 55, z: -10 },
    { x: 55, y: -55, z: 10 },
    { x: -55, y: -55, z: -10 },

    // Mid-depth positions
    { x: 30, y: -40, z: 40 },
    { x: -30, y: 40, z: -40 },

    // Far corners with z variation
    { x: 75, y: 20, z: -30 },
    { x: -75, y: -20, z: 30 },
    { x: 20, y: 75, z: 20 },
    { x: -20, y: -75, z: -20 },
    { x: 0, y: 0, z: 80 },
  ];

  // Calculate wave difficulty multipliers
  const speedMultiplier = 1 + (wave - 1) * 0.15; // +15% speed per wave
  const baseSpeed = TARGET_CONFIG.DEFAULT_SPEED * speedMultiplier;
  
  // More targets in later waves (cap at 15 targets)
  const targetCount = Math.min(count, patterns.length);

  return patterns.slice(0, targetCount).map((pos, index) => {
    // Random size between 5-15 (small to large targets)
    const size = 5 + Math.random() * 10;
    // Color based on size with colorblind mode support
    const color = getTargetColor(size, colorblindMode);
    
    // Add slight variation to speed (±20%)
    const speedVariation = 0.8 + Math.random() * 0.4;
    const finalSpeed = baseSpeed * speedVariation;
    
    // Phase 9: Generate random velocity vector with specific magnitude
    // Create random direction vector
    const dirX = (Math.random() - 0.5) * 2;
    const dirY = (Math.random() - 0.5) * 2;
    const dirZ = (Math.random() - 0.5) * 2;
    
    // Normalize and scale to finalSpeed magnitude
    const magnitude = Math.sqrt(dirX ** 2 + dirY ** 2 + dirZ ** 2);
    const normalizedSpeed = finalSpeed * 0.02; // Scale factor for game units
    const vx = (dirX / magnitude) * normalizedSpeed;
    const vy = (dirY / magnitude) * normalizedSpeed;
    const vz = (dirZ / magnitude) * normalizedSpeed;
    
    return {
      id: index + 1,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      isHit: false,
      size,
      // Phase 9: velocity vector replaces speed scalar
      vx,
      vy,
      vz,
      mass: size, // Mass based on size for collision physics
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
