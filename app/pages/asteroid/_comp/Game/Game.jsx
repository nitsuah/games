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

const MIN_ALIVE_TIME = 0.5; // Try a bigger delay for safety

const now = () => performance.now() / 1000;

const ShootingSystem = ({ onHit, onMiss, isGameOver }) => {
  const { camera, scene } = useThree();
  const raycaster = new THREE.Raycaster();
  const mousePosition = new THREE.Vector2(0, 0);
  const { playSound } = useSound();

  useEffect(() => {
    const handleShoot = () => {
      if (document.pointerLockElement && !isGameOver) {
        playSound('shoot');
        raycaster.setFromCamera(mousePosition, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Only call one of onHit or onMiss per shot
        const targetIntersect = intersects.find((intersect) => {
          const parent = intersect.object.parent;
          return parent?.userData?.isTarget && !parent?.userData?.isHit;
        });

        if (targetIntersect) {
          const targetId = targetIntersect.object.parent.userData.targetId;
          targetIntersect.object.parent.userData.isHit = true;
          playSound('hit');
          onHit(targetId);
        } else {
          playSound('miss');
          onMiss();
        }
      }
    };

    window.addEventListener('click', handleShoot);
    return () => window.removeEventListener('click', handleShoot);
  }, [camera, scene, onHit, onMiss, isGameOver, playSound]);

  return null;
};

const MovementControls = () => {
  const { camera } = useThree();
  const moveSpeed = 0.0005; // INITIAL SPEED
  const keys = useRef({});
  const { setThrusterVolume = () => {} } = useSound();
  const isMovingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.code] = true);
    const handleKeyUp = (e) => (keys.current[e.code] = false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const moveCamera = () => {
      if (!document.pointerLockElement) return;

      const direction = new THREE.Vector3(0, 0, 0);
      const frontVector = new THREE.Vector3();
      const sideVector = new THREE.Vector3();
      const upVector = new THREE.Vector3(0, 1, 0);

      camera.getWorldDirection(frontVector);
      frontVector.y = 0;
      frontVector.normalize();
      sideVector.crossVectors(upVector, frontVector);

      const isMoving =
        keys.current['KeyW'] ||
        keys.current['KeyS'] ||
        keys.current['KeyA'] ||
        keys.current['KeyD'] ||
        keys.current['Space'] ||
        keys.current['ShiftLeft'];
      if (isMovingRef.current !== isMoving) {
        setThrusterVolume(isMoving ? 0.3 : 0);
        isMovingRef.current = isMoving;
      }
      setThrusterVolume(isMoving ? 0.3 : 0);

      if (keys.current['KeyW']) direction.add(frontVector.multiplyScalar(moveSpeed));
      if (keys.current['KeyS']) direction.sub(frontVector.multiplyScalar(moveSpeed));
      if (keys.current['KeyA']) direction.add(sideVector.multiplyScalar(moveSpeed));
      if (keys.current['KeyD']) direction.sub(sideVector.multiplyScalar(moveSpeed));
      if (keys.current['Space']) direction.add(upVector.multiplyScalar(moveSpeed));
      if (keys.current['ShiftLeft']) direction.sub(upVector.multiplyScalar(moveSpeed));

      camera.position.add(direction);
    };

    const animate = () => {
      moveCamera();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [camera, setThrusterVolume]);

  return null;
};

const CollisionDetection = ({ targets, setTargets, setHealth, onPlayerHit }) => {
  const { camera } = useThree(); // <-- Move camera outside useFrame

  useFrame(() => {
    const playerSphere = new THREE.Sphere(camera.position.clone(), 2.0);

    setTargets((prevTargets) =>
      prevTargets.map((target) => {
        if (!target.isHit) {
          const targetSphere = new THREE.Sphere(
            new THREE.Vector3(target.x, target.y, target.z),
            target.size / 2
          );

          if (playerSphere.intersectsSphere(targetSphere)) {
            console.log('Player Collision detected with target:', target.id);
            onPlayerHit(); // Call the onPlayerHit callback
            return { ...target, isHit: true };
          }
        }
        return target;
      })
    );
  });

  return null;
};

