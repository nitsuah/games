import { EnemyShootingSystem } from '@/lib/shared/combat/EnemyShootingSystem';
import { createMockCtx } from '../../helpers/mockCtx';

describe('EnemyShootingSystem', () => {
  it('spawns enemy bullets moving down and player bullets moving up', () => {
    const s = new EnemyShootingSystem();
    s.spawnBullet(10, 20);
    s.spawnBullet(30, 40, true);
    expect(s.bullets[0]).toEqual({ x: 10, y: 20, width: 4, height: 10, velocity: 5, active: true, isPlayer: false });
    expect(s.bullets[1]).toMatchObject({ velocity: -10, isPlayer: true });
  });

  it('moves bullets frame-rate independently (velocity * dt * 60)', () => {
    const s = new EnemyShootingSystem();
    s.spawnBullet(0, 100);
    s.update(0.5, 0, 1);
    expect(s.bullets[0].y).toBe(100 + 5 * 30);
  });

  it('removes bullets that leave the screen top or bottom', () => {
    const s = new EnemyShootingSystem();
    s.spawnBullet(0, 799); // goes > 800
    s.spawnBullet(0, 5, true); // goes < 0
    s.spawnBullet(0, 400);
    s.update(1 / 60, 0, 1);
    expect(s.bullets).toHaveLength(1);
    expect(s.bullets[0].y).toBe(405);
  });

  it('drops already-inactive bullets without moving them', () => {
    const s = new EnemyShootingSystem();
    s.spawnBullet(0, 100);
    s.bullets[0].active = false;
    s.update(1, 0, 1);
    expect(s.bullets).toHaveLength(0);
  });

  it('signals fire once the wave-adjusted rate elapses', () => {
    const s = new EnemyShootingSystem();
    // wave 1 -> 2000 - 200 = 1800ms
    expect(s.update(1.8, 10, 1)).toBe(false); // must strictly exceed
    expect(s.update(0.001, 10, 1)).toBe(true);
    expect(s.fireTimer).toBe(0);
  });

  it('never fires faster than every 500ms on high waves', () => {
    const s = new EnemyShootingSystem();
    expect(s.update(0.5, 10, 50)).toBe(false);
    expect(s.update(0.01, 10, 50)).toBe(true);
  });

  it('does not fire when there are no enemies, but keeps accumulating time', () => {
    const s = new EnemyShootingSystem();
    expect(s.update(5, 0, 1)).toBe(false);
    expect(s.fireTimer).toBe(5000);
    expect(s.update(0, 1, 1)).toBe(true);
  });

  it('draws active bullets with side-specific colours', () => {
    const s = new EnemyShootingSystem();
    s.spawnBullet(1, 1);
    s.spawnBullet(2, 2, true);
    s.spawnBullet(3, 3);
    s.bullets[2].active = false;
    const ctx = createMockCtx();
    s.draw(ctx);
    expect(ctx.fillStyles).toEqual(['#ff0000', '#00ff00']);
    expect(ctx.fillRect).toHaveBeenCalledTimes(2);
  });

  it('reset clears bullets and timer', () => {
    const s = new EnemyShootingSystem();
    s.spawnBullet(0, 0);
    s.fireTimer = 123;
    s.reset();
    expect(s.bullets).toEqual([]);
    expect(s.fireTimer).toBe(0);
  });
});
