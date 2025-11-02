/**
 * Collision Detection Utilities
 * 
 * Provides reusable collision detection algorithms for game physics.
 * Supports sphere-sphere collisions with spatial partitioning for performance.
 * 
 * @module CollisionDetection
 */

import * as THREE from 'three';

/**
 * Check collision between two spheres
 * 
 * @param {THREE.Vector3} posA - Position of sphere A
 * @param {number} radiusA - Radius of sphere A
 * @param {THREE.Vector3} posB - Position of sphere B
 * @param {number} radiusB - Radius of sphere B
 * @returns {boolean} True if spheres are colliding
 */
export function checkSphereCollision(posA, radiusA, posB, radiusB) {
  const distance = posA.distanceTo(posB);
  return distance <= (radiusA + radiusB);
}

/**
 * Calculate elastic collision response between two objects
 * 
 * Uses conservation of momentum and energy to calculate post-collision velocities.
 * Assumes elastic collision (no energy loss).
 * 
 * @param {THREE.Vector3} posA - Position of object A
 * @param {THREE.Vector3} velA - Velocity of object A
 * @param {number} massA - Mass of object A
 * @param {THREE.Vector3} posB - Position of object B
 * @param {THREE.Vector3} velB - Velocity of object B
 * @param {number} massB - Mass of object B
 * @param {number} [restitution=0.8] - Coefficient of restitution (0 = perfectly inelastic, 1 = perfectly elastic).
 *   Default 0.8 simulates slightly inelastic collisions, typical in real-world and game physics.
 *   Use restitution = 1.0 for truly elastic collisions (no energy loss).
 * @returns {{velA: THREE.Vector3, velB: THREE.Vector3}} New velocities for both objects
 */
export function calculateElasticCollision(posA, velA, massA, posB, velB, massB, restitution = 0.8) {
  // Calculate collision normal (direction from A to B)
  const collisionNormal = new THREE.Vector3()
    .subVectors(posB, posA)
    .normalize();
  
  // Calculate relative velocity (A relative to B)
  const relativeVelocity = new THREE.Vector3()
    .subVectors(velA, velB);
  
  // Calculate velocity along collision normal
  const velocityAlongNormal = relativeVelocity.dot(collisionNormal);
  
  // Objects are moving apart (negative means A moving away from B along normal)
  // Positive means approaching, negative means separating
  if (velocityAlongNormal < 0) {
    return { velA: velA.clone(), velB: velB.clone() };
  }
  
  // Calculate impulse magnitude using 1D elastic collision formula
  const j = -(1 + restitution) * velocityAlongNormal / (1 / massA + 1 / massB);
  
  // Apply impulse to velocities
  const impulseVector = collisionNormal.clone().multiplyScalar(j);
  
  const newVelA = velA.clone().add(impulseVector.clone().multiplyScalar(1 / massA));
  const newVelB = velB.clone().sub(impulseVector.clone().multiplyScalar(1 / massB));
  
  return { velA: newVelA, velB: newVelB };
}

/**
 * Spatial Grid for efficient broad-phase collision detection
 * 
 * Divides space into cells to avoid O(n²) collision checks.
 * Objects only check collisions with others in nearby cells.
 */
export class SpatialGrid {
  /**
   * @param {number} cellSize - Size of each grid cell
   * @param {THREE.Vector3} min - Minimum bounds of the grid
   * @param {THREE.Vector3} max - Maximum bounds of the grid
   */
  constructor(cellSize = 20, min = new THREE.Vector3(-50, -50, -50), max = new THREE.Vector3(50, 50, 50)) {
    this.cellSize = cellSize;
    this.min = min;
    this.max = max;
    this.grid = new Map();
  }
  
  /**
   * Get grid cell key for a position
   * @param {THREE.Vector3} position
   * @returns {string} Cell key
   */
  getCellKey(position) {
    const x = Math.floor(position.x / this.cellSize);
    const y = Math.floor(position.y / this.cellSize);
    const z = Math.floor(position.z / this.cellSize);
    return `${x},${y},${z}`;
  }
  
  /**
   * Clear all objects from the grid
   */
  clear() {
    this.grid.clear();
  }
  
  /**
   * Add an object to the grid
   * @param {object} obj - Object with position property
   */
  add(obj) {
    const key = this.getCellKey(obj.position);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(obj);
  }
  
  /**
   * Get nearby objects within collision range
   * @param {THREE.Vector3} position
   * @param {number} radius - Search radius
   * @returns {Array} Array of nearby objects
   */
  getNearby(position, radius = 0) {
    const nearby = [];
    const cellRadius = Math.ceil(radius / this.cellSize);
    const centerKey = this.getCellKey(position);
    const [cx, cy, cz] = centerKey.split(',').map(Number);
    
    // Check neighboring cells
    for (let x = cx - cellRadius; x <= cx + cellRadius; x++) {
      for (let y = cy - cellRadius; y <= cy + cellRadius; y++) {
        for (let z = cz - cellRadius; z <= cz + cellRadius; z++) {
          const key = `${x},${y},${z}`;
          const cell = this.grid.get(key);
          if (cell) {
            nearby.push(...cell);
          }
        }
      }
    }
    
    return nearby;
  }
  
  /**
   * Get all collision pairs efficiently using spatial partitioning
   * @param {Array} objects - Array of objects with position and radius properties
   * @returns {Array<[object, object]>} Array of collision pairs
   */
  getCollisionPairs(objects) {
    this.clear();
    
    // Add all objects to grid
    objects.forEach(obj => this.add(obj));
    
    const pairs = [];
    const checked = new Set();
    
    // Check collisions only within nearby cells
    objects.forEach(objA => {
      const nearby = this.getNearby(objA.position, objA.radius * 2);
      
      nearby.forEach(objB => {
        if (objA.id === objB.id) return; // Same object
        
        // Create unique pair key (always smaller id first)
        const pairKey = objA.id < objB.id ? `${objA.id}-${objB.id}` : `${objB.id}-${objA.id}`;
        if (checked.has(pairKey)) return; // Already checked this pair
        
        checked.add(pairKey);
        
        // Check actual collision
        if (checkSphereCollision(objA.position, objA.radius, objB.position, objB.radius)) {
          pairs.push([objA, objB]);
        }
      });
    });
    
    return pairs;
  }
}

/**
 * Separate overlapping spheres to prevent stacking
 * 
 * @param {THREE.Vector3} posA - Position of sphere A
 * @param {number} radiusA - Radius of sphere A
 * @param {THREE.Vector3} posB - Position of sphere B
 * @param {number} radiusB - Radius of sphere B
 * @returns {{correctionA: THREE.Vector3, correctionB: THREE.Vector3}} Position corrections
 */
export function separateOverlappingSpheres(posA, radiusA, posB, radiusB) {
  const direction = new THREE.Vector3().subVectors(posB, posA);
  const distance = direction.length();
  const overlap = (radiusA + radiusB) - distance;
  
  if (overlap <= 0) {
    return { correctionA: new THREE.Vector3(), correctionB: new THREE.Vector3() };
  }
  
  // Normalize direction
  direction.normalize();
  
  // Move each sphere half the overlap distance apart
  const correctionA = direction.clone().multiplyScalar(-overlap * 0.5);
  const correctionB = direction.clone().multiplyScalar(overlap * 0.5);
  
  return { correctionA, correctionB };
}
