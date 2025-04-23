export const handleHealthDepletion = ({
  health,
  setGameOver,
  pauseSound,
  playSound,
  setShowRedFlash,
}) => {
  if (health <= 0) {
    setGameOver(true);
    pauseSound('bgm'); // Pause background music
    playSound('hit');
    setShowRedFlash(true); // Show red flash
    setTimeout(() => {
      setShowRedFlash(false); // Hide red flash effect after 1 second
    }, 1000);
    document.exitPointerLock(); // Exit pointer lock
  }
};
