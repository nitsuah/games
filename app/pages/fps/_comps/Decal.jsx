import React from "react";

const Decal = ({ position, normal }) => {
  return (
    <mesh position={position} rotation={normal}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshStandardMaterial color="black" transparent opacity={0.5} />
    </mesh>
  );
};

export default Decal;
