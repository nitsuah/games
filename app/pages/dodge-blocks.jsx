import React from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { AudioController } from '@/_components/home/AudioController';

const DodgeBlocks = () => {
  return (
    <>
      <AudioController />
      <ArcadeLayout>
        <iframe
          src="/games/dodge-blocks/index.html"
          title="Dodge the Blocks"
          sandbox="allow-scripts allow-same-origin"
          style={{
            border: 'none',
            borderRadius: 12,
            background: '#23293a',
            width: '100%',
            height: '100%',
            maxWidth: '400px',
            maxHeight: '650px'
          }}
        />
      </ArcadeLayout>
    </>
  );
};

export default DodgeBlocks;
