import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const Player = () => {
  const meshRef = useRef();
  const { camera } = useThree();
  const [velocity, setVelocity] = useState(new THREE.Vector3());
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

  // Thrust constants - increased values for more responsive movement
  const MAIN_THRUST = 0.5;      // Forward thrust
  const REVERSE_THRUST = 0.4;   // Reverse thrust
  const STRAFE_THRUST = 0.3;    // Sideways thrust
  const DRAG = 0.98;            // Slightly reduced drag for more floaty feel
  const MAX_SPEED = 2.0;        // Increased max speed

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 0);

    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': setKeys(prev => ({ ...prev, forward: true })); break;
        case 's': setKeys(prev => ({ ...prev, backward: true })); break;
        case 'a': setKeys(prev => ({ ...prev, left: true })); break;
        case 'd': setKeys(prev => ({ ...prev, right: true })); break;
        case ' ': setKeys(prev => ({ ...prev, up: true })); break;
        case 'x': setKeys(prev => ({ ...prev, down: true })); break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': setKeys(prev => ({ ...prev, forward: false })); break;
        case 's': setKeys(prev => ({ ...prev, backward: false })); break;
        case 'a': setKeys(prev => ({ ...prev, left: false })); break;
        case 'd': setKeys(prev => ({ ...prev, right: false })); break;
        case ' ': setKeys(prev => ({ ...prev, up: false })); break;
        case 'x': setKeys(prev => ({ ...prev, down: false })); break;
      }
    };

    const handleMouseMove = (e) => {
      if (!isPointerLocked) return;
      
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      
      setMousePosition(prev => ({
        x: prev.x + movementX * 0.002,
        y: prev.y + movementY * 0.002 // Removed angle limits for full 360 rotation
      }));
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null);
    };

    const handleClick = () => {
      if (!isPointerLocked) {
        document.body.requestPointerLock();
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
  }, [isPointerLocked, camera]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update camera rotation based on mouse position
    camera.rotation.y = -mousePosition.x;
    camera.rotation.x = mousePosition.y;

    // Calculate movement direction based on camera orientation
    const direction = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();

    // Get camera's forward direction
    camera.getWorldDirection(cameraDirection);
    cameraDirection.normalize();

    // Get camera's right direction
    cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection).normalize();

    // Get camera's up direction
    cameraUp.crossVectors(cameraDirection, cameraRight).normalize();

    // Apply thrust based on keys
    if (keys.forward) {
      velocity.addScaledVector(cameraDirection, MAIN_THRUST * delta);
    }
    if (keys.backward) {
      velocity.addScaledVector(cameraDirection, -REVERSE_THRUST * delta);
    }
    if (keys.left) {
      velocity.addScaledVector(cameraRight, STRAFE_THRUST * delta);
    }
    if (keys.right) {
      velocity.addScaledVector(cameraRight, -STRAFE_THRUST * delta);
    }
    if (keys.up) {
      velocity.addScaledVector(cameraUp, STRAFE_THRUST * delta);
    }
    if (keys.down) {
      velocity.addScaledVector(cameraUp, -STRAFE_THRUST * delta);
    }

    // Apply drag
    velocity.multiplyScalar(DRAG);

    // Limit speed
    if (velocity.length() > MAX_SPEED) {
      velocity.normalize().multiplyScalar(MAX_SPEED);
    }

    // Update camera position
    camera.position.add(velocity);

    // Make player mesh follow camera exactly
    meshRef.current.position.copy(camera.position);
    meshRef.current.rotation.copy(camera.rotation);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export default Player; 