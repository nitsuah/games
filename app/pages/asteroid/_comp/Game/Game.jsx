import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import Player from '../Player/Player';
import Target from '../Target/Target';
import ScoreDisplay from '../UI/ScoreDisplay';
import { useSound } from '@/utils/audio/useSound';
import styles from './Game.module.css';
import styled from 'styled-components';
import TargetList from '../Target/TargetList';
import ShootingSystem from '../Weapons/ShootingSystem';
import { now } from '@/utils/time';
import { WEAPON_TYPES } from '../Weapons/constants';
import LaserBeam from '../Weapons/LaserBeam';
import MovementControls from '../Player/MovementControls';
import CollisionDetection from '../Target/CollisionDetection';
import TargetCollisionHandler from '../Target/TargetCollisionHandler';
import { handleTargetHit as handleTargetHitFn } from './handleTargetHit';
import { handleMiss as handleMissFn } from './handleMiss';
import { restartGame as restartGameFn } from './restartGame';
import { handlePlayerHit as handlePlayerHitFn } from './handlePlayerHit';
import { handleKeyDown as handleKeyDownFn } from './handleKeyDown';
import { updateScore as updateScoreFn } from './updateScore';
import { loadSavedScores as loadSavedScoresFn } from './loadSavedScores';
import { handleGameOver as handleGameOverFn } from './handleGameOver';
import { handleHealthDepletion as handleHealthDepletionFn } from './handleHealthDepletion';
import ShotReticle from '../UI/ShotReticle';
import WeaponDisplay from '../UI/WeaponDisplay';
import GameOverOverlay from '../UI/GameOverOverlay';
import PowerUp from '@/_components/effects/PowerUp'; // Import the new global PowerUp component

const MIN_ALIVE_TIME = 0.5;

const GameLogic = ({
  gameOver,
  setShowLaser,
  showLaser,
  weapon,
}) => {
  const { camera } = useThree(); // Access the camera from useThree

  // Remove duplicate laser logic; rely on ShootingSystem for laser handling
  useEffect(() => {
    const handleMouseClick = (event) => {
      if (gameOver) return;

      // Prevent duplicate laser logic here
      console.debug("Mouse click detected, but laser logic is handled in ShootingSystem.");
    };

    window.addEventListener('mousedown', handleMouseClick);
    return () => window.removeEventListener('mousedown', handleMouseClick);
  }, [camera, gameOver]);

  return null;
};

