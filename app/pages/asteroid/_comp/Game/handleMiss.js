export const handleMiss = ({ setMisses, onMiss }) => {
  setMisses((prevMisses) => prevMisses + 1);
  if (onMiss) onMiss();
};
