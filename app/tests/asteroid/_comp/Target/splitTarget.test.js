import { splitTarget } from '../../../../lib/asteroid/_comp/Target/splitTarget';

describe('splitTarget - Target Splitting Logic', () => {
  test('should split target into two smaller targets', () => {
    const target = {
      id: 'target-1',
      x: 10,
      y: 5,
      z: 0,
      size: 6,
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('target-1-1');
    expect(result[1].id).toBe('target-1-2');
  });

  test('should reduce size by half', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 8,
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result[0].size).toBe(4);
    expect(result[1].size).toBe(4);
  });

  test('should double the speed', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 3,
    };

    const result = splitTarget(target);

    expect(result[0].speed).toBe(6);
    expect(result[1].speed).toBe(6);
  });

  test('should position targets on opposite sides', () => {
    const target = {
      id: 'target-1',
      x: 10,
      y: 5,
      z: 3,
      size: 6,
      speed: 2,
    };

    const result = splitTarget(target);

    // First target should be offset positively on x
    expect(result[0].x).toBeGreaterThan(target.x);
    
    // Second target should be offset negatively on x
    expect(result[1].x).toBeLessThan(target.x);
  });

  test('should set both targets as not hit', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 2,
      isHit: true, // Original was hit
    };

    const result = splitTarget(target);

    expect(result[0].isHit).toBe(false);
    expect(result[1].isHit).toBe(false);
  });

  test('should assign color based on size - blue for > 4', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 10, // Will become 5
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result[0].color).toBe('#0000ff'); // Blue
    expect(result[1].color).toBe('#0000ff');
  });

  test('should assign color based on size - purple for > 3', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 8, // Will become 4
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result[0].color).toBe('#800080'); // Purple
    expect(result[1].color).toBe('#800080');
  });

  test('should assign color based on size - orange for > 2', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6, // Will become 3
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result[0].color).toBe('#ff4500'); // Orange
    expect(result[1].color).toBe('#ff4500');
  });

  test('should assign color based on size - cyan for > 1', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 4, // Will become 2
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result[0].color).toBe('#00ffff'); // Cyan
    expect(result[1].color).toBe('#00ffff');
  });

  test('should assign color based on size - yellow for <= 1', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 2, // Will become 1
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result[0].color).toBe('#ffff00'); // Yellow
    expect(result[1].color).toBe('#ffff00');
  });

  test('should use same spawn time for both targets', () => {
    const mockNow = jest.fn(() => 123456789);
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 2,
    };

    const result = splitTarget(target, mockNow);

    expect(result[0].spawnTime).toBe(123456789);
    expect(result[1].spawnTime).toBe(123456789);
    expect(mockNow).toHaveBeenCalled();
  });

  test('should use Date.now by default', () => {
    const beforeTime = Date.now();
    
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 2,
    };

    const result = splitTarget(target);
    const afterTime = Date.now();

    expect(result[0].spawnTime).toBeGreaterThanOrEqual(beforeTime);
    expect(result[0].spawnTime).toBeLessThanOrEqual(afterTime);
    expect(result[0].spawnTime).toBe(result[1].spawnTime);
  });

  test('should use original size for offset calculation', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6, // offset range should be 7 (size + 1)
      speed: 2,
    };

    const result = splitTarget(target);

    // Check that x offset is based on original size
    expect(Math.abs(result[0].x - target.x)).toBe(7);
    expect(Math.abs(result[1].x - target.x)).toBe(7);
  });

  test('should add randomness to y and z positions', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 2,
    };

    // Run multiple times to verify randomness
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(splitTarget(target));
    }

    // Check that y and z positions vary
    const uniqueY = new Set(results.map(r => r[0].y));
    const uniqueZ = new Set(results.map(r => r[0].z));

    // Should have some variation (though very small chance all random could be same)
    expect(uniqueY.size).toBeGreaterThan(1);
    expect(uniqueZ.size).toBeGreaterThan(1);
  });

  test('should preserve target id in split target ids', () => {
    const target = {
      id: 'special-target-123',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 2,
    };

    const result = splitTarget(target);

    expect(result[0].id).toContain('special-target-123');
    expect(result[1].id).toContain('special-target-123');
    expect(result[0].id).toBe('special-target-123-1');
    expect(result[1].id).toBe('special-target-123-2');
  });

  // Phase 8: Time slow inertia bug fix tests
  test('should preserve originalSpeed when splitting during slow motion', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 1, // Current slowed speed
      originalSpeed: 2, // Original speed before slow motion
    };

    const result = splitTarget(target);

    // Split targets should preserve originalSpeed for restoration after slow-mo
    expect(result[0].originalSpeed).toBe(4); // 2 * 2 (doubled like speed)
    expect(result[1].originalSpeed).toBe(4);
    expect(result[0].speed).toBe(2); // Current speed is doubled
    expect(result[1].speed).toBe(2);
  });

  test('should not set originalSpeed when not in slow motion', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      speed: 2,
      // No originalSpeed field
    };

    const result = splitTarget(target);

    // Should not have originalSpeed when not in slow motion
    expect(result[0].originalSpeed).toBeUndefined();
    expect(result[1].originalSpeed).toBeUndefined();
    expect(result[0].speed).toBe(4);
    expect(result[1].speed).toBe(4);
  });
});
