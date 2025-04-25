import React from 'react';
import * as THREE from 'three';

const LaserBeam = ({ lasers, weaponType, thickness = 1, glowIntensity = 0.8, offset = new THREE.Vector3(0, -5, 0) }) => {
  if (!Array.isArray(lasers) || lasers.length === 0) return null; // Ensure lasers is an array

  // Determine the laser color based on the weapon type
  const getLaserColor = () => {
    switch (weaponType) {
      case 'spread':
        return 'red';
      case 'laser':
        return 'cyan';
      case 'explosive':
        return 'orange';
      default:
        return 'white';
    }
  };

  const laserColor = getLaserColor();

  console.debug("Rendering lasers with color:", laserColor); // Debugging laser color

  return (
    <>
      {lasers.map((laser, index) => {
        // Offset the starting position to ensure visibility
        const adjustedFrom = laser.from.clone().add(offset);
        const distance = adjustedFrom.distanceTo(laser.to); // Calculate distance between adjustedFrom and to

        // Skip rendering if the distance is less than 1
        if (distance < 1) {
          console.debug(`Skipping laser ${index} due to short distance: ${distance}`);
          return null;
        }

        const direction = new THREE.Vector3().subVectors(laser.to, adjustedFrom).normalize(); // Calculate direction

        // Calculate rotation to align the cylinder with the direction vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), // Default cylinder direction (up)
          direction // Target direction
        );

        return (
          <mesh
            key={index}
            position={adjustedFrom.clone().add(laser.to).multiplyScalar(0.5)} // Position at the midpoint
            quaternion={quaternion} // Apply rotation
          >
            <cylinderGeometry
              args={[
                thickness / 2, // Radius at the start
                thickness / 2.5, // Radius at the end
                distance, // Height of the cylinder
                16, // Radial segments
              ]}
            />
            <meshStandardMaterial
              color={laserColor}
              emissive={laserColor}
              emissiveIntensity={glowIntensity} // Add glow effect
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </>
  );
};

export default LaserBeam;
