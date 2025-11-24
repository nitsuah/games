import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Bird } from './components/Bird';
import { PipeManager } from './components/PipeManager';
import { Background } from './components/Background';
import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';

const GameContainer = styled.div`
  position: relative;
  width: 800px;
  height: 600px;
  background: #000;
  border: 4px solid #333;
  margin: 0 auto;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  display: block;
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
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');

    const gameRef = useRef({
        bird: null as Bird | null,
        pipeManager: null as PipeManager | null,
        background: null as Background | null,
        highScoreManager: new HighScoreManager('flappy'),
        lastTime: 0,
        speed: 200,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameRef.current;

        // Init
        state.bird = new Bird(100, 300);
        state.pipeManager = new PipeManager(canvas.width, canvas.height);
        state.background = new Background(canvas.width, canvas.height);

        setHighScore(state.highScoreManager.getHighScore());

        // Input
        const handleInput = (e: KeyboardEvent | MouseEvent) => {
            if (gameState === 'gameover') return;

            if (e instanceof KeyboardEvent && e.key !== ' ' && e.key !== 'ArrowUp') return;
            if (e instanceof KeyboardEvent) e.preventDefault(); // Stop scrolling

            if (gameState === 'ready') {
                setGameState('playing');
                state.lastTime = performance.now();
                if (state.bird) state.bird.flap();
            } else if (gameState === 'playing') {
                if (state.bird) state.bird.flap();
            }
        };

        window.addEventListener('keydown', handleInput);
        window.addEventListener('mousedown', handleInput);

        // Loop
        const loop = (timestamp: number) => {
            if (gameState === 'gameover') return; // Stop loop on game over

            const dt = (timestamp - state.lastTime) / 1000;
            state.lastTime = timestamp;

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update
            if (state.background) {
                state.background.update(dt, gameState === 'playing' ? state.speed : 50);
                state.background.draw(ctx);
            }

            if (gameState === 'playing') {
                if (state.bird) {
                    state.bird.update(dt);
                    state.bird.draw(ctx);
                }

                if (state.pipeManager) {
                    state.pipeManager.update(dt, () => {
                        setScore(prev => {
                            const newScore = prev + 1;
                            if (newScore > state.highScoreManager.getHighScore()) {
                                state.highScoreManager.saveHighScore(newScore);
                                setHighScore(newScore);
                            }
                            return newScore;
                        });
                    });
                    state.pipeManager.draw(ctx);

                    // Collision
                    if (state.bird && state.pipeManager.checkCollision(state.bird)) {
                        setGameState('gameover');
                    }
                }
            } else if (gameState === 'ready') {
                // Draw bird hovering
                if (state.bird) {
                    state.bird.y = 300 + Math.sin(timestamp / 200) * 10;
                    state.bird.draw(ctx);
                }
            }

            // Ground (draw last to cover pipes)
            ctx.fillStyle = '#e0ac69'; // Sand color
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
            ctx.fillStyle = '#75b85b'; // Grass top
            ctx.fillRect(0, canvas.height - 20, canvas.width, 4);

            if (gameState !== 'gameover') {
                requestAnimationFrame(loop);
            }
        };

        state.lastTime = performance.now();
        requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleInput);
            window.removeEventListener('mousedown', handleInput);
        };
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
            <Canvas ref={canvasRef} width={800} height={600} />
            <UIOverlay>
                {score}
            </UIOverlay>

            {gameState === 'ready' && (
                <StartScreen>
                    <h1>FLAPPY BIRD</h1>
                    <p>Press Space or Click to Flap</p>
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
