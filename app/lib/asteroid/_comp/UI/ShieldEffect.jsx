import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ShieldEffect: wireframe sphere that fades in/out and pulses when active.
const ShieldEffect = ({ shieldActive }) => {
  const shieldRef = useRef();
  const materialRef = useRef();
  const [visible, setVisible] = useState(false);
  const fadeRef = useRef(0); // 0..1 fade value

  // Show/hide logic when shieldActive toggles
  useEffect(() => {
    if (shieldActive && shieldActive !== 0 && shieldActive !== false) {
      // start fade in
      setVisible(true);
      // ensure fadeRef begins increasing
      fadeRef.current = Math.max(fadeRef.current, 0.001);
    } else {
      // trigger fade out; keep visible until fade completes
      fadeRef.current = Math.min(1, Math.max(fadeRef.current, 0.001));
      setTimeout(() => setVisible(false), 700);
    }
  }, [shieldActive]);

  useFrame(({ camera, clock }, delta) => {
    if (!shieldRef.current || !materialRef.current) return;

    // follow camera
    shieldRef.current.position.copy(camera.position);

    // More pronounced pulse: vary both scale and slight back-and-forth rotation
    const pulseAmp = 0.20; // Increased from 0.08
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.5) * pulseAmp;
    shieldRef.current.scale.setScalar(pulse);

    // animate fade in/out
    // fade logic: move fadeRef toward target (visible?1:0)
    const target = visible ? 1 : 0;
    const speed = 2.6; // fade speed
    if (fadeRef.current < target) fadeRef.current = Math.min(target, fadeRef.current + delta * speed);
    if (fadeRef.current > target) fadeRef.current = Math.max(target, fadeRef.current - delta * speed);

    const opacity = fadeRef.current;
    // Subtle halo effect with pulsing - reduced opacity by 50%
    const pulsingOpacity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.25;
    materialRef.current.opacity = 0.25 * opacity * pulsingOpacity;
    materialRef.current.emissiveIntensity = 0.6 * opacity * pulsingOpacity;
    
    // Gentle back-and-forth rotation (subtle wave effect)
    const rotationWave = Math.sin(clock.elapsedTime * 1.5) * 0.15;
    shieldRef.current.rotation.y += delta * 0.25;
    shieldRef.current.rotation.x = rotationWave * 0.5;
    shieldRef.current.rotation.z = rotationWave * 0.3;
  });

  if (!visible && fadeRef.current <= 0) return null;

  // Pulsing fade animation (opacity fades in/out while active)
  const pulsingOpacity = 0.5 + Math.sin(fadeRef.current * 10) * 0.25; // 0.25 to 0.75 range
  
  // Create a blue-themed halo effect using rings at different angles
  return (
    <group ref={shieldRef} frustumCulled={false}>
      {/* Outer glowing blue aura - reduced opacity to see explosions better */}
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial
          color="#0099ff"
          transparent
          opacity={0.03 * fadeRef.current * pulsingOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Main horizontal blue halo ring - tilted forward to avoid blocking center view */}
      <mesh rotation={[Math.PI / 2 - 0.4, 0, 0]}>
        <torusGeometry args={[2.4, 0.12, 12, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#00ccff"
          transparent
          opacity={0.25 * pulsingOpacity}
          emissive="#00ffff"
          emissiveIntensity={0.6 * pulsingOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Vertical blue halo ring */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[2.4, 0.10, 10, 64]} />
        <meshStandardMaterial
          color="#0099ff"
          transparent
          opacity={0.18 * pulsingOpacity}
          emissive="#00ddff"
          emissiveIntensity={0.5 * pulsingOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Diagonal blue halo ring */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[2.4, 0.08, 8, 64]} />
        <meshStandardMaterial
          color="#0088ff"
          transparent
          opacity={0.15 * pulsingOpacity}
          emissive="#00aaff"
          emissiveIntensity={0.4 * pulsingOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Bright blue energy core */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3 * fadeRef.current * pulsingOpacity}
        />
      </mesh>
    </group>
  );
};

export default ShieldEffect;
