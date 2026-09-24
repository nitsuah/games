import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';

describe('HighScoreManager', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('namespaces storage keys by game name', () => {
    const m = new HighScoreManager('snake');
    expect(m.storageKey).toBe('snake_highScore');
    expect(m.leaderboardKey).toBe('snake_leaderboard');
    expect(new HighScoreManager().gameName).toBe('default');
  });

  describe('high score', () => {
    it('returns 0 when nothing is saved', () => {
      expect(new HighScoreManager('g').getHighScore()).toBe(0);
    });

    it('saves only scores that beat the current high', () => {
      const m = new HighScoreManager('g');
      expect(m.saveHighScore(100)).toBe(true);
      expect(m.saveHighScore(100)).toBe(false); // tie is not a new high
      expect(m.saveHighScore(50)).toBe(false);
      expect(m.getHighScore()).toBe(100);
      expect(localStorage.getItem('g_highScore')).toBe('100');
    });

    it('isNewHighScore checks without persisting', () => {
      const m = new HighScoreManager('g');
      m.saveHighScore(10);
      expect(m.isNewHighScore(11)).toBe(true);
      expect(m.isNewHighScore(10)).toBe(false);
      expect(m.getHighScore()).toBe(10);
    });

    it('clearHighScore removes the saved value', () => {
      const m = new HighScoreManager('g');
      m.saveHighScore(10);
      m.clearHighScore();
      expect(m.getHighScore()).toBe(0);
    });

    it('does not affect other games', () => {
      new HighScoreManager('a').saveHighScore(10);
      expect(new HighScoreManager('b').getHighScore()).toBe(0);
    });

    it('returns 0 when localStorage throws', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });
      expect(new HighScoreManager('g').getHighScore()).toBe(0);
    });

    it('returns false when saving throws', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      expect(new HighScoreManager('g').saveHighScore(5)).toBe(false);
    });

    it('warns in development when load/save fail', () => {
      process.env.NODE_ENV = 'development';
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const m = new HighScoreManager('g');
      expect(m.saveHighScore(5)).toBe(true);
      expect(log).toHaveBeenCalled();
      m.clearHighScore();

      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      m.saveHighScore(10);
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });
      m.getHighScore();
      expect(warn).toHaveBeenCalledTimes(2);
    });

    it('clearHighScore swallows storage errors with a warning', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('nope');
      });
      expect(() => new HighScoreManager('g').clearHighScore()).not.toThrow();
      expect(warn).toHaveBeenCalledWith('Failed to clear high score:', expect.any(Error));
    });
  });

  describe('leaderboard', () => {
    it('returns an empty list when nothing is saved', () => {
      expect(new HighScoreManager('g').getLeaderboard()).toEqual([]);
    });

    it('adds entries sorted by score descending with a default name', () => {
      const m = new HighScoreManager('g');
      m.addLeaderboardEntry(50, 'Ann');
      m.addLeaderboardEntry(150);
      m.addLeaderboardEntry(100, 'Cy');
      const board = m.getLeaderboard();
      expect(board.map((e) => e.score)).toEqual([150, 100, 50]);
      expect(board[0].name).toBe('Player');
      expect(() => new Date(board[0].date).toISOString()).not.toThrow();
    });

    it('limits the number of returned entries', () => {
      const m = new HighScoreManager('g');
      for (let i = 0; i < 15; i++) m.addLeaderboardEntry(i);
      expect(m.getLeaderboard()).toHaveLength(10);
      expect(m.getLeaderboard(3).map((e) => e.score)).toEqual([14, 13, 12]);
    });

    it('returns an empty list for corrupt JSON', () => {
      localStorage.setItem('g_leaderboard', '{not json');
      expect(new HighScoreManager('g').getLeaderboard()).toEqual([]);
    });

    it('returns false when saving an entry throws', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      expect(new HighScoreManager('g').addLeaderboardEntry(1)).toBe(false);
    });

    it('logs/warns in development for leaderboard operations', () => {
      process.env.NODE_ENV = 'development';
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const log = jest.spyOn(console, 'log').mockImplementation(() => {});
      const m = new HighScoreManager('g');
      m.addLeaderboardEntry(1, 'x');
      m.clearLeaderboard();
      expect(log).toHaveBeenCalledTimes(2);

      localStorage.setItem('g_leaderboard', 'bad');
      m.getLeaderboard();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota');
      });
      m.addLeaderboardEntry(2);
      expect(warn).toHaveBeenCalled();
    });

    it('clearLeaderboard removes entries and swallows errors', () => {
      const m = new HighScoreManager('g');
      m.addLeaderboardEntry(1);
      m.clearLeaderboard();
      expect(m.getLeaderboard()).toEqual([]);

      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('nope');
      });
      expect(() => m.clearLeaderboard()).not.toThrow();
      expect(warn).toHaveBeenCalledWith('Failed to clear leaderboard:', expect.any(Error));
    });
  });

  describe('getRank', () => {
    it('is 1 on an empty leaderboard', () => {
      expect(new HighScoreManager('g').getRank(10)).toBe(1);
    });

    it('ranks by the first entry the score beats', () => {
      const m = new HighScoreManager('g');
      [300, 200, 100].forEach((s) => m.addLeaderboardEntry(s));
      expect(m.getRank(400)).toBe(1);
      expect(m.getRank(250)).toBe(2);
      expect(m.getRank(200)).toBe(3); // ties rank below the existing entry
      expect(m.getRank(50)).toBe(4); // below everyone -> after last entry
    });
  });
});
