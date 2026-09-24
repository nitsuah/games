import { UFO } from '@/lib/space-invaders/components/UFO';
import { createMockCtx } from '../helpers/mockCtx';

describe('UFO', () => {
  afterEach(() => jest.restoreAllMocks());

  it('starts inactive and off-screen', () => {
    const u = new UFO(800);
    expect(u.active).toBe(false);
    expect(u.x).toBe(-100);
  });

  it('spawns after the interval elapses', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const u = new UFO(800);
    u.update(15); // == interval, must exceed
    expect(u.active).toBe(false);
    u.update(0.01);
    expect(u.active).toBe(true);
    expect(u.direction).toBe(1);
    expect(u.x).toBe(-50);
  });

  it('spawns from the right when moving left', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const u = new UFO(800);
    u.spawn();
    expect(u.direction).toBe(-1);
    expect(u.x).toBe(850);
  });

  it('flies across and despawns past the right edge', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const u = new UFO(800);
    u.spawn();
    u.update(1);
    expect(u.x).toBe(100);
    u.update(10);
    expect(u.active).toBe(false);
    expect(u.timer).toBe(0);
  });

  it('despawns past the left edge when moving left', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const u = new UFO(800);
    u.spawn();
    u.update(6); // 850 - 900 = -50, not < -50
    expect(u.active).toBe(true);
    u.update(0.1);
    expect(u.active).toBe(false);
  });

  describe('checkCollision', () => {
    it('never hits while inactive', () => {
      const u = new UFO(800);
      u.x = 0;
      expect(u.checkCollision({ x: 5, y: 45, width: 4, height: 10 })).toBe(false);
    });

    it('is destroyed on hit and resets its timer', () => {
      const u = new UFO(800);
      u.active = true;
      u.x = 100;
      u.timer = 999;
      expect(u.checkCollision({ x: 110, y: 45, width: 4, height: 10 })).toBe(true);
      expect(u.active).toBe(false);
      expect(u.timer).toBe(0);
    });

    it('misses bullets outside its bounds', () => {
      const u = new UFO(800);
      u.active = true;
      u.x = 100;
      expect(u.checkCollision({ x: 300, y: 45, width: 4, height: 10 })).toBe(false);
      expect(u.checkCollision({ x: 110, y: 200, width: 4, height: 10 })).toBe(false);
    });
  });

  it('draws only when active', () => {
    const u = new UFO(800);
    const ctx = createMockCtx();
    u.draw(ctx);
    expect(ctx.ellipse).not.toHaveBeenCalled();
    u.active = true;
    u.x = 0;
    u.draw(ctx);
    expect(ctx.ellipse).toHaveBeenCalledWith(20, 50, 20, 10, 0, 0, Math.PI * 2);
  });

  it('reset deactivates and clears the timer', () => {
    const u = new UFO(800);
    u.active = true;
    u.timer = 5;
    u.reset();
    expect(u.active).toBe(false);
    expect(u.timer).toBe(0);
  });
});
