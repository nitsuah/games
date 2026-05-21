import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import HighScoreManager from '@/lib/shared/scoring/HighScoreManager';
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';

// Physics constants
const PADDLE_SPIN_MULTIPLIER = 400; // How much paddle position affects ball vertical velocity

// Minimum ball angle to avoid infinite horizontal loops (~14 degrees)
const MIN_BALL_ANGLE = 0.25; // radians

/**
 * Ensures the ball travels at a minimum angle relative to horizontal,
 * preventing shallow trajectories that cause near-infinite horizontal loops.
 * Preserves total ball speed when adjusting the angle.
 * @param vx - Horizontal velocity component
 * @param vy - Vertical velocity component
 * @param minAngle - Minimum angle in radians (measured from horizontal)
 */
function ensureMinAngle(vx: number, vy: number, minAngle: number) {
    const speed = Math.sqrt(vx * vx + vy * vy);
    const angle = Math.atan2(Math.abs(vy), Math.abs(vx));
    if (angle < minAngle) {
        const vxSign = vx >= 0 ? 1 : -1;
        const vySign = vy >= 0 ? 1 : -1;
        const newVx = Math.cos(minAngle) * speed * vxSign;
        const newVy = Math.sin(minAngle) * speed * vySign;
        return { vx: newVx, vy: newVy };
    }
    return { vx, vy };
}

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
  top: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 40px;
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

export const PongGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [playerScore, setPlayerScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState('');

    const gameState = useRef({
        ball: { x: 400, y: 300, vx: 300, vy: 200, radius: 8 },
        playerPaddle: { x: 750, y: 250, width: 15, height: 100, speed: 500 },
        aiPaddle: { x: 35, y: 250, width: 15, height: 100, speed: 250 },
        input: { up: false, down: false },
        soundSystem: new SimpleSoundSystem(),
        isRunning: false,
        lastTime: 0,
        winScore: 5,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameState.current;

        // Input
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') state.input.up = true;
            if (e.key === 'ArrowDown') state.input.down = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') state.input.up = false;
            if (e.key === 'ArrowDown') state.input.down = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Game loop
        const loop = (timestamp: number) => {
            if (!state.isRunning) return;

            const dt = (timestamp - state.lastTime) / 1000;
            state.lastTime = timestamp;

            // Update player paddle
            if (state.input.up) state.playerPaddle.y -= state.playerPaddle.speed * dt;
            if (state.input.down) state.playerPaddle.y += state.playerPaddle.speed * dt;
            state.playerPaddle.y = Math.max(0, Math.min(canvas.height - state.playerPaddle.height, state.playerPaddle.y));

            // Update AI paddle (simple tracking with delay)
            const aiTarget = state.ball.y - state.aiPaddle.height / 2;
            const aiDiff = aiTarget - state.aiPaddle.y;
            state.aiPaddle.y += Math.sign(aiDiff) * Math.min(Math.abs(aiDiff), state.aiPaddle.speed * dt);
            state.aiPaddle.y = Math.max(0, Math.min(canvas.height - state.aiPaddle.height, state.aiPaddle.y));

            // Update ball
            state.ball.x += state.ball.vx * dt;
            state.ball.y += state.ball.vy * dt;

            // Ball collision with top/bottom
            if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > canvas.height) {
                state.ball.vy *= -1;
                state.soundSystem.hit();
            }


            // Ball collision with paddles (with minimum angle to avoid infinite loops)
            // Player paddle
            if (state.ball.x + state.ball.radius > state.playerPaddle.x &&
                state.ball.x - state.ball.radius < state.playerPaddle.x + state.playerPaddle.width &&
                state.ball.y > state.playerPaddle.y &&
                state.ball.y < state.playerPaddle.y + state.playerPaddle.height) {
                state.ball.vx = -Math.abs(state.ball.vx);
                state.ball.x = state.playerPaddle.x - state.ball.radius;
                // Add spin based on where it hit the paddle
                const hitPos = (state.ball.y - state.playerPaddle.y) / state.playerPaddle.height;
                state.ball.vy += (hitPos - 0.5) * PADDLE_SPIN_MULTIPLIER;
                // Ensure minimum angle
                const newVel = ensureMinAngle(state.ball.vx, state.ball.vy, MIN_BALL_ANGLE);
                state.ball.vx = newVel.vx;
                state.ball.vy = newVel.vy;
                state.soundSystem.hit();
            }

            // AI paddle
            if (state.ball.x - state.ball.radius < state.aiPaddle.x + state.aiPaddle.width &&
                state.ball.x + state.ball.radius > state.aiPaddle.x &&
                state.ball.y > state.aiPaddle.y &&
                state.ball.y < state.aiPaddle.y + state.aiPaddle.height) {
                state.ball.vx = Math.abs(state.ball.vx);
                state.ball.x = state.aiPaddle.x + state.aiPaddle.width + state.ball.radius;
                const hitPos = (state.ball.y - state.aiPaddle.y) / state.aiPaddle.height;
                state.ball.vy += (hitPos - 0.5) * PADDLE_SPIN_MULTIPLIER;
                // Ensure minimum angle
                const newVel = ensureMinAngle(state.ball.vx, state.ball.vy, MIN_BALL_ANGLE);
                state.ball.vx = newVel.vx;
                state.ball.vy = newVel.vy;
                state.soundSystem.hit();
            }

            // Scoring
            if (state.ball.x < 0) {
                state.soundSystem.powerUp();
                setPlayerScore(prev => {
                    const newScore = prev + 1;
                    if (newScore >= state.winScore) {
                        setWinner('Player');
                        setGameOver(true);
                        state.isRunning = false;
                    }
                    return newScore;
                });
                state.ball = { x: 400, y: 300, vx: 300, vy: 200, radius: 8 };
            }

            if (state.ball.x > canvas.width) {
                state.soundSystem.powerUp();
                setAiScore(prev => {
                    const newScore = prev + 1;
                    if (newScore >= state.winScore) {
                        setWinner('AI');
                        setGameOver(true);
                        state.isRunning = false;
                    }
                    return newScore;
                });
                state.ball = { x: 400, y: 300, vx: -300, vy: 200, radius: 8 };
            }

            // Draw
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw center line
            ctx.strokeStyle = '#444';
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw paddles
            ctx.fillStyle = '#fff';
            ctx.fillRect(state.playerPaddle.x, state.playerPaddle.y, state.playerPaddle.width, state.playerPaddle.height);
            ctx.fillRect(state.aiPaddle.x, state.aiPaddle.y, state.aiPaddle.width, state.aiPaddle.height);

            // Draw ball
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
            ctx.fill();

            requestAnimationFrame(loop);
        };

        state.isRunning = true;
        state.lastTime = performance.now();
        requestAnimationFrame(loop);

        return () => {
            state.isRunning = false;
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
        // Empty dependency array is intentional: this effect initializes the entire game
        // and all state functions (setPlayerScore, setAiScore, setGameOver, setWinner) are stable from React
    }, []);

    const handleRestart = () => {
        window.location.reload();
    };

    return (
        <GameContainer>
            <Canvas ref={canvasRef} width={800} height={600} />
            <UIOverlay>
                <div>{aiScore}</div>
                <div>{playerScore}</div>
            </UIOverlay>

            {gameOver && (
                <GameOverScreen>
                    <h2>{winner} WINS!</h2>
                    <p>Final Score: {aiScore} - {playerScore}</p>
                    <Button onClick={handleRestart}>PLAY AGAIN</Button>
                </GameOverScreen>
            )}
        </GameContainer>
    );
};
