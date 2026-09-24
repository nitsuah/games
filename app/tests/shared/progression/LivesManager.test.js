import { LivesManager } from '@/lib/shared/progression/LivesManager';

describe('LivesManager', () => {
  it('uses defaults when no config is given', () => {
    const lm = new LivesManager();
    expect(lm.lives).toBe(3);
    expect(lm.maxLives).toBe(5);
    expect(lm.invincibilityDuration).toBe(2000);
    expect(lm.lastHitTime).toBe(0);
  });

  it('respects explicit zero values instead of falling back to defaults', () => {
    const lm = new LivesManager({ initialLives: 0, invincibilityDuration: 0 });
    expect(lm.lives).toBe(0);
    expect(lm.invincibilityDuration).toBe(0);
    expect(lm.isGameOver()).toBe(true);
  });

  describe('loseLife', () => {
    it('decrements lives and records the hit time', () => {
      const lm = new LivesManager({ initialLives: 3 });
      expect(lm.loseLife(10000)).toBe(true);
      expect(lm.lives).toBe(2);
      expect(lm.lastHitTime).toBe(10000);
    });

    it('ignores hits during the invincibility window', () => {
      const lm = new LivesManager({ initialLives: 3, invincibilityDuration: 2000 });
      lm.loseLife(10000);
      expect(lm.loseLife(11999)).toBe(false);
      expect(lm.lives).toBe(2);
    });

    it('accepts a hit exactly when invincibility expires', () => {
      const lm = new LivesManager({ initialLives: 3, invincibilityDuration: 2000 });
      lm.loseLife(10000);
      expect(lm.loseLife(12000)).toBe(true);
      expect(lm.lives).toBe(1);
    });

    it('never drops below zero lives', () => {
      const lm = new LivesManager({ initialLives: 1, invincibilityDuration: 0 });
      expect(lm.loseLife(5000)).toBe(true);
      expect(lm.loseLife(6000)).toBe(false);
      expect(lm.lives).toBe(0);
      expect(lm.isGameOver()).toBe(true);
    });

    it('falls back to Date.now() when no time is given', () => {
      const spy = jest.spyOn(Date, 'now').mockReturnValue(50000);
      const lm = new LivesManager();
      expect(lm.loseLife()).toBe(true);
      expect(lm.lastHitTime).toBe(50000);
      expect(lm.isInvincible()).toBe(true);
      spy.mockReturnValue(52000);
      expect(lm.isInvincible()).toBe(false);
      spy.mockRestore();
    });
  });

  describe('gainLife', () => {
    it('adds one life by default', () => {
      const lm = new LivesManager({ initialLives: 2 });
      lm.gainLife();
      expect(lm.lives).toBe(3);
    });

    it('caps at maxLives', () => {
      const lm = new LivesManager({ initialLives: 4, maxLives: 5 });
      lm.gainLife(10);
      expect(lm.lives).toBe(5);
    });
  });

  describe('reset', () => {
    it('restores default lives and clears invincibility', () => {
      const lm = new LivesManager({ initialLives: 3 });
      lm.loseLife(10000);
      lm.reset();
      expect(lm.lives).toBe(3);
      expect(lm.lastHitTime).toBe(0);
    });

    it('accepts a custom life count, including zero', () => {
      const lm = new LivesManager();
      lm.reset(7);
      expect(lm.lives).toBe(7);
      lm.reset(0);
      expect(lm.lives).toBe(0);
    });
  });
});
