import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { PlayerShip } from './components/PlayerShip';
import { EnemyFormation } from './components/EnemyFormation';
import { UFO } from './components/UFO';
import { EnemyShootingSystem } from '@/lib/shared/combat/EnemyShootingSystem';
import { ShieldSystem } from '@/lib/shared/physics/ShieldSystem';
import { WaveManager } from '@/lib/shared/progression/WaveManager';
import { LivesManager } from '@/lib/shared/progression/LivesManager';
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
  justify-content: space-between;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 20px;
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

export const SpaceInvadersGame = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);

    const gameState = useRef({
        player: null as PlayerShip | null,
        formation: null as EnemyFormation | null,
        ufo: null as UFO | null,
        shootingSystem: new EnemyShootingSystem(),
        shieldSystem: new ShieldSystem(),
        waveManager: new WaveManager({ initialWave: 1 }),
        livesManager: new LivesManager({ initialLives: 3 }),
        highScoreManager: new HighScoreManager('space-invaders'),
        input: { left: false, right: false, fire: false },
        isRunning: false,
        lastTime: 0,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameState.current;

        // Init components
        state.player = new PlayerShip(canvas.width);
        state.formation = new EnemyFormation(canvas.width);
        state.formation.init(1);
        state.ufo = new UFO(canvas.width);
        state.shieldSystem.init(4, canvas.width);

        setHighScore(state.highScoreManager.getHighScore());

        // Input handling
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') state.input.left = true;
            if (e.key === 'ArrowRight') state.input.right = true;
            if (e.key === ' ') state.input.fire = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') state.input.left = false;
            if (e.key === 'ArrowRight') state.input.right = false;
            if (e.key === ' ') state.input.fire = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Game Loop
        const loop = (timestamp: number) => {
            if (!state.isRunning) return;

            const dt = (timestamp - state.lastTime) / 1000;
            state.lastTime = timestamp;

            // Clear
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update
            if (state.player) state.player.update(dt, state.input, state.shootingSystem);
            if (state.formation) state.formation.update(dt);
            if (state.ufo) state.ufo.update(dt);

            // Enemy Shooting
            if (state.formation && state.shootingSystem.update(dt, state.formation.getActiveCount(), level)) {
                // Find a random active enemy to shoot
                const activeEnemies = state.formation.enemies.filter(e => e.active);
                if (activeEnemies.length > 0) {
                    const shooter = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                    state.shootingSystem.spawnBullet(shooter.x + shooter.width / 2, shooter.y + shooter.height, false);
                }
            }

            // Collisions
            // Bullets vs Everything
            state.shootingSystem.bullets.forEach(bullet => {
                if (!bullet.active) return;

                if (bullet.isPlayer) {
                    // Player bullet vs Enemies
                    if (state.formation) {
                        const hitEnemy = state.formation.checkCollision(bullet);
                        if (hitEnemy) {
                            bullet.active = false;
                            setScore(prev => {
                                const newScore = prev + (hitEnemy.type + 1) * 10;
                                if (newScore > state.highScoreManager.getHighScore()) {
                                    state.highScoreManager.saveHighScore(newScore);
                                    setHighScore(newScore);
                                }
                                return newScore;
                            });
                        }
                    }

                    // Player bullet vs UFO
                    if (state.ufo && state.ufo.checkCollision(bullet)) {
                        bullet.active = false;
                        setScore(prev => prev + 100);
                    }

                    // Player bullet vs Shields
                    if (state.shieldSystem.checkCollision(bullet)) {
                        bullet.active = false;
                    }

                } else {
                    // Enemy bullet vs Player
                    if (state.player &&
                        bullet.x < state.player.x + state.player.width &&
                        bullet.x + bullet.width > state.player.x &&
                        bullet.y < state.player.y + state.player.height &&
                        bullet.y + bullet.height > state.player.y) {

                        bullet.active = false;
                        if (state.livesManager.loseLife()) {
                            setLives(state.livesManager.lives);
                            state.player.reset();
                            state.shootingSystem.reset(); // Clear bullets on death
                        } else {
                            setGameOver(true);
                            state.isRunning = false;
                        }
                    }

                    // Enemy bullet vs Shields
                    if (state.shieldSystem.checkCollision(bullet)) {
                        bullet.active = false;
                    }
                }
            });

            // Check Invasion (Enemies reached bottom)
            if (state.formation && state.formation.getLowestEnemyY() > 500) {
                setGameOver(true);
                state.isRunning = false;
            }

            // Level Clear
            if (state.formation && state.formation.getActiveCount() === 0) {
                const nextLevel = state.waveManager.nextWave();
                setLevel(nextLevel);
                state.formation.init(nextLevel);
                state.shootingSystem.reset();
                state.shieldSystem.init(4, canvas.width); // Restore shields? Or keep damage? Let's restore.
            }

            // Draw
            if (state.player) state.player.draw(ctx);
            if (state.formation) state.formation.draw(ctx);
            if (state.ufo) state.ufo.draw(ctx);
            state.shootingSystem.draw(ctx);
            state.shieldSystem.draw(ctx);

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
    }, []);

    const handleRestart = () => {
        window.location.reload();
    };

    return (
        <GameContainer>
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
