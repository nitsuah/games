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
