/**
 * Target Collision Handler
 * 
 * Phase 9: Handles target-target physics collisions with elastic bounce.
 * Targets now bounce off each other realistically instead of splitting.
 * Uses spatial partitioning for performance with many targets.
 */

import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { checkSphereCollision, calculateElasticCollision, SpatialGrid } from '@/lib/shared/physics/CollisionDetection';

/**
 * Determines how often to check collisions based on target count.
 * More targets = less frequent checks to maintain 60fps.
 */
function getCollisionCheckInterval(targetCount) {
  if (targetCount < 5) return 1; // Every frame
  if (targetCount < 10) return 2; // Every 2 frames  
  if (targetCount < 20) return 3; // Every 3 frames
  return 4; // Every 4 frames for many targets
}

const TargetCollisionHandler = ({ targets, setTargets }) => {
  const frameCountRef = useRef(0);
  const [checkInterval, setCheckInterval] = useState(2);

  useFrame(() => {
    if (!targets || targets.length < 2) return;
    
    // Update check interval if target count changed significantly
    const newInterval = getCollisionCheckInterval(targets.length);
    if (newInterval !== checkInterval) {
      setCheckInterval(newInterval);
    }
    
    // Skip frames based on interval for performance
    frameCountRef.current++;
    if (frameCountRef.current % checkInterval !== 0) return;
    
    // Build active targets list (only non-hit targets)
    const activeTargets = targets
      .filter(t => !t.isHit)
      .map(t => ({
        ...t,
        position: new THREE.Vector3(t.x, t.y, t.z),
        velocity: new THREE.Vector3(t.vx || 0, t.vy || 0, t.vz || 0),
        radius: t.size || 10,
        mass: (t.size || 10) ** 3, // Mass ∝ volume (r³)
      }));
    
    if (activeTargets.length < 2) return;
    
    // Create spatial grid for efficient collision detection
    const avgRadius = activeTargets.reduce((sum, t) => sum + t.radius, 0) / activeTargets.length;
    const cellSize = avgRadius * 4;
    const grid = new SpatialGrid(cellSize);
    
    // Insert all targets into spatial grid
    activeTargets.forEach(target => {
      grid.add(target);
    });
    
    // Detect collisions
    const collisions = [];
    const processed = new Set();
    
    activeTargets.forEach(targetA => {
      // Get nearby targets from spatial grid
      const searchRadius = targetA.radius * 2;
      const nearby = grid.getNearby(targetA.position, searchRadius);
      
      nearby.forEach(targetB => {
        // Skip self-collision and already processed pairs
        if (targetA.id === targetB.id) return;
        const pairKey = targetA.id < targetB.id 
          ? `${targetA.id}-${targetB.id}` 
          : `${targetB.id}-${targetA.id}`;
        if (processed.has(pairKey)) return;
        processed.add(pairKey);
        
        // Check collision
        if (checkSphereCollision(
          targetA.position, targetA.radius,
          targetB.position, targetB.radius
        )) {
          collisions.push({ targetA, targetB });
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
        0.8 // 80% restitution (slightly inelastic bounce)
      );
      
      velocityUpdates.set(targetA.id, velA);
      velocityUpdates.set(targetB.id, velB);
    });
    
    // Apply velocity updates to state
    setTargets(prevTargets =>
      prevTargets.map(target => {
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
  });

  return null;
};

export default TargetCollisionHandler;
