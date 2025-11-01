import { WEAPON_TYPES } from '../../lib/asteroid/_comp/config';

export const POWER_UPS = [
  {
    type: 'health',
    duration: 0,
    effect: ({ setHealth, setAmmo, showFlash }) => {
      let collected = false;
      
      // Check if health needs restore
      setHealth((prev) => {
        if (prev < 100) {
          collected = true;
          return Math.min(prev + 25, 100);
        }
        return prev;
      });
      
      // Check if any ammo needs restore
      if (!collected && setAmmo) {
        setAmmo((prev) => {
          const needsAmmo = Object.keys(prev).some((key) => {
            const maxAmmo = WEAPON_TYPES.find((w) => w.key === key)?.maxAmmo || 0;
            return prev[key] < maxAmmo;
          });
          
          if (needsAmmo) {
            collected = true;
            // Restore all ammo to max
            return {
              spread: WEAPON_TYPES.find((w) => w.key === 'spread').maxAmmo,
              laser: WEAPON_TYPES.find((w) => w.key === 'laser').maxAmmo,
              explosive: WEAPON_TYPES.find((w) => w.key === 'explosive').maxAmmo,
            };
          }
          return prev;
        });
      }
      
      // Phase 8: More impactful visual feedback - strong pulsing green flash
      if (collected) {
        // Initial strong flash
        showFlash('green', 250);
        // Pulse effect: fade -> flash -> fade
        setTimeout(() => showFlash('green', 100), 100);
        setTimeout(() => showFlash('green', 200), 200);
        setTimeout(() => showFlash('green', 80), 300);
        setTimeout(() => showFlash('green', 150), 400);
        setTimeout(() => showFlash('green', 50), 500);
        setTimeout(() => showFlash('green', 0), 650);
      }
    },
  },
  {
    type: 'speedBoost',
    duration: 10000,
    effect: ({ setSpeedBoostActive, showFlash }) => {
      setSpeedBoostActive(true);
      showFlash('orange', 100);
      setTimeout(() => {
        setSpeedBoostActive(false);
        showFlash('orange', 0);
      }, 10000);
    },
  },
  {
    type: 'shield',
    duration: 0,
    effect: ({ setShieldActive, showFlash }) => {
      // Stack shield hits - add 3 to existing count
      setShieldActive((prev) => (prev || 0) + 3);
      showFlash('blue', 100);
      console.log('Shield activated - added 3 hit points');
    },
  },
  {
    type: 'invincibility',
    duration: 10000,
    effect: ({ setInvincibilityActive, showFlash }) => {
      setInvincibilityActive(true);
      showFlash('yellow', 100);
      setTimeout(() => {
        setInvincibilityActive(false);
        showFlash('yellow', 0);
      }, 10000);
    },
  },
  {
    type: 'rapidFire',
    duration: 10000,
    effect: ({ setRapidFireActive, showFlash }) => {
      console.log('🔫 RAPID FIRE ACTIVATED!');
      setRapidFireActive(true);
      showFlash('red', 100);
      setTimeout(() => {
        console.log('🔫 Rapid fire ended');
        setRapidFireActive(false);
        showFlash('red', 0);
      }, 10000);
    },
  },
  {
    type: 'slowMotion',
    duration: 10000,
    effect: ({ setSlowMotionActive, setTargets, showFlash }) => {
      setSlowMotionActive(true);
      showFlash('purple', 100);
      // Phase 8 FIX: Store original speed to restore properly after time slow
      setTargets((prevTargets) =>
        prevTargets.map((target) => ({
          ...target,
          originalSpeed: target.originalSpeed ?? target.speed, // Preserve original if already set
          speed: target.speed * 0.5,
        }))
      );
      setTimeout(() => {
        setSlowMotionActive(false);
        showFlash('purple', 0);
        // Restore to original speed, not speed*2 (which breaks if target was split during slow-mo)
        setTargets((prevTargets) =>
          prevTargets.map((target) => ({
            ...target,
            speed: target.originalSpeed ?? target.speed * 2, // Fallback to *2 if originalSpeed missing
            originalSpeed: undefined, // Clear the tracking field
          }))
        );
      }, 10000);
    },
  },
];
