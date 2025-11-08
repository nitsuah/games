import { splitTarget } from '../../../../lib/asteroid/_comp/Target/splitTarget';

describe('splitTarget - Target Splitting Logic', () => {
  test('should split target into two smaller targets', () => {
    const target = {
      id: 'target-1',
      x: 10,
      y: 5,
      z: 0,
      size: 6,
      vx: 0.1,
      vy: 0.05,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
    };

    const result = splitTarget(target);

    expect(result[0].size).toBe(4);
    expect(result[1].size).toBe(4);
  });

  test('should double velocity magnitude with spread', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      vx: 0.1,
      vy: 0,
      vz: 0,
    };

    const result = splitTarget(target);

    // Velocity should be approximately doubled (with some spread added)
    // One goes right (+), one goes left (-)
    expect(result[0].vx).toBeGreaterThan(0.2); // Base doubled + spread
    expect(result[1].vx).toBeLessThan(0.2); // Base doubled - spread
  });

  test('should position targets on opposite sides', () => {
    const target = {
      id: 'target-1',
      x: 10,
      y: 5,
      z: 3,
      size: 6,
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
      isHit: true, // Original was hit
    };

    const result = splitTarget(target);

    expect(result[0].isHit).toBe(false);
    expect(result[1].isHit).toBe(false);
  });

  test('should assign mass based on size (Phase 9)', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 10, // Will become 5
      vx: 0.1,
      vy: 0,
      vz: 0,
    };

    const result = splitTarget(target);

    expect(result[0].mass).toBe(5); // Mass = size
    expect(result[1].mass).toBe(5);
  });

  test('should assign color based on size - blue for > 4', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 10, // Will become 5
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
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
      vx: 0.1,
      vy: 0,
      vz: 0,
    };

    const result = splitTarget(target);

    expect(result[0].id).toContain('special-target-123');
    expect(result[1].id).toContain('special-target-123');
    expect(result[0].id).toBe('special-target-123-1');
    expect(result[1].id).toBe('special-target-123-2');
  });

  test('should have velocity divergence (split targets move apart)', () => {
    const target = {
      id: 'target-1',
      x: 0,
      y: 0,
      z: 0,
      size: 6,
      vx: 0.1,
      vy: 0,
      vz: 0,
    };

    const result = splitTarget(target);

    // First target should have more positive x velocity (moving right)
    // Second target should have less positive or negative x velocity (moving left)
    expect(result[0].vx).toBeGreaterThan(result[1].vx);
  });
});
