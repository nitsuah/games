import * as THREE from 'three';

const LaserBeam = ({ lasers, weaponType, thickness = 1, glowIntensity = 0.8, offset = new THREE.Vector3(0, -5, 0) }) => {
  if (!Array.isArray(lasers) || lasers.length === 0) return null;

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

  return (
    <>
      {lasers.map((laser, index) => {
        const adjustedFrom = laser.from.clone().add(offset);
        const distance = adjustedFrom.distanceTo(laser.to);
        if (distance < 1) return null;

        const direction = new THREE.Vector3().subVectors(laser.to, adjustedFrom).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        // If laser has a 'speed' field, render it as a segmented fading trail to simulate a particle trail
        const segments = laser.speed ? Math.max(3, Math.floor(laser.speed * 6)) : 1;
        if (segments > 1) {
          const segLength = distance / segments;
          return (
            <group key={index} position={adjustedFrom.clone()} quaternion={quaternion}>
              {Array.from({ length: segments }).map((_, sIdx) => {
                const t = sIdx / segments; // 0..1 along the beam
                const segPos = direction.clone().multiplyScalar(segLength * (sIdx + 0.5));
                const segOpacity = Math.max(0.05, 0.9 * (1 - t));
                const segScale = 1 - t * 0.6;
                return (
                  <mesh key={sIdx} position={segPos}>
                    <cylinderGeometry args={[thickness / 2 * segScale, thickness / 4 * segScale, segLength, 8]} />
                    <meshStandardMaterial
                      color={laserColor}
                      emissive={laserColor}
                      emissiveIntensity={glowIntensity * segScale}
                      transparent
                      opacity={segOpacity}
                    />
                  </mesh>
                );
              })}
            </group>
          );
        }

        return (
          <mesh key={index} position={adjustedFrom.clone().add(laser.to).multiplyScalar(0.5)} quaternion={quaternion}>
            <cylinderGeometry args={[thickness / 2, thickness / 4, distance, 16]} />
            <meshStandardMaterial color={laserColor} emissive={laserColor} emissiveIntensity={glowIntensity} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

export default LaserBeam;
