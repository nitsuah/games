import {
  FLASH_COLORS,
  DEFAULT_TARGET_COLOR,
  WEAPON_CONFIG,
  FIRE_RATES,
  WEAPON_TYPES,
  POWER_UP_COLORS,
  MIN_ALIVE_TIME,
  PLAYER_SPHERE_RADIUS,
  EXPLOSION_DURATION,
  INITIAL_AMMO,
  INITIAL_HEALTH,
  SCORE_VALUES,
  PLAYER_PHYSICS,
} from '@/lib/asteroid/_comp/config';

describe('asteroid config', () => {
  test('exports expected core constants', () => {
    expect(DEFAULT_TARGET_COLOR).toBe('#00ff00');
    expect(MIN_ALIVE_TIME).toBe(2);
    expect(PLAYER_SPHERE_RADIUS).toBe(2.0);
    expect(EXPLOSION_DURATION).toBe(120);
    expect(INITIAL_HEALTH).toBe(100);
  });

  test('contains expected flash and power-up colors', () => {
    expect(FLASH_COLORS).toEqual(
      expect.objectContaining({
        red: 'rgba(255,0,0,0.3)',
        green: 'rgba(0,255,0,0.3)',
        blue: 'rgba(0,0,255,0.3)',
      })
    );

    expect(POWER_UP_COLORS).toEqual(
      expect.objectContaining({
        health: 'green',
        shield: 'blue',
        rapidFire: 'red',
        slowMotion: 'purple',
        invincibility: 'yellow',
        speedBoost: 'orange',
      })
    );
  });

  test('defines fire rates and score values', () => {
    expect(FIRE_RATES).toEqual({
      LASER_CONTINUOUS: 50,
      RAPID_FIRE_POWER_UP: 300,
    });

    expect(SCORE_VALUES).toEqual({
      hit: 10,
      split: 5,
      miss: -2,
    });
  });

  test('has expected weapon configuration shape', () => {
    expect(WEAPON_CONFIG.spread).toEqual(expect.objectContaining({ angle: 0.15, count: 12, range: 80 }));
    expect(WEAPON_CONFIG.laser).toEqual(expect.objectContaining({ color: 'cyan', range: 400 }));
    expect(WEAPON_CONFIG.explosive).toEqual(expect.objectContaining({ radius: 15, color: 'orange' }));
    expect(WEAPON_CONFIG.aa).toEqual(expect.objectContaining({ radius: 15, cannonOffset: 1.5, color: '#00ff00' }));
    expect(WEAPON_CONFIG.plasma).toEqual(expect.objectContaining({ radius: 40, color: '#ff00ff', chargeTime: 1500 }));
  });

  test('derives INITIAL_AMMO from WEAPON_TYPES', () => {
    const getMaxAmmo = (key) => WEAPON_TYPES.find((w) => w.key === key).maxAmmo;

    expect(INITIAL_AMMO).toEqual({
      spread: getMaxAmmo('spread'),
      laser: getMaxAmmo('laser'),
      explosive: getMaxAmmo('explosive'),
      aa: getMaxAmmo('aa'),
      plasma: getMaxAmmo('plasma'),
    });
  });

  test('contains tuned player physics constants', () => {
    expect(PLAYER_PHYSICS).toEqual(
      expect.objectContaining({
        BASE_ACCELERATION: 8.0,
        SPEED_BOOST_ACCELERATION: 32.0,
        MAX_VELOCITY: 0.45,
        SPEED_BOOST_MAX_VELOCITY: 1.6,
        DRAG_COEFFICIENT: 0.96,
        VELOCITY_THRESHOLD: 0.001,
        ANGULAR_DRAG: 0.92,
        ROLL_ACCELERATION: 0.8,
        YAW_ACCELERATION: 0.6,
        MAX_ANGULAR_VELOCITY: 1.5,
      })
    );
  });
});
