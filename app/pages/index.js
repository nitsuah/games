import React from 'react';
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
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #4CAF50;
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
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: #4CAF50;
    transform: translateY(-2px);
  }
`;

const HomePage = () => {
  return (
    <PageContainer>
      <Title>Game Selector</Title>
      <GameList>
        <GameLink href="/asteroid/asteroid">
          Asteroid Game
        </GameLink>
        {/* Add more game links here as needed */}
      </GameList>
    </PageContainer>
  );
};

export default HomePage; 