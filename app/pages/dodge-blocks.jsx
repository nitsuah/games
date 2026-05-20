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
          sandbox="allow-scripts"
          width="400"
          height="650"
          style={{ border: 'none', borderRadius: 12, background: '#23293a', width: 400, height: 650 }}
        />
      </ArcadeLayout>
    </>
  );
};

export default DodgeBlocks;
