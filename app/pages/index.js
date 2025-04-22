import React, { useState } from 'react';
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
  border-radius: 4px;
  text-align: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: #4CAF50;
    transform: translateY(-2px);
  }
`;

const TestButton = styled.button`
  padding: 1rem 2rem;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: 2rem;
  transition: all 0.3s ease;

  &:hover {
    background: #1976D2;
    transform: translateY(-2px);
  }
`;

const HomePage = () => {
  const [status, setStatus] = useState('Ready to test');

  const testSound = () => {
    setStatus('Loading sound...');
    
    // Create a new audio element
    const audio = new Audio();
    
    // Add event listeners
    audio.addEventListener('canplaythrough', () => {
      console.log('Sound can play');
      setStatus('Sound loaded, attempting to play...');
      
      // Try to play the sound
      audio.play()
        .then(() => {
          console.log('Sound playing');
          setStatus('Sound playing!');
        })
        .catch(error => {
          console.error('Error playing sound:', error);
          setStatus(`Error: ${error.message}`);
        });
    });

    audio.addEventListener('error', (e) => {
      console.error('Error loading sound:', e);
      setStatus(`Error loading sound: ${e.message}`);
    });

    // Set the source - using the correct path from the public directory
    audio.src = '/sounds/shoot.mp3';
    console.log('Attempting to load sound from:', audio.src);
    
    // Load the audio
    audio.load();
  };

  return (
    <PageContainer>
      <Title>Game Selector</Title>
      <GameList>
        <GameLink href="/asteroid">
          Asteroid
        </GameLink>
        <GameLink href="/fps">
          FPS
        </GameLink>
      </GameList>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <TestButton onClick={testSound}>
          Test Single Sound
        </TestButton>
        <div style={{ marginTop: '1rem', color: 'white' }}>
          Status: {status}
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage; 