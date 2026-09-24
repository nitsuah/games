import { ShieldSystem } from '@/lib/shared/physics/ShieldSystem';
import { createMockCtx } from '../../helpers/mockCtx';

const bulletAt = (x, y) => ({ x, y, width: 4, height: 10, active: true });

describe('ShieldSystem', () => {
  it('starts empty', () => {
    expect(new ShieldSystem().shields).toEqual([]);
  });

  it('creates a 3x4 block grid per shield with defaults (4 shields, 800 wide)', () => {
    const s = new ShieldSystem();
    s.init();
    expect(s.shields).toHaveLength(4 * 12);
    // first shield: spacing 160, x = 160 - 40 = 120, y = 450
    expect(s.shields[0]).toEqual({ x: 120, y: 450, width: 20, height: 20, health: 100, active: true });
    // last block of first shield is row 2, col 3
    expect(s.shields[11]).toMatchObject({ x: 180, y: 490 });
  });

  it('re-init replaces previous shields', () => {
    const s = new ShieldSystem();
    s.init(4);
    s.init(1, 400);
    expect(s.shields).toHaveLength(12);
    expect(s.shields[0].x).toBe(160);
  });

  it('erodes a block over 3 hits then deactivates it', () => {
    const s = new ShieldSystem();
    s.init(1, 400); // block 0 at (160, 450)
    const b = bulletAt(165, 455);
    expect(s.checkCollision(b)).toBe(true);
    expect(s.shields[0].health).toBe(66);
    expect(s.checkCollision(b)).toBe(true);
    expect(s.shields[0].active).toBe(true);
    expect(s.checkCollision(b)).toBe(true);
    expect(s.shields[0].active).toBe(false);
  });

  it('skips inactive blocks so bullets pass through destroyed ones', () => {
    const s = new ShieldSystem();
    s.init(1, 400);
    s.shields.forEach((blk) => (blk.active = false));
    expect(s.checkCollision(bulletAt(165, 455))).toBe(false);
  });

  it('misses bullets that only touch a block edge', () => {
    const s = new ShieldSystem();
    s.init(1, 400);
    // bullet right edge == block left edge -> strict inequality means no hit
    expect(s.checkCollision(bulletAt(156, 455))).toBe(false);
    expect(s.checkCollision(bulletAt(100, 100))).toBe(false);
  });

  it('draws only active blocks with health-based alpha', () => {
    const s = new ShieldSystem();
    s.init(1, 400);
    s.shields[0].health = 50;
    s.shields[1].active = false;
    const ctx = createMockCtx();
    s.draw(ctx);
    expect(ctx.fillRect).toHaveBeenCalledTimes(11);
    expect(ctx.fillStyles[0]).toBe('rgba(0, 255, 255, 0.5)');
  });

  it('reset clears all shields', () => {
    const s = new ShieldSystem();
    s.init();
    s.reset();
    expect(s.shields).toEqual([]);
  });
});
