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
import PowerUp from "./_comps/PowerUp"; // Import the PowerUp component

// Extend React Three Fiber's namespace to include BoxGeometry
extend({ BoxGeometry: THREE.BoxGeometry });

function Range() {
  const playerRef = useRef();
  const terrainRef = useRef(); // Reference to the terrain mesh
  const cameraRef = useRef(); // Reference to the camera
  const [playerPosition, setPlayerPosition] = useState([0, 1, 0]); // Start Y at 1
  const [playerHealth, setPlayerHealth] = useState(100); // Track player health
  const [score, setScore] = useState(0);
  const [bullets, setBullets] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [decals, setDecals] = useState([]);
  const [rapidFire, setRapidFire] = useState(false); // Track rapid fire state
  const [speedBoost, setSpeedBoost] = useState(false); // Track speed boost state
  const [playerSpeed, setPlayerSpeed] = useState(0.1); // Default player speed

  const decalsRef = useRef([]); // Use ref to store decals
  const raycaster = useRef(new THREE.Raycaster()); // Reuse a single raycaster instance

  const handleTargetHit = () => {
    setScore((prevScore) => prevScore + 100);
    console.log("Target hit! Score:", score + 100);
  };

  const handleBulletHit = (hitPosition, normal) => {
    if (!hitPosition || !normal) {
      console.warn("Invalid hit position or normal vector for decal placement.");
      return;
    }
    const newDecal = { id: `${Date.now()}-${Math.random()}`, position: hitPosition, normal };
    decalsRef.current.push(newDecal); // Update ref directly
    setDecals([...decalsRef.current]); // Trigger re-render
  };

  const handlePowerUpCollect = (type) => {
    switch (type) {
      case "health":
        console.log("Collected Health Power-Up!");
        setPlayerHealth((prevHealth) => Math.min(prevHealth + 25, 100)); // Restore health up to 100
        break;
      case "shield":
        console.log("Collected Shield Power-Up!");
        // Implement shield activation logic here
        break;
      case "rapidFire":
        console.log("Collected Rapid Fire Power-Up!");
        setRapidFire(true);
        setTimeout(() => setRapidFire(false), 10000); // Deactivate after 10 seconds
        break;
      case "speed":
        console.log("Collected Speed Power-Up!");
        setSpeedBoost(true);
        setPlayerSpeed(0.5); // Increase the speed
        setTimeout(() => {
          setSpeedBoost(false);
          setPlayerSpeed(0.1); // Reset to default speed
        }, 10000); // Deactivate after 10 seconds
        break;
      case "death":
        console.log("Collected Death Debuff!");
        setPlayerHealth((prevHealth) => Math.max(prevHealth - 50, 0)); // Reduce health by 50, minimum 0
        break;
      default:
        console.warn("Unknown Power-Up type:", type);
    }
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
          <HillyFloor
            ref={terrainRef}
            width={250}
            depth={250}
            hillHeight={5}
            color="green"
            heightmapUrl="/terrain003.exr"
          /> {/* Terrain */}
          <Floor size={[500, 500]} color="black" position={[0, -1, 0]} /> {/* Gutter floor */}
          <hemisphereLight intensity={0.35} />
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
          <PlayerLogic ref={playerRef} onPositionChange={setPlayerPosition} />
          <Controls playerRef={playerRef} terrainRef={terrainRef} playerSpeed={playerSpeed} /> {/* Pass player speed */}
          <PowerUp position={[10, 3, -10]} type="health" onCollect={handlePowerUpCollect} />
          <PowerUp position={[15, 3, -15]} type="shield" onCollect={handlePowerUpCollect} />
          <PowerUp position={[20, 3, -20]} type="rapidFire" onCollect={handlePowerUpCollect} />
          <PowerUp position={[25, 3, -25]} type="speed" onCollect={handlePowerUpCollect} />
          <PowerUp position={[30, 3, -30]} type="death" onCollect={handlePowerUpCollect} />
          <Cube position={[5, 15, -5]} color="rebeccapurple" />
          <Cube position={[10, 20, -10]} color="pink" />
          <Cube position={[15, 25, -15]} color="darkorange" />
          <Cube position={[5, 15, -5]} color="rebeccapurple" />
          <Cube position={[10, 20, -10]} color="pink" />
          <Cube position={[15, 25, -15]} color="darkorange" />
          <Cube position={[5, 15, -5]} color="rebeccapurple" />
          <Cube position={[10, 20, -10]} color="pink" />
          <Cube position={[15, 25, -15]} color="darkorange" />
          <Target position={[20, 15, -20]} color="red" type="explode" onHit={handleTargetHit} />
          <Target position={[-10, 15, -25]} color="green" type="shrink" onHit={handleTargetHit} />
          <Target position={[0, 15, -30]} color="blue" type="default" onHit={handleTargetHit} />
          {bullets.map((bullet) => (
            <Bullet
              key={bullet.id}
              start={bullet.start}
              end={bullet.end}
              onComplete={() => {
                try {
                  raycaster.current.set(
                    bullet.start,
                    new THREE.Vector3().subVectors(bullet.end, bullet.start).normalize()
                  );
                  const intersects = raycaster.current.intersectObject(terrainRef.current, true);
                  if (intersects.length > 0) {
                    const { point, face } = intersects[0];
                    handleBulletHit(point, face.normal); // Place decal at hit point
                  }
                } catch (error) {
                  console.error("Error in Bullet onComplete raycasting:", error);
                }
                setBullets((prev) => prev.filter((b) => b.id !== bullet.id)); // Batch state update
              }}
            />
          ))}
          {decals.slice(-50).map((decal) => ( // Limit rendered decals to the last 50
            <Decal key={decal.id} position={decal.position} playerPosition={playerPosition} />
          ))}
          <ShootingHandler
            playerPosition={playerPosition}
            setBullets={setBullets}
            setExplosions={setExplosions}
            setDecals={setDecals}
            rapidFire={rapidFire} // Pass rapid fire state
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
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: "10px",
          color: "white",
          fontSize: "20px",
        }}
      >
        Health: {playerHealth}
      </div>
    </>
  );
}

export default Range;
