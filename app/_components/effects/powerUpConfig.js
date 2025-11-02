import { WEAPON_TYPES } from '../../lib/asteroid/_comp/config';
import soundManager from '../../utils/audio/SoundManager';

// Pulse animation patterns for power-up visual feedback
const HEALTH_PULSE_OPACITIES = [250, 100, 200, 80, 150, 50, 0];
const HEALTH_PULSE_DELAYS = [0, 100, 200, 300, 400, 500, 650];

/**
 * Creates a pulse animation effect using multiple flash calls.
 * Used for health power-up collection feedback with gradual fade.
 * 
 * @param {Function} showFlash - Flash function from game context
 * @param {string} color - Flash color ('green', 'blue', 'red', etc.)
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

/**
 * Creates a timed power-up effect that automatically deactivates after a duration.
 * Extracts common pattern of: activate → show flash → schedule deactivation.
 * Improves testability by separating duration management from effect logic.
 * 
 * @param {Object} context - Power-up context with setters and showFlash
 * @param {Function} context.setActive - Setter function for the active state (e.g., setRapidFireActive)
 * @param {Function} context.showFlash - Flash function for visual feedback
 * @param {string} color - Flash color for activation/deactivation
 * @param {number} duration - Duration in milliseconds
 * @param {Function} [onActivate] - Optional callback when power-up activates
 * @param {Function} [onDeactivate] - Optional callback when power-up deactivates
 * @returns {Function} Cleanup function to clear timeout
 */
function createTimedPowerUp(context, color, duration, onActivate, onDeactivate, powerUpType = 'default') {
  const { setActive, showFlash } = context;
  
  // Activate
  setActive(true);
  showFlash(color, 100);
  soundManager.playPowerUpActivate(powerUpType); // Play activation sound
  if (onActivate) onActivate();
  
  // Schedule deactivation
  const timeoutId = setTimeout(() => {
    setActive(false);
    showFlash(color, 0);
    soundManager.playPowerUpDeactivate(); // Play deactivation sound
    if (onDeactivate) onDeactivate();
  }, duration);
  
  // Return cleanup function
  return () => clearTimeout(timeoutId);
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
          soundManager.playPowerUpCollect(); // Play sound on collection
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
            soundManager.playPowerUpCollect(); // Play sound on collection
            // Restore all ammo to max
            return {
              spread: WEAPON_TYPES.find((w) => w.key === 'spread').maxAmmo,
              laser: WEAPON_TYPES.find((w) => w.key === 'laser').maxAmmo,
              explosive: WEAPON_TYPES.find((w) => w.key === 'explosive').maxAmmo,
              aa: WEAPON_TYPES.find((w) => w.key === 'aa').maxAmmo,
              plasma: WEAPON_TYPES.find((w) => w.key === 'plasma').maxAmmo,
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
      return createTimedPowerUp(
        { setActive: setSpeedBoostActive, showFlash },
        'orange',
        10000,
        undefined,
        undefined,
        'default' // Pass power-up type for sound
      );
    },
  },
  {
    type: 'shield',
    duration: 0,
    effect: ({ setShieldActive, showFlash }) => {
      // Stack shield hits - add 3 to existing count
      setShieldActive((prev) => (prev || 0) + 3);
      showFlash('blue', 100);
      soundManager.playPowerUpActivate('shield'); // Play activation sound
      console.log('Shield activated - added 3 hit points');
    },
  },
  {
    type: 'invincibility',
    duration: 10000,
    effect: ({ setInvincibilityActive, showFlash }) => {
      return createTimedPowerUp(
        { setActive: setInvincibilityActive, showFlash },
        'yellow',
        10000,
        undefined,
        undefined,
        'default' // Pass power-up type for sound
      );
    },
  },
  {
    type: 'rapidFire',
    duration: 10000,
    effect: ({ setRapidFireActive, showFlash }) => {
      return createTimedPowerUp(
        { setActive: setRapidFireActive, showFlash },
        'red',
        10000,
        () => console.log('🔫 RAPID FIRE ACTIVATED!'),
        () => console.log('🔫 Rapid fire ended'),
        'rapidFire' // Pass power-up type for sound
      );
    },
  },
  {
    type: 'slowMotion',
    duration: 10000,
    effect: ({ setSlowMotionActive, setTargets, showFlash }) => {
      setSlowMotionActive(true);
      showFlash('purple', 100);
      soundManager.playPowerUpActivate('slowMotion'); // Play activation sound
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
        soundManager.playPowerUpDeactivate(); // Play deactivation sound
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
