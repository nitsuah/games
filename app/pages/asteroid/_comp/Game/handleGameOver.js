export const handleGameOver = ({
  targets,
  setGameOver,
  pauseSound,
  playSound,
  hits,
  misses,
  score,
  highScore,
  setHighScore,
  setIsNewHighScore,
  bestAccuracy,
  setBestAccuracy,
}) => {
  if (targets.length > 0 && targets.every((t) => t.isHit)) {
    setGameOver(true);
    document.exitPointerLock();
    pauseSound('bgm');

    const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

    if (score > highScore) {
      setHighScore(score);
      window.localStorage.setItem('asteroidHighScore', score);
      setIsNewHighScore(true);
    }

    if (accuracy > bestAccuracy) {
      setBestAccuracy(accuracy);
      window.localStorage.setItem('asteroidBestAccuracy', accuracy);
    }
  }
};
