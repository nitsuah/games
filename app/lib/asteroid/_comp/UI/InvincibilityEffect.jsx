import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// InvincibilityEffect: wireframe sphere with shifting rainbow colors
const InvincibilityEffect = ({ invincibilityActive }) => {
  const shieldRef = useRef();
  const materialRef = useRef();
  const [visible, setVisible] = useState(false);
  const fadeRef = useRef(0);
  const colorIndexRef = useRef(0);
  
  // Rainbow colors for cycling
  const colors = [
    '#ff00ff', // magenta
    '#ffff00', // yellow
    '#00ff00', // green
    '#00ffff', // cyan
    '#ff0000', // red
    '#ff8800', // orange
  ];

  useEffect(() => {
    if (invincibilityActive && invincibilityActive !== 0 && invincibilityActive !== false) {
      setVisible(true);
      fadeRef.current = Math.max(fadeRef.current, 0.001);
    } else {
      fadeRef.current = Math.min(1, Math.max(fadeRef.current, 0.001));
      setTimeout(() => setVisible(false), 700);
    }
  }, [invincibilityActive]);

  useFrame(({ camera, clock }, delta) => {
    if (!shieldRef.current || !materialRef.current) return;

    shieldRef.current.position.copy(camera.position);

    // More pronounced pulse for invincibility
    const pulseAmp = 0.25; // Increased from 0.15
    const pulse = 1 + Math.sin(clock.elapsedTime * 4) * pulseAmp;
    shieldRef.current.scale.setScalar(pulse);

    // Animate fade
    const target = visible ? 1 : 0;
    const speed = 2.6;
    if (fadeRef.current < target) fadeRef.current = Math.min(target, fadeRef.current + delta * speed);
    if (fadeRef.current > target) fadeRef.current = Math.max(target, fadeRef.current - delta * speed);

    const opacity = fadeRef.current;
    // Subtle halo effect with pulsing
    const pulsingOpacity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.25;
    materialRef.current.opacity = 0.25 * opacity * pulsingOpacity;
    materialRef.current.emissiveIntensity = 0.9 * opacity * pulsingOpacity;

    // Cycle through colors over time
    const colorChangeSpeed = 3; // changes per second
    const newIndex = Math.floor(clock.elapsedTime * colorChangeSpeed) % colors.length;
    if (newIndex !== colorIndexRef.current) {
      colorIndexRef.current = newIndex;
      const newColor = colors[newIndex];
      materialRef.current.color.set(newColor);
      materialRef.current.emissive.set(newColor);
    }

    // Back-and-forth rotation wave effect
    const rotationWave = Math.sin(clock.elapsedTime * 2) * 0.2;
    shieldRef.current.rotation.y += delta * 0.5;
    shieldRef.current.rotation.x = rotationWave * 0.6;
    shieldRef.current.rotation.z = rotationWave * 0.4;
  });

  if (!visible && fadeRef.current <= 0) return null;

  const currentColor = colors[colorIndexRef.current];

  // Pulsing fade animation (opacity fades in/out while active)
  const pulsingOpacity = 0.5 + Math.sin(fadeRef.current * 10) * 0.25; // 0.25 to 0.75 range
  
  return (
    <group ref={shieldRef} frustumCulled={false}>
      {/* Outer glowing halo aura */}
      <mesh>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial
          color={currentColor}
          transparent
          opacity={0.08 * fadeRef.current * pulsingOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Main horizontal halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.15, 12, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color={currentColor}
          transparent
          opacity={0.25 * pulsingOpacity}
          emissive={currentColor}
          emissiveIntensity={0.9 * pulsingOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Vertical halo ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[2.5, 0.12, 10, 64]} />
        <meshStandardMaterial
          color={currentColor}
          transparent
          opacity={0.20 * pulsingOpacity}
          emissive={currentColor}
          emissiveIntensity={0.65 * pulsingOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Diagonal halo ring */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.5, 0.10, 8, 64]} />
        <meshStandardMaterial
          color={currentColor}
          transparent
          opacity={0.18 * pulsingOpacity}
          emissive={currentColor}
          emissiveIntensity={0.5 * pulsingOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Bright energy core */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial
          color={currentColor}
          transparent
          opacity={0.4 * fadeRef.current * pulsingOpacity}
        />
      </mesh>
    </group>
  );
};

export default InvincibilityEffect;
