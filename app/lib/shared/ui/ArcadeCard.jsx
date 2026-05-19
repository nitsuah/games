import styles from './ArcadeCard.module.css';

/**
 * Get CSS class name for display mode
 * @param {string} mode - Display mode: 'carousel', 'grid', or 'list'
 * @returns {string} CSS class name for the mode
 */
function getDisplayModeClass(mode) {
  switch (mode) {
    case 'grid':
      return styles.gridMode;
    case 'list':
      return styles.listMode;
    case 'carousel':
      return styles.carouselMode;
    default:
      return '';
  }
}

export default function ArcadeCard({
  title,
  icon,
  description,
  onClick,
  className = '',
  badge = null,
  displayMode = 'carousel',
  carouselPosition = 'current',
  isSelected = false,
  tabIndex = -1,
  testId = undefined
}) {
  const modeClass = getDisplayModeClass(displayMode);
  const positionClass = displayMode === 'carousel' && carouselPosition ? styles[carouselPosition] : '';

  return (
    <button
      className={`${styles.card} ${className} ${modeClass} ${positionClass}`}
      onClick={onClick}
      aria-label={title}
      aria-pressed={isSelected}
      tabIndex={tabIndex}
      data-testid={testId}
    >
      {badge && <div className={styles.badge}>{badge}</div>}
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      {displayMode === 'grid' ? (
        <div className={styles.titleRow}>
          <span className={styles.playIcon}>▶</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
      ) : (
        <h3 className={styles.title}>{title}</h3>
      )}
      {displayMode !== 'grid' && <p className={styles.description}>{description}</p>}
      {displayMode !== 'grid' && (
        <div className={styles.playPrompt}>
          <span className={styles.arrow}>▶</span>
          {displayMode !== 'list' && <span>PLAY</span>}
        </div>
      )}
    </button>
  );
}
