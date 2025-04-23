import React from 'react';
import styles from './GameOverOverlay.module.css';

const GameOverOverlay = ({
  score,
  isNewHighScore,
  hits,
  misses,
  bestAccuracy,
  highScore,
  restartGame,
}) => {
  const finalAccuracy =
    hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0';

  return (
    <div className={styles.gameOverOverlay}>
      <h2>Game Over!</h2>
      <p>
        Final Score: {score} {isNewHighScore && '🏆 New High Score!'}
      </p>
      <p>
        Final Accuracy: {finalAccuracy}%{' '}
        {parseFloat(finalAccuracy) > bestAccuracy && '🎯 New Best!'}
      </p>
      <p>High Score: {highScore}</p>
      <p>Best Accuracy: {bestAccuracy.toFixed(1)}%</p>
      <button className={styles.restartButton} onClick={restartGame}>
        Play Again
      </button>
    </div>
  );
};

export default GameOverOverlay;
