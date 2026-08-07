import React, { useState } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { SpaceInvadersGame } from '@/lib/space-invaders/SpaceInvadersGame';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { AudioController } from '@/_components/home/AudioController';

const INSTRUCTIONS = [
  'Arrow Keys: Move left/right',
  'Space: Shoot',
  'Defend your base from waves of invaders',
  'Hide behind shields for protection',
  'Score points for each enemy destroyed',
  'Survive as long as you can!',
];

const SpaceInvadersPage = () => {
  const [started, setStarted] = useState(false);

  return (
    <ArcadeLayout fullscreenGame={true} title="SPACE INVADERS">
      <AudioController />
      {!started && <HowToPlay title="SPACE INVADERS" instructions={INSTRUCTIONS} onStart={() => setStarted(true)} />}
      {started && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', transform: 'scale(0.85)' }}>
          <SpaceInvadersGame />
        </div>
      )}
    </ArcadeLayout>
  );
};

export default SpaceInvadersPage;
