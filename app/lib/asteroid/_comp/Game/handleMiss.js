export const handleMiss = ({ setMisses, onMiss, setCombo, setComboMultiplier, comboTimerRef, comboDeadlineRef, comboRemainingRef }) => {
  setMisses((prevMisses) => prevMisses + 1);

  // Reset combo on miss
  setCombo(0);
  setComboMultiplier(1);
  if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
  comboTimerRef.current = null;
  if (comboDeadlineRef) comboDeadlineRef.current = null;
  if (comboRemainingRef) comboRemainingRef.current = null;

  if (onMiss) onMiss();
};
