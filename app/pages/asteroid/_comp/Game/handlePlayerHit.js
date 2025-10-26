export const handlePlayerHit = ({ targetSize, setHealth, showFlash, playSound }) => {
  const hpLoss = Math.max(5, Math.min(20, Math.round(targetSize * 2))); // Limit health loss between 5 and 20
  setHealth((prevHealth) => Math.max(prevHealth - hpLoss, 0)); // Reduce health by calculated amount
  showFlash('red', 500); // Show red flash for 500ms
  playSound('hit'); // Play hit sound
};
