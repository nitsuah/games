import { generateInitialTargets, TARGET_CONFIG } from '../../../../pages/asteroid/_comp/Game/generateTargets';

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

  test('generates targets with correct structure', () => {
    const targets = generateInitialTargets(1);
    const target = targets[0];

    expect(target).toHaveProperty('id');
    expect(target).toHaveProperty('x');
    expect(target).toHaveProperty('y');
    expect(target).toHaveProperty('z');
    expect(target).toHaveProperty('isHit');
    expect(target).toHaveProperty('size');
    expect(target).toHaveProperty('speed');
    expect(target).toHaveProperty('color');
    expect(target).toHaveProperty('spawnTime');
  });

  test('generates targets with correct default values', () => {
    const targets = generateInitialTargets(1);
    const target = targets[0];

    expect(target.id).toBe(1);
    expect(target.isHit).toBe(false);
    expect(target.size).toBe(TARGET_CONFIG.DEFAULT_SIZE);
    expect(target.speed).toBe(TARGET_CONFIG.DEFAULT_SPEED);
    expect(target.color).toBe(TARGET_CONFIG.DEFAULT_COLOR);
    expect(target.spawnTime).toBeGreaterThan(0);
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
    // Function has 10 predefined patterns
    const targets = generateInitialTargets(15);

    // Should only return 10 targets (limited by patterns)
    expect(targets.length).toBeLessThanOrEqual(10);
  });
});
