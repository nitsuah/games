export const updateScore = ({ hits, misses, setScore, comboMultiplier = 1 }) => {
  const baseScore = hits * 100 + Math.round((hits / (hits + misses || 1)) * 100);
  setScore(Math.round(baseScore * comboMultiplier));
};
