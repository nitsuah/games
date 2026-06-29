import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Bird } from './components/Bird';
import { PipeManager } from './components/PipeManager';
import { Background } from './components/Background';
import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';
import { GameControls } from '../../_components/shared/GameControls';

const GameContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border: 4px solid #333;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 600px) {
    border-width: 2px;
  }
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  background: #000;
  box-sizing: border-box;
`;

const UIOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 40px;
  font-weight: bold;
  pointer-events: none;
  text-shadow: 2px 2px 0 #000;
`;

const StartScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  font-family: 'Courier New', monospace;
  pointer-events: none;
`;

const GameOverScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border: 2px solid #fff;
  text-align: center;
  color: #fff;
  font-family: 'Courier New', monospace;
`;

const Button = styled.button`
  background: #fff;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  margin-top: 20px;
  font-family: 'Courier New', monospace;
  
  &:hover {
    background: #ccc;
  }
`;

export const FlappyGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover' | 'paused'>('ready');

  const gameRef = useRef({
    bird: null as Bird | null,
    pipeManager: null as PipeManager | null,
    background: null as Background | null,
    highScoreManager: new HighScoreManager('flappy-bird'),
    soundSystem: new SimpleSoundSystem(),
    lastTime: 0,
    isRunning: false,
  });

  const requestRef = useRef<number | undefined>(undefined);
  const loopRef = useRef((timestamp: number) => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size from container
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameRef.current;

    // Initialize game objects
    state.bird = new Bird(100, 300);
    state.pipeManager = new PipeManager(canvas.width, canvas.height);
    state.background = new Background(canvas.width, canvas.height);

    setHighScore(state.highScoreManager.getHighScore());

    // Input handling
    const handleInput = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent && e.key !== ' ') return;

      if (gameState === 'ready') {
        setGameState('playing');
        state.bird?.flap();
        state.soundSystem.flap();
      } else if (gameState === 'playing') {
        state.bird?.flap();
        state.soundSystem.flap();
      }
    };

    window.addEventListener('keydown', handleInput);
    window.addEventListener('mousedown', handleInput);

    // Game Loop
    const loop = (timestamp: number) => {
      if (gameState === 'paused') {
          requestRef.current = requestAnimationFrame(loopRef.current);
          return;
      }
      const dt = (timestamp - state.lastTime) / 1000;
      state.lastTime = timestamp;

      // Clear canvas
      ctx.fillStyle = '#4ec0ca';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (state.background) {
        state.background.draw(ctx);
      }

      // Update and draw based on game state
      if (gameState === 'playing') {
        // Update bird
        if (state.bird) {
          state.bird.update(dt);

          // Check ground collision
          if (state.bird.y + state.bird.height >= canvas.height - 20) {
            state.soundSystem.gameOver();
            setGameState('gameover');
          }

          // Check ceiling collision
          if (state.bird.y <= 0) {
            state.soundSystem.gameOver();
            setGameState('gameover');
          }
        }

        // Update pipes
        if (state.pipeManager && state.bird) {
          state.pipeManager.update(dt, () => {
            state.soundSystem.hit();
            setScore(prev => {
              const newScore = prev + 1;
              if (newScore > state.highScoreManager.getHighScore()) {
                state.highScoreManager.saveHighScore(newScore);
                setHighScore(newScore);
              }
              return newScore;
            });
          });

          // Check pipe collision
          if (state.pipeManager.checkCollision(state.bird)) {
            state.soundSystem.gameOver();
            setGameState('gameover');
          }
        }
      }

      // Draw pipes
      if (state.pipeManager) {
        state.pipeManager.draw(ctx);
      }

      // Draw bird
      if (state.bird) {
        state.bird.draw(ctx);
      }

      // Ground (draw last to cover pipes)
      ctx.fillStyle = '#e0ac69'; // Sand color
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
      ctx.fillStyle = '#75b85b'; // Grass top
      ctx.fillRect(0, canvas.height - 20, canvas.width, 4);

      requestRef.current = requestAnimationFrame(loopRef.current);
    };

      state.lastTime = performance.now();
      requestRef.current = requestAnimationFrame(loopRef.current);

    return () => {
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('mousedown', handleInput);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // gameState dependency is required: the game loop closure captures gameState
    // and needs to re-run when transitioning between ready/playing/gameover states
    // to properly update the loop's conditional logic
  }, [gameState]);

  const handleRestart = () => {
    const state = gameRef.current;
    if (state.bird) state.bird.reset(300);
    if (state.pipeManager) state.pipeManager.reset();
    setScore(0);
    setGameState('ready');
  };

  return (
    <GameContainer>
      <GameControls
        onPause={() => setGameState(prev => prev === 'playing' ? 'paused' : 'playing')}
        onRestart={handleRestart}
      />
      <Canvas ref={canvasRef} />
      <UIOverlay>
        {score}
      </UIOverlay>

      {gameState === 'ready' && (
        <StartScreen>
          <h1>FLAPPY BIRD</h1>
          <Button onClick={() => setGameState('playing')}>START GAME</Button>
        </StartScreen>
      )}

      {gameState === 'gameover' && (
        <GameOverScreen>
          <h2>GAME OVER</h2>
          <p>Score: {score}</p>
          <p>Best: {highScore}</p>
          <Button onClick={handleRestart}>PLAY AGAIN</Button>
        </GameOverScreen>
      )}
    </GameContainer>
  );
};
