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
  const [highScore, setHighScore] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [targets, setTargets] = useState([
    { id: 1, position: [5, 0, 0] },
    { id: 2, position: [-5, 0, 0] },
    { id: 3, position: [0, 5, 0] },
    { id: 4, position: [0, -5, 0] },
  ]);

  // Load high scores from localStorage on client side
  useEffect(() => {
    const savedHighScore = window.localStorage.getItem('asteroidHighScore');
    const savedBestAccuracy = window.localStorage.getItem('asteroidBestAccuracy');
    
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    if (savedBestAccuracy) {
      setBestAccuracy(parseFloat(savedBestAccuracy));
    }
  }, []);

  const calculateScore = useCallback((hits, misses, baseScore) => {
    const accuracy = hits + misses > 0 ? hits / (hits + misses) : 0;
    // Base score + (Base score * accuracy bonus)
    // This means at 100% accuracy you get double points
    return Math.round(baseScore + (baseScore * accuracy));
  }, []);

  const handleTargetHit = useCallback((targetId) => {
    if (!gameOver) {
      const newHits = hits + 1;
      setHits(newHits);
      
      // Calculate new score with accuracy bonus
      const baseScore = (newHits * 100); // 100 points per hit
      const newScore = calculateScore(newHits, misses, baseScore);
      setScore(newScore);

      setTargets(prevTargets => {
        const newTargets = prevTargets.filter(target => target.id !== targetId);
        if (newTargets.length === 0) {
          setGameOver(true);
          document.exitPointerLock();
        }
        return newTargets;
      });
    }
  }, [gameOver, hits, misses, calculateScore]);

  const handleMiss = useCallback(() => {
    if (!gameOver) {
      const newMisses = misses + 1;
      setMisses(newMisses);
      
      // Recalculate score with new accuracy
      const baseScore = (hits * 100);
      const newScore = calculateScore(hits, newMisses, baseScore);
      setScore(newScore);
    }
  }, [gameOver, hits, misses, calculateScore]);

  const accuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : '0.0';

  // Update high score and best accuracy when game is over
  useEffect(() => {
    if (gameOver && typeof window !== 'undefined') {
      if (score > highScore) {
        setIsNewHighScore(true);
        setHighScore(score);
        window.localStorage.setItem('asteroidHighScore', score.toString());
      }
      
      const currentAccuracy = parseFloat(accuracy);
      if (currentAccuracy > bestAccuracy) {
        setBestAccuracy(currentAccuracy);
        window.localStorage.setItem('asteroidBestAccuracy', currentAccuracy.toString());
      }
    }
  }, [gameOver, score, accuracy, highScore, bestAccuracy]);

  const restartGame = useCallback(() => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setGameOver(false);
    setIsNewHighScore(false);
    setTargets([
      { id: 1, position: [5, 0, 0] },
      { id: 2, position: [-5, 0, 0] },
      { id: 3, position: [0, 5, 0] },
      { id: 4, position: [0, -5, 0] },
    ]);
  }, []);

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
{/*       <StatsDisplay>
        Score: {score} | High Score: {highScore}<br />
        Hits: {hits} | Misses: {misses}<br />
        Accuracy: {accuracy}% | Best: {bestAccuracy.toFixed(1)}%
      </StatsDisplay> */}
      {gameOver && (
        <GameOverOverlay>
          <h2>Game Over!</h2>
          <p>Final Score: {score} {isNewHighScore && '🏆 New High Score!'}</p>
          <p>Final Accuracy: {accuracy}% {parseFloat(accuracy) > bestAccuracy && '🎯 New Best!'}</p>
          <p>High Score: {highScore}</p>
          <p>Best Accuracy: {bestAccuracy.toFixed(1)}%</p>
          <RestartButton onClick={restartGame}>
            Play Again
          </RestartButton>
        </GameOverOverlay>
      )}
    </GameContainer>
  );
};

export default Game; 