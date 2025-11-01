/**
 * Save game statistics to localStorage
 * Handles high score and best accuracy tracking
 */

/**
 * Save high score if current score exceeds saved high score
 * @param {number} score - Current game score
 * @param {number} currentHighScore - Previously saved high score
 * @param {Function} setHighScore - State setter for high score
 * @param {Function} setIsNewHighScore - State setter for new high score flag
 * @returns {boolean} - True if new high score was set
 */
export const saveHighScore = (score, currentHighScore, setHighScore, setIsNewHighScore) => {
  if (score > currentHighScore) {
    setHighScore(score);
    setIsNewHighScore(true);
    try {
      localStorage.setItem('asteroidHighScore', String(score));
      return true;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save high score:', err);
      }
      return false;
    }
  }
  return false;
};

/**
 * Save best accuracy if current accuracy exceeds saved best
 * @param {number} accuracy - Current game accuracy percentage
 * @param {number} currentBestAccuracy - Previously saved best accuracy
 * @param {Function} setBestAccuracy - State setter for best accuracy
 * @returns {boolean} - True if new best accuracy was set
 */
export const saveBestAccuracy = (accuracy, currentBestAccuracy, setBestAccuracy) => {
  if (accuracy > currentBestAccuracy) {
    setBestAccuracy(accuracy);
    try {
      localStorage.setItem('asteroidBestAccuracy', String(accuracy));
      return true;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save best accuracy:', err);
      }
      return false;
    }
  }
  return false;
};

/**
 * Calculate accuracy percentage from hits and misses
 * @param {number} hits - Number of successful hits
 * @param {number} misses - Number of misses
 * @returns {number} - Accuracy percentage (0-100)
 */
export const calculateAccuracy = (hits, misses) => {
  return hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
};

/**
 * Save game stats (high score and accuracy) in one call
 * @param {Object} params - Parameters object
 * @param {number} params.score - Current game score
 * @param {number} params.hits - Number of successful hits
 * @param {number} params.misses - Number of misses
 * @param {number} params.highScore - Previously saved high score
 * @param {number} params.bestAccuracy - Previously saved best accuracy
 * @param {Function} params.setHighScore - State setter for high score
 * @param {Function} params.setBestAccuracy - State setter for best accuracy
 * @param {Function} params.setIsNewHighScore - State setter for new high score flag
 * @returns {Object} - Object with newHighScore and newBestAccuracy booleans
 */
export const saveGameStats = ({
  score,
  hits,
  misses,
  highScore,
  bestAccuracy,
  setHighScore,
  setBestAccuracy,
  setIsNewHighScore,
}) => {
  const accuracy = calculateAccuracy(hits, misses);
  
  const newHighScore = saveHighScore(score, highScore, setHighScore, setIsNewHighScore);
  const newBestAccuracy = saveBestAccuracy(accuracy, bestAccuracy, setBestAccuracy);
  
  return {
    newHighScore,
    newBestAccuracy,
    accuracy,
  };
};
