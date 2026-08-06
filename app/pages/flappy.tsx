import React, { useState } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { FlappyGame } from '@/lib/flappy/FlappyGame';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { AudioController } from '@/_components/home/AudioController';

const INSTRUCTIONS = [
  'Press Space or Click to flap',
  'Fly through the gaps in the pipes',
  "Don't hit the pipes or the ground!",
  'Try to beat your high score',
];

const FlappyPage = () => {
  const [started, setStarted] = useState(false);

  return (
    <ArcadeLayout title="FLAPPY BIRD">
      <AudioController />
      {!started && <HowToPlay title="FLAPPY BIRD" instructions={INSTRUCTIONS} onStart={() => setStarted(true)} />}
      {started && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', transform: 'scale(0.85)' }}>
          <FlappyGame />
        </div>
      )}
    </ArcadeLayout>
  );
};

export default FlappyPage;
