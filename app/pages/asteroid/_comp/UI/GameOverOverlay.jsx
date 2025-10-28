import styles from './GameOverOverlay.module.css';

const GameOverOverlay = ({
  score = 0,
  isNewHighScore = false,
  hits = 0,
  misses = 0,
  bestAccuracy = 0,
  highScore = 0,
  restartGame = () => {},
}) => {
  const finalAccuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0';

  return (
    <div className={styles.gameOverOverlay}>
      <h2>Game Over!</h2>
      <p>
        Final Score: {score} {isNewHighScore && '🏆 New High Score!'}
      </p>
      <p>
        Final Accuracy: {finalAccuracy}%{' '}
        {parseFloat(finalAccuracy) > (bestAccuracy ?? 0) && '🎯 New Best!'}
      </p>
      <p>High Score: {highScore}</p>
      <p>Best Accuracy: {(bestAccuracy ?? 0).toFixed(1)}%</p>
      <button className={styles.restartButton} onClick={restartGame}>
        Play Again
      </button>
    </div>
  );
};

export default GameOverOverlay;
