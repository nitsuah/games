import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const ScoreContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 24px;
  font-family: 'Arial', sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const ScoreText = styled.div`
  &.score-updated {
    animation: ${pulse} 0.5s ease-in-out;
  }
`;

const HighScoreText = styled.div`
  font-size: 16px;
  color: #ffd700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const ScoreDisplay = ({ score }) => {
  const [highScore, setHighScore] = useState(0);
  const [scoreUpdated, setScoreUpdated] = useState(false);

  useEffect(() => {
    // Only access localStorage on the client side
    const saved = typeof window !== 'undefined' ? localStorage.getItem('asteroidHighScore') : null;
    setHighScore(saved ? parseInt(saved) : 0);
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      if (typeof window !== 'undefined') {
        localStorage.setItem('asteroidHighScore', score.toString());
      }
    }
  }, [score, highScore]);

  useEffect(() => {
    setScoreUpdated(true);
    const timer = setTimeout(() => setScoreUpdated(false), 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <ScoreContainer>
      <ScoreText className={scoreUpdated ? 'score-updated' : ''}>
        Score: {score}
      </ScoreText>
      <HighScoreText>
        High Score: {highScore}
      </HighScoreText>
    </ScoreContainer>
  );
};

export default ScoreDisplay; 