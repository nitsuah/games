'use client';

import { useState } from 'react';
import { AudioController } from '@/_components/home/AudioController';
import styled from 'styled-components';
const HowToPlayOverlay = styled.div`
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  color: #fff;
  padding: 24px 32px;
  border-radius: 16px;
  z-index: 10;
  box-shadow: 0 0 24px #000;
  max-width: 90vw;
  font-size: 1.1rem;
  text-align: left;
`;
import dynamic from 'next/dynamic';
import ArcadeHeader from '@/lib/shared/ui/ArcadeHeader';
import ArcadeButton, { VARIANTS } from '@/lib/shared/ui/ArcadeButton';

// Dynamically import the game component to avoid SSR issues
const BreakoutGame = dynamic(() => import('@/lib/breakout/BreakoutGame.tsx').then(mod => ({ default: mod.BreakoutGame })), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#000'
    }}>
      <p style={{ color: '#fff' }}>Loading Breakout...</p>
    </div>
  ),
});

export default function BreakoutPage() {
  const [gameStarted, setGameStarted] = useState(false);

  if (!gameStarted) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 100%)',
        gap: '2rem',
        position: 'relative',
        overflowX: 'hidden',
      }}>
        <AudioController />
        <ArcadeHeader title="BREAKOUT" />
        <div style={{
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '24px 32px',
          borderRadius: 16,
          boxShadow: '0 0 24px #000',
          maxWidth: 420,
          margin: '0 auto',
          fontSize: '1.1rem',
          textAlign: 'left',
        }}>
          <h2 style={{marginTop:0}}>How to Play Breakout</h2>
          <ul style={{margin:'8px 0 16px 20px'}}>
            <li>Arrow Keys: Move paddle left/right</li>
            <li>Space: Launch the ball</li>
            <li>Break all the bricks to win the level</li>
            <li>Catch power-ups for bonuses</li>
            <li>Don't let the ball fall below the paddle!</li>
          </ul>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <ArcadeButton
            onClick={() => setGameStarted(true)}
            variant={VARIANTS.SUCCESS}
            aria-label="START GAME"
            data-testid="start-game-button"
          >
            START GAME
          </ArcadeButton>
          <ArcadeButton
            onClick={() => window.location.href = '/'}
            variant={VARIANTS.SECONDARY}
          >
            BACK TO MENU
          </ArcadeButton>
        </div>
        <div style={{
          color: '#8892b0',
          fontSize: '0.9rem',
          maxWidth: '600px',
          textAlign: 'center',
          padding: '0 2rem',
        }}>
          <p>Break all the bricks with your paddle!</p>
          <p style={{ marginTop: '0.5rem' }}>Arrow Keys: Move paddle | Space: Launch ball</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{position:'relative',width:'100vw',height:'100vh',overflow:'hidden',background:'#000'}}>
      <AudioController />
      <button
        style={{ position:'absolute', top:20, right:20, zIndex:1001, fontSize:'1rem', padding:'2px 10px', borderRadius:8, border:'none', background:'#222', color:'#fff', cursor:'pointer' }}
        onClick={() => setShowHowTo(true)}
      >How to Play</button>
      {showHowTo && (
        <HowToPlayOverlay>
          <h2 style={{marginTop:0}}>How to Play Breakout</h2>
          <ul style={{margin:'8px 0 16px 20px'}}>
            <li>Arrow Keys: Move paddle left/right</li>
            <li>Space: Launch the ball</li>
            <li>Break all the bricks to win the level</li>
            <li>Catch power-ups for bonuses</li>
            <li>Don't let the ball fall below the paddle!</li>
          </ul>
          <button
            style={{fontSize:'1rem',padding:'6px 18px',borderRadius:8,border:'none',background:'#00ffff',color:'#222',cursor:'pointer'}}
            onClick={() => setShowHowTo(false)}
          >Got it!</button>
        </HowToPlayOverlay>
      )}
      <BreakoutGame />
    </div>
  );
}
