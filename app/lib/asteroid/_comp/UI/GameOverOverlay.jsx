import styles from './GameOverOverlay.module.css';
import { useRouter } from 'next/router';

const GameOverOverlay = ({
  score = 0,
  isNewHighScore = false,
  hits = 0,
  misses = 0,
  bestAccuracy = 0,
  highScore = 0,
  restartGame = () => {},
  wave = 1,
}) => {
  const router = useRouter();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('GameOverOverlay rendered with:', { score, hits, misses, highScore, bestAccuracy });
  }
  const finalAccuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0';

  return (
    <div className={styles.overlay}>
      <div className={styles.gameOverOverlay}>
        {/* Phase 8: Arcade-style header */}
        <div className={styles.header}>
          <h1 className={styles.title}>GAME OVER</h1>
          <div className={styles.scanline}></div>
        </div>

        {/* Phase 8: Stats grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>WAVE REACHED</div>
            <div className={styles.statValue}>{wave}</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statLabel}>FINAL SCORE</div>
            <div className={`${styles.statValue} ${isNewHighScore ? styles.highlight : ''}`}>
              {score.toLocaleString()}
            </div>
            {isNewHighScore && <div className={styles.badge}>🏆 NEW RECORD!</div>}
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>ACCURACY</div>
            <div className={`${styles.statValue} ${parseFloat(finalAccuracy) > (bestAccuracy ?? 0) ? styles.highlight : ''}`}>
              {finalAccuracy}%
            </div>
            {parseFloat(finalAccuracy) > (bestAccuracy ?? 0) && <div className={styles.badge}>🎯 NEW BEST!</div>}
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>HITS / MISSES</div>
            <div className={styles.statValue}>{hits} / {misses}</div>
          </div>
        </div>

        {/* Phase 8: Records section */}
        <div className={styles.records}>
          <div className={styles.recordItem}>
            <span>HIGH SCORE:</span>
            <span className={styles.recordValue}>{highScore.toLocaleString()}</span>
          </div>
          <div className={styles.recordItem}>
            <span>BEST ACCURACY:</span>
            <span className={styles.recordValue}>{(bestAccuracy ?? 0).toFixed(1)}%</span>
          </div>
        </div>

        {/* Phase 8: Arcade-style buttons */}
        <div className={styles.buttons}>
          <button className={styles.restartButton} onClick={restartGame}>
            <span className={styles.buttonIcon}>🔄</span>
            <span>PLAY AGAIN</span>
          </button>
          <button className={styles.quitButton} onClick={() => router.push('/')}>
            <span className={styles.buttonIcon}>🏠</span>
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverOverlay;
