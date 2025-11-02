import { WEAPON_TYPES } from '../config';

export const handleKeyDown = (e, setWeapon, setAmmo, setPaused) => {
  if (e.code === 'Escape') {
    setPaused((prev) => !prev);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    return;
  }
  if (e.code === 'Digit1') setWeapon('spread');
  if (e.code === 'Digit2') setWeapon('laser');
  if (e.code === 'Digit3') setWeapon('explosive');
  if (e.code === 'Digit4') setWeapon('aa');
  if (e.code === 'KeyR') {
    // Replenish all ammo to max
    setAmmo({
      spread: WEAPON_TYPES.find((w) => w.key === 'spread').maxAmmo,
      laser: WEAPON_TYPES.find((w) => w.key === 'laser').maxAmmo,
      explosive: WEAPON_TYPES.find((w) => w.key === 'explosive').maxAmmo,
      aa: WEAPON_TYPES.find((w) => w.key === 'aa').maxAmmo,
    });
  }
};
