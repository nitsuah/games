import Link from 'next/link';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #1a1a1a;
  color: white;
  font-family: Arial, sans-serif;
  margin: 0;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #66bb6a;
`;

const GameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
`;

const GameLink = styled(Link)`
  padding: 1rem 2rem;
  background: #333;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  font-size: 1.2rem;
    /* Only transform on hover to stay compositor-friendly; avoid animating background-color */
    transition: transform 0.18s ease;

  &:hover {
    background: #4caf50;
      /* Swap background instantly (no transition) and use transform for motion */
      background: #4caf50;
      transform: translateY(-2px);
  }
`;

const HomePage = () => {
  return (
    <PageContainer>
      <Title>Game Selector</Title>
      <GameList>
        <GameLink href="/asteroid">Asteroid</GameLink>
        <GameLink href="/fps">FPS</GameLink>
      </GameList>
    </PageContainer>
  );
};

export default HomePage;
