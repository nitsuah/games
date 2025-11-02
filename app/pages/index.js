import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0a0015 100%);
  color: white;
  font-family: 'Courier New', monospace;
  margin: 0;
  padding: 20px;
  position: relative;
  overflow: auto;
  box-sizing: border-box;

  /* CRT screen effect */
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
  padding: 35px 60px 90px;
  border-radius: 20px;
  border: 4px solid #00ffff;
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.6),
    inset 0 0 60px rgba(0, 255, 255, 0.1);
  position: relative;
  z-index: 5;
  animation: ${slideIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  width: 600px;
  max-width: 90vw;
  box-sizing: border-box;
  min-height: 550px;
  
  @media (max-width: 768px) {
    padding: 30px 40px 75px;
    min-height: 480px;
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
  gap: 15px;
  
  @media (max-width: 768px) {
    font-size: 36px;
    gap: 10px;
    letter-spacing: 6px;
    
    span:first-child {
      display: none;
    }
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

const GameList = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800px;
`;

const GameCard = styled(Link)`
  position: relative;
  padding: 20px 35px;
  background: linear-gradient(135deg, rgba(0, 50, 80, 0.4), rgba(0, 30, 60, 0.4));
  color: #00ffff;
  text-decoration: none;
  border-radius: 12px;
  border: 2px solid #00ffff;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 4px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  will-change: transform;
  flex: 1;
  min-width: 180px;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 255, 0.3),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(0, 80, 120, 0.6), rgba(0, 50, 90, 0.6));
    transform: translateY(-5px);
    box-shadow: 
      0 0 30px rgba(0, 255, 255, 0.8),
      0 0 60px rgba(0, 255, 255, 0.4),
      inset 0 0 30px rgba(0, 255, 255, 0.2);
    border-color: #00ffff;

    &::before {
      transform: translateX(100%);
    }
  }

  &:active {
    transform: translateY(-2px);
  }

  &:focus {
    outline: none;
    box-shadow: 
      0 0 40px rgba(0, 255, 255, 1),
      0 0 80px rgba(0, 255, 255, 0.5);
  }
`;

const GameIcon = styled.span`
  display: block;
  font-size: 36px;
  margin: 0;
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
  z-index: 6;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 14px;
    letter-spacing: 1px;
    bottom: 20px;
  }
`;

const MuteButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  background: rgba(20, 0, 40, 0.9);
  border: 2px solid ${props => props.$muted ? '#888' : '#ffff00'};
  border-radius: 50%;
  color: ${props => props.$muted ? '#888' : '#ffff00'};
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 0 20px ${props => props.$muted ? 'rgba(136, 136, 136, 0.3)' : 'rgba(255, 255, 0, 0.6)'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px ${props => props.$muted ? 'rgba(136, 136, 136, 0.5)' : 'rgba(255, 255, 0, 0.8)'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ArcadeCabinet = styled.div`
  position: relative;
  max-width: 90vw;
  padding-bottom: 100px;
  padding-top: 110px;
  margin: 20px 0;

  /* Cabinet top marquee - matches screen width */
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    max-width: 90vw;
    height: 80px;
    background: linear-gradient(135deg, #ff1493 0%, #ff69b4 50%, #ff1493 100%);
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    border: 6px solid #ff69b4;
    border-bottom: none;
    box-shadow: 
      0 -5px 40px rgba(255, 20, 147, 0.9),
      inset 0 15px 40px rgba(255, 105, 180, 0.4);
    z-index: 10;
  }

  /* Control panel below screen - matches screen width */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    max-width: 90vw;
    height: 120px;
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
    
    span:first-child,
    span:last-child {
      display: none;
    }
  }

  /* Fake arcade buttons */
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
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  z-index: 15;
  width: 600px;
  max-width: 90vw;
  padding: 0 20px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    gap: 15px;
    padding: 0 30px;
    justify-content: center;
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
  top: 35px;
  left: 50%;
  transform: translateX(-50%);
  color: #ffff00;
  font-size: 56px;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  text-shadow: 
    0 0 20px #ffff00,
    0 0 40px #ffff00;
  letter-spacing: 14px;
  z-index: 15;
  animation: ${flicker} 2s infinite alternate;
  will-change: opacity;
  margin: 0;
  white-space: nowrap;
`;

const HomePage = () => {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element with error handling
    try {
      audioRef.current = new Audio('/sounds/arcade.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      
      // Handle audio loading errors
      audioRef.current.addEventListener('error', (e) => {
        console.error('Failed to load audio file:', e);
      });
    } catch (error) {
      console.error('Failed to create Audio element:', error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (muted) {
        audioRef.current.play().catch(e => {
          console.error(
            `Audio playback failed: ${e?.name ? e.name + ': ' : ''}${e?.message ?? e}. This may be due to browser autoplay restrictions, unsupported audio format, or lack of user interaction.`,
            e
          );
        });
      } else {
        audioRef.current.pause();
      }
      setMuted(!muted);
    }
  };

  return (
    <PageContainer>
      <MuteButton onClick={toggleMute} $muted={muted} title={muted ? 'Unmute Music' : 'Mute Music'}>
        {muted ? '🔇' : '🔊'}
      </MuteButton>

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
          <Header>
            <Title>
              <span>🕹️</span>
              <span>PLAY</span>
              <span>🕹️</span>
            </Title>
            <Subtitle>Select Your Game</Subtitle>
          </Header>
          <GameList>
            <GameCard href="/asteroid">
              <GameIcon>🎯</GameIcon>
              Asteroid
            </GameCard>
            <GameCard href="/fps">
              <GameIcon>🎮</GameIcon>
              FPS
            </GameCard>
          </GameList>
          <InsertCoinText>INSERT COIN TO PLAY</InsertCoinText>
        </ArcadeFrame>
      </ArcadeCabinet>
    </PageContainer>
  );
};

export default HomePage;
