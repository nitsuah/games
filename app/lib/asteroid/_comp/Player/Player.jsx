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

  const BASE_SPEED = 5;
  const SPEED_MULTIPLIER = speedBoostActive ? 50.0 : 1; // 50x boost - SUPER FAST for testing
  const MOVEMENT_SPEED = BASE_SPEED * SPEED_MULTIPLIER;

  useEffect(() => {
    if (speedBoostActive) {
      console.log('🚀 SPEED BOOST ACTIVE - Speed multiplier:', SPEED_MULTIPLIER);
    }
  }, [speedBoostActive, SPEED_MULTIPLIER]);

  useEffect(() => {
    camera.position.set(0, 1, 0);
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
    if (isGameOver || isPaused) return;
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
      // Apply acceleration when keys are pressed
      direction.normalize().multiplyScalar(MOVEMENT_SPEED * delta);
      velocityRef.current.add(direction);
      
      // Clamp max velocity
      const maxVelocity = MOVEMENT_SPEED * 0.1;
      if (velocityRef.current.length() > maxVelocity) {
        velocityRef.current.setLength(maxVelocity);
      }
    } else {
      // Apply damping when no keys pressed - coast to a stop (space physics)
      velocityRef.current.multiplyScalar(0.92); // 92% of velocity each frame = gradual slowdown
      
      // Stop completely when very slow
      if (velocityRef.current.length() < 0.001) {
        velocityRef.current.set(0, 0, 0);
      }
    }

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
