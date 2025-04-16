import React, { useState, useRef } from 'react';
import Game from './components/Game/Game';
import styled from 'styled-components';
import { playSound } from '@/utils/audio/useSound';
import { setThrusterVolume } from '@/utils/audio/useSound';

const Crosshair = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  transform: translate(-50%, -50%);
  z-index: 3;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
`;

const CrosshairVertical = styled.div`
  width: 2px;
  height: 20px;
  background: red;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 1px;
  opacity: 0.8;
`;

const CrosshairHorizontal = styled.div`
  width: 20px;
  height: 2px;
  background: red;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 1px;
  opacity: 0.8;
`;

const StatsPanel = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  color: white;
  background: rgba(0,0,0,0.6);
  padding: 12px 18px;
  border-radius: 8px 0 0 0;
  pointer-events: none;
`;

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
  const wasTargetHit = useRef(false);

  const handleHit = () => {
    wasTargetHit.current = true;
    setHitCount(prev => prev + 1);
    playSound('hit');
  };

  const handleMiss = () => {
    if (!wasTargetHit.current) {
      setMissCount(prev => prev + 1);
      playSound('miss');
    }
    wasTargetHit.current = false;
  };

  const accuracy = hitCount + missCount > 0 
    ? ((hitCount / (hitCount + missCount)) * 100).toFixed(2)
    : '0.00';

  return (
    <GameContainer>
      <Instructions>
        Click to lock pointer as camera, Esc to exit
      </Instructions>
      <Crosshair>
        <CrosshairVertical />
        <CrosshairHorizontal />
      </Crosshair>
      <Game onHit={handleHit} onMiss={handleMiss} />
    </GameContainer>
  );
};

export default AsteroidPage;
