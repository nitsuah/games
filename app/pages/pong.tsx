import React, { useState } from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { PongGame } from '@/lib/pong/PongGame';
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

const PongPage = () => {
  const router = useRouter();
  const [showHowTo, setShowHowTo] = useState(true);

  return (
    <ArcadeLayout fullscreenGame={true} title="PONG">
      <AudioController />
      <BackButton onClick={() => router.push('/')}>← BACK TO ARCADE</BackButton>
      <button
        aria-label="Open how to play instructions"
        style={{ position:'absolute', top:20, right:20, zIndex:1001, fontSize:'0.85rem', padding:'6px 14px', borderRadius:8, border:'2px solid #00ffff', background:'rgba(0,255,255,0.1)', color:'#00ffff', cursor:'pointer', fontFamily:"'Courier New', monospace", letterSpacing:'1px' }}
        onClick={() => setShowHowTo(true)}
      >HOW TO PLAY</button>
      {showHowTo && (
        <HowToPlayOverlay>
          <h2 style={{marginTop:0}}>How to Play Pong</h2>
          <ul style={{margin:'8px 0 16px 20px'}}>
            <li>Arrow Keys or Mouse: Move your paddle</li>
            <li>Deflect the ball to score points</li>
            <li>First to 11 points wins</li>
            <li>Try to beat the AI opponent!</li>
          </ul>
          <button
            aria-label="Close instructions"
            style={{fontSize:'1rem',padding:'6px 18px',borderRadius:8,border:'none',background:'#00ffff',color:'#222',cursor:'pointer'}}
            onClick={() => setShowHowTo(false)}
          >Got it!</button>
        </HowToPlayOverlay>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', transform: 'scale(0.85)' }}>
        <PongGame />
      </div>
    </ArcadeLayout>
  );
};

export default PongPage;
