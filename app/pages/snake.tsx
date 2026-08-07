import React, { useState } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { SnakeGame } from '@/lib/snake/SnakeGame';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { AudioController } from '@/_components/home/AudioController';

const INSTRUCTIONS = [
  'Arrow Keys or WASD: Move the snake',
  'Eat food to grow longer',
  'Avoid running into walls or yourself',
  'Try to beat your high score!',
];

const SnakePage = () => {
  const [started, setStarted] = useState(false);

  return (
    <ArcadeLayout title="SNAKE">
      <AudioController />
      {!started && <HowToPlay title="SNAKE" instructions={INSTRUCTIONS} onStart={() => setStarted(true)} />}
      {started && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
          <SnakeGame />
        </div>
      )}
    </ArcadeLayout>
  );
};

export default SnakePage;
