import { handleHealthDepletion } from '../../../../lib/asteroid/_comp/Game/handleHealthDepletion';

describe('handleHealthDepletion - Health Management', () => {
  let mockSetHealth;
  let mockSetGameOver;
  let mockPauseSound;
  let mockPlaySound;
  let mockShowFlash;
  let mockSetShieldActive;
  let consoleLogSpy;

  beforeEach(() => {
    mockSetHealth = jest.fn((fn) => {
      if (typeof fn === 'function') {
        const result = fn(100); // Default health
        return result;
      }
      return fn;
    });
    mockSetGameOver = jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn(false);
      }
      return fn;
    });
    mockPauseSound = jest.fn();
    mockPlaySound = jest.fn();
    mockShowFlash = jest.fn();
    mockSetShieldActive = jest.fn();
    
    // Mock document.exitPointerLock
    global.document.exitPointerLock = jest.fn();
    
    // Spy on console.log to suppress output in tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('should not reduce health when invincibility is active', () => {
    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: true,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockSetHealth).not.toHaveBeenCalled();
    expect(mockSetGameOver).not.toHaveBeenCalled();
    expect(mockShowFlash).not.toHaveBeenCalled();
  });

  test('should disable shield and play sound when shield is active', () => {
    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: true,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockSetShieldActive).toHaveBeenCalledWith(false);
    expect(mockPlaySound).toHaveBeenCalledWith('hit');
    expect(mockSetHealth).not.toHaveBeenCalled();
    expect(mockSetGameOver).not.toHaveBeenCalled();
  });

  test('should trigger game over when health is already 0', () => {
    handleHealthDepletion({
      health: 0,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockSetGameOver).toHaveBeenCalled();
    expect(mockPauseSound).toHaveBeenCalledWith('bgm');
    expect(mockPlaySound).toHaveBeenCalledWith('gameOver');
    expect(document.exitPointerLock).toHaveBeenCalled();
    expect(mockSetHealth).not.toHaveBeenCalled();
  });

  test('should trigger game over when health is negative', () => {
    handleHealthDepletion({
      health: -10,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockSetGameOver).toHaveBeenCalled();
    expect(mockPauseSound).toHaveBeenCalledWith('bgm');
    expect(mockPlaySound).toHaveBeenCalledWith('gameOver');
  });

  test('should reduce health by 10 HP and show red flash', () => {
    mockSetHealth.mockImplementation((fn) => {
      if (typeof fn === 'function') {
        return fn(50); // Start with 50 HP
      }
      return fn;
    });

    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockSetHealth).toHaveBeenCalled();
    
    // Capture the updater function and call it
    const healthUpdater = mockSetHealth.mock.calls[0][0];
    const newHealth = healthUpdater(50);
    expect(newHealth).toBe(40); // 50 - 10 = 40
    
    expect(mockShowFlash).toHaveBeenCalledWith('red', 100);
  });

  test('should clamp health to 0 minimum', () => {
    mockSetHealth.mockImplementation((fn) => {
      if (typeof fn === 'function') {
        return fn(5); // Start with 5 HP (less than damage)
      }
      return fn;
    });

    handleHealthDepletion({
      health: 5,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    const healthUpdater = mockSetHealth.mock.calls[0][0];
    const newHealth = healthUpdater(5);
    expect(newHealth).toBe(0); // Clamped to 0, not -5
  });

  test('should trigger game over when health reaches 0 after damage', () => {
    mockSetHealth.mockImplementation((fn) => {
      if (typeof fn === 'function') {
        const newHealth = fn(10); // Start with exactly 10 HP
        return newHealth;
      }
      return fn;
    });

    handleHealthDepletion({
      health: 10,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    // Call the health updater to simulate reaching 0
    const healthUpdater = mockSetHealth.mock.calls[0][0];
    healthUpdater(10);

    // When health reaches 0 inside the updater, game over should trigger
    expect(mockSetGameOver).toHaveBeenCalledWith(true);
    expect(mockPauseSound).toHaveBeenCalledWith('bgm');
    expect(mockPlaySound).toHaveBeenCalledWith('gameOver');
    expect(document.exitPointerLock).toHaveBeenCalled();
  });

  test('should not re-trigger game over if already game over', () => {
    mockSetGameOver.mockImplementation((fn) => {
      if (typeof fn === 'function') {
        return fn(true); // Game is already over
      }
      return fn;
    });

    handleHealthDepletion({
      health: 0,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    // Game over setter is called with an updater function
    expect(mockSetGameOver).toHaveBeenCalled();
    
    // The updater function checks if game is already over and returns early without calling sounds
    const gameOverUpdater = mockSetGameOver.mock.calls[0][0];
    const result = gameOverUpdater(true); // Already game over
    expect(result).toBe(true); // Returns previous state
    
    // Sounds should NOT be called when game is already over (early return in updater)
    expect(mockPauseSound).not.toHaveBeenCalled();
    expect(mockPlaySound).not.toHaveBeenCalled();
  });

  test('should log debug information to console', () => {
    consoleLogSpy.mockRestore(); // Actually check logs
    consoleLogSpy = jest.spyOn(console, 'log');

    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('handleHealthDepletion called');
    expect(consoleLogSpy).toHaveBeenCalledWith('Current Health: 50');
    expect(consoleLogSpy).toHaveBeenCalledWith('Reducing health by 10');
  });

  test('should handle invincibility priority over shield', () => {
    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: true,
      shieldActive: true, // Both active, invincibility takes priority
      setShieldActive: mockSetShieldActive,
    });

    // Invincibility checked first, so shield should not be disabled
    expect(mockSetShieldActive).not.toHaveBeenCalled();
    expect(mockPlaySound).not.toHaveBeenCalled();
    expect(mockSetHealth).not.toHaveBeenCalled();
  });

  test('should show red flash with 100ms duration', () => {
    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockShowFlash).toHaveBeenCalledWith('red', 100);
  });

  test('should not show flash when invincible or shielded', () => {
    // Test with invincibility
    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: true,
      shieldActive: false,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockShowFlash).not.toHaveBeenCalled();

    // Reset mocks
    mockShowFlash.mockClear();

    // Test with shield
    handleHealthDepletion({
      health: 50,
      setHealth: mockSetHealth,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      showFlash: mockShowFlash,
      invincibilityActive: false,
      shieldActive: true,
      setShieldActive: mockSetShieldActive,
    });

    expect(mockShowFlash).not.toHaveBeenCalled();
  });
});
