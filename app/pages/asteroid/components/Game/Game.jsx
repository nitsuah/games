import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import Player from '../Player/Player';
import Target from '../Target/Target';
import ScoreDisplay from '../UI/ScoreDisplay';
import { useSound } from '@/utils/audio/useSound';
import styled from 'styled-components';

const GameContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const Crosshair = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: white;
  }

  &::before {
    width: 2px;
    height: 20px;
    left: 9px;
  }

  &::after {
    width: 20px;
    height: 2px;
    top: 9px;
  }
`;

const GameOverOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: white;
`;

const RestartButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s;

  &:hover {
    background: #45a049;
  }
`;

const StatsDisplay = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: white;
  font-family: Arial, sans-serif;
  text-align: right;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
`;

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

  const handleTargetHit = useCallback((targetId) => {
    setTargets((prevTargets) => {
      const updatedTargets = prevTargets.flatMap((target) => {
        if (target.id === targetId && !target.isHit) {
          // Check if the target can still split
          if (target.splitCount > 0) {
            const newSize = target.size * 0.5; // Reduce size for split targets
            const newSplitCount = target.splitCount - 1; // Decrease split count
  
            // Create two smaller targets
            const splitTargets = [
              {
                id: `${target.id}-1`,
                x: target.x + Math.random() * 1 - 0.5,
                y: target.y + Math.random() * 1 - 0.5,
                z: target.z + Math.random() * 1 - 0.5,
                isHit: false,
                size: newSize,
                splitCount: newSplitCount,
              },
              {
                id: `${target.id}-2`,
                x: target.x + Math.random() * 1 - 0.5,
                y: target.y + Math.random() * 1 - 0.5,
                z: target.z + Math.random() * 1 - 0.5,
                isHit: false,
                size: newSize,
                splitCount: newSplitCount,
              },
            ];
  
            return [{ ...target, isHit: true }, ...splitTargets];
          }
  
          // If the target cannot split further, just mark it as hit
          return [{ ...target, isHit: true }];
        }
        return target;
      });
      return updatedTargets;
    });
  
    setHits((prevHits) => prevHits + 1);
    if (onHit) onHit();
  }, [onHit]);
  
  const handleMiss = useCallback(() => {
    setMisses((prevMisses) => prevMisses + 1);
    if (onMiss) onMiss(); // Call the onMiss prop if it exists
  }, [onMiss]);

  return (
    <GameContainer>
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
          />
        ))}
      </Canvas>
      <Crosshair />
      <ScoreDisplay score={score} />
      <StatsDisplay>
        Score: {score} | High Score: {highScore}
      </StatsDisplay>
      {gameOver && (
        <GameOverOverlay>
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
          <RestartButton onClick={restartGame}>Play Again</RestartButton>
        </GameOverOverlay>
      )}
    </GameContainer>
  );
};

export default Game;

