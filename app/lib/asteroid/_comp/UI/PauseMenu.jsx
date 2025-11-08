import { useState } from 'react';
import styles from './PauseMenu.module.css';
import { useAudio } from '@/contexts/AudioContext';
import ArcadeMenu from '@/lib/shared/ui/ArcadeMenu';
import ArcadeButton, { VARIANTS } from '@/lib/shared/ui/ArcadeButton';

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
    <ArcadeMenu title="PAUSED">

        {/* Score display with arcade styling */}
        <div className={styles.scoreDisplay}>
          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>CURRENT SCORE</div>
            <div className={styles.scoreValue}>{score.toLocaleString()}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.buttons}>
          <ArcadeButton 
            variant={VARIANTS.PRIMARY} 
            icon="▶️" 
            hint="Press ESC"
            onClick={onResume}
          >
            RESUME
          </ArcadeButton>

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
            <ArcadeButton
              variant={VARIANTS.WARNING}
              icon="🔄"
              hint="Start from Wave 1"
              onClick={handleRestartClick}
            >
              RESTART
            </ArcadeButton>
          )}

          {showRestartConfirm && (
            <div className={styles.confirmBox} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div className={styles.confirmTitle}>⚠️ CONFIRM RESTART?</div>
              <div className={styles.confirmButtons}>
                <ArcadeButton variant={VARIANTS.WARNING} onClick={handleRestartClick}>
                  YES
                </ArcadeButton>
                <ArcadeButton variant={VARIANTS.SECONDARY} onClick={handleCancelRestart}>
                  CANCEL
                </ArcadeButton>
              </div>
            </div>
          )}

          {/* Quit button */}
          {!showQuitConfirm && (
            <ArcadeButton
              variant={VARIANTS.DANGER}
              icon="🏠"
              hint="Return to Main Menu"
              onClick={handleQuitClick}
            >
              QUIT
            </ArcadeButton>
          )}

          {showQuitConfirm && (
            <div className={styles.confirmBox} onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div className={styles.confirmTitle}>⚠️ CONFIRM QUIT?</div>
              <div className={styles.confirmText}>Progress will be lost!</div>
              <div className={styles.confirmButtons}>
                <ArcadeButton variant={VARIANTS.DANGER} onClick={handleQuitClick}>
                  YES
                </ArcadeButton>
                <ArcadeButton variant={VARIANTS.SECONDARY} onClick={handleCancelQuit}>
                  CANCEL
                </ArcadeButton>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className={styles.footer}>
          <kbd>ESC</kbd> Resume • <kbd>R</kbd> Refill Ammo • <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> Change Weapon
        </div>
    </ArcadeMenu>
  );
};

export default PauseMenu;
