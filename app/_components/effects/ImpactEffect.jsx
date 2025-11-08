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
  const duration = type === 'explosion' ? 500 : 350; // ms - increased duration for better visibility
  
  // Scale effects based on damage dealt - increased multiplier
  const scale = useMemo(() => Math.min(Math.max(damage / 8, 0.8), 4), [damage]);
  
  // Spark configuration - increased particle count and speed
  const sparkConfig = useMemo(() => {
    const count = type === 'explosion' ? 30 : 20;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      // Random direction for sparks
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = (0.8 + Math.random() * 2.0) * scale;
      
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
      
      // Fade out sparks - enhanced visibility
      sparkGroupRef.current.material.opacity = (1 - progress) * 1.0;
      sparkGroupRef.current.material.size = 0.25 * scale * (1 - progress * 0.4);
    }

    // Animate shockwave (for explosion type) - more prominent
    if (type === 'explosion' && shockwaveRef.current) {
      const waveScale = 0.5 + progress * 5;
      shockwaveRef.current.scale.set(waveScale * scale, waveScale * scale, waveScale * scale);
      shockwaveRef.current.material.opacity = (1 - progress) * 0.6;
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
          size={0.25 * scale}
          transparent
          opacity={1.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>

      {/* Central flash - larger and brighter */}
      <mesh>
        <sphereGeometry args={[0.4 * scale, 8, 8]} />
        <meshBasicMaterial
          color={type === 'explosion' ? 0xff4400 : 0xffffff}
          transparent
          opacity={(1 - (Date.now() - startTime.current) / duration) * 1.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.6 * scale, 8, 8]} />
        <meshBasicMaterial
          color={type === 'explosion' ? 0xff8800 : 0xffff00}
          transparent
          opacity={(1 - (Date.now() - startTime.current) / duration) * 0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Shockwave ring (only for explosions) - thicker and brighter */}
      {type === 'explosion' && (
        <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3 * scale, 0.6 * scale, 32]} />
          <meshBasicMaterial
            color={0xff8800}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Point light for scene illumination */}
      <pointLight
        color={type === 'explosion' ? '#ff4400' : '#ffff00'}
        intensity={3 * scale}
        distance={10 * scale}
        decay={2}
      />
    </group>
  );
};

export default ImpactEffect;
