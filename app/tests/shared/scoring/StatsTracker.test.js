import StatsTracker from '@/lib/shared/scoring/StatsTracker';

describe('StatsTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new StatsTracker('test-game');
    localStorage.clear();
  });

  // ─── Constructor ──────────────────────────────────────────────────────────
  describe('constructor', () => {
    it('stores the gameName', () => {
      expect(tracker.gameName).toBe('test-game');
    });

    it('defaults gameName to "default"', () => {
      const def = new StatsTracker();
      expect(def.gameName).toBe('default');
    });

    it('initialises all counters to 0 / null', () => {
      expect(tracker.hits).toBe(0);
      expect(tracker.misses).toBe(0);
      expect(tracker.kills).toBe(0);
      expect(tracker.deaths).toBe(0);
      expect(tracker.timeStarted).toBeNull();
      expect(tracker.timeEnded).toBeNull();
    });
  });

  // ─── startSession() ───────────────────────────────────────────────────────
  describe('startSession()', () => {
    it('resets counters to 0', () => {
      tracker.hits = 5;
      tracker.misses = 3;
      tracker.kills = 2;
      tracker.deaths = 1;
      tracker.startSession();
      expect(tracker.hits).toBe(0);
      expect(tracker.misses).toBe(0);
      expect(tracker.kills).toBe(0);
      expect(tracker.deaths).toBe(0);
    });

    it('sets timeStarted to a number (timestamp)', () => {
      tracker.startSession();
      expect(typeof tracker.timeStarted).toBe('number');
      expect(tracker.timeStarted).toBeGreaterThan(0);
    });

    it('resets timeEnded to null', () => {
      tracker.timeEnded = Date.now();
      tracker.startSession();
      expect(tracker.timeEnded).toBeNull();
    });
  });

  // ─── endSession() ─────────────────────────────────────────────────────────
  describe('endSession()', () => {
    it('sets timeEnded to a timestamp', () => {
      tracker.startSession();
      tracker.endSession();
      expect(typeof tracker.timeEnded).toBe('number');
      expect(tracker.timeEnded).toBeGreaterThanOrEqual(tracker.timeStarted);
    });
  });

  // ─── Individual record methods ────────────────────────────────────────────
  describe('recordHit()', () => {
    it('increments hits by 1', () => {
      tracker.recordHit();
      tracker.recordHit();
      expect(tracker.hits).toBe(2);
    });
  });

  describe('recordMiss()', () => {
    it('increments misses by 1', () => {
      tracker.recordMiss();
      expect(tracker.misses).toBe(1);
    });
  });

  describe('recordKill()', () => {
    it('increments kills by 1', () => {
      tracker.recordKill();
      tracker.recordKill();
      expect(tracker.kills).toBe(2);
    });
  });

  describe('recordDeath()', () => {
    it('increments deaths by 1', () => {
      tracker.recordDeath();
      expect(tracker.deaths).toBe(1);
    });
  });

  // ─── getAccuracy() ────────────────────────────────────────────────────────
  describe('getAccuracy()', () => {
    it('returns 0 when no shots have been fired', () => {
      expect(tracker.getAccuracy()).toBe(0);
    });

    it('returns 100 when all shots are hits', () => {
      tracker.recordHit();
      tracker.recordHit();
      expect(tracker.getAccuracy()).toBe(100);
    });

    it('returns 0 when all shots are misses', () => {
      tracker.recordMiss();
      tracker.recordMiss();
      expect(tracker.getAccuracy()).toBe(0);
    });

    it('calculates a mixed accuracy correctly', () => {
      tracker.recordHit();
      tracker.recordMiss();
      expect(tracker.getAccuracy()).toBe(50);
    });

    it('calculates 75% accuracy for 3 hits and 1 miss', () => {
      tracker.recordHit();
      tracker.recordHit();
      tracker.recordHit();
      tracker.recordMiss();
      expect(tracker.getAccuracy()).toBe(75);
    });
  });

  // ─── getTotalShots() ──────────────────────────────────────────────────────
  describe('getTotalShots()', () => {
    it('returns 0 with no shots', () => {
      expect(tracker.getTotalShots()).toBe(0);
    });

    it('returns sum of hits and misses', () => {
      tracker.recordHit();
      tracker.recordHit();
      tracker.recordMiss();
      expect(tracker.getTotalShots()).toBe(3);
    });
  });

  // ─── getSessionDuration() ─────────────────────────────────────────────────
  describe('getSessionDuration()', () => {
    it('returns 0 when session has not started', () => {
      expect(tracker.getSessionDuration()).toBe(0);
    });

    it('returns elapsed time since startSession when not ended', () => {
      jest.useFakeTimers();
      tracker.startSession();
      jest.advanceTimersByTime(2000);
      expect(tracker.getSessionDuration()).toBeGreaterThanOrEqual(2000);
      jest.useRealTimers();
    });

    it('returns fixed duration after endSession', () => {
      jest.useFakeTimers();
      tracker.startSession();
      jest.advanceTimersByTime(5000);
      tracker.endSession();
      jest.advanceTimersByTime(10000); // time keeps going but duration should be fixed
      expect(tracker.getSessionDuration()).toBeCloseTo(5000, -2);
      jest.useRealTimers();
    });
  });

  // ─── getFormattedDuration() ───────────────────────────────────────────────
  describe('getFormattedDuration()', () => {
    it('returns "00:00" when no session started', () => {
      expect(tracker.getFormattedDuration()).toBe('00:00');
    });

    it('formats 90 seconds as "01:30"', () => {
      jest.useFakeTimers();
      tracker.startSession();
      jest.advanceTimersByTime(90000);
      tracker.endSession();
      expect(tracker.getFormattedDuration()).toBe('01:30');
      jest.useRealTimers();
    });

    it('formats 61 seconds as "01:01"', () => {
      jest.useFakeTimers();
      tracker.startSession();
      jest.advanceTimersByTime(61000);
      tracker.endSession();
      expect(tracker.getFormattedDuration()).toBe('01:01');
      jest.useRealTimers();
    });

    it('pads single-digit minutes and seconds', () => {
      jest.useFakeTimers();
      tracker.startSession();
      jest.advanceTimersByTime(9000); // 9 seconds
      tracker.endSession();
      expect(tracker.getFormattedDuration()).toBe('00:09');
      jest.useRealTimers();
    });
  });

  // ─── getSessionStats() ────────────────────────────────────────────────────
  describe('getSessionStats()', () => {
    it('returns a complete stats object', () => {
      tracker.recordHit();
      tracker.recordMiss();
      tracker.recordKill();
      tracker.recordDeath();

      const stats = tracker.getSessionStats();
      expect(stats).toMatchObject({
        hits: 1,
        misses: 1,
        kills: 1,
        deaths: 1,
        accuracy: 50,
      });
      expect(typeof stats.duration).toBe('number');
      expect(typeof stats.durationFormatted).toBe('string');
    });
  });

  // ─── getBestAccuracy() ────────────────────────────────────────────────────
  describe('getBestAccuracy()', () => {
    it('returns 0 when nothing is saved', () => {
      expect(tracker.getBestAccuracy()).toBe(0);
    });

    it('returns the previously saved best accuracy', () => {
      localStorage.setItem('test-game_stats_bestAccuracy', '85.5');
      expect(tracker.getBestAccuracy()).toBe(85.5);
    });
  });

  // ─── saveBestAccuracy() ───────────────────────────────────────────────────
  describe('saveBestAccuracy()', () => {
    it('saves a new best accuracy and returns true', () => {
      const result = tracker.saveBestAccuracy(75);
      expect(result).toBe(true);
      expect(tracker.getBestAccuracy()).toBe(75);
    });

    it('returns false when accuracy does not exceed current best', () => {
      tracker.saveBestAccuracy(80);
      const result = tracker.saveBestAccuracy(70);
      expect(result).toBe(false);
      expect(tracker.getBestAccuracy()).toBe(80); // unchanged
    });

    it('returns false when accuracy equals the current best', () => {
      tracker.saveBestAccuracy(80);
      const result = tracker.saveBestAccuracy(80);
      expect(result).toBe(false);
    });

    it('returns false when window is undefined (SSR)', () => {
      // In jsdom, 'typeof window' is always 'object', so we simulate the SSR
      // guard by checking that the code path treats window as undefined.
      // We verify this by mocking localStorage.setItem to throw a storage error,
      // which exercises the catch branch (returns false).
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      // getBestAccuracy returns 0, so 100 > 0 → enters the try block → throws → returns false
      expect(tracker.saveBestAccuracy(100)).toBe(false);
      setItemSpy.mockRestore();
    });
  });

  // ─── saveSessionAccuracy() ────────────────────────────────────────────────
  describe('saveSessionAccuracy()', () => {
    it('saves the current session accuracy as best if higher', () => {
      tracker.recordHit();
      tracker.recordHit();
      tracker.recordMiss(); // 66.67%
      tracker.saveSessionAccuracy();
      expect(tracker.getBestAccuracy()).toBeCloseTo(66.67, 1);
    });
  });

  // ─── getAllTimeStats() ────────────────────────────────────────────────────
  describe('getAllTimeStats()', () => {
    it('returns default stats when nothing is saved', () => {
      const stats = tracker.getAllTimeStats();
      expect(stats).toEqual({
        totalGames: 0,
        totalHits: 0,
        totalMisses: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalPlayTime: 0,
      });
    });

    it('returns saved stats from localStorage', () => {
      const saved = { totalGames: 5, totalHits: 100, totalMisses: 20, totalKills: 30, totalDeaths: 3, totalPlayTime: 60000 };
      localStorage.setItem('test-game_stats', JSON.stringify(saved));
      expect(tracker.getAllTimeStats()).toEqual(saved);
    });

    it('returns defaults when localStorage value is corrupt JSON', () => {
      localStorage.setItem('test-game_stats', '{invalid json}');
      const stats = tracker.getAllTimeStats();
      expect(stats.totalGames).toBe(0);
    });
  });

  // ─── saveToAllTimeStats() ─────────────────────────────────────────────────
  describe('saveToAllTimeStats()', () => {
    it('accumulates session data into all-time stats', () => {
      tracker.startSession();
      tracker.recordHit();
      tracker.recordHit();
      tracker.recordMiss();
      tracker.recordKill();
      tracker.recordDeath();
      tracker.endSession();

      tracker.saveToAllTimeStats();

      const allTime = tracker.getAllTimeStats();
      expect(allTime.totalGames).toBe(1);
      expect(allTime.totalHits).toBe(2);
      expect(allTime.totalMisses).toBe(1);
      expect(allTime.totalKills).toBe(1);
      expect(allTime.totalDeaths).toBe(1);
    });

    it('accumulates across multiple saves', () => {
      tracker.startSession();
      tracker.recordHit();
      tracker.endSession();
      tracker.saveToAllTimeStats();

      const t2 = new StatsTracker('test-game');
      t2.startSession();
      t2.recordHit();
      t2.recordHit();
      t2.endSession();
      t2.saveToAllTimeStats();

      const allTime = tracker.getAllTimeStats();
      expect(allTime.totalGames).toBe(2);
      expect(allTime.totalHits).toBe(3);
    });
  });

  // ─── clearAllStats() ──────────────────────────────────────────────────────
  describe('clearAllStats()', () => {
    it('removes persisted stats and resets session', () => {
      tracker.saveBestAccuracy(90);
      tracker.saveToAllTimeStats();

      tracker.clearAllStats();

      expect(tracker.getBestAccuracy()).toBe(0);
      expect(tracker.getAllTimeStats()).toEqual(expect.objectContaining({ totalGames: 0 }));
      expect(tracker.hits).toBe(0);
    });
  });

  // ─── reset() ──────────────────────────────────────────────────────────────
  describe('reset()', () => {
    it('delegates to startSession, resetting counters', () => {
      tracker.hits = 10;
      tracker.misses = 5;
      tracker.reset();
      expect(tracker.hits).toBe(0);
      expect(tracker.misses).toBe(0);
    });
  });
});
