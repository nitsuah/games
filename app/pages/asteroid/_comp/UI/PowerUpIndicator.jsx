import React from 'react';
import styles from './PowerUpIndicator.module.css';

const PowerUpIndicator = ({
  shieldActive,
  rapidFireActive,
  slowMotionActive,
  invincibilityActive,
  speedBoostActive,
}) => {
  const activePowerUps = [];

  if (shieldActive && shieldActive !== 0 && shieldActive !== false) {
    const shieldHits = typeof shieldActive === 'number' ? shieldActive : '∞';
    activePowerUps.push({ name: `Shield (${shieldHits} hits)`, color: '#00f' });
  }
  if (rapidFireActive) activePowerUps.push({ name: 'Rapid Fire', color: '#f00' });
  if (slowMotionActive) activePowerUps.push({ name: 'Slow Motion', color: '#a0a' });
  if (invincibilityActive) activePowerUps.push({ name: 'Invincibility', color: '#ff0' });
  if (speedBoostActive) activePowerUps.push({ name: 'Speed Boost', color: '#fa0' });

  if (activePowerUps.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.title}>Active Power-Ups:</div>
      {activePowerUps.map((powerUp) => (
        <div
          key={powerUp.name}
          className={styles.powerUp}
          style={{ borderColor: powerUp.color, color: powerUp.color }}
        >
          {powerUp.name}
        </div>
      ))}
    </div>
  );
};

export default PowerUpIndicator;
