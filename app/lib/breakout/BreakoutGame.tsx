import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Paddle } from './components/Paddle';
import { Ball } from './components/Ball';
import { BrickGrid } from './components/BrickGrid';
import { PowerUpSystem, PowerUpType } from './components/PowerUpSystem';
import { WaveManager } from '@/lib/shared/progression/WaveManager';
import { LivesManager } from '@/lib/shared/progression/LivesManager';
import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';

const GameContainer = styled.div`
    position: relative;
    width: 100%;
    max-width: 800px;
    aspect-ratio: 4/3;
    background: #000;
    border: 4px solid #333;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
`;

const Canvas = styled.canvas`
    display: block;
    width: 100%;
    height: 100%;
    max-width: 800px;
    max-height: 600px;
    aspect-ratio: 4/3;
    background: #000;
    box-sizing: border-box;
`;

const UIOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    min-width: 0;
    padding: 20px 32px 0 32px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 20px;
    pointer-events: none;
    box-sizing: border-box;
    z-index: 2;
    @media (max-width: 900px) {
        font-size: 16px;
        padding: 12px 8px 0 8px;
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

export const BreakoutGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);

    // Game state refs (to avoid closure staleness in loop)
    const gameState = useRef({
        paddle: null as Paddle | null,
        balls: [] as Ball[],
        brickGrid: null as BrickGrid | null,
        powerUpSystem: null as PowerUpSystem | null,
        waveManager: new WaveManager({ initialWave: 1 }),
        livesManager: new LivesManager({ initialLives: 3 }),
        highScoreManager: new HighScoreManager('breakout'),
        soundSystem: new SimpleSoundSystem(),
        input: { left: false, right: false },
        isRunning: false,
        lastTime: 0,
    });
    
    // Store timeout IDs for cleanup
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize game objects
        const state = gameState.current;
        state.paddle = new Paddle({
            x: 350,
            y: 550,
            width: 100,
            height: 20,
            color: '#3498db',
            speed: 500,
            canvasWidth: canvas.width,
        });

        state.balls = [new Ball({
            x: 400,
            y: 530,
            radius: 8,
            velocity: { x: 200, y: -200 },
            color: '#fff',
        })];

        state.brickGrid = new BrickGrid();
        state.brickGrid.init(1);

        state.powerUpSystem = new PowerUpSystem();

        setHighScore(state.highScoreManager.getHighScore());

        // Input handling
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') state.input.left = true;
            if (e.key === 'ArrowRight') state.input.right = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') state.input.left = false;
            if (e.key === 'ArrowRight') state.input.right = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Game Loop
        const loop = (timestamp: number) => {
            if (!state.isRunning) return;

            const dt = (timestamp - state.lastTime) / 1000;
            state.lastTime = timestamp;

            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update & Draw Paddle
            if (state.paddle) {
                state.paddle.update(dt, state.input);
                state.paddle.draw(ctx);
            }

            // Update & Draw Balls
            state.balls.forEach(ball => {
                ball.update(dt);

                // Wall collisions
                if (ball.x - ball.radius < 0) {
                    ball.x = ball.radius;
                    ball.bounceX();
                }
                if (ball.x + ball.radius > canvas.width) {
                    ball.x = canvas.width - ball.radius;
                    ball.bounceX();
                }
                if (ball.y - ball.radius < 0) {
                    ball.y = ball.radius;
                    ball.bounceY();
                }

                // Paddle collision
                if (state.paddle &&
                    ball.y + ball.radius > state.paddle.y &&
                    ball.y - ball.radius < state.paddle.y + state.paddle.height &&
                    ball.x > state.paddle.x &&
                    ball.x < state.paddle.x + state.paddle.getCurrentWidth()) {

                    ball.y = state.paddle.y - ball.radius;
                    ball.bounceY();
                    state.soundSystem.hit();

                    // Add some horizontal velocity based on hit position
                    const hitPos = (ball.x - state.paddle.x) / state.paddle.getCurrentWidth();
                    ball.velocity.x += (hitPos - 0.5) * 200;
                }

                // Brick collision
                if (state.brickGrid) {
                    const hitBrick = state.brickGrid.checkCollision(ball);
                    if (hitBrick) {
                        state.soundSystem.destroy();
                        setScore(prev => {
                            const newScore = prev + hitBrick.value;
                            if (newScore > state.highScoreManager.getHighScore()) {
                                state.highScoreManager.saveHighScore(newScore);
                                setHighScore(newScore);
                            }
                            return newScore;
                        });

                        // Spawn powerup
                        state.powerUpSystem?.spawn(hitBrick.x + hitBrick.width / 2, hitBrick.y + hitBrick.height / 2);
                    }
                }

                ball.draw(ctx);
            });

            // Check for level clear
            if (state.brickGrid && state.brickGrid.getActiveBrickCount() === 0) {
                const nextLevel = state.waveManager.nextWave();
                setLevel(nextLevel);
                state.brickGrid.init(nextLevel);
                // Reset ball
                state.balls = [new Ball({
                    x: 400,
                    y: 530,
                    radius: 8,
                    velocity: { x: 200 * (1 + nextLevel * 0.1), y: -200 * (1 + nextLevel * 0.1) },
                    color: '#fff',
                })];
                if (state.paddle) state.paddle.reset(350);
            }

            // Check for ball death
            state.balls = state.balls.filter(b => b.y - b.radius < canvas.height);
            if (state.balls.length === 0) {
                const currentTime = performance.now();
                if (state.livesManager.loseLife(currentTime)) {
                    setLives(state.livesManager.lives);
                    // Reset ball
                    state.balls = [new Ball({
                        x: 400,
                        y: 530,
                        radius: 8,
                        velocity: { x: 200, y: -200 },
                        color: '#fff',
                    })];
                    if (state.paddle) state.paddle.reset(350);
                } else {
                    state.soundSystem.gameOver();
                    setGameOver(true);
                    state.isRunning = false;
                }
            }

            // Update & Draw PowerUps
            if (state.powerUpSystem && state.paddle) {
                state.powerUpSystem.update(dt, state.paddle, (type: PowerUpType) => {
                    state.soundSystem.powerUp();
                    // Handle powerup collection
                    if (type === 'multiBall') {
                        state.balls.push(new Ball({
                            x: state.balls[0]?.x || 400,
                            y: state.balls[0]?.y || 300,
                            radius: 8,
                            velocity: { x: -200, y: -250 },
                            color: '#fff',
                        }));
                    } else if (type === 'expandPaddle' && state.paddle) {
                        state.paddle.widthMultiplier = 1.5;
                        // Clear any existing timeout
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                        }
                        timeoutRef.current = setTimeout(() => {
                            if (state.paddle) {
                                state.paddle.widthMultiplier = 1;
                            }
                            timeoutRef.current = null;
                        }, 10000);
                    }
                    // Add other powerups...
                });
                state.powerUpSystem.draw(ctx);
            }

            // Draw Brick Grid
            if (state.brickGrid) {
                state.brickGrid.draw(ctx);
            }

            requestAnimationFrame(loop);
        };

        // Start loop
        state.isRunning = true;
        state.lastTime = performance.now();
        requestAnimationFrame(loop);

        return () => {
            state.isRunning = false;
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            // Clear any pending timeouts
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
        // Empty dependency array is intentional: this effect sets up the entire game.
        // All state setter functions (setScore, setLives, etc.) are stable from React.
        // Game restart is handled explicitly via handleRestart(), which is only called
        // from UI events (e.g., button click) and not from within this effect.
        // Therefore, handleRestart does not need to be in the dependencies.
    }, []);

    const handleRestart = () => {
        const state = gameState.current;
        state.livesManager.reset();
        state.waveManager.reset();
        setLives(3);
        setScore(0);
        setLevel(1);
        setGameOver(false);

        if (state.brickGrid) state.brickGrid.init(1);
        if (state.paddle) state.paddle.reset(350);
        state.balls = [new Ball({
            x: 400,
            y: 530,
            radius: 8,
            velocity: { x: 200, y: -200 },
            color: '#fff',
        })];

        // Clear power-up drops
        if (state.powerUpSystem) {
            state.powerUpSystem.drops = [];
        }
        
        // Clear any pending timeouts
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        // Reset paddle width multiplier
        if (state.paddle) {
            state.paddle.widthMultiplier = 1;
        }

        // The game loop is already running in useEffect, just ensure it continues
        state.isRunning = true;
        state.lastTime = performance.now();
    };

    return (
        <GameContainer data-testid="game-container">
            <Canvas ref={canvasRef} width={800} height={600} />
            <UIOverlay>
                <div>SCORE: {score}</div>
                <div>LEVEL: {level}</div>
                <div>LIVES: {lives}</div>
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
