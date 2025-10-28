import styles from './WeaponDisplay.module.css';
import { WEAPON_TYPES } from '@/lib/asteroid/_comp/config';

const WeaponDisplay = ({ weapon = '', ammo = {}, cooldowns = {} }) => {
  const weaponData = WEAPON_TYPES.find((w) => w.key === weapon) || { name: 'Unknown', maxAmmo: 0 };
  const ammoCount = (weapon && ammo && typeof ammo === 'object') ? (ammo[weapon] ?? 0) : 0;
  const cooldownVal = (cooldowns && typeof cooldowns === 'object' && typeof cooldowns[weapon] === 'number') ? cooldowns[weapon] : 0;

  return (
    <div className={styles.weaponDisplay}>
      Weapon: <b>{weaponData.name}</b>
      <br />
      Ammo: {ammoCount} / {weaponData.maxAmmo}
      <br />
      Cooldown: {cooldownVal > 0 ? `${cooldownVal.toFixed(2)}s` : 'Ready'}
    </div>
  );
};

export default WeaponDisplay;
