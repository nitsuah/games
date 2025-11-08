import styles from './ArcadeMenu.module.css';

export default function ArcadeMenu({ children, onClose, title, className = '' }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.container} ${className}`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.scanline}></div>
          </div>
        )}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
