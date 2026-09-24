import {
  processTargetCollisions,
  getCollisionCheckInterval,
} from '@/lib/asteroid/_comp/Target/TargetCollisionManager';

const refsFor = (positions) =>
  new Map(Object.entries(positions).map(([id, [x, y, z]]) => [id, { current: { position: { x, y, z } } }]));

const applyUpdate = (setTargets, prev) => setTargets.mock.calls[0][0](prev);

describe('processTargetCollisions', () => {
  it('ignores empty, missing and single-target lists', () => {
    const setTargets = jest.fn();
    processTargetCollisions(null, setTargets, new Map());
    processTargetCollisions([], setTargets, new Map());
    processTargetCollisions([{ id: 'a' }], setTargets, new Map());
    expect(setTargets).not.toHaveBeenCalled();
  });

  it('does nothing when no targets overlap', () => {
    const targets = [
      { id: 'a', size: 1, vx: 1 },
      { id: 'b', size: 1, vx: -1 },
    ];
    const setTargets = jest.fn();
    processTargetCollisions(targets, setTargets, refsFor({ a: [0, 0, 0], b: [100, 0, 0] }));
    expect(setTargets).not.toHaveBeenCalled();
  });

  it('bounces two overlapping, approaching targets apart', () => {
    const targets = [
      { id: 'a', size: 2, vx: 5, vy: 0, vz: 0 },
      { id: 'b', size: 2, vx: -5, vy: 0, vz: 0 },
      { id: 'c', size: 2, vx: 0 }, // far away, untouched
    ];
    const setTargets = jest.fn();
    processTargetCollisions(targets, setTargets, refsFor({ a: [0, 0, 0], b: [3, 0, 0], c: [500, 0, 0] }));
    expect(setTargets).toHaveBeenCalledTimes(1);
    const next = applyUpdate(setTargets, targets);
    expect(next[0].vx).toBeLessThan(0);
    expect(next[1].vx).toBeGreaterThan(0);
    // equal masses with 0.8 restitution: speeds swap and shrink
    expect(Math.abs(next[0].vx)).toBeCloseTo(4);
    expect(next[2]).toBe(targets[2]);
  });

  it('resolves each pair only once', () => {
    const targets = [
      { id: 'a', size: 2, vx: 5 },
      { id: 'b', size: 2, vx: -5 },
    ];
    const setTargets = jest.fn();
    processTargetCollisions(targets, setTargets, refsFor({ a: [0, 0, 0], b: [3, 0, 0] }));
    const next = applyUpdate(setTargets, targets);
    // if the pair were resolved twice the velocities would flip back
    expect(next[0].vx).toBeLessThan(0);
  });

  it('skips hit targets and targets without a mounted mesh', () => {
    const targets = [
      { id: 'a', size: 2, vx: 5 },
      { id: 'b', size: 2, vx: -5, isHit: true },
      { id: 'c', size: 2, vx: -5 },
      { id: 'd', size: 2, vx: -5 },
    ];
    const refs = refsFor({ a: [0, 0, 0], b: [3, 0, 0] });
    refs.set('c', { current: null });
    const setTargets = jest.fn();
    processTargetCollisions(targets, setTargets, refs);
    expect(setTargets).not.toHaveBeenCalled();
  });

  it('defaults missing size to 10 and missing velocity to zero', () => {
    const targets = [{ id: 'a', vx: 3 }, { id: 'b' }];
    const setTargets = jest.fn();
    processTargetCollisions(targets, setTargets, refsFor({ a: [0, 0, 0], b: [15, 0, 0] }));
    const next = applyUpdate(setTargets, targets);
    expect(next[1].vx).toBeGreaterThan(0);
    expect(next[1].vy).toBeCloseTo(0);
  });
});

describe('getCollisionCheckInterval', () => {
  it.each([
    [0, 1],
    [4, 1],
    [5, 2],
    [9, 2],
    [10, 3],
    [19, 3],
    [20, 4],
    [500, 4],
  ])('%i targets -> every %i frame(s)', (count, interval) => {
    expect(getCollisionCheckInterval(count)).toBe(interval);
  });
});
