import React from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { FlappyGame } from '@/lib/flappy/FlappyGame';
import styled from 'styled-components';
import { useRouter } from 'next/router';

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

const FlappyPage = () => {
    const router = useRouter();

    return (
        <ArcadeLayout>
            <BackButton onClick={() => router.push('/')}>← BACK TO ARCADE</BackButton>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', transform: 'scale(0.85)' }}>
                <FlappyGame />
            </div>
        </ArcadeLayout>
    );
};

export default FlappyPage;
