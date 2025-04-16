import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import Player from '../Player/Player';
import Target from '../Target/Target';
import ScoreDisplay from '../UI/ScoreDisplay';
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
  const mousePosition = new THREE.Vector2(0, 0); // Center of screen

  useEffect(() => {
    const handleShoot = () => {
      if (document.pointerLockElement && !isGameOver) {
        raycaster.setFromCamera(mousePosition, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        // Find the first target hit
        const targetHit = intersects.find(intersect => {
          const parent = intersect.object.parent;
          return parent?.userData?.isTarget && !parent?.userData?.isHit;
        });

        if (targetHit) {
          const targetId = targetHit.object.parent.userData.targetId;
          targetHit.object.parent.userData.isHit = true;
          onHit(targetId);
        } else {
          onMiss();
        }
      }
    };

    window.addEventListener('click', handleShoot);
    return () => window.removeEventListener('click', handleShoot);
  }, [camera, scene, onHit, onMiss, isGameOver]);

  return null;
};

const Game = () => {
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [targets, setTargets] = useState([
    { id: 1, position: [5, 0, 0] },
    { id: 2, position: [-5, 0, 0] },
    { id: 3, position: [0, 5, 0] },
    { id: 4, position: [0, -5, 0] },
  ]);

  const handleTargetHit = useCallback((targetId) => {
    if (!gameOver) {
      setScore(prevScore => prevScore + 100);
      setHits(prevHits => prevHits + 1);
      setTargets(prevTargets => {
        const newTargets = prevTargets.filter(target => target.id !== targetId);
        if (newTargets.length === 0) {
          setGameOver(true);
          document.exitPointerLock(); // Release the mouse when game is over
        }
        return newTargets;
      });
    }
  }, [gameOver]);

  const handleMiss = useCallback(() => {
    if (!gameOver) {
      setMisses(prevMisses => prevMisses + 1);
    }
  }, [gameOver]);

  const restartGame = useCallback(() => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setGameOver(false);
    setTargets([
      { id: 1, position: [5, 0, 0] },
      { id: 2, position: [-5, 0, 0] },
      { id: 3, position: [0, 5, 0] },
      { id: 4, position: [0, -5, 0] },
    ]);
  }, []);

  const accuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0';

  return (
    <GameContainer>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: '#000000' }}
      >
        <PointerLockControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Player />
        <ShootingSystem onHit={handleTargetHit} onMiss={handleMiss} isGameOver={gameOver} />
        {targets.map(target => (
          <Target
            key={target.id}
            position={target.position}
            targetId={target.id}
            onHit={handleTargetHit}
          />
        ))}
      </Canvas>
      <Crosshair />
      <ScoreDisplay score={score} />
      <StatsDisplay>
        Hits: {hits}<br />
        Misses: {misses}<br />
        Accuracy: {accuracy}%
      </StatsDisplay>
      {gameOver && (
        <GameOverOverlay>
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <p>Final Accuracy: {accuracy}%</p>
          <RestartButton onClick={restartGame}>
            Play Again
          </RestartButton>
        </GameOverOverlay>
      )}
    </GameContainer>
  );
};

export default Game; 