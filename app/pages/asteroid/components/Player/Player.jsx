import React, { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Player = () => {
  const [keys, setKeys] = useState({ 
    w: false, a: false, s: false, d: false,
    space: false, x: false
  });
  const { camera } = useThree();
  
  // Add velocity and acceleration vectors
  const velocity = useRef(new THREE.Vector3());
  const acceleration = useRef(new THREE.Vector3());
  const maxSpeed = 0.1;
  const accelerationForce = 0.005;
  const drag = 0.99;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'w') setKeys(prev => ({ ...prev, w: true }));
      if (e.key.toLowerCase() === 'a') setKeys(prev => ({ ...prev, a: true }));
      if (e.key.toLowerCase() === 's') setKeys(prev => ({ ...prev, s: true }));
      if (e.key.toLowerCase() === 'd') setKeys(prev => ({ ...prev, d: true }));
      if (e.key === ' ') setKeys(prev => ({ ...prev, space: true }));
      if (e.key.toLowerCase() === 'x') setKeys(prev => ({ ...prev, x: true }));
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'w') setKeys(prev => ({ ...prev, w: false }));
      if (e.key.toLowerCase() === 'a') setKeys(prev => ({ ...prev, a: false }));
      if (e.key.toLowerCase() === 's') setKeys(prev => ({ ...prev, s: false }));
      if (e.key.toLowerCase() === 'd') setKeys(prev => ({ ...prev, d: false }));
      if (e.key === ' ') setKeys(prev => ({ ...prev, space: false }));
      if (e.key.toLowerCase() === 'x') setKeys(prev => ({ ...prev, x: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    // Get the camera's forward, right, and up vectors for movement
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);
    
    // Calculate acceleration based on input with different thrust levels
    acceleration.current.set(0, 0, 0);
    
    // Main engine (forward) - 100% thrust
    if (keys.w) {
      const forwardThrust = forward.clone().multiplyScalar(accelerationForce);
      acceleration.current.add(forwardThrust);
    }
    
    // Reverse thrust - 50% power
    if (keys.s) {
      const reverseThrust = forward.clone().multiplyScalar(-accelerationForce * 0.5);
      acceleration.current.add(reverseThrust);
    }
    
    // RCS thrusters (sideways/vertical) - 25% power
    if (keys.a) {
      const leftThrust = right.clone().multiplyScalar(-accelerationForce * 0.25);
      acceleration.current.add(leftThrust);
    }
    if (keys.d) {
      const rightThrust = right.clone().multiplyScalar(accelerationForce * 0.25);
      acceleration.current.add(rightThrust);
    }
    if (keys.space) {
      const upThrust = up.clone().multiplyScalar(accelerationForce * 0.25);
      acceleration.current.add(upThrust);
    }
    if (keys.x) {
      const downThrust = up.clone().multiplyScalar(-accelerationForce * 0.25);
      acceleration.current.add(downThrust);
    }
    
    // Apply acceleration to velocity
    velocity.current.add(acceleration.current);
    
    // Apply drag
    velocity.current.multiplyScalar(drag);
    
    // Limit maximum speed
    if (velocity.current.length() > maxSpeed) {
      velocity.current.normalize().multiplyScalar(maxSpeed);
    }
    
    // Apply velocity to position
    camera.position.add(velocity.current);
  });

  return null;
};

export default Player; 