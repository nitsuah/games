export const handlePlayerHit = ({
  targetSize,
  setHealth,
  showFlash,
  playSound,
  defense: { shieldActive, setShieldActive, invincibilityActive },
}) => {
  // If invincible, ignore damage completely
  if (invincibilityActive) {
    console.log('Player is invincible - no damage taken');
    showFlash('yellow', 200);
    return;
  }

  // If shield is active, reduce shield hits instead of health
  if (shieldActive && shieldActive > 0) {
    setShieldActive((prev) => {
      const newShieldValue = typeof prev === 'number' ? prev - 1 : 0;
      console.log(`Shield absorbed hit! Remaining hits: ${newShieldValue}`);
      if (newShieldValue === 0) {
        console.log('Shield depleted!');
        showFlash('blue', 300); // Blue flash when shield breaks
      } else {
        showFlash('cyan', 200); // Cyan flash for shield hit
      }
      return newShieldValue || false;
    });
    playSound('hit'); // Play shield hit sound
    return;
  }

  // Normal damage
  const hpLoss = Math.max(5, Math.min(20, Math.round(targetSize * 2))); // Limit health loss between 5 and 20
  setHealth((prevHealth) => {
    const newHealth = Math.max(prevHealth - hpLoss, 0);
    console.log(`Health reduced by ${hpLoss}. New health: ${newHealth}`);
    if (newHealth === 0) {
      console.log('Health depleted - game over imminent');
    }
    return newHealth;
  });
  showFlash('red', 500); // Show red flash for 500ms
  playSound('hit'); // Play hit sound
};
