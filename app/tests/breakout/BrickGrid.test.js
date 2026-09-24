import { BrickGrid } from '@/lib/breakout/components/BrickGrid';
import { Ball } from '@/lib/breakout/components/Ball.ts';
import { createMockCtx } from '../helpers/mockCtx';

const ball = (x, y, vx = 100, vy = -100) => new Ball({ x, y, radius: 5, velocity: { x: vx, y: vy }, color: '#fff' });

describe('BrickGrid', () => {
  it('defaults to 8x10 and builds column-major', () => {
    const g = new BrickGrid();
    g.init(1);
    expect(g.bricks).toHaveLength(80);
    expect(g.bricks[0]).toEqual({
      x: 35,
      y: 60,
      width: 75,
      height: 20,
      color: '#c0392b',
      value: 80,
      active: true,
      hitsRequired: 1,
    });
    expect(g.bricks[1]).toMatchObject({ x: 35, y: 90, value: 70 });
    expect(g.bricks[8]).toMatchObject({ x: 120, y: 60 });
  });

  it('level 1 bricks all need one hit; later levels harden the top two rows', () => {
    const g = new BrickGrid(3, 2);
    g.init(1);
    expect(g.bricks.every((b) => b.hitsRequired === 1)).toBe(true);
    g.init(2);
    expect(g.bricks.map((b) => b.hitsRequired)).toEqual([2, 2, 1, 2, 2, 1]);
  });

  it('cycles colours when there are more rows than colours', () => {
    const g = new BrickGrid(9, 1);
    g.init(1);
    expect(g.bricks[8].color).toBe(g.bricks[0].color);
  });

  describe('checkCollision', () => {
    it('destroys a 1-hit brick and bounces vertically on a top/bottom hit', () => {
      const g = new BrickGrid(1, 1);
      g.init(1); // brick 35..110 x 60..80
      const b = ball(70, 84); // overlapping bottom face
      const hit = g.checkCollision(b);
      expect(hit).toBe(g.bricks[0]);
      expect(hit.active).toBe(false);
      expect(b.velocity.y).toBe(100);
      expect(b.velocity.x).toBe(100);
      expect(g.getActiveBrickCount()).toBe(0);
    });

    it('bounces horizontally on a side hit', () => {
      const g = new BrickGrid(1, 1);
      g.init(1);
      const b = ball(32, 70); // overlapping left face by 2px
      g.checkCollision(b);
      expect(b.velocity.x).toBe(-100);
      expect(b.velocity.y).toBe(-100);
    });

    it('damages a hardened brick without destroying it first', () => {
      const g = new BrickGrid(1, 1);
      g.init(2);
      const b = ball(70, 84);
      expect(g.checkCollision(b)).toBeNull();
      expect(g.bricks[0]).toMatchObject({ active: true, hitsRequired: 1 });
      expect(g.checkCollision(b)).toBe(g.bricks[0]);
    });

    it('returns null for misses and skips inactive bricks', () => {
      const g = new BrickGrid(1, 1);
      g.init(1);
      expect(g.checkCollision(ball(500, 500))).toBeNull();
      g.bricks[0].active = false;
      expect(g.checkCollision(ball(70, 70))).toBeNull();
    });
  });

  describe('draw', () => {
    it('draws active bricks with a shine and darkens multi-hit bricks', () => {
      const g = new BrickGrid(2, 1);
      g.init(1);
      g.bricks[0].hitsRequired = 2; // '#c0392b' darkened 20%
      const ctx = createMockCtx();
      g.draw(ctx);
      expect(ctx.rect).toHaveBeenCalledTimes(2);
      expect(ctx.fillStyles).toEqual(['#992d22', 'rgba(255,255,255,0.1)', '#e67e22', 'rgba(255,255,255,0.1)']);
    });

    it('expands 3-digit hex and leaves non-hex colours untouched when darkening', () => {
      const g = new BrickGrid(1, 1);
      g.init(1);
      g.bricks[0].hitsRequired = 2;
      g.bricks[0].color = '#fff';
      let ctx = createMockCtx();
      g.draw(ctx);
      expect(ctx.fillStyles[0]).toBe('#cccccc');

      g.bricks[0].color = 'red';
      ctx = createMockCtx();
      g.draw(ctx);
      expect(ctx.fillStyles[0]).toBe('red');
    });

    it('skips inactive bricks', () => {
      const g = new BrickGrid(1, 1);
      g.init(1);
      g.bricks[0].active = false;
      const ctx = createMockCtx();
      g.draw(ctx);
      expect(ctx.rect).not.toHaveBeenCalled();
    });
  });
});
