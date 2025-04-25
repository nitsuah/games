import React from 'react';
import styles from './WeaponDisplay.module.css';
import { WEAPON_TYPES } from '../config';

const WeaponDisplay = ({ weapon, ammo, cooldowns }) => {
  const weaponData = WEAPON_TYPES.find((w) => w.key === weapon);

  return (
    <div className={styles.weaponDisplay}>
      Weapon: <b>{weaponData.name}</b>
      <br />
      Ammo: {ammo[weapon]} / {weaponData.maxAmmo}
      <br />
      Cooldown: {cooldowns[weapon] > 0 ? `${cooldowns[weapon].toFixed(2)}s` : 'Ready'}
    </div>
  );
};

export default WeaponDisplay;
