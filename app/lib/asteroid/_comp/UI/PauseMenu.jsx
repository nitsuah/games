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
        <h1 className={styles.title}>PAUSED</h1>
        
        <div className={styles.scoreDisplay}>
          <span className={styles.scoreLabel}>Current Score:</span>
          <span className={styles.scoreValue}>{score}</span>
        </div>

        <div className={styles.buttons}>
          <button className={styles.button} onClick={onResume}>
            Resume Game
            <span className={styles.hint}>ESC</span>
          </button>

          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleButton} ${soundEnabled ? styles.active : ''}`}
              onClick={toggleSound}
            >
              🔊 Sound: {soundEnabled ? 'ON' : 'OFF'}
            </button>

            <button 
              className={`${styles.toggleButton} ${musicEnabled ? styles.active : ''}`}
              onClick={toggleMusic}
            >
              🎵 Music: {musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {onRestart && (
            <button 
              className={`${styles.button} ${showRestartConfirm ? styles.warningButton : ''}`} 
              onClick={handleRestartClick}
            >
              {showRestartConfirm ? '⚠️ Confirm Restart?' : 'Restart Game'}
              {!showRestartConfirm && <span className={styles.hintSmall}>Start over from Wave 1</span>}
            </button>
          )}

          {showRestartConfirm && (
            <button className={styles.button} onClick={handleCancelRestart}>
              Cancel
            </button>
          )}

          <button 
            className={`${styles.button} ${styles.quitButton} ${showQuitConfirm ? styles.warningButton : ''}`} 
            onClick={handleQuitClick}
          >
            {showQuitConfirm ? '⚠️ Confirm Quit?' : 'Quit to Main Menu'}
            {!showQuitConfirm && <span className={styles.hintSmall}>Game Over with current score</span>}
          </button>

          {showQuitConfirm && (
            <button className={styles.button} onClick={handleCancelQuit}>
              Cancel
            </button>
          )}
        </div>

        <p className={styles.help}>
          Press <kbd>ESC</kbd> to resume
        </p>
      </div>
    </div>
  );
};

export default PauseMenu;
