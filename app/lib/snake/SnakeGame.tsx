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

    const togglePause = useCallback(() => {
        setIsPaused(prev => {
            gameState.current.isRunning = !prev;
            if (!prev) { // If was not paused, now pausing
                // Optionally stop audio or other continuous effects
            } else { // If was paused, now resuming
                gameState.current.lastUpdate = performance.now();
                requestAnimationFrame(loopRef.current);
            }
            return !prev;
        });
    }, []);

    const handleRestart = useCallback(() => {
        setIsPaused(false);
        setScore(0);
        setGameOver(false);
        gameState.current.snake = [{ x: 10, y: 10 }];
        gameState.current.food = { x: 15, y: 15 };
        gameState.current.direction = { x: 1, y: 0 };
        gameState.current.nextDirection = { x: 1, y: 0 };
        gameState.current.lastUpdate = 0; // Reset lastUpdate for fresh loop start
        gameState.current.isRunning = true; // Ensure game starts running
        gameState.current.soundSystem.stopAll();
        gameState.current.soundSystem = new SimpleSoundSystem(); // Re-initialize sound system
        // Start a new loop cycle immediately if not paused
        requestAnimationFrame(loopRef.current);
    }, []);

    const loopRef = useRef((timestamp: number) => {});

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

        // Game loop
        const loop = (timestamp: number) => {
            if (!state.isRunning || isPaused) {
                requestAnimationFrame(loopRef.current);
                return;
            }

            if (timestamp - state.lastUpdate < state.speed) {
                requestAnimationFrame(loopRef.current);
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
                state.soundSystem.score();
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

            requestAnimationFrame(loopRef.current);
        };

        loopRef.current = loop;

        // Initial call to start the game loop
        if (!gameOver) { // Ensure game doesn't start if already game over
            gameState.current.isRunning = true;
            gameState.current.lastUpdate = performance.now();
            requestAnimationFrame(loopRef.current);
        }

        return () => {
            gameState.current.isRunning = false;
            keyboardManager.unbindAll();
        };
        // Empty dependency array is intentional: this effect initializes the entire game
        // and all state functions (setScore, setGameOver, setHighScore) are stable from React
    }, [isPaused, gameOver]); // Re-run effect when isPaused or gameOver changes

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

        // Game loop
        const loop = (timestamp: number) => {
            if (!state.isRunning || isPaused) {
                requestAnimationFrame(loopRef.current);
                return;
            }

            if (timestamp - state.lastUpdate < state.speed) {
                requestAnimationFrame(loopRef.current);
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
                state.soundSystem.powerUp();
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

            requestAnimationFrame(loopRef.current);
        };

        loopRef.current = loop;

        // Initial call to start the game loop
        if (!gameOver) { // Ensure game doesn't start if already game over
            gameState.current.isRunning = true;
            gameState.current.lastUpdate = performance.now();
            requestAnimationFrame(loopRef.current);
        }

        return () => {
            gameState.current.isRunning = false;
            keyboardManager.unbindAll();
        };
        // Empty dependency array is intentional: this effect initializes the entire game
        // and all state functions (setScore, setGameOver, setHighScore) are stable from React
    }, [isPaused, gameOver]); // Re-run effect when isPaused or gameOver changes

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

        // Game loop
        const loop = (timestamp: number) => {
            if (!gameState.current.isRunning || isPaused) {
                requestAnimationFrame(loopRef.current);
                return;
            }

            if (timestamp - state.lastUpdate < state.speed) {
                requestAnimationFrame(loop);
                return;
            }

            gameState.current.lastUpdate = timestamp;
            gameState.current.direction = gameState.current.nextDirection;

            // Move snake
            const head = { x: gameState.current.snake[0].x + gameState.current.direction.x, y: gameState.current.snake[0].y + gameState.current.direction.y };

            // Boundary collision
            if (head.x < 0 || head.x >= gameState.current.tileCount || head.y < 0 || head.y >= gameState.current.tileCount) {
                setGameOver(true);
                gameState.current.isRunning = false;
                gameState.current.soundSystem.gameOver();
                return;
            }

            // Self-collision
            for (let i = 0; i < gameState.current.snake.length; i++) {
                if (head.x === gameState.current.snake[i].x && head.y === gameState.current.snake[i].y) {
                    setGameOver(true);
                    gameState.current.isRunning = false;
                    gameState.current.soundSystem.gameOver();
                    return;
                }
            }

            // Food collision
            if (head.x === gameState.current.food.x && head.y === gameState.current.food.y) {
                setScore(prev => {
                    const newScore = prev + 1;
                    if (newScore > gameState.current.highScoreManager.getHighScore()) {
                        gameState.current.highScoreManager.saveHighScore(newScore);
                        setHighScore(newScore);
                    }
                    return newScore;
                });
                gameState.current.soundSystem.score();
                // Generate new food
                gameState.current.food = {
                    x: Math.floor(Math.random() * gameState.current.tileCount),
                    y: Math.floor(Math.random() * gameState.current.tileCount),
                };
            } else {
                // Remove tail if no food eaten
                gameState.current.snake.pop();
            }

            gameState.current.snake.unshift(head);

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw snake
            for (let i = 0; i < gameState.current.snake.length; i++) {
                ctx.fillStyle = i === 0 ? 'green' : 'lime';
                ctx.fillRect(gameState.current.snake[i].x * gameState.current.gridSize, gameState.current.snake[i].y * gameState.current.gridSize, gameState.current.gridSize - 1, gameState.current.gridSize - 1);
            }

            // Draw food
            ctx.fillStyle = 'red';
            ctx.fillRect(gameState.current.food.x * gameState.current.gridSize, gameState.current.food.y * gameState.current.gridSize, gameState.current.gridSize - 1, gameState.current.gridSize - 1);

            requestAnimationFrame(loopRef.current);
        };

        loopRef.current = loop;

        // Pause/Resume handling in GameControls
        const togglePause = () => {
            state.isRunning = !state.isRunning;
            if (state.isRunning) {
                state.lastUpdate = performance.now();
                requestAnimationFrame(loop);
            }
        };

        // Initial call to start the game loop
        if (!gameOver) {
            gameState.current.isRunning = true;
            gameState.current.lastUpdate = performance.now();
            requestAnimationFrame(loopRef.current);
        }

        return () => {
            gameState.current.isRunning = false;
            keyboardManager.unbindAll();
        };
        // Empty dependency array is intentional: this effect initializes the entire game
        // and all state functions (setScore, setGameOver, setHighScore) are stable from React
    }, []);

    const handleRestart = () => {
        window.location.reload();
    };

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
