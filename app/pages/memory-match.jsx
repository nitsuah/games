import React from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { AudioController } from '@/_components/home/AudioController';

const MemoryMatch = () => {
  return (
    <>
      <AudioController />
      <ArcadeLayout>
        <iframe
          src="/games/memory-match/index.html"
          title="Memory Match"
          sandbox="allow-scripts"
          width="400"
          height="600"
          style={{ border: 'none', borderRadius: 12, background: '#23293a', width: 400, height: 600 }}
        />
      </ArcadeLayout>
    </>
  );
};

export default MemoryMatch;
