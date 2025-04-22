import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Decal = ({ position, playerPosition }) => {
  const meshRef = useRef();
  const opacity = useRef(1); // Start fully visible
  const scale = useRef(1); // Start with a default size

  useFrame(() => {
    if (meshRef.current) {
      // Calculate distance from the player
      const distance = new THREE.Vector3(...playerPosition).distanceTo(position);

      // Adjust size based on distance (closer = larger, further = smaller)
      const sizeFactor = Math.max(1 / (distance * 0.1), 0.5); // Cap minimum size at 0.5
      scale.current = sizeFactor;

      // Gradually fade out
      opacity.current = Math.max(opacity.current - 0.01, 0); // Fade out more slowly
      meshRef.current.material.opacity = opacity.current;
      meshRef.current.scale.set(scale.current, scale.current, scale.current);

      // Remove the decal when fully faded
      if (opacity.current <= 0) {
        meshRef.current.visible = false;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.2, 32, 32]} /> {/* Default size */}
      <meshStandardMaterial
        color="black"
        transparent
        opacity={opacity.current}
        depthWrite={false} // Prevent z-fighting
      />
    </mesh>
  );
};

export default Decal;
