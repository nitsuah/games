import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CollisionDetection = ({ targets, setTargets, setHealth, onPlayerHit }) => {
  const { camera } = useThree();

  useFrame(() => {
    const playerSphere = new THREE.Sphere(camera.position.clone(), 2.0);

    setTargets((prevTargets) =>
      prevTargets.map((target) => {
        if (!target.isHit) {
          const targetSphere = new THREE.Sphere(
            new THREE.Vector3(target.x, target.y, target.z),
            target.size / 2
          );

          if (playerSphere.intersectsSphere(targetSphere)) {
            console.log('Player Collision detected with target:', target.id);
            onPlayerHit(); // Call the onPlayerHit callback
            return { ...target, isHit: true };
          }
        }
        return target;
      })
    );
  });

  return null;
};

export default CollisionDetection;
