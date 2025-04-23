export const loadSavedScores = ({ setHighScore, setBestAccuracy }) => {
  const savedHighScore = window.localStorage.getItem('asteroidHighScore');
  const savedBestAccuracy = window.localStorage.getItem('asteroidBestAccuracy');

  if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
  if (savedBestAccuracy) setBestAccuracy(parseFloat(savedBestAccuracy));
};
