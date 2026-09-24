import { Ball } from '@/lib/breakout/components/Ball.ts';
import { createMockCtx } from '../helpers/mockCtx';

const make = () => new Ball({ x: 100, y: 100, radius: 8, velocity: { x: 200, y: -300 }, color: '#fff' });

describe('Ball (breakout)', () => {
  it('moves by velocity * speedMultiplier * dt', () => {
    const b = make();
    b.update(0.1);
    expect(b.x).toBe(120);
    expect(b.y).toBe(70);
    b.speedMultiplier = 0.5;
    b.update(0.1);
    expect(b.x).toBe(130);
  });

  it('does not move or draw when inactive', () => {
    const b = make();
    b.active = false;
    b.update(1);
    expect(b.x).toBe(100);
    const ctx = createMockCtx();
    b.draw(ctx);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('bounces on each axis independently', () => {
    const b = make();
    b.bounceX();
    expect(b.velocity).toEqual({ x: -200, y: -300 });
    b.bounceY();
    expect(b.velocity).toEqual({ x: -200, y: 300 });
  });

  it('draws a glowing circle and clears the glow afterwards', () => {
    const b = make();
    const ctx = createMockCtx();
    b.draw(ctx);
    expect(ctx.arc).toHaveBeenCalledWith(100, 100, 8, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.shadowBlur).toBe(0);
  });

  it('reset restores position, velocity, activity and speed', () => {
    const b = make();
    b.active = false;
    b.speedMultiplier = 2;
    b.reset(5, 6, { x: 1, y: 2 });
    expect(b).toMatchObject({ x: 5, y: 6, velocity: { x: 1, y: 2 }, active: true, speedMultiplier: 1 });
  });
});
