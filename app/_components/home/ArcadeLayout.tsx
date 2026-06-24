import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

const flicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
`;

const scanlineAnim = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

const neonFlicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow: 
      0 0 4px #fff,
      0 0 11px #fff,
      0 0 19px #fff,
      0 0 40px #ffff00,
      0 0 80px #ffff00,
      0 0 90px #ffff00,
      0 0 100px #ffff00,
      0 0 150px #ffff00;
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  max-width: 100vw;
  background: linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0a0015 100%);
  color: white;
  font-family: 'Courier New', monospace;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  box-sizing: border-box;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15) 0px,
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const ArcadeFrame = styled.div`
  background: linear-gradient(135deg, rgba(20, 0, 40, 0.95), rgba(10, 0, 30, 0.95));
  padding: 60px 50px 110px;
  border-radius: 20px;
  border: 4px solid #00ffff;
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.6),
    inset 0 0 60px rgba(0, 255, 255, 0.1);
  position: relative;
  z-index: 5;
  animation: ${slideIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  width: 700px;
  max-width: 95vw;
  box-sizing: border-box;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 95vw;
    padding: 55px 35px 100px;
    min-height: 650px;
  }
`;

const Scanline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: ${scanlineAnim} 4s linear infinite;
  pointer-events: none;
  opacity: 0.5;
  will-change: transform;
`;

const Header = styled.div`
  position: relative;
  margin-bottom: 35px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 42px;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 
    0 0 20px #00ffff,
    0 0 40px #00ffff,
    0 4px 0 rgba(0, 0, 0, 0.8);
  margin: 0 0 8px 0;
  letter-spacing: 8px;
  font-family: 'Courier New', monospace;
  animation: ${flicker} 3s infinite alternate;
  text-transform: uppercase;
  will-change: opacity;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 36px;
    gap: 8px;
    letter-spacing: 6px;
  }
`;

const Subtitle = styled.h3`
  font-size: 16px;
  color: #888;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-top: 8px;
  font-weight: normal;
`;

const InsertCoinText = styled.div`
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  color: #00ffff;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  text-shadow: 
    0 0 15px #00ffff,
    0 0 30px #00ffff,
    0 0 45px #00ffff;
  animation: ${blink} 1s step-start infinite;
  will-change: opacity;
  z-index: 20;
  white-space: nowrap;
  pointer-events: none;
  
  @media (max-width: 768px) {
    font-size: 14px;
    letter-spacing: 1px;
    bottom: 20px;
  }
`;

const ArcadeCabinet = styled.div`
  position: relative;
  max-width: 95vw;
  padding-bottom: 90px;
  padding-top: 80px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: min(700px, 95vw);
    height: 120px;
    background: linear-gradient(135deg, #ff1493 0%, #ff69b4 50%, #ff1493 100%);
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    border: 6px solid #ff69b4;
    border-bottom: none;
    box-shadow: 
      0 -5px 40px rgba(255, 20, 147, 0.9),
      inset 0 15px 40px rgba(255, 105, 180, 0.4);
    z-index: 10;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: min(700px, 95vw);
    height: 140px;
    background: linear-gradient(180deg, #ff8c00 0%, #ffa500 50%, #ff8c00 100%);
    border: 6px solid #ffaa00;
    border-radius: 0 0 30px 30px;
    box-shadow: 
      0 15px 50px rgba(255, 140, 0, 0.8),
      inset 0 -25px 50px rgba(255, 165, 0, 0.4);
    z-index: 10;
  }
`;

