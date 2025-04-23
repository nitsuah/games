export const handlePlayerHit = ({ targetSize, setHealth, setShowRedFlash, playSound }) => {
  const hpLoss = Math.max(5, Math.min(50, Math.round(targetSize * 2)));
  setHealth((prevHealth) => Math.max(prevHealth - 10 * (hpLoss || 1), 0));
  setShowRedFlash(true); // Show red flash
  playSound('hit'); // Play hit sound
  setTimeout(() => setShowRedFlash(false), 500);
};
