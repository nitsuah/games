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
  spread: { angle: 0.15, count: 12, range: 80 }, // Faster trail fade with lower max range
  laser: { color: 'cyan', range: 400 },
  explosive: { 
    radius: 15, // Reduced from 30 for better balance
    color: 'orange',
  },
  aa: { 
    radius: 15, // Explosion radius for dual cannons
    cannonOffset: 1.5, // Distance from center for left/right cannons
    color: '#00ff00', 
    speed: 1.8, 
    damage: 0.5,
  },
  plasma: { 
    radius: 40, 
    color: '#ff00ff', 
    chargeTime: 1500, 
    damage: 2.0, 
    speed: 0.8,
  },
};

export const WEAPON_TYPES = [
  { key: 'spread', name: 'Spread Shot', maxAmmo: 10, cooldown: 0.3 },
  { key: 'laser', name: 'Laser Beam', maxAmmo: 10, cooldown: 0 },
  { key: 'explosive', name: 'Explosive Shot', maxAmmo: 10, cooldown: 1.5 }, // Longer cooldown for balance
  { key: 'aa', name: 'AA Cannon', maxAmmo: 20, cooldown: 0.25 }, // Phase 9: Fast firing dual cannon
  { key: 'plasma', name: 'Plasma Cannon', maxAmmo: 5, cooldown: 2.0 }, // Phase 9: Powerful charge shot
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

// Initial ammo values derived from WEAPON_TYPES for single source of truth
export const INITIAL_AMMO = {
  spread: WEAPON_TYPES.find(w => w.key === 'spread').maxAmmo,
  laser: WEAPON_TYPES.find(w => w.key === 'laser').maxAmmo,
  explosive: WEAPON_TYPES.find(w => w.key === 'explosive').maxAmmo,
  aa: WEAPON_TYPES.find(w => w.key === 'aa').maxAmmo,
  plasma: WEAPON_TYPES.find(w => w.key === 'plasma').maxAmmo,
};

export const INITIAL_HEALTH = 100;

export const SCORE_VALUES = {
  hit: 10,
  split: 5,
  miss: -2,
};

// Phase 8: Player physics constants for space-like movement with drift/inertia
// Phase 9: Tuned down base speed and boost multiplier per QA feedback
// Further tuning - reduced base speed and boost multiplier for better balance
export const PLAYER_PHYSICS = {
  // Movement physics
  BASE_ACCELERATION: 8.0, // Base acceleration (reduced from 10.0)
  SPEED_BOOST_ACCELERATION: 32.0, // Acceleration during speed boost (reduced from 45.0)
  MAX_VELOCITY: 0.45, // Normal max velocity (reduced from 0.55)
  SPEED_BOOST_MAX_VELOCITY: 1.6, // Max velocity during speed boost (reduced from 2.2)
  DRAG_COEFFICIENT: 0.96, // High value for "tokyo drift feel"
  VELOCITY_THRESHOLD: 0.001, // Stop completely when very slow
  
  // Rotation physics
  ANGULAR_DRAG: 0.92, // Camera rotation drag
  ROLL_ACCELERATION: 0.8, // Roll speed
  YAW_ACCELERATION: 0.6, // Yaw speed
  MAX_ANGULAR_VELOCITY: 1.5, // Max rotation speed
};
