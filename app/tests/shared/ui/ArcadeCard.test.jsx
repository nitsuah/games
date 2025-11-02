import { render, screen, fireEvent } from '@testing-library/react';
import ArcadeCard from '@/lib/shared/ui/ArcadeCard';

describe('ArcadeCard', () => {
  const defaultProps = {
    title: 'Asteroid',
    icon: '🌌',
    description: 'Blast asteroids in space',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, icon, and description', () => {
    render(<ArcadeCard {...defaultProps} />);
    expect(screen.getByText('Asteroid')).toBeInTheDocument();
    expect(screen.getByText('🌌')).toBeInTheDocument();
    expect(screen.getByText('Blast asteroids in space')).toBeInTheDocument();
  });

  it('renders play prompt', () => {
    render(<ArcadeCard {...defaultProps} />);
    expect(screen.getByText('PLAY')).toBeInTheDocument();
    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ArcadeCard {...defaultProps} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders badge when provided', () => {
    render(<ArcadeCard {...defaultProps} badge="NEW" />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('does not render badge when not provided', () => {
    const { container } = render(<ArcadeCard {...defaultProps} />);
    const badges = container.querySelectorAll('[class*="badge"]');
    expect(badges.length).toBe(0);
  });

  it('applies custom className', () => {
    render(<ArcadeCard {...defaultProps} className="custom-card" />);
    const card = screen.getByRole('button');
    expect(card.className).toContain('custom-card');
  });

  it('renders different icons correctly', () => {
    render(<ArcadeCard {...defaultProps} icon="🎮" />);
    expect(screen.getByText('🎮')).toBeInTheDocument();
  });

  it('renders long descriptions', () => {
    const longDescription = 'This is a very long description that spans multiple lines to test text wrapping';
    render(<ArcadeCard {...defaultProps} description={longDescription} />);
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });
});
