import React from 'react';

const FlashOverlays = ({
  showRedFlash,
  showGreenFlash,
  showBlueFlash,
  showYellowFlash,
  showPurpleFlash,
  showOrangeFlash,
}) => {
  return (
    <>
      {showRedFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,0,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {showGreenFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,255,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {showBlueFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,255,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {showYellowFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {showPurpleFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(128,0,128,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
      {showOrangeFlash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,165,0,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
};

export default FlashOverlays;
