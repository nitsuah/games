import * as THREE from 'three';
import {
  checkSphereCollision,
  calculateElasticCollision,
  SpatialGrid,
  separateOverlappingSpheres,
} from '@/lib/shared/physics/CollisionDetection';

describe('CollisionDetection', () => {
  describe('checkSphereCollision', () => {
    it('should detect collision when spheres overlap', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const posB = new THREE.Vector3(5, 0, 0);
      const radiusA = 3;
      const radiusB = 3;
      
      expect(checkSphereCollision(posA, radiusA, posB, radiusB)).toBe(true);
    });
    
    it('should not detect collision when spheres are apart', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const posB = new THREE.Vector3(10, 0, 0);
      const radiusA = 2;
      const radiusB = 2;
      
      expect(checkSphereCollision(posA, radiusA, posB, radiusB)).toBe(false);
    });
    
    it('should detect collision when spheres are touching', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const posB = new THREE.Vector3(5, 0, 0);
      const radiusA = 2.5;
      const radiusB = 2.5;
      
      expect(checkSphereCollision(posA, radiusA, posB, radiusB)).toBe(true);
    });
  });
  
  describe('calculateElasticCollision', () => {
    it('should conserve momentum in head-on collision', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const velA = new THREE.Vector3(5, 0, 0); // Moving towards B
      const massA = 1;
      
      const posB = new THREE.Vector3(1, 0, 0); // Close to A
      const velB = new THREE.Vector3(-5, 0, 0); // Moving towards A
      const massB = 1;
      
      const { velA: newVelA, velB: newVelB } = calculateElasticCollision(
        posA, velA, massA,
        posB, velB, massB,
        1.0 // Perfectly elastic
      );
      
      // Check momentum conservation: total momentum before = total momentum after
      const momentumBefore = velA.x * massA + velB.x * massB;
      const momentumAfter = newVelA.x * massA + newVelB.x * massB;
      expect(momentumAfter).toBeCloseTo(momentumBefore);
      
      // Check that velocities changed (collision occurred)
      expect(newVelA.x).not.toBeCloseTo(velA.x);
      expect(newVelB.x).not.toBeCloseTo(velB.x);
    });
    
    it('should handle moving into stationary object', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const velA = new THREE.Vector3(10, 0, 0); // Moving towards B
      const massA = 1;
      
      const posB = new THREE.Vector3(1, 0, 0); // Ahead of A
      const velB = new THREE.Vector3(0, 0, 0); // Stationary
      const massB = 1;
      
      const { velA: newVelA, velB: newVelB } = calculateElasticCollision(
        posA, velA, massA,
        posB, velB, massB,
        1.0
      );
      
      // Check momentum conservation
      const momentumBefore = velA.x * massA + velB.x * massB;
      const momentumAfter = newVelA.x * massA + newVelB.x * massB;
      expect(momentumAfter).toBeCloseTo(momentumBefore);
      
      // Check that B is now moving and A slowed down
      expect(newVelB.x).toBeGreaterThan(0);
      expect(newVelA.x).toBeLessThan(velA.x);
    });
    
    it('should handle different masses correctly', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const velA = new THREE.Vector3(10, 0, 0); // Moving towards B
      const massA = 10; // Heavy object
      
      const posB = new THREE.Vector3(1, 0, 0); // Ahead of A
      const velB = new THREE.Vector3(0, 0, 0); // Stationary
      const massB = 1; // Light object
      
      const { velA: newVelA, velB: newVelB } = calculateElasticCollision(
        posA, velA, massA,
        posB, velB, massB,
        1.0
      );
      
      // Check momentum conservation
      const momentumBefore = velA.x * massA + velB.x * massB;
      const momentumAfter = newVelA.x * massA + newVelB.x * massB;
      expect(momentumAfter).toBeCloseTo(momentumBefore);
      
      // Heavy object should barely slow down
      expect(newVelA.x).toBeGreaterThan(0.8 * velA.x);
      expect(newVelA.x).toBeLessThan(velA.x);
      
      // Light object should be moving faster than heavy object
      expect(newVelB.x).toBeGreaterThan(newVelA.x);
    });
    
    it('should not respond when objects are moving apart', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const velA = new THREE.Vector3(-5, 0, 0); // Moving left (away from B)
      
      const posB = new THREE.Vector3(1, 0, 0); // To the right of A
      const velB = new THREE.Vector3(5, 0, 0); // Moving right (away from A)
      
      const { velA: newVelA, velB: newVelB } = calculateElasticCollision(
        posA, velA, 1,
        posB, velB, 1,
        1.0
      );
      
      // Velocities should remain unchanged when moving apart
      expect(newVelA.x).toBeCloseTo(velA.x);
      expect(newVelB.x).toBeCloseTo(velB.x);
    });
  });
  
  describe('SpatialGrid', () => {
    it('should add objects to correct cells', () => {
      const grid = new SpatialGrid(10);
      
      const obj1 = { id: 1, position: new THREE.Vector3(5, 5, 5), radius: 1 };
      const obj2 = { id: 2, position: new THREE.Vector3(15, 15, 15), radius: 1 };
      
      grid.add(obj1);
      grid.add(obj2);
      
      expect(grid.grid.size).toBeGreaterThan(0);
    });
    
    it('should find nearby objects', () => {
      const grid = new SpatialGrid(10);
      
      const obj1 = { id: 1, position: new THREE.Vector3(5, 5, 5), radius: 1 };
      const obj2 = { id: 2, position: new THREE.Vector3(7, 5, 5), radius: 1 };
      const obj3 = { id: 3, position: new THREE.Vector3(50, 50, 50), radius: 1 };
      
      grid.add(obj1);
      grid.add(obj2);
      grid.add(obj3);
      
      const nearby = grid.getNearby(new THREE.Vector3(5, 5, 5), 5);
      
      // Should find obj1 and obj2, but not obj3
      expect(nearby.length).toBeGreaterThanOrEqual(2);
      expect(nearby.some(obj => obj.id === 3)).toBe(false);
    });
    
    it('should detect collision pairs efficiently', () => {
      const grid = new SpatialGrid(10);
      
      const objects = [
        { id: 1, position: new THREE.Vector3(0, 0, 0), radius: 3 },
        { id: 2, position: new THREE.Vector3(4, 0, 0), radius: 3 }, // Colliding with 1
        { id: 3, position: new THREE.Vector3(50, 50, 50), radius: 3 }, // Far away
      ];
      
      const pairs = grid.getCollisionPairs(objects);
      
      expect(pairs.length).toBe(1);
      expect(pairs[0][0].id).toBe(1);
      expect(pairs[0][1].id).toBe(2);
    });
    
    it('should handle empty grid gracefully', () => {
      const grid = new SpatialGrid(10);
      const pairs = grid.getCollisionPairs([]);
      expect(pairs.length).toBe(0);
    });
    
    it('should not create duplicate pairs', () => {
      const grid = new SpatialGrid(10);
      
      const objects = [
        { id: 1, position: new THREE.Vector3(0, 0, 0), radius: 5 },
        { id: 2, position: new THREE.Vector3(3, 0, 0), radius: 5 },
        { id: 3, position: new THREE.Vector3(6, 0, 0), radius: 5 },
      ];
      
      const pairs = grid.getCollisionPairs(objects);
      
      // Should have unique pairs only
      const pairIds = pairs.map(([a, b]) => `${a.id}-${b.id}`);
      const uniqueIds = new Set(pairIds);
      expect(pairIds.length).toBe(uniqueIds.size);
    });
  });
  
  describe('separateOverlappingSpheres', () => {
    it('should separate overlapping spheres', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const posB = new THREE.Vector3(4, 0, 0);
      const radiusA = 3;
      const radiusB = 3;
      
      const { correctionA, correctionB } = separateOverlappingSpheres(posA, radiusA, posB, radiusB);
      
      // Spheres overlap by 2 units, so each should move 1 unit apart
      expect(correctionA.x).toBeCloseTo(-1);
      expect(correctionB.x).toBeCloseTo(1);
    });
    
    it('should not correct non-overlapping spheres', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const posB = new THREE.Vector3(10, 0, 0);
      const radiusA = 2;
      const radiusB = 2;
      
      const { correctionA, correctionB } = separateOverlappingSpheres(posA, radiusA, posB, radiusB);
      
      expect(correctionA.length()).toBe(0);
      expect(correctionB.length()).toBe(0);
    });
    
    it('should handle 3D separation', () => {
      const posA = new THREE.Vector3(0, 0, 0);
      const posB = new THREE.Vector3(3, 3, 3);
      const radiusA = 5;
      const radiusB = 5;
      
      const { correctionA, correctionB } = separateOverlappingSpheres(posA, radiusA, posB, radiusB);
      
      // Corrections should be opposite and equal magnitude
      expect(correctionA.length()).toBeCloseTo(correctionB.length());
      expect(correctionA.dot(correctionB)).toBeLessThan(0); // Opposite directions
    });
  });
});
