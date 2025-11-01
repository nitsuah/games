import { restartGame } from '../../../../lib/asteroid/_comp/Game/restartGame';
import { INITIAL_AMMO, INITIAL_HEALTH } from '../../../../lib/asteroid/_comp/config';

// Mock the generateTargets module
jest.mock('../../../../lib/asteroid/_comp/Game/generateTargets', () => ({
  generateInitialTargets: jest.fn((count, wave) => [
    { id: 1, wave, position: [0, 0, 0] },
    { id: 2, wave, position: [5, 5, 5] },
  ]),
}));

describe('restartGame', () => {
  let mockSetters;
  let mockComboTimerRef;

  beforeEach(() => {
    mockComboTimerRef = { current: setTimeout(() => {}, 1000) };
    
    mockSetters = {
      setScore: jest.fn(),
      setHits: jest.fn(),
      setMisses: jest.fn(),
      setGameOver: jest.fn(),
      setHealth: jest.fn(),
      setWeapon: jest.fn(),
      setAmmo: jest.fn(),
      setCooldowns: jest.fn(),
      setTargets: jest.fn(),
      setShieldActive: jest.fn(),
      setRapidFireActive: jest.fn(),
      setSlowMotionActive: jest.fn(),
      setInvincibilityActive: jest.fn(),
      setSpeedBoostActive: jest.fn(),
      setCombo: jest.fn(),
      setComboMultiplier: jest.fn(),
      comboTimerRef: mockComboTimerRef,
      setCurrentWave: jest.fn(),
      setShowWaveTransition: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should reset score, hits, and misses to 0', () => {
    restartGame(mockSetters);

    expect(mockSetters.setScore).toHaveBeenCalledWith(0);
    expect(mockSetters.setHits).toHaveBeenCalledWith(0);
    expect(mockSetters.setMisses).toHaveBeenCalledWith(0);
  });

  test('should set game over to false', () => {
    restartGame(mockSetters);

    expect(mockSetters.setGameOver).toHaveBeenCalledWith(false);
  });

  test('should restore health to INITIAL_HEALTH', () => {
    restartGame(mockSetters);

    expect(mockSetters.setHealth).toHaveBeenCalledWith(INITIAL_HEALTH);
  });

  test('should reset weapon to spread', () => {
    restartGame(mockSetters);

    expect(mockSetters.setWeapon).toHaveBeenCalledWith('spread');
  });

  test('should restore ammo to INITIAL_AMMO', () => {
    restartGame(mockSetters);

    expect(mockSetters.setAmmo).toHaveBeenCalledWith({ ...INITIAL_AMMO });
  });

  test('should reset all weapon cooldowns to 0', () => {
    restartGame(mockSetters);

    expect(mockSetters.setCooldowns).toHaveBeenCalledWith({
      spread: 0,
      laser: 0,
      explosive: 0,
    });
  });

  test('should deactivate all power-ups', () => {
    restartGame(mockSetters);

    expect(mockSetters.setShieldActive).toHaveBeenCalledWith(false);
    expect(mockSetters.setRapidFireActive).toHaveBeenCalledWith(false);
    expect(mockSetters.setSlowMotionActive).toHaveBeenCalledWith(false);
    expect(mockSetters.setInvincibilityActive).toHaveBeenCalledWith(false);
    expect(mockSetters.setSpeedBoostActive).toHaveBeenCalledWith(false);
  });

  test('should reset combo and multiplier', () => {
    restartGame(mockSetters);

    expect(mockSetters.setCombo).toHaveBeenCalledWith(0);
    expect(mockSetters.setComboMultiplier).toHaveBeenCalledWith(1);
  });

  test('should clear combo timer if active', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    restartGame(mockSetters);

    expect(clearTimeoutSpy).toHaveBeenCalledWith(mockComboTimerRef.current);
    
    clearTimeoutSpy.mockRestore();
  });

  test('should handle missing combo timer gracefully', () => {
    const settersWithoutTimer = {
      ...mockSetters,
      comboTimerRef: { current: null },
    };

    expect(() => restartGame(settersWithoutTimer)).not.toThrow();
  });

  test('should reset to wave 1', () => {
    restartGame(mockSetters);

    expect(mockSetters.setCurrentWave).toHaveBeenCalledWith(1);
  });

  test('should hide wave transition', () => {
    restartGame(mockSetters);

    expect(mockSetters.setShowWaveTransition).toHaveBeenCalledWith(false);
  });

  test('should generate initial targets for wave 1', () => {
    restartGame(mockSetters);

    expect(mockSetters.setTargets).toHaveBeenCalledWith([
      { id: 1, wave: 1, position: [0, 0, 0] },
      { id: 2, wave: 1, position: [5, 5, 5] },
    ]);
  });

  test('should handle optional wave setters gracefully', () => {
    const settersWithoutWave = {
      ...mockSetters,
      setCurrentWave: undefined,
      setShowWaveTransition: undefined,
    };

    expect(() => restartGame(settersWithoutWave)).not.toThrow();
  });

  test('should reset all game state in single call', () => {
    restartGame(mockSetters);

    // Verify all critical setters were called
    expect(mockSetters.setScore).toHaveBeenCalled();
    expect(mockSetters.setHealth).toHaveBeenCalled();
    expect(mockSetters.setGameOver).toHaveBeenCalled();
    expect(mockSetters.setWeapon).toHaveBeenCalled();
    expect(mockSetters.setAmmo).toHaveBeenCalled();
    expect(mockSetters.setTargets).toHaveBeenCalled();
    expect(mockSetters.setCombo).toHaveBeenCalled();
  });
});
