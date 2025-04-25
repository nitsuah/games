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
  spread: { angle: 0.25, count: 10, range: 100 },
  laser: { color: 'cyan', range: 400 },
  explosive: { radius: 50, color: 'orange' },
};

export const WEAPON_TYPES = [
    { key: 'spread', name: 'Spread Shot', maxAmmo: 30, cooldown: 0.3 },
    { key: 'laser', name: 'Laser Beam', maxAmmo: 10, cooldown: 0 },
    { key: 'explosive', name: 'Explosive Shot', maxAmmo: 5, cooldown: 1 },
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
  explosive: 5,
};

export const INITIAL_HEALTH = 100;

export const SCORE_VALUES = {
  hit: 10,
  split: 5,
  miss: -2,
};
