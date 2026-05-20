import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { useSound } from '@/utils/audio/useSound';
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

// Load Game and Crosshair client-side only to avoid server-side R3F/runtime imports
const Game = dynamic(() => import('@/lib/asteroid/_comp/Game/Game'), { ssr: false });
const Crosshair = dynamic(() => import('@/lib/asteroid/_comp/UI/Crosshair'), { ssr: false });


const Instructions = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  text-align: center;
  color: white;
  z-index: 2;
  pointer-events: none;
  font-weight: bold;
  text-shadow: 0 0 8px #000;
`;

const GameContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000000;
  margin: 0;
  padding: 0;
`;

const AsteroidPage = () => {
  return (
    <SettingsProvider>
      <AudioProvider>
        <AsteroidContent />
      </AudioProvider>
    </SettingsProvider>
  );
};

const AsteroidContent = () => {
  const { soundEnabled } = useAudio();
  const { playSound } = useSound();

  // Sync SoundManager with audio settings
  useEffect(() => {
    import('@/utils/audio/SoundManager').then((module) => {
      module.default.setSoundEnabled(soundEnabled);
    });
  }, [soundEnabled]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleHit = () => playSound('hit');
  const handleMiss = () => playSound('miss');

  return (
    <GameContainer>
      <Instructions>
        Click to lock pointer as camera, Esc to exit
      </Instructions>
      <Crosshair />
      <Game onHit={handleHit} onMiss={handleMiss} />
    </GameContainer>
  );
};

export default AsteroidPage;
