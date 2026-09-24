import { PipeManager } from '@/lib/flappy/components/PipeManager';
import { Bird } from '@/lib/flappy/components/Bird';
import { createMockCtx } from '../helpers/mockCtx';

const pipe = (overrides = {}) => ({
  x: 300,
  gapY: 200,
  gapHeight: 150,
  width: 60,
  passed: false,
  active: true,
  ...overrides,
});

describe('PipeManager', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('spawn', () => {
    it('spawns at the right edge with the gap between the min and max bounds', () => {
      const pm = new PipeManager(400, 600);
      jest.spyOn(Math, 'random').mockReturnValue(0);
      pm.spawn();
      jest.spyOn(Math, 'random').mockReturnValue(0.999999);
      pm.spawn();
      expect(pm.pipes[0]).toMatchObject({ x: 400, gapY: 50, gapHeight: 150, width: 60, passed: false, active: true });
      expect(pm.pipes[1].gapY).toBeCloseTo(600 - 150 - 50, 3);
    });
  });

  describe('update', () => {
    it('spawns once the interval is exceeded and resets the timer', () => {
      const pm = new PipeManager(400, 600);
      pm.update(1.5, jest.fn());
      expect(pm.pipes).toHaveLength(0);
      pm.update(0.01, jest.fn());
      expect(pm.pipes).toHaveLength(1);
      expect(pm.spawnTimer).toBe(0);
    });

    it('scrolls pipes left and scores once when passing the bird', () => {
      const pm = new PipeManager(400, 600);
      pm.pipes = [pipe({ x: 50 })]; // 50 + 60 = 110 > 100
      const onScore = jest.fn();
      pm.update(0.01, onScore); // x = 48 -> 108
      expect(onScore).not.toHaveBeenCalled();
      pm.update(0.05, onScore); // x = 38 -> 98 < 100
      expect(onScore).toHaveBeenCalledTimes(1);
      expect(pm.pipes[0].passed).toBe(true);
      pm.update(0.05, onScore);
      expect(onScore).toHaveBeenCalledTimes(1);
    });

    it('removes pipes that scroll fully off-screen', () => {
      const pm = new PipeManager(400, 600);
      pm.pipes = [pipe({ x: -59, passed: true }), pipe({ x: 300 })];
      pm.update(0.01, jest.fn());
      expect(pm.pipes).toHaveLength(1);
      expect(pm.pipes[0].x).toBe(298);
    });
  });

  describe('checkCollision', () => {
    it('detects the ground', () => {
      const pm = new PipeManager(400, 600);
      expect(pm.checkCollision(new Bird(100, 571))).toBe(true);
      expect(pm.checkCollision(new Bird(100, 570))).toBe(false);
    });

    it('detects the ceiling', () => {
      const pm = new PipeManager(400, 600);
      expect(pm.checkCollision(new Bird(100, -1))).toBe(true);
      expect(pm.checkCollision(new Bird(100, 0))).toBe(false);
    });

    it('detects the top and bottom pipe but not the gap', () => {
      const pm = new PipeManager(400, 600);
      pm.pipes = [pipe({ x: 90 })]; // spans 90..150, gap 200..350
      expect(pm.checkCollision(new Bird(100, 190))).toBe(true); // top pipe
      expect(pm.checkCollision(new Bird(100, 330))).toBe(true); // bottom pipe (330+30 > 350)
      expect(pm.checkCollision(new Bird(100, 250))).toBe(false); // in gap
      expect(pm.checkCollision(new Bird(100, 200))).toBe(false); // exactly at gap top
      expect(pm.checkCollision(new Bird(100, 320))).toBe(false); // exactly at gap bottom
    });

    it('ignores pipes that do not overlap horizontally', () => {
      const pm = new PipeManager(400, 600);
      pm.pipes = [pipe({ x: 130 })]; // bird 100..130 touches edge only
      expect(pm.checkCollision(new Bird(100, 10))).toBe(false);
    });
  });

  it('draws two pipe bodies and two caps per pipe', () => {
    const pm = new PipeManager(400, 600);
    pm.pipes = [pipe(), pipe({ x: 100 })];
    const ctx = createMockCtx();
    pm.draw(ctx);
    expect(ctx.fillRect).toHaveBeenCalledTimes(8);
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 0, 60, 200);
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 350, 60, 250);
  });

  it('reset clears pipes and timer', () => {
    const pm = new PipeManager(400, 600);
    pm.pipes = [pipe()];
    pm.spawnTimer = 1;
    pm.reset();
    expect(pm.pipes).toEqual([]);
    expect(pm.spawnTimer).toBe(0);
  });
});
