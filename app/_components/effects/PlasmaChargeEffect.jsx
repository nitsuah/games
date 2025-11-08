import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PlasmaChargeEffect - Expanding energy ball during charge-up
 * 
 * @param {Object} props
 * @param {THREE.Vector3} props.position - Charge position
 * @param {number} props.chargeProgress - Charge progress 0-1
 * @param {Function} props.onComplete - Callback when charge completes
 */
const PlasmaChargeEffect = ({ position, chargeProgress, onComplete }) => {
  const meshRef = useRef();
  const particlesRef = useRef();
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Scale based on charge progress
    const scale = 0.5 + chargeProgress * 1.5;
    meshRef.current.scale.setScalar(scale);
    
    // Rotation
    meshRef.current.rotation.x += 0.1;
    meshRef.current.rotation.y += 0.15;
    
    // Particle system expansion
    if (particlesRef.current) {
      particlesRef.current.scale.setScalar(scale * 1.2);
      particlesRef.current.rotation.y -= 0.05;
    }
    
    // Complete when fully charged
    if (chargeProgress >= 1 && onComplete) {
      onComplete();
    }
  });
  
  // Particle positions
  const particleCount = 20;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 1 + Math.random() * 0.5;
    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  
  return (
    <group position={position}>
      {/* Core charging sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ff00ff"
          transparent
          opacity={0.6 + chargeProgress * 0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#ff44ff"
          transparent
          opacity={0.2 + chargeProgress * 0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Swirling particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ff00ff"
          size={0.2}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Point light */}
      <pointLight
        color="#ff00ff"
        intensity={1 + chargeProgress * 2}
        distance={15}
        decay={2}
      />
    </group>
  );
};

export default PlasmaChargeEffect;
