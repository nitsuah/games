import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getGlobalParticlePool } from '@/lib/shared/physics/ObjectPool';

/**
 * Optimized hit particle burst using instanced meshes and object pooling.
 * Much more performant than individual meshes per particle.
 */
const PooledHitParticles = ({ position, color = '#00ff00', size = 1, count = 12, onComplete }) => {
  const meshRef = useRef();
  const particlesRef = useRef([]);
  const startTimeRef = useRef(Date.now());
  const duration = 600; // ms
  const matrixRef = useRef(new THREE.Matrix4());
  const pool = useMemo(() => getGlobalParticlePool(), []);
  
  // Initialize particles from pool
  useEffect(() => {
    const newParticles = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * 0.5;
      const speed = 8 + Math.random() * 4;
      
      const particle = pool.acquireParticle({
        position: [...position],
        velocity: [
          Math.cos(angle) * speed,
          elevation * speed * 2,
          Math.sin(angle) * speed,
        ],
        rotationSpeed: [(Math.random() - 0.5) * 10, 0, 0],
        maxLifetime: duration / 1000,
        scale: size * 0.4,
        color,
      });
      
      newParticles.push(particle);
    }
    
    particlesRef.current = newParticles;
    
    // Cleanup: return particles to pool when component unmounts
    return () => {
      particlesRef.current.forEach((p) => pool.release(p));
      particlesRef.current = [];
    };
  }, [position, color, size, count, duration, pool]);
  
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() - startTimeRef.current;
    const progress = elapsed / duration;
    
    if (progress >= 1) {
      if (onComplete) onComplete();
      return;
    }
    
    let visibleCount = 0;
    
    // Update each particle using pooled objects
    particlesRef.current.forEach((particle, i) => {
      if (!particle.active) return;
      
      // Apply velocity with damping
      const damping = 1 - progress * 0.7;
      particle.position[0] += particle.velocity[0] * delta * damping;
      particle.position[1] += particle.velocity[1] * delta * damping - delta * progress * 5; // Gravity
      particle.position[2] += particle.velocity[2] * delta * damping;
      
      // Update rotation
      particle.rotation[2] += particle.rotationSpeed[0] * delta;
      
      // Calculate scale and opacity
      const scale = (1 - progress) * particle.scale;
      const opacity = 1 - progress;
      
      if (opacity > 0) {
        // Update instance matrix
        matrixRef.current.makeRotationZ(particle.rotation[2]);
        matrixRef.current.setPosition(...particle.position);
        matrixRef.current.scale(new THREE.Vector3(scale, scale, scale));
        
        meshRef.current.setMatrixAt(i, matrixRef.current);
        visibleCount++;
      }
    });
    
    meshRef.current.count = visibleCount;
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Update material opacity
    if (meshRef.current.material) {
      meshRef.current.material.opacity = 1 - progress;
    }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
    </instancedMesh>
  );
};

export default PooledHitParticles;
