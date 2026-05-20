import React from 'react';
import styles from './OnboardingOverlay.module.css';

const OnboardingOverlay = ({ onStart }) => (
  <div className={styles.overlay}>
    <div className={styles.content}>
      <h2>Welcome to Asteroid!</h2>
      <p>Survive waves, collect power-ups, and rack up your high score.<br />
      Use <b>WASD</b> to move, <b>Mouse</b> to aim, <b>Left Click</b> to shoot.<br />
      Press <b>1/2/3</b> to switch weapons.<br />
      Good luck, pilot!</p>
      <button className={styles.startButton} onClick={onStart}>Start Game</button>
    </div>
  </div>
);

export default OnboardingOverlay;
