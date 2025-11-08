import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ShellCasing - Ejected shell casings for shotgun/spread weapon
 * Physical shell casings that bounce and tumble
 * 
 * @param {Object} props
 * @param {THREE.Vector3} props.position - Ejection position
 * @param {THREE.Vector3} props.direction - Direction player is facing
 * @param {Function} props.onComplete - Callback when casing settles
 */
const ShellCasing = ({ position, direction, onComplete }) => {
  const meshRef = useRef();
  const startTime = useRef(Date.now());
  const duration = 2000; // 2 seconds lifetime
  
  // Calculate ejection velocity (to the right of firing direction)
  const initialState = useMemo(() => {
    const right = new THREE.Vector3();
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
    
    // Eject to the right and slightly backward
    const ejectionDir = right.clone()
      .multiplyScalar(0.8 + Math.random() * 0.4)
      .add(direction.clone().multiplyScalar(-0.2))
      .add(new THREE.Vector3(0, 0.3, 0)); // Slight upward component
    
    return {
      velocity: ejectionDir.multiplyScalar(0.05 + Math.random() * 0.03),
      angularVelocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ),
      rotation: new THREE.Euler(0, 0, 0),
    };
  }, [direction]);

  const state = useRef(initialState);

  useFrame((_, delta) => {
    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / duration;

    if (progress >= 1) {
      onComplete();
      return;
    }

    if (meshRef.current) {
      // Apply gravity
      state.current.velocity.y -= 0.0015 * (delta * 60);
      
      // Update position
      meshRef.current.position.x += state.current.velocity.x * (delta * 60);
      meshRef.current.position.y += state.current.velocity.y * (delta * 60);
      meshRef.current.position.z += state.current.velocity.z * (delta * 60);
      
      // Simple ground bounce (y = 0)
      if (meshRef.current.position.y < 0) {
        meshRef.current.position.y = 0;
        state.current.velocity.y *= -0.4; // Bounce with energy loss
        state.current.velocity.x *= 0.7; // Friction
        state.current.velocity.z *= 0.7;
        state.current.angularVelocity.multiplyScalar(0.6);
      }
      
      // Apply rotation
      state.current.rotation.x += state.current.angularVelocity.x * (delta * 60);
      state.current.rotation.y += state.current.angularVelocity.y * (delta * 60);
      state.current.rotation.z += state.current.angularVelocity.z * (delta * 60);
      meshRef.current.rotation.set(
        state.current.rotation.x,
        state.current.rotation.y,
        state.current.rotation.z
      );
      
      // Fade out in last 25% of lifetime
      if (progress > 0.75) {
        meshRef.current.material.opacity = (1 - progress) * 4;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* Cylindrical shell casing */}
      <cylinderGeometry args={[0.04, 0.05, 0.15, 8]} />
      <meshStandardMaterial
        color="#d4af37"
        metalness={0.8}
        roughness={0.3}
        transparent
        opacity={1}
      />
    </mesh>
  );
};

export default ShellCasing;
