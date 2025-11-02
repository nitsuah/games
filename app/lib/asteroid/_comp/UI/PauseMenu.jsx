import { useState } from 'react';
import styles from './PauseMenu.module.css';
import { useAudio } from '@/contexts/AudioContext';

const PauseMenu = ({ onResume, onQuit, onRestart, score }) => {
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useAudio();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const handleQuitClick = () => {
    if (showQuitConfirm) {
      onQuit();
    } else {
      setShowQuitConfirm(true);
    }
  };

  const handleRestartClick = () => {
    if (showRestartConfirm) {
      onRestart();
    } else {
      setShowRestartConfirm(true);
    }
  };

  const handleCancelQuit = () => {
    setShowQuitConfirm(false);
  };

  const handleCancelRestart = () => {
    setShowRestartConfirm(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.menu}>
        {/* Phase 8: Arcade-style header */}
        <div className={styles.header}>
          <h1 className={styles.title}>PAUSED</h1>
          <div className={styles.scanline}></div>
        </div>

        {/* Score display with arcade styling */}
        <div className={styles.scoreDisplay}>
          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>CURRENT SCORE</div>
            <div className={styles.scoreValue}>{score.toLocaleString()}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.buttons}>
          <button className={`${styles.button} ${styles.resumeButton}`} onClick={onResume}>
            <span className={styles.buttonIcon}>▶️</span>
            <span className={styles.buttonText}>
              <span>RESUME</span>
              <span className={styles.buttonHint}>Press ESC</span>
            </span>
          </button>

          {/* Audio controls with arcade toggle style */}
          <div className={styles.audioSection}>
            <div className={styles.sectionLabel}>AUDIO CONTROLS</div>
            <div className={styles.toggleGroup}>
              <button 
                className={`${styles.toggleButton} ${soundEnabled ? styles.active : ''}`}
                onClick={toggleSound}
              >
                <span className={styles.toggleIcon}>{soundEnabled ? '🔊' : '🔇'}</span>
                <span className={styles.toggleLabel}>
                  SOUND<br/>
                  <span className={styles.toggleStatus}>{soundEnabled ? 'ON' : 'OFF'}</span>
                </span>
              </button>

              <button 
                className={`${styles.toggleButton} ${musicEnabled ? styles.active : ''}`}
                onClick={toggleMusic}
              >
                <span className={styles.toggleIcon}>{musicEnabled ? '🎵' : '🔇'}</span>
                <span className={styles.toggleLabel}>
                  MUSIC<br/>
                  <span className={styles.toggleStatus}>{musicEnabled ? 'ON' : 'OFF'}</span>
                </span>
              </button>
            </div>
          </div>

          {/* Restart button */}
          {onRestart && !showRestartConfirm && (
            <button 
              className={`${styles.button} ${styles.restartButton}`} 
              onClick={handleRestartClick}
            >
              <span className={styles.buttonIcon}>🔄</span>
              <span className={styles.buttonText}>
                <span>RESTART</span>
                <span className={styles.buttonHint}>Start from Wave 1</span>
              </span>
            </button>
          )}

          {showRestartConfirm && (
            <div className={styles.confirmBox} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div className={styles.confirmTitle}>⚠️ CONFIRM RESTART?</div>
              <div className={styles.confirmButtons}>
                <button className={`${styles.button} ${styles.confirmYes}`} onClick={handleRestartClick}>
                  YES
                </button>
                <button className={`${styles.button} ${styles.confirmNo}`} onClick={handleCancelRestart}>
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* Quit button */}
          {!showQuitConfirm && (
            <button 
              className={`${styles.button} ${styles.quitButton}`} 
              onClick={handleQuitClick}
            >
              <span className={styles.buttonIcon}>🏠</span>
              <span className={styles.buttonText}>
                <span>QUIT</span>
                <span className={styles.buttonHint}>Return to Main Menu</span>
              </span>
            </button>
          )}

          {showQuitConfirm && (
            <div className={styles.confirmBox} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div className={styles.confirmTitle}>⚠️ CONFIRM QUIT?</div>
              <div className={styles.confirmText}>Progress will be lost!</div>
              <div className={styles.confirmButtons}>
                <button className={`${styles.button} ${styles.confirmYes}`} onClick={handleQuitClick}>
                  YES
                </button>
                <button className={`${styles.button} ${styles.confirmNo}`} onClick={handleCancelQuit}>
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className={styles.footer}>
          <kbd>ESC</kbd> Resume • <kbd>R</kbd> Refill Ammo • <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> Change Weapon
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
