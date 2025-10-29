import styles from './SlowMotionOverlay.module.css';

const SlowMotionOverlay = ({ active }) => {
  if (!active) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.vignette} />
      <div className={styles.scanlines} />
    </div>
  );
};

export default SlowMotionOverlay;
