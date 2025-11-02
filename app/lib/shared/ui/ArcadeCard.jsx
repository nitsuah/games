import styles from './ArcadeCard.module.css';

export default function ArcadeCard({ 
  title, 
  icon, 
  description, 
  onClick, 
  className = '',
  badge = null 
}) {
  return (
    <button className={`${styles.card} ${className}`} onClick={onClick}>
      {badge && <div className={styles.badge}>{badge}</div>}
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <div className={styles.playPrompt}>
        <span className={styles.arrow}>▶</span>
        <span>PLAY</span>
      </div>
    </button>
  );
}
