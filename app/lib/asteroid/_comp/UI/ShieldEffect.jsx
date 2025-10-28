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

  // pulse scale (slightly stronger pulse when visible)
  const pulseAmp = 0.08;
  const pulse = 1 + Math.sin(clock.elapsedTime * 2.5) * pulseAmp;
    shieldRef.current.scale.setScalar(pulse);

    // animate fade in/out
    // fade logic: move fadeRef toward target (visible?1:0)
    const target = visible ? 1 : 0;
    const speed = 2.6; // fade speed
    if (fadeRef.current < target) fadeRef.current = Math.min(target, fadeRef.current + delta * speed);
    if (fadeRef.current > target) fadeRef.current = Math.max(target, fadeRef.current - delta * speed);

  const opacity = fadeRef.current;
  // wireframe should be subtle; emissive pulses with opacity
  materialRef.current.opacity = 0.08 * opacity + 0.02 * (1 - opacity);
  materialRef.current.emissiveIntensity = 0.9 * opacity;
    // subtle rotation so it feels alive
    shieldRef.current.rotation.y += delta * 0.25;
  });

  if (!visible && fadeRef.current <= 0) return null;

  return (
    <mesh ref={shieldRef} frustumCulled={false}>
      <sphereGeometry args={[2.6, 48, 48]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#00ffff"
        transparent
        opacity={0.15}
        emissive="#00ffff"
        emissiveIntensity={0.4}
        wireframe={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default ShieldEffect;
