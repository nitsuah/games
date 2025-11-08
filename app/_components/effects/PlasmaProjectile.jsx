import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PlasmaProjectile - Floating plasma ball that travels in a direction
 * 
 * @param {Object} props
 * @param {THREE.Vector3} props.position - Starting position
 * @param {THREE.Vector3} props.direction - Travel direction (normalized)
 * @param {number} props.speed - Travel speed (default: 0.8)
 * @param {Function} props.onComplete - Callback when projectile expires or hits
 * @param {number} props.maxDistance - Max travel distance (default: 150)
 */
const PlasmaProjectile = ({ 
  position, 
  direction, 
  speed = 0.8, 
  onComplete,
  maxDistance = 150 
}) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const startTime = useRef(Date.now());
  const traveledDistance = useRef(0);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() - startTime.current;
    const distance = speed * delta * 60;
    traveledDistance.current += distance;
    
    // Move projectile
    meshRef.current.position.add(direction.clone().multiplyScalar(distance));
    
    // Pulsing effect
    const pulse = 1 + Math.sin(elapsed * 0.01) * 0.3;
    meshRef.current.scale.setScalar(pulse);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * 1.5);
    }
    
    // Rotation for visual interest
    meshRef.current.rotation.x += delta * 2;
    meshRef.current.rotation.y += delta * 3;
    
    // Check if max distance reached
    if (traveledDistance.current >= maxDistance) {
      onComplete();
    }
  });
  
  return (
    <group position={position}>
      {/* Core plasma ball */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial
          color="#ff00ff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial
          color="#ff44ff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Inner bright core */}
      <mesh scale={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Point light for scene illumination */}
      <pointLight
        color="#ff00ff"
        intensity={2}
        distance={20}
        decay={2}
      />
    </group>
  );
};

export default PlasmaProjectile;
