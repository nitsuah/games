import React from 'react';
import styles from './MuzzleFlashOverlay.module.css';

/**
 * Brief screen-edge flash effect when firing high-power weapons
 * Creates visual feedback for explosive, plasma, and cannon shots
 */
export default function MuzzleFlashOverlay({ active, weapon }) {
  if (!active) return null;
  
  // Different intensities for different weapons
  const getFlashIntensity = () => {
    switch (weapon) {
      case 'explosive':
        return 0.3; // Medium flash
      case 'plasma':
        return 0.5; // Strong flash with magenta tint
      case 'aa':
        return 0.25; // Lighter flash for rapid fire
      default:
        return 0.2;
    }
  };

  const getFlashColor = () => {
    switch (weapon) {
      case 'explosive':
        return 'rgba(255, 150, 0, '; // Orange
      case 'plasma':
        return 'rgba(255, 0, 255, '; // Magenta
      case 'aa':
        return 'rgba(255, 255, 100, '; // Yellow
      default:
        return 'rgba(255, 255, 255, '; // White
    }
  };

  const intensity = getFlashIntensity();
  const color = getFlashColor();

  return (
    <div 
      className={styles.flashOverlay}
      style={{ 
        background: `radial-gradient(circle at center, transparent 30%, ${color}${intensity}) 100%)`,
      }}
    />
  );
}
