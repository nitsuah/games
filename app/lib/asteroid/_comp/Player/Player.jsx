import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';
import { PLAYER_PHYSICS } from '../config';

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
  const angularVelocityRef = useRef({ roll: 0, yaw: 0 }); // For camera rotation
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    // New advanced controls
    diagUpLeft: false,    // Q
    diagUpRight: false,   // E
    rollLeft: false,      // Z
    rollRight: false,     // C
    yaw: false,           // X
  });
  const { setThrusterVolume: _setThrusterVolume } = useSound();
  const [shieldActive, setShieldActive] = useState(true);

  // Physics constants from config - use speed boost values when active
  const BASE_ACCELERATION = speedBoostActive 
    ? PLAYER_PHYSICS.SPEED_BOOST_ACCELERATION 
    : PLAYER_PHYSICS.BASE_ACCELERATION;
  const MAX_VELOCITY = speedBoostActive 
    ? PLAYER_PHYSICS.SPEED_BOOST_MAX_VELOCITY 
    : PLAYER_PHYSICS.MAX_VELOCITY;
  const DRAG_COEFFICIENT = PLAYER_PHYSICS.DRAG_COEFFICIENT;
  const VELOCITY_THRESHOLD = PLAYER_PHYSICS.VELOCITY_THRESHOLD;
  const ANGULAR_DRAG = PLAYER_PHYSICS.ANGULAR_DRAG;
  const ROLL_ACCELERATION = PLAYER_PHYSICS.ROLL_ACCELERATION;
  const YAW_ACCELERATION = PLAYER_PHYSICS.YAW_ACCELERATION;
  const MAX_ANGULAR_VELOCITY = PLAYER_PHYSICS.MAX_ANGULAR_VELOCITY;

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
        // Phase 8: Advanced controls
        case 'KeyQ':
          keysRef.current.diagUpLeft = true;
          break;
        case 'KeyE':
          keysRef.current.diagUpRight = true;
          break;
        case 'KeyZ':
          keysRef.current.rollLeft = true;
          break;
        case 'KeyC':
          keysRef.current.rollRight = true;
          break;
        case 'KeyX':
          keysRef.current.yaw = true;
          break;
        case 'Backquote': // ` or ~
          // Center/reset: stop all movement and rotation
          velocityRef.current.set(0, 0, 0);
          angularVelocityRef.current = { roll: 0, yaw: 0 };
          camera.rotation.set(0, 0, 0);
          camera.rotation.order = 'YXZ';
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
        // Phase 8: Advanced controls
        case 'KeyQ':
          keysRef.current.diagUpLeft = false;
          break;
        case 'KeyE':
          keysRef.current.diagUpRight = false;
          break;
        case 'KeyZ':
          keysRef.current.rollLeft = false;
          break;
        case 'KeyC':
          keysRef.current.rollRight = false;
          break;
        case 'KeyX':
          keysRef.current.yaw = false;
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

    // === MOVEMENT PHYSICS (Phase 8: Improved Tokyo Drift) ===
    const direction = new THREE.Vector3();
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const upVector = new THREE.Vector3(0, 1, 0);

    // Standard WASD + Space/Shift movement
    if (keysRef.current.forward) direction.add(forwardVector);
    if (keysRef.current.backward) direction.add(forwardVector.negate());
    if (keysRef.current.left) direction.add(rightVector.negate());
    if (keysRef.current.right) direction.add(rightVector);
    if (keysRef.current.up) direction.add(upVector);
    if (keysRef.current.down) direction.add(upVector.negate());

    // Phase 8: Diagonal movement (Q = up-left, E = up-right)
    if (keysRef.current.diagUpLeft) {
      const diagUpLeft = forwardVector.clone()
        .add(rightVector.clone().negate())
        .add(upVector);
      direction.add(diagUpLeft);
    }
    if (keysRef.current.diagUpRight) {
      const diagUpRight = forwardVector.clone()
        .add(rightVector)
        .add(upVector);
      direction.add(diagUpRight);
    }

    if (direction.length() > 0) {
      // Apply acceleration force (not direct velocity) for space physics
      const acceleration = direction.normalize().multiplyScalar(BASE_ACCELERATION * delta);
      velocityRef.current.add(acceleration);
      
      // Clamp to maximum velocity
      if (velocityRef.current.length() > MAX_VELOCITY) {
        velocityRef.current.setLength(MAX_VELOCITY);
      }
    }
    
    // Phase 8: More drag for better drift feel (0.96 vs 0.85)
    velocityRef.current.multiplyScalar(DRAG_COEFFICIENT);
    
    // Stop completely when velocity is negligible to prevent infinite drift
    if (velocityRef.current.length() < VELOCITY_THRESHOLD) {
      velocityRef.current.set(0, 0, 0);
    }

    // Apply velocity to camera position
    camera.position.add(velocityRef.current);

    // === CAMERA ROTATION PHYSICS (Phase 8: Roll/Yaw) ===
    // Roll (Z/C keys)
    if (keysRef.current.rollLeft) {
      angularVelocityRef.current.roll += ROLL_ACCELERATION * delta;
    }
    if (keysRef.current.rollRight) {
      angularVelocityRef.current.roll -= ROLL_ACCELERATION * delta;
    }

    // Yaw (X key - oscillate left/right)
    if (keysRef.current.yaw) {
      angularVelocityRef.current.yaw = Math.sin(state.clock.elapsedTime * 2) * YAW_ACCELERATION;
    } else {
      angularVelocityRef.current.yaw *= ANGULAR_DRAG; // Decay when not active
    }

    // Apply angular drag
    angularVelocityRef.current.roll *= ANGULAR_DRAG;

    // Clamp angular velocity
    angularVelocityRef.current.roll = Math.max(-MAX_ANGULAR_VELOCITY, Math.min(MAX_ANGULAR_VELOCITY, angularVelocityRef.current.roll));
    angularVelocityRef.current.yaw = Math.max(-MAX_ANGULAR_VELOCITY, Math.min(MAX_ANGULAR_VELOCITY, angularVelocityRef.current.yaw));

    // Apply rotation to camera
    camera.rotation.z += angularVelocityRef.current.roll;
    camera.rotation.y += angularVelocityRef.current.yaw;

    // Stop rotation when negligible
    if (Math.abs(angularVelocityRef.current.roll) < 0.001) angularVelocityRef.current.roll = 0;
    if (Math.abs(angularVelocityRef.current.yaw) < 0.001) angularVelocityRef.current.yaw = 0;

    // Phase 10: Sync player mesh position and rotation with camera
    const offset = new THREE.Vector3(0, -1, 0);
    meshRef.current.position.copy(camera.position).add(offset);
    // Copy camera rotation to player body so it matches camera orientation
    meshRef.current.rotation.copy(camera.rotation);

    // === COLLISION PHYSICS (Phase 8: Bounce and momentum transfer) ===
    targets.forEach((target) => {
      const targetPosition = new THREE.Vector3(target.x, target.y, target.z);
      const playerRadius = 3;
      const targetRadius = target.size / 2;
      const distance = camera.position.distanceTo(targetPosition);

      if (distance < playerRadius + targetRadius && !target.isHit) {
        // Phase 8: Apply physics-based collision response
        const collisionNormal = new THREE.Vector3()
          .subVectors(targetPosition, camera.position)
          .normalize();
        
        // Calculate relative velocity
        const relativeVelocity = velocityRef.current.length();
        
        // Apply impulse to player (bounce back)
        const playerMass = 10; // Heavy player
        const targetMass = target.size; // Mass based on size
        const restitution = 0.6; // Bounciness factor
        
        const impulseStrength = (1 + restitution) * relativeVelocity * (targetMass / (playerMass + targetMass));
        const playerImpulse = collisionNormal.clone().multiplyScalar(-impulseStrength * 0.3); // Reduced for player
        
        velocityRef.current.add(playerImpulse);
        
        // Apply impulse to target (handled in Target component via setTargets)
        // This would require refactoring to pass target velocities, so we'll skip for now
        // TODO: Implement target velocity state for full physics simulation
        
        // Handle damage/shield
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
