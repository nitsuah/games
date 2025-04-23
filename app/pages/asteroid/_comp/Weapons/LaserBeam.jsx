import React from 'react';

const LaserBeam = ({ from, to }) => {
  if (!from || !to) return null;

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="cyan" linewidth={20} />
    </line>
  );
};

export default LaserBeam;
