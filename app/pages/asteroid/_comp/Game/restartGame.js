import { now } from '@/utils/time';

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
  
  setTargets([
    { id: 1, x: 15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 2, x: -15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 3, x: 0, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 4, x: 0, y: -15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 5, x: 12, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 6, x: 15, y: 17, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 7, x: 18, y: 19, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 8, x: -12, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 9, x: -15, y: 17, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 10, x: -18, y: 19, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
  ]);
};
