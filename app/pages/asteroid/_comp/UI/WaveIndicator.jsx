import { useState, useEffect } from 'react';
import styles from './WaveIndicator.module.css';

/**
 * WaveIndicator - Displays current wave and transition messages with countdown
 * @param {number} wave - Current wave number
 * @param {boolean} showTransition - Whether to show wave transition overlay
 * @param {number} highestWave - Highest wave reached (for stats)
 */
const WaveIndicator = ({ wave, showTransition, highestWave }) => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (showTransition) {
      // Start at 3 and count down
      setCountdown(3);
      
      const timer1 = setTimeout(() => setCountdown(2), 666);
      const timer2 = setTimeout(() => setCountdown(1), 1333);
      const timer3 = setTimeout(() => setCountdown(null), 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setCountdown(null);
    }
  }, [showTransition]);

  return (
    <>
      {/* Wave counter (always visible) */}
      <div className={styles.waveCounter}>
        <div className={styles.waveNumber}>Wave {wave}</div>
        {highestWave > 1 && (
          <div className={styles.highestWave}>Best: {highestWave}</div>
        )}
      </div>

      {/* Wave transition overlay with countdown */}
      {showTransition && (
        <div className={styles.waveTransition}>
          <div className={styles.waveTransitionContent}>
            <h1 className={styles.waveTitle}>Wave {wave + 1}</h1>
            {countdown ? (
              <p className={styles.countdown}>{countdown}</p>
            ) : (
              <p className={styles.waveSubtitle}>GO!</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WaveIndicator;
