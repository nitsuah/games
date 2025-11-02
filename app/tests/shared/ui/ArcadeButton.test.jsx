import { render, screen, fireEvent } from '@testing-library/react';
import ArcadeButton, { VARIANTS } from '@/lib/shared/ui/ArcadeButton';

describe('ArcadeButton', () => {
  it('renders with text', () => {
    render(<ArcadeButton>Click Me</ArcadeButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ArcadeButton onClick={handleClick}>Click Me</ArcadeButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    render(<ArcadeButton icon="🔄">Restart</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🔄');
    expect(button).toHaveTextContent('Restart');
  });

  it('renders with hint text', () => {
    render(<ArcadeButton hint="Press R">Restart</ArcadeButton>);
    expect(screen.getByText('Press R')).toBeInTheDocument();
  });

  it('renders with icon and hint', () => {
    render(
      <ArcadeButton icon="🔄" hint="Press R">
        Restart
      </ArcadeButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🔄');
    expect(button).toHaveTextContent('Restart');
    expect(button).toHaveTextContent('Press R');
  });

  it('applies primary variant by default', () => {
    render(<ArcadeButton>Button</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('variant-primary');
  });

  it('applies danger variant', () => {
    render(<ArcadeButton variant={VARIANTS.DANGER}>Delete</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('variant-danger');
  });

  it('applies warning variant', () => {
    render(<ArcadeButton variant={VARIANTS.WARNING}>Warning</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('variant-warning');
  });

  it('applies success variant', () => {
    render(<ArcadeButton variant={VARIANTS.SUCCESS}>Success</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('variant-success');
  });

  it('applies secondary variant', () => {
    render(<ArcadeButton variant={VARIANTS.SECONDARY}>Cancel</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('variant-secondary');
  });

  it('respects disabled state', () => {
    const handleClick = jest.fn();
    render(
      <ArcadeButton onClick={handleClick} disabled>
        Disabled
      </ArcadeButton>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<ArcadeButton className="custom-class">Button</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-class');
  });

  it('applies custom style', () => {
    render(<ArcadeButton style={{ width: '200px' }}>Button</ArcadeButton>);
    const button = screen.getByRole('button');
    expect(button.style.width).toBe('200px');
  });

  it('exports VARIANTS constant', () => {
    expect(VARIANTS).toEqual({
      PRIMARY: 'primary',
      DANGER: 'danger',
      WARNING: 'warning',
      SUCCESS: 'success',
      SECONDARY: 'secondary',
    });
  });
});
