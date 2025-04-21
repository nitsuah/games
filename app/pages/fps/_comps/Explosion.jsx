import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Explosion = ({ position, onComplete }) => {
  const meshRef = useRef();
  const scale = useRef(0.1);

  useFrame(() => {
    if (meshRef.current) {
      scale.current += 0.1;
      meshRef.current.scale.set(scale.current, scale.current, scale.current);
      if (scale.current > 2) {
        onComplete(); // Notify parent when the explosion animation is complete
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="orange" transparent opacity={0.8} />
    </mesh>
  );
};

export default Explosion;
