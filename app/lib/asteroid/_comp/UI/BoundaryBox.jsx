import { useRef } from 'react';
import * as THREE from 'three';

// BoundaryBox: visualize the playing field where objects bounce
const BoundaryBox = () => {
  const boxRef = useRef();
  
  // Match the bounds from Target.jsx: { min: (-50, -50, -50), max: (50, 50, 50) }
  const size = [100, 100, 100]; // width, height, depth
  
  return (
    <lineSegments ref={boxRef}>
      <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
      <lineBasicMaterial color="#444444" opacity={0.3} transparent />
    </lineSegments>
  );
};

export default BoundaryBox;
