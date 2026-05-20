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
import { SimpleSoundSystem } from '@/lib/shared/audio/SimpleSoundSystem';

const GameContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 700px;
  aspect-ratio: 4/3;
  background: #000;
  border: 4px solid #333;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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
    shootingSystem: null as EnemyShootingSystem | null,
    shieldSystem: null as ShieldSystem | null,
    waveManager: new WaveManager({ initialWave: 1 }),
    livesManager: new LivesManager({ initialLives: 3 }),
    highScoreManager: new HighScoreManager('space-invaders'),
    soundSystem: new SimpleSoundSystem(),
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

    // Initialize game objects
    state.player = new PlayerShip(canvas.width);
    state.formation = new EnemyFormation(canvas.width);
    state.formation.init(1);
    state.ufo = new UFO(canvas.width);
    state.shootingSystem = new EnemyShootingSystem();
    state.shieldSystem = new ShieldSystem();
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

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & Draw Player
      if (state.player && state.shootingSystem) {
        state.player.update(dt, state.input, state.shootingSystem);
        state.player.draw(ctx);
      }

      // Update & Draw Enemy Formation
      if (state.formation && state.shootingSystem) {
        state.formation.update(dt);
        state.formation.draw(ctx);

        // Check if formation reached player
        if (state.formation.getLowestEnemyY() > canvas.height - 100) {
          state.soundSystem.gameOver();
          setGameOver(true);
          state.isRunning = false;
        }
      }

      // Update & Draw UFO
      if (state.ufo) {
        state.ufo.update(dt);
        state.ufo.draw(ctx);
      }

      // Update & Draw Shooting System
      if (state.shootingSystem && state.formation) {
        const shouldFire = state.shootingSystem.update(dt, state.formation.getActiveCount(), level);

        // Enemy shooting
        if (shouldFire && state.formation.getActiveCount() > 0) {
          const activeEnemies = state.formation.enemies.filter(e => e.active);
          const randomEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
          if (randomEnemy) {
            state.shootingSystem.spawnBullet(randomEnemy.x + randomEnemy.width / 2, randomEnemy.y + randomEnemy.height, false);
          }
        }

        // Check bullet collisions with enemies
        const playerBullets = state.shootingSystem.bullets.filter(b => b.isPlayer && b.active);
        for (const bullet of playerBullets) {
          const hitEnemy = state.formation.checkCollision(bullet);
          if (hitEnemy) {
            bullet.active = false;
            state.soundSystem.destroy();
            const points = hitEnemy.type === 0 ? 10 : hitEnemy.type === 1 ? 20 : 30;
            setScore(prev => {
              const newScore = prev + points;
              if (newScore > state.highScoreManager.getHighScore()) {
                state.highScoreManager.saveHighScore(newScore);
                setHighScore(newScore);
              }
              return newScore;
            });
          }
        }

        // Check bullet collisions with UFO
        if (state.ufo && state.ufo.active) {
          for (const bullet of playerBullets) {
            if (bullet.x > state.ufo.x && bullet.x < state.ufo.x + state.ufo.width &&
              bullet.y > state.ufo.y && bullet.y < state.ufo.y + state.ufo.height) {
              bullet.active = false;
              state.ufo.active = false;
              state.soundSystem.powerUp();
              setScore(prev => {
                const newScore = prev + 100;
                if (newScore > state.highScoreManager.getHighScore()) {
                  state.highScoreManager.saveHighScore(newScore);
                  setHighScore(newScore);
                }
                return newScore;
              });
            }
          }
        }

        // Check bullet collisions with player
        if (state.player) {
          const enemyBullets = state.shootingSystem.bullets.filter(b => !b.isPlayer && b.active);
          for (const bullet of enemyBullets) {
            if (bullet.x > state.player.x && bullet.x < state.player.x + state.player.width &&
              bullet.y > state.player.y && bullet.y < state.player.y + state.player.height) {
              bullet.active = false;
              if (state.livesManager.loseLife()) {
                setLives(state.livesManager.lives);
                state.player.reset();
                state.soundSystem.hit();
              } else {
                state.soundSystem.gameOver();
                setGameOver(true);
                state.isRunning = false;
              }
            }
          }
        }

        // Check bullet collisions with shields
        if (state.shieldSystem) {
          for (const bullet of state.shootingSystem.bullets) {
            if (bullet.active && state.shieldSystem.checkCollision(bullet)) {
              bullet.active = false;
            }
          }
        }

        state.shootingSystem.draw(ctx);
      }

      // Draw Shields
      if (state.shieldSystem) {
        state.shieldSystem.draw(ctx);
      }

      // Check for level clear
      if (state.formation && state.formation.getActiveCount() === 0) {
        const nextLevel = state.waveManager.nextWave();
        setLevel(nextLevel);
        state.formation.init(nextLevel);
        state.shootingSystem?.reset();
        state.shieldSystem?.init(4, canvas.width);
      }

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
    // and all state functions (setScore, setLives, etc.) are stable from React
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
