import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Player from '../Player/Player';
import Target from '../Target/Target';
import ScoreDisplay from '../UI/ScoreDisplay';
import styled from 'styled-components';

const GameContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
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

const Game = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [targets, setTargets] = useState([
    { id: 1, position: [5, 0, 0] },
    { id: 2, position: [-5, 0, 0] },
    { id: 3, position: [0, 5, 0] },
    { id: 4, position: [0, -5, 0] },
  ]);

  const handleTargetHit = useCallback((targetId) => {
    setScore(prevScore => prevScore + 100);
    setTargets(prevTargets => {
      const newTargets = prevTargets.filter(target => target.id !== targetId);
      if (newTargets.length === 0) {
        setGameOver(true);
      }
      return newTargets;
    });
  }, []);

  const restartGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Player />
        {targets.map(target => (
          <Target
            key={target.id}
            position={target.position}
            onHit={() => handleTargetHit(target.id)}
          />
        ))}
        <OrbitControls />
      </Canvas>
      <ScoreDisplay score={score} />
      {gameOver && (
        <GameOverOverlay>
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <RestartButton onClick={restartGame}>
            Play Again
          </RestartButton>
        </GameOverOverlay>
      )}
    </GameContainer>
  );
};

export default Game; 