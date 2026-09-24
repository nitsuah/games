import { Bird } from '@/lib/flappy/components/Bird';
import { createMockCtx } from '../helpers/mockCtx';

describe('Bird', () => {
  it('starts at the given position at rest', () => {
    const b = new Bird(100, 200);
    expect(b).toMatchObject({ x: 100, y: 200, velocity: 0, rotation: 0 });
  });

  it('accelerates downward under gravity', () => {
    const b = new Bird(100, 200);
    b.update(0.1);
    expect(b.velocity).toBeCloseTo(150);
    expect(b.y).toBeCloseTo(215);
  });

  it('flap sets upward velocity and tilts up', () => {
    const b = new Bird(100, 200);
    b.flap();
    expect(b.velocity).toBe(-500);
    expect(b.rotation).toBe(-0.5);
  });

  it('rotation is clamped between -0.5 (rising) and PI/2 (falling)', () => {
    const b = new Bird(100, 200);
    b.flap();
    b.update(0.01); // still rising
    expect(b.rotation).toBe(-0.5);
    for (let i = 0; i < 100; i++) b.update(0.05);
    expect(b.rotation).toBeCloseTo(Math.PI / 2);
  });

  it('rotates toward nose-down while falling', () => {
    const b = new Bird(100, 200);
    b.update(0.1);
    expect(b.rotation).toBeCloseTo(0.3);
  });

  it('draws within a save/restore pair around its centre', () => {
    const b = new Bird(100, 200);
    const ctx = createMockCtx();
    b.draw(ctx);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalledWith(115, 215);
    expect(ctx.rotate).toHaveBeenCalledWith(0);
    expect(ctx.restore).toHaveBeenCalled();
    expect(ctx.fillStyles[0]).toBe('#f1c40f');
  });

  it('reset restores y and clears motion', () => {
    const b = new Bird(100, 200);
    b.flap();
    b.update(0.1);
    b.reset(250);
    expect(b).toMatchObject({ y: 250, velocity: 0, rotation: 0 });
  });
});
