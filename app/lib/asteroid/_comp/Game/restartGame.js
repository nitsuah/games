import { generateInitialTargets, getTargetCountForWave } from './generateTargets';

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

  // Reset to wave 1
  if (setCurrentWave) {
    setCurrentWave(1);
  }
  if (setShowWaveTransition) {
    setShowWaveTransition(false);
  }

  // Generate initial targets for wave 1
  const targetCount = getTargetCountForWave(1);
  setTargets(generateInitialTargets(targetCount, 1));
};
