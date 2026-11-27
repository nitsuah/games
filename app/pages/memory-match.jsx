import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { AudioController } from '@/_components/home/AudioController';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { GameControls } from '@/_components/shared/GameControls';
import { loadBest, saveBest } from '@/utils/memoryBestBridge';

const INSTRUCTIONS = [
  'Click or tap two cards to flip them',
  'Matching cards stay face up',
  'Match all pairs in as few moves as you can',
];

const MemoryMatch = () => {
  const frameRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const send = useCallback((message) => {
    // The sandboxed frame has an opaque origin, so '*' is the only target that reaches it.
    frameRef.current?.contentWindow?.postMessage(message, '*');
  }, []);

  // The frame cannot use localStorage, so the page keeps the best score for it.
  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === 'memory:ready') send({ type: 'memory:best-load', value: loadBest() });
      if (event.data?.type === 'memory:best-save') saveBest(event.data.value);
    };
    window.addEventListener('message', onMessage);
    send({ type: 'memory:best-load', value: loadBest() });
    return () => window.removeEventListener('message', onMessage);
  }, [send, gameKey]);

  return (
    <>
      <AudioController />
      {!started && <HowToPlay title="MEMORY MATCH" instructions={INSTRUCTIONS} onStart={() => setStarted(true)} />}
      {started && (
        <GameControls
          onPause={() => { send({ type: 'memory:pause', paused: !paused }); setPaused(!paused); }}
          onRestart={() => { setPaused(false); setGameKey((k) => k + 1); }}
          paused={paused}
        />
      )}
      <ArcadeLayout title="MEMORY MATCH">
        <iframe
          key={gameKey}
          ref={frameRef}
          src="/games/memory-match/index.html"
          title="Memory Match"
          sandbox="allow-scripts"
          inert={paused}
          onLoad={() => send({ type: 'memory:best-load', value: loadBest() })}
          style={{
            border: 'none',
            borderRadius: 12,
            background: '#23293a',
            width: '100%',
            height: 520,
            opacity: paused ? 0.35 : 1,
          }}
        />
      </ArcadeLayout>
    </>
  );
};

export default MemoryMatch;
