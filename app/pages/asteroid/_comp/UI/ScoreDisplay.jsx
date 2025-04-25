import React, { useEffect, useState } from 'react';
import styles from './ScoreDisplay.module.css';

const ScoreDisplay = ({ score }) => {
  const [scoreUpdated, setScoreUpdated] = useState(false);

  useEffect(() => {
    setScoreUpdated(true);
    const timer = setTimeout(() => setScoreUpdated(false), 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className={styles.scoreContainer}>
      <div className={`${styles.scoreText} ${scoreUpdated ? styles.scoreUpdated : ''}`}>
        Score: {score}
      </div>
    </div>
  );
};

export default ScoreDisplay;