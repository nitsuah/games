/**
 * StatsTracker - Game statistics tracking
 * Tracks accuracy, time played, and other gameplay metrics
 */

class StatsTracker {
  constructor(gameName = 'default') {
    this.gameName = gameName;
    this.statsKey = `${gameName}_stats`;
    
    // Session stats (reset each game)
    this.hits = 0;
    this.misses = 0;
    this.kills = 0;
    this.deaths = 0;
    this.timeStarted = null;
    this.timeEnded = null;
  }

  /**
   * Start a new game session
   */
  startSession() {
    this.hits = 0;
    this.misses = 0;
    this.kills = 0;
    this.deaths = 0;
    this.timeStarted = Date.now();
    this.timeEnded = null;
  }

  /**
   * End the current game session
   */
  endSession() {
    this.timeEnded = Date.now();
  }

  /**
   * Record a hit
   */
  recordHit() {
    this.hits++;
  }

  /**
   * Record a miss
   */
  recordMiss() {
    this.misses++;
  }

  /**
   * Record a kill
   */
  recordKill() {
    this.kills++;
  }

  /**
   * Record a death
   */
  recordDeath() {
    this.deaths++;
  }

  /**
   * Calculate current accuracy percentage
   * @returns {number} - Accuracy (0-100)
   */
  getAccuracy() {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  /**
   * Get total shots fired
   * @returns {number}
   */
  getTotalShots() {
    return this.hits + this.misses;
  }

  /**
   * Get session duration in milliseconds
   * @returns {number}
   */
  getSessionDuration() {
    if (!this.timeStarted) return 0;
    const endTime = this.timeEnded || Date.now();
    return endTime - this.timeStarted;
  }

  /**
   * Get session duration formatted as string (MM:SS)
   * @returns {string}
   */
  getFormattedDuration() {
    const duration = this.getSessionDuration();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  /**
   * Get current session stats
   * @returns {Object}
   */
  getSessionStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      kills: this.kills,
      deaths: this.deaths,
      accuracy: this.getAccuracy(),
      duration: this.getSessionDuration(),
      durationFormatted: this.getFormattedDuration(),
    };
  }

  /**
   * Get saved best accuracy from localStorage
   * @returns {number}
   */
  getBestAccuracy() {
    try {
      if (typeof window === 'undefined') return 0;
      const saved = localStorage.getItem(`${this.statsKey}_bestAccuracy`);
      return saved ? parseFloat(saved) : 0;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load best accuracy:', error);
      }
      return 0;
    }
  }

  /**
   * Save best accuracy if current exceeds saved
   * @param {number} accuracy - Accuracy to potentially save
   * @returns {boolean} - True if new best was set
   */
  saveBestAccuracy(accuracy) {
    const currentBest = this.getBestAccuracy();
    
    if (accuracy > currentBest) {
      try {
        if (typeof window === 'undefined') return false;
        localStorage.setItem(`${this.statsKey}_bestAccuracy`, String(accuracy));
        console.log(`✅ New best accuracy: ${accuracy.toFixed(1)}% (previous: ${currentBest.toFixed(1)}%)`);
        return true;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to save best accuracy:', error);
        }
        return false;
      }
    }
    
    return false;
  }

  /**
   * Save session accuracy if it's a new best
   * @returns {boolean}
   */
  saveSessionAccuracy() {
    const accuracy = this.getAccuracy();
    return this.saveBestAccuracy(accuracy);
  }

  /**
   * Get all-time stats from localStorage
   * @returns {Object}
   */
  getAllTimeStats() {
    try {
      if (typeof window === 'undefined') return this.getDefaultAllTimeStats();
      const saved = localStorage.getItem(this.statsKey);
      return saved ? JSON.parse(saved) : this.getDefaultAllTimeStats();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load all-time stats:', error);
      }
      return this.getDefaultAllTimeStats();
    }
  }

  /**
   * Get default all-time stats structure
   * @private
   */
  getDefaultAllTimeStats() {
    return {
      totalGames: 0,
      totalHits: 0,
      totalMisses: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalPlayTime: 0,
    };
  }

  /**
   * Save current session stats to all-time stats
   */
  saveToAllTimeStats() {
    try {
      if (typeof window === 'undefined') return;

      const allTime = this.getAllTimeStats();
      allTime.totalGames++;
      allTime.totalHits += this.hits;
      allTime.totalMisses += this.misses;
      allTime.totalKills += this.kills;
      allTime.totalDeaths += this.deaths;
      allTime.totalPlayTime += this.getSessionDuration();

      localStorage.setItem(this.statsKey, JSON.stringify(allTime));
      console.log('✅ All-time stats updated');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save all-time stats:', error);
      }
    }
  }

  /**
   * Clear all stats
   */
  clearAllStats() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.statsKey);
      localStorage.removeItem(`${this.statsKey}_bestAccuracy`);
      this.startSession(); // Reset session stats
      console.log('✅ All stats cleared');
    } catch (error) {
      console.warn('Failed to clear stats:', error);
    }
  }

  /**
   * Reset session stats
   */
  reset() {
    this.startSession();
  }
}

export default StatsTracker;
