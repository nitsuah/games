import { Background } from '@/lib/flappy/components/Background';
import { createMockCtx } from '../helpers/mockCtx';

describe('Background', () => {
  it('scrolls clouds at 20% of speed and wraps at canvas width', () => {
    const bg = new Background(400, 600);
    bg.update(1, 100);
    expect(bg.cloudOffset).toBe(20);
    bg.update(20, 100); // 20 + 400 = 420 % 400
    expect(bg.cloudOffset).toBe(20);
  });

  it('scrolls ground at full speed and wraps every 20px', () => {
    const bg = new Background(400, 600);
    bg.update(0.25, 100);
    expect(bg.groundOffset).toBe(5);
    bg.update(0.2, 100);
    expect(bg.groundOffset).toBe(5);
  });

  it('draws the sky and five clouds', () => {
    const bg = new Background(400, 600);
    const ctx = createMockCtx();
    const cloud = jest.spyOn(bg, 'drawCloud');
    bg.draw(ctx);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 400, 600);
    expect(cloud).toHaveBeenCalledTimes(5);
    expect(ctx.fillStyles[0]).toBe('#3498db');
  });

  it('drawCloud draws three overlapping arcs', () => {
    const bg = new Background(400, 600);
    const ctx = createMockCtx();
    bg.drawCloud(ctx, 10, 20);
    expect(ctx.arc).toHaveBeenCalledTimes(3);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });
});
