import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';
import keyboardManager from '@/lib/shared/input/KeyboardManager';
import { GameControls } from '../../_components/shared/GameControls';
import { VirtualJoystick } from '../../_components/shared/gamepad/VirtualJoystick';

const GameContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    border: 4px solid #333;
    margin: 0 auto;
    overflow: hidden;
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
    box-shadow: 0 0 24px #000a;
    border-radius: 12px;
`;

const UIOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  pointer-events: none;
  box-sizing: border-box;
  @media (max-width: 600px) {
    font-size: 14px;
    padding: 10px;
  }
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

interface Point {
    x: number;
    y: number;
}

export const SnakeGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const gameState = useRef({
        snake: [{ x: 10, y: 10 }] as Point[],
        food: { x: 15, y: 15 } as Point,
        direction: { x: 1, y: 0 } as Point,
        nextDirection: { x: 1, y: 0 } as Point,
        gridSize: 20,
        tileCount: 40,
        speed: 100,
        lastUpdate: 0,
        highScoreManager: new HighScoreManager('snake'),
        soundSystem: new SimpleSoundSystem(),
        isRunning: false,
    });

    const loopRef = useRef<((timestamp: number) => void) | undefined>(undefined);

    const togglePause = useCallback(() => {
        setIsPaused(prev => {
            gameState.current.isRunning = !prev;
            if (!prev) { // If was not paused, now pausing
                // Optionally stop audio or other continuous effects
            } else { // If was paused, now resuming
                gameState.current.lastUpdate = performance.now();
                if (loopRef.current) requestAnimationFrame(loopRef.current);
            }
            return !prev;
        });
    }, []);

    const handleRestart = useCallback(() => {
        setIsPaused(false);
        setScore(0);
        setGameOver(false);
        // Reset game state
        gameState.current.snake = [{ x: 10, y: 10 }];
        gameState.current.food = { x: 15, y: 15 };
        gameState.current.direction = { x: 1, y: 0 };
        gameState.current.nextDirection = { x: 1, y: 0 };
        gameState.current.lastUpdate = 0;
        gameState.current.isRunning = true;
        gameState.current.soundSystem = new SimpleSoundSystem(); // Re-initialize sound system
        if (loopRef.current) requestAnimationFrame(loopRef.current);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size from container
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameState.current;
        setHighScore(state.highScoreManager.getHighScore());

        // Input
        keyboardManager.bindKeys({
            'arrowup': () => { if (state.direction.y === 0) state.nextDirection = { x: 0, y: -1 }; },
            'arrowdown': () => { if (state.direction.y === 0) state.nextDirection = { x: 0, y: 1 }; },
            'arrowleft': () => { if (state.direction.x === 0) state.nextDirection = { x: -1, y: 0 }; },
            'arrowright': () => { if (state.direction.x === 0) state.nextDirection = { x: 1, y: 0 }; },
        });

        // Game loop function
        const gameLoop = (timestamp: number) => {
            if (!state.isRunning || isPaused) {
                requestAnimationFrame(gameLoop);
                return;
            }

            if (timestamp - state.lastUpdate < state.speed) {
                requestAnimationFrame(gameLoop);
                return;
            }

            state.lastUpdate = timestamp;
            state.direction = state.nextDirection;

            // Move snake
            const head = { x: state.snake[0].x + state.direction.x, y: state.snake[0].y + state.direction.y };

            // Boundary collision
            if (head.x < 0 || head.x >= state.tileCount || head.y < 0 || head.y >= state.tileCount) {
                setGameOver(true);
                state.isRunning = false;
                state.soundSystem.gameOver();
                return;
            }

            // Self-collision
            for (let i = 0; i < state.snake.length; i++) {
                if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
                    setGameOver(true);
                    state.isRunning = false;
                    state.soundSystem.gameOver();
                    return;
                }
            }

            // Food collision
            if (head.x === state.food.x && head.y === state.food.y) {
                setScore(prev => {
                    const newScore = prev + 1;
                    if (newScore > state.highScoreManager.getHighScore()) {
                        state.highScoreManager.saveHighScore(newScore);
                        setHighScore(newScore);
                    }
                    return newScore;
                });
                state.soundSystem.powerUp(); // Use powerUp for score sound
                // Generate new food
                state.food = {
                    x: Math.floor(Math.random() * state.tileCount),
                    y: Math.floor(Math.random() * state.tileCount),
                };
            } else {
                // Remove tail if no food eaten
                state.snake.pop();
            }

            state.snake.unshift(head);

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw snake
            for (let i = 0; i < state.snake.length; i++) {
                ctx.fillStyle = i === 0 ? 'green' : 'lime';
                ctx.fillRect(state.snake[i].x * state.gridSize, state.snake[i].y * state.gridSize, state.gridSize - 1, state.gridSize - 1);
            }

            // Draw food
            ctx.fillStyle = 'red';
            ctx.fillRect(state.food.x * state.gridSize, state.food.y * state.gridSize, state.gridSize - 1, state.gridSize - 1);

            requestAnimationFrame(gameLoop);
        };

        loopRef.current = gameLoop;

        // Initial call to start the game loop
        if (!gameOver) { // Ensure game doesn't start if already game over
            state.isRunning = true;
            state.lastUpdate = performance.now();
            requestAnimationFrame(loopRef.current);
        }

        return () => {
            state.isRunning = false;
            keyboardManager.unbindAll();
            if (loopRef.current) cancelAnimationFrame(loopRef.current); // Clean up animation frame
        };
    }, [isPaused, gameOver]); // Re-run effect when isPaused or gameOver changes

    return (
        <GameContainer>
            <GameControls
                onPause={togglePause}
                onRestart={handleRestart}
            />
            <VirtualJoystick onMove={(x: number, y: number) => {
                if (Math.abs(x) > Math.abs(y)) {
                    if (x > 0 && gameState.current.direction.x === 0) gameState.current.nextDirection = { x: 1, y: 0 };
                    else if (x < 0 && gameState.current.direction.x === 0) gameState.current.nextDirection = { x: -1, y: 0 };
                } else {
                    if (y > 0 && gameState.current.direction.y === 0) gameState.current.nextDirection = { x: 0, y: 1 };
                    else if (y < 0 && gameState.current.direction.y === 0) gameState.current.nextDirection = { x: 0, y: -1 };
                }
            }} />
            <Canvas ref={canvasRef} />
            <UIOverlay>
                <div>SCORE: {score}</div>
                <div>HI: {highScore}</div>
            </UIOverlay>

            {gameOver && (
                <GameOverScreen>
                    <h2>GAME OVER</h2>
                    <p>Final Score: {score}</p>
                    <Button onClick={handleRestart}>TRY AGAIN</Button>
                </GameOverScreen>
            )}
            {isPaused && !gameOver && (
                <GameOverScreen>
                    <h2>PAUSED</h2>
                    <Button onClick={togglePause}>RESUME</Button>
                </GameOverScreen>
            )}
        </GameContainer>
    );
};