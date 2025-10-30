import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';

const Player = ({
  targets,
  onTargetHit,
  speedBoostActive,
  _invincibilityActive,
  isGameOver,
  isPaused,
  showWaveTransition,
  setShowBlueFlash,
}) => {
  const meshRef = useRef();
  const { camera } = useThree();
  const velocityRef = useRef(new THREE.Vector3());
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const { setThrusterVolume: _setThrusterVolume } = useSound();
  const [shieldActive, setShieldActive] = useState(true);

  // Physics constants for space-like movement with more drift/inertia
  const BASE_ACCELERATION = speedBoostActive ? 80.0 : 15.0; // Acceleration force
  const MAX_VELOCITY = speedBoostActive ? 2.5 : 0.5; // Maximum velocity
  const DRAG_COEFFICIENT = 0.85; // Lower = more drift/inertia, 0.85 = tokyo drift!
  const VELOCITY_THRESHOLD = 0.001; // Stop completely when very slow

  useEffect(() => {
    if (speedBoostActive && process.env.NODE_ENV === 'development') {
      console.log('🚀 SPEED BOOST ACTIVE - Acceleration:', BASE_ACCELERATION, 'Max Velocity:', MAX_VELOCITY);
    }
  }, [speedBoostActive, BASE_ACCELERATION, MAX_VELOCITY]);

  useEffect(() => {
    camera.position.set(0, 1, -25); // Moved player back 25 units from spawn points
    camera.rotation.order = 'YXZ';

    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
          keysRef.current.forward = true;
          break;
        case 'KeyS':
          keysRef.current.backward = true;
          break;
        case 'KeyA':
          keysRef.current.left = true;
          break;
        case 'KeyD':
          keysRef.current.right = true;
          break;
        case 'Space':
          keysRef.current.up = true;
          break;
        case 'ShiftLeft':
          keysRef.current.down = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
          keysRef.current.forward = false;
          break;
        case 'KeyS':
          keysRef.current.backward = false;
          break;
        case 'KeyA':
          keysRef.current.left = false;
          break;
        case 'KeyD':
          keysRef.current.right = false;
          break;
        case 'Space':
          keysRef.current.up = false;
          break;
        case 'ShiftLeft':
          keysRef.current.down = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  useFrame((state, delta) => {
    if (isGameOver || isPaused || showWaveTransition) return;
    if (!meshRef.current) return;

    const direction = new THREE.Vector3();
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const upVector = new THREE.Vector3(0, 1, 0);

    if (keysRef.current.forward) direction.add(forwardVector);
    if (keysRef.current.backward) direction.add(forwardVector.negate());
    if (keysRef.current.left) direction.add(rightVector.negate());
    if (keysRef.current.right) direction.add(rightVector);
    if (keysRef.current.up) direction.add(upVector);
    if (keysRef.current.down) direction.add(upVector.negate());

    if (direction.length() > 0) {
      // Apply acceleration force (not direct velocity) for space physics
      const acceleration = direction.normalize().multiplyScalar(BASE_ACCELERATION * delta);
      velocityRef.current.add(acceleration);
      
      // Clamp to maximum velocity
      if (velocityRef.current.length() > MAX_VELOCITY) {
        velocityRef.current.setLength(MAX_VELOCITY);
      }
    }
    
    // Always apply drag/friction (atmospheric drag in space)
    // This creates the "floaty" feel - ship gradually slows down when no input
    velocityRef.current.multiplyScalar(DRAG_COEFFICIENT);
    
    // Stop completely when velocity is negligible to prevent infinite drift
    if (velocityRef.current.length() < VELOCITY_THRESHOLD) {
      velocityRef.current.set(0, 0, 0);
    }

    // Apply velocity to camera position
    camera.position.add(velocityRef.current);

    const offset = new THREE.Vector3(0, -1, 0);
    meshRef.current.position.copy(camera.position).add(offset);

    targets.forEach((target) => {
      const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
      const playerRadius = 3;
      const targetRadius = target.size / 2;
      const distance = camera.position.distanceTo(targetPosition);

      if (distance < playerRadius + targetRadius && !target.isHit) {
        if (shieldActive) {
          setShieldActive(false);
          if (setShowBlueFlash) setShowBlueFlash(false);
        } else {
          onTargetHit(target.id);
        }
      }
    });
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="purple" />
    </mesh>
  );
};

export default Player;
