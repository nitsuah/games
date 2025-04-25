import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSound } from '@/utils/audio/useSound';

const MovementControls = () => {
  const { camera } = useThree();
  const moveSpeed = 0.0005; // INITIAL SPEED
  const keys = useRef({});
  const { setThrusterVolume = () => {} } = useSound();
  const isMovingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.code] = true);
    const handleKeyUp = (e) => (keys.current[e.code] = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const moveCamera = () => {
      if (!document.pointerLockElement) return;

      const direction = new THREE.Vector3(0, 0, 0);
      const frontVector = new THREE.Vector3();
      const sideVector = new THREE.Vector3();
      const upVector = new THREE.Vector3(0, 1, 0);

      camera.getWorldDirection(frontVector);
      frontVector.y = 0;
      frontVector.normalize();
      sideVector.crossVectors(upVector, frontVector);

      const isMoving =
        keys.current['KeyW'] ||
        keys.current['KeyS'] ||
        keys.current['KeyA'] ||
        keys.current['KeyD'] ||
        keys.current['Space'] ||
        keys.current['ShiftLeft'];
      if (isMovingRef.current !== isMoving) {
        setThrusterVolume(isMoving ? 0.3 : 0);
        isMovingRef.current = isMoving;
      }
      setThrusterVolume(isMoving ? 0.3 : 0);

      if (keys.current['KeyW']) direction.add(frontVector.multiplyScalar(moveSpeed));
      if (keys.current['KeyS']) direction.sub(frontVector.multiplyScalar(moveSpeed));
      if (keys.current['KeyA']) direction.add(sideVector.multiplyScalar(moveSpeed));
      if (keys.current['KeyD']) direction.sub(sideVector.multiplyScalar(moveSpeed));
      if (keys.current['Space']) direction.add(upVector.multiplyScalar(moveSpeed));
      if (keys.current['ShiftLeft']) direction.sub(upVector.multiplyScalar(moveSpeed));

      camera.position.add(direction);
    };

    const animate = () => {
      moveCamera();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [camera, setThrusterVolume]);

  return null;
};

export default MovementControls;
