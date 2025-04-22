// fps.jsx
import React, { useRef, useEffect, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { Stats, Debug } from "@react-three/drei"; // Import Debug
import { Physics, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import { Raycaster } from "three";
import Controls from "./_comps/Controls";
import PlayerLogic from "./_comps/PlayerLogic";
import Floor from "../../_components/objects/Floor";
import Cube from "../../_components/objects/Cube";
import Crosshair from "./_comps/Crosshair";
import Target from "./_comps/Target";
import Bullet from "./_comps/Bullet";
import Explosion from "./_comps/Explosion";
import Decal from "./_comps/Decal";
import ShootingHandler from "./_comps/ShootingHandler";
import HillyFloor from "../../_components/objects/HillyFloor";

// Extend React Three Fiber's namespace to include BoxGeometry
extend({ BoxGeometry: THREE.BoxGeometry });

function Range() {
  const playerRef = useRef();
  const terrainRef = useRef(); // Reference to the terrain mesh
  const cameraRef = useRef(); // Reference to the camera
  const [playerPosition, setPlayerPosition] = useState([0, 1, 0]); // Start Y at 1
  const [score, setScore] = useState(0);
  const [bullets, setBullets] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [decals, setDecals] = useState([]);

  const handleTargetHit = () => {
    setScore((prevScore) => prevScore + 100);
    console.log("Target hit! Score:", score + 100);
  };

  const handleBulletHit = (hitPosition, normal) => {
    if (!hitPosition || !normal) {
      console.warn("Invalid hit position or normal vector for decal placement.");
      return;
    }
    setDecals((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, position: hitPosition, normal }, // Generate a unique id
    ]);
  };

  return (
    <>
      <Canvas
        shadows
        gl={{ alpha: false }}
        camera={{ position: [playerPosition[0], playerPosition[1] + 5, playerPosition[2] + 5], fov: 50 }}
        style={{ background: "#000000", width: "99vw", height: "98vh" }}
          >
            <color attach="background" args={["lightblue"]} />
            <Stats showPanel={0} className="stats" />
            <Physics gravity={[0, -20, 0]}>
              <HillyFloor ref={terrainRef} width={250} depth={250} hillHeight={5} color="green" /> {/* Terrain */}
              <Floor size={[500, 500]} color="black" position={[0, -1, 0]} /> {/* Gutter floor */}
              <PlayerLogic ref={playerRef} onPositionChange={setPlayerPosition} />
              <Controls playerRef={playerRef} terrainRef={terrainRef} /> {/* Use Controls from Controls.js */}
              <hemisphereLight intensity={0.35} />
              <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
              <Cube position={[0, 10, -2]} color="rebeccapurple" />
              <Cube position={[0, 20, -2]} color="pink" />
              <Cube position={[0, 30, -2]} color="darkorange" />
              <Target position={[5, 1, -5]} color="red" type="explode" onHit={handleTargetHit} />
              <Target position={[-5, 1, -10]} color="green" type="shrink" onHit={handleTargetHit} />
              <Target position={[0, 1, -15]} color="blue" type="default" onHit={handleTargetHit} />
              {bullets.map((bullet) => (
                <Bullet
                  key={bullet.id}
                  start={bullet.start}
                  end={bullet.end}
                  onComplete={() => {
                    try {
                      const raycaster = new THREE.Raycaster();
                      raycaster.set(bullet.start, new THREE.Vector3().subVectors(bullet.end, bullet.start).normalize());
                      const intersects = raycaster.intersectObject(terrainRef.current, true);
                      if (intersects.length > 0) {
                        const { point, face } = intersects[0];
                        handleBulletHit(point, face.normal); // Place decal at hit point
                      }
                    } catch (error) {
                      console.error("Error in Bullet onComplete raycasting:", error);
                    }
                    setBullets((prev) => prev.filter((b) => b.id !== bullet.id));
                  }}
                  />
                ))}
                {decals.map((decal) => (
                  <Decal key={decal.id} position={decal.position} playerPosition={playerPosition} />
                ))}
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
      >Score: {score}</div>
    </>
  );
}

export default Range;
