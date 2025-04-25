// Floor.js
import React from "react";
import { usePlane } from "@react-three/cannon";
import { extend } from "@react-three/fiber";
import * as THREE from "three"; // Import THREE to extend its namespace

// Extend React Three Fiber's namespace to include PlaneGeometry
extend({ PlaneGeometry: THREE.PlaneGeometry });

const Floor = ({ size = [1000, 1000], color = "green", ...props }) => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));

  return (
    <mesh ref={ref} receiveShadow castShadow>
      <planeGeometry attach="geometry" args={size} />
      <shadowMaterial attach="material" color={color} />
    </mesh>
  );
};

export default Floor;