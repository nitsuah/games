import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Target = ({ position, targetId, onHit }) => {
  const meshRef = useRef();
  const [isHit, setIsHit] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [rotationSpeed] = useState(() => Math.random() * 0.02 - 0.01);
  const [size] = useState(() => Math.random() * 0.5 + 0.5);
  const [movementSpeed] = useState(() => new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  ));
  const [bounds] = useState(() => ({
    min: new THREE.Vector3(-10, -10, -10),
    max: new THREE.Vector3(10, 10, 10)
  }));

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.isTarget = true;
      meshRef.current.userData.targetId = targetId;
      meshRef.current.userData.isHit = false;
    }
  }, [targetId]);

  useFrame(() => {
    if (meshRef.current && !isHit) {
      // Rotate the target
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed;

      // Move the target
      meshRef.current.position.add(movementSpeed);

      // Bounce off boundaries
      if (meshRef.current.position.x < bounds.min.x || meshRef.current.position.x > bounds.max.x) {
        movementSpeed.x *= -1;
      }
      if (meshRef.current.position.y < bounds.min.y || meshRef.current.position.y > bounds.max.y) {
        movementSpeed.y *= -1;
      }
      if (meshRef.current.position.z < bounds.min.z || meshRef.current.position.z > bounds.max.z) {
        movementSpeed.z *= -1;
      }
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (!isHit) {
      setIsHit(true);
      meshRef.current.userData.isHit = true;
      onHit(targetId);
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
      scale={[size, size, size]}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={isHit ? '#ff0000' : hovered ? '#ffaa00' : '#00ff00'}
        metalness={0.5}
        roughness={0.2}
        transparent={isHit}
        opacity={isHit ? 0.5 : 1}
      />
    </mesh>
  );
};

export default Target; 