import { render, screen, fireEvent } from '@testing-library/react';
import ArcadeMenu from '@/lib/shared/ui/ArcadeMenu';

describe('ArcadeMenu', () => {
  it('renders children', () => {
    render(
      <ArcadeMenu>
        <div>Test Content</div>
      </ArcadeMenu>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<ArcadeMenu title="PAUSED">Content</ArcadeMenu>);
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
  });

  it('does not render header when title is not provided', () => {
    const { container } = render(<ArcadeMenu>Content</ArcadeMenu>);
    const headers = container.querySelectorAll('h2');
    expect(headers.length).toBe(0);
  });

  it('calls onClose when overlay is clicked', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <ArcadeMenu onClose={handleClose}>
        <div>Content</div>
      </ArcadeMenu>
    );
    const overlay = container.querySelector('[class*="overlay"]');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when container is clicked', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <ArcadeMenu onClose={handleClose}>
        <div>Content</div>
      </ArcadeMenu>
    );
    const containerEl = container.querySelector('[class*="container"]');
    fireEvent.click(containerEl);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('applies custom className to container', () => {
    const { container } = render(
      <ArcadeMenu className="custom-menu">Content</ArcadeMenu>
    );
    const containerEl = container.querySelector('[class*="container"]');
    expect(containerEl.className).toContain('custom-menu');
  });

  it('renders scanline when title is provided', () => {
    const { container } = render(<ArcadeMenu title="TEST">Content</ArcadeMenu>);
    const scanlines = container.querySelectorAll('[class*="scanline"]');
    expect(scanlines.length).toBeGreaterThan(0);
  });
});
