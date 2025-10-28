import * as THREE from 'three';

const LaserBeam = ({
  lasers,
  weaponType,
  thickness = 1,
  glowIntensity = 0.8,
  offset = new THREE.Vector3(0, -5, 0),
}) => {
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
