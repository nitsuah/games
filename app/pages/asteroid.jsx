import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { useSound } from '@/utils/audio/useSound';
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { HowToPlay } from '@/_components/shared/HowToPlay';

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

const INSTRUCTIONS = [
  'Click to lock pointer as camera',
  'Mouse: Aim and look around',
  'Click: Shoot at asteroids',
  'Esc: Release pointer / pause',
  'Destroy all asteroids to advance waves',
  'Smaller asteroids are worth more points!',
];

const AsteroidPage = () => {
  const [started, setStarted] = useState(false);

  return (
    <SettingsProvider>
      <AudioProvider>
        <ArcadeLayout fullscreenGame={true}>
          {!started && <HowToPlay title="ASTEROID" instructions={INSTRUCTIONS} onStart={() => setStarted(true)} />}
          {started && <AsteroidContent />}
        </ArcadeLayout>
      </AudioProvider>
    </SettingsProvider>
  );
};

const AsteroidContent = () => {
  const { soundEnabled } = useAudio();
  const { playSound } = useSound();

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
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
