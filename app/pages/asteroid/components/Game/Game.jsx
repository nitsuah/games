import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import Player from '../Player/Player';
import Target from '../Target/Target';
import ScoreDisplay from '../UI/ScoreDisplay';
import { useSound } from '@/utils/audio/useSound';
import styles from './Game.module.css';
import styled from 'styled-components';

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
  const moveSpeed = 0.1;
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

const Game = ({ onHit, onMiss }) => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [targets, setTargets] = useState([
    { id: 1, x: 5, y: 0, z: 0, isHit: false },
    { id: 2, x: -5, y: 0, z: 0, isHit: false },
    { id: 3, x: 0, y: 5, z: 0, isHit: false },
    { id: 4, x: 0, y: -5, z: 0, isHit: false },
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
      const updatedTargets = prevTargets.flatMap((target) => {
        if (target.id === targetId && !target.isHit) {
          if (target.size > 1) { // Limit the minimum size
            const newSize = target.size * 0.5;
            const newColor =
              newSize > 4 ? '#0000ff' : // Blue for first split
              newSize > 2 ? '#ff00ff' : // Magenta for second split
              newSize > 1 ? '#800080' : // Purple for third split
              '#00ffff'; // Cyan for last split
  
            const splitTargets = [
              {
                id: `${target.id}-1`,
                x: target.x + Math.random() * 1 - 0.5,
                y: target.y + Math.random() * 1 - 0.5,
                z: target.z + Math.random() * 1 - 0.5,
                isHit: false,
                size: newSize,
                color: newColor,
              },
              {
                id: `${target.id}-2`,
                x: target.x + Math.random() * 1 - 0.5,
                y: target.y + Math.random() * 1 - 0.5,
                z: target.z + Math.random() * 1 - 0.5,
                isHit: false,
                size: newSize,
                color: newColor,
              },
            ];
  
            return splitTargets; // Replace the hit target with its splits
          }
  
          // Delay removal to allow animation to complete
          setTimeout(() => {
            setTargets((currentTargets) =>
              currentTargets.filter((t) => t.id !== targetId)
            );
          }, 500); // Adjust delay as needed for animation
          return [{ ...target, isHit: true }];
        }
        return target; // Keep other targets unchanged
      });
      return updatedTargets;
    });
  
    // Increment the hit count
    setHits((prevHits) => prevHits + 1);
  
    // Call the onHit callback if provided
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
    setTargets([
      { id: 1, x: 5, y: 0, z: 0, isHit: false, size: 10, color: '#00ff00' },
      { id: 2, x: -5, y: 0, z: 0, isHit: false, size: 10, color: '#00ff00' },
      { id: 3, x: 0, y: 5, z: 0, isHit: false, size: 10, color: '#00ff00' },
      { id: 4, x: 0, y: -5, z: 0, isHit: false, size: 10, color: '#00ff00' },
    ]);
  };

  return (
    <div className={styles.gameContainer}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }} style={{ background: '#000000' }}>
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
      {targets.map((target) => (
        <Target
          key={target.id}
          position={[target.x, target.y, target.z]}
          targetId={target.id}
          isHit={target.isHit}
          onHit={handleTargetHit}
          size={target.size}
          color={target.color || '#00ff00'} // Default to green if no color is set
        />
      ))}
      </Canvas>
      <div className={styles.crosshair}></div>
      <ScoreDisplay score={score} />
      <div className={styles.statsDisplay}>
        Score: {score} | High Score: {highScore}
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

