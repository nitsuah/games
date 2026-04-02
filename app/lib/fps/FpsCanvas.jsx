import { useRef, useState } from 'react';
import ComboDisplay from './_comps/ComboDisplay';
const comboSoundUrl = '/sounds/combo.mp3';
import { Canvas, extend } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import * as THREE from 'three';
import PlayerLogic from '@/lib/fps/_comps/PlayerLogic';
import Controls from '@/lib/fps/_comps/Controls';
import Floor from '@/_components/objects/Floor';
import Cube from '@/_components/objects/Cube';
import HillyFloor from '@/_components/objects/HillyFloor';
import Crosshair from '@/pages/fps/_comps/Crosshair';
import Target from '@/lib/fps/_comps/Target';
import Bullet from '@/lib/fps/_comps/Bullet';
import Decal from '@/lib/fps/_comps/Decal';
import ShootingHandler from '@/lib/fps/_comps/ShootingHandler';
import PowerUp from '@/lib/fps/_comps/PowerUp';

// Extend React Three Fiber's namespace to include BoxGeometry
extend({ BoxGeometry: THREE.BoxGeometry });

export default function FpsCanvas() {
  const playerRef = useRef();
  const terrainRef = useRef(); // Reference to the terrain mesh
  const [playerPosition, setPlayerPosition] = useState([0, 1, 0]); // Start Y at 1
  const [playerHealth, setPlayerHealth] = useState(100); // Track player health
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const comboAudio = useRef(typeof Audio !== 'undefined' ? new Audio(comboSoundUrl) : null);
  const [bullets, setBullets] = useState([]);
  const [decals, setDecals] = useState([]);
  const [rapidFire, setRapidFire] = useState(false); // Track rapid fire state
  const [playerSpeed, setPlayerSpeed] = useState(0.1); // Default player speed
  const [_explosions, setExplosions] = useState([]); // Explosions state used by shooting systems
  const [_speedBoost, setSpeedBoost] = useState(false); // Speed boost flag (setter used by power-ups)

  const decalsRef = useRef([]); // Use ref to store decals
  const raycaster = useRef(new THREE.Raycaster()); // Reuse a single raycaster instance

  const handleTargetHit = () => {
    setScore((prevScore) => prevScore + 100);
    setCombo((prev) => {
      const next = prev + 1;
      if (next > 1 && comboAudio.current) {
        comboAudio.current.currentTime = 0;
        comboAudio.current.play();
      }
      if (next > maxCombo) setMaxCombo(next);
      return next;
    });
  };

  const handleMiss = () => {
    setCombo(0);
  };

  const handleBulletHit = (hitPosition, normal) => {
    if (!hitPosition || !normal) return;
    const newDecal = { id: `${Date.now()}-${Math.random()}`, position: hitPosition, normal };
    decalsRef.current.push(newDecal);
    setDecals([...decalsRef.current]);
  };

  const handlePowerUpCollect = (type) => {
    switch (type) {
      case 'health':
        setPlayerHealth((prevHealth) => Math.min(prevHealth + 25, 100));
        break;
      case 'shield':
        break;
      case 'rapidFire':
        setRapidFire(true);
        setTimeout(() => setRapidFire(false), 10000);
        break;
      case 'speed':
        setSpeedBoost(true);
        setPlayerSpeed(0.5);
        setTimeout(() => {
          setSpeedBoost(false);
          setPlayerSpeed(0.1);
        }, 10000);
        break;
      case 'death':
        setPlayerHealth((prevHealth) => Math.max(prevHealth - 50, 0));
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Canvas
        shadows
        gl={{ alpha: false }}
        camera={{ position: [playerPosition[0], playerPosition[1] + 5, playerPosition[2] + 5], fov: 50 }}
        style={{ background: '#000000', width: '99vw', height: '98vh' }}
      >
        <color attach="background" args={['lightblue']} />
        <Stats showPanel={0} className="stats" />
        <Physics gravity={[0, -20, 0]}>
          <HillyFloor
            ref={terrainRef}
            width={250}
            depth={250}
            hillHeight={5}
            color="green"
            heightmapUrl="/_components/objects/terrain003.exr"
          />
          <Floor size={[500, 500]} color="black" position={[0, -1, 0]} />
          <hemisphereLight intensity={0.35} />
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
          <PlayerLogic ref={playerRef} onPositionChange={setPlayerPosition} />
          <Controls playerRef={playerRef} terrainRef={terrainRef} playerSpeed={playerSpeed} />
          <PowerUp position={[10, 3, -10]} type="health" onCollect={handlePowerUpCollect} />
          <PowerUp position={[15, 3, -15]} type="shield" onCollect={handlePowerUpCollect} />
          <PowerUp position={[20, 3, -20]} type="rapidFire" onCollect={handlePowerUpCollect} />
          <PowerUp position={[25, 3, -25]} type="speed" onCollect={handlePowerUpCollect} />
          <PowerUp position={[30, 3, -30]} type="death" onCollect={handlePowerUpCollect} />
          <Cube position={[10, 14, -10]} color="rebeccapurple" />
          <Cube position={[10, 15, -10]} color="pink" />
          <Cube position={[10, 16, -10]} color="darkorange" />
          <Cube position={[10, 17, -10]} color="rebeccapurple" />
          <Cube position={[10, 18, -10]} color="pink" />
          <Cube position={[15, 19, -15]} color="darkorange" />
          <Cube position={[5, 3, -5]} color="rebeccapurple" />
          <Cube position={[10, 3, -10]} color="pink" />
          <Cube position={[15, 3, -15]} color="darkorange" />
          <Target position={[20, 15, -20]} color="red" type="explode" onHit={handleTargetHit} />
          <Target position={[-10, 15, -25]} color="green" type="shrink" onHit={handleTargetHit} />
          <Target position={[0, 15, -30]} color="blue" type="default" onHit={handleTargetHit} />
          {bullets.map((bullet) => (
            <Bullet
              key={bullet.id}
              start={bullet.start}
              end={bullet.end}
              onComplete={() => {}}
            />
          ))}
          {decals.slice(-50).map((decal) => (
            <Decal key={decal.id} position={decal.position} playerPosition={playerPosition} />
          ))}
          <ShootingHandler
            playerPosition={playerPosition}
            setBullets={setBullets}
            setExplosions={setExplosions}
            setDecals={setDecals}
            rapidFire={rapidFire}
          />
        </Physics>
      </Canvas>
      <Crosshair />
      <div style={{ position: 'absolute', top: '50px', left: '10px', color: 'white', fontSize: '20px' }}>
        Score: {score}
      </div>
      <div style={{ position: 'absolute', top: '80px', left: '10px', color: 'white', fontSize: '20px' }}>
        Health: {playerHealth}
      </div>
    </>
  );
}
