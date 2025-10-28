import styles from './ComboDisplay.module.css';

const ComboDisplay = ({ combo, multiplier }) => {
  if (combo < 2) return null; // Only show for combos of 2+

  return (
    <div className={styles.container}>
      <div className={`${styles.combo} ${combo >= 5 ? styles.mega : ''}`}>
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
