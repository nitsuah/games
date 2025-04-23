export const handleHealthDepletion = ({
  health,
  setGameOver,
  pauseSound,
  playSound,
  setShowRedFlash,
  invincibilityActive,
  shieldActive,
  setShieldActive,
}) => {
  if (invincibilityActive) {
    console.log('Player is invincible. No health reduction.');
    return; // Skip health reduction if invincible
  }

  if (shieldActive) {
    console.log('Shield absorbed the damage. Shield deactivated.');
    setShieldActive(false); // Deactivate shield after absorbing the damage
    return; // Skip health reduction if shield is active
  }

  if (health <= 0) {
    setGameOver((prev) => {
      if (!prev) {
        pauseSound('bgm');
        playSound('gameOver');
        return true; // Only set game over if it wasn't already true
      }
      return prev;
    });
  } else if (health < 30) {
    setShowRedFlash(true);
    setTimeout(() => setShowRedFlash(false), 100); // Flash red briefly
  }
};
