export const handleGameOver = ({
  targets = [],
  setGameOver,
  pauseSound = () => {},
  playSound = () => {},
  hits = 0,
  misses = 0,
  score = 0,
  highScore = 0,
  setHighScore = () => {},
  setIsNewHighScore = () => {},
  bestAccuracy = 0,
  setBestAccuracy = () => {},
}) => {
  if (!Array.isArray(targets) || targets.length === 0) return;

  // If all targets are hit, trigger game over flow
  if (targets.every((t) => t.isHit)) {
    try {
      setGameOver(true);
      // Ensure pointer lock is released
      if (typeof document !== 'undefined' && document.exitPointerLock) {
        try {
          document.exitPointerLock();
        } catch (err) {
          console.warn('exitPointerLock failed', err);
        }
      }
      pauseSound('bgm');
      playSound('gameOver');

      const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

      if (score > highScore) {
        setHighScore(score);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('asteroidHighScore', String(score));
          }
        } catch (err) {
          console.warn('saving high score failed', err);
        }
        setIsNewHighScore(true);
      }

      if (accuracy > bestAccuracy) {
        setBestAccuracy(accuracy);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('asteroidBestAccuracy', String(accuracy));
          }
        } catch (err) {
          console.warn('saving best accuracy failed', err);
        }
      }

      console.log('Game over triggered by all targets being hit.');
    } catch (e) {
      console.warn('handleGameOver failed', e);
    }
  }
};

export default handleGameOver;
