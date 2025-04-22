// Scene.js
import React, { useRef, useEffect, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber"; // Import useFrame
import { Stats, Debug } from "@react-three/drei"; // Import Debug
import { Physics, usePlane } from "@react-three/cannon";
import * as THREE from "three"; // Import THREE
import Controls from "./_comps/Controls";
import PlayerLogic from "./_comps/PlayerLogic"; // Update import
import Floor from "../../_components/objects/Floor";
import Cube from "../../_components/objects/Cube";
import Crosshair from "./_comps/Crosshair"; // Import the Crosshair component
import Target from "./_comps/Target"; // Import the Target component
import Bullet from "./_comps/Bullet";
import Explosion from "./_comps/Explosion";
import Decal from "./_comps/Decal";
import ShootingHandler from "./_comps/ShootingHandler"; // Import ShootingHandler
import HillyFloor from "../../_components/objects/HillyFloor"; // Import the HillyFloor component

// Extend React Three Fiber's namespace to include BoxGeometry
extend({ BoxGeometry: THREE.BoxGeometry });

function Range() {
  const playerRef = useRef();
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
  const [score, setScore] = useState(0); // Add score state
  const [bullets, setBullets] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [decals, setDecals] = useState([]);

  // DebugPlane component to visualize the physics floor
  const DebugPlane = () => {
    usePlane(() => ({
      position: [0, -10, 0],
      rotation: [-Math.PI / 2, 0, 0],
      type: "Static",
    }));
    return (
      <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="red" wireframe />
      </mesh>
    );
  };
  
  // Sync player position with physics engine
  const SyncPlayerPosition = () => {
    useFrame(() => {
      if (playerRef.current) {
        playerRef.current.api.position.subscribe((pos) => {
          setPlayerPosition(pos);
        });
      }
    });
    return null; // This component doesn't render anything
  };

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
        camera={{ position: [playerPosition[0], playerPosition[1], playerPosition[2] + 5], fov: 50 }} // Camera above player
        style={{ background: '#000000', width: "99vw", height: "98vh" }} // Ensure full viewport
      >
        <color attach="background" args={["grey"]} />
        <Physics gravity={[0, -20, 0]}> {/* Physics provider */}
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
          <HillyFloor width={250} depth={250} hillHeight={5} color="green" /> {/* Add the hilly floor */}
          <Floor size={[500, 500]} color="black" position={[0, -10, 0]} /> {/* Add a gutter floor below */}
          <PlayerLogic ref={playerRef} onPositionChange={setPlayerPosition} /> {/* Track player position */}
          <SyncPlayerPosition /> {/* Sync player position */}
          <Cube position={[0, 10, -2]} color="rebeccapurple" />
          <Cube position={[0, 20, -2]} color="pink" />
          <Cube position={[0, 30, -2]} color="darkorange" />

          {/* Add targets with different behaviors */}
          <Target position={[5, 1, -5]} color="red" type="explode" onHit={handleTargetHit} />
          <Target position={[-5, 1, -10]} color="green" type="shrink" onHit={handleTargetHit} />
          <Target position={[0, 1, -15]} color="blue" type="default" onHit={handleTargetHit} />

          {/* Render bullets */}
          {bullets.map((bullet) => (
            <Bullet
              key={bullet.id}
              start={bullet.start}
              end={bullet.end}
              onComplete={() =>
                setBullets((prev) => prev.filter((b) => b.id !== bullet.id))
              }
            />
          ))}

          {/* Render explosions
          {explosions.map((explosion) => (
            <Explosion
              key={explosion.id}
              position={explosion.position}
              onComplete={() =>
                setExplosions((prev) =>
                  prev.filter((e) => e.id !== explosion.id)
                )
              }
            />
          ))} */}

          {/* Render decals */}
          {decals.map((decal) => (
            <Decal
              key={decal.id}
              position={decal.position}
              normal={decal.normal}
            />
          ))}

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
