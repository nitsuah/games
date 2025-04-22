import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Target = ({
  position,
  targetId,
  isHit,
  onHit,
  size = 10,
  color = '#00ff00',
  setTargets,
  refCallback,
  speed = 1,
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [rotationSpeed] = useState(() => Math.random() * 0.02 - 0.01);
  const movementSpeed = useRef(
    new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    )
  );
  const [bounds] = useState(() => ({
    min: new THREE.Vector3(-50, -50, -50),
    max: new THREE.Vector3(50, 50, 50),
  }));

  useEffect(() => {
    if (refCallback) {
      refCallback(targetId, meshRef); // Pass the meshRef to the parent
    }
  }, [targetId, refCallback]);

  useEffect(() => {
    if (isHit) {
      setFlash(true);
      setOpacity(1);
      // Flash white, then fade out
      setTimeout(() => setFlash(false), 80);
      setTimeout(() => setOpacity(0.2), 120);
    } else {
      setOpacity(1);
    }
  }, [isHit]);

  useFrame(({ camera }) => {
    const playerSphere = new THREE.Sphere(camera.position.clone(), 1); // Use camera position

    if (meshRef.current && !isHit) {
      // Dynamically scale movement speed by the current speed property
      const scaledMovement = movementSpeed.current.clone().multiplyScalar(speed);
      meshRef.current.position.add(scaledMovement);
  
      // Update the target's position in the state
      const { x, y, z } = meshRef.current.position;
      setTargets((prevTargets) =>
        prevTargets.map((target) =>
          target.id === targetId ? { ...target, x, y, z } : target
        )
      );
  
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

    // Create a sphere for the target
    const targetSphere = new THREE.Sphere(
      new THREE.Vector3(meshRef.current.position.x, meshRef.current.position.y, meshRef.current.position.z), // Use updated positions
      size / 2
    );
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
        color={
          isHit
            ? flash
              ? '#ffffff'
              : '#808080'
            : hovered
            ? '#ffaa00'
            : color
        }
        metalness={0.5}
        roughness={0.2}
        transparent={true}
        opacity={opacity}
      />
    </mesh>
  );
};

export default Target;