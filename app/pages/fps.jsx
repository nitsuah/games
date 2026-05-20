// fps.jsx
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AudioController } from '@/_components/home/AudioController';
import styled from 'styled-components';

const FpsCanvas = dynamic(() => import('@/lib/fps/FpsCanvas'), { ssr: false });

const HowToPlayOverlay = styled.div`
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  color: #fff;
  padding: 24px 32px;
  border-radius: 16px;
  z-index: 10;
  box-shadow: 0 0 24px #000;
  max-width: 90vw;
  font-size: 1.1rem;
  text-align: left;
`;

export default function Range() {
  const [showHowTo, setShowHowTo] = useState(true);
  return (
    <div style={{position:'relative',width:'100vw',height:'100vh',overflow:'hidden',background:'#000'}}>
      <AudioController />
      <button
        style={{ position:'absolute', top:20, right:20, zIndex:1001, fontSize:'1rem', padding:'2px 10px', borderRadius:8, border:'none', background:'#222', color:'#fff', cursor:'pointer' }}
        onClick={() => setShowHowTo(true)}
      >How to Play</button>
      {showHowTo && (
        <HowToPlayOverlay>
          <h2 style={{marginTop:0}}>How to Play FPS Tank Commander</h2>
          <ul style={{margin:'8px 0 16px 20px'}}>
            <li>W/A/S/D: Move your tank</li>
            <li>Mouse: Aim turret and look around</li>
            <li>Left Click: Fire cannon</li>
            <li>Shift: Speed boost</li>
            <li>Collect power-ups for upgrades</li>
            <li>Destroy targets and survive as long as possible!</li>
          </ul>
          <button
            style={{fontSize:'1rem',padding:'6px 18px',borderRadius:8,border:'none',background:'#00ffff',color:'#222',cursor:'pointer'}}
            onClick={() => setShowHowTo(false)}
          >Got it!</button>
        </HowToPlayOverlay>
      )}
      <FpsCanvas />
    </div>
  );
}
