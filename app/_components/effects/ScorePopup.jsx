import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

/**
 * Score popup that floats upward and fades out
 */
const ScorePopup = ({ position, score, onComplete }) => {
  const textRef = useRef();
  const startTimeRef = useRef(Date.now());
  const startPosition = useRef([...position]);
  const duration = 1000; // ms
  
  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = Date.now() - startTimeRef.current;
    const progress = elapsed / duration;
    
    if (progress >= 1) {
      if (onComplete) onComplete();
      return;
    }
    
    // Float upward
    const yOffset = progress * 10;
    textRef.current.position.set(
      startPosition.current[0],
      startPosition.current[1] + yOffset,
      startPosition.current[2]
    );
    
    // Fade out
    textRef.current.fillOpacity = 1 - progress;
    
    // Scale slightly larger then back to normal
    const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
    textRef.current.scale.set(scale, scale, scale);
  });
  
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={3}
      color="#ffff00"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.2}
      outlineColor="#000000"
    >
      +{score}
    </Text>
  );
};

export default ScorePopup;
