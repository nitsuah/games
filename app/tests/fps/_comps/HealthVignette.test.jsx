import { render } from '@testing-library/react';
import HealthVignette from '@/lib/fps/_comps/HealthVignette';

describe('HealthVignette', () => {
  it('renders nothing at health >= 50', () => {
    const { container } = render(<HealthVignette health={100} />);
    expect(container.firstChild).toBeNull();

    const { container: c50 } = render(<HealthVignette health={50} />);
    expect(c50.firstChild).toBeNull();

    const { container: c150 } = render(<HealthVignette health={150} />);
    expect(c150.firstChild).toBeNull();
  });

  it('renders vignette with correct opacity at health=49 and no redTint', () => {
    const { container } = render(<HealthVignette health={49} />);
    const vignette = container.querySelector('.vignette');
    expect(vignette).toBeInTheDocument();
    expect(parseFloat(vignette.style.opacity)).toBeCloseTo(0.016, 3);
    expect(container.querySelector('.redTint')).toBeNull();
  });

  it('renders vignette with correct opacity at health=25 and no redTint', () => {
    const { container } = render(<HealthVignette health={25} />);
    const vignette = container.querySelector('.vignette');
    expect(vignette).toBeInTheDocument();
    expect(parseFloat(vignette.style.opacity)).toBeCloseTo(0.4, 1);
    expect(container.querySelector('.redTint')).toBeNull();
  });

  it('renders redTint at health=24 with correct opacity', () => {
    const { container } = render(<HealthVignette health={24} />);
    const vignette = container.querySelector('.vignette');
    const redTint = container.querySelector('.redTint');
    expect(vignette).toBeInTheDocument();
    expect(redTint).toBeInTheDocument();
    expect(parseFloat(redTint.style.opacity)).toBeCloseTo(0.012, 3);
  });

  it('renders both vignette and redTint at health=0 with correct opacities', () => {
    const { container } = render(<HealthVignette health={0} />);
    const vignette = container.querySelector('.vignette');
    const redTint = container.querySelector('.redTint');
    expect(vignette).toBeInTheDocument();
    expect(redTint).toBeInTheDocument();
    expect(parseFloat(vignette.style.opacity)).toBeCloseTo(0.8, 1);
    expect(parseFloat(redTint.style.opacity)).toBeCloseTo(0.3, 1);
  });

  it('clamps negative health to 0 (same as health=0)', () => {
    const { container: c0 } = render(<HealthVignette health={0} />);
    const { container: cNeg } = render(<HealthVignette health={-10} />);
    expect(cNeg.querySelector('.vignette').style.opacity).toBe(c0.querySelector('.vignette').style.opacity);
    expect(cNeg.querySelector('.redTint').style.opacity).toBe(c0.querySelector('.redTint').style.opacity);
  });
});
