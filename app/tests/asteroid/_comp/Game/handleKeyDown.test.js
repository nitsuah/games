import { handleKeyDown } from '../../../../lib/asteroid/_comp/Game/handleKeyDown';
import { WEAPON_TYPES } from '../../../../lib/asteroid/_comp/config';

describe('handleKeyDown - Keyboard Controls', () => {
  let mockSetWeapon;
  let mockSetAmmo;
  let mockSetPaused;

  beforeEach(() => {
    mockSetWeapon = jest.fn();
    mockSetAmmo = jest.fn();
    mockSetPaused = jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn(false); // Default: not paused
      }
      return fn;
    });

    // Mock document.pointerLockElement and exitPointerLock
    global.document.pointerLockElement = null;
    global.document.exitPointerLock = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should toggle pause on Escape key', () => {
    const event = { code: 'Escape' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(mockSetPaused).toHaveBeenCalled();
    
    // Verify the updater function toggles
    const pauseUpdater = mockSetPaused.mock.calls[0][0];
    expect(pauseUpdater(false)).toBe(true);
    expect(pauseUpdater(true)).toBe(false);
  });

  test('should exit pointer lock on Escape if locked', () => {
    document.pointerLockElement = document.body; // Simulate pointer lock
    const event = { code: 'Escape' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(document.exitPointerLock).toHaveBeenCalled();
  });

  test('should not call exitPointerLock if not locked', () => {
    document.pointerLockElement = null;
    const event = { code: 'Escape' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(document.exitPointerLock).not.toHaveBeenCalled();
  });

  test('should switch to spread weapon on Digit1', () => {
    const event = { code: 'Digit1' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(mockSetWeapon).toHaveBeenCalledWith('spread');
  });

  test('should switch to laser weapon on Digit2', () => {
    const event = { code: 'Digit2' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(mockSetWeapon).toHaveBeenCalledWith('laser');
  });

  test('should switch to explosive weapon on Digit3', () => {
    const event = { code: 'Digit3' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(mockSetWeapon).toHaveBeenCalledWith('explosive');
  });

  test('should replenish all ammo on KeyR', () => {
    const event = { code: 'KeyR' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(mockSetAmmo).toHaveBeenCalled();
    
    const ammoArg = mockSetAmmo.mock.calls[0][0];
    
    // Verify all ammo types are replenished to max
    const spreadMax = WEAPON_TYPES.find((w) => w.key === 'spread').maxAmmo;
    const laserMax = WEAPON_TYPES.find((w) => w.key === 'laser').maxAmmo;
    const explosiveMax = WEAPON_TYPES.find((w) => w.key === 'explosive').maxAmmo;

    expect(ammoArg.spread).toBe(spreadMax);
    expect(ammoArg.laser).toBe(laserMax);
    expect(ammoArg.explosive).toBe(explosiveMax);
  });

  test('should not trigger any action for unmapped keys', () => {
    const event = { code: 'KeyA' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(mockSetWeapon).not.toHaveBeenCalled();
    expect(mockSetAmmo).not.toHaveBeenCalled();
    expect(mockSetPaused).not.toHaveBeenCalled();
  });

  test('should handle multiple weapon switches', () => {
    const event1 = { code: 'Digit1' };
    const event2 = { code: 'Digit2' };
    const event3 = { code: 'Digit3' };

    handleKeyDown(event1, mockSetWeapon, mockSetAmmo, mockSetPaused);
    handleKeyDown(event2, mockSetWeapon, mockSetAmmo, mockSetPaused);
    handleKeyDown(event3, mockSetWeapon, mockSetAmmo, mockSetPaused);

    expect(mockSetWeapon).toHaveBeenCalledTimes(3);
    expect(mockSetWeapon).toHaveBeenNthCalledWith(1, 'spread');
    expect(mockSetWeapon).toHaveBeenNthCalledWith(2, 'laser');
    expect(mockSetWeapon).toHaveBeenNthCalledWith(3, 'explosive');
  });

  test('should return early after Escape without processing other keys', () => {
    const event = { code: 'Escape' };

    handleKeyDown(event, mockSetWeapon, mockSetAmmo, mockSetPaused);

    // After Escape, no weapon or ammo changes should occur
    expect(mockSetWeapon).not.toHaveBeenCalled();
    expect(mockSetAmmo).not.toHaveBeenCalled();
  });
});
