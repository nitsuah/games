import React, { forwardRef, useEffect } from "react";
import { useBox } from "@react-three/cannon";

const Player = forwardRef((props, ref) => {
  // Log Hitbox coordinates to console
  useEffect(() => {
    if (ref && ref.current) {
      console.log(
        "HITBOX X:",
        ref.current.position.x.toFixed(2),
        "Y:",
        ref.current.position.y.toFixed(2),
        "Z:",
        ref.current.position.z.toFixed(2)
      );
    } else {
      console.log("cant find hitbox");
    }
  }, [ref]);

  const [playerRef] = useBox(() => ({
    mass: 1,
    position: [0, 5, 0],
    rotation: [0, 0, 0],
    damping: 0.8,
    ...props,
    ref,
  }));

  return (
    <mesh receiveShadow castShadow ref={playerRef}>
      <boxBufferGeometry />
      <meshLambertMaterial attach="material" color="blue" />
    </mesh>
  );
});

export default Player;
