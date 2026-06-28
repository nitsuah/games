import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

const ControlsWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1000;
`;

const IconButton = styled.button`
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 255, 255, 0.3);
  }
`;

interface GameControlsProps {
  onPause: () => void;
  onRestart: () => void;
}

export const GameControls = ({ onPause, onRestart }: GameControlsProps) => {
  const router = useRouter();

  return (
    <ControlsWrapper>
      <IconButton onClick={onPause} aria-label="Pause Game">⏸️</IconButton>
      <IconButton onClick={onRestart} aria-label="Restart Game">🔄</IconButton>
      <IconButton onClick={() => window.location.reload()} aria-label="Reload Game">🔁</IconButton>
      <IconButton onClick={() => router.push('/')} aria-label="Back to Arcade">🏠</IconButton>
    </ControlsWrapper>
  );
};
