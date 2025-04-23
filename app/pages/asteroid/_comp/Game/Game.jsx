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
import ShootingSystem from './ShootingSystem';
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

const MIN_ALIVE_TIME = 0.5;

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
  const [targets, setTargets] = useState([
    { id: 1, x: 15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 2, x: -15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 3, x: 0, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 4, x: 0, y: -15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
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

  // Weapon switch & reload handler
  useEffect(() => {
    const handleKeyDown = (e) => handleKeyDownFn(e, setWeapon, setAmmo);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWeapon, setAmmo]);

  useEffect(() => {
    loadSavedScoresFn({ setHighScore, setBestAccuracy });
  }, [setHighScore, setBestAccuracy]);

  useEffect(() => {
    updateScoreFn({ hits, misses, setScore });
  }, [hits, misses, setScore]);
  
  useEffect(() => {
    // Play background music on mount
    playSound('bgm');
  }, [playSound]);

  useEffect(() => {
    handleHealthDepletionFn({
      health,
      setGameOver,
      pauseSound,
      playSound,
      setShowRedFlash,
    });
  }, [health, setGameOver, pauseSound, playSound, setShowRedFlash]);

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
      {/* Red flash overlay */}
      {showRedFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,0,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
            transition: 'opacity 0.1s',
          }}
        />
      )}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: '#000000', width: '100%', height: '100%' }} // Ensure Canvas fills the container
      >
        <PointerLockControls />
        <MovementControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Player targets={targets} onTargetHit={handleTargetHit} />
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
        />
        {showLaser && <LaserBeam from={showLaser.from} to={showLaser.to} />}
        <CollisionDetection targets={targets} setTargets={setTargets} setHealth={setHealth} onPlayerHit={handlePlayerHit} />
        <TargetCollisionHandler targets={targets} setTargets={setTargets} />
        <TargetList
          targets={targets}
          handleTargetHit={handleTargetHit}
          handleRefCallback={handleRefCallback}
          setTargets={setTargets}
        />
      </Canvas>
      <div className={styles.crosshair}></div>
      <ScoreDisplay score={score} />
      {/* Weapon UI */}
      <div className={styles.weaponDisplay} style={{ position: 'absolute', top: 10, left: 10, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 6, fontSize: 16 }}>
        Weapon: <b>{WEAPON_TYPES.find(w => w.key === weapon).name}</b>
        <br />
        Ammo: {ammo[weapon]} / {WEAPON_TYPES.find(w => w.key === weapon).maxAmmo}
        <br />
        Cooldown: {cooldowns[weapon] > 0 ? cooldowns[weapon].toFixed(2) + 's' : 'Ready'}
      </div>
      <div className={styles.statsDisplay}>
        Score: {score} | High Score: {highScore} | Health: {health}
      </div>
      {gameOver && (
        <div className={styles.gameOverOverlay}>
          <h2>Game Over!</h2>
          <p>
            Final Score: {score} {isNewHighScore && '🏆 New High Score!'}
          </p>
          <p>
            Final Accuracy: {hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0'}%{' '}
            {parseFloat(hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0') >
              bestAccuracy && '🎯 New Best!'}
          </p>
          <p>High Score: {highScore}</p>
          <p>Best Accuracy: {bestAccuracy.toFixed(1)}%</p>
          <button className={styles.restartButton} onClick={restartGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
