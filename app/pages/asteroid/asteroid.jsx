import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import tr3b from '../../../models/TR-3B.glb';

const Target = ({ position, updateHitCount, updateMissCount }) => {
  const [hit, setHit] = useState(false);
  const ref = useRef();
  const direction = useRef({ x: Math.random() - 0.5, y: Math.random() - 0.5 });
  // const shipRef = useRef();

  useFrame(() => {

    // Rotate the target
    ref.current.rotation.y += 0.01;

    // Move the target
    const speed = 0.01;
    ref.current.position.x += speed * direction.current.x;
    ref.current.position.y += speed * direction.current.y;

    if (ref.current.position.y > 2 || ref.current.position.y < -2) {
      direction.current.y *= -1;
    }
    if (ref.current.position.x > 2 || ref.current.position.x < -2) {
      direction.current.x *= -1;
    }
  });

  const handleClick = (event) => {
    // Check if the target was clicked 
    if (event.object === ref.current && !hit) { // Only count the hit if the target is green
      setHit(true);
      updateHitCount();
      setTimeout(() => {
        setHit(false);
      }, 3000); // Reset the hit state after 3 seconds
    } else {
      updateMissCount();
    }
  };

  return (
    <mesh ref={ref} position={position} onClick={(event) => handleClick(event)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hit ? 'red' : 'green'} />
    </mesh>
  );
};

const ShootingRange = () => {
  const [ship, setShip] = useState(null);
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const wasTargetHit = useRef(false);
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'w') setKeys(prev => ({ ...prev, w: true }));
      if (e.key.toLowerCase() === 'a') setKeys(prev => ({ ...prev, a: true }));
      if (e.key.toLowerCase() === 's') setKeys(prev => ({ ...prev, s: true }));
      if (e.key.toLowerCase() === 'd') setKeys(prev => ({ ...prev, d: true }));
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === 'w') setKeys(prev => ({ ...prev, w: false }));
      if (e.key.toLowerCase() === 'a') setKeys(prev => ({ ...prev, a: false }));
      if (e.key.toLowerCase() === 's') setKeys(prev => ({ ...prev, s: false }));
      if (e.key.toLowerCase() === 'd') setKeys(prev => ({ ...prev, d: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const moveSpeed = 0.1;
    if (keys.w) camera.position.z -= moveSpeed;
    if (keys.s) camera.position.z += moveSpeed;
    if (keys.a) camera.position.x -= moveSpeed;
    if (keys.d) camera.position.x += moveSpeed;
  });

/*   useEffect(() => {
    // Load the ship model
    const loader = new GLTFLoader();
    loader.load({tr3b}, (gltf) => {
      const shipModel = gltf.scene;
      shipModel.position.z = -5; // Set the initial position of the ship in front of the camera
      setShip(shipModel);
    });
  }, []); */

  const updateHitCount = () => {
    wasTargetHit.current = true;
    setHitCount((prevCount) => prevCount + 1);
  };

  const updateMissCount = () => {
    setMissCount((prevCount) => prevCount + 1);
  };

  const handleCanvasPointerDown = () => {
    // If no target was hit, count as a miss
    if (!wasTargetHit.current) {
      updateMissCount();
    }
    // Reset for next click
    wasTargetHit.current = false;
  };

  const accuracy = (hitCount / (hitCount + missCount)) * 100;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          zIndex: 1,
          color: 'white',
          background: 'rgba(0,0,0,0.6)',
          padding: '12px 18px',
          borderRadius: '8px 0 0 0',
          pointerEvents: 'none',
        }}
      >
        <p>Hits: {hitCount}</p>
        <p>Misses: {missCount}</p>
        <p>Accuracy: {accuracy.toFixed(2)}%</p>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 0,
          width: '100%',
          textAlign: 'center',
          color: 'white',
          zIndex: 2,
          pointerEvents: 'none',
          fontWeight: 'bold',
          textShadow: '0 0 8px #000',
        }}
      >
        <span>Click to lock pointer and control camera</span>
      </div>
      {/* Crosshair */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '32px',
          height: '32px',
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red',
        }}
      >
        <div
          style={{
            width: '2px',
            height: '20px',
            background: 'white',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '1px',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            width: '20px',
            height: '2px',
            background: 'white',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '1px',
            opacity: 0.8,
          }}
        />
      </div>
      <Canvas onPointerDown={handleCanvasPointerDown}>
        <PointerLockControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        {/*
         {ship && (
          <group position={[0, 0, -5]}>
            <primitive object={ship} />
          </group>
        )} 
        */}
        <Target position={[0, 2, -10]} updateHitCount={updateHitCount} updateMissCount={updateMissCount} />
        <Target position={[0, 0, -10]} updateHitCount={updateHitCount} updateMissCount={updateMissCount} />
        <Target position={[2, 0, -10]} updateHitCount={updateHitCount} updateMissCount={updateMissCount} />
      </Canvas>
    </div>
  );
};

export default ShootingRange;