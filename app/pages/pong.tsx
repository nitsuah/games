import React, { useState } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { PongGame } from '@/lib/pong/PongGame';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { GameControls } from '@/_components/shared/GameControls';
import { AudioController } from '@/_components/home/AudioController';

const TOUCH_INSTRUCTIONS = [
  'Drag up and down on the board to move your paddle',
  'Deflect the ball to score points',
  'First to 5 points wins',
];

const INSTRUCTIONS = [
  'Arrow Keys or Mouse: Move your paddle',
  'Deflect the ball to score points',
  'First to 5 points wins',
  'Try to beat the AI opponent!',
];

const PongPage = () => {
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setPaused(false);
  };

  return (
    <ArcadeLayout fullscreenGame={true} title="PONG">
      <AudioController inGame />
      {!started && <HowToPlay title="PONG" instructions={INSTRUCTIONS} touchInstructions={TOUCH_INSTRUCTIONS} onStart={() => setStarted(true)} />}
      {started && (
        <>
          <GameControls
            onPause={() => setPaused((p) => !p)}
            onRestart={handleRestart}
            paused={paused}
          />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', transform: 'scale(0.85)' }}>
            <PongGame key={gameKey} paused={paused} />
          </div>
        </>
      )}
    </ArcadeLayout>
  );
};

export default PongPage;
