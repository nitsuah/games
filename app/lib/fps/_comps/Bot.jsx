import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple tank bot for FPS game
export default function Bot({ position = [0, 1, 0], color = 'red', onDeath, playerPosition }) {
  const meshRef = useRef();
  const speed = 0.05; // Bot movement speed
  const [health, setHealth] = React.useState(100);

  // Move bot toward player
  useFrame(() => {
    if (!meshRef.current || !playerPosition) return;
    const botPos = meshRef.current.position;
    const playerVec = new THREE.Vector3(...playerPosition);
    const direction = playerVec.clone().sub(botPos).normalize();
    botPos.add(direction.multiplyScalar(speed));
    // Simple collision/hit logic (expand as needed)
    if (botPos.distanceTo(playerVec) < 1.5) {
      // Bot reached player (could deal damage, respawn, etc.)
      if (onDeath) onDeath();
      setHealth(0);
    }
  });

  useEffect(() => {
    if (health <= 0 && onDeath) onDeath();
  }, [health, onDeath]);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
