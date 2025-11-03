/**
 * Color schemes optimized for different types of colorblindness
 * 
 * Deuteranopia (red-green, most common): ~6% of males, 0.4% of females
 * Protanopia (red-green): ~2% of males, 0.01% of females
 * Tritanopia (blue-yellow, rare): ~0.001% of population
 * 
 * Design principles:
 * - Avoid red/green combinations
 * - Use high contrast colors
 * - Consider luminance differences
 * - Test with colorblind simulators
 */

/**
 * Normal vision color scheme (default)
 */
export const NORMAL_COLORS = {
  small: '#00ff00',  // Green - small targets
  medium: '#ffff00', // Yellow - medium targets
  large: '#ff4400',  // Red-orange - large targets
};

/**
 * Deuteranopia-friendly colors (red-green colorblindness)
 * Uses blue-yellow spectrum with high contrast
 */
export const DEUTERANOPIA_COLORS = {
  small: '#0088ff',  // Bright blue - small targets
  medium: '#ffbb00', // Amber/gold - medium targets
  large: '#ff00ff',  // Magenta - large targets
};

/**
 * Protanopia-friendly colors (red-green colorblindness)
 * Similar to deuteranopia but optimized for different receptor loss
 */
export const PROTANOPIA_COLORS = {
  small: '#00ccff',  // Cyan - small targets
  medium: '#ffaa00', // Orange - medium targets
  large: '#cc00ff',  // Purple - large targets
};

/**
 * Tritanopia-friendly colors (blue-yellow colorblindness)
 * Uses red-cyan spectrum
 */
export const TRITANOPIA_COLORS = {
  small: '#00ffff',  // Cyan - small targets
  medium: '#ff88ff', // Pink - medium targets
  large: '#ff0044',  // Red - large targets
};

/**
 * Get color scheme based on colorblind mode setting
 * @param {string} mode - 'none', 'deuteranopia', 'protanopia', or 'tritanopia'
 * @returns {Object} Color scheme object with small, medium, large properties
 */
export function getColorScheme(mode) {
  switch (mode) {
    case 'deuteranopia':
      return DEUTERANOPIA_COLORS;
    case 'protanopia':
      return PROTANOPIA_COLORS;
    case 'tritanopia':
      return TRITANOPIA_COLORS;
    case 'none':
    default:
      return NORMAL_COLORS;
  }
}

/**
 * Get target color based on size and colorblind mode
 * @param {number} size - Target size
 * @param {string} colorblindMode - Current colorblind mode
 * @returns {string} Hex color string
 */
export function getTargetColor(size, colorblindMode = 'none') {
  const scheme = getColorScheme(colorblindMode);
  
  // Small targets (<8), medium (8-12), large (>12)
  if (size < 8) return scheme.small;
  if (size < 12) return scheme.medium;
  return scheme.large;
}
