export const handlePlayerHit = ({ targetSize, setHealth, setShowRedFlash, playSound }) => {
  const hpLoss = Math.max(5, Math.min(20, Math.round(targetSize * 2))); // Limit health loss between 5 and 20
  setHealth((prevHealth) => Math.max(prevHealth - hpLoss, 0)); // Reduce health by calculated amount
  setShowRedFlash(true); // Show red flash
  playSound('hit'); // Play hit sound
  setTimeout(() => setShowRedFlash(false), 500); // End red flash after 500ms
};
