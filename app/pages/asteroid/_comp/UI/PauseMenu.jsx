import React from 'react';
import styles from './PauseMenu.module.css';

const PauseMenu = ({ onResume, onRestart }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.menu}>
        <h2 className={styles.title}>Game Paused</h2>
        <div className={styles.instructions}>
          <p>Press <strong>ESC</strong> or click Resume to continue</p>
        </div>
        <div className={styles.buttons}>
          <button className={styles.button} onClick={onResume}>
            Resume Game
          </button>
          <button className={`${styles.button} ${styles.secondary}`} onClick={onRestart}>
            Restart Game
          </button>
        </div>
        <div className={styles.controls}>
          <h3>Controls</h3>
          <div className={styles.controlList}>
            <div><strong>WASD</strong> - Move</div>
            <div><strong>Space</strong> - Thrust Up</div>
            <div><strong>Shift</strong> - Thrust Down</div>
            <div><strong>Mouse</strong> - Aim</div>
            <div><strong>Click</strong> - Shoot</div>
            <div><strong>1/2/3</strong> - Switch Weapons</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;
