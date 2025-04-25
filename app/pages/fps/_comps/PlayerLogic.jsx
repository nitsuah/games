import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const PlayerLogic = ({ onPositionChange }) => {
  const meshRef = useRef(); // Blue square (hitbox)
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      // Update the hitbox position to match the camera's position
      const offset = new THREE.Vector3(0, -1, 0); // Offset hitbox slightly below the camera
      meshRef.current.position.copy(camera.position).add(offset);

      // Update the hitbox rotation to match the camera's rotation
      meshRef.current.quaternion.copy(camera.quaternion);

      // Notify parent of the updated position
      if (onPositionChange) {
        onPositionChange(camera.position.toArray());
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export default PlayerLogic;
