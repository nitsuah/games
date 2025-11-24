import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Bird } from './components/Bird';
import { PipeManager } from './components/PipeManager';
import { Background } from './components/Background';
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
}
            }

// Ground (draw last to cover pipes)
ctx.fillStyle = '#e0ac69'; // Sand color
ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
ctx.fillStyle = '#75b85b'; // Grass top
ctx.fillRect(0, canvas.height - 20, canvas.width, 4);

requestRef.current = requestAnimationFrame(loop);
        };

state.lastTime = performance.now();
requestRef.current = requestAnimationFrame(loop);

return () => {
    window.removeEventListener('keydown', handleInput);
    window.removeEventListener('mousedown', handleInput);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
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
