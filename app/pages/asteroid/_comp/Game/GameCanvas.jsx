import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import Player from '../Player/Player';
import TargetList from '../Target/TargetList';
import ShootingSystem from '../Weapons/ShootingSystem';
import CollisionDetection from '../Target/CollisionDetection';
import TargetCollisionHandler from '../Target/TargetCollisionHandler';
import PowerUp from '../../../../_components/effects/PowerUp';
import LaserBeam from '../Weapons/LaserBeam';

const getRandomPosition = (baseX, baseY, baseZ, range = 5) => [
  baseX + Math.random() * range - range / 2,
  baseY + Math.random() * range - range / 2,
  baseZ + Math.random() * range - range / 2,
];

const GameCanvas = ({
  gameOver,
  health,
  targets,
  setTargets,
  setHealth,
  setGameOver,
  playSound,
  pauseSound,
  onHit,
  onMiss,
  setShowRedFlash,
  setShowBlueFlash,
  weapon,
  ammo,
  setAmmo,
  cooldowns,
  setCooldowns,
  showLaser = [],
  setShowLaser,
  handlePowerUpCollect,
  handleTargetHit,
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      style={{ background: '#000000', width: '100%', height: '100%' }}
    >
      <PointerLockControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Player
        targets={targets}
        onTargetHit={onHit}
        isGameOver={gameOver}
        setShowBlueFlash={setShowBlueFlash}
      />
      <ShootingSystem
        onHit={onHit}
        onMiss={onMiss}
        isGameOver={gameOver}
        targets={targets}
        setTargets={setTargets}
        weapon={weapon}
        ammo={ammo}
        setAmmo={setAmmo}
        cooldowns={cooldowns}
        setCooldowns={setCooldowns}
        setShowLaser={setShowLaser}
      />
      <CollisionDetection
        targets={targets}
        setTargets={setTargets}
        setHealth={setHealth}
        onPlayerHit={() => {}}
      />
      <TargetCollisionHandler targets={targets} setTargets={setTargets} />
      <TargetList
        targets={targets}
        handleTargetHit={handleTargetHit} // Pass handleTargetHit
        setTargets={setTargets}
      />

      {/* Render LaserBeam */}
      {Array.isArray(showLaser) && showLaser.length > 0 && (
        <LaserBeam lasers={showLaser} weaponType={weapon} />
      )}

      {/* Randomized Power-Ups */}
      {/* Cluster 1: Health Power-Ups */}
      <PowerUp position={[10, 10, 0]} size={1} type="health" onCollect={handlePowerUpCollect} />
      <PowerUp position={[13, 22, 0]} size={1} type="health" onCollect={handlePowerUpCollect} />
      <PowerUp position={[16, 34, 0]} size={1} type="health" onCollect={handlePowerUpCollect} />

      {/* Cluster 2: Shield Power-Ups */}
      <PowerUp position={[-10, 10, 0]} size={1} type="shield" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-13, 22, 0]} size={1} type="shield" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-16, 34, 0]} size={1} type="shield" onCollect={handlePowerUpCollect} />

      {/* Cluster 3: Rapid Fire Power-Ups */}
      <PowerUp position={[0, -10, 0]} size={1} type="rapidFire" onCollect={handlePowerUpCollect} />
      <PowerUp position={[3, -22, 0]} size={1} type="rapidFire" onCollect={handlePowerUpCollect} />
      <PowerUp position={[6, -34, 0]} size={1} type="rapidFire" onCollect={handlePowerUpCollect} />

      {/* Cluster 4: Slow Motion Power-Ups */}
      <PowerUp position={[0, 0, 10]} size={1} type="slowMotion" onCollect={handlePowerUpCollect} />
      <PowerUp position={[3, 12, 12]} size={1} type="slowMotion" onCollect={handlePowerUpCollect} />
      <PowerUp position={[6, 24, 14]} size={1} type="slowMotion" onCollect={handlePowerUpCollect} />

      {/* Cluster 5: Invincibility Power-Ups */}
      <PowerUp position={[15, 0, 0]} size={1} type="invincibility" onCollect={handlePowerUpCollect} />
      <PowerUp position={[18, 12, 0]} size={1} type="invincibility" onCollect={handlePowerUpCollect} />
      <PowerUp position={[21, 24, 0]} size={1} type="invincibility" onCollect={handlePowerUpCollect} />

      {/* Cluster 6: Speed Boost Power-Ups */}
      <PowerUp position={[-15, 0, 0]} size={1} type="speedBoost" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-18, 12, 0]} size={1} type="speedBoost" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-21, 24, 0]} size={1} type="speedBoost" onCollect={handlePowerUpCollect} />
    </Canvas>
  );
};

export default GameCanvas;
