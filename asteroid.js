import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hit ? 'red' : 'green'} />
    </mesh>
  );
};

const ShootingRange = () => {
  const [ship, setShip] = useState(null);
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);

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
    setHitCount((prevCount) => prevCount + 1);
  };

  const updateMissCount = () => {
    setMissCount((prevCount) => prevCount + 1);
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
          pointerEvents: 'none',
        }}
      >
        <p>Hits: {hitCount}</p>
        <p>Misses: {missCount}</p>
        <p>Accuracy: {accuracy.toFixed(2)}%</p>
      </div>
      <Canvas>
        <OrbitControls />
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