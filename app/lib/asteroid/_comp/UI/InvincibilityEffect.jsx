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
    // More visible wireframe
    materialRef.current.opacity = 0.30 * opacity + 0.05 * (1 - opacity);
    materialRef.current.emissiveIntensity = 1.8 * opacity;

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

  return (
    <group ref={shieldRef} frustumCulled={false}>
      {/* Outer glowing aura */}
      <mesh>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshBasicMaterial
          color={currentColor}
          transparent
          opacity={0.15 * fadeRef.current}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Main wireframe sphere with color cycling */}
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={currentColor}
          transparent
          opacity={0.25}
          emissive={currentColor}
          emissiveIntensity={1.2}
          wireframe={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner rotating wireframe */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshStandardMaterial
          color={currentColor}
          transparent
          opacity={0.18}
          emissive={currentColor}
          emissiveIntensity={0.8}
          wireframe={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Pulsing energy rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.15, 8, 32]} />
        <meshStandardMaterial
          color={currentColor}
          transparent
          opacity={0.4 * fadeRef.current}
          emissive={currentColor}
          emissiveIntensity={1.5}
        />
      </mesh>
      
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[2.5, 0.12, 8, 32]} />
        <meshStandardMaterial
          color={currentColor}
          transparent
          opacity={0.35 * fadeRef.current}
          emissive={currentColor}
          emissiveIntensity={1.3}
        />
      </mesh>
      
      {/* Bright core */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={currentColor}
          transparent
          opacity={0.8 * fadeRef.current}
        />
      </mesh>
    </group>
  );
};

export default InvincibilityEffect;
