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

const MIN_ALIVE_TIME = 0.5; // Try a bigger delay for safety

const Game = ({ onHit, onMiss }) => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [health, setHealth] = useState(100);
  const [showRedFlash, setShowRedFlash] = useState(false); // Add this state
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
    const handleKeyDown = (e) => {
      if (e.code === 'Digit1') setWeapon('spread');
      if (e.code === 'Digit2') setWeapon('laser');
      if (e.code === 'Digit3') setWeapon('explosive');
      if (e.code === 'KeyR') {
        // Replenish all ammo to max
        setAmmo({
          spread: WEAPON_TYPES.find(w => w.key === 'spread').maxAmmo,
          laser: WEAPON_TYPES.find(w => w.key === 'laser').maxAmmo,
          explosive: WEAPON_TYPES.find(w => w.key === 'explosive').maxAmmo,
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWeapon, setAmmo]);

  useEffect(() => {
    const savedHighScore = window.localStorage.getItem('asteroidHighScore');
    const savedBestAccuracy = window.localStorage.getItem('asteroidBestAccuracy');

    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    if (savedBestAccuracy) setBestAccuracy(parseFloat(savedBestAccuracy));
  }, []);

  useEffect(() => {
    // Update score whenever hits or misses change
    setScore(hits * 100 + Math.round((hits / (hits + misses || 1)) * 100));
  }, [hits, misses]);
  
  useEffect(() => {
    // Play background music on mount
    playSound('bgm');
  }, [playSound]);

  useEffect(() => {
    if (health <= 0) {
      setGameOver(true);
      pauseSound('bgm'); // Pause background music
      playSound('hit');
      setShowRedFlash(true); // setShowRedFlash
      setTimeout(() => {
        setShowRedFlash(false); // Hide red flash effect after 500ms
      }, 1000);
      document.exitPointerLock(); // Exit pointer lock
    }
  }, [health, pauseSound]);

  useEffect(() => {
    // Game over effect: triggers when all targets are hit
    if (targets.length > 0 && targets.every(t => t.isHit)) {
      setGameOver(true);
      document.exitPointerLock();
      // Pause BGM on game over
      pauseSound('bgm');
      const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
      if (score > highScore) {
        setHighScore(score);
        window.localStorage.setItem('asteroidHighScore', score);
        setIsNewHighScore(true);
      }
      if (accuracy > bestAccuracy) {
        setBestAccuracy(accuracy);
        window.localStorage.setItem('asteroidBestAccuracy', accuracy);
      }
    }
  }, [targets, hits, misses, score, highScore, bestAccuracy, pauseSound]);

  // HANDLE HIT
  const handleTargetHit = useCallback((targetId) => {
    // Only allow hit if weapon is not cooling down and has ammo
    if (cooldowns[weapon] > 0 || ammo[weapon] <= 0) {
      return;
    }
    setTargets((prevTargets) => {
      let updatedTargets = [];
      let newTargets = [];
      prevTargets.forEach((target) => {
        if (target.id === targetId && !target.isHit && (now() - (target.spawnTime || 0) > MIN_ALIVE_TIME)) {
          const meshRef = targetRefs.current[targetId];
          const currentX = meshRef?.current?.position.x || target.x;
          const currentY = meshRef?.current?.position.y || target.y;
          const currentZ = meshRef?.current?.position.z || target.z;

          if (target.size > 1) {
            const newSize = target.size * 0.5;
            const newSpeed = target.speed * 2; // Double the speed for smaller fragments
            const newColor =
              newSize > 4 ? '#0000ff' :
              newSize > 3 ? '#800080' :
              newSize > 2 ? '#ff4500' :
              newSize > 1 ? '#00ffff' :
              '#ffff00';

            const offsetRange = 1.0;
            const spawnTime = now();
            newTargets.push(
              {
                id: `${target.id}-1`,
                x: currentX + Math.random() * offsetRange - offsetRange / 2,
                y: currentY + Math.random() * offsetRange - offsetRange / 2,
                z: currentZ + Math.random() * offsetRange - offsetRange / 2,
                isHit: false,
                size: newSize,
                speed: newSpeed,
                color: newColor,
                spawnTime,
              },
              {
                id: `${target.id}-2`,
                x: currentX + Math.random() * offsetRange - offsetRange / 2,
                y: currentY + Math.random() * offsetRange - offsetRange / 2,
                z: currentZ + Math.random() * offsetRange - offsetRange / 2,
                isHit: false,
                size: newSize,
                speed: newSpeed,
                color: newColor,
                spawnTime,
              }
            );
          }
          // Do not add the original target (removes it)
        } else {
          updatedTargets.push(target);
        }
      });
      return [...updatedTargets, ...newTargets];
    });

    setHits((prevHits) => prevHits + 1);

    if (onHit) onHit();
  }, [onHit, cooldowns, weapon, ammo]);

  // HANDLE MISS
  const handleMiss = useCallback(() => {
    setMisses((prevMisses) => prevMisses + 1);
    if (onMiss) onMiss(); // Call the onMiss prop if it exists
  }, [onMiss]);

  // HANDLE RESTART
  const restartGame = () => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setGameOver(false);
    setHealth(100); // Reset health to 100
    setWeapon('spread');
    setAmmo({ spread: 30, laser: 10, explosive: 5 });
    setCooldowns({ spread: 0, laser: 0, explosive: 5 });
    setTargets([
      { id: 1, x: 15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
      { id: 2, x: -15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
      { id: 3, x: 0, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
      { id: 4, x: 0, y: -15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    ]);
  };

  // HANDLE REFS
  const targetRefs = useRef({});

  const handleRefCallback = (targetId, ref) => {
    targetRefs.current[targetId] = ref;
  };

  // Red flash effect when player is hit
  const handlePlayerHit = useCallback((targetSize) => {
    // Example: lose 2x the target's size in HP, minimum 5, maximum 50
    const hpLoss = Math.max(5, Math.min(50, Math.round(targetSize * 2)));
    setHealth((prevHealth) => Math.max(prevHealth - 10 * (hpLoss || 1), 0));
    setShowRedFlash(true); // Show red flash
    playSound('hit'); // Play hit sound
    setTimeout(() => setShowRedFlash(false), 500);
  }, [playSound]);

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
