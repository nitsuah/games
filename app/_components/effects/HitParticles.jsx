import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hit particle burst effect - spawns particles when a target is hit
 * Particles fly outward and fade over time
 */
const HitParticles = ({ position, color = '#00ff00', size = 1, onComplete }) => {
  const groupRef = useRef();
  const startTimeRef = useRef(Date.now());
  const duration = 600; // ms
  
  // Generate particle data
  const particles = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * 0.5; // Random vertical spread
      const speed = 8 + Math.random() * 4; // Random speed
      
      return {
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          elevation * speed * 2,
          Math.sin(angle) * speed
        ),
        position: new THREE.Vector3(0, 0, 0),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      };
    });
  }, []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    const elapsed = Date.now() - startTimeRef.current;
    const progress = elapsed / duration;
    
    if (progress >= 1) {
      if (onComplete) onComplete();
      return;
    }
    
    // Update each particle
    groupRef.current.children.forEach((mesh, i) => {
      const particle = particles[i];
      
      // Apply velocity with damping
      const damping = 1 - progress * 0.7; // Slow down over time
      particle.position.add(
        particle.velocity.clone().multiplyScalar(0.016 * damping)
      );
      
      // Apply gravity
      particle.position.y -= 0.016 * progress * 5;
      
      // Update mesh position and rotation
      mesh.position.copy(particle.position);
      mesh.rotation.z += particle.rotationSpeed * 0.016;
      
      // Fade out and shrink
      const scale = (1 - progress) * size * 0.4;
      mesh.scale.set(scale, scale, scale);
      mesh.material.opacity = 1 - progress;
    });
  });
  
  return (
    <group ref={groupRef} position={position}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
};

export default HitParticles;
