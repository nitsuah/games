import { generateInitialTargets } from './generateTargets';
import { INITIAL_AMMO, INITIAL_HEALTH } from '../config';

export const restartGame = ({
  setScore,
  setHits,
  setMisses,
  setGameOver,
  setHealth,
  setWeapon,
  setAmmo,
  setCooldowns,
  setTargets,
  setShieldActive,
  setRapidFireActive,
  setSlowMotionActive,
  setInvincibilityActive,
  setSpeedBoostActive,
  setCombo,
  setComboMultiplier,
  comboTimerRef,
  setCurrentWave,
  setShowWaveTransition,
}) => {
  setScore(0);
  setHits(0);
  setMisses(0);
  setGameOver(false);
  setHealth(INITIAL_HEALTH);
  setWeapon('spread');
  setAmmo({ ...INITIAL_AMMO });
  setCooldowns({ spread: 0, laser: 0, explosive: 0 });

  // Reset all power-up states
  setShieldActive(false);
  setRapidFireActive(false);
  setSlowMotionActive(false);
  setInvincibilityActive(false);
  setSpeedBoostActive(false);

  // Reset combo
  setCombo(0);
  setComboMultiplier(1);
  if (comboTimerRef.current) {
    clearTimeout(comboTimerRef.current);
  }

  // Reset to wave 1
  if (setCurrentWave) {
    setCurrentWave(1);
  }
  if (setShowWaveTransition) {
    setShowWaveTransition(false);
  }

  // Generate initial targets for wave 1 (10 targets)
  setTargets(generateInitialTargets(10, 1));
};
