import styles from './WaveIndicator.module.css';

/**
 * WaveIndicator - Displays current wave and transition messages
 * @param {number} wave - Current wave number
 * @param {boolean} showTransition - Whether to show wave transition overlay
 * @param {number} highestWave - Highest wave reached (for stats)
 */
const WaveIndicator = ({ wave, showTransition, highestWave }) => {
  return (
    <>
      {/* Wave counter (always visible) */}
      <div className={styles.waveCounter}>
        <div className={styles.waveNumber}>Wave {wave}</div>
        {highestWave > 1 && (
          <div className={styles.highestWave}>Best: {highestWave}</div>
        )}
      </div>

      {/* Wave transition overlay */}
      {showTransition && (
        <div className={styles.waveTransition}>
          <div className={styles.waveTransitionContent}>
            <h1 className={styles.waveTitle}>Wave {wave}</h1>
            <p className={styles.waveSubtitle}>Get Ready!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default WaveIndicator;
