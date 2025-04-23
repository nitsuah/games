export const updateScore = ({ hits, misses, setScore }) => {
  setScore(hits * 100 + Math.round((hits / (hits + misses || 1)) * 100));
};
