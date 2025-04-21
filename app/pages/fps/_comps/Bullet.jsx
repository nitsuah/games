import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Bullet = ({ start, end, onComplete }) => {
  const meshRef = useRef();
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const speed = 0.5; // Bullet speed
  const distance = new THREE.Vector3().subVectors(end, start).length();
  const traveled = useRef(0);

  useFrame(() => {
    if (meshRef.current) {
      traveled.current += speed;
      if (traveled.current >= distance) {
        onComplete(); // Notify parent when the bullet reaches the target
        return;
      }
      meshRef.current.position.addScaledVector(direction, speed);
    }
  });

  return (
    <mesh ref={meshRef} position={start}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
};

export default Bullet;
