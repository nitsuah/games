import React from 'react';
import styles from './AmmoIndicator.module.css';

const AmmoIndicator = ({ weapon, ammo, maxAmmo = { spread: 30, laser: 10, explosive: 10 } }) => {
  const currentAmmo = ammo[weapon] || 0;
  const maxForWeapon = maxAmmo[weapon] || 30;
  const percentage = (currentAmmo / maxForWeapon) * 100;

  const getAmmoColor = () => {
    if (percentage > 50) return '#00ff00';
    if (percentage > 20) return '#ffaa00';
    return '#ff0000';
  };

  const isLow = percentage <= 20;

  return (
    <div className={styles.container}>
      <div className={styles.weaponName}>{weapon.toUpperCase()}</div>
      <div className={styles.ammoBar}>
        <div 
          className={`${styles.fill} ${isLow ? styles.critical : ''}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getAmmoColor()
          }}
        />
      </div>
      <div className={styles.ammoText}>
        {currentAmmo} / {maxForWeapon}
      </div>
      {isLow && currentAmmo > 0 && (
        <div className={styles.warning}>LOW AMMO!</div>
      )}
      {currentAmmo === 0 && (
        <div className={styles.empty}>OUT OF AMMO!</div>
      )}
    </div>
  );
};

export default AmmoIndicator;
