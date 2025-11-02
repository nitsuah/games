/**
 * ScoreManager - Centralized score calculation and management
 * Handles score tracking, multipliers, combos, and score events
 */

class ScoreManager {
  constructor(gameName = 'default') {
    this.gameName = gameName;
    this.score = 0;
    this.multiplier = 1.0;
    this.combo = 0;
    this.baseValues = {
      hit: 10,
      miss: -2,
      kill: 50,
      wave: 100,
    };
    this.scoreListeners = [];
  }

  /**
   * Initialize or reset the score manager
   * @param {Object} baseValues - Base score values for different actions
   */
  initialize(baseValues = {}) {
    this.score = 0;
    this.multiplier = 1.0;
    this.combo = 0;
    this.baseValues = { ...this.baseValues, ...baseValues };
  }

  /**
   * Add points to the score
   * @param {number} points - Base points to add
   * @param {boolean} applyMultiplier - Whether to apply current multiplier
   * @returns {number} - Actual points added (after multiplier)
   */
  addScore(points, applyMultiplier = true) {
    const actualPoints = applyMultiplier ? Math.floor(points * this.multiplier) : points;
    this.score += actualPoints;
    
    this.notifyListeners('scoreAdded', {
      points: actualPoints,
      basePoints: points,
      multiplier: this.multiplier,
      totalScore: this.score,
    });

    return actualPoints;
  }

  /**
   * Subtract points from the score (e.g., for misses)
   * @param {number} points - Points to subtract
   * @returns {number} - Actual points subtracted
   */
  subtractScore(points) {
    this.score = Math.max(0, this.score - points);
    
    this.notifyListeners('scoreSubtracted', {
      points,
      totalScore: this.score,
    });

    return points;
  }

  /**
   * Record a hit and add score
   * @param {Object} options - Hit options (targetSize, distance, accuracy, etc.)
   * @returns {number} - Points earned
   */
  recordHit(options = {}) {
    const { targetSize = 1, bonus = 0 } = options;
    const points = this.baseValues.hit * targetSize + bonus;
    return this.addScore(points);
  }

  /**
   * Record a miss and subtract score
   * @returns {number} - Points lost
   */
  recordMiss() {
    const points = Math.abs(this.baseValues.miss);
    return this.subtractScore(points);
  }

  /**
   * Record a kill (target destroyed)
   * @param {Object} options - Kill options
   * @returns {number} - Points earned
   */
  recordKill(options = {}) {
    const { targetSize = 1, bonus = 0 } = options;
    const points = this.baseValues.kill * targetSize + bonus;
    return this.addScore(points);
  }

  /**
   * Record wave completion
   * @param {number} waveNumber - Completed wave number
   * @returns {number} - Points earned
   */
  recordWaveComplete(waveNumber) {
    const points = this.baseValues.wave * waveNumber;
    return this.addScore(points, false); // Wave bonus doesn't apply multiplier
  }

  /**
   * Increment combo counter
   * @returns {number} - New combo count
   */
  incrementCombo() {
    this.combo++;
    this.notifyListeners('comboChanged', { combo: this.combo });
    return this.combo;
  }

  /**
   * Reset combo counter
   */
  resetCombo() {
    const oldCombo = this.combo;
    this.combo = 0;
    this.notifyListeners('comboReset', { oldCombo });
  }

  /**
   * Set score multiplier
   * @param {number} multiplier - New multiplier value
   */
  setMultiplier(multiplier) {
    this.multiplier = Math.max(1.0, multiplier);
    this.notifyListeners('multiplierChanged', { multiplier: this.multiplier });
  }

  /**
   * Get current score
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * Get current combo
   * @returns {number}
   */
  getCombo() {
    return this.combo;
  }

  /**
   * Get current multiplier
   * @returns {number}
   */
  getMultiplier() {
    return this.multiplier;
  }

  /**
   * Register a listener for score events
   * @param {Function} callback - Callback function (type, data)
   */
  addListener(callback) {
    this.scoreListeners.push(callback);
  }

  /**
   * Remove a listener
   * @param {Function} callback - Callback to remove
   */
  removeListener(callback) {
    const index = this.scoreListeners.indexOf(callback);
    if (index > -1) {
      this.scoreListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of an event
   * @private
   */
  notifyListeners(type, data) {
    this.scoreListeners.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('Error in score listener:', error);
      }
    });
  }

  /**
   * Reset all score data
   */
  reset() {
    this.score = 0;
    this.multiplier = 1.0;
    this.combo = 0;
    this.notifyListeners('reset', {});
  }
}

export default ScoreManager;
