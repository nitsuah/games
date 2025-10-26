import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ShieldEffect = ({ shieldActive }) => {
  const shieldRef = useRef();

  useFrame(({ camera, clock }) => {
    if (shieldRef.current && shieldActive) {
      // Position shield around camera (player)
      shieldRef.current.position.copy(camera.position);

      // Pulse animation
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.1;
      shieldRef.current.scale.setScalar(scale);

      // Rotate for dynamic effect
      shieldRef.current.rotation.y += 0.01;
    }
  });

  if (!shieldActive || shieldActive === 0 || shieldActive === false) {
    return null;
  }

  // Determine opacity based on shield hits remaining
  const opacity = typeof shieldActive === 'number' ? Math.min(0.7, 0.3 + shieldActive * 0.2) : 0.5;

  return (
    <mesh ref={shieldRef}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial
        color="#00ffff"
        transparent
        opacity={opacity}
        emissive="#00ffff"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
};

export default ShieldEffect;
