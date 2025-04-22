import React, { useState } from 'react';
import Game from './asteroid/components/Game/Game';
import styled from 'styled-components';
import { useSound } from '@/utils/audio/useSound'; // Use the hook instead of importing playSound directly
import Crosshair from './asteroid/components/UI/Crosshair';

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
`;

const AsteroidPage = () => {
  const [hitCount, setHitCount] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const { playSound } = useSound(); // Use the hook to access playSound

  const handleHit = () => {
    setHitCount((prev) => prev + 1);
    playSound('hit');
  };

  const handleMiss = () => {
    setMissCount((prev) => prev + 1);
    playSound('miss');
  };

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
