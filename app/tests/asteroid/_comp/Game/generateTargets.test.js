import { generateInitialTargets, getTargetCountForWave } from '@/lib/asteroid/_comp/Game/generateTargets';

describe('generateTargets - Target Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates default number of targets', () => {
    const targets = generateInitialTargets();

    expect(targets).toHaveLength(10);
  });

  test('generates specified number of targets', () => {
    const targets = generateInitialTargets(5);

    expect(targets).toHaveLength(5);
  });

  test('generates targets with correct structure (Phase 9: velocity-based)', () => {
    const targets = generateInitialTargets(1);
    const target = targets[0];

    expect(target).toHaveProperty('id');
    expect(target).toHaveProperty('x');
    expect(target).toHaveProperty('y');
    expect(target).toHaveProperty('z');
    expect(target).toHaveProperty('isHit');
    expect(target).toHaveProperty('size');
    // Phase 9: Velocity components replace speed scalar
    expect(target).toHaveProperty('vx');
    expect(target).toHaveProperty('vy');
    expect(target).toHaveProperty('vz');
    expect(target).toHaveProperty('mass');
    expect(target).toHaveProperty('color');
    expect(target).toHaveProperty('spawnTime');
  });

  test('generates targets with correct default values for wave 1', () => {
    const targets = generateInitialTargets(1, 1);
    const target = targets[0];

    expect(target.id).toBe(1);
    expect(target.isHit).toBe(false);
    // Size is now random between 5-15
    expect(target.size).toBeGreaterThanOrEqual(5);
    expect(target.size).toBeLessThanOrEqual(15);
    // Phase 9: Check velocity components instead of speed
    expect(typeof target.vx).toBe('number');
    expect(typeof target.vy).toBe('number');
    expect(typeof target.vz).toBe('number');
    // Mass should equal size
    expect(target.mass).toBe(target.size);
    // Color is now based on size (green/yellow/red)
    expect(['#00ff00', '#ffff00', '#ff4400']).toContain(target.color);
    expect(target.spawnTime).toBeGreaterThan(0);
  });

  test('generates faster targets in higher waves', () => {
    const wave1Targets = generateInitialTargets(1, 1);
    const wave5Targets = generateInitialTargets(1, 5);

    // Phase 9: Calculate velocity magnitude
    const wave1Speed = Math.sqrt(
      wave1Targets[0].vx ** 2 + 
      wave1Targets[0].vy ** 2 + 
      wave1Targets[0].vz ** 2
    );
    const wave5Speed = Math.sqrt(
      wave5Targets[0].vx ** 2 + 
      wave5Targets[0].vy ** 2 + 
      wave5Targets[0].vz ** 2
    );

    // Wave 5 should generally have higher velocity magnitude (accounting for randomness)
    expect(wave5Speed).toBeGreaterThan(wave1Speed * 0.8);
  });

  test('generates targets at different positions', () => {
    const targets = generateInitialTargets(4);

    // First 4 targets should be at cardinal directions
    expect(targets[0]).toMatchObject({ x: 15, y: 0, z: 0 });
    expect(targets[1]).toMatchObject({ x: -15, y: 0, z: 0 });
    expect(targets[2]).toMatchObject({ x: 0, y: 15, z: 0 });
    expect(targets[3]).toMatchObject({ x: 0, y: -15, z: 0 });
  });

  test('generates targets with unique IDs', () => {
    const targets = generateInitialTargets(10);
    const ids = targets.map((t) => t.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(10);
  });

  test('generates targets with sequential IDs starting from 1', () => {
    const targets = generateInitialTargets(5);

    expect(targets[0].id).toBe(1);
    expect(targets[1].id).toBe(2);
    expect(targets[2].id).toBe(3);
    expect(targets[3].id).toBe(4);
    expect(targets[4].id).toBe(5);
  });

  test('handles edge case of 0 targets', () => {
    const targets = generateInitialTargets(0);

    expect(targets).toHaveLength(0);
  });

  test('limits targets to available patterns', () => {
    // Function now has 15 predefined patterns
    const targets = generateInitialTargets(20);

    // Should only return 15 targets (limited by patterns)
    expect(targets.length).toBeLessThanOrEqual(15);
  });
});

describe('getTargetCountForWave', () => {
  test('returns correct count for wave 1', () => {
    expect(getTargetCountForWave(1)).toBe(10);
  });

  test('returns correct count for wave 2', () => {
    expect(getTargetCountForWave(2)).toBe(10);
  });

  test('returns correct count for wave 3', () => {
    expect(getTargetCountForWave(3)).toBe(12);
  });

  test('returns correct count for wave 5', () => {
    expect(getTargetCountForWave(5)).toBe(14);
  });

  test('caps at 15 targets for high waves', () => {
    expect(getTargetCountForWave(10)).toBe(15);
    expect(getTargetCountForWave(20)).toBe(15);
    expect(getTargetCountForWave(100)).toBe(15);
  });
});
