export const handleMiss = ({ setMisses, onMiss, setCombo, setComboMultiplier, comboTimerRef }) => {
  setMisses((prevMisses) => prevMisses + 1);

  // Reset combo on miss
  setCombo(0);
  setComboMultiplier(1);
  if (comboTimerRef.current) {
    clearTimeout(comboTimerRef.current);
  }

  if (onMiss) onMiss();
};
