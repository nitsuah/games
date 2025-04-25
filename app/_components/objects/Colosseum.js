import React from "react";
import { useCylinder } from "@react-three/cannon";

const Colosseum = ({ radius = 50, height = 20, thickness = 5, color = "gray" }) => {
  // Add physics to the colosseum
  const [ref] = useCylinder(() => ({
    mass: 0, // Static object
    args: [radius, radius, height * 2, 32], // Double the height
    position: [0, 0, 0], // Center the colosseum
  }));

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[radius, radius, thickness, 32, 1, true]} />
      <meshStandardMaterial color={color} side={2} />
    </mesh>
  );
};

export default Colosseum;
