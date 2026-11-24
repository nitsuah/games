import fs from 'fs';
import path from 'path';
import { render, screen } from '@testing-library/react';

import { GameCarousel } from '@/_components/home/GameCarousel';

const EXPECTED = [
  ['Asteroid', '/asteroid'],
  ['Tank Battle', '/fps'],
  ['Breakout', '/breakout'],
  ['Invaders', '/space-invaders'],
  ['Flappy', '/flappy'],
  ['Snake', '/snake'],
  ['Pong', '/pong'],
  ['Memory Match', '/memory-match'],
  ['Dodge Blocks', '/dodge-blocks'],
];

describe('GameCarousel', () => {
  it('lists every game once', () => {
    render(<GameCarousel />);
    EXPECTED.forEach(([title]) => expect(screen.getByText(title)).toBeInTheDocument());
  });

  it.each(EXPECTED)('%s is a real link to %s', (title, route) => {
    render(<GameCarousel />);
    const link = screen.getByRole('link', { name: title });
    expect(link).toHaveAttribute('href', route);
  });

  it.each(EXPECTED)('%s route %s has a page', (_title, route) => {
    const pagesDir = path.join(__dirname, '..', '..', 'pages');
    const candidates = ['.jsx', '.tsx', '.js', '.ts'].map((ext) => path.join(pagesDir, `${route}${ext}`));
    expect(candidates.some((file) => fs.existsSync(file))).toBe(true);
  });
});
