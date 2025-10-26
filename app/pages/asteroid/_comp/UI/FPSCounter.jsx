import React, { useEffect, useState, useRef } from 'react';
import styles from './FPSCounter.module.css';

const FPSCounter = () => {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationFrameId;

    const updateFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      // Update FPS every second
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(updateFPS);
    };

    animationFrameId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const getFpsColor = () => {
    if (fps >= 55) return '#00ff00'; // Green
    if (fps >= 30) return '#ffaa00'; // Orange
    return '#ff0000'; // Red
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>FPS</div>
      <div className={styles.value} style={{ color: getFpsColor() }}>
        {fps}
      </div>
    </div>
  );
};

export default FPSCounter;
