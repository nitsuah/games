import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Target = ({ position, targetId, isHit, onHit, size = 10, color = '#00ff00', speed = 1, refCallback }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [rotationSpeed] = useState(() => Math.random() * 0.02 - 0.01);
  const movementSpeed = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  ));
  const [bounds] = useState(() => ({
    min: new THREE.Vector3(-100, -100, -100),
    max: new THREE.Vector3(100, 100, 100),
  }));

  useEffect(() => {
    if (refCallback) {
      refCallback(targetId, meshRef); // Pass the meshRef to the parent
    }
  }, [targetId, refCallback]);

  useEffect(() => {
    if (isHit && meshRef.current) {
      const scaleDown = () => {
        if (meshRef.current && meshRef.current.scale.x > 0) {
          meshRef.current.scale.x -= 0.1;
          meshRef.current.scale.y -= 0.1;
          meshRef.current.scale.z -= 0.1;
          requestAnimationFrame(scaleDown);
        }
      };
      scaleDown();
    }
  }, [isHit]);

  useFrame(() => {
    if (meshRef.current && !isHit) {
      // Log the speed for debugging
      console.log(`Target ID: ${targetId}, Speed: ${speed}`);
  
      // Rotate the target
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed;
  
      // Dynamically scale movement speed by the current speed property
      const scaledMovement = movementSpeed.current.clone().multiplyScalar(speed);
      meshRef.current.position.add(scaledMovement);
  
      // Bounce off boundaries
      if (
        meshRef.current.position.x < bounds.min.x ||
        meshRef.current.position.x > bounds.max.x
      ) {
        movementSpeed.current.x *= -1;
      }
      if (
        meshRef.current.position.y < bounds.min.y ||
        meshRef.current.position.y > bounds.max.y
      ) {
        movementSpeed.current.y *= -1;
      }
      if (
        meshRef.current.position.z < bounds.min.z ||
        meshRef.current.position.z > bounds.max.z
      ) {
        movementSpeed.current.z *= -1;
      }
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (!isHit && onHit) {
      onHit(targetId);
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[size, size, size]}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={isHit ? '#808080' : hovered ? '#ffaa00' : color} // Grey for hit targets
        metalness={0.5}
        roughness={0.2}
        transparent={isHit}
        opacity={isHit ? 0.2 : 1} // Semi-transparent when hit
      />
    </mesh>
  );
};

export default Target;