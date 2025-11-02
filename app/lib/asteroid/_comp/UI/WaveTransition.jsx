import styles from './WaveTransition.module.css';

const WaveTransition = ({ wave = 1, score = 0, highScore = 0, isNewHighScore = false, accuracy = 0 }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>WAVE {wave} COMPLETE!</h1>
          <div className={styles.scanline}></div>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.label}>Score:</span>
            <span className={styles.value}>{score}</span>
          </div>
          
          <div className={styles.statRow}>
            <span className={styles.label}>Accuracy:</span>
            <span className={styles.value}>{(accuracy ?? 0).toFixed(1)}%</span>
          </div>
          
          {isNewHighScore && (
            <div className={`${styles.statRow} ${styles.highScore}`}>
              <span className={styles.label}>🏆 NEW HIGH SCORE!</span>
              <span className={styles.value}>{highScore}</span>
            </div>
          )}
          
          {!isNewHighScore && (
            <div className={styles.statRow}>
              <span className={styles.label}>High Score:</span>
              <span className={styles.value}>{highScore}</span>
            </div>
          )}
        </div>
        
        <p className={styles.message}>Prepare for Wave {wave + 1}...</p>
      </div>
    </div>
  );
};

export default WaveTransition;
