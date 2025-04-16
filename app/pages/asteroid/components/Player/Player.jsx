import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useSound } from '@/utils/audio/useSound';

const Player = () => {
  const meshRef = useRef();
  const { camera } = useThree();
  const velocityRef = useRef(new THREE.Vector3());
  const acceleration = useRef(new THREE.Vector3());
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const { playSound, setThrusterVolume } = useSound();

  // Physics constants
  const ACCELERATION = 20.0;     // Base acceleration
  const MAX_VELOCITY = 15.0;     // Maximum velocity
  const ROTATION_SPEED = 0.002;  // Mouse sensitivity
  const DAMPING = 0.98;         // Velocity damping (lower = more drag)

  // Thrust multipliers for different directions
  const THRUST_MULTIPLIERS = {
    forward: 1.0,
    backward: 0.85,
    strafe: 0.95,
    vertical: 0.75
  };

  useEffect(() => {
    camera.position.set(0, 0, 0);
    camera.rotation.order = 'YXZ'; // Important for proper FPS-style rotation

    const handleKeyDown = (e) => {
      e.preventDefault(); // Prevent default browser actions
      switch (e.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, forward: true }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, backward: true }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, right: true }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, up: true }));
          break;
        case 'ShiftLeft':
          setKeys(prev => ({ ...prev, down: true }));
          break;
      }
    };

    const handleKeyUp = (e) => {
      e.preventDefault(); // Prevent default browser actions
      switch (e.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, forward: false }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, backward: false }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, right: false }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, up: false }));
          break;
        case 'ShiftLeft':
          setKeys(prev => ({ ...prev, down: false }));
          break;
      }
    };

    const handleMouseMove = (e) => {
      if (!isPointerLocked) return;
      
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      
      setMousePosition(prev => ({
        x: prev.x + movementX * ROTATION_SPEED,
        y: Math.max(Math.min(prev.y - movementY * ROTATION_SPEED, Math.PI / 2), -Math.PI / 2)
      }));
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null);
    };

    const handleClick = () => {
      if (!isPointerLocked) {
        document.body.requestPointerLock();
      } else {
        // Play shooting sound
        playSound('shoot');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('click', handleClick);
    };
  }, [isPointerLocked, camera, playSound]);

  useFrame((state, delta) => {
    if (!meshRef.current || !isPointerLocked) return;

    // Update camera rotation
    camera.rotation.y = -mousePosition.x;
    camera.rotation.x = mousePosition.y;

    // Get camera's orientation vectors
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);

    // Calculate acceleration based on input
    const currentAcceleration = new THREE.Vector3(0, 0, 0);

    if (keys.forward) {
      currentAcceleration.add(forward.clone().multiplyScalar(ACCELERATION * THRUST_MULTIPLIERS.forward));
    }
    if (keys.backward) {
      currentAcceleration.add(forward.clone().multiplyScalar(-ACCELERATION * THRUST_MULTIPLIERS.backward));
    }
    if (keys.right) {
      currentAcceleration.add(right.clone().multiplyScalar(ACCELERATION * THRUST_MULTIPLIERS.strafe));
    }
    if (keys.left) {
      currentAcceleration.add(right.clone().multiplyScalar(-ACCELERATION * THRUST_MULTIPLIERS.strafe));
    }
    if (keys.up) {
      currentAcceleration.add(up.clone().multiplyScalar(ACCELERATION * THRUST_MULTIPLIERS.vertical));
    }
    if (keys.down) {
      currentAcceleration.add(up.clone().multiplyScalar(-ACCELERATION * THRUST_MULTIPLIERS.vertical));
    }

    // Apply acceleration to velocity
    velocityRef.current.add(currentAcceleration.multiplyScalar(delta));

    // Apply damping
    velocityRef.current.multiplyScalar(DAMPING);

    // Limit maximum velocity
    if (velocityRef.current.length() > MAX_VELOCITY) {
      velocityRef.current.normalize().multiplyScalar(MAX_VELOCITY);
    }

    // Update position
    camera.position.add(velocityRef.current.clone().multiplyScalar(delta));

    // Update mesh to match camera
    meshRef.current.position.copy(camera.position);
    meshRef.current.rotation.copy(camera.rotation);

    // Calculate thruster volume based on total movement
    const isMoving = keys.forward || keys.backward || keys.left || keys.right || keys.up || keys.down;
    const movement = velocityRef.current.length();
    const normalizedMovement = Math.min(movement / MAX_VELOCITY, 1);
    
    // Set thruster volume based on movement
    setThrusterVolume(isMoving ? normalizedMovement * 0.3 : 0);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export default Player; 