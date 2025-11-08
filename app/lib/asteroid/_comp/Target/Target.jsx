import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import HitParticles from '@/_components/effects/HitParticles';

// Performance optimization: Only update state when target moves significantly
const MIN_UPDATE_DISTANCE = 0.5; // units moved before triggering state update
const MIN_UPDATE_DISTANCE_SQ = MIN_UPDATE_DISTANCE * MIN_UPDATE_DISTANCE; // 0.25 for distanceToSquared check

const Target = ({ position, targetId, isHit, onHit, size = 10, color = '#00ff00', setTargets, refCallback, velocity = { x: 0, y: 0, z: 0 }, isGameOver = false, isPaused = false }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(false);
  const [opacity, setOpacity] = useState(0); // Start invisible for spawn animation
  const [scale, setScale] = useState(0); // Start small for spawn animation
  const [showParticles, setShowParticles] = useState(false);
  const spawnTimeRef = useRef(Date.now());
  const hitTimeRef = useRef(null);
  // Phase 9: Use velocity prop instead of random speed
  const velocityRef = useRef(new THREE.Vector3(velocity.x, velocity.y, velocity.z));
  const [bounds] = useState(() => ({ min: new THREE.Vector3(-50, -50, -50), max: new THREE.Vector3(50, 50, 50) }));
  const lastUpdatePosRef = useRef(new THREE.Vector3(...position));

  useEffect(() => {
    if (refCallback) {
      refCallback(targetId, meshRef);
    }
  }, [targetId, refCallback]);

  useEffect(() => {
    if (isHit) {
      hitTimeRef.current = Date.now();
      setFlash(true);
      setShowParticles(true); // Trigger particle burst
      // Longer flash duration for better visibility
      setTimeout(() => setFlash(false), 150);
      setTimeout(() => setOpacity(0.2), 250);
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
    
    // Hit animation: more dramatic pulse scale and fade out
    if (isHit && hitTimeRef.current) {
      const hitElapsed = Date.now() - hitTimeRef.current;
      const hitProgress = Math.min(hitElapsed / 300, 1);
      // More dramatic pulse: grow larger then shrink
      const pulseScale = 1 + Math.sin(hitProgress * Math.PI) * 0.6;
      setScale(pulseScale);
      // Slower fade out for better visibility
      setOpacity(Math.max(0.2, 1 - hitProgress * 0.7));
    }
    
    // Stop movement when game is over or paused
    if (isGameOver || isPaused || !meshRef.current || isHit) return;
  });

  useFrame((state, delta) => {
    if (isGameOver || isPaused || !meshRef.current || isHit) return;
    
    // Phase 9: Apply velocity with delta time for frame rate independence
    const scaledVelocity = velocityRef.current.clone().multiplyScalar(delta * 60);
    meshRef.current.position.add(scaledVelocity);
    const { x, y, z } = meshRef.current.position;
    
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

    // Only update state when position has changed significantly
    // This reduces state updates from 60fps to ~5-10fps per target
    // Use distanceToSquared for better performance (avoids sqrt calculation)
    const distanceMovedSq = meshRef.current.position.distanceToSquared(lastUpdatePosRef.current);
    if (distanceMovedSq > MIN_UPDATE_DISTANCE_SQ && typeof setTargets === 'function') {
      lastUpdatePosRef.current.copy(meshRef.current.position);
      setTargets((prevTargets) => prevTargets.map((target) => 
        target.id === targetId 
          ? { ...target, x, y, z, vx: velocityRef.current.x, vy: velocityRef.current.y, vz: velocityRef.current.z } 
          : target
      ));
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
        emissive={flash ? '#ffff00' : isHit ? '#ffaa00' : '#000000'}
        emissiveIntensity={flash ? 3.5 : isHit ? 1.5 : 0}
      />
      {/* Add point light on hit for extra glow */}
      {flash && (
        <pointLight
          color="#ffff00"
          intensity={5}
          distance={size * 3}
          decay={2}
        />
      )}
      {/* Particle burst on hit */}
      {showParticles && (
        <HitParticles
          position={meshRef.current?.position || position}
          color={color}
          size={size}
          onComplete={() => setShowParticles(false)}
        />
      )}
    </mesh>
  );
};

export default Target;
