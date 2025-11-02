export const FLASH_COLORS = {
  red: 'rgba(255,0,0,0.3)',
  green: 'rgba(0,255,0,0.3)',
  blue: 'rgba(0,0,255,0.3)',
  yellow: 'rgba(255,255,0,0.3)',
  purple: 'rgba(128,0,128,0.3)',
  orange: 'rgba(255,165,0,0.3)',
};

export const DEFAULT_TARGET_COLOR = '#00ff00';

export const WEAPON_CONFIG = {
  // Tighter spread - no longer "soup can wide"
  // Default: single shot. Triple shot only with rapid fire active
  spread: { angle: 0.15, count: 12, range: 80 }, // Reduced max range from 160 to 80 for faster trail fade
  laser: { color: 'cyan', range: 400 },
  explosive: { radius: 30, color: 'orange' }, // Reduced from 50 to 30 for smaller explosion
};

export const WEAPON_TYPES = [
  { key: 'spread', name: 'Spread Shot', maxAmmo: 30, cooldown: 0.3 },
  { key: 'laser', name: 'Laser Beam', maxAmmo: 10, cooldown: 0 },
  { key: 'explosive', name: 'Explosive Shot', maxAmmo: 10, cooldown: 1.5 }, // Increased to 10, longer cooldown
];

export const POWER_UP_COLORS = {
  health: 'green',
  shield: 'blue',
  rapidFire: 'red',
  slowMotion: 'purple',
  invincibility: 'yellow',
  speedBoost: 'orange',
};

export const MIN_ALIVE_TIME = 2; // seconds before a target can be split/hit

export const PLAYER_SPHERE_RADIUS = 2.0; // for collision detection

export const EXPLOSION_DURATION = 120; // ms, for explosion visual timing

export const INITIAL_AMMO = {
  spread: 30,
  laser: 10,
  explosive: 10, // Match the maxAmmo
};

export const INITIAL_HEALTH = 100;

export const SCORE_VALUES = {
  hit: 10,
  split: 5,
  miss: -2,
};

// Phase 8: Player physics constants for space-like movement with drift/inertia
// Phase 9: Tuned down base speed and boost multiplier per QA feedback
export const PLAYER_PHYSICS = {
  // Movement physics
  BASE_ACCELERATION: 10.0, // Base acceleration (reduced from 12.0)
  SPEED_BOOST_ACCELERATION: 45.0, // Acceleration during speed boost (reduced from 60.0)
  MAX_VELOCITY: 0.55, // Normal max velocity (reduced from 0.65)
  SPEED_BOOST_MAX_VELOCITY: 2.2, // Max velocity during speed boost (reduced from 2.8)
  DRAG_COEFFICIENT: 0.96, // High value for "tokyo drift feel"
  VELOCITY_THRESHOLD: 0.001, // Stop completely when very slow
  
  // Rotation physics
  ANGULAR_DRAG: 0.92, // Camera rotation drag
  ROLL_ACCELERATION: 0.8, // Roll speed
  YAW_ACCELERATION: 0.6, // Yaw speed
  MAX_ANGULAR_VELOCITY: 1.5, // Max rotation speed
};
