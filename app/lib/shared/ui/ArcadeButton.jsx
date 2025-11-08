/**
 * ArcadeButton - Reusable arcade-styled button component
 * 
 * Features:
 * - Retro arcade aesthetic with glow effects
 * - Icon + text layout
 * - Multiple variants (primary, danger, success, etc.)
 * - Optional hint text
 * - Hover and active states
 * 
 * @module ArcadeButton
 */

import styles from './ArcadeButton.module.css';

export const VARIANTS = {
  PRIMARY: 'primary',    // Cyan glow. Use for primary actions: resume, confirm, proceed, save.
  DANGER: 'danger',      // Red glow. Use for destructive actions: quit, delete, remove, stop.
  WARNING: 'warning',    // Orange glow. Use for cautionary actions: restart, reset, warn, alert.
  SUCCESS: 'success',    // Green glow. Use for positive actions: start, play, complete, success.
  SECONDARY: 'secondary', // Gray. Use for secondary/neutral actions: cancel, back, dismiss, neutral.
};

/**
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button text content
 * @param {string} [props.icon] - Emoji or icon to display
 * @param {string} [props.hint] - Small hint text below main text
 * @param {string} [props.variant='primary'] - Button style variant
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {Object} [props.style] - Inline styles
 */
const ArcadeButton = ({
  onClick,
  children,
  icon,
  hint,
  variant = 'primary',
  className = '',
  disabled = false,
  style = {},
  ...props
}) => {
  // Validate variant in development mode
  const validVariants = Object.values(VARIANTS);
  const isValidVariant = validVariants.includes(variant);
  
  if (!isValidVariant && typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    console.warn(
      `[ArcadeButton] Unknown variant "${variant}" provided. Falling back to "primary". Valid variants are: ${validVariants.join(', ')}.`
    );
  }
  
  const variantClass = styles[`variant-${isValidVariant ? variant : 'primary'}`] || styles['variant-primary'];
  
  return (
    <button
      className={`${styles.button} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.content}>
        <span className={styles.text}>{children}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
    </button>
  );
};

export default ArcadeButton;
