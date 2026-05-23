import ScoreManager from '@/lib/shared/scoring/ScoreManager';

describe('ScoreManager', () => {
  let sm;

  beforeEach(() => {
    sm = new ScoreManager('test-game');
  });

  // ─── Constructor ───────────────────────────────────────────────────────────
  describe('constructor', () => {
    it('initialises with zero score, multiplier 1, combo 0', () => {
      expect(sm.getScore()).toBe(0);
      expect(sm.getMultiplier()).toBe(1.0);
      expect(sm.getCombo()).toBe(0);
    });

    it('stores the gameName', () => {
      expect(sm.gameName).toBe('test-game');
    });

    it('defaults gameName to "default"', () => {
      const def = new ScoreManager();
      expect(def.gameName).toBe('default');
    });

    it('initialises with default base values', () => {
      expect(sm.baseValues).toEqual({ hit: 10, miss: -2, kill: 50, wave: 100 });
    });
  });

  // ─── initialize() ─────────────────────────────────────────────────────────
  describe('initialize()', () => {
    it('resets score, multiplier, and combo', () => {
      sm.score = 999;
      sm.multiplier = 3;
      sm.combo = 5;
      sm.initialize();
      expect(sm.getScore()).toBe(0);
      expect(sm.getMultiplier()).toBe(1.0);
      expect(sm.getCombo()).toBe(0);
    });

    it('merges custom base values with defaults', () => {
      sm.initialize({ hit: 20, headshot: 100 });
      expect(sm.baseValues.hit).toBe(20);
      expect(sm.baseValues.headshot).toBe(100);
      expect(sm.baseValues.kill).toBe(50); // original default preserved
    });
  });

  // ─── addScore() ───────────────────────────────────────────────────────────
  describe('addScore()', () => {
    it('adds points to the score', () => {
      sm.addScore(50);
      expect(sm.getScore()).toBe(50);
    });

    it('applies multiplier by default', () => {
      sm.setMultiplier(2);
      const actual = sm.addScore(30);
      expect(actual).toBe(60);
      expect(sm.getScore()).toBe(60);
    });

    it('floors fractional multiplier results', () => {
      sm.setMultiplier(1.5);
      sm.addScore(3); // 3 * 1.5 = 4.5 → 4
      expect(sm.getScore()).toBe(4);
    });

    it('skips multiplier when applyMultiplier is false', () => {
      sm.setMultiplier(3);
      const actual = sm.addScore(50, false);
      expect(actual).toBe(50);
      expect(sm.getScore()).toBe(50);
    });

    it('returns the actual points added', () => {
      sm.setMultiplier(2);
      expect(sm.addScore(10)).toBe(20);
    });
  });

  // ─── subtractScore() ──────────────────────────────────────────────────────
  describe('subtractScore()', () => {
    it('reduces the score by the given amount', () => {
      sm.addScore(100, false);
      sm.subtractScore(30);
      expect(sm.getScore()).toBe(70);
    });

    it('never drops the score below zero', () => {
      sm.subtractScore(999);
      expect(sm.getScore()).toBe(0);
    });

    it('returns the points subtracted', () => {
      sm.addScore(50, false);
      expect(sm.subtractScore(20)).toBe(20);
    });
  });

  // ─── recordHit() ──────────────────────────────────────────────────────────
  describe('recordHit()', () => {
    it('adds baseValues.hit points by default', () => {
      sm.recordHit();
      expect(sm.getScore()).toBe(10); // baseValues.hit = 10, multiplier 1
    });

    it('scales by targetSize', () => {
      sm.recordHit({ targetSize: 3 });
      expect(sm.getScore()).toBe(30);
    });

    it('includes bonus points', () => {
      sm.recordHit({ bonus: 5 });
      expect(sm.getScore()).toBe(15);
    });

    it('combines targetSize and bonus', () => {
      sm.recordHit({ targetSize: 2, bonus: 5 });
      expect(sm.getScore()).toBe(25);
    });
  });

  // ─── recordMiss() ─────────────────────────────────────────────────────────
  describe('recordMiss()', () => {
    it('subtracts the absolute value of baseValues.miss', () => {
      sm.addScore(100, false);
      sm.recordMiss(); // miss = -2 → subtracts 2
      expect(sm.getScore()).toBe(98);
    });

    it('returns the amount subtracted', () => {
      sm.addScore(100, false);
      expect(sm.recordMiss()).toBe(2);
    });
  });

  // ─── recordKill() ─────────────────────────────────────────────────────────
  describe('recordKill()', () => {
    it('adds baseValues.kill points', () => {
      sm.recordKill();
      expect(sm.getScore()).toBe(50);
    });

    it('scales by targetSize', () => {
      sm.recordKill({ targetSize: 2 });
      expect(sm.getScore()).toBe(100);
    });

    it('includes bonus', () => {
      sm.recordKill({ bonus: 25 });
      expect(sm.getScore()).toBe(75);
    });
  });

  // ─── recordWaveComplete() ─────────────────────────────────────────────────
  describe('recordWaveComplete()', () => {
    it('adds wave points without multiplier', () => {
      sm.setMultiplier(3); // multiplier should NOT apply
      sm.recordWaveComplete(2);
      expect(sm.getScore()).toBe(200); // 100 * 2
    });

    it('scales linearly with wave number', () => {
      sm.recordWaveComplete(5);
      expect(sm.getScore()).toBe(500);
    });
  });

  // ─── combo ────────────────────────────────────────────────────────────────
  describe('incrementCombo() / resetCombo()', () => {
    it('increments combo and returns new value', () => {
      expect(sm.incrementCombo()).toBe(1);
      expect(sm.incrementCombo()).toBe(2);
      expect(sm.getCombo()).toBe(2);
    });

    it('resets combo to 0', () => {
      sm.incrementCombo();
      sm.incrementCombo();
      sm.resetCombo();
      expect(sm.getCombo()).toBe(0);
    });
  });

  // ─── setMultiplier() ──────────────────────────────────────────────────────
  describe('setMultiplier()', () => {
    it('updates the multiplier', () => {
      sm.setMultiplier(2.5);
      expect(sm.getMultiplier()).toBe(2.5);
    });

    it('clamps values below 1.0 to 1.0', () => {
      sm.setMultiplier(0.5);
      expect(sm.getMultiplier()).toBe(1.0);
    });

    it('clamps negative values to 1.0', () => {
      sm.setMultiplier(-5);
      expect(sm.getMultiplier()).toBe(1.0);
    });
  });

  // ─── reset() ──────────────────────────────────────────────────────────────
  describe('reset()', () => {
    it('resets score, multiplier, and combo', () => {
      sm.addScore(500, false);
      sm.setMultiplier(4);
      sm.incrementCombo();
      sm.reset();
      expect(sm.getScore()).toBe(0);
      expect(sm.getMultiplier()).toBe(1.0);
      expect(sm.getCombo()).toBe(0);
    });
  });

  // ─── Listener system ──────────────────────────────────────────────────────
  describe('listener system', () => {
    it('calls listener on scoreAdded', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.addScore(10, false);
      expect(listener).toHaveBeenCalledWith('scoreAdded', expect.objectContaining({
        points: 10,
        totalScore: 10,
      }));
    });

    it('calls listener on scoreSubtracted', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.addScore(50, false);
      sm.subtractScore(10);
      expect(listener).toHaveBeenCalledWith('scoreSubtracted', expect.objectContaining({
        points: 10,
        totalScore: 40,
      }));
    });

    it('calls listener on comboChanged', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.incrementCombo();
      expect(listener).toHaveBeenCalledWith('comboChanged', { combo: 1 });
    });

    it('calls listener on comboReset with oldCombo', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.incrementCombo();
      sm.incrementCombo();
      sm.resetCombo();
      expect(listener).toHaveBeenCalledWith('comboReset', { oldCombo: 2 });
    });

    it('calls listener on multiplierChanged', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.setMultiplier(2);
      expect(listener).toHaveBeenCalledWith('multiplierChanged', { multiplier: 2 });
    });

    it('calls listener on reset', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.reset();
      expect(listener).toHaveBeenCalledWith('reset', {});
    });

    it('removes a listener correctly', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.removeListener(listener);
      sm.addScore(10, false);
      expect(listener).not.toHaveBeenCalled();
    });

    it('ignores removal of listener not in list', () => {
      const noop = jest.fn();
      expect(() => sm.removeListener(noop)).not.toThrow();
    });

    it('supports multiple listeners', () => {
      const a = jest.fn();
      const b = jest.fn();
      sm.addListener(a);
      sm.addListener(b);
      sm.addScore(5, false);
      expect(a).toHaveBeenCalled();
      expect(b).toHaveBeenCalled();
    });

    it('does not crash if a listener throws', () => {
      const badListener = jest.fn(() => { throw new Error('oops'); });
      sm.addListener(badListener);
      expect(() => sm.addScore(10, false)).not.toThrow();
    });

    it('notifyListeners passes correct multiplier info on addScore', () => {
      const listener = jest.fn();
      sm.addListener(listener);
      sm.setMultiplier(3); // register listener FIRST, then change multiplier
      sm.addScore(10);
      expect(listener).toHaveBeenCalledWith('multiplierChanged', { multiplier: 3 });
      expect(listener).toHaveBeenCalledWith('scoreAdded', expect.objectContaining({
        basePoints: 10,
        multiplier: 3,
        points: 30,
      }));
    });
  });
});
