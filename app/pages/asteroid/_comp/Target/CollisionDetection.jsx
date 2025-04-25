import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { splitTarget } from './splitTarget';
import { PLAYER_SPHERE_RADIUS } from '../config';

const CollisionDetection = ({ targets, setTargets, setHealth, onPlayerHit, isGameOver, shieldActive, setShieldActive }) => {
  const { camera } = useThree();

  useFrame(() => {
    if (isGameOver) {
      console.debug('CollisionDetection stopped because the game is over.');
      return; // Prevent updates when the game is over
    }

    const playerSphere = new THREE.Sphere(camera.position.clone(), PLAYER_SPHERE_RADIUS);

    setTargets((prevTargets) => {
      let hasChanged = false;

      const updatedTargets = prevTargets.reduce((acc, target) => {
        if (!target.isHit) {
          const targetSphere = new THREE.Sphere(
            new THREE.Vector3(target.x, target.y, target.z),
            target.size / 2
          );

          if (playerSphere.intersectsSphere(targetSphere)) {
            console.debug('Player Collision detected with target:', target.id);

            if (target.size > 1) {
              acc.push(...splitTarget(target));
            } else {
              onPlayerHit(target.size);
            }

            hasChanged = true;
            return acc; // Do not add the original target
          }
        }
        acc.push(target);
        return acc;
      }, []);
      return hasChanged ? updatedTargets : prevTargets;
    });
  });

  return null;
};

export default CollisionDetection;
