import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import Player from '@/lib/asteroid/_comp/Player/Player';
import TargetList from '@/lib/asteroid/_comp/Target/TargetList';
import ShootingSystem from '@/lib/asteroid/_comp/Weapons/ShootingSystem';
import CollisionDetection from '@/lib/asteroid/_comp/Target/CollisionDetection';
import TargetCollisionHandler from '@/lib/asteroid/_comp/Target/TargetCollisionHandler';
import PowerUp from '@/_components/effects/PowerUp';
import LaserBeam from '@/lib/asteroid/_comp/Weapons/LaserBeam';
import ShieldEffect from '@/lib/asteroid/_comp/UI/ShieldEffect';

const GameCanvas = ({
  gameOver,
  paused,
  targets,
  setTargets,
  setHealth,
  onHit,
  onMiss,
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
  handlePlayerHit,
  shieldActive,
  setShieldActive,
  rapidFireActive,
  speedBoostActive,
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
        isPaused={paused}
        setShowBlueFlash={setShowBlueFlash}
        speedBoostActive={speedBoostActive}
      />
      <ShootingSystem
        onHit={onHit}
        onMiss={onMiss}
        isGameOver={gameOver}
        isPaused={paused}
        targets={targets}
        setTargets={setTargets}
        weapon={weapon}
        ammo={ammo}
        setAmmo={setAmmo}
        cooldowns={cooldowns}
        setCooldowns={setCooldowns}
        setShowLaser={setShowLaser}
        rapidFireActive={rapidFireActive}
      />
      <CollisionDetection
        targets={targets}
        setTargets={setTargets}
        setHealth={setHealth}
        onPlayerHit={handlePlayerHit}
        isGameOver={gameOver}
        shieldActive={shieldActive}
        setShieldActive={setShieldActive}
      />
      <TargetCollisionHandler targets={targets} setTargets={setTargets} />
      <TargetList targets={targets} handleTargetHit={handleTargetHit} setTargets={setTargets} isGameOver={gameOver} isPaused={paused} />

      <ShieldEffect shieldActive={shieldActive} />

      {Array.isArray(showLaser) && showLaser.length > 0 && (
        <LaserBeam lasers={showLaser} weaponType={weapon} />
      )}

      <PowerUp position={[10, 10, 0]} size={1} type="health" onCollect={handlePowerUpCollect} />
      <PowerUp position={[13, 22, 0]} size={1} type="health" onCollect={handlePowerUpCollect} />
      <PowerUp position={[16, 34, 0]} size={1} type="health" onCollect={handlePowerUpCollect} />

      <PowerUp position={[-10, 10, 0]} size={1} type="shield" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-13, 22, 0]} size={1} type="shield" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-16, 34, 0]} size={1} type="shield" onCollect={handlePowerUpCollect} />

      <PowerUp position={[0, -10, 0]} size={1} type="rapidFire" onCollect={handlePowerUpCollect} />
      <PowerUp position={[3, -22, 0]} size={1} type="rapidFire" onCollect={handlePowerUpCollect} />
      <PowerUp position={[6, -34, 0]} size={1} type="rapidFire" onCollect={handlePowerUpCollect} />

      <PowerUp position={[0, 0, 10]} size={1} type="slowMotion" onCollect={handlePowerUpCollect} />
      <PowerUp position={[3, 12, 12]} size={1} type="slowMotion" onCollect={handlePowerUpCollect} />
      <PowerUp position={[6, 24, 14]} size={1} type="slowMotion" onCollect={handlePowerUpCollect} />

      <PowerUp position={[15, 0, 0]} size={1} type="invincibility" onCollect={handlePowerUpCollect} />
      <PowerUp position={[18, 12, 0]} size={1} type="invincibility" onCollect={handlePowerUpCollect} />
      <PowerUp position={[21, 24, 0]} size={1} type="invincibility" onCollect={handlePowerUpCollect} />

      <PowerUp position={[-15, 0, 0]} size={1} type="speedBoost" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-18, 12, 0]} size={1} type="speedBoost" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-21, 24, 0]} size={1} type="speedBoost" onCollect={handlePowerUpCollect} />
    </Canvas>
  );
};

export default GameCanvas;
