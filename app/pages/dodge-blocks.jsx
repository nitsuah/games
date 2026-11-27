import React, { useRef, useState } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { AudioController } from '@/_components/home/AudioController';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { GameControls } from '@/_components/shared/GameControls';

const INSTRUCTIONS = [
  'Left and Right arrow keys: move',
  'Touch: tap a side of the board, or use the arrow buttons',
  'Avoid the falling blocks as long as you can',
];

const DodgeBlocks = () => {
  const frameRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  // The sandboxed frame has an opaque origin, so '*' is the only target that reaches it.
  const send = (message) => frameRef.current?.contentWindow?.postMessage(message, '*');

  // The game waits behind How to Play and the pause menu.
  const setRunning = (running) => send({ type: 'dodge:pause', paused: !running });

  return (
    <>
      <AudioController inGame />
      {!started && (
        <HowToPlay
          title="DODGE THE BLOCKS"
          instructions={INSTRUCTIONS}
          onStart={() => { setStarted(true); send({ type: 'dodge:restart' }); setRunning(true); frameRef.current?.focus(); }}
        />
      )}
      {started && (
        <GameControls
          onPause={() => {
            setRunning(paused);
            setPaused(!paused);
            // Arrow keys only reach the game while its frame has focus.
            if (paused) frameRef.current?.focus();
          }}
          onRestart={() => { send({ type: 'dodge:restart' }); setRunning(true); setPaused(false); frameRef.current?.focus(); }}
          paused={paused}
        />
      )}
      <ArcadeLayout title="DODGE BLOCKS">
        <iframe
          ref={frameRef}
          src="/games/dodge-blocks/index.html"
          title="Dodge the Blocks"
          sandbox="allow-scripts"
          onLoad={() => setRunning(started && !paused)}
          style={{
            border: 'none',
            borderRadius: 12,
            // Clear of the cabinet's marquee hood.
            marginTop: 44,
            background: '#23293a',
            width: '100%',
            height: 'min(75vh, 620px)',
            minHeight: 500,
          }}
        />
      </ArcadeLayout>
    </>
  );
};

export default DodgeBlocks;
