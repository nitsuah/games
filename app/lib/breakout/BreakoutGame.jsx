'use client';

import { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Paddle from './components/Paddle';
import Ball from './components/Ball';
import Brick from './components/Brick';
import soundManager from '@/utils/audio/SoundManager';

// Game constants
const GAME_WIDTH = 40;
const GAME_HEIGHT = 30;
const PADDLE_START_Y = -12;
const BALL_START_Y = PADDLE_START_Y + 2;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 3.5;
const BRICK_HEIGHT = 1.5;
const BRICK_SPACING = 0.3;

// Brick colors by row
const BRICK_COLORS = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff'];

export default function BreakoutGame({ onExit }) {
  // Game state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [paused] = useState(false);
  const [bricks, setBricks] = useState([]);
  
  // Paddle state
  const [paddleX, setPaddleX] = useState(0);
  const paddleWidth = 6;
  
  // Ball state
  const [ballPos, setBallPos] = useState({ x: 0, y: BALL_START_Y });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [ballLaunched, setBallLaunched] = useState(false);

  // Initialize bricks
  useEffect(() => {
    const newBricks = [];
    const startX = -(BRICK_COLS * (BRICK_WIDTH + BRICK_SPACING)) / 2;
    const startY = GAME_HEIGHT / 2 - 5;
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          id: `brick-${row}-${col}`,
          x: startX + col * (BRICK_WIDTH + BRICK_SPACING) + BRICK_WIDTH / 2,
          y: startY - row * (BRICK_HEIGHT + BRICK_SPACING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: BRICK_COLORS[row],
          hits: row + 1, // More hits for lower rows
          maxHits: row + 1,
        });
      }
    }
    setBricks(newBricks);
  }, []);

  // Mouse tracking for paddle
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (paused || gameOver) return;
      
      // Convert mouse position to game coordinates
      const x = ((event.clientX / window.innerWidth) * 2 - 1) * (GAME_WIDTH / 2);
      const clampedX = Math.max(
        -(GAME_WIDTH / 2) + paddleWidth / 2,
        Math.min((GAME_WIDTH / 2) - paddleWidth / 2, x)
      );
      setPaddleX(clampedX);
      
      // Move ball with paddle if not launched
      if (!ballLaunched) {
        setBallPos({ x: clampedX, y: BALL_START_Y });
      }
    };
    
    const handleClick = () => {
      if (!ballLaunched && !paused && !gameOver) {
        setBallLaunched(true);
        setBallVel({ x: (Math.random() - 0.5) * 0.3, y: 0.5 });
        soundManager.playPowerUpCollect();
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [ballLaunched, paused, gameOver, paddleWidth]);

  // Game loop
  useFrame((state, delta) => {
    if (paused || gameOver || !ballLaunched) return;
    
    // Update ball position
    const newX = ballPos.x + ballVel.x * delta * 60;
    const newY = ballPos.y + ballVel.y * delta * 60;
    let newVelX = ballVel.x;
    let newVelY = ballVel.y;
    
    // Wall collisions
    if (newX - 0.5 < -GAME_WIDTH / 2 || newX + 0.5 > GAME_WIDTH / 2) {
      newVelX = -newVelX;
      soundManager.playHitImpact(0.5, 1.5);
    }
    
    // Ceiling collision
    if (newY + 0.5 > GAME_HEIGHT / 2) {
      newVelY = -newVelY;
      soundManager.playHitImpact(0.5, 1.5);
    }
    
    // Paddle collision
    if (
      newY - 0.5 < PADDLE_START_Y + 0.5 &&
      newY + 0.5 > PADDLE_START_Y - 0.5 &&
      newX > paddleX - paddleWidth / 2 &&
      newX < paddleX + paddleWidth / 2
    ) {
      newVelY = Math.abs(newVelY);
      // Add horizontal velocity based on hit position
      const hitPos = (newX - paddleX) / (paddleWidth / 2);
      newVelX = hitPos * 0.4;
      soundManager.playHitImpact(0.8, 1.2);
    }
    
    // Bottom boundary (lose life)
    if (newY < -GAME_HEIGHT / 2) {
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
        }
        return newLives;
      });
      setBallLaunched(false);
      setBallPos({ x: paddleX, y: BALL_START_Y });
      setBallVel({ x: 0, y: 0 });
      soundManager.playExplosion(0.5);
      return;
    }
    
    // Brick collisions
    setBricks((prevBricks) => {
      const remaining = [];
      let hitBrick = false;
      
      for (const brick of prevBricks) {
        // Simple AABB collision
        if (
          newX + 0.5 > brick.x - brick.width / 2 &&
          newX - 0.5 < brick.x + brick.width / 2 &&
          newY + 0.5 > brick.y - brick.height / 2 &&
          newY - 0.5 < brick.y + brick.height / 2
        ) {
          hitBrick = true;
          const newHits = brick.hits - 1;
          
          if (newHits > 0) {
            remaining.push({ ...brick, hits: newHits });
          } else {
            // Brick destroyed - add score
            setScore((s) => s + (brick.maxHits * 10));
            soundManager.playExplosion(0.3);
          }
          
          // Bounce ball
          const fromTop = Math.abs((ballPos.y + 0.5) - (brick.y + brick.height / 2));
          const fromBottom = Math.abs((ballPos.y - 0.5) - (brick.y - brick.height / 2));
          const fromLeft = Math.abs((ballPos.x + 0.5) - (brick.x + brick.width / 2));
          const fromRight = Math.abs((ballPos.x - 0.5) - (brick.x - brick.width / 2));
          
          const minDist = Math.min(fromTop, fromBottom, fromLeft, fromRight);
          if (minDist === fromTop || minDist === fromBottom) {
            newVelY = -newVelY;
          } else {
            newVelX = -newVelX;
          }
        } else {
          remaining.push(brick);
        }
      }
      
      if (hitBrick) {
        soundManager.playHitImpact(0.7, 1.0);
      }
      
      return remaining;
    });
    
    setBallPos({ x: newX, y: newY });
    setBallVel({ x: newVelX, y: newVelY });
  });

  // Check win condition
  useEffect(() => {
    if (bricks.length === 0 && !gameOver) {
      setGameOver(true);
      soundManager.playPowerUpActivate('default');
    }
  }, [bricks, gameOver]);

  return (
    <>
      {/* Game boundaries (debug) */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[GAME_WIDTH, GAME_HEIGHT]} />
        <meshBasicMaterial color="#0a0520" transparent opacity={0.3} />
      </mesh>
      
      {/* Paddle */}
      <Paddle x={paddleX} y={PADDLE_START_Y} width={paddleWidth} />
      
      {/* Ball */}
      <Ball x={ballPos.x} y={ballPos.y} />
      
      {/* Bricks */}
      {bricks.map((brick) => (
        <Brick key={brick.id} {...brick} />
      ))}
      
      {/* UI */}
      <group position={[-GAME_WIDTH / 2 + 5, GAME_HEIGHT / 2 - 2, 0]}>
        {/* Score and lives text would go here - for now using HTML overlay */}
      </group>
      
      {/* HTML Overlay for UI */}
      <Html>
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          textShadow: '0 0 10px #00ffff',
        }}>
          <div>SCORE: {score}</div>
          <div>LIVES: {lives}</div>
        </div>
        
        {gameOver && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '2rem',
            textAlign: 'center',
            background: 'rgba(0,0,0,0.8)',
            padding: '2rem',
            borderRadius: '10px',
            border: '2px solid #00ffff',
          }}>
            <div>{bricks.length === 0 ? 'YOU WIN!' : 'GAME OVER'}</div>
            <div style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
              Final Score: {score}
            </div>
            <button
              onClick={onExit}
              style={{
                marginTop: '2rem',
                padding: '0.5rem 2rem',
                fontSize: '1rem',
                background: '#00ffff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              EXIT
            </button>
          </div>
        )}
      </Html>
    </>
  );
}
