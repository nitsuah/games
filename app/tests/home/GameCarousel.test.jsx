import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/router', () => ({ useRouter: () => ({ push: mockPush }) }));

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
  beforeEach(() => mockPush.mockClear());

  it('lists every game once', () => {
    render(<GameCarousel />);
    EXPECTED.forEach(([title]) => expect(screen.getByText(title)).toBeInTheDocument());
  });

  it.each(EXPECTED)('%s navigates to %s', (title, route) => {
    render(<GameCarousel />);
    fireEvent.click(screen.getByText(title));
    expect(mockPush).toHaveBeenCalledWith(route);
  });

  it.each(EXPECTED)('%s route %s has a page', (_title, route) => {
    const pagesDir = path.join(__dirname, '..', '..', 'pages');
    const candidates = ['.jsx', '.tsx', '.js', '.ts'].map((ext) => path.join(pagesDir, `${route}${ext}`));
    expect(candidates.some((file) => fs.existsSync(file))).toBe(true);
  });
});
