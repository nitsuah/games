import { handleGameOver } from '../../../../lib/asteroid/_comp/Game/handleGameOver';

describe('handleGameOver - Victory Detection and High Score', () => {
  let mockSetGameOver;
  let mockPauseSound;
  let mockPlaySound;
  let mockSetHighScore;
  let mockSetIsNewHighScore;
  let mockSetBestAccuracy;
  let consoleLogSpy;
  let consoleWarnSpy;
  let mockLocalStorage;

  beforeEach(() => {
    mockSetGameOver = jest.fn();
    mockPauseSound = jest.fn();
    mockPlaySound = jest.fn();
    mockSetHighScore = jest.fn();
    mockSetIsNewHighScore = jest.fn();
    mockSetBestAccuracy = jest.fn();
    
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Mock document.exitPointerLock - needs to be on the real document object
    if (typeof document !== 'undefined') {
      document.exitPointerLock = jest.fn();
    }

    // Mock localStorage
    mockLocalStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
    };
    
    // Store original window.localStorage
    if (typeof window !== 'undefined') {
      global.originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    
    // Restore localStorage
    if (typeof window !== 'undefined' && global.originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', {
        value: global.originalLocalStorage,
        writable: true,
        configurable: true,
      });
      delete global.originalLocalStorage;
    }
    
    jest.clearAllMocks();
  });

  test('should do nothing if targets array is empty', () => {
    handleGameOver({
      targets: [],
      setGameOver: mockSetGameOver,
    });

    expect(mockSetGameOver).not.toHaveBeenCalled();
  });

  test('should do nothing if targets is not an array', () => {
    handleGameOver({
      targets: null,
      setGameOver: mockSetGameOver,
    });

    expect(mockSetGameOver).not.toHaveBeenCalled();
  });

  test('should do nothing if not all targets are hit', () => {
    const targets = [
      { id: 1, isHit: true },
      { id: 2, isHit: false },
      { id: 3, isHit: true },
    ];

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
    });

    expect(mockSetGameOver).not.toHaveBeenCalled();
  });

  test('should trigger game over when all targets are hit', () => {
    const targets = [
      { id: 1, isHit: true },
      { id: 2, isHit: true },
      { id: 3, isHit: true },
    ];

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
      pauseSound: mockPauseSound,
      playSound: mockPlaySound,
      hits: 10,
      misses: 2,
      score: 1000,
      highScore: 500,
      setHighScore: mockSetHighScore,
      setIsNewHighScore: mockSetIsNewHighScore,
    });

    expect(mockSetGameOver).toHaveBeenCalledWith(true);
    expect(mockPauseSound).toHaveBeenCalledWith('bgm');
    expect(mockPlaySound).toHaveBeenCalledWith('gameOver');
  });

  test('should release pointer lock on game over', () => {
    const targets = [{ id: 1, isHit: true }];
    const exitPointerLockSpy = jest.spyOn(document, 'exitPointerLock');

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
    });

    expect(exitPointerLockSpy).toHaveBeenCalled();
    exitPointerLockSpy.mockRestore();
  });

  test('should save new high score to localStorage', () => {
    const targets = [{ id: 1, isHit: true }];

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
      hits: 10,
      misses: 2,
      score: 2000,
      highScore: 1000,
      setHighScore: mockSetHighScore,
      setIsNewHighScore: mockSetIsNewHighScore,
    });

    expect(mockSetHighScore).toHaveBeenCalledWith(2000);
    expect(mockSetIsNewHighScore).toHaveBeenCalledWith(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'asteroidHighScore',
      '2000'
    );
  });

  test('should not update high score if current score is lower', () => {
    const targets = [{ id: 1, isHit: true }];

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
      hits: 10,
      misses: 2,
      score: 500,
      highScore: 1000,
      setHighScore: mockSetHighScore,
      setIsNewHighScore: mockSetIsNewHighScore,
    });

    expect(mockSetHighScore).not.toHaveBeenCalled();
    expect(mockSetIsNewHighScore).not.toHaveBeenCalled();
  });

  test('should calculate and save accuracy', () => {
    const targets = [{ id: 1, isHit: true }];

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
      hits: 9,
      misses: 1,
      score: 1000,
      highScore: 500,
      bestAccuracy: 80,
      setBestAccuracy: mockSetBestAccuracy,
    });

    // Accuracy should be 9/10 = 90%
    expect(mockSetBestAccuracy).toHaveBeenCalledWith(90);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'asteroidBestAccuracy',
      '90'
    );
  });

  test('should not update best accuracy if current is lower', () => {
    const targets = [{ id: 1, isHit: true }];

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
      hits: 7,
      misses: 3,
      score: 1000,
      highScore: 500,
      bestAccuracy: 90,
      setBestAccuracy: mockSetBestAccuracy,
    });

    // Accuracy is 70%, less than 90%
    expect(mockSetBestAccuracy).not.toHaveBeenCalled();
  });

  test('should handle accuracy calculation with zero hits and misses', () => {
    const targets = [{ id: 1, isHit: true }];

    handleGameOver({
      targets,
      setGameOver: mockSetGameOver,
      hits: 0,
      misses: 0,
      score: 0,
      highScore: 0,
      bestAccuracy: 0,
      setBestAccuracy: mockSetBestAccuracy,
    });

    // Should not crash with division by zero
    expect(mockSetGameOver).toHaveBeenCalled();
  });

  test('should handle localStorage errors gracefully', () => {
    mockLocalStorage.setItem = jest.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    const targets = [{ id: 1, isHit: true }];

    expect(() =>
      handleGameOver({
        targets,
        setGameOver: mockSetGameOver,
        score: 2000,
        highScore: 1000,
        setHighScore: mockSetHighScore,
      })
    ).not.toThrow();

    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  test('should handle exitPointerLock errors gracefully', () => {
    const exitPointerLockSpy = jest.spyOn(document, 'exitPointerLock').mockImplementation(() => {
      throw new Error('Pointer lock error');
    });

    const targets = [{ id: 1, isHit: true }];

    expect(() =>
      handleGameOver({
        targets,
        setGameOver: mockSetGameOver,
      })
    ).not.toThrow();

    expect(mockSetGameOver).toHaveBeenCalled();
    exitPointerLockSpy.mockRestore();
  });

  test('should handle missing localStorage gracefully', () => {
    // Temporarily make localStorage undefined
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const targets = [{ id: 1, isHit: true }];

    expect(() =>
      handleGameOver({
        targets,
        setGameOver: mockSetGameOver,
        score: 2000,
        highScore: 1000,
        setHighScore: mockSetHighScore,
      })
    ).not.toThrow();
    
    // Restore localStorage
    if (originalDescriptor) {
      Object.defineProperty(window, 'localStorage', originalDescriptor);
    }
  });

  test('should use default values for optional parameters', () => {
    const targets = [{ id: 1, isHit: true }];

    expect(() =>
      handleGameOver({
        targets,
        setGameOver: mockSetGameOver,
      })
    ).not.toThrow();

    expect(mockSetGameOver).toHaveBeenCalled();
  });
});
