import styles from './ComboDisplay.module.css';

const ComboDisplay = ({ combo }) => {
  if (combo < 2) return null;
  return (
    <div className={styles.comboContainer}>
      <div className={styles.comboText}>COMBO ×{combo}</div>
    </div>
  );
};

export default ComboDisplay;