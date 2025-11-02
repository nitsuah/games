import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Enhanced Explosion Effect
 * Multi-layered explosion with fire sphere, shockwave, and debris particles
 */
const Explosion = ({ position, explosionRadius = 20, onComplete }) => {
  const fireRef = useRef();
  const shockwaveRef = useRef();
  const debrisRef = useRef();
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(0.9);
  const [exploded, setExploded] = useState(false);
  
  // Debris particle system
  const debrisConfig = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = (0.3 + Math.random() * 0.5) * (explosionRadius / 20);
      
      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed * 0.8 + 0.2, // Slight upward bias
        z: Math.cos(phi) * speed,
      });
      
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    
    return { count, positions, velocities };
  }, [explosionRadius]);

  useFrame(() => {
    if (fireRef.current && !exploded) {
      const growthSpeed = explosionRadius * 0.018;
      const fadeSpeed = 0.004;
      
      if (scale < explosionRadius * 2) {
        setScale((prev) => prev + growthSpeed);
        setOpacity((prev) => Math.max(prev - fadeSpeed, 0));
        
        // Animate shockwave ring
        if (shockwaveRef.current) {
          const waveProgress = scale / (explosionRadius * 2);
          shockwaveRef.current.scale.setScalar(scale * 0.8);
          shockwaveRef.current.material.opacity = (1 - waveProgress) * 0.6;
        }
        
        // Animate debris particles
        if (debrisRef.current) {
          const positions = debrisRef.current.geometry.attributes.position.array;
          const progress = scale / (explosionRadius * 2);
          
          for (let i = 0; i < debrisConfig.count; i++) {
            const vel = debrisConfig.velocities[i];
            positions[i * 3] = vel.x * progress * 3;
            positions[i * 3 + 1] = vel.y * progress * 3 - progress * progress * 0.5; // Gravity
            positions[i * 3 + 2] = vel.z * progress * 3;
          }
          
          debrisRef.current.geometry.attributes.position.needsUpdate = true;
          debrisRef.current.material.opacity = (1 - progress) * 0.8;
        }
      } else {
        setExploded(true);
        setScale(0);
        onComplete();
      }
    }
  });

  return (
    <group position={position}>
      {/* Main fire sphere - orange/red gradient */}
      <mesh ref={fireRef} scale={[scale, scale, scale]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Inner bright core */}
      <mesh scale={[scale * 0.6, scale * 0.6, scale * 0.6]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial
          color="#ffff88"
          transparent
          opacity={opacity * 1.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Shockwave ring */}
      <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial
          color="#ff8844"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Debris particles */}
      <points ref={debrisRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={debrisConfig.count}
            array={debrisConfig.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#994400"
          size={0.2 * (explosionRadius / 20)}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Dynamic point light for scene illumination */}
      <pointLight
        color="#ff6600"
        intensity={Math.min(scale * 0.5, 5)}
        distance={explosionRadius * 2}
        decay={2}
      />
    </group>
  );
};

export default Explosion;
