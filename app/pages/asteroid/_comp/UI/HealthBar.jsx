import React from 'react';
import styles from './HealthBar.module.css';

const HealthBar = ({ health, maxHealth = 100 }) => {
  const percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  // Determine bar color based on health level
  const getBarColor = () => {
    if (percentage > 60) return '#00ff00'; // Green
    if (percentage > 30) return '#ffaa00'; // Orange
    return '#ff0000'; // Red
  };

  // Determine if health is critical
  const isCritical = percentage <= 30;

  return (
    <div className={styles.container}>
      <div className={styles.label}>Health</div>
      <div className={styles.barContainer}>
        <div 
          className={`${styles.bar} ${isCritical ? styles.critical : ''}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getBarColor()
          }}
        />
        <div className={styles.text}>{Math.round(health)} / {maxHealth}</div>
      </div>
    </div>
  );
};

export default HealthBar;
