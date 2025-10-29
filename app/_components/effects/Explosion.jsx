import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const Explosion = ({ position, explosionRadius = 20, onComplete }) => {
  const meshRef = useRef();
  const [scale, setScale] = useState(0.1); // Start small
  const [opacity, setOpacity] = useState(0.8); // Start semi-transparent
  const [exploded, setExploded] = useState(false); // Track if fully exploded

  useFrame(() => {
    if (meshRef.current && !exploded) {
      if (scale < explosionRadius * 2) {
        setScale((prev) => prev + explosionRadius * 0.015); // Even slower growth (was 0.025) - slower animation
        setOpacity((prev) => Math.max(prev - 0.003, 0)); // Even slower fade (was 0.005) - stays visible longer
      } else {
        setExploded(true); // Mark as fully exploded
        setScale(0); // Reset scale to 0
        onComplete(); // Notify parent when the explosion animation is complete
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={[scale, scale, scale]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="orange" transparent opacity={opacity} />
    </mesh>
  );
};

export default Explosion;