const ButtonDecoration = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  
  @media (max-width: 768px) {
    gap: 15px;
    
    span:first-child {
      display: none;
    }
  }

  span {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ff0000, #aa0000);
    border: 4px solid #660000;
    box-shadow: 
      0 6px 18px rgba(0, 0, 0, 0.6),
      inset 0 -4px 10px rgba(0, 0, 0, 0.5),
      inset 0 4px 10px rgba(255, 255, 255, 0.4);
    animation: ${pulse} 3s ease-in-out infinite;
    will-change: opacity;
  }

  span:nth-child(1) {
    animation-delay: 0s;
  }

  span:nth-child(2) {
    background: radial-gradient(circle at 30% 30%, #00ff00, #00aa00);
    border-color: #006600;
    animation-delay: 0.5s;
  }

  span:nth-child(3) {
    background: radial-gradient(circle at 30% 30%, #0000ff, #0000aa);
    border-color: #000066;
    animation-delay: 1s;
  }

  span:nth-child(4) {
    background: radial-gradient(circle at 30% 30%, #ffff00, #aaaa00);
    border-color: #666600;
    animation-delay: 1.5s;
  }
`;

const Joystick = styled.div`
  position: absolute;
  bottom: 60px;
  left: 60px;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at 30% 30%, #333, #000);
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8);
  z-index: 15;
  
  @media (max-width: 768px) {
    left: 30px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 45px;
    background: linear-gradient(180deg, #ff0000 0%, #aa0000 100%);
    border-radius: 20px 20px 5px 5px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
  }

  &::after {
    content: '';
    position: absolute;
    top: -55px;
    left: 50%;
    transform: translateX(-50%);
    width: 25px;
    height: 25px;
    background: radial-gradient(circle at 30% 30%, #ff0000, #cc0000);
    border-radius: 50%;
    box-shadow: 
      0 3px 10px rgba(0, 0, 0, 0.8),
      inset 0 -2px 5px rgba(0, 0, 0, 0.5);
  }
`;

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  z-index: 15;
  width: 700px;
  max-width: 95vw;
  padding: 0 20px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    gap: 15px;
    padding: 0 30px;
    justify-content: center;
    width: 95vw;
  }
`;

const CoinSlot = styled.div`
  width: 70px;
  height: 12px;
  background: #000;
  border: 3px solid #444;
  border-radius: 6px;
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.9);
  position: absolute;
  bottom: 60px;
  right: 60px;
  z-index: 15;
  
  @media (max-width: 768px) {
    right: 30px;
    bottom: 60px;
  }

  &::after {
    content: '25¢';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: bold;
    font-family: 'Courier New', monospace;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
  }
`;

const MarqueeText = styled.h1`
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffff00;
  font-size: 58px;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  text-shadow: 
    0 0 4px #fff,
    0 0 11px #fff,
    0 0 19px #fff,
    0 0 40px #ffff00,
    0 0 80px #ffff00,
    0 0 90px #ffff00,
    0 0 100px #ffff00,
    0 0 150px #ffff00;
  letter-spacing: 16px;
  z-index: 15;
  animation: ${neonFlicker} 5s linear infinite;
  will-change: text-shadow;
  margin: 0;
  white-space: nowrap;
  
  &::before,
  &::after {
    content: '★';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 32px;
    color: #ff1493;
    text-shadow: 
      0 0 10px #ff1493,
      0 0 20px #ff1493,
      0 0 30px #ff1493;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  &::before {
    left: -50px;
  }
  
  &::after {
    right: -50px;
  }
  
  @media (max-width: 768px) {
    font-size: 48px;
    letter-spacing: 12px;
    
    &::before,
    &::after {
      font-size: 24px;
    }
    
    &::before {
      left: -35px;
    }
    
    &::after {
      right: -35px;
    }
  }
`;

interface ArcadeLayoutProps {
  children: ReactNode;
  headerContent?: ReactNode;
  title?: string;
}

export const ArcadeLayout = ({ children, headerContent, title }: ArcadeLayoutProps) => {
  return (
    <PageContainer>
      <ArcadeCabinet>
        <MarqueeText>ARCADE</MarqueeText>
        <Joystick />
        <CoinSlot />
        <ControlsContainer>
          <ButtonDecoration>
            <span />
            <span />
            <span />
            <span />
          </ButtonDecoration>
        </ControlsContainer>

        <ArcadeFrame>
          <Scanline />
          {headerContent}
          <Header>
            <Title>
              {title ? (
                <span>{title}</span>
              ) : (
                <>
                  <span>🕹️</span>
                  <span>PLAY</span>
                  <span>🕹️</span>
                </>
              )}
            </Title>
            {!title && <Subtitle>Select Your Game</Subtitle>}
          </Header>

          {children}

          {!title && <InsertCoinText>INSERT COIN TO PLAY</InsertCoinText>}
        </ArcadeFrame>
      </ArcadeCabinet>
    </PageContainer>
  );
};
