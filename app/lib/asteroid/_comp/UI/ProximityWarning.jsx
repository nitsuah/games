import React, { useEffect, useState } from 'react';
import styles from './ProximityWarning.module.css';

/**
 * Visual/audio warning when targets get dangerously close to player
 * Shows directional indicators pointing toward nearby threats
 */
export default function ProximityWarning({ targets, playerPosition = [0, 0, 0] }) {
  const [nearbyTargets, setNearbyTargets] = useState([]);
  const dangerRadius = 15; // units
  const criticalRadius = 8; // units - very close
  
  useEffect(() => {
    if (!targets || targets.length === 0) {
      setNearbyTargets([]);
      return;
    }
    
    // Find targets within danger radius
    const nearby = targets
      .filter(target => !target.isHit)
      .map(target => {
        const dx = target.x - playerPosition[0];
        const dy = target.y - playerPosition[1];
        const dz = target.z - playerPosition[2];
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
    
    setNearbyTargets(nearby);
    
    // Play warning sound if any critical threats
    const hasCritical = nearby.some(t => t.isCritical);
    if (hasCritical && nearby.length > 0) {
      // Trigger audio warning (will implement in parent or via soundManager)
      import('@/utils/audio/SoundManager').then((_module) => {
        // Could add a specific proximity alert sound here
        // soundManager.playProximityAlert();
      });
    }
  }, [targets, playerPosition, dangerRadius, criticalRadius]);
  
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
