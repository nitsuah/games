import { WEAPON_TYPES } from '../config';

export const handleKeyDown = (e, setWeapon, setAmmo) => {
  if (e.code === 'Digit1') setWeapon('spread');
  if (e.code === 'Digit2') setWeapon('laser');
  if (e.code === 'Digit3') setWeapon('explosive');
  if (e.code === 'KeyR') {
    // Replenish all ammo to max
    setAmmo({
      spread: WEAPON_TYPES.find((w) => w.key === 'spread').maxAmmo,
      laser: WEAPON_TYPES.find((w) => w.key === 'laser').maxAmmo,
      explosive: WEAPON_TYPES.find((w) => w.key === 'explosive').maxAmmo,
    });
  }
};
