import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CollisionDetection = ({ targets, setTargets, setHealth, onPlayerHit, isGameOver, shieldActive, setShieldActive }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (isGameOver) {
      console.debug('CollisionDetection stopped because the game is over.');
      return; // Prevent updates when the game is over
    }

    const playerSphere = new THREE.Sphere(camera.position.clone(), 2.0);

    setTargets((prevTargets) => {
      let hasChanged = false; // Track if any target state has changed

      const updatedTargets = prevTargets.map((target) => {
        if (!target.isHit) {
          const targetSphere = new THREE.Sphere(
            new THREE.Vector3(target.x, target.y, target.z),
            target.size / 2
          );

          if (playerSphere.intersectsSphere(targetSphere)) {
            console.debug('Player Collision detected with target:', target.id);

            console.log(`Player hit by target: ${target.id}, emitting playerCollision event.`);
            window.dispatchEvent(new Event('playerCollision')); // Emit custom event
            onPlayerHit(target.size); // Call the onPlayerHit callback
            hasChanged = true;
            return { ...target, isHit: true };
          }
        }
        return target;
      });
      return hasChanged ? updatedTargets : prevTargets; // Only update state if changes occurred
    });
  });

  return null;
};

export default CollisionDetection;
