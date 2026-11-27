import { useState } from 'react';
import TankGame from '@/lib/tank/TankGame';
import { AudioController } from '@/_components/home/AudioController';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { GameControls } from '@/_components/shared/GameControls';

const TOUCH_INSTRUCTIONS = [
  'Joystick: drive and turn your tank',
  'Touch the battlefield to aim',
  'Hold FIRE to shoot',
  'Drive over power-ups to collect them',
];

const INSTRUCTIONS = [
  'WASD / Arrow Keys: Move tank',
  'Mouse: Aim turret',
  'Click or Space: Shoot',
  'Drive over power-ups to collect them',
  'Destroy enemy tanks to score points',
  'Survive as long as possible!',
];

export default function TankBattlePage() {
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleRestart = () => {
    setGameKey((k) => k + 1);
    setPaused(false);
  };

  return (
    <ArcadeLayout fullscreenGame={true}>
      <AudioController inGame />
      {!started && <HowToPlay title="TANK BATTLE" instructions={INSTRUCTIONS} touchInstructions={TOUCH_INSTRUCTIONS} onStart={() => setStarted(true)} />}
      {started && (
        <>
          <GameControls
            onPause={() => setPaused((p) => !p)}
            onRestart={handleRestart}
            paused={paused}
          />
          <TankGame key={gameKey} paused={paused} onPauseToggle={() => setPaused((p) => !p)} />
        </>
      )}
    </ArcadeLayout>
  );
}
