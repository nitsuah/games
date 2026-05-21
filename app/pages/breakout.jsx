'use client';

import { useState } from 'react';
import { AudioController } from '@/_components/home/AudioController';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import ArcadeButton, { VARIANTS } from '@/lib/shared/ui/ArcadeButton';
import dynamic from 'next/dynamic';

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

  return (
    <>
      <AudioController />
      <ArcadeLayout>
        {!gameStarted ? (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            position: 'relative',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              width: '100%'
            }}>
              <ArcadeButton
                onClick={() => setGameStarted(true)}
                variant={VARIANTS.SUCCESS}
                aria-label="START GAME"
                data-testid="start-game-button"
                style={{margin: '0 auto'}}>
                START GAME
              </ArcadeButton>
              <ArcadeButton
                onClick={() => window.location.href = '/'}
                variant={VARIANTS.SECONDARY}
                style={{margin: '0 auto'}}>
                BACK TO MENU
              </ArcadeButton>
              <div style={{
                background: 'rgba(0,0,0,0.85)',
                color: '#fff',
                padding: '18px 28px',
                borderRadius: 12,
                boxShadow: '0 0 18px #000',
                maxWidth: 420,
                margin: '0 auto',
                fontSize: '1.1rem',
                textAlign: 'left',
                marginTop: '1.5rem',
              }}>
                <ul style={{margin:'0 0 0 20px'}}>
                  <li>Arrow Keys: Move paddle left/right</li>
                  <li>Space: Launch the ball</li>
                  <li>Break all the bricks to win the level</li>
                  <li>Catch power-ups for bonuses</li>
                  <li>Don't let the ball fall below the paddle!</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
            <BreakoutGame />
          </div>
        )}
      </ArcadeLayout>
    </>
  );
}
