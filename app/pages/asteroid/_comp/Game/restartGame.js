import { generateInitialTargets } from './generateTargets';

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
}) => {
  setScore(0);
  setHits(0);
  setMisses(0);
  setGameOver(false);
  setHealth(100);
  setWeapon('spread');
  setAmmo({ spread: 30, laser: 10, explosive: 10 });
  setCooldowns({ spread: 0.3, laser: 0, explosive: 1 });

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

  // Generate initial targets using helper function
  setTargets(generateInitialTargets(10));
};
