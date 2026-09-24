import * as THREE from 'three';
import { weaponHandler } from '@/lib/asteroid/_comp/Weapons/weaponHandler';

// Camera at the origin looking down -Z with +Y up (three.js defaults),
// so "straight ahead" is (0, y, -z) and camera-right is +X.
function setup(overrides = {}) {
  const camera = new THREE.PerspectiveCamera();
  camera.updateMatrixWorld();
  const deps = {
    camera,
    scene: new THREE.Scene(),
    targets: [],
    setTargets: jest.fn(),
    setShowLaser: jest.fn(),
    playSound: jest.fn(),
    onHit: jest.fn(),
    onMiss: jest.fn(),
    triggerExplosion: jest.fn(),
    triggerImpact: jest.fn(),
    ...overrides,
  };
  return deps;
}

const target = (id, x, y, z, extra = {}) => ({ id, x, y, z, size: 2, isHit: false, ...extra });
const updated = (deps) => deps.setTargets.mock.calls[0][0];

function addWall(scene, z) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 1), new THREE.MeshBasicMaterial());
  wall.position.set(0, 0, z);
  scene.add(wall);
  scene.updateMatrixWorld(true);
  return wall;
}

describe('weaponHandler', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('does nothing for an unknown weapon type', () => {
    const deps = setup({ targets: [target(1, 0, 0, -10)] });
    weaponHandler({ ...deps, type: 'banana' });
    expect(deps.setTargets).not.toHaveBeenCalled();
    expect(deps.playSound).not.toHaveBeenCalled();
  });

  describe('laser', () => {
    // laser muzzle: forward*1.5 + (0, -1.2, 0) => (0, -1.2, -1.5)
    it('hits a target dead ahead and reports its real position to triggerImpact', () => {
      const deps = setup({ targets: [target('a', 0, -1.2, -50), target('b', 30, 0, -50)] });
      weaponHandler({ ...deps, type: 'laser' });
      expect(updated(deps).map((t) => t.isHit)).toEqual([true, false]);
      expect(deps.playSound).toHaveBeenCalledWith('hit');
      expect(deps.onHit).toHaveBeenCalledWith('a');
      expect(deps.onMiss).not.toHaveBeenCalled();
      const [pos, size] = deps.triggerImpact.mock.calls[0];
      expect(pos.toArray()).toEqual([0, -1.2, -50]);
      expect(size).toBe(4);
    });

    it('can pierce multiple aligned targets', () => {
      const deps = setup({ targets: [target(1, 0, -1.2, -20), target(2, 0, -1.2, -80)] });
      weaponHandler({ ...deps, type: 'laser' });
      expect(deps.onHit).toHaveBeenCalledTimes(2);
    });

    it('misses targets beyond 400 units or already hit', () => {
      const deps = setup({ targets: [target(1, 0, -1.2, -500), target(2, 0, -1.2, -10, { isHit: true })] });
      weaponHandler({ ...deps, type: 'laser' });
      expect(deps.playSound).toHaveBeenCalledWith('miss');
      expect(deps.onMiss).toHaveBeenCalled();
      expect(updated(deps)[1]).toBe(deps.targets[1]);
    });

    it('shows a beam for 120ms', () => {
      const deps = setup();
      weaponHandler({ ...deps, type: 'laser' });
      const [[beam]] = deps.setShowLaser.mock.calls[0];
      expect(beam.from.toArray()).toEqual([0, -1.2, -1.5]);
      expect(beam.to.z).toBeCloseTo(-101.5);
      jest.advanceTimersByTime(120);
      expect(deps.setShowLaser).toHaveBeenLastCalledWith(null);
    });

    it('works without optional callbacks', () => {
      const deps = setup({
        targets: [target(1, 0, -1.2, -10)],
        onHit: undefined,
        onMiss: undefined,
        setShowLaser: undefined,
        triggerImpact: undefined,
      });
      expect(() => weaponHandler({ ...deps, type: 'laser' })).not.toThrow();
      expect(() => weaponHandler({ ...deps, targets: [], type: 'laser' })).not.toThrow();
    });
  });

  describe('spread', () => {
    // spread muzzle: forward*2 + (0, -0.5, 0) => (0, -0.5, -2)
    it('hits a target inside the cone when the accuracy roll succeeds', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const deps = setup({ targets: [target(1, 0, -0.5, -30)] });
      weaponHandler({ ...deps, type: 'spread' });
      expect(updated(deps)[0].isHit).toBe(true);
      expect(deps.triggerImpact).toHaveBeenCalled();
      expect(deps.onMiss).not.toHaveBeenCalled();
    });

    it('misses when the distance-scaled accuracy roll fails', () => {
      // distanceFactor at 28 units = 1 - 28/80*0.3 = 0.895
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const deps = setup({ targets: [target(1, 0, -0.5, -30)] });
      weaponHandler({ ...deps, type: 'spread' });
      expect(updated(deps)[0].isHit).toBe(false);
      expect(deps.onMiss).toHaveBeenCalled();
    });

    it('misses outside range or outside the cone regardless of luck', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);
      const deps = setup({ targets: [target(1, 0, -0.5, -100), target(2, 5, -0.5, -30)] });
      weaponHandler({ ...deps, type: 'spread' });
      expect(updated(deps).every((t) => !t.isHit)).toBe(true);
      expect(deps.playSound).toHaveBeenCalledWith('miss');
    });

    it('fires SPREAD_COUNT pellets that reach SPREAD_RANGE and clears them after 350ms', () => {
      const deps = setup();
      weaponHandler({ ...deps, type: 'spread', weaponParams: { SPREAD_COUNT: 3, SPREAD_RANGE: 50 } });
      const pellets = deps.setShowLaser.mock.calls[0][0];
      expect(pellets).toHaveLength(3);
      pellets.forEach((p) => {
        expect(p.from.distanceTo(p.to)).toBeCloseTo(50);
        expect(p.speed).toBeGreaterThanOrEqual(3.5);
        expect(p.speed).toBeLessThan(4);
      });
      jest.advanceTimersByTime(350);
      expect(deps.setShowLaser).toHaveBeenLastCalledWith(null);
    });

    it('defaults to 8 pellets and tolerates missing optional callbacks', () => {
      const deps = setup({ onMiss: undefined, triggerImpact: undefined });
      weaponHandler({ ...deps, type: 'spread' });
      expect(deps.setShowLaser.mock.calls[0][0]).toHaveLength(8);
      const noLaser = setup({ setShowLaser: undefined });
      expect(() => weaponHandler({ ...noLaser, type: 'spread' })).not.toThrow();
    });
  });

  describe('explosive', () => {
    // explosive muzzle: forward*2.5 + (0, -0.3, 0) => (0, -0.3, -2.5); max range 100
    it('detonates at max range when nothing is hit by the ray', () => {
      const deps = setup({ targets: [target(1, 0, 0, -100), target(2, 0, 0, -50)] });
      weaponHandler({ ...deps, type: 'explosive' });
      const [impact] = deps.triggerExplosion.mock.calls[0];
      expect(impact.z).toBeCloseTo(-102.5);
      expect(updated(deps).map((t) => t.isHit)).toEqual([true, false]);
      expect(deps.triggerImpact).toHaveBeenCalledWith(expect.any(THREE.Vector3), 6);
      jest.advanceTimersByTime(400);
      expect(deps.setShowLaser).toHaveBeenLastCalledWith(null);
    });

    it('detonates on the first object the ray hits', () => {
      const deps = setup({ targets: [target(1, 0, 0, -25)] });
      addWall(deps.scene, -20);
      weaponHandler({ ...deps, type: 'explosive' });
      const [impact] = deps.triggerExplosion.mock.calls[0];
      expect(impact.z).toBeCloseTo(-19.5);
      expect(updated(deps)[0].isHit).toBe(true);
    });

    it('ignores scene objects with a null matrixWorld', () => {
      const deps = setup();
      const wall = addWall(deps.scene, -20);
      wall.matrixWorld = null;
      weaponHandler({ ...deps, type: 'explosive' });
      expect(deps.triggerExplosion.mock.calls[0][0].z).toBeCloseTo(-102.5);
    });

    it('respects a custom explosion radius and reports a miss', () => {
      const deps = setup({ targets: [target(1, 0, 0, -100)] });
      weaponHandler({ ...deps, type: 'explosive', weaponParams: { explosionRadius: 1 } });
      expect(deps.onMiss).toHaveBeenCalled();
      expect(deps.playSound).toHaveBeenCalledWith('miss');
    });

    it('tolerates missing optional callbacks', () => {
      const deps = setup({
        targets: [target(1, 0, 0, -100)],
        setShowLaser: undefined,
        triggerExplosion: undefined,
        triggerImpact: undefined,
        onMiss: undefined,
      });
      expect(() => weaponHandler({ ...deps, type: 'explosive' })).not.toThrow();
      expect(() => weaponHandler({ ...deps, targets: [], type: 'explosive' })).not.toThrow();
    });
  });

  describe('aa', () => {
    it('alternates between left and right cannons by shot counter', () => {
      const left = setup();
      weaponHandler({ ...left, type: 'aa', weaponParams: { shotCounter: 0 } });
      expect(left.setShowLaser.mock.calls[0][0][0].from.x).toBeCloseTo(-1.5);

      const right = setup();
      weaponHandler({ ...right, type: 'aa', weaponParams: { shotCounter: 1 } });
      const [shot] = right.setShowLaser.mock.calls[0][0];
      expect(shot.from.x).toBeCloseTo(1.5);
      expect(shot.speed).toBe(1.8);
      jest.advanceTimersByTime(300);
      expect(right.setShowLaser).toHaveBeenLastCalledWith(null);
    });

    it('explodes with the configured radius and hits targets inside it', () => {
      const deps = setup({ targets: [target(1, -1.5, -0.3, -95), target(2, 30, 0, -95)] });
      weaponHandler({ ...deps, type: 'aa' });
      expect(deps.triggerExplosion).toHaveBeenCalledWith(expect.any(THREE.Vector3), 15);
      expect(updated(deps).map((t) => t.isHit)).toEqual([true, false]);
      expect(deps.triggerImpact).toHaveBeenCalledWith(expect.any(THREE.Vector3), 4);
    });

    it('uses ray intersections and reports misses', () => {
      const deps = setup({ targets: [target(1, 0, 0, -100)] });
      addWall(deps.scene, -10);
      weaponHandler({ ...deps, type: 'aa', weaponParams: { cannonOffset: 0 } });
      expect(deps.triggerExplosion.mock.calls[0][0].z).toBeCloseTo(-9.5);
      expect(deps.onMiss).toHaveBeenCalled();
    });

    it('tolerates missing optional callbacks', () => {
      const deps = setup({
        targets: [target(1, -1.5, -0.3, -95)],
        setShowLaser: undefined,
        triggerExplosion: undefined,
        triggerImpact: undefined,
        onMiss: undefined,
      });
      expect(() => weaponHandler({ ...deps, type: 'aa' })).not.toThrow();
      expect(() => weaponHandler({ ...deps, targets: [], type: 'aa' })).not.toThrow();
    });
  });

  describe('plasma', () => {
    it('travels up to 120 units with a large 40-unit blast', () => {
      const deps = setup({ targets: [target(1, 0, 0, -90), target(2, 0, 0, -10)] });
      weaponHandler({ ...deps, type: 'plasma' });
      const [impact, radius] = deps.triggerExplosion.mock.calls[0];
      expect(impact.z).toBeCloseTo(-122.5);
      expect(radius).toBe(40);
      expect(updated(deps).map((t) => t.isHit)).toEqual([true, false]);
      expect(deps.triggerImpact).toHaveBeenCalledWith(expect.any(THREE.Vector3), 8);
      const [shot] = deps.setShowLaser.mock.calls[0][0];
      expect(shot).toMatchObject({ speed: 0.5, color: '#ff00ff' });
      jest.advanceTimersByTime(600);
      expect(deps.setShowLaser).toHaveBeenLastCalledWith(null);
    });

    it('stops at scene geometry and reports misses', () => {
      const deps = setup({ targets: [target(1, 0, 0, -120)] });
      addWall(deps.scene, -30);
      weaponHandler({ ...deps, type: 'plasma', weaponParams: { explosionRadius: 5 } });
      expect(deps.triggerExplosion.mock.calls[0][0].z).toBeCloseTo(-29.5);
      expect(deps.onMiss).toHaveBeenCalled();
    });

    it('tolerates missing optional callbacks', () => {
      const deps = setup({
        targets: [target(1, 0, 0, -90)],
        setShowLaser: undefined,
        triggerExplosion: undefined,
        triggerImpact: undefined,
        onMiss: undefined,
      });
      expect(() => weaponHandler({ ...deps, type: 'plasma' })).not.toThrow();
      expect(() => weaponHandler({ ...deps, targets: [], type: 'plasma' })).not.toThrow();
    });
  });
});
