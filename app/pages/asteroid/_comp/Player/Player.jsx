import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';

const Player = ({ 
  targets, 
  onTargetHit, 
  speedBoostActive, 
  invincibilityActive, 
  isGameOver, 
  setShowBlueFlash // Add setShowBlueFlash as a prop
}) => {
  const meshRef = useRef(); // Blue square (hitbox)
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
  const { setThrusterVolume } = useSound();
  const [shieldActive, setShieldActive] = useState(true); // Shield state

  // Physics constants
  const BASE_SPEED = 5; // Base speed in units per second
  const SPEED_MULTIPLIER = speedBoostActive ? 3 : 1; // Apply 3x speed boost for testing
  const MOVEMENT_SPEED = BASE_SPEED * SPEED_MULTIPLIER; // Final movement speed
  const ROTATION_SPEED = 0.00002;   // Mouse sensitivity remains unchanged
  const DAMPING = 0.98;           // Adjusted damping for smoother deceleration

  useEffect(() => {
    camera.position.set(0, 1, 0); // Start camera slightly above ground
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
  }, []);

  useFrame((state, delta) => {
    if (isGameOver) {
      console.debug('Player movement disabled because the game is over.');
      return; // Prevent movement when the game is over
    }

    if (!meshRef.current) return;

    // Movement logic
    const direction = new THREE.Vector3();
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const upVector = new THREE.Vector3(0, 1, 0); // Vertical movement is independent of camera orientation

    // Calculate movement direction based on keys
    if (keysRef.current.forward) direction.add(forwardVector);
    if (keysRef.current.backward) direction.add(forwardVector.negate());
    if (keysRef.current.left) direction.add(rightVector.negate());
    if (keysRef.current.right) direction.add(rightVector);
    if (keysRef.current.up) direction.add(upVector);
    if (keysRef.current.down) direction.add(upVector.negate());

    // Normalize direction and scale by movement speed and delta
    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(MOVEMENT_SPEED * delta); // Frame-rate independent movement
      velocityRef.current.copy(direction); // Directly set velocity to avoid drift
    } else {
      velocityRef.current.set(0, 0, 0); // Stop movement if no keys are pressed
    }

    // Update camera position based on velocity
    camera.position.add(velocityRef.current);

    // Update mesh (hitbox) to follow the camera
    const offset = new THREE.Vector3(0, -1, 0); // Offset hitbox slightly below the camera
    meshRef.current.position.copy(camera.position).add(offset);

    // Collision detection logic
    targets.forEach((target) => {
      const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
      const playerRadius = 3; // Increased from 1.0 to 3.0 for larger hitbox
      const targetRadius = target.size / 2;
      const distance = camera.position.distanceTo(targetPosition);

      if (distance < playerRadius + targetRadius && !target.isHit) {
        if (shieldActive) {
          console.debug('Shield absorbed the collision with target:', target.id);
          setShieldActive(false); // Deactivate shield after absorbing the collision
          if (setShowBlueFlash) setShowBlueFlash(false); // End blue flash
          console.log('Shield Power-Up expired!');
        } else {
          console.debug('Collision detected with target:', target.id, 'Size:', target.size);
          onTargetHit(target.id);
        }
      }
    });

    // Thruster sound logic
    const isMoving = velocityRef.current.length() > 0.1; // Consider moving if velocity is significant
    setThrusterVolume(isMoving ? 0.5 : 0); // Adjust thruster volume based on movement

    // Apply invincibility visual effect
    if (invincibilityActive) {
      meshRef.current.material.color.set('white'); // Change player color to white
    } else {
      meshRef.current.material.color.set('purple'); // Default color
    }

    // Log for debugging
    // console.debug(`SpeedBoostActive: ${speedBoostActive}, MovementSpeed: ${MOVEMENT_SPEED}, Velocity: ${velocityRef.current.length()}`);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="purple" />
    </mesh>
  );
};

export default Player;