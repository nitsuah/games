import { WEAPON_TYPES } from '../../lib/asteroid/_comp/config';

// Pulse animation patterns for power-up visual feedback
const HEALTH_PULSE_OPACITIES = [250, 100, 200, 80, 150, 50, 0];
const HEALTH_PULSE_DELAYS = [0, 100, 200, 300, 400, 500, 650];

/**
 * Creates a pulse animation effect using multiple flash calls
 * @param {Function} showFlash - Flash function from game context
 * @param {string} color - Flash color
 * @param {number[]} opacities - Array of opacity values (0-255)
 * @param {number[]} delays - Array of delay values in ms (must match opacities length)
 * @returns {Function} Cleanup function to clear all timeouts
 */
function createPulseEffect(showFlash, color, opacities, delays) {
  // Validate array lengths match
  if (opacities.length !== delays.length) {
    console.warn(`createPulseEffect: array length mismatch - opacities: ${opacities.length}, delays: ${delays.length}`);
    return () => {}; // Return no-op cleanup
  }
  
  const timeoutIds = [];
  
  opacities.forEach((opacity, index) => {
    const delay = delays[index];
    const id = setTimeout(() => showFlash(color, opacity), delay);
    timeoutIds.push(id);
  });
  
  // Return cleanup function
  return () => {
    timeoutIds.forEach(id => clearTimeout(id));
  };
}

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
        return createPulseEffect(showFlash, 'green', HEALTH_PULSE_OPACITIES, HEALTH_PULSE_DELAYS);
      }
    },
  },
  {
    type: 'speedBoost',
    duration: 10000,
    effect: ({ setSpeedBoostActive, showFlash }) => {
      setSpeedBoostActive(true);
      showFlash('orange', 100);
      const timeoutId = setTimeout(() => {
        setSpeedBoostActive(false);
        showFlash('orange', 0);
      }, 10000);
      
      return () => clearTimeout(timeoutId);
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
      const timeoutId = setTimeout(() => {
        setInvincibilityActive(false);
        showFlash('yellow', 0);
      }, 10000);
      
      return () => clearTimeout(timeoutId);
    },
  },
  {
    type: 'rapidFire',
    duration: 10000,
    effect: ({ setRapidFireActive, showFlash }) => {
      console.log('🔫 RAPID FIRE ACTIVATED!');
      setRapidFireActive(true);
      showFlash('red', 100);
      const timeoutId = setTimeout(() => {
        console.log('🔫 Rapid fire ended');
        setRapidFireActive(false);
        showFlash('red', 0);
      }, 10000);
      
      return () => clearTimeout(timeoutId);
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
      const timeoutId = setTimeout(() => {
        setSlowMotionActive(false);
        showFlash('purple', 0);
        // Restore to original speed, not speed*2 (which breaks if target was split during slow-mo)
        setTargets((prevTargets) =>
          prevTargets.map((target) => {
            if (!target.originalSpeed) {
              console.warn('Slow-motion: originalSpeed missing for target, using fallback (*2)', target);
            }
            return {
              ...target,
              speed: target.originalSpeed ?? target.speed * 2, // Fallback to *2 if originalSpeed missing
              originalSpeed: undefined, // Clear the tracking field
            };
          })
        );
      }, 10000);
      
      return () => clearTimeout(timeoutId);
    },
  },
];
