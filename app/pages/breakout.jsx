'use client';

import { useState } from 'react';
import { AudioController } from '@/_components/home/AudioController';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import dynamic from 'next/dynamic';

const BreakoutGame = dynamic(() => import('@/lib/breakout/BreakoutGame.tsx').then(mod => ({ default: mod.BreakoutGame })), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <p style={{ color: '#00ffff', fontFamily: 'Courier New', letterSpacing: 2 }}>LOADING...</p>
    </div>
  ),
});

const INSTRUCTIONS = [
  'Arrow Keys: Move paddle left/right',
  'Space: Launch the ball',
  'Break all the bricks to win the level',
  'Catch power-ups for bonuses',
  "Don't let the ball fall below the paddle!",
];

export default function BreakoutPage() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <AudioController />
      {!started && <HowToPlay title="BREAKOUT" instructions={INSTRUCTIONS} onStart={() => setStarted(true)} />}
      <ArcadeLayout fullscreenGame={true} title="BREAKOUT">
        {started && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
            <BreakoutGame />
          </div>
        )}
      </ArcadeLayout>
    </>
  );
}
