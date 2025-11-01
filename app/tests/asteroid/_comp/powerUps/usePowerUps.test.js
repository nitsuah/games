import { renderHook, act } from '@testing-library/react';
import usePowerUps from '../../../../_components/effects/usePowerUps';

describe('usePowerUps Hook', () => {
  let mockSetHealth;
  let mockSetTargets;
  let mockShowFlash;
  let mockSetAmmo;

  beforeEach(() => {
    mockSetHealth = jest.fn((fn) => {
      // Simulate useState updater function
      if (typeof fn === 'function') {
        return fn(50); // Current health is 50
      }
    });
    mockSetTargets = jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn([
          { id: 1, speed: 2 },
          { id: 2, speed: 3 },
        ]);
      }
    });
    mockShowFlash = jest.fn();
    mockSetAmmo = jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn({
          spread: 5,
          laser: 0,
          explosive: 10,
        });
      }
    });
  });

  test('should initialize with all power-ups inactive', () => {
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    expect(result.current.shieldActive).toBe(false);
    expect(result.current.rapidFireActive).toBe(false);
    expect(result.current.slowMotionActive).toBe(false);
    expect(result.current.invincibilityActive).toBe(false);
    expect(result.current.speedBoostActive).toBe(false);
  });

  test('should provide handlePowerUpCollect function', () => {
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    expect(typeof result.current.handlePowerUpCollect).toBe('function');
  });

  test('health power-up should restore 25 health when below max', () => {
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    act(() => {
      result.current.handlePowerUpCollect('health');
    });

    expect(mockSetHealth).toHaveBeenCalled();
    // Phase 8: Updated to 250 for stronger initial flash (pulsing effect)
    expect(mockShowFlash).toHaveBeenCalledWith('green', 250);
  });

  test('shield power-up should activate shield', () => {
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    act(() => {
      result.current.handlePowerUpCollect('shield');
    });

    expect(mockShowFlash).toHaveBeenCalledWith('blue', 100);
    expect(result.current.shieldActive).toBe(3);
  });

  test('shield power-up should stack hits', () => {
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    // First shield
    act(() => {
      result.current.handlePowerUpCollect('shield');
    });
    expect(result.current.shieldActive).toBe(3);

    // Second shield should add 3 more
    act(() => {
      result.current.handlePowerUpCollect('shield');
    });
    expect(result.current.shieldActive).toBe(6);
  });

  test('rapid fire power-up should activate for 10 seconds', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    act(() => {
      result.current.handlePowerUpCollect('rapidFire');
    });

    expect(result.current.rapidFireActive).toBe(true);
    expect(mockShowFlash).toHaveBeenCalledWith('red', 100);

    // Fast forward 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.rapidFireActive).toBe(false);
    expect(mockShowFlash).toHaveBeenCalledWith('red', 0);

    jest.useRealTimers();
  });

  test('slow motion power-up should slow targets and add visual effect', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    act(() => {
      result.current.handlePowerUpCollect('slowMotion');
    });

    expect(result.current.slowMotionActive).toBe(true);
    expect(mockShowFlash).toHaveBeenCalledWith('purple', 100);
    expect(mockSetTargets).toHaveBeenCalled();

    // Fast forward 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.slowMotionActive).toBe(false);
    expect(mockShowFlash).toHaveBeenCalledWith('purple', 0);

    jest.useRealTimers();
  });

  test('invincibility power-up should activate for 10 seconds', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    act(() => {
      result.current.handlePowerUpCollect('invincibility');
    });

    expect(result.current.invincibilityActive).toBe(true);
    expect(mockShowFlash).toHaveBeenCalledWith('yellow', 100);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.invincibilityActive).toBe(false);
    expect(mockShowFlash).toHaveBeenCalledWith('yellow', 0);

    jest.useRealTimers();
  });

  test('speed boost power-up should activate for 10 seconds', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    act(() => {
      result.current.handlePowerUpCollect('speedBoost');
    });

    expect(result.current.speedBoostActive).toBe(true);
    expect(mockShowFlash).toHaveBeenCalledWith('orange', 100);

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.speedBoostActive).toBe(false);
    expect(mockShowFlash).toHaveBeenCalledWith('orange', 0);

    jest.useRealTimers();
  });

  test('should handle unknown power-up type gracefully', () => {
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    act(() => {
      result.current.handlePowerUpCollect('unknownType');
    });

    // Should not throw and nothing should change
    expect(result.current.shieldActive).toBe(false);
    expect(result.current.rapidFireActive).toBe(false);
  });

  test('should provide all power-up state setters', () => {
    const { result } = renderHook(() =>
      usePowerUps(mockSetHealth, mockSetTargets, mockShowFlash, mockSetAmmo)
    );

    expect(typeof result.current.setShieldActive).toBe('function');
    expect(typeof result.current.setRapidFireActive).toBe('function');
    expect(typeof result.current.setSlowMotionActive).toBe('function');
    expect(typeof result.current.setInvincibilityActive).toBe('function');
    expect(typeof result.current.setSpeedBoostActive).toBe('function');
  });
});
