import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { now } from '@/utils/time';

const MIN_ALIVE_TIME = 2; // Increased from 0.5 to 1.5 seconds

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
            // Remove both targets from the array
            updatedTargets = updatedTargets.filter(
              (t) => t.id !== targetA.id && t.id !== targetB.id
            );

            // Split both targets into smaller fragments
            const splitTargets = [targetA, targetB].flatMap((target) => {
              if (target.size > 1) {
                const newSize = target.size * 0.5;
                const newSpeed = target.speed * 2;
                const newColor =
                  newSize > 4 ? '#0000ff' :
                  newSize > 3 ? '#800080' :
                  newSize > 2 ? '#ff4500' :
                  newSize > 1 ? '#00ffff' :
                  '#ffff00';
                const offsetRange = 1.0;
                const spawnTime = now();
                return [
                  {
                    id: `${target.id}-1`,
                    x: target.x + Math.random() * offsetRange - offsetRange / 2,
                    y: target.y + Math.random() * offsetRange - offsetRange / 2,
                    z: target.z + Math.random() * offsetRange - offsetRange / 2,
                    isHit: false,
                    size: newSize,
                    speed: newSpeed,
                    color: newColor,
                    spawnTime,
                  },
                  {
                    id: `${target.id}-2`,
                    x: target.x + Math.random() * offsetRange - offsetRange / 2,
                    y: target.y + Math.random() * offsetRange - offsetRange / 2,
                    z: target.z + Math.random() * offsetRange - offsetRange / 2,
                    isHit: false,
                    size: newSize,
                    speed: newSpeed,
                    color: newColor,
                    spawnTime,
                  },
                ];
              }
              return [];
            });

            newTargets.push(...splitTargets);
            break; // Only handle one collision per frame per target
          }
        }
      }

      return [...updatedTargets, ...newTargets];
    });
  });

  return null; // This component doesn't render anything
};

export default TargetCollisionHandler;
