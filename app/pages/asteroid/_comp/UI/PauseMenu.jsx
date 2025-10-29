import { useState } from 'react';
import styles from './PauseMenu.module.css';

const PauseMenu = ({ onResume, onQuit, score }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    // TODO: Connect to actual sound system
    console.log('Sound toggled:', !soundEnabled);
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
    // TODO: Connect to actual music system
    console.log('Music toggled:', !musicEnabled);
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

          <button 
            className={`${styles.button} ${styles.quitButton}`} 
            onClick={onQuit}
          >
            Quit to Main Menu
            <span className={styles.hintSmall}>Game Over with current score</span>
          </button>
        </div>

        <p className={styles.help}>
          Press <kbd>ESC</kbd> to resume
        </p>
      </div>
    </div>
  );
};

export default PauseMenu;
