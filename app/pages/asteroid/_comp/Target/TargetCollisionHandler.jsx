import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { now } from '@/utils/time';
import { splitTarget } from './splitTarget';

const MIN_ALIVE_TIME = 2;

const TargetCollisionHandler = ({ targets, setTargets }) => {
  useFrame(() => {
    const currentTime = now();
    setTargets((prevTargets) => {
      let updatedTargets = [...prevTargets];
      let newTargets = [];

      for (let i = 0; i < updatedTargets.length; i++) {
        const targetA = updatedTargets[i];
        if (targetA.isHit || (currentTime - (targetA.spawnTime || 0) < MIN_ALIVE_TIME)) continue;

        const sphereA = new THREE.Sphere(
          new THREE.Vector3(targetA.x, targetA.y, targetA.z),
          targetA.size / 2
        );

        for (let j = i + 1; j < updatedTargets.length; j++) {
          const targetB = updatedTargets[j];
          if (
            targetB.isHit ||
            (currentTime - (targetB.spawnTime || 0) < MIN_ALIVE_TIME)
          )
            continue;

          const sphereB = new THREE.Sphere(
            new THREE.Vector3(targetB.x, targetB.y, targetB.z),
            targetB.size / 2
          );

          if (sphereA.intersectsSphere(sphereB)) {
            updatedTargets = updatedTargets.filter(
              (t) => t.id !== targetA.id && t.id !== targetB.id
            );

            // Use the shared splitTarget utility
            newTargets.push(
              ...splitTarget(targetA, now),
              ...splitTarget(targetB, now)
            );
            break;
          }
        }
      }

      return [...updatedTargets, ...newTargets];
    });
  });

  return null;
};

export default TargetCollisionHandler;
