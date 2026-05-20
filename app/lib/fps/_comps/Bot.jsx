import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple tank bot for FPS game
export default function Bot({ position = [0, 1, 0], color = 'red', onDeath, playerPosition }) {
  const meshRef = useRef();
  const playerVecRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const speed = 0.05; // Bot movement speed
  const [health, setHealth] = useState(100);
  const hasDied = useRef(false);

  const triggerDeath = useCallback(() => {
    if (!hasDied.current) {
      hasDied.current = true;
      if (onDeath) onDeath();
    }
  }, [onDeath]);

  // Move bot toward player
  useFrame(() => {
    if (!meshRef.current || !playerPosition) return;
    const botPos = meshRef.current.position;
    const playerVec = playerVecRef.current.set(...playerPosition);
    const direction = directionRef.current.subVectors(playerVec, botPos).normalize();
    botPos.addScaledVector(direction, speed);
    // Simple collision/hit logic (expand as needed)
    if (!hasDied.current && botPos.distanceTo(playerVec) < 1.5) {
      // Bot reached player (could deal damage, respawn, etc.)
      setHealth(0);
    }
  });

  useEffect(() => {
    if (health <= 0) triggerDeath();
  }, [health, triggerDeath]);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
