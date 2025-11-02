/**
 * HighScoreManager - Persistent high score and leaderboard management
 * Handles localStorage persistence and high score tracking
 */

class HighScoreManager {
  constructor(gameName = 'default') {
    this.gameName = gameName;
    this.storageKey = `${gameName}_highScore`;
    this.leaderboardKey = `${gameName}_leaderboard`;
  }

  /**
   * Get the current high score from localStorage
   * @returns {number} - High score or 0 if not found
   */
  getHighScore() {
    try {
      if (typeof window === 'undefined') return 0;
      const saved = localStorage.getItem(this.storageKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load high score:', error);
      }
      return 0;
    }
  }

  /**
   * Save a new high score if it exceeds the current one
   * @param {number} score - Score to potentially save
   * @returns {boolean} - True if new high score was set
   */
  saveHighScore(score) {
    const currentHigh = this.getHighScore();
    
    if (score > currentHigh) {
      try {
        if (typeof window === 'undefined') return false;
        localStorage.setItem(this.storageKey, String(score));
        console.log(`✅ New high score: ${score} (previous: ${currentHigh})`);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to save high score:', error);
        }
        return false;
      }
    }
    
    return false;
  }

  /**
   * Check if a score is a new high score (without saving)
   * @param {number} score - Score to check
   * @returns {boolean}
   */
  isNewHighScore(score) {
    return score > this.getHighScore();
  }

  /**
   * Clear the high score
   */
  clearHighScore() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.storageKey);
      console.log('✅ High score cleared');
    } catch (error) {
      console.warn('Failed to clear high score:', error);
    }
  }

  /**
   * Get leaderboard entries
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} - Array of {score, date, name} objects
   */
  getLeaderboard(limit = 10) {
    try {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem(this.leaderboardKey);
      if (!saved) return [];

      const leaderboard = JSON.parse(saved);
      return leaderboard.slice(0, limit);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load leaderboard:', error);
      }
      return [];
    }
  }

  /**
   * Add an entry to the leaderboard
   * @param {number} score - Score achieved
   * @param {string} name - Player name (optional)
   * @returns {boolean} - True if entry was added
   */
  addLeaderboardEntry(score, name = 'Player') {
    try {
      if (typeof window === 'undefined') return false;

      const leaderboard = this.getLeaderboard(100); // Keep top 100
      const entry = {
        score,
        name,
        date: new Date().toISOString(),
      };

      leaderboard.push(entry);
      leaderboard.sort((a, b) => b.score - a.score); // Sort descending

      localStorage.setItem(this.leaderboardKey, JSON.stringify(leaderboard));
      console.log(`✅ Leaderboard entry added: ${score} by ${name}`);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save leaderboard entry:', error);
      }
      return false;
    }
  }

  /**
   * Clear the leaderboard
   */
  clearLeaderboard() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.leaderboardKey);
      console.log('✅ Leaderboard cleared');
    } catch (error) {
      console.warn('Failed to clear leaderboard:', error);
    }
  }

  /**
   * Get player's rank for a given score
   * @param {number} score - Score to check
   * @returns {number} - Rank (1-indexed), or -1 if not in top rankings
   */
  getRank(score) {
    const leaderboard = this.getLeaderboard(100);
    const rank = leaderboard.findIndex(entry => score > entry.score);
    return rank === -1 ? leaderboard.length + 1 : rank + 1;
  }
}

export default HighScoreManager;
