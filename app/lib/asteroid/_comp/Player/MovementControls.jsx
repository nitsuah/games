import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSound } from '@/utils/audio/useSound';

const MovementControls = () => {
  const { camera } = useThree();
  const MAX_SPEED = 0.25; // significantly increased max speed
  const ACCEL = 0.008; // much stronger acceleration (5x)
  const DAMPING = 0.85; // lower damping for more drift/inertia
  const keys = useRef({});
  const velocityRef = useRef(new THREE.Vector3());
  const { setThrusterVolume: _setThrusterVolume = () => {} } = useSound();
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
        _setThrusterVolume(isMoving ? 0.3 : 0);
        isMovingRef.current = isMoving;
      }
      _setThrusterVolume(isMoving ? 0.3 : 0);

      // acceleration based on inputs (use temporary vectors to avoid mutating frontVector/sideVector)
      const accel = ACCEL;
      if (keys.current['KeyW']) velocityRef.current.add(frontVector.clone().multiplyScalar(accel));
      if (keys.current['KeyS']) velocityRef.current.sub(frontVector.clone().multiplyScalar(accel));
      if (keys.current['KeyA']) velocityRef.current.add(sideVector.clone().multiplyScalar(accel));
      if (keys.current['KeyD']) velocityRef.current.sub(sideVector.clone().multiplyScalar(accel));
      if (keys.current['Space']) velocityRef.current.add(upVector.clone().multiplyScalar(accel));
      if (keys.current['ShiftLeft']) velocityRef.current.sub(upVector.clone().multiplyScalar(accel));

      // clamp velocity
      if (velocityRef.current.length() > MAX_SPEED) {
        velocityRef.current.setLength(MAX_SPEED);
      }

      // apply damping when no input to create inertia
      if (!isMoving) {
        velocityRef.current.multiplyScalar(DAMPING);
        // tiny cutoff
        if (velocityRef.current.length() < 0.00002) velocityRef.current.set(0, 0, 0);
      } else {
        // small damping while moving to keep behavior stable
        velocityRef.current.multiplyScalar(0.995);
      }

      camera.position.add(velocityRef.current);

      // Note: pointer-based rotation is handled elsewhere; we only manage translational inertia here.
    };

    const animate = () => {
      moveCamera();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [camera, _setThrusterVolume]);

  return null;
};

export default MovementControls;
