import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ArcadeCard from '@/lib/shared/ui/ArcadeCard';

type Game = {
  title: string;
  icon: string;
  description: string;
  route: string;
};

const GameList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 150px);
  max-width: 550px;
  gap: 20px;
  justify-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
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
`;

export const GameCarousel = () => {
  const router = useRouter();
  const games: Game[] = [
    { title: 'Asteroid', icon: '🎯', description: 'Blast asteroids in space', route: '/asteroid' },
    { title: 'Tank Battle', icon: '🪖', description: '2D top-down tank combat', route: '/fps' },
    { title: 'Breakout', icon: '🧱', description: 'Classic brick breaking action', route: '/breakout' },
    { title: 'Invaders', icon: '👾', description: 'Defend Earth from aliens', route: '/space-invaders' },
    { title: 'Flappy', icon: '🐦', description: 'Tap to fly!', route: '/flappy' },
    { title: 'Snake', icon: '🐍', description: 'Eat and grow!', route: '/snake' },
    { title: 'Pong', icon: '🏓', description: 'Classic paddle battle', route: '/pong' },
    { title: 'Memory Match', icon: '🧠', description: 'Flip cards to match pairs', route: '/memory-match' },
    { title: 'Dodge Blocks', icon: '⬛', description: 'Dodge falling blocks!', route: '/dodge-blocks' },
  ];

  return (
    <GameList>
      {games.map((game) => (
        <ArcadeCard
          key={game.title}
          title={game.title}
          icon={game.icon}
          description={game.description}
          onClick={() => router.push(game.route)}
          displayMode="grid"
          tabIndex={0}
        />
      ))}
    </GameList>
  );
};
