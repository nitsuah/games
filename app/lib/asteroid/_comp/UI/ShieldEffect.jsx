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
    // More pronounced wireframe - increased base opacity and emissive
    materialRef.current.opacity = 0.25 * opacity + 0.04 * (1 - opacity);
    materialRef.current.emissiveIntensity = 1.6 * opacity;
    
    // Gentle back-and-forth rotation (subtle wave effect)
    const rotationWave = Math.sin(clock.elapsedTime * 1.5) * 0.15;
    shieldRef.current.rotation.y += delta * 0.25;
    shieldRef.current.rotation.x = rotationWave * 0.5;
    shieldRef.current.rotation.z = rotationWave * 0.3;
  });

  if (!visible && fadeRef.current <= 0) return null;

  // Create a ring/halo effect using multiple rings at different angles + outer sphere
  return (
    <group ref={shieldRef} frustumCulled={false}>
      {/* Outer pulsing wireframe sphere */}
      <mesh>
        <sphereGeometry args={[3.2, 16, 16]} />
        <meshBasicMaterial
          color="#00aaff"
          transparent
          opacity={0.12 * fadeRef.current}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Hexagonal shield panels effect */}
      <mesh>
        <sphereGeometry args={[2.8, 8, 8]} />
        <meshStandardMaterial
          color="#0088ff"
          transparent
          opacity={0.08 * fadeRef.current}
          emissive="#00ffff"
          emissiveIntensity={0.3 * fadeRef.current}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Main horizontal ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.10, 10, 64]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#00ffff"
          transparent
          opacity={0.5}
          emissive="#00ffff"
          emissiveIntensity={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Vertical ring 1 */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[2.4, 0.08, 10, 64]} />
        <meshStandardMaterial
          color="#00ddff"
          transparent
          opacity={0.35}
          emissive="#00ffff"
          emissiveIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Diagonal ring */}
      <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <torusGeometry args={[2.4, 0.07, 8, 64]} />
        <meshStandardMaterial
          color="#00ccff"
          transparent
          opacity={0.25}
          emissive="#00ffff"
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Energy core glow */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.6 * fadeRef.current}
        />
      </mesh>
    </group>
  );
};

export default ShieldEffect;
