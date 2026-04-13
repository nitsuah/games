import React from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { SnakeGame } from '@/lib/snake/SnakeGame';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { AudioController } from '@/_components/home/AudioController';
const HowToPlayOverlay = styled.div`
  position: absolute;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  color: #fff;
  padding: 24px 32px;
  border-radius: 16px;
  z-index: 1001;
  box-shadow: 0 0 24px #000;
  max-width: 90vw;
  font-size: 1.1rem;
  text-align: left;
`;

const BackButton = styled.button`
  position: absolute;
  top: 80px;
  left: 20px;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  z-index: 100;
  
  &:hover {
    background: rgba(0, 255, 255, 0.3);
  }
`;

import { useState } from 'react';

const SnakePage = () => {
  const router = useRouter();
  const [showHowTo, setShowHowTo] = useState(true);

  return (
    <ArcadeLayout>
      <AudioController />
      <BackButton onClick={() => router.push('/')}>← BACK TO ARCADE</BackButton>
      <button
        style={{ position:'absolute', top:20, right:20, zIndex:1001, fontSize:'1rem', padding:'2px 10px', borderRadius:8, border:'none', background:'#222', color:'#fff', cursor:'pointer' }}
        onClick={() => setShowHowTo(true)}
      >How to Play</button>
      {showHowTo && (
        <HowToPlayOverlay>
          <h2 style={{marginTop:0}}>How to Play Snake</h2>
          <ul style={{margin:'8px 0 16px 20px'}}>
            <li>Arrow Keys: Move the snake</li>
            <li>Eat food to grow longer</li>
            <li>Avoid running into walls or yourself</li>
            <li>Try to beat your high score!</li>
          </ul>
          <button
            style={{fontSize:'1rem',padding:'6px 18px',borderRadius:8,border:'none',background:'#00ffff',color:'#222',cursor:'pointer'}}
            onClick={() => setShowHowTo(false)}
          >Got it!</button>
        </HowToPlayOverlay>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <SnakeGame />
      </div>
    </ArcadeLayout>
  );
};

export default SnakePage;
