import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ImpactEffect - Hit impact visual effects with sparks and shockwave
 * 
 * @param {Object} props
 * @param {THREE.Vector3} props.position - Impact position in 3D space
 * @param {number} [props.damage=1] - Damage dealt (scales effect size)
 * @param {string} [props.type='hit'] - Effect type: 'hit' (standard) or 'explosion' (shockwave)
 * @param {Function} props.onComplete - Callback when effect completes
 */
const ImpactEffect = ({ position, damage = 1, type = 'hit', onComplete }) => {
  const sparkGroupRef = useRef();
  const shockwaveRef = useRef();
  const startTime = useRef(Date.now());
  const duration = type === 'explosion' ? 400 : 250; // ms
  
  // Scale effects based on damage dealt
  const scale = useMemo(() => Math.min(Math.max(damage / 10, 0.5), 3), [damage]);
  
  // Spark configuration
  const sparkConfig = useMemo(() => {
    const count = type === 'explosion' ? 20 : 12;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      // Random direction for sparks
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = (0.5 + Math.random() * 1.5) * scale;
      
      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed,
      });
      
      // Start at origin
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    
    return { count, positions, velocities };
  }, [scale, type]);

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Animate sparks
    if (sparkGroupRef.current) {
      const positions = sparkGroupRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < sparkConfig.count; i++) {
        const vel = sparkConfig.velocities[i];
        positions[i * 3] = vel.x * progress * 2;
        positions[i * 3 + 1] = vel.y * progress * 2;
        positions[i * 3 + 2] = vel.z * progress * 2;
      }
      
      sparkGroupRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Fade out sparks
      sparkGroupRef.current.material.opacity = (1 - progress) * 0.9;
      sparkGroupRef.current.material.size = 0.15 * scale * (1 - progress * 0.5);
    }

    // Animate shockwave (for explosion type)
    if (type === 'explosion' && shockwaveRef.current) {
      const waveScale = 0.5 + progress * 4;
      shockwaveRef.current.scale.set(waveScale * scale, waveScale * scale, waveScale * scale);
      shockwaveRef.current.material.opacity = (1 - progress) * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Spark particles */}
      <points ref={sparkGroupRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparkConfig.count}
            array={sparkConfig.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={type === 'explosion' ? 0xff6600 : 0xffff00}
          size={0.15 * scale}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* Central flash */}
      <mesh>
        <sphereGeometry args={[0.2 * scale, 8, 8]} />
        <meshBasicMaterial
          color={type === 'explosion' ? 0xff4400 : 0xffffff}
          transparent
          opacity={(1 - (Date.now() - startTime.current) / duration) * 0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Shockwave ring (only for explosions) */}
      {type === 'explosion' && (
        <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4 * scale, 0.5 * scale, 32]} />
          <meshBasicMaterial
            color={0xff8800}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default ImpactEffect;
