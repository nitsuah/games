/**
 * High Contrast Mode Utility
 * Applies high contrast color scheme for better accessibility
 */

/**
 * Apply high contrast mode to document root
 * @param {boolean} enabled - Whether high contrast mode is enabled
 */
export function applyHighContrastMode(enabled) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  if (enabled) {
    // High contrast colors - maximum differentiation
    root.style.setProperty('--ui-primary', '#00ffff'); // Bright cyan (unchanged)
    root.style.setProperty('--ui-primary-glow', 'rgba(0, 255, 255, 1)'); // Stronger glow
    root.style.setProperty('--ui-secondary', '#ffffff'); // Pure white
    root.style.setProperty('--ui-danger', '#ff0000'); // Pure red
    root.style.setProperty('--ui-warning', '#ffff00'); // Pure yellow
    root.style.setProperty('--ui-success', '#00ff00'); // Pure green
    
    // Text colors - maximum contrast
    root.style.setProperty('--ui-text-primary', '#ffffff'); // Pure white
    root.style.setProperty('--ui-text-secondary', '#e0e0e0'); // Light gray (higher contrast)
    root.style.setProperty('--ui-text-accent', '#00ffff'); // Bright cyan
    
    // Background colors - darker for more contrast
    root.style.setProperty('--ui-bg-dark', 'rgba(0, 0, 0, 1)'); // Pure black
    root.style.setProperty('--ui-bg-medium', 'rgba(0, 0, 0, 0.98)'); // Near black
    root.style.setProperty('--ui-bg-overlay', 'rgba(0, 0, 0, 0.95)'); // Very dark
    root.style.setProperty('--ui-bg-glass', 'rgba(0, 0, 0, 0.9)'); // Dark overlay
    
    // Border colors - higher contrast
    root.style.setProperty('--ui-border-primary', 'rgba(255, 255, 255, 0.8)'); // Bright border
    root.style.setProperty('--ui-border-accent', '#00ffff'); // Bright cyan
    root.style.setProperty('--ui-border-danger', '#ff0000'); // Pure red
    
    // Shadows - stronger for definition
    root.style.setProperty('--ui-shadow-sm', '0 0 15px rgba(0, 0, 0, 1)');
    root.style.setProperty('--ui-shadow-md', '0 0 25px rgba(0, 255, 255, 0.8)');
    root.style.setProperty('--ui-shadow-lg', '0 0 50px rgba(0, 255, 255, 1)');
    root.style.setProperty('--ui-text-shadow', '3px 3px 6px rgba(0, 0, 0, 1)');
    root.style.setProperty('--ui-text-shadow-glow', '0 0 15px rgba(0, 255, 255, 1)');
    
    // Add high contrast class to body for additional styling
    document.body.classList.add('high-contrast-mode');
  } else {
    // Reset to default values (remove inline styles to use CSS defaults)
    root.style.removeProperty('--ui-primary');
    root.style.removeProperty('--ui-primary-glow');
    root.style.removeProperty('--ui-secondary');
    root.style.removeProperty('--ui-danger');
    root.style.removeProperty('--ui-warning');
    root.style.removeProperty('--ui-success');
    root.style.removeProperty('--ui-text-primary');
    root.style.removeProperty('--ui-text-secondary');
    root.style.removeProperty('--ui-text-accent');
    root.style.removeProperty('--ui-bg-dark');
    root.style.removeProperty('--ui-bg-medium');
    root.style.removeProperty('--ui-bg-overlay');
    root.style.removeProperty('--ui-bg-glass');
    root.style.removeProperty('--ui-border-primary');
    root.style.removeProperty('--ui-border-accent');
    root.style.removeProperty('--ui-border-danger');
    root.style.removeProperty('--ui-shadow-sm');
    root.style.removeProperty('--ui-shadow-md');
    root.style.removeProperty('--ui-shadow-lg');
    root.style.removeProperty('--ui-text-shadow');
    root.style.removeProperty('--ui-text-shadow-glow');
    
    // Remove high contrast class
    document.body.classList.remove('high-contrast-mode');
  }
}
