import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const ShieldEffect = ({ shieldActive }) => {
  const shieldRef = useRef();

  useFrame(({ camera, clock }) => {
    if (shieldRef.current && shieldActive) {
      shieldRef.current.position.copy(camera.position);
      // Gentle pulsing scale instead of constant spinning
      const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.08;
      shieldRef.current.scale.setScalar(scale);
      // Slow rotation
      shieldRef.current.rotation.y = clock.elapsedTime * 0.3;
    }
  });

  if (!shieldActive || shieldActive === 0 || shieldActive === false) return null;

  return (
    <mesh ref={shieldRef}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial 
        color="#00ffff" 
        transparent 
        opacity={0.35}
        emissive="#00ffff" 
        emissiveIntensity={0.4}
        wireframe={false}
        side={2}
      />
    </mesh>
  );
};

export default ShieldEffect;
