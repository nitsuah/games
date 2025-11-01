import { handleTargetHit } from '@/lib/asteroid/_comp/Game/handleTargetHit';

describe('handleTargetHit - Combo System', () => {
  let mockSetTargets;
  let mockSetHits;
  let mockSetScore;
  let mockSetCombo;
  let mockSetComboMultiplier;
  let mockOnHit;
  let comboTimerRef;
  let currentCombo;

  beforeEach(() => {
    currentCombo = 0;
    mockSetTargets = jest.fn();
    mockSetHits = jest.fn((fn) => {
      if (typeof fn === 'function') return fn(0);
      return fn;
    });
    mockSetScore = jest.fn((fn) => {
      if (typeof fn === 'function') return fn(0);
      return fn;
    });
    mockSetCombo = jest.fn((fn) => {
      if (typeof fn === 'function') {
        currentCombo = fn(currentCombo);
        return currentCombo;
      }
      currentCombo = fn;
      return fn;
    });
    mockSetComboMultiplier = jest.fn();
    mockOnHit = jest.fn();
    comboTimerRef = { current: null };

    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('increments combo on successful hit', () => {
    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(mockSetCombo).toHaveBeenCalled();
    expect(mockSetHits).toHaveBeenCalled();
    expect(mockOnHit).toHaveBeenCalled();
  });

  test('sets multiplier to 1.5x at combo 2', () => {
    currentCombo = 1; // Set current combo to 1

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(mockSetComboMultiplier).toHaveBeenCalledWith(1.5);
  });

  test('sets multiplier to 2x at combo 5', () => {
    currentCombo = 4; // Set current combo to 4

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(mockSetComboMultiplier).toHaveBeenCalledWith(2);
  });

  test('sets multiplier to 3x at combo 10', () => {
    currentCombo = 9; // Set current combo to 9

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(mockSetComboMultiplier).toHaveBeenCalledWith(3);
  });

  test('resets combo timer on each hit', () => {
    const existingTimer = setTimeout(() => {}, 1000);
    comboTimerRef.current = existingTimer;

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(comboTimerRef.current).not.toBe(existingTimer);
    expect(comboTimerRef.current).toBeTruthy();
  });

  test('does not fire when weapon is on cooldown', () => {
    const params = {
      targetId: 1,
      cooldowns: { spread: 0.5 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(mockSetHits).not.toHaveBeenCalled();
    expect(mockSetCombo).not.toHaveBeenCalled();
  });

  test('does not fire when ammo is depleted', () => {
    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 0 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(mockSetHits).not.toHaveBeenCalled();
    expect(mockSetCombo).not.toHaveBeenCalled();
  });

  test('combo resets after 3 seconds of inactivity', () => {
    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    // Fast forward 3 seconds
    jest.advanceTimersByTime(3000);

    expect(mockSetCombo).toHaveBeenCalledWith(0);
    expect(mockSetComboMultiplier).toHaveBeenCalledWith(1);
  });

  test('should add 100 base points per hit', () => {
    const spawnTime = performance.now() / 1000 - 5;
    mockSetTargets = jest.fn((fn) => {
      if (typeof fn === 'function') {
        const prevTargets = [
          { id: 1, size: 2, isHit: false, spawnTime, x: 0, y: 0, z: 0 },
        ];
        return fn(prevTargets);
      }
    });

    const mockSetScore = jest.fn((fn) => {
      if (typeof fn === 'function') return fn(0);
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    expect(mockSetScore).toHaveBeenCalled();
  });

  test('should apply combo multiplier to score', () => {
    currentCombo = 4; // Next hit will be combo 5 (2x multiplier)
    
    const spawnTime = performance.now() / 1000 - 5;
    mockSetTargets = jest.fn((fn) => {
      if (typeof fn === 'function') {
        const prevTargets = [
          { id: 1, size: 2, isHit: false, spawnTime, x: 0, y: 0, z: 0 },
        ];
        return fn(prevTargets);
      }
    });

    let capturedScoreUpdater;
    const mockSetScore = jest.fn((fn) => {
      capturedScoreUpdater = fn;
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);

    // Score should be 100 * 2 = 200 with 2x multiplier
    const newScore = capturedScoreUpdater(1000);
    expect(newScore).toBe(1200); // 1000 + 200
  });

  test('should split large targets into fragments', () => {
    const spawnTime = performance.now() / 1000 - 5; // 5 seconds ago in seconds
    const prevTargets = [
      { id: 1, size: 4, isHit: false, spawnTime, x: 0, y: 0, z: 0, speed: 2 },
    ];

    let result;
    mockSetTargets = jest.fn((fn) => {
      if (typeof fn === 'function') {
        result = fn(prevTargets);
        return result;
      }
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { current: { 1: { current: { position: { x: 5, y: 10, z: 3 } } } } },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);
    
    // Should have original target marked as hit + 2 new fragments
    expect(result.length).toBe(3);
    expect(result[0].isHit).toBe(true);
    expect(result[1].size).toBe(2); // Half of original
    expect(result[2].size).toBe(2);
  });

  test('should not split targets with size 1', () => {
    const spawnTime = performance.now() / 1000 - 5; // 5 seconds ago in seconds
    const prevTargets = [
      { id: 1, size: 1, isHit: false, spawnTime, x: 0, y: 0, z: 0 },
    ];

    let result;
    mockSetTargets = jest.fn((fn) => {
      if (typeof fn === 'function') {
        result = fn(prevTargets);
        return result;
      }
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);
    
    // Should only have original target marked as hit, no fragments
    expect(result.length).toBe(1);
    expect(result[0].isHit).toBe(true);
  });

  test('should use mesh ref position if available', () => {
    const spawnTime = performance.now() / 1000 - 5; // 5 seconds ago in seconds
    const prevTargets = [
      { id: 1, size: 4, isHit: false, spawnTime, x: 0, y: 0, z: 0, speed: 2 },
    ];

    let result;
    mockSetTargets = jest.fn((fn) => {
      if (typeof fn === 'function') {
        result = fn(prevTargets);
        return result;
      }
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { 
        current: { 
          1: { 
            current: { 
              position: { x: 15, y: 20, z: 10 } 
            } 
          } 
        } 
      },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);
    
    // Fragments should use mesh ref position, not original position
    expect(result[1].x).not.toBe(0);
    expect(result[2].x).not.toBe(0);
  });

  test('should fallback to target position if mesh ref is unavailable', () => {
    const spawnTime = performance.now() / 1000 - 5; // 5 seconds ago in seconds
    const prevTargets = [
      { id: 1, size: 4, isHit: false, spawnTime, x: 5, y: 10, z: 3, speed: 2 },
    ];

    let result;
    mockSetTargets = jest.fn((fn) => {
      if (typeof fn === 'function') {
        result = fn(prevTargets);
        return result;
      }
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { current: {} }, // No mesh ref
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleTargetHit(params);
    
    // Should still create fragments using original position
    expect(result.length).toBe(3);
  });

  test('should ignore already hit targets', () => {
    let capturedTargetsUpdater;
    mockSetTargets = jest.fn((fn) => {
      capturedTargetsUpdater = fn;
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    const spawnTime = performance.now() / 1000 - 5;
    const prevTargets = [
      { id: 1, size: 4, isHit: true, spawnTime, x: 0, y: 0, z: 0 },
    ];

    handleTargetHit(params);

    const result = capturedTargetsUpdater(prevTargets);
    
    // Should not process already hit target
    expect(result.length).toBe(1);
    expect(result[0].isHit).toBe(true);
  });

  test('should respect MIN_ALIVE_TIME before allowing hits', () => {
    let capturedTargetsUpdater;
    mockSetTargets = jest.fn((fn) => {
      capturedTargetsUpdater = fn;
    });

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      setScore: mockSetScore,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    const spawnTime = performance.now() / 1000; // Just spawned (0 seconds ago)
    const prevTargets = [
      { id: 1, size: 4, isHit: false, spawnTime, x: 0, y: 0, z: 0 },
    ];

    handleTargetHit(params);

    const result = capturedTargetsUpdater(prevTargets);
    
    // Should not hit target that just spawned
    expect(result.length).toBe(1);
    expect(result[0].isHit).toBe(false);
  });
});

