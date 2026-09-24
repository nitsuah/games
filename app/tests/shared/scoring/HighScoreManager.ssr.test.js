/**
 * @jest-environment node
 */
import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';

describe('HighScoreManager during server-side rendering (no window)', () => {
  it('returns safe fallbacks without touching storage', () => {
    expect(typeof window).toBe('undefined');
    const m = new HighScoreManager('g');
    expect(m.getHighScore()).toBe(0);
    expect(m.saveHighScore(10)).toBe(false);
    expect(m.getLeaderboard()).toEqual([]);
    expect(m.addLeaderboardEntry(1)).toBe(false);
    expect(m.getRank(5)).toBe(1);
    expect(() => m.clearHighScore()).not.toThrow();
    expect(() => m.clearLeaderboard()).not.toThrow();
  });
});
