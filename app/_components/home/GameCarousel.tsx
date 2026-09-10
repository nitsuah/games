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
  /* At narrow phone widths the frame's inner content area (~90-95vw, no
     horizontal padding) is narrower than 3 * 130px + gaps, so the grid
     overflowed the cyan frame and clipped both edges of the viewport.
     Shrink columns to match ArcadeCard's own .gridMode mobile size (120px).
     minmax(0, 100px) (not a bare 100px) lets each track shrink below 100px
     when the frame's content box itself is under 320px (e.g. a 320px-wide
     viewport, whose frame content area nets out to ~296px after the frame's
     4px border) instead of forcing a fixed 320px grid that overflows its
     own container. ArcadeCard.module.css's .gridMode mirrors this with
     width: 100%/max-width: 100px so the card tracks the shrunk cell. */
  @media (max-width: 400px) {
    grid-template-columns: repeat(3, minmax(0, 100px));
    max-width: 320px;
    gap: 10px;
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
