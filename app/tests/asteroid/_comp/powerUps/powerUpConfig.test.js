jest.mock('@/utils/audio/SoundManager', () => ({
  __esModule: true,
  default: {
    playPowerUpCollect: jest.fn(),
    playPowerUpActivate: jest.fn(),
    playPowerUpDeactivate: jest.fn(),
  },
}));

import soundManager from '@/utils/audio/SoundManager';
import { POWER_UPS } from '@/_components/effects/powerUpConfig';
import { INITIAL_AMMO } from '@/lib/asteroid/_comp/config';

const byType = (type) => POWER_UPS.find((p) => p.type === type);

// Run a React-style state updater against a value and capture the result.
const stateSetter = (initial) => {
  const setter = jest.fn((update) => {
    setter.value = typeof update === 'function' ? update(setter.value) : update;
  });
  setter.value = initial;
  return setter;
};

describe('POWER_UPS', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('defines every power-up type once', () => {
    expect(POWER_UPS.map((p) => p.type)).toEqual([
      'health',
      'speedBoost',
      'shield',
      'invincibility',
      'rapidFire',
      'slowMotion',
    ]);
  });

  describe('health', () => {
    it('heals 25 (capped at 100) and pulses green', () => {
      const setHealth = stateSetter(90);
      const setAmmo = stateSetter({ ...INITIAL_AMMO, laser: 0 });
      const showFlash = jest.fn();
      const cleanup = byType('health').effect({ setHealth, setAmmo, showFlash });
      expect(setHealth.value).toBe(100);
      expect(setAmmo).not.toHaveBeenCalled(); // health took priority
      expect(soundManager.playPowerUpCollect).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(650);
      expect(showFlash).toHaveBeenCalledTimes(7);
      expect(showFlash).toHaveBeenLastCalledWith('green', 0);
      expect(typeof cleanup).toBe('function');
    });

    it('refills all ammo when health is full but ammo is not', () => {
      const setHealth = stateSetter(100);
      const setAmmo = stateSetter({ ...INITIAL_AMMO, spread: 1, plasma: 0 });
      const showFlash = jest.fn();
      byType('health').effect({ setHealth, setAmmo, showFlash });
      expect(setHealth.value).toBe(100);
      expect(setAmmo.value).toEqual(INITIAL_AMMO);
      expect(soundManager.playPowerUpCollect).toHaveBeenCalledTimes(1);
    });

    it('is not collected when health and ammo are both full', () => {
      const setHealth = stateSetter(100);
      const setAmmo = stateSetter({ ...INITIAL_AMMO });
      const showFlash = jest.fn();
      const cleanup = byType('health').effect({ setHealth, setAmmo, showFlash });
      expect(cleanup).toBeUndefined();
      expect(setAmmo.value).toEqual(INITIAL_AMMO);
      expect(soundManager.playPowerUpCollect).not.toHaveBeenCalled();
      jest.runAllTimers();
      expect(showFlash).not.toHaveBeenCalled();
    });

    it('treats unknown ammo keys as having a max of 0', () => {
      const setHealth = stateSetter(100);
      const setAmmo = stateSetter({ ...INITIAL_AMMO, mystery: 0 });
      byType('health').effect({ setHealth, setAmmo, showFlash: jest.fn() });
      expect(soundManager.playPowerUpCollect).not.toHaveBeenCalled();
    });

    it('works without an ammo setter', () => {
      const setHealth = stateSetter(100);
      expect(byType('health').effect({ setHealth, showFlash: jest.fn() })).toBeUndefined();
    });

    it('cleanup cancels pending pulse flashes', () => {
      const showFlash = jest.fn();
      const cleanup = byType('health').effect({ setHealth: stateSetter(10), showFlash });
      jest.advanceTimersByTime(150);
      cleanup();
      jest.runAllTimers();
      expect(showFlash).toHaveBeenCalledTimes(2);
    });
  });

  describe.each([
    ['speedBoost', 'setSpeedBoostActive', 'orange', 'default'],
    ['invincibility', 'setInvincibilityActive', 'yellow', 'default'],
    ['rapidFire', 'setRapidFireActive', 'red', 'rapidFire'],
  ])('%s (timed)', (type, setterName, color, sound) => {
    it(`activates, flashes ${color}, and deactivates after 10s`, () => {
      const setActive = jest.fn();
      const showFlash = jest.fn();
      byType(type).effect({ [setterName]: setActive, showFlash });
      expect(setActive).toHaveBeenLastCalledWith(true);
      expect(showFlash).toHaveBeenLastCalledWith(color, 100);
      expect(soundManager.playPowerUpActivate).toHaveBeenCalledWith(sound);
      jest.advanceTimersByTime(9999);
      expect(setActive).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1);
      expect(setActive).toHaveBeenLastCalledWith(false);
      expect(showFlash).toHaveBeenLastCalledWith(color, 0);
      expect(soundManager.playPowerUpDeactivate).toHaveBeenCalled();
    });

    it('cleanup cancels the pending deactivation', () => {
      const setActive = jest.fn();
      const cleanup = byType(type).effect({ [setterName]: setActive, showFlash: jest.fn() });
      cleanup();
      jest.runAllTimers();
      expect(setActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('shield', () => {
    it('stacks 3 hit points onto any existing shield', () => {
      const setShieldActive = stateSetter(undefined);
      const showFlash = jest.fn();
      byType('shield').effect({ setShieldActive, showFlash });
      expect(setShieldActive.value).toBe(3);
      byType('shield').effect({ setShieldActive, showFlash });
      expect(setShieldActive.value).toBe(6);
      expect(showFlash).toHaveBeenCalledWith('blue', 100);
      expect(soundManager.playPowerUpActivate).toHaveBeenCalledWith('shield');
    });
  });

  describe('slowMotion', () => {
    it('halves target speed, then restores the original speed after 10s', () => {
      const setSlowMotionActive = jest.fn();
      const setTargets = stateSetter([
        { id: 1, speed: 4 },
        { id: 2, speed: 2, originalSpeed: 8 }, // already slowed once
      ]);
      const showFlash = jest.fn();
      byType('slowMotion').effect({ setSlowMotionActive, setTargets, showFlash });
      expect(setSlowMotionActive).toHaveBeenCalledWith(true);
      expect(setTargets.value).toEqual([
        { id: 1, speed: 2, originalSpeed: 4 },
        { id: 2, speed: 1, originalSpeed: 8 },
      ]);
      jest.advanceTimersByTime(10000);
      expect(setSlowMotionActive).toHaveBeenLastCalledWith(false);
      expect(showFlash).toHaveBeenLastCalledWith('purple', 0);
      expect(setTargets.value.map((t) => t.speed)).toEqual([4, 8]);
      expect(setTargets.value.every((t) => t.originalSpeed === undefined)).toBe(true);
    });

    it('falls back to doubling speed for targets spawned during slow-mo', () => {
      const setTargets = stateSetter([]);
      byType('slowMotion').effect({ setSlowMotionActive: jest.fn(), setTargets, showFlash: jest.fn() });
      setTargets.value = [{ id: 'split', speed: 3 }];
      jest.advanceTimersByTime(10000);
      expect(setTargets.value[0].speed).toBe(6);
      expect(console.warn).toHaveBeenCalled();
    });

    it('cleanup cancels the restore', () => {
      const setSlowMotionActive = jest.fn();
      const cleanup = byType('slowMotion').effect({
        setSlowMotionActive,
        setTargets: stateSetter([]),
        showFlash: jest.fn(),
      });
      cleanup();
      jest.runAllTimers();
      expect(setSlowMotionActive).toHaveBeenCalledTimes(1);
    });
  });
});
