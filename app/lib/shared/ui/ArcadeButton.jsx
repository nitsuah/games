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
  PRIMARY: 'primary',    // Cyan glow (resume, confirm)
  DANGER: 'danger',      // Red glow (quit, delete)
  WARNING: 'warning',    // Orange glow (restart, reset)
  SUCCESS: 'success',    // Green glow (start, play)
  SECONDARY: 'secondary', // Gray (cancel, back)
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
  const variantClass = styles[`variant-${variant}`] || styles['variant-primary'];
  
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
