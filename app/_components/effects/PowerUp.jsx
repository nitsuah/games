import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PowerUp = ({ position, type, onCollect }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const collected = useRef(false); // Track if the power-up has been collected

  // Determine color based on type
  const getColorByType = (type) => {
    switch (type) {
      case 'health':
        return 'green';
      case 'shield':
        return 'blue';
      case 'rapidFire':
        return 'red';
      case 'slowMotion':
        return 'purple';
      case 'invincibility':
        return 'yellow';
      default:
        return 'white'; // Default color for unknown types
    }
  };

  useFrame(({ camera, clock }) => {
    if (collected.current || !meshRef.current) return;

    // pulse the emissive intensity on the material to create a glow
    if (materialRef.current) {
      const t = clock.getElapsedTime();
      materialRef.current.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 2)) * 0.9;
    }

    // Create a bounding sphere for the player
    const playerSphere = new THREE.Sphere(camera.position.clone(), 1.5); // Adjust radius as needed

    // Create a bounding sphere for the power-up
    const powerUpSphere = new THREE.Sphere(
      meshRef.current.position.clone(),
      2.5 // Larger radius for easier collection
    );

    // Check for collision
    if (playerSphere.intersectsSphere(powerUpSphere)) {
      collected.current = true; // Mark as collected
      if (onCollect) onCollect(type); // Apply the power-up effect
      meshRef.current.visible = false; // Hide the power-up
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1.5, 32, 32]} /> {/* Larger sphere size */}
      {/*
        Pulse emissive intensity to make the power-up more visible and lively.
        We animate emissiveIntensity on the material every frame using useFrame.
      */}
      <meshStandardMaterial
        ref={materialRef}
        color={getColorByType(type)}
        emissive={getColorByType(type)}
        emissiveIntensity={1}
      />
    </mesh>
  );
};

export default PowerUp;
