import styles from './WeaponDisplay.module.css';
import { WEAPON_TYPES } from '@/lib/asteroid/_comp/config';

const WeaponDisplay = ({ weapon = '', ammo = {}, cooldowns = {} }) => {
  const weaponData = WEAPON_TYPES.find((w) => w.key === weapon) || { name: 'Unknown', maxAmmo: 0, cooldown: 0 };
  const ammoCount = (weapon && ammo && typeof ammo === 'object') ? (ammo[weapon] ?? 0) : 0;
  const cooldownVal = (cooldowns && typeof cooldowns === 'object' && typeof cooldowns[weapon] === 'number') ? cooldowns[weapon] : 0;

  // Calculate cooldown progress percentage (0-100)
  const maxCooldown = weaponData.cooldown || 0;
  const cooldownProgress = maxCooldown > 0 ? Math.max(0, Math.min(100, ((maxCooldown - cooldownVal) / maxCooldown) * 100)) : 100;
  const isReady = cooldownVal <= 0;

  return (
    <div className={styles.weaponDisplay}>
      <div className={styles.weaponName}>
        <span className={styles.label}>Weapon:</span> <b>{weaponData.name}</b>
      </div>
      
      <div className={styles.ammoSection}>
        <span className={styles.label}>Ammo:</span> {ammoCount} / {weaponData.maxAmmo}
      </div>

      {maxCooldown > 0 && (
        <div className={styles.cooldownSection}>
          <div className={styles.cooldownHeader}>
            <span className={styles.label}>Reload</span>
            <span className={styles.cooldownTime}>
              {isReady ? 'Ready' : `${cooldownVal.toFixed(1)}s`}
            </span>
          </div>
          <div className={styles.cooldownBarContainer}>
            <div
              className={`${styles.cooldownBar} ${isReady ? styles.ready : ''}`}
              style={{
                transform: `scaleX(${cooldownProgress / 100})`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeaponDisplay;
