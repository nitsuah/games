import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useBox } from "@react-three/cannon";

const Player = forwardRef((props, ref) => {
  const [playerRef, api] = useBox(() => ({
    mass: 50,
    position: [1, 5, 0],
    rotation: [0, 0, 0],
    linearDamping: 0.98, // Smooth movement
    angularDamping: 0.98,
    // Only pass serializable data here
  }));

  // Expose the `api` to the parent via the `ref`
  useImperativeHandle(ref, () => ({
    api,
  }));

  // Log hitbox coordinates to the console
  useEffect(() => {
    const unsubscribe = api.position.subscribe(([x, y, z]) => {
      console.log(`HITBOX X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)}`);
    });
    return unsubscribe;
  }, [api.position]);

  return (
    <mesh receiveShadow castShadow ref={playerRef}>
      <boxGeometry />
      <meshLambertMaterial attach="material" color="blue" />
    </mesh>
  );
});

export default Player;
