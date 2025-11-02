/**
 * Target Collision Manager
 * 
 * Handles collision detection and response between targets using
 * the shared collision physics system. Optimized with spatial partitioning
 * to avoid O(n²) complexity.
 * 
 * @module TargetCollisionManager
 */

import * as THREE from 'three';
import { checkSphereCollision, calculateElasticCollision, SpatialGrid } from '@/lib/shared/physics/CollisionDetection';

/**
 * Process collisions between all targets in the scene.
 * Uses spatial grid for optimization to avoid checking every pair.
 * 
 * @param {Array} targets - Array of target objects with position and velocity
 * @param {Function} setTargets - State setter to update target velocities after collision
 * @param {Object} meshRefs - Map of targetId -> mesh ref for position access
 * @returns {void}
 */
export function processTargetCollisions(targets, setTargets, meshRefs) {
  if (!targets || targets.length < 2) return;
  
  // Create spatial grid for efficient collision detection
  // Cell size = average target diameter * 2 for optimal performance
  const avgRadius = targets.reduce((sum, t) => sum + (t.size || 10), 0) / targets.length;
  const cellSize = avgRadius * 4;
  const grid = new SpatialGrid(cellSize);
  
  // Build active targets list (only non-hit targets with mesh refs)
  const activeTargets = [];
  targets.forEach((target) => {
    if (target.isHit) return;
    const meshRef = meshRefs.get(target.id);
    if (!meshRef || !meshRef.current) return;
    
    const position = meshRef.current.position;
    activeTargets.push({
      ...target,
      position: new THREE.Vector3(position.x, position.y, position.z),
      velocity: new THREE.Vector3(target.vx || 0, target.vy || 0, target.vz || 0),
      radius: target.size || 10,
      mass: Math.pow(target.size || 10, 3), // Mass proportional to volume (r³)
    });
  });
  
  // Insert all targets into spatial grid
  activeTargets.forEach((target) => {
    grid.insert(target.position, target);
  });
  
  // Detect and resolve collisions
  const collisions = [];
  activeTargets.forEach((targetA) => {
    // Get nearby targets from spatial grid (much faster than checking all)
    const nearby = grid.query(
      new THREE.Vector3(
        targetA.position.x - targetA.radius * 2,
        targetA.position.y - targetA.radius * 2,
        targetA.position.z - targetA.radius * 2
      ),
      new THREE.Vector3(
        targetA.position.x + targetA.radius * 2,
        targetA.position.y + targetA.radius * 2,
        targetA.position.z + targetA.radius * 2
      )
    );
    
    nearby.forEach((targetB) => {
      // Skip self-collision and already processed pairs
      if (targetA.id === targetB.id) return;
      if (collisions.some(c => 
        (c.a === targetA.id && c.b === targetB.id) || 
        (c.a === targetB.id && c.b === targetA.id)
      )) return;
      
      // Check collision
      if (checkSphereCollision(
        targetA.position, targetA.radius,
        targetB.position, targetB.radius
      )) {
        collisions.push({ a: targetA.id, b: targetB.id, targetA, targetB });
      }
    });
  });
  
  // Resolve all collisions
  if (collisions.length === 0) return;
  
  const velocityUpdates = new Map();
  collisions.forEach(({ targetA, targetB }) => {
    const { velA, velB } = calculateElasticCollision(
      targetA.position,
      targetA.velocity,
      targetA.mass,
      targetB.position,
      targetB.velocity,
      targetB.mass,
      0.8 // 80% restitution (slightly inelastic)
    );
    
    velocityUpdates.set(targetA.id, velA);
    velocityUpdates.set(targetB.id, velB);
  });
  
  // Apply velocity updates to state
  if (velocityUpdates.size > 0) {
    setTargets((prevTargets) =>
      prevTargets.map((target) => {
        const newVel = velocityUpdates.get(target.id);
        if (newVel) {
          return {
            ...target,
            vx: newVel.x,
            vy: newVel.y,
            vz: newVel.z,
          };
        }
        return target;
      })
    );
  }
}

/**
 * Calculate optimal collision check frequency based on target count.
 * More targets = less frequent checks to maintain performance.
 * 
 * @param {number} targetCount - Number of targets in the scene
 * @returns {number} Frames between collision checks
 */
export function getCollisionCheckInterval(targetCount) {
  if (targetCount < 5) return 1; // Every frame
  if (targetCount < 10) return 2; // Every 2 frames
  if (targetCount < 20) return 3; // Every 3 frames
  return 4; // Every 4 frames for large counts
}
