import React, { useEffect } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { AudioController } from '@/_components/home/AudioController';

const DodgeBlocks = () => {
  useEffect(() => {
    // Dynamically load the vanilla JS game
    const script = document.createElement('script');
    script.src = '/games/dodge-blocks/script.js';
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
          src="/games/dodge-blocks/index.html"
          title="Dodge the Blocks"
          width="400"
          height="650"
          style={{ border: 'none', borderRadius: 12, background: '#23293a', width: 400, height: 650 }}
        />
      </ArcadeLayout>
    </>
  );
};

export default DodgeBlocks;
