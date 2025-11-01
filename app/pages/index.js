import Link from 'next/link';
import styled, { keyframes } from 'styled-components';

const flicker = keyframes`
  0%, 100% { opacity: 1; text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 4px 0 rgba(0, 0, 0, 0.8); }
  50% { opacity: 0.95; text-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff, 0 4px 0 rgba(0, 0, 0, 0.8); }
`;

const scanlineAnim = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0a0015 100%);
  color: white;
  font-family: 'Courier New', monospace;
  margin: 0;
  position: relative;
  overflow: hidden;

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
  padding: 60px 80px;
  border-radius: 20px;
  border: 4px solid #00ffff;
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.6),
    inset 0 0 60px rgba(0, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  animation: ${slideIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
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
`;

const Header = styled.div`
  position: relative;
  margin-bottom: 50px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 72px;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 
    0 0 20px #00ffff,
    0 0 40px #00ffff,
    0 4px 0 rgba(0, 0, 0, 0.8);
  margin: 0 0 10px 0;
  letter-spacing: 12px;
  font-family: 'Courier New', monospace;
  animation: ${flicker} 3s infinite alternate;
  text-transform: uppercase;
`;

const Subtitle = styled.div`
  font-size: 18px;
  color: #888;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-top: 10px;
`;

const GameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 400px;
`;

const GameCard = styled(Link)`
  position: relative;
  padding: 25px 40px;
  background: linear-gradient(135deg, rgba(0, 50, 80, 0.4), rgba(0, 30, 60, 0.4));
  color: #00ffff;
  text-decoration: none;
  border-radius: 12px;
  border: 2px solid #00ffff;
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 4px;
  transition: all 0.3s ease;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s ease;
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
      left: 100%;
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
  display: inline-block;
  margin-right: 15px;
  font-size: 32px;
`;

const Footer = styled.div`
  margin-top: 40px;
  text-align: center;
  color: #666;
  font-size: 14px;
  letter-spacing: 2px;
`;

const HomePage = () => {
  return (
    <PageContainer>
      <ArcadeFrame>
        <Scanline />
        <Header>
          <Title>🕹️ Arcade 🕹️</Title>
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
        <Footer>
          INSERT COIN TO CONTINUE
        </Footer>
      </ArcadeFrame>
    </PageContainer>
  );
};

export default HomePage;
