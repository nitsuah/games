import React, { useEffect } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { AudioController } from '@/_components/home/AudioController';

const MemoryMatch = () => {
  useEffect(() => {
    // Dynamically load the vanilla JS game
    const script = document.createElement('script');
    script.src = '/games/memory-match/script.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <AudioController />
      <ArcadeLayout>
        <iframe
          src="/games/memory-match/index.html"
          title="Memory Match"
          width="400"
          height="600"
          style={{ border: 'none', borderRadius: 12, background: '#23293a', width: 400, height: 600 }}
        />
      </ArcadeLayout>
    </>
  );
};

export default MemoryMatch;
