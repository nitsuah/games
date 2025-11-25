'use client';

import { useState } from 'react';
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
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 100%)',
        gap: '2rem',
      }}>
        <ArcadeHeader title="BREAKOUT" />
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

  return <BreakoutGame />;
}
