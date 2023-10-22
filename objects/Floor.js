// Floor.js
import React from "react";
import { usePlane } from "@react-three/cannon";

const Floor = ({ size = [1000, 1000], color = "green", ...props }) => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));

  return (
    <mesh ref={ref} receiveShadow castShadow>
      <planeBufferGeometry attach="geometry" args={size} />
      <shadowMaterial attach="material" color={color} />
    </mesh>
  );
};

export default Floor;