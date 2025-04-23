import React from 'react';

const LaserBeam = ({ lasers }) => {
  if (!Array.isArray(lasers) || lasers.length === 0) return null; // Ensure lasers is an array

  console.debug("Rendering lasers:", lasers); // Debugging laser positions

  return (
    <>
      {lasers.map((laser, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                laser.from.x,
                laser.from.y,
                laser.from.z,
                laser.to.x,
                laser.to.y,
                laser.to.z,
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="cyan" linewidth={25} /> {/* Increased thickness */}
        </line>
      ))}
    </>
  );
};

export default LaserBeam;
