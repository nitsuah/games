import React, { useEffect } from 'react';
import { PointerLockControls as DreiPointerLockControls } from '@react-three/drei';

const PointerLockControls = ({ isGameOver }) => {
  useEffect(() => {
    const handlePointerLockError = () => {
      console.warn('Pointer Lock API error occurred.');
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement === null && !isGameOver) {
        console.warn('Pointer Lock exited unexpectedly.');
      }
    };

    document.addEventListener('pointerlockerror', handlePointerLockError);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [isGameOver]);

  return <DreiPointerLockControls />;
};

export default PointerLockControls;
