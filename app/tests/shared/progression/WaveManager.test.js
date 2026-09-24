import { WaveManager } from '@/lib/shared/progression/WaveManager';

describe('WaveManager', () => {
  it('uses defaults when no config is given', () => {
    const wm = new WaveManager();
    expect(wm.currentWave).toBe(1);
    expect(wm.difficultyMultiplier).toBe(1.2);
    expect(wm.baseEnemyCount).toBe(5);
    expect(wm.maxEnemies).toBe(50);
  });

  it('respects explicit zero values', () => {
    const wm = new WaveManager({ baseEnemyCount: 0 });
    expect(wm.getEnemyCount()).toBe(0);
  });

  it('advances and resets waves', () => {
    const wm = new WaveManager({ initialWave: 3 });
    expect(wm.nextWave()).toBe(4);
    expect(wm.currentWave).toBe(4);
    wm.reset();
    expect(wm.currentWave).toBe(1);
  });

  describe('getEnemyCount', () => {
    it('returns the base count on wave 1', () => {
      expect(new WaveManager({ baseEnemyCount: 8 }).getEnemyCount()).toBe(8);
    });

    it('scales geometrically and floors the result', () => {
      const wm = new WaveManager({ initialWave: 3, baseEnemyCount: 5, difficultyMultiplier: 1.5 });
      // 5 * 1.5^2 = 11.25
      expect(wm.getEnemyCount()).toBe(11);
    });

    it('is capped at maxEnemies', () => {
      const wm = new WaveManager({ initialWave: 100, maxEnemies: 40 });
      expect(wm.getEnemyCount()).toBe(40);
    });
  });

  it('increases speed by 10% per wave', () => {
    const wm = new WaveManager();
    expect(wm.getSpeedMultiplier()).toBe(1);
    wm.nextWave();
    wm.nextWave();
    expect(wm.getSpeedMultiplier()).toBeCloseTo(1.2);
  });

  describe('getSpawnInterval', () => {
    it('uses a 2000ms base by default', () => {
      expect(new WaveManager().getSpawnInterval()).toBe(2000);
    });

    it('shrinks by 10% per wave', () => {
      const wm = new WaveManager({ initialWave: 2 });
      expect(wm.getSpawnInterval(1000)).toBeCloseTo(900);
    });

    it('never goes below 500ms', () => {
      const wm = new WaveManager({ initialWave: 50 });
      expect(wm.getSpawnInterval()).toBe(500);
    });
  });
});
