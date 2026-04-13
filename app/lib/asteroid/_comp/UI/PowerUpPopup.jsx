import React from 'react';
import styles from './PowerUpPopup.module.css';

const POWER_UP_LABELS = {
  health: 'Health Restored!',
  speedBoost: 'Speed Boost!',
  shield: 'Shield Up!',
  invincibility: 'Invincible!',
  rapidFire: 'Rapid Fire!',
  slowMotion: 'Slow Motion!'
};

const PowerUpPopup = ({ type, visible }) => {
  if (!visible || !type) return null;
  return (
    <div className={styles.popup}>
      {POWER_UP_LABELS[type] || 'Power Up!'}
    </div>
  );
};

export default PowerUpPopup;
