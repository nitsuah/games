import { useRef, useState, useCallback } from 'react';
import ComboDisplay from './_comps/ComboDisplay';
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
import Bot from '@/lib/fps/_comps/Bot';
import { VirtualJoystick } from '@/_components/shared/gamepad/VirtualJoystick';
import { ShootButton } from '@/_components/shared/gamepad/ShootButton';

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
  const audioCtxRef = useRef(null);

  const playComboSound = useCallback(() => {
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio playback not available
    }
  }, []);

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
      if (next > 1) {
        playComboSound();
      }
      setMaxCombo((prevMax) => (next > prevMax ? next : prevMax));
      return next;
    });
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
        gl={{ alpha: false, shadowMap: { type: THREE.PCFShadowMap } }}
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
              onComplete={() => {
                try {
                  raycaster.current.set(
                    bullet.start,
                    new THREE.Vector3().subVectors(bullet.end, bullet.start).normalize()
                  );
                  const intersects = raycaster.current.intersectObject(terrainRef.current, true);
                  if (intersects.length > 0) {
                    const { point, face } = intersects[0];
                    handleBulletHit(point, face.normal);
                  }
                } catch (error) {
                  console.error('Error in Bullet onComplete raycasting:', error);
                }
                setBullets((prev) => prev.filter((b) => b.id !== bullet.id));
              }}
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
          <Bot position={[30, 3, -30]} color="red" playerPosition={playerPosition} onDeath={() => setScore((s) => s + 500)} />
          <Bot position={[-30, 3, -30]} color="blue" playerPosition={playerPosition} onDeath={() => setScore((s) => s + 500)} />
          <Bot position={[0, 3, 30]} color="green" playerPosition={playerPosition} onDeath={() => setScore((s) => s + 500)} />
        </Physics>
      </Canvas>
      <Crosshair />
      <VirtualJoystick onMove={(x, y) => console.log('move', x, y)} />
      <ShootButton onShoot={() => console.log('shoot')} />
      <ComboDisplay combo={combo} />
      <div style={{ position: 'absolute', top: '50px', left: '10px', color: 'white', fontSize: '20px' }}>
        Score: {score}
      </div>
      <div style={{ position: 'absolute', top: '80px', left: '10px', color: 'white', fontSize: '20px' }}>
        Health: {playerHealth}
      </div>
      <div style={{ position: 'absolute', top: '110px', left: '10px', color: 'white', fontSize: '20px' }}>
        Max Combo: {maxCombo}
      </div>
    </>
  );
}
