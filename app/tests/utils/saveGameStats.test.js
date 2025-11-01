import {
  saveHighScore,
  saveBestAccuracy,
  calculateAccuracy,
  saveGameStats,
} from '../../utils/saveGameStats';

describe('saveGameStats - Game Statistics Management', () => {
  let mockSetHighScore;
  let mockSetBestAccuracy;
  let mockSetIsNewHighScore;
  let consoleWarnSpy;

  beforeEach(() => {
    mockSetHighScore = jest.fn();
    mockSetBestAccuracy = jest.fn();
    mockSetIsNewHighScore = jest.fn();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
      },
      writable: true,
    });

    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('saveHighScore', () => {
    test('should save new high score when score exceeds current', () => {
      const result = saveHighScore(1000, 500, mockSetHighScore, mockSetIsNewHighScore);

      expect(mockSetHighScore).toHaveBeenCalledWith(1000);
      expect(mockSetIsNewHighScore).toHaveBeenCalledWith(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('asteroidHighScore', '1000');
      expect(result).toBe(true);
    });

    test('should not save when score does not exceed current', () => {
      const result = saveHighScore(500, 1000, mockSetHighScore, mockSetIsNewHighScore);

      expect(mockSetHighScore).not.toHaveBeenCalled();
      expect(mockSetIsNewHighScore).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should not save when score equals current', () => {
      const result = saveHighScore(1000, 1000, mockSetHighScore, mockSetIsNewHighScore);

      expect(mockSetHighScore).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should handle localStorage errors gracefully', () => {
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = saveHighScore(1000, 500, mockSetHighScore, mockSetIsNewHighScore);

      expect(mockSetHighScore).toHaveBeenCalledWith(1000);
      expect(result).toBe(false);
    });

    test('should log warning in development on localStorage error', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      consoleWarnSpy.mockRestore();
      consoleWarnSpy = jest.spyOn(console, 'warn');

      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      saveHighScore(1000, 500, mockSetHighScore, mockSetIsNewHighScore);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save high score:', expect.any(Error));

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('saveBestAccuracy', () => {
    test('should save new best accuracy when accuracy exceeds current', () => {
      const result = saveBestAccuracy(95.5, 80.0, mockSetBestAccuracy);

      expect(mockSetBestAccuracy).toHaveBeenCalledWith(95.5);
      expect(localStorage.setItem).toHaveBeenCalledWith('asteroidBestAccuracy', '95.5');
      expect(result).toBe(true);
    });

    test('should not save when accuracy does not exceed current', () => {
      const result = saveBestAccuracy(70.0, 80.0, mockSetBestAccuracy);

      expect(mockSetBestAccuracy).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should not save when accuracy equals current', () => {
      const result = saveBestAccuracy(80.0, 80.0, mockSetBestAccuracy);

      expect(mockSetBestAccuracy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should handle localStorage errors gracefully', () => {
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = saveBestAccuracy(95.5, 80.0, mockSetBestAccuracy);

      expect(mockSetBestAccuracy).toHaveBeenCalledWith(95.5);
      expect(result).toBe(false);
    });

    test('should log warning in development on localStorage error', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      consoleWarnSpy.mockRestore();
      consoleWarnSpy = jest.spyOn(console, 'warn');

      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      saveBestAccuracy(95.5, 80.0, mockSetBestAccuracy);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to save best accuracy:', expect.any(Error));

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('calculateAccuracy', () => {
    test('should calculate accuracy correctly with hits and misses', () => {
      expect(calculateAccuracy(80, 20)).toBe(80); // 80/100 * 100 = 80%
    });

    test('should return 100% with only hits', () => {
      expect(calculateAccuracy(50, 0)).toBe(100);
    });

    test('should return 0% with only misses', () => {
      expect(calculateAccuracy(0, 50)).toBe(0);
    });

    test('should return 0% with no hits or misses', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });

    test('should handle decimal results correctly', () => {
      expect(calculateAccuracy(2, 3)).toBeCloseTo(40, 1); // 2/5 * 100 = 40%
    });

    test('should calculate 50% accuracy correctly', () => {
      expect(calculateAccuracy(10, 10)).toBe(50);
    });
  });

  describe('saveGameStats', () => {
    test('should save both new high score and best accuracy', () => {
      const result = saveGameStats({
        score: 1000,
        hits: 95,
        misses: 5,
        highScore: 500,
        bestAccuracy: 80.0,
        setHighScore: mockSetHighScore,
        setBestAccuracy: mockSetBestAccuracy,
        setIsNewHighScore: mockSetIsNewHighScore,
      });

      expect(result.newHighScore).toBe(true);
      expect(result.newBestAccuracy).toBe(true);
      expect(result.accuracy).toBe(95); // 95/100 * 100
      expect(mockSetHighScore).toHaveBeenCalledWith(1000);
      expect(mockSetBestAccuracy).toHaveBeenCalledWith(95);
    });

    test('should save only high score when accuracy does not improve', () => {
      const result = saveGameStats({
        score: 1000,
        hits: 70,
        misses: 30,
        highScore: 500,
        bestAccuracy: 90.0,
        setHighScore: mockSetHighScore,
        setBestAccuracy: mockSetBestAccuracy,
        setIsNewHighScore: mockSetIsNewHighScore,
      });

      expect(result.newHighScore).toBe(true);
      expect(result.newBestAccuracy).toBe(false);
      expect(result.accuracy).toBe(70);
      expect(mockSetHighScore).toHaveBeenCalledWith(1000);
      expect(mockSetBestAccuracy).not.toHaveBeenCalled();
    });

    test('should save only best accuracy when score does not improve', () => {
      const result = saveGameStats({
        score: 500,
        hits: 95,
        misses: 5,
        highScore: 1000,
        bestAccuracy: 80.0,
        setHighScore: mockSetHighScore,
        setBestAccuracy: mockSetBestAccuracy,
        setIsNewHighScore: mockSetIsNewHighScore,
      });

      expect(result.newHighScore).toBe(false);
      expect(result.newBestAccuracy).toBe(true);
      expect(result.accuracy).toBe(95);
      expect(mockSetHighScore).not.toHaveBeenCalled();
      expect(mockSetBestAccuracy).toHaveBeenCalledWith(95);
    });

    test('should save neither when both do not improve', () => {
      const result = saveGameStats({
        score: 500,
        hits: 70,
        misses: 30,
        highScore: 1000,
        bestAccuracy: 90.0,
        setHighScore: mockSetHighScore,
        setBestAccuracy: mockSetBestAccuracy,
        setIsNewHighScore: mockSetIsNewHighScore,
      });

      expect(result.newHighScore).toBe(false);
      expect(result.newBestAccuracy).toBe(false);
      expect(result.accuracy).toBe(70);
      expect(mockSetHighScore).not.toHaveBeenCalled();
      expect(mockSetBestAccuracy).not.toHaveBeenCalled();
    });

    test('should handle zero hits and misses', () => {
      const result = saveGameStats({
        score: 0,
        hits: 0,
        misses: 0,
        highScore: 0,
        bestAccuracy: 0,
        setHighScore: mockSetHighScore,
        setBestAccuracy: mockSetBestAccuracy,
        setIsNewHighScore: mockSetIsNewHighScore,
      });

      expect(result.accuracy).toBe(0);
      expect(result.newHighScore).toBe(false);
      expect(result.newBestAccuracy).toBe(false);
    });

    test('should calculate accuracy correctly within saveGameStats', () => {
      const result = saveGameStats({
        score: 1000,
        hits: 40,
        misses: 60,
        highScore: 500,
        bestAccuracy: 30.0,
        setHighScore: mockSetHighScore,
        setBestAccuracy: mockSetBestAccuracy,
        setIsNewHighScore: mockSetIsNewHighScore,
      });

      expect(result.accuracy).toBe(40); // 40/100 * 100
      expect(result.newBestAccuracy).toBe(true);
    });
  });
});
