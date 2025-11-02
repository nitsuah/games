import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Target = ({ position, targetId, isHit, onHit, size = 10, color = '#00ff00', setTargets, refCallback, velocity = { x: 0, y: 0, z: 0 }, isGameOver = false, isPaused = false }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(false);
  const [opacity, setOpacity] = useState(0); // Start invisible for spawn animation
  const [scale, setScale] = useState(0); // Start small for spawn animation
  const spawnTimeRef = useRef(Date.now());
  const hitTimeRef = useRef(null);
  // Phase 9: Use velocity prop instead of random speed
  const velocityRef = useRef(new THREE.Vector3(velocity.x, velocity.y, velocity.z));
  const [bounds] = useState(() => ({ min: new THREE.Vector3(-50, -50, -50), max: new THREE.Vector3(50, 50, 50) }));

  useEffect(() => {
    if (refCallback) {
      refCallback(targetId, meshRef);
    }
  }, [targetId, refCallback]);

  useEffect(() => {
    if (isHit) {
      hitTimeRef.current = Date.now();
      setFlash(true);
      setTimeout(() => setFlash(false), 80);
      setTimeout(() => setOpacity(0.2), 120);
    }
  }, [isHit]);

  useFrame(() => {
    // Spawn animation: fade in and scale up over 300ms
    if (!isHit) {
      const elapsed = Date.now() - spawnTimeRef.current;
      const spawnProgress = Math.min(elapsed / 300, 1);
      setOpacity(spawnProgress);
      setScale(spawnProgress);
    }
    
    // Hit animation: pulse scale and fade out
    if (isHit && hitTimeRef.current) {
      const hitElapsed = Date.now() - hitTimeRef.current;
      const hitProgress = Math.min(hitElapsed / 200, 1);
      // Pulse: grow then shrink
      const pulseScale = 1 + Math.sin(hitProgress * Math.PI) * 0.3;
      setScale(pulseScale);
      // Fade out
      setOpacity(Math.max(0.2, 1 - hitProgress * 0.8));
    }
    
    // Stop movement when game is over or paused
    if (isGameOver || isPaused || !meshRef.current || isHit) return;
    
    // Phase 9: Apply velocity directly (no speed multiplier needed)
    meshRef.current.position.add(velocityRef.current);
    const { x, y, z } = meshRef.current.position;
    
    // Update target state with new position and velocity
    if (typeof setTargets === 'function') {
      setTargets((prevTargets) => prevTargets.map((target) => 
        target.id === targetId 
          ? { ...target, x, y, z, vx: velocityRef.current.x, vy: velocityRef.current.y, vz: velocityRef.current.z } 
          : target
      ));
    }

    // Bounce off bounds (Phase 9: velocity reflection)
    if (meshRef.current.position.x < bounds.min.x || meshRef.current.position.x > bounds.max.x) {
      velocityRef.current.x *= -1;
    }
    if (meshRef.current.position.y < bounds.min.y || meshRef.current.position.y > bounds.max.y) {
      velocityRef.current.y *= -1;
    }
    if (meshRef.current.position.z < bounds.min.z || meshRef.current.position.z > bounds.max.z) {
      velocityRef.current.z *= -1;
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    // Prevent clicking when game is over or paused
    if (isGameOver || isPaused) return;
    if (!isHit && onHit) onHit(targetId);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[size * scale, size * scale, size * scale]}
      onClick={handleClick}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
      onPointerOut={(event) => { event.stopPropagation(); setHovered(false); }}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color={isHit ? (flash ? '#ffffff' : '#808080') : hovered ? '#ffaa00' : color} 
        metalness={0.5} 
        roughness={0.2} 
        transparent 
        opacity={opacity}
        emissive={flash ? '#ffff00' : '#000000'}
        emissiveIntensity={flash ? 2 : 0}
      />
    </mesh>
  );
};

export default Target;
