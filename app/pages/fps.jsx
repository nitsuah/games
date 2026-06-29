// fps.jsx
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { AudioController } from '@/_components/home/AudioController';
import styled from 'styled-components';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout'; // Import ArcadeLayout
import { OrientationLock } from '@/_components/shared/OrientationLock';

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

const NeonButton = styled.button`
  position: absolute;
  z-index: 1001;
  font-size: 0.85rem;
  padding: 6px 14px;
  border: 2px solid #00ffff;
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  border-radius: 8px; /* Added missing border-radius */

  &:hover {
    background: rgba(0, 255, 255, 0.25);
  }
`;

export default function Range() {
  const router = useRouter();
  const [showHowTo, setShowHowTo] = useState(true);
  return (
    <ArcadeLayout fullscreenGame={true}> {/* Wrap with ArcadeLayout */}
      <OrientationLock />
      <div style={{position:'relative',width:'100vw',height:'100vh',overflow:'hidden',background:'#000'}}>
        <AudioController />
        <NeonButton style={{ top: 20, left: 20 }} onClick={() => router.push('/')}>← BACK TO ARCADE</NeonButton>
        <NeonButton style={{ top: 20, right: 20 }} onClick={() => setShowHowTo(true)}>HOW TO PLAY</NeonButton>
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
    </ArcadeLayout>
  );
}
