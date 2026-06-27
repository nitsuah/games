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
          sandbox="allow-scripts allow-same-origin"
          style={{
            border: 'none',
            borderRadius: 12,
            background: '#23293a',
            width: '100%',
            height: '100%',
            maxWidth: '400px',
            maxHeight: '600px'
          }}
        />
      </ArcadeLayout>
    </>
  );
};

export default MemoryMatch;
