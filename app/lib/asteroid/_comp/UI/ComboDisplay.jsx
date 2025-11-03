import { useEffect, useState, useRef } from 'react';
import styles from './ComboDisplay.module.css';

const ComboDisplay = ({ combo, multiplier }) => {
  const [growAnimation, setGrowAnimation] = useState(false);
  const prevComboRef = useRef(combo);

  // Trigger grow animation when combo increases
  useEffect(() => {
    if (combo > prevComboRef.current && combo >= 2) {
      setGrowAnimation(true);
      setTimeout(() => setGrowAnimation(false), 300);
    }
    prevComboRef.current = combo;
  }, [combo]);

  if (combo < 2) return null; // Only show for combos of 2+

  return (
    <div className={styles.container}>
      <div 
        className={`
          ${styles.combo} 
          ${combo >= 5 ? styles.mega : ''} 
          ${growAnimation ? styles.grow : ''}
        `}
      >
        <div className={styles.comboText}>COMBO</div>
        <div className={styles.comboValue}>×{combo}</div>
        {multiplier > 1 && (
          <div className={styles.multiplier}>+{((multiplier - 1) * 100).toFixed(0)}% Score</div>
        )}
      </div>
    </div>
  );
};

export default ComboDisplay;
