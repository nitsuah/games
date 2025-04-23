import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const Explosion = ({ position, explosionRadius = 20, onComplete }) => {
  const meshRef = useRef();
  const [scale, setScale] = useState(0.1); // Start small
  const [opacity, setOpacity] = useState(0.8); // Start semi-transparent
  const [exploded, setExploded] = useState(false); // Track if fully exploded

  useFrame(() => {
    if (meshRef.current && !exploded) {
      if (scale < explosionRadius * 2) {
        setScale((prev) => prev + explosionRadius * 0.1); // Gradually grow to match the explosion diameter
        setOpacity((prev) => Math.max(prev - 0.02, 0)); // Gradually fade out
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