const TargetCollisionHandler = ({ targets, setTargets }) => {
  useFrame(() => {
    const currentTime = now();
    setTargets((prevTargets) => {
      let updatedTargets = [...prevTargets];
      let newTargets = [];

      for (let i = 0; i < updatedTargets.length; i++) {
        const targetA = updatedTargets[i];
        if (targetA.isHit || (currentTime - (targetA.spawnTime || 0) < MIN_ALIVE_TIME)) continue;

        const sphereA = new THREE.Sphere(
          new THREE.Vector3(targetA.x, targetA.y, targetA.z),
          targetA.size / 2
        );

        for (let j = i + 1; j < updatedTargets.length; j++) {
          const targetB = updatedTargets[j];
          if (
            targetB.isHit ||
            (currentTime - (targetB.spawnTime || 0) < MIN_ALIVE_TIME)
          )
            continue;

          const sphereB = new THREE.Sphere(
            new THREE.Vector3(targetB.x, targetB.y, targetB.z),
            targetB.size / 2
          );

          if (sphereA.intersectsSphere(sphereB)) {
            // Remove both targets from the array
            updatedTargets = updatedTargets.filter(
              (t) => t.id !== targetA.id && t.id !== targetB.id
            );

            // Split both targets into smaller fragments
            const splitTargets = [targetA, targetB].flatMap((target) => {
              if (target.size > 1) {
                const newSize = target.size * 0.5;
                const newSpeed = target.speed * 2;
                const newColor =
                  newSize > 4 ? '#0000ff' :
                  newSize > 3 ? '#800080' :
                  newSize > 2 ? '#ff4500' :
                  newSize > 1 ? '#00ffff' :
                  '#ffff00';
                const offsetRange = 1.0;
                const spawnTime = now();
                return [
                  {
                    id: `${target.id}-1`,
                    x: target.x + Math.random() * offsetRange - offsetRange / 2,
                    y: target.y + Math.random() * offsetRange - offsetRange / 2,
                    z: target.z + Math.random() * offsetRange - offsetRange / 2,
                    isHit: false,
                    size: newSize,
                    speed: newSpeed,
                    color: newColor,
                    spawnTime,
                  },
                  {
                    id: `${target.id}-2`,
                    x: target.x + Math.random() * offsetRange - offsetRange / 2,
                    y: target.y + Math.random() * offsetRange - offsetRange / 2,
                    z: target.z + Math.random() * offsetRange - offsetRange / 2,
                    isHit: false,
                    size: newSize,
                    speed: newSpeed,
                    color: newColor,
                    spawnTime,
                  },
                ];
              }
              return [];
            });

            newTargets.push(...splitTargets);
            break; // Only handle one collision per frame per target
          }
        }
      }

      return [...updatedTargets, ...newTargets];
    });
  });

  return null; // This component doesn't render anything
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
  const [showRedFlash, setShowRedFlash] = useState(false); // Add this state
  const [targets, setTargets] = useState([
    { id: 1, x: 15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 2, x: -15, y: 0, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 3, x: 0, y: 15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
    { id: 4, x: 0, y: -15, z: 0, isHit: false, size: 10, speed: 10, color: '#00ff00', spawnTime: now() },
  ]);
  const { playSound, pauseSound } = useSound();
  const soundsRef = useRef(null);

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
  }, [onHit]);

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
        <ShootingSystem
          onHit={handleTargetHit}
          onMiss={handleMiss}
          isGameOver={gameOver}
        />
        <CollisionDetection targets={targets} setTargets={setTargets} setHealth={setHealth} onPlayerHit={handlePlayerHit} />
        <TargetCollisionHandler targets={targets} setTargets={setTargets} />
        {targets.map((target) => (
          <Target
            key={target.id}
            position={[target.x, target.y, target.z]}
            targetId={target.id}
            isHit={target.isHit}
            onHit={handleTargetHit}
            size={target.size}
            speed={target.speed}
            color={target.color || '#00ff00'}
            refCallback={handleRefCallback}
            setTargets={setTargets}
          />
        ))}
      </Canvas>
      <div className={styles.crosshair}></div>
      <ScoreDisplay score={score} />
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
