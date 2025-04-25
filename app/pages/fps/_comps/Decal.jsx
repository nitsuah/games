import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Decal = ({ position, playerPosition }) => {
  const meshRef = useRef();
  const opacity = useRef(1); // Start fully visible
  const scale = useRef(2); // Start with a larger default size

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (meshRef.current) {
        meshRef.current.visible = false; // Hide the decal
      }
    }, 5000); // Destroy after 5 seconds

    return () => clearTimeout(timeout); // Cleanup timeout
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      // Calculate direction from the decal to the player
      const directionToPlayer = new THREE.Vector3(...playerPosition).sub(position).normalize();

      // Adjust rotation to tilt toward the player
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1), // Default forward vector
        directionToPlayer
      );
      meshRef.current.quaternion.copy(quaternion);

      // Gradually fade out
      opacity.current = Math.max(opacity.current - 0.1, 0); // Fade out more slowly
      meshRef.current.material.opacity = opacity.current;

      // Remove the decal when fully faded
      if (opacity.current <= 0) {
        meshRef.current.visible = false;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <circleGeometry args={[1, 32]} /> {/* Circular geometry */}
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
