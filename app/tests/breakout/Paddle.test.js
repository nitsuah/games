import { Paddle } from '@/lib/breakout/components/Paddle';
import { createMockCtx } from '../helpers/mockCtx';

const make = () =>
  new Paddle({ x: 350, y: 550, width: 100, height: 10, color: '#0ff', speed: 500, canvasWidth: 800 });

describe('Paddle (breakout)', () => {
  it('moves with input', () => {
    const p = make();
    p.update(0.1, { left: true, right: false });
    expect(p.x).toBe(300);
    p.update(0.2, { left: false, right: true });
    expect(p.x).toBe(400);
  });

  it('clamps to the left edge', () => {
    const p = make();
    p.update(10, { left: true, right: false });
    expect(p.x).toBe(0);
  });

  it('clamps to the right edge using the expanded width', () => {
    const p = make();
    p.widthMultiplier = 1.5;
    p.update(10, { left: false, right: true });
    expect(p.getCurrentWidth()).toBe(150);
    expect(p.x).toBe(650);
  });

  it('draws laser turrets only when laser is active', () => {
    const p = make();
    const ctx = createMockCtx();
    p.draw(ctx);
    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
    expect(ctx.shadowBlur).toBe(0);

    p.isLaserActive = true;
    const ctx2 = createMockCtx();
    p.draw(ctx2);
    expect(ctx2.fillRect).toHaveBeenCalledTimes(3);
    expect(ctx2.fillRect).toHaveBeenLastCalledWith(445, 550, 5, 10);
  });

  it('reset clears power-ups', () => {
    const p = make();
    p.widthMultiplier = 2;
    p.isLaserActive = true;
    p.reset(10);
    expect(p).toMatchObject({ x: 10, widthMultiplier: 1, isLaserActive: false });
  });
});
