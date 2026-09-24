import { EnemyFormation } from '@/lib/space-invaders/components/EnemyFormation';
import { createMockCtx } from '../helpers/mockCtx';

const bullet = (x, y) => ({ x, y, width: 4, height: 10, velocity: -10, active: true, isPlayer: true });

describe('EnemyFormation', () => {
  it('builds a 5x11 grid with types by row pair', () => {
    const f = new EnemyFormation(800);
    f.init(1);
    expect(f.enemies).toHaveLength(55);
    expect(f.enemies[0]).toEqual({ x: 50, y: 50, width: 30, height: 20, row: 0, col: 0, active: true, type: 0 });
    expect(f.enemies[10].x).toBe(50 + 10 * 45);
    expect(f.enemies.filter((e) => e.row === 4).every((e) => e.type === 2)).toBe(true);
    expect(f.enemies.filter((e) => e.row === 2).every((e) => e.type === 1)).toBe(true);
  });

  it('scales move speed with level', () => {
    const f = new EnemyFormation(800);
    f.init(1);
    expect(f.moveSpeed).toBe(50);
    f.init(4);
    expect(f.moveSpeed).toBe(80);
  });

  it('moves active enemies horizontally without dropping mid-screen', () => {
    const f = new EnemyFormation(2000);
    f.init(1);
    f.enemies[1].active = false;
    f.update(1);
    expect(f.enemies[0].x).toBe(100);
    expect(f.enemies[1].x).toBe(95); // inactive: unmoved
    expect(f.enemies[0].y).toBe(50);
    expect(f.direction).toBe(1);
  });

  it('reverses, drops and speeds up when reaching the right edge', () => {
    const f = new EnemyFormation(800);
    f.init(1);
    f.update(3); // rightmost x: 500+150=650, +30 > 780? no
    expect(f.direction).toBe(1);
    f.update(2); // rightmost 750 + 30 = 780 -> not > 780
    expect(f.direction).toBe(1);
    f.update(0.1);
    expect(f.direction).toBe(-1);
    expect(f.moveSpeed).toBe(55);
    expect(f.enemies[0].y).toBe(70);
  });

  it('reverses when reaching the left edge', () => {
    const f = new EnemyFormation(800);
    f.init(1);
    f.direction = -1;
    f.update(1); // leftmost x = 0 < 20
    expect(f.direction).toBe(1);
    expect(f.enemies[0].y).toBe(70);
  });

  it('ignores inactive enemies when checking edges', () => {
    const f = new EnemyFormation(800);
    f.init(1);
    f.enemies.forEach((e) => {
      if (e.col === 10) e.active = false;
    });
    f.update(5.2); // col 9 max x = 455 + 260 = 715 + 30 = 745 < 780
    expect(f.direction).toBe(1);
  });

  describe('checkCollision', () => {
    it('destroys and returns the first enemy hit', () => {
      const f = new EnemyFormation(800);
      f.init(1);
      const hit = f.checkCollision(bullet(55, 55));
      expect(hit).toBe(f.enemies[0]);
      expect(hit.active).toBe(false);
      expect(f.getActiveCount()).toBe(54);
    });

    it('passes through destroyed enemies and returns null on miss', () => {
      const f = new EnemyFormation(800);
      f.init(1);
      f.enemies[0].active = false;
      expect(f.checkCollision(bullet(55, 55))).toBeNull();
      expect(f.checkCollision(bullet(0, 0))).toBeNull();
    });
  });

  describe('getLowestEnemyY', () => {
    it('returns the bottom edge of the lowest active enemy', () => {
      const f = new EnemyFormation(800);
      f.init(1);
      expect(f.getLowestEnemyY()).toBe(50 + 4 * 35 + 20);
      f.enemies.filter((e) => e.row === 4).forEach((e) => (e.active = false));
      expect(f.getLowestEnemyY()).toBe(50 + 3 * 35 + 20);
    });

    it('returns 0 when no enemies remain', () => {
      const f = new EnemyFormation(800);
      expect(f.getLowestEnemyY()).toBe(0);
    });
  });

  it('draws active enemies with a colour per type', () => {
    const f = new EnemyFormation(800);
    f.init(1);
    f.enemies = [f.enemies[0], f.enemies[22], f.enemies[44], { ...f.enemies[1], active: false }];
    const ctx = createMockCtx();
    f.draw(ctx);
    expect(ctx.fillStyles).toEqual(['#ff00ff', '#00ffff', '#ffff00']);
    expect(ctx.fillRect).toHaveBeenCalledTimes(3);
  });
});
