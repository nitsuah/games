// Scene.js
import React, { useRef, useEffect, useState } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import * as THREE from "three"; // Import THREE
import Controls from "./_comps/Controls";
import Player from "./_comps/PlayerLogic"; // Update import
import Floor from "../../_components/objects/Floor";
import Cube from "../../_components/objects/Cube";

// Extend React Three Fiber's namespace to include BoxGeometry
extend({ BoxGeometry: THREE.BoxGeometry });

function Range() {
  const playerRef = useRef();
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);

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
      shadows // Enables shadow rendering
      gl={{ alpha: false }} // Configures WebGL renderer
      camera={{ position: [playerPosition[0], playerPosition[1] + 5, playerPosition[2] + 5], fov: 50 }} // Camera above player
      style={{ background: '#000000', width: "99vw", height: "98vh" }} // Ensure full viewport
    >
      <color attach="background" args={["grey"]} />
      <Physics gravity={[0, -20, 0]}> {/* Increased gravity for tank behavior */}
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
        <Player ref={playerRef} onPositionChange={setPlayerPosition} /> {/* Track player position */}
        <Cube position={[0, 10, -2]} color="rebeccapurple" />
        <Cube position={[0, 20, -2]} color="pink" />
        <Cube position={[0, 30, -2]} color="darkorange" />
        <Floor size={[500, 500]} color="black" />
      </Physics>
    </Canvas>
  );
}

export default Range;
