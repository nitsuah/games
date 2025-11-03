import { useEffect, useState } from 'react';

/**
 * Custom hook for triggering screen shake effects
 * Returns [shakeStyle, triggerShake] where shakeStyle is a CSS transform
 * @param {boolean} reduceMotion - If true, disables shake effects for accessibility
 */
export function useScreenShake(reduceMotion = false) {
  const [shake, setShake] = useState({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (!isShaking) return;

    let frame = 0;
    const maxFrames = 15; // Shake for ~250ms at 60fps
    let animationId;

    const animate = () => {
      if (frame >= maxFrames) {
        setShake({ x: 0, y: 0 });
        setIsShaking(false);
        return;
      }

      // Exponential decay for smooth shake-out
      const progress = frame / maxFrames;
      const decay = 1 - progress;
      const intensity = shake.intensity || 10;
      
      // Random offset with decay
      const x = (Math.random() - 0.5) * intensity * decay;
      const y = (Math.random() - 0.5) * intensity * decay;
      
      setShake({ x, y });
      frame++;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isShaking, shake.intensity]);

  const triggerShake = (intensity = 10) => {
    // Don't trigger shake if reduce motion is enabled
    if (reduceMotion) return;
    
    setShake({ x: 0, y: 0, intensity });
    setIsShaking(true);
  };

  const shakeStyle = {
    // Return empty transform if reduce motion is enabled
    transform: reduceMotion ? 'none' : `translate(${shake.x}px, ${shake.y}px)`,
    transition: 'transform 0.016s ease-out', // Smooth interpolation
  };

  return [shakeStyle, triggerShake];
}
