import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Split particle burst effect - spawns when a target splits into fragments
 * Creates a more dramatic burst with outward radial motion
 */
const SplitParticles = ({ position, color = '#00ff00', size = 1, onComplete }) => {
  const groupRef = useRef();
  const startTimeRef = useRef(Date.now());
  const duration = 800; // ms - longer than hit particles for more dramatic effect
  
  // Generate particle data with radial burst pattern
  const particles = useMemo(() => {
    const count = 20; // More particles for split effect
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * 0.8; // More vertical spread
      const speed = 10 + Math.random() * 6; // Faster initial speed
      
      return {
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          elevation * speed * 2,
          Math.sin(angle) * speed
        ),
        position: new THREE.Vector3(0, 0, 0),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 15, // Faster rotation
        initialSize: 0.3 + Math.random() * 0.4, // Varied particle sizes
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
      const damping = 1 - progress * 0.6; // Slower damping for longer travel
      particle.position.add(
        particle.velocity.clone().multiplyScalar(0.016 * damping)
      );
      
      // Apply stronger gravity for more arc motion
      particle.position.y -= 0.016 * progress * 8;
      
      // Update mesh position and rotation
      mesh.position.copy(particle.position);
      mesh.rotation.x += particle.rotationSpeed * 0.016;
      mesh.rotation.y += particle.rotationSpeed * 0.016 * 0.7;
      
      // Fade out and shrink with easing
      const fadeProgress = Math.pow(progress, 1.5); // Ease out
      const scale = (1 - fadeProgress) * size * particle.initialSize;
      mesh.scale.set(scale, scale, scale);
      mesh.material.opacity = Math.max(0, 1 - fadeProgress);
    });
  });
  
  return (
    <group ref={groupRef} position={position}>
      {particles.map((particle, i) => (
        <mesh key={i}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={1}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

export default SplitParticles;
