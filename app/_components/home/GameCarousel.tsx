import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ArcadeCard from '@/lib/shared/ui/ArcadeCard';

type Game = {
  title: string;
  icon: string;
  description: string;
  route: string;
};

type GameWithPosition = Game & {
  position: 'prev' | 'current' | 'next';
};

const GameList = styled.div<{ $mode: string }>`
  display: flex;
  flex-direction: ${props => props.$mode === 'list' ? 'column' : 'row'};
  gap: ${props => props.$mode === 'grid' ? '20px' : '20px'};
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  max-width: 800px;
  width: 100%;
  position: relative;
  flex-grow: 1;
  
  ${props => props.$mode === 'carousel' && `
    flex-wrap: nowrap;
    overflow: hidden;
    max-width: 500px;
    position: relative;
    min-height: 400px;
  `}
  
  ${props => props.$mode === 'grid' && `
    display: grid;
    grid-template-columns: repeat(3, 150px);
    max-width: 550px;
    gap: 20px;
    justify-items: center;
    justify-content: center;
    
    @media (max-width: 768px) {
      grid-template-columns: repeat(3, 130px);
      max-width: 450px;
      gap: 15px;
    }
    
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 160px);
      max-width: 580px;
      gap: 25px;
    }
  `}
  
  ${props => props.$mode === 'list' && `
    align-items: stretch;
    max-width: 550px;
    overflow-y: auto;
    max-height: 450px;
    padding: 10px 10px 10px 0;
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 255, 255, 0.4);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 255, 255, 0.6);
    }
  `}
`;

const CarouselArrow = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.$direction === 'left' ? 'left: -50px;' : 'right: -50px;'}
  background: rgba(0, 255, 255, 0.2);
  border: 2px solid #00ffff;
  border-radius: 50%;
  color: #00ffff;
  font-size: 28px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  
  &:hover {
    background: rgba(0, 255, 255, 0.4);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  @media (max-width: 768px) {
    ${props => props.$direction === 'left' ? 'left: 10px;' : 'right: 10px;'}
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  
  @media (min-width: 1200px) {
    ${props => props.$direction === 'left' ? 'left: -70px;' : 'right: -70px;'}
  }
`;

const DisplayModeButton = styled.button`
  position: absolute;
  top: 50px;
  right: 10px;
  background: rgba(0, 255, 255, 0.1);
  border: 2px solid #00ffff;
  border-radius: 8px;
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-size: 24px;
  cursor: pointer;
  padding: 8px 12px;
  z-index: 20;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  transition: all 0.3s ease;
  will-change: transform;
  
  &:hover {
    background: rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 25px rgba(0, 255, 255, 0.5);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
    padding: 6px 10px;
  }
`;

export const GameCarousel = () => {
  const router = useRouter();
  const [displayMode, setDisplayMode] = useState<'carousel' | 'grid' | 'list'>('carousel');
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  const games = [
    { title: 'Asteroid', icon: '🎯', description: 'Blast asteroids in space', route: '/asteroid' },
    { title: 'FPS', icon: '🎮', description: 'First-person shooter action', route: '/fps' },
    { title: 'Breakout', icon: '🧱', description: 'Classic brick breaking action', route: '/breakout' },
    { title: 'Invaders', icon: '👾', description: 'Defend Earth from aliens', route: '/space-invaders' },
    { title: 'Flappy', icon: '🐦', description: 'Tap to fly!', route: '/flappy' },
    { title: 'Snake', icon: '🐍', description: 'Eat and grow!', route: '/snake' },
    { title: 'Pong', icon: '🏓', description: 'Classic paddle battle', route: '/pong' },
    { title: 'Memory Match', icon: '🧠', description: 'Flip cards to match pairs', route: '/memory-match' },
    { title: 'Dodge Blocks', icon: '⬛', description: 'Dodge falling blocks!', route: '/dodge-blocks' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys, not other keys
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // Prevent default scrolling behavior
      e.preventDefault();

      if (displayMode === 'carousel') {
        // In carousel mode, left/right arrows navigate games
        if (e.key === 'ArrowLeft') {
          prevGame();
        } else if (e.key === 'ArrowRight') {
          nextGame();
        }
      } else if (displayMode === 'grid' || displayMode === 'list') {
        // In grid/list mode, up/down arrows navigate games
        if (e.key === 'ArrowUp') {
          setCurrentGameIndex((prev) => (prev - 1 + games.length) % games.length);
        } else if (e.key === 'ArrowDown') {
          setCurrentGameIndex((prev) => (prev + 1) % games.length);
        }
        // Also support left/right in grid mode
        if (displayMode === 'grid' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          if (e.key === 'ArrowLeft') {
            setCurrentGameIndex((prev) => (prev - 1 + games.length) % games.length);
          } else {
            setCurrentGameIndex((prev) => (prev + 1) % games.length);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayMode, games.length]);

  const cycleDisplayMode = () => {
    setDisplayMode(prev => {
      if (prev === 'carousel') return 'grid';
      if (prev === 'grid') return 'list';
      return 'carousel';
    });
  };

  const getDisplayIcon = () => {
    if (displayMode === 'carousel') return '⊞';
    if (displayMode === 'grid') return '☰';
    return '⊟';
  };

  const nextGame = () => {
    setCurrentGameIndex((prev) => (prev + 1) % games.length);
  };

  const prevGame = () => {
    setCurrentGameIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  // For carousel mode, show prev, current, and next cards
  const getCarouselGames = (): GameWithPosition[] => {
    const prevIndex = (currentGameIndex - 1 + games.length) % games.length;
    const nextIndex = (currentGameIndex + 1) % games.length;
    return [
      { ...games[prevIndex], position: 'prev' as const },
      { ...games[currentGameIndex], position: 'current' as const },
      { ...games[nextIndex], position: 'next' as const },
    ];
  };

  const displayedGames: (Game | GameWithPosition)[] = displayMode === 'carousel' ? getCarouselGames() : games;

  return (
    <>
      <DisplayModeButton onClick={cycleDisplayMode} title={`Switch to ${displayMode === 'carousel' ? 'grid' : displayMode === 'grid' ? 'list' : 'carousel'} mode`}>
        {getDisplayIcon()}
      </DisplayModeButton>

      <GameList $mode={displayMode}>
        {displayMode === 'carousel' && games.length > 1 && (
          <>
            <CarouselArrow $direction="left" onClick={prevGame}>
              ←
            </CarouselArrow>
            <CarouselArrow $direction="right" onClick={nextGame}>
              →
            </CarouselArrow>
          </>
        )}
        {displayedGames.map((game, index) => (
          <ArcadeCard
            key={displayMode === 'carousel' ? `${game.title}-${index}` : game.title}
            title={game.title}
            icon={game.icon}
            description={game.description}
            onClick={() => router.push(game.route)}
            displayMode={displayMode}
            carouselPosition={displayMode === 'carousel' ? (game as GameWithPosition).position : undefined}
          />
        ))}
      </GameList>
    </>
  );
};
