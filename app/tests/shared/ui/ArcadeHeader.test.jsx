import { render, screen } from '@testing-library/react';
import ArcadeHeader from '@/lib/shared/ui/ArcadeHeader';

describe('ArcadeHeader', () => {
  it('renders title', () => {
    render(<ArcadeHeader title="GAME OVER" />);
    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
  });

  it('renders title and subtitle', () => {
    render(<ArcadeHeader title="PAUSED" subtitle="Take a break" />);
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
    expect(screen.getByText('Take a break')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<ArcadeHeader title="PAUSED" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders scanline element', () => {
    const { container } = render(<ArcadeHeader title="TEST" />);
    const scanlines = container.querySelectorAll('[class*="scanline"]');
    expect(scanlines.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(<ArcadeHeader title="TEST" className="custom-header" />);
    const header = container.querySelector('[class*="header"]');
    expect(header.className).toContain('custom-header');
  });
});
