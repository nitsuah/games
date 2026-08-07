import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(-50%) scaleY(0.8); }
  to   { opacity: 1; transform: translateX(-50%) scaleY(1); }
`;

const Bar = styled.div`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none; /* let clicks pass through the gap */
`;

const PauseBtn = styled.button`
  pointer-events: all;
  margin-top: 0;
  background: rgba(0, 0, 0, 0.82);
  border: 2px solid #00ffff;
  border-top: none;
  border-radius: 0 0 12px 12px;
  color: #00ffff;
  padding: 4px 18px 6px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background 0.15s;

  &:hover {
    background: rgba(0, 255, 255, 0.18);
  }
`;

const Menu = styled.div`
  pointer-events: all;
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #00ffff;
  border-top: none;
  border-radius: 0 0 14px 14px;
  padding: 10px 16px 12px;
  animation: ${fadeIn} 0.15s ease forwards;
  transform-origin: top center;
`;

const MenuBtn = styled.button`
  background: rgba(0, 255, 255, 0.08);
  border: 1.5px solid #00ffff;
  color: #00ffff;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s;

  &:hover {
    background: rgba(0, 255, 255, 0.25);
  }
`;

interface GameControlsProps {
  onPause: () => void;
  onRestart: () => void;
  paused?: boolean;
}

export const GameControls = ({ onPause, onRestart, paused = false }: GameControlsProps) => {
  const router = useRouter();

  return (
    <Bar>
      {!paused && (
        <PauseBtn onClick={onPause} aria-label="Pause Game" title="Pause">
          ⏸
        </PauseBtn>
      )}
      {paused && (
        <Menu>
          <MenuBtn onClick={onPause} aria-label="Resume">▶ Resume</MenuBtn>
          <MenuBtn onClick={onRestart} aria-label="Restart">🔄 Restart</MenuBtn>
          <MenuBtn onClick={() => router.push('/')} aria-label="Home">🏠 Home</MenuBtn>
        </Menu>
      )}
    </Bar>
  );
};
