import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';
import keyboardManager from '@/lib/shared/input/KeyboardManager';

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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

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
            if (!state.isRunning) return;

            if (timestamp - state.lastUpdate < state.speed) {
                requestAnimationFrame(loop);
                return;
            }

            state.lastUpdate = timestamp;
            state.direction = state.nextDirection;

            // Move snake
            const head = { x: state.snake[0].x + state.direction.x, y: state.snake[0].y + state.direction.y };

            // Check wall collision
            if (head.x < 0 || head.x >= state.tileCount || head.y < 0 || head.y >= state.tileCount) {
                state.soundSystem.gameOver();
                setGameOver(true);
                state.isRunning = false;
                return;
            }

            // Check self collision
            if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                state.soundSystem.gameOver();
                setGameOver(true);
                state.isRunning = false;
                return;
            }

            state.snake.unshift(head);

            // Check food collision
            if (head.x === state.food.x && head.y === state.food.y) {
                state.soundSystem.powerUp();
                setScore(prev => {
                    const newScore = prev + 10;
                    if (newScore > state.highScoreManager.getHighScore()) {
                        state.highScoreManager.saveHighScore(newScore);
                        setHighScore(newScore);
                    }
                    return newScore;
                });

                // Spawn new food
                let newFood: Point;
                do {
                    newFood = {
                        x: Math.floor(Math.random() * state.tileCount),
                        y: Math.floor(Math.random() * state.tileCount),
                    };
                } while (state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
                state.food = newFood;

                // Increase speed slightly
                state.speed = Math.max(50, state.speed - 2);
            } else {
                state.snake.pop();
            }

            // Draw
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            ctx.strokeStyle = '#222';
            for (let i = 0; i <= state.tileCount; i++) {
                ctx.beginPath();
                ctx.moveTo(i * state.gridSize, 0);
                ctx.lineTo(i * state.gridSize, canvas.height);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * state.gridSize);
                ctx.lineTo(canvas.width, i * state.gridSize);
                ctx.stroke();
            }

            // Draw snake
            state.snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#0f0' : '#0a0';
                ctx.fillRect(segment.x * state.gridSize, segment.y * state.gridSize, state.gridSize - 2, state.gridSize - 2);
            });

            // Draw food
            ctx.fillStyle = '#f00';
            ctx.fillRect(state.food.x * state.gridSize, state.food.y * state.gridSize, state.gridSize - 2, state.gridSize - 2);

            requestAnimationFrame(loop);
        };

        state.isRunning = true;
        state.lastUpdate = performance.now();
        requestAnimationFrame(loop);

        return () => {
            state.isRunning = false;
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
                onPause={() => { gameState.current.isRunning = !gameState.current.isRunning }}
                onRestart={handleRestart}
            />
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
        </GameContainer>
    );
};
