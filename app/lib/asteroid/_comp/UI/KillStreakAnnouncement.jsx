import { useEffect } from 'react';
import styles from './KillStreakAnnouncement.module.css';

/**
 * Kill streak announcement overlay for milestone combos
 * Shows dramatic text and plays power chord sound
 */
export default function KillStreakAnnouncement({ combo, onComplete }) {
  const getMessage = () => {
    if (combo >= 30) return 'UNSTOPPABLE!';
    if (combo >= 25) return 'LEGENDARY!';
    if (combo >= 20) return 'RAMPAGE!';
    if (combo >= 15) return 'DOMINATING!';
    if (combo >= 10) return 'KILLING SPREE!';
    return null;
  };

  const message = getMessage();

  useEffect(() => {
    if (message) {
      // Play kill streak sound
      import('@/utils/audio/SoundManager').then((module) => {
        module.default.playKillStreak(combo);
      });

      // Auto-dismiss after 2 seconds
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [message, combo, onComplete]);

  if (!message) return null;

  return (
    <div className={styles.container}>
      <div className={styles.announcement}>
        <div className={styles.streak}>{combo}x COMBO</div>
        <div className={styles.message}>{message}</div>
      </div>
    </div>
  );
}
