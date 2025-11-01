import { handlePlayerHit } from '../../../../lib/asteroid/_comp/Game/handlePlayerHit';

describe('handlePlayerHit - Defense and Damage Logic', () => {
  let mockSetHealth;
  let mockSetShieldActive;
  let mockShowFlash;
  let mockPlaySound;
  let consoleLogSpy;

  beforeEach(() => {
    mockSetHealth = jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn(100); // Current health is 100
      }
    });
    mockSetShieldActive = jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn(3); // Current shield has 3 hits
      }
    });
    mockShowFlash = jest.fn();
    mockPlaySound = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.clearAllMocks();
  });

  test('should ignore damage when invincible', () => {
    const params = {
      targetSize: 5,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: false,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: true,
      },
    };

    handlePlayerHit(params);

    expect(mockSetHealth).not.toHaveBeenCalled();
    expect(mockShowFlash).toHaveBeenCalledWith('yellow', 200);
    expect(mockPlaySound).not.toHaveBeenCalled();
  });

  test('should reduce shield hits when shield is active', () => {
    const params = {
      targetSize: 5,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: 3,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    expect(mockSetShieldActive).toHaveBeenCalled();
    expect(mockSetHealth).not.toHaveBeenCalled();
    expect(mockShowFlash).toHaveBeenCalledWith('cyan', 200);
    expect(mockPlaySound).toHaveBeenCalledWith('hit');
  });

  test('should show blue flash when shield depletes to 0', () => {
    mockSetShieldActive = jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn(1); // Shield has only 1 hit left
      }
    });

    const params = {
      targetSize: 5,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: 1,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    expect(mockShowFlash).toHaveBeenCalledWith('blue', 300);
  });

  test('should reduce health when no defense active', () => {
    const params = {
      targetSize: 5,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: false,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    expect(mockSetHealth).toHaveBeenCalled();
    expect(mockShowFlash).toHaveBeenCalledWith('red', 500);
    expect(mockPlaySound).toHaveBeenCalledWith('hit');
  });

  test('should calculate damage based on target size', () => {
    let capturedHealthUpdater;
    mockSetHealth = jest.fn((fn) => {
      capturedHealthUpdater = fn;
    });

    const params = {
      targetSize: 5,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: false,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    // Target size 5 -> damage = targetSize * 2 = 10
    const newHealth = capturedHealthUpdater(100);
    expect(newHealth).toBe(90); // 100 - 10
  });

  test('should limit minimum damage to 5', () => {
    let capturedHealthUpdater;
    mockSetHealth = jest.fn((fn) => {
      capturedHealthUpdater = fn;
    });

    const params = {
      targetSize: 1, // Very small target
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: false,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    // Should be minimum 5 damage
    const newHealth = capturedHealthUpdater(100);
    expect(newHealth).toBe(95); // 100 - 5
  });

  test('should limit maximum damage to 20', () => {
    let capturedHealthUpdater;
    mockSetHealth = jest.fn((fn) => {
      capturedHealthUpdater = fn;
    });

    const params = {
      targetSize: 20, // Very large target (would be 40 damage without cap)
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: false,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    // Should be capped at 20 damage
    const newHealth = capturedHealthUpdater(100);
    expect(newHealth).toBe(80); // 100 - 20
  });

  test('should not reduce health below 0', () => {
    let capturedHealthUpdater;
    mockSetHealth = jest.fn((fn) => {
      capturedHealthUpdater = fn;
    });

    const params = {
      targetSize: 10,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: false,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    // Health is 5, damage would be 20, should floor at 0
    const newHealth = capturedHealthUpdater(5);
    expect(newHealth).toBe(0);
  });

  test('should log when health reaches 0', () => {
    let capturedHealthUpdater;
    mockSetHealth = jest.fn((fn) => {
      capturedHealthUpdater = fn;
    });

    const params = {
      targetSize: 10,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: false,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);
    capturedHealthUpdater(5); // This will bring health to 0

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Health depleted - game over imminent'
    );
  });

  test('should handle shield active as number correctly', () => {
    const params = {
      targetSize: 5,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: 5,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: false,
      },
    };

    handlePlayerHit(params);

    expect(mockSetShieldActive).toHaveBeenCalled();
    expect(mockSetHealth).not.toHaveBeenCalled();
  });

  test('should prioritize invincibility over shield', () => {
    const params = {
      targetSize: 5,
      setHealth: mockSetHealth,
      showFlash: mockShowFlash,
      playSound: mockPlaySound,
      defense: {
        shieldActive: 3,
        setShieldActive: mockSetShieldActive,
        invincibilityActive: true,
      },
    };

    handlePlayerHit(params);

    expect(mockSetShieldActive).not.toHaveBeenCalled();
    expect(mockSetHealth).not.toHaveBeenCalled();
    expect(mockShowFlash).toHaveBeenCalledWith('yellow', 200);
  });
});
