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
import InvincibilityEffect from '@/lib/asteroid/_comp/UI/InvincibilityEffect';
import BoundaryBox from '@/lib/asteroid/_comp/UI/BoundaryBox';

import ScorePopup from '@/_components/effects/ScorePopup';

import React from 'react';

const GameCanvas = ({
  gameOver,
  paused,
  showWaveTransition,
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
  invincibilityActive,
  trailQuality = 'high',
  scorePopups = [],
  setPlayerVelocity,
  onCanvasCreated,
}) => {
  return (
    <Canvas
      onCreated={({ gl }) => {
        // Store the actual canvas DOM node for pointer lock
        if (typeof onCanvasCreated === 'function') {
          onCanvasCreated(gl.domElement);
        }
      }}
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
        showWaveTransition={showWaveTransition}
        setShowBlueFlash={setShowBlueFlash}
        speedBoostActive={speedBoostActive}
        setPlayerVelocity={setPlayerVelocity}
      />
      <ShootingSystem
        onHit={onHit}
        onMiss={onMiss}
        isGameOver={gameOver}
        isPaused={paused}
        showWaveTransition={showWaveTransition}
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
      <InvincibilityEffect invincibilityActive={invincibilityActive} />
      <BoundaryBox />

      {Array.isArray(showLaser) && showLaser.length > 0 && (
        <LaserBeam lasers={showLaser} weaponType={weapon} trailQuality={trailQuality} />
      )}

      {/* Health power-ups - spread across upper right quadrant, larger and more spread out */}
      <PowerUp position={[28, 22, 0]} size={1.8} type="health" onCollect={handlePowerUpCollect} />
      <PowerUp position={[42, 10, 8]} size={1.8} type="health" onCollect={handlePowerUpCollect} />
      <PowerUp position={[22, 35, -8]} size={1.8} type="health" onCollect={handlePowerUpCollect} />

      {/* Shield power-ups - spread across upper left quadrant, larger and more spread out */}
      <PowerUp position={[-28, 22, 0]} size={1.8} type="shield" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-42, 10, 8]} size={1.8} type="shield" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-22, 35, -8]} size={1.8} type="shield" onCollect={handlePowerUpCollect} />

      {/* Rapid fire - spread across lower right quadrant, larger and more spread out */}
      <PowerUp position={[28, -22, 0]} size={1.8} type="rapidFire" onCollect={handlePowerUpCollect} />
      <PowerUp position={[42, -10, 8]} size={1.8} type="rapidFire" onCollect={handlePowerUpCollect} />
      <PowerUp position={[22, -35, -8]} size={1.8} type="rapidFire" onCollect={handlePowerUpCollect} />

      {/* Slow motion - spread in center with Z variation, larger and more spread out */}
      <PowerUp position={[0, 0, 18]} size={1.8} type="slowMotion" onCollect={handlePowerUpCollect} />
      <PowerUp position={[12, 16, 28]} size={1.8} type="slowMotion" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-12, -16, 35]} size={1.8} type="slowMotion" onCollect={handlePowerUpCollect} />

      {/* Invincibility - spread far right with depth, larger and more spread out */}
      <PowerUp position={[48, 0, 0]} size={1.8} type="invincibility" onCollect={handlePowerUpCollect} />
      <PowerUp position={[45, 20, 15]} size={1.8} type="invincibility" onCollect={handlePowerUpCollect} />
      <PowerUp position={[50, -20, 12]} size={1.8} type="invincibility" onCollect={handlePowerUpCollect} />

      {/* Speed boost - spread far left with depth, larger and more spread out */}
      <PowerUp position={[-48, 0, 0]} size={1.8} type="speedBoost" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-45, 20, 15]} size={1.8} type="speedBoost" onCollect={handlePowerUpCollect} />
      <PowerUp position={[-50, -20, 12]} size={1.8} type="speedBoost" onCollect={handlePowerUpCollect} />

      {/* Score popups */}
      {scorePopups.map((popup) => (
        <ScorePopup
          key={popup.id}
          position={popup.position}
          score={popup.score}
          onComplete={() => {}}
        />
      ))}
    </Canvas>
  );
};

export default GameCanvas;