const Game = ({ onHit, onMiss }) => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [health, setHealth] = useState(100);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [showGreenFlash, setShowGreenFlash] = useState(false); // Green flash for health
  const [showBlueFlash, setShowBlueFlash] = useState(false); // Blue flash for shield
  const [showYellowFlash, setShowYellowFlash] = useState(false); // Yellow flash for invincibility
  const [showPurpleFlash, setShowPurpleFlash] = useState(false); // Purple flash for slow motion
  const [showOrangeFlash, setShowOrangeFlash] = useState(false); // Orange flash for speed boost
  const [targets, setTargets] = useState([
    { id: 1, x: 15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 2, x: -15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 3, x: 0, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 4, x: 0, y: -15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 5, x: 12, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 6, x: 15, y: 17, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 7, x: 18, y: 19, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 8, x: -12, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 9, x: -15, y: 17, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 10, x: -18, y: 19, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
  ]);
  const { playSound, pauseSound } = useSound();
  const soundsRef = useRef(null);

  // Weapon state
  const [weapon, setWeapon] = useState('spread');
  const [ammo, setAmmo] = useState({
    spread: 30,
    laser: 10,
    explosive: 5,
  });
  const [cooldowns, setCooldowns] = useState({
    spread: 0,
    laser: 0,
    explosive: 0,
  });
  const [showLaser, setShowLaser] = useState(null); // {from, to, time}

  const [shieldActive, setShieldActive] = useState(false);
  const [rapidFireActive, setRapidFireActive] = useState(false);
  const [slowMotionActive, setSlowMotionActive] = useState(false);
  const [invincibilityActive, setInvincibilityActive] = useState(false);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);

  const handlePowerUpCollect = (type) => {
    switch (type) {
      case 'health':
        console.log('Health Power-Up activated!');
        setHealth((prevHealth) => Math.min(prevHealth + 25, 100)); // Restore health up to 100
        setShowGreenFlash(true); // Trigger green flash
        setTimeout(() => setShowGreenFlash(false), 100); // Flash green briefly
        break;
      case 'speedBoost':
        console.log('Speed Boost Power-Up activated!');
        setSpeedBoostActive(true);
        setShowOrangeFlash(true); // Trigger orange flash
        setTimeout(() => {
          setSpeedBoostActive(false);
          setShowOrangeFlash(false); // End orange flash
          console.log('Speed Boost Power-Up expired!');
        }, 10000); // Deactivate after 10 seconds
        break;
      case 'rapidFire':
        console.log('Rapid Fire Power-Up activated!');
        setRapidFireActive(true);
        setShowRedFlash(true); // Trigger red flash
        setTimeout(() => {
          setRapidFireActive(false);
          setShowRedFlash(false); // End red flash
          console.log('Rapid Fire Power-Up expired!');
        }, 10000); // Deactivate after 10 seconds
        break;
      case 'shield':
        console.log('Shield Power-Up activated!');
        setShieldActive(true);
        setShowBlueFlash(true); // Trigger blue flash
        break; // Shield will now only expire when used
      case 'slowMotion':
        console.log('Slow Motion Power-Up activated!');
        setSlowMotionActive(true);
        setTargets((prevTargets) =>
          prevTargets.map((target) => ({
            ...target,
            speed: target.speed * 0.5, // Reduce target speed by 50%
          }))
        );
        setTimeout(() => {
          setSlowMotionActive(false);
          setTargets((prevTargets) =>
            prevTargets.map((target) => ({
              ...target,
              speed: target.speed * 2, // Restore original speed
            }))
          );
          console.log('Slow Motion Power-Up expired!');
        }, 10000); // Deactivate after 10 seconds
        break;
      case 'invincibility':
        console.log('Invincibility Power-Up activated!');
        setInvincibilityActive(true);
        setShowYellowFlash(true); // Trigger yellow flash
        setTimeout(() => {
          setInvincibilityActive(false);
          setShowYellowFlash(false); // End yellow flash
          console.log('Invincibility Power-Up expired!');
        }, 10000); // Deactivate after 10 seconds
        break;
      default:
        console.warn('Unknown power-up type:', type);
    }
  };

  // Apply slow motion effect
  useEffect(() => {
    if (slowMotionActive) {
      console.log('Slow Motion is active. Target speeds are reduced.');
      setTargets((prevTargets) =>
        prevTargets.map((target) => ({
          ...target,
          speed: target.speed * 0.5, // Reduce target speed by 50%
        }))
      );
    }
  }, [slowMotionActive]);

  // Weapon switch, ammo, & reload handler
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyDownFn(e, setWeapon, setAmmo);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWeapon, setAmmo]);

  // Load saved scores
  useEffect(() => {
    loadSavedScoresFn({ setHighScore, setBestAccuracy });
  }, [setHighScore, setBestAccuracy]);

  // Update score and accuracy
  useEffect(() => {
    updateScoreFn({ hits, misses, setScore });
  }, [hits, misses, setScore]);
  
  // Play background music on mount
  useEffect(() => {
    if (!gameOver) {
      playSound('bgm')
        .then(() => console.log('Background music started'))
        .catch((err) => console.error('Failed to play bgm:', err)); // Catch errors to avoid unhandled rejections
    }

    return () => {
      if (gameOver) {
        pauseSound('bgm'); // Pause background music when the game ends
      }
    };
  }, [playSound, pauseSound, gameOver]);

  // Handle player state
  useEffect(() => {
    handleHealthDepletionFn({
      health,
      setGameOver,
      pauseSound,
      playSound,
      setShowRedFlash,
      invincibilityActive, // Pass invincibility state
      shieldActive,        // Pass shield state
      setShieldActive,     // Pass shield state setter
    });
  }, [health, setGameOver, pauseSound, playSound, setShowRedFlash, invincibilityActive, shieldActive, setShieldActive]);

  // Handle general game state
  useEffect(() => {
    handleGameOverFn({
      targets,
      setGameOver,
      pauseSound,
      playSound,
      hits,
      misses,
      score,
      highScore,
      setHighScore,
      setIsNewHighScore,
      bestAccuracy,
      setBestAccuracy,
    });
  }, [targets, hits, misses, score, highScore, bestAccuracy, pauseSound, playSound, setGameOver, setHighScore, setIsNewHighScore, setBestAccuracy]);

  // Prevent movement after game ends
  useEffect(() => {
    if (gameOver) {
      console.log('Game over! Disabling player movement.');
      window.removeEventListener('keydown', handleKeyDownFn);
      window.removeEventListener('keyup', handleKeyDownFn);
    }
  }, [gameOver]);

  // HANDLE HIT
  const handleTargetHit = useCallback(
    (targetId) =>
      handleTargetHitFn({
        targetId,
        cooldowns,
        weapon,
        ammo,
        setTargets,
        setHits,
        onHit,
        targetRefs,
      }),
    [cooldowns, weapon, ammo, setTargets, setHits, onHit]
  );

  // HANDLE MISS
  const handleMiss = useCallback(
    () => handleMissFn({ setMisses, onMiss }),
    [setMisses, onMiss]
  );

  // HANDLE RESTART
  const restartGame = () =>
    restartGameFn({
      setScore,
      setHits,
      setMisses,
      setGameOver,
      setHealth,
      setWeapon,
      setAmmo,
      setCooldowns,
      setTargets,
    });

  // HANDLE REFS
  const targetRefs = useRef({});

  const handleRefCallback = (targetId, ref) => {
    targetRefs.current[targetId] = ref;
  };

  // Red flash effect when player is hit
  const handlePlayerHit = useCallback(
    (targetSize) =>
      handlePlayerHitFn({
        targetSize,
        setHealth,
        setShowRedFlash,
        playSound,
      }),
    [setHealth, setShowRedFlash, playSound]
  );

  // Remove laser after short time
  useEffect(() => {
    if (showLaser) {
      const timeout = setTimeout(() => setShowLaser(null), 120);
      return () => clearTimeout(timeout);
    }
  }, [showLaser]);

  return (
    <div className={styles.gameContainer}>
      {/* Blue flash overlay */}
      {showBlueFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,255,0.5)', // Higher opacity for visibility
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Green flash overlay */}
      {showGreenFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,255,0,0.5)', // Higher opacity for visibility
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Yellow flash overlay */}
      {showYellowFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,255,0,0.5)', // Higher opacity for visibility
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Purple flash overlay */}
      {showPurpleFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(128,0,128,0.5)', // Higher opacity for visibility
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Red flash overlay */}
      {showRedFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,0,0,0.5)', // Higher opacity for visibility
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Orange flash overlay */}
      {showOrangeFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,165,0,0.5)', // Higher opacity for visibility
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {weapon === 'spread' && <ShotReticle />}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: '#000000', width: '100%', height: '100%' }} // Ensure Canvas fills the container
      >
        <PointerLockControls />
        <MovementControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Player 
          targets={targets} 
          onTargetHit={handleTargetHit} 
          speedBoostActive={speedBoostActive} 
          invincibilityActive={invincibilityActive} 
          isGameOver={gameOver} 
          setShowBlueFlash={setShowBlueFlash} // Pass setShowBlueFlash as a prop
        />
        {/* Use the imported ShootingSystem component */}
        <ShootingSystem
          onHit={handleTargetHit}
          onMiss={handleMiss}
          isGameOver={gameOver}
          weapon={weapon}
          ammo={ammo}
          setAmmo={setAmmo}
          cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          showLaser={showLaser}
          setShowLaser={setShowLaser}
          targets={targets} // Pass targets
          setTargets={setTargets} // Pass setTargets
          rapidFireActive={rapidFireActive} // Pass rapidFireActive to ShootingSystem
        />
        {showLaser && <LaserBeam lasers={showLaser} weaponType={weapon} />} {/* Pass weaponType */}
        <GameLogic
          gameOver={gameOver}
          setShowLaser={setShowLaser}
          showLaser={showLaser}
          weapon={weapon}
        />
        <CollisionDetection targets={targets} setTargets={setTargets} setHealth={setHealth} onPlayerHit={handlePlayerHit} />
        <TargetCollisionHandler targets={targets} setTargets={setTargets} />
        <TargetList
          targets={targets}
          handleTargetHit={handleTargetHit}
          handleRefCallback={handleRefCallback}
          setTargets={setTargets}
        />

        {/* Cluster 1: Health Power-Ups */}
        <PowerUp position={[10, 10, 0]} size={1.5} type="health" onCollect={handlePowerUpCollect} />
        <PowerUp position={[13, 12, 0]} size={1.5} type="health" onCollect={handlePowerUpCollect} />
        <PowerUp position={[16, 14, 0]} size={1.5} type="health" onCollect={handlePowerUpCollect} />

        {/* Cluster 2: Shield Power-Ups */}
        <PowerUp position={[-10, 10, 0]} size={1.5} type="shield" onCollect={handlePowerUpCollect} />
        <PowerUp position={[-13, 12, 0]} size={1.5} type="shield" onCollect={handlePowerUpCollect} />
        <PowerUp position={[-16, 14, 0]} size={1.5} type="shield" onCollect={handlePowerUpCollect} />

        {/* Cluster 3: Rapid Fire Power-Ups */}
        <PowerUp position={[0, -10, 0]} size={1.5} type="rapidFire" onCollect={handlePowerUpCollect} />
        <PowerUp position={[3, -12, 0]} size={1.5} type="rapidFire" onCollect={handlePowerUpCollect} />
        <PowerUp position={[6, -14, 0]} size={1.5} type="rapidFire" onCollect={handlePowerUpCollect} />

        {/* Cluster 4: Slow Motion Power-Ups */}
        <PowerUp position={[0, 0, 10]} size={1.5} type="slowMotion" onCollect={handlePowerUpCollect} />
        <PowerUp position={[3, 2, 12]} size={1.5} type="slowMotion" onCollect={handlePowerUpCollect} />
        <PowerUp position={[6, 4, 14]} size={1.5} type="slowMotion" onCollect={handlePowerUpCollect} />

        {/* Cluster 5: Invincibility Power-Ups */}
        <PowerUp position={[15, 0, 0]} size={1.5} type="invincibility" onCollect={handlePowerUpCollect} />
        <PowerUp position={[18, 2, 0]} size={1.5} type="invincibility" onCollect={handlePowerUpCollect} />
        <PowerUp position={[21, 4, 0]} size={1.5} type="invincibility" onCollect={handlePowerUpCollect} />

        {/* Cluster 6: Speed Boost Power-Ups */}
        <PowerUp position={[-15, 0, 0]} size={1.5} type="speedBoost" onCollect={handlePowerUpCollect} />
        <PowerUp position={[-18, 2, 0]} size={1.5} type="speedBoost" onCollect={handlePowerUpCollect} />
        <PowerUp position={[-21, 4, 0]} size={1.5} type="speedBoost" onCollect={handlePowerUpCollect} />
      </Canvas>
      <div className={styles.crosshair}></div>
      <ScoreDisplay score={score} />
      <WeaponDisplay weapon={weapon} ammo={ammo} cooldowns={cooldowns} />
      <div className={styles.statsDisplay}>
        Health: {health} <br />
        Score: {score} <br />
        High Score: {highScore} <br />
        Best Accuracy: {bestAccuracy.toFixed(1)}%
      </div>
      {gameOver && (
        <GameOverOverlay
          score={score}
          isNewHighScore={isNewHighScore}
          hits={hits}
          misses={misses}
          bestAccuracy={bestAccuracy}
          highScore={highScore}
          restartGame={restartGame}
        />
      )}
    </div>
  );
};

export default Game;
