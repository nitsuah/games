import React, { useMemo } from 'react';
import styles from './ProximityWarning.module.css';

const ORIGIN = [0, 0, 0];
const dangerRadius = 15; // units
const criticalRadius = 8; // units - very close

/**
 * Visual warning when targets get dangerously close to player
 * Shows directional indicators pointing toward nearby threats
 */
export default function ProximityWarning({ targets, playerPosition = ORIGIN }) {
  // Depend on the coordinates, not the array identity: callers pass inline arrays.
  const [px, py, pz] = playerPosition;

  const nearbyTargets = useMemo(() => {
    if (!targets || targets.length === 0) return [];

    // Find targets within danger radius
    return targets
      .filter(target => !target.isHit)
      .map(target => {
        const dx = target.x - px;
        const dy = target.y - py;
        const dz = target.z - pz;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Calculate angle for directional indicator (in screen space, approximate)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        return {
          id: target.id,
          distance,
          angle,
          isCritical: distance < criticalRadius,
        };
      })
      .filter(t => t.distance < dangerRadius)
      .sort((a, b) => a.distance - b.distance) // Closest first
      .slice(0, 6); // Limit to 6 indicators max
  }, [targets, px, py, pz]);
  
  if (nearbyTargets.length === 0) return null;
  
  return (
    <div className={styles.warningContainer}>
      {nearbyTargets.map((target) => {
        // Position indicators around screen edges
        // Convert angle to position on screen edge
        const isCritical = target.isCritical;
        const intensity = 1 - (target.distance / dangerRadius);
        
        // Simple directional positioning
        // For a more accurate system, we'd need to project 3D coords to 2D screen space
        const indicatorStyle = {
          transform: `rotate(${target.angle}deg)`,
          opacity: intensity,
        };
        
        return (
          <div
            key={target.id}
            className={`${styles.indicator} ${isCritical ? styles.critical : ''}`}
            style={indicatorStyle}
          >
            <div className={styles.arrow}>▶</div>
          </div>
        );
      })}
      
      {/* Central warning pulse if any critical threats */}
      {nearbyTargets.some(t => t.isCritical) && (
        <div className={styles.centralWarning}>
          <div className={styles.warningText}>PROXIMITY ALERT</div>
        </div>
      )}
    </div>
  );
}
