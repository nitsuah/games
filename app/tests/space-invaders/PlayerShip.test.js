import { PlayerShip } from '@/lib/space-invaders/components/PlayerShip';
import { EnemyShootingSystem } from '@/lib/shared/combat/EnemyShootingSystem';
import { createMockCtx } from '../helpers/mockCtx';

const idle = { left: false, right: false, fire: false };

describe('PlayerShip', () => {
  it('starts centred near the bottom', () => {
    const p = new PlayerShip(800);
    expect(p.x).toBe(380);
    expect(p.y).toBe(550);
  });

  it('moves left and right by speed * dt', () => {
    const p = new PlayerShip(800);
    const s = new EnemyShootingSystem();
    p.update(0.1, { ...idle, left: true }, s);
    expect(p.x).toBe(350);
    p.update(0.2, { ...idle, right: true }, s);
    expect(p.x).toBe(410);
  });

  it('cancels out when both directions are held', () => {
    const p = new PlayerShip(800);
    p.update(0.1, { left: true, right: true, fire: false }, new EnemyShootingSystem());
    expect(p.x).toBe(380);
  });

  it('clamps to both screen edges', () => {
    const p = new PlayerShip(800);
    const s = new EnemyShootingSystem();
    p.update(10, { ...idle, left: true }, s);
    expect(p.x).toBe(0);
    p.update(10, { ...idle, right: true }, s);
    expect(p.x).toBe(760);
  });

  it('fires a centred player bullet', () => {
    const p = new PlayerShip(800);
    const s = new EnemyShootingSystem();
    p.update(0, { ...idle, fire: true }, s);
    expect(s.bullets).toHaveLength(1);
    expect(s.bullets[0]).toMatchObject({ x: 398, y: 550, isPlayer: true });
  });

  it('allows only one player bullet on screen at a time', () => {
    const p = new PlayerShip(800);
    const s = new EnemyShootingSystem();
    s.spawnBullet(0, 0, false); // enemy bullets don't block firing
    p.update(0, { ...idle, fire: true }, s);
    p.update(0, { ...idle, fire: true }, s);
    expect(s.bullets.filter((b) => b.isPlayer)).toHaveLength(1);

    s.bullets.find((b) => b.isPlayer).active = false;
    p.update(0, { ...idle, fire: true }, s);
    expect(s.bullets.filter((b) => b.isPlayer && b.active)).toHaveLength(1);
  });

  it('draws a triangle', () => {
    const p = new PlayerShip(800);
    const ctx = createMockCtx();
    p.draw(ctx);
    expect(ctx.moveTo).toHaveBeenCalledWith(400, 550);
    expect(ctx.lineTo).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('reset recentres horizontally', () => {
    const p = new PlayerShip(800);
    p.x = 5;
    p.reset();
    expect(p.x).toBe(380);
  });
});
