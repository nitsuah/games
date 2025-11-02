'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import BreakoutGame from './BreakoutGame';

export default function BreakoutCanvas({ onExit }) {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0520']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <BreakoutGame onExit={onExit} />
        
        {/* OrbitControls for debugging - can remove later */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
