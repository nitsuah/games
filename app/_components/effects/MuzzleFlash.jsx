import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * MuzzleFlash - Weapon-specific muzzle flash effects
 * 
 * @param {Object} props
 * @param {THREE.Vector3} props.position - Flash position in 3D space
 * @param {string} props.weaponType - 'laser', 'spread', 'explosive', 'aa', or 'plasma'
 * @param {Function} props.onComplete - Callback when flash completes
 */
const MuzzleFlash = ({ position, weaponType = 'laser', onComplete }) => {
  const meshRef = useRef();
  const particlesRef = useRef();
  const startTime = useRef(Date.now());
  const duration = weaponType === 'laser' ? 100 : weaponType === 'spread' ? 150 : 200; // ms
  
  // Weapon-specific colors and configurations
  const config = useMemo(() => {
    switch (weaponType) {
      case 'laser':
        return {
          color: new THREE.Color(0x00ffff), // Cyan
          glowColor: new THREE.Color(0x00aaff),
          intensity: 2.5,
          size: 0.3,
          particleCount: 8,
          spread: 0.2,
        };
      case 'spread':
        return {
          color: new THREE.Color(0xffaa00), // Orange
          glowColor: new THREE.Color(0xff6600),
          intensity: 2.0,
          size: 0.4,
          particleCount: 12,
          spread: 0.4,
        };
      case 'explosive':
        return {
          color: new THREE.Color(0xff4444), // Red
          glowColor: new THREE.Color(0xff8800),
          intensity: 3.0,
          size: 0.5,
          particleCount: 16,
          spread: 0.3,
        };
      case 'aa':
        return {
          color: new THREE.Color(0x00ff00), // Green
          glowColor: new THREE.Color(0x88ff00),
          intensity: 2.5,
          size: 0.35,
          particleCount: 10,
          spread: 0.25,
        };
      case 'plasma':
        return {
          color: new THREE.Color(0xff00ff), // Magenta
          glowColor: new THREE.Color(0xff44ff),
          intensity: 3.5,
          size: 0.6,
          particleCount: 20,
          spread: 0.35,
        };
      default:
        return {
          color: new THREE.Color(0xffffff),
          glowColor: new THREE.Color(0xcccccc),
          intensity: 2.0,
          size: 0.3,
          particleCount: 8,
          spread: 0.2,
        };
    }
  }, [weaponType]);

  // Create particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(config.particleCount * 3);
    for (let i = 0; i < config.particleCount; i++) {
      const angle = (i / config.particleCount) * Math.PI * 2;
      const radius = Math.random() * config.spread;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * config.spread;
    }
    return positions;
  }, [config.particleCount, config.spread]);

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Flash intensity falloff (quick bright flash, then fade)
    const intensity = config.intensity * (1 - progress) * (1 - progress);
    
    // Main flash sphere
    if (meshRef.current) {
      meshRef.current.scale.setScalar(config.size * (1 + progress * 0.5));
      meshRef.current.material.opacity = intensity * 0.8;
    }

    // Particle system
    if (particlesRef.current) {
      particlesRef.current.material.opacity = intensity * 0.6;
      particlesRef.current.material.size = config.size * (1 + progress) * 0.5;
      
      // Expand particles outward
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < config.particleCount; i++) {
        const baseX = particlePositions[i * 3];
        const baseY = particlePositions[i * 3 + 1];
        const baseZ = particlePositions[i * 3 + 2];
        
        positions[i * 3] = baseX * (1 + progress * 2);
        positions[i * 3 + 1] = baseY * (1 + progress * 2);
        positions[i * 3 + 2] = baseZ * (1 + progress * 2);
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Main flash sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.size, 8, 8]} />
        <meshBasicMaterial
          color={config.color}
          transparent
          opacity={config.intensity * 0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Glow sphere */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[config.size, 8, 8]} />
        <meshBasicMaterial
          color={config.glowColor}
          transparent
          opacity={config.intensity * 0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Particle system */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={config.particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={config.color}
          size={config.size * 0.5}
          transparent
          opacity={config.intensity * 0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};

export default MuzzleFlash;
