import React from 'react';
import { FLASH_COLORS } from '../config';

const FlashOverlays = ({ flashQueue }) => (
  <>
    {flashQueue.map(({ id, type }) => (
      <div
        key={id}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: FLASH_COLORS[type] || 'rgba(255,255,255,0.3)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      />
    ))}
  </>
);

export default FlashOverlays;
