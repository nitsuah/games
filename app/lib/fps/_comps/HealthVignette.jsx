import React from 'react';
import styles from './HealthVignette.module.css';

/**
 * Health vignette effect that darkens and reddens screen edges
 * as player health decreases, providing visual feedback for danger
 */
export default function HealthVignette({ health }) {
  // Calculate vignette intensity based on health
  // Below 50% health, start showing vignette
  // Below 25% health, add red tint
  const healthPercent = Math.max(0, Math.min(100, health));
  
  // Vignette opacity: 0 at 100%, 0.4 at 50%, 0.8 at 0%
  const vignetteOpacity = healthPercent > 50 
    ? 0 
    : (50 - healthPercent) / 50 * 0.8;
  
  // Red tint opacity: 0 at 25%+, 0.3 at 0%
  const redTintOpacity = healthPercent > 25 
    ? 0 
    : (25 - healthPercent) / 25 * 0.3;

  if (healthPercent >= 50) {
    return null; // No vignette at high health
  }

  return (
    <>
      {/* Dark vignette around edges */}
      <div 
        className={styles.vignette}
        style={{ opacity: vignetteOpacity }}
      />
      
      {/* Red tint for critical health */}
      {healthPercent < 25 && (
        <div 
          className={styles.redTint}
          style={{ opacity: redTintOpacity }}
        />
      )}
    </>
  );
}
