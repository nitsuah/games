import { useEffect, useState, useRef } from 'react';
import styles from './AmmoIndicator.module.css';

const AmmoIndicator = ({ weapon = 'spread', ammo = {}, maxAmmo = { spread: 30, laser: 10, explosive: 10 } }) => {
  const currentAmmo = (ammo && typeof weapon === 'string') ? ammo[weapon] || 0 : 0;
  const maxForWeapon = (typeof weapon === 'string' && maxAmmo) ? maxAmmo[weapon] || 30 : 30;
  const percentage = maxForWeapon > 0 ? (currentAmmo / maxForWeapon) * 100 : 0;
  const [ammoFlash, setAmmoFlash] = useState(false);
  const prevAmmoRef = useRef(currentAmmo);

  // Flash when ammo changes (firing or reloading)
  useEffect(() => {
    if (currentAmmo !== prevAmmoRef.current) {
      setAmmoFlash(true);
      setTimeout(() => setAmmoFlash(false), 200);
    }
    prevAmmoRef.current = currentAmmo;
  }, [currentAmmo]);

  const getAmmoColor = () => {
    if (percentage > 20) return '#3366ff'; // Blue theme
    return '#ff0000'; // Red when low
  };

  const isLow = percentage <= 20;

  return (
    <div className={`${styles.container} ${ammoFlash ? styles.flash : ''}`}>
      <div className={styles.weaponName}>{(weapon || '').toString().toUpperCase()}</div>
      {currentAmmo === 0 ? (
        <div className={styles.emptyBar}>
          <div className={styles.emptyText}>OUT OF AMMO!</div>
        </div>
      ) : (
        <>
          <div className={styles.ammoBar}>
            <div
              className={`${styles.fill} ${isLow ? styles.critical : ''}`}
              style={{
                transform: `scaleX(${percentage / 100})`,
                backgroundColor: getAmmoColor(),
              }}
            />
          </div>
          <div className={styles.ammoText}>
            {currentAmmo} / {maxForWeapon}
          </div>
          {isLow && currentAmmo > 0 && <div className={styles.warning}>LOW AMMO!</div>}
        </>
      )}
    </div>
  );
};

export default AmmoIndicator;
