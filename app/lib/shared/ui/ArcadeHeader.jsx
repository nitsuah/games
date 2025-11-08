import styles from './ArcadeHeader.module.css';

export default function ArcadeHeader({ title, subtitle, className = '' }) {
  return (
    <div className={`${styles.header} ${className}`}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.scanline}></div>
    </div>
  );
}
