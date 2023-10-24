// Cube.js
import React from "react";
import { useBox } from "@react-three/cannon";

function Cube({ position, color }) {
  const [ref] = useBox(() => ({
    mass: 1,
    position,
    rotation: [0.4, 0.2, 0.5],
  }));

  return (
    <mesh receiveShadow castShadow ref={ref}>
      <boxBufferGeometry />
      <meshLambertMaterial attach="material" color={color} />
    </mesh>
  );
}

export default Cube;