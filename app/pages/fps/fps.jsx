// Scene.js
import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import Controls from "./_comps/Controls";
import Player from "./_comps/Player";
import Floor from "./objects/Floor";
import Cube from "./objects/Cube";

function Range() {
  const playerRef = useRef();

  useEffect(() => {
    const initializePlayerPosition = () => {
      if (playerRef.current) {
        playerRef.current.api.position.set(0, 0, 0);
      }
    };

    initializePlayerPosition();
  }, [playerRef]);

  return (
    <Canvas
      shadowMap
      sRGB
      gl={{ alpha: false }}
      camera={{ position: [-1, 1, 5], fov: 50, mass: 1 }}
    >
      <color attach="background" args={["grey"]} />
      <Physics>
        <Stats />
        <Controls playerRef={playerRef} />
        <hemisphereLight intensity={0.35} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          castShadow
        />
        {/* Pass playerRef to Player component */}
        <Player ref={playerRef} />
        <Cube position={[0, 10, -2]} color="rebeccapurple" />
        <Cube position={[0, 20, -2]} color="pink" />
        <Cube position={[0, 30, -2]} color="darkorange" />
        <Floor size={[500, 500]} color="darkseagreen" />
      </Physics>
    </Canvas>
  );
}

export default Range;
