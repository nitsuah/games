import React from 'react';

// Map flash types to their overlay color
const FLASH_COLORS = {
  red: 'rgba(255,0,0,0.3)',
  green: 'rgba(0,255,0,0.3)',
  blue: 'rgba(0,0,255,0.3)',
  yellow: 'rgba(255,255,0,0.3)',
  purple: 'rgba(128,0,128,0.3)',
  orange: 'rgba(255,165,0,0.3)',
};

const FlashOverlays = ({ flashes }) => {
  return (
    <>
      {Object.entries(flashes).map(
        ([type, show]) =>
          show && (
            <div
              key={type}
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
          )
      )}
    </>
  );
};

export default FlashOverlays;
