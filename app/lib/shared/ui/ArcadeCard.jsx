import Link from 'next/link';
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
  onClick = undefined,
  href = '',
  className = '',
  badge = null,
  displayMode = 'carousel',
  carouselPosition = 'current',
  tabIndex,
  testId = undefined
}) {
  const modeClass = getDisplayModeClass(displayMode);
  const positionClass = displayMode === 'carousel' && carouselPosition ? styles[carouselPosition] : '';

  const classes = `${styles.card} ${className} ${modeClass} ${positionClass}`;
  // With an href the tile is a real link (crawlable, middle-clickable); otherwise a button.
  const Wrapper = href ? Link : 'button';
  const wrapperProps = href
    ? { href, className: classes, 'aria-label': title, tabIndex, 'data-testid': testId }
    : { className: classes, onClick, 'aria-label': title, tabIndex, 'data-testid': testId };

  return (
    <Wrapper {...wrapperProps}>
      {badge && <div className={styles.badge}>{badge}</div>}
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      {displayMode === 'grid' ? (
        <div className={styles.titleRow}>
          <span className={styles.playIcon}>▶</span>
          <p className={styles.title}>{title}</p>
        </div>
      ) : (
        <p className={styles.title}>{title}</p>
      )}
      {displayMode !== 'grid' && <p className={styles.description}>{description}</p>}
      {displayMode !== 'grid' && (
        <div className={styles.playPrompt}>
          <span className={styles.arrow}>▶</span>
          {displayMode !== 'list' && <span>PLAY</span>}
        </div>
      )}
    </Wrapper>
  );
}
