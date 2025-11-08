import { useState, useEffect, useRef } from 'react';
import styles from './DynamicCrosshair.module.css';

/**
 * Dynamic crosshair that responds to player movement and hits
 * - Expands when moving fast
 * - Contracts when stationary
 * - Pulses on hit confirmation
 * - Changes per weapon type
 */
const DynamicCrosshair = ({ weapon = 'spread', velocity = 0, onHit = false }) => {
  const [scale, setScale] = useState(1);
  const [hitPulse, setHitPulse] = useState(false);
  const prevVelocityRef = useRef(0);

  // React to velocity changes - expand with movement
  useEffect(() => {
    const velocityChange = Math.abs(velocity - prevVelocityRef.current);
    
    // Map velocity (0-1 range typically) to scale (0.8-1.3)
    const baseScale = 1 + Math.min(velocity * 0.5, 0.3);
    
    // Add expansion if velocity is changing (accelerating)
    const expansionFromAccel = Math.min(velocityChange * 2, 0.2);
    
    setScale(baseScale + expansionFromAccel);
    prevVelocityRef.current = velocity;
  }, [velocity]);

  // React to hits - pulse animation
  useEffect(() => {
    if (onHit) {
      setHitPulse(true);
      setTimeout(() => setHitPulse(false), 200);
    }
  }, [onHit]);

  // Different crosshair styles per weapon
  const getCrosshairClass = () => {
    switch (weapon) {
      case 'laser':
        return styles.laserCrosshair;
      case 'explosive':
        return styles.explosiveCrosshair;
      case 'aa':
        return styles.aaCrosshair;
      case 'plasma':
        return styles.plasmaCrosshair;
      case 'spread':
      default:
        return styles.spreadCrosshair;
    }
  };

  return (
    <div className={styles.crosshairWrapper}>
      <div 
        className={`
          ${styles.crosshair} 
          ${getCrosshairClass()} 
          ${hitPulse ? styles.hitPulse : ''}
        `}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {/* Center dot */}
        <div className={styles.centerDot} />
        
        {/* Four directional lines */}
        <div className={`${styles.line} ${styles.lineTop}`} />
        <div className={`${styles.line} ${styles.lineRight}`} />
        <div className={`${styles.line} ${styles.lineBottom}`} />
        <div className={`${styles.line} ${styles.lineLeft}`} />
        
        {/* Outer ring for some weapons */}
        {(weapon === 'explosive' || weapon === 'plasma') && (
          <div className={styles.outerRing} />
        )}
      </div>
    </div>
  );
};

export default DynamicCrosshair;
