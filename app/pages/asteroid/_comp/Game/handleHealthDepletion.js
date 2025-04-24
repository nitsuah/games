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
  console.log('handleHealthDepletion called');
  console.log(`Current Health: ${health}`);
  console.log(`Shield Active: ${shieldActive}, Invincibility Active: ${invincibilityActive}`);

  if (invincibilityActive) {
    console.log('Player is invincible. No health reduction.');
    return;
  }

  if (shieldActive) {
    console.log('Shield absorbed the damage.');
    playSound('hit'); // Play shield hit sound
    console.log('Shield disabled.');
    setShieldActive(false); // Disable shield after absorbing damage
    return; // Skip health reduction if shield is active
  }

  if (health <= 0) {
    console.log('Health is zero or below. Triggering game over.');
    setGameOver((prev) => {
      if (!prev) {
        pauseSound('bgm');
        playSound('gameOver');
        console.log('Game over state set.');
        return true;
      }
      return prev;
    });
    return; // Prevent further health reduction after game over
  }

  const hpLoss = 10;
  console.log(`Reducing health by ${hpLoss}`);
  setHealth((prevHealth) => {
    const newHealth = Math.max(prevHealth - hpLoss, 0);
    console.log(`New Health: ${newHealth}`);
    if (newHealth === 0) {
      console.log('Health reached 0. Triggering game over.');
      setGameOver(true);
      pauseSound('bgm');
    }
    return newHealth;
  });

  setShowRedFlash(true);
  setTimeout(() => setShowRedFlash(false), 100);
};
