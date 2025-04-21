// Scene.js
import React, { useRef, useEffect, useState } from "react";
import { Canvas, extend, useThree } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import * as THREE from "three"; // Import THREE
import Controls from "./_comps/Controls";
import Player from "./_comps/PlayerLogic"; // Update import
import Floor from "../../_components/objects/Floor";
import Cube from "../../_components/objects/Cube";
import styled from "styled-components"; // Add this import for styling
import Crosshair from "./_comps/Crosshair"; // Import the Crosshair component
import Target from "./_comps/Target"; // Import the Target component
import Bullet from "./_comps/Bullet";
import Explosion from "./_comps/Explosion";
import Decal from "./_comps/Decal";
import ShootingHandler from "./_comps/ShootingHandler"; // Import ShootingHandler

// Extend React Three Fiber's namespace to include BoxGeometry
extend({ BoxGeometry: THREE.BoxGeometry });

function Range() {
  const playerRef = useRef();
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
  const [score, setScore] = useState(0); // Add score state
  const [bullets, setBullets] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [decals, setDecals] = useState([]);

  useEffect(() => {
    const initializePlayerPosition = () => {
      if (playerRef.current) {
        playerRef.current.api.position.set(0, 0, 0);
      }
    };

    initializePlayerPosition();
  }, [playerRef]);

  // Handle target hit
  const handleTargetHit = () => {
    setScore((prevScore) => prevScore + 100); // Increment score by 100
    console.log("Target hit! Score:", score + 100);
  };

  return (
    <>
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

          {/* Add targets with different behaviors */}
          <Target position={[5, 1, -5]} color="red" type="explode" onHit={handleTargetHit} />
          <Target position={[-5, 1, -10]} color="green" type="shrink" onHit={handleTargetHit} />
          <Target position={[0, 1, -15]} color="blue" type="default" onHit={handleTargetHit} />

          <Floor size={[500, 500]} color="black" />

          {/* Shooting handler */}
          <ShootingHandler
            playerPosition={playerPosition}
            setBullets={setBullets}
            setExplosions={setExplosions}
            setDecals={setDecals}
          />
        </Physics>
      </Canvas>
      <Crosshair />
      <div
        style={{
          position: "absolute",
          top: "50px",
          left: "10px",
          color: "white",
          fontSize: "20px",
        }}
      >
        Score: {score}
      </div>
    </>
  );
}

export default Range;
