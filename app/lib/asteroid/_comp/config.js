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
  spread: { angle: 0.15, count: 12, range: 160 }, // Reduced angle from 0.6 to 0.15 for tighter spread
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
