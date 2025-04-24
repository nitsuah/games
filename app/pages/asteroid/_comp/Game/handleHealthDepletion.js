export const handleHealthDepletion = ({
  health,
  setHealth,
  setGameOver,
  pauseSound,
  playSound,
  setShowRedFlash,
  invincibilityActive,
  shieldActive,
  setShieldActive,
}) => {
  console.debug('handleHealthDepletion called');
  console.debug(`Current Health: ${health}`);
  console.debug(`Shield Active: ${shieldActive}, Invincibility Active: ${invincibilityActive}`);

  if (invincibilityActive) {
    console.debug('Player is invincible. No health reduction.');
    return;
  }

  if (shieldActive) {
    console.debug('Shield absorbed the damage.');
    playSound('hit'); // Play shield hit sound
    console.debug('Shield disabled.');
    setShieldActive(false); // Disable shield after absorbing damage
    return; // Skip health reduction if shield is active
  }

  if (health <= 0) {
    console.debug('Health is zero or below. Triggering game over.');
    setGameOver((prev) => {
      if (!prev) {
        pauseSound('bgm');
        playSound('gameOver');
        console.debug('Game over state set.');
        document.exitPointerLock(); // Ensure pointer lock is released
        return true;
      }
      return prev;
    });
    return; // Prevent further health reduction after game over
  }

  const hpLoss = 10;
  console.debug(`Reducing health by ${hpLoss}`);
  setHealth((prevHealth) => {
    const newHealth = Math.max(prevHealth - hpLoss, 0);
    console.debug(`New Health: ${newHealth}`);
    if (newHealth === 0) {
      console.debug('Health reached 0. Triggering game over.');
      setGameOver(true);
      pauseSound('bgm');
      playSound('gameOver');
      document.exitPointerLock(); // Ensure pointer lock is released
    }
    return newHealth;
  });

  setShowRedFlash(true);
  setTimeout(() => setShowRedFlash(false), 100);
};
