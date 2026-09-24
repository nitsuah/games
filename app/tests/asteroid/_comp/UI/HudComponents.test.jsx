import { render, screen, act } from '@testing-library/react';
import AmmoIndicator from '@/lib/asteroid/_comp/UI/AmmoIndicator';
import ComboDisplay from '@/lib/asteroid/_comp/UI/ComboDisplay';
import Crosshair from '@/lib/asteroid/_comp/UI/Crosshair';
import ShotReticle from '@/lib/asteroid/_comp/UI/ShotReticle';
import DynamicCrosshair from '@/lib/asteroid/_comp/UI/DynamicCrosshair';
import HealthBar from '@/lib/asteroid/_comp/UI/HealthBar';
import ScoreDisplay from '@/lib/asteroid/_comp/UI/ScoreDisplay';
import WeaponDisplay from '@/lib/asteroid/_comp/UI/WeaponDisplay';
import PowerUpIndicator from '@/lib/asteroid/_comp/UI/PowerUpIndicator';
import PowerUpPopup from '@/lib/asteroid/_comp/UI/PowerUpPopup';
import FPSCounter from '@/lib/asteroid/_comp/UI/FPSCounter';

// CSS modules resolve through identity-obj-proxy, so class names equal their keys.

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('AmmoIndicator', () => {
  it('shows count, max and a blue bar when well stocked', () => {
    const { container } = render(<AmmoIndicator weapon="laser" ammo={{ laser: 8 }} maxAmmo={{ laser: 10 }} />);
    expect(screen.getByText('LASER')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
    const fill = container.querySelector('.fill');
    expect(fill).toHaveStyle({ transform: 'scaleX(0.8)', backgroundColor: '#3366ff' });
    expect(screen.queryByText('LOW AMMO!')).not.toBeInTheDocument();
  });

  it('warns and turns red at 20% or less', () => {
    const { container } = render(<AmmoIndicator weapon="laser" ammo={{ laser: 2 }} maxAmmo={{ laser: 10 }} />);
    expect(screen.getByText('LOW AMMO!')).toBeInTheDocument();
    expect(container.querySelector('.fill')).toHaveClass('critical');
    expect(container.querySelector('.fill')).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('shows OUT OF AMMO at zero', () => {
    render(<AmmoIndicator weapon="spread" ammo={{ spread: 0 }} />);
    expect(screen.getByText('OUT OF AMMO!')).toBeInTheDocument();
  });

  it('falls back to 30 max for unknown weapons and tolerates bad props', () => {
    render(<AmmoIndicator weapon="mystery" ammo={{ mystery: 15 }} maxAmmo={{}} />);
    expect(screen.getByText('15 / 30')).toBeInTheDocument();
    const { unmount } = render(<AmmoIndicator weapon={null} ammo={null} maxAmmo={null} />);
    expect(screen.getAllByText('OUT OF AMMO!')).toHaveLength(1);
    unmount();
  });

  it('flashes briefly when the ammo count changes', () => {
    const { container, rerender } = render(<AmmoIndicator weapon="laser" ammo={{ laser: 5 }} maxAmmo={{ laser: 10 }} />);
    expect(container.firstChild).not.toHaveClass('flash');
    rerender(<AmmoIndicator weapon="laser" ammo={{ laser: 4 }} maxAmmo={{ laser: 10 }} />);
    expect(container.firstChild).toHaveClass('flash');
    act(() => jest.advanceTimersByTime(200));
    expect(container.firstChild).not.toHaveClass('flash');
  });

  it('handles a zero max without dividing by zero', () => {
    render(<AmmoIndicator weapon="x" ammo={{ x: 3 }} maxAmmo={{ x: 0 }} />);
    // 0 is falsy so the 30 fallback applies
    expect(screen.getByText('3 / 30')).toBeInTheDocument();
  });
});

describe('ComboDisplay', () => {
  it('renders nothing below a 2x combo', () => {
    const { container } = render(<ComboDisplay combo={1} multiplier={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the combo and the score bonus', () => {
    render(<ComboDisplay combo={3} multiplier={1.5} />);
    expect(screen.getByText('×3')).toBeInTheDocument();
    expect(screen.getByText('+50% Score')).toBeInTheDocument();
  });

  it('hides the bonus at 1x and marks mega combos', () => {
    const { container } = render(<ComboDisplay combo={5} multiplier={1} />);
    expect(screen.queryByText(/Score/)).not.toBeInTheDocument();
    expect(container.querySelector('.combo')).toHaveClass('mega');
  });

  it('animates growth only when the combo increases', () => {
    const { container, rerender } = render(<ComboDisplay combo={2} multiplier={1} />);
    rerender(<ComboDisplay combo={3} multiplier={1} />);
    expect(container.querySelector('.combo')).toHaveClass('grow');
    act(() => jest.advanceTimersByTime(300));
    expect(container.querySelector('.combo')).not.toHaveClass('grow');
    rerender(<ComboDisplay combo={2} multiplier={1} />);
    expect(container.querySelector('.combo')).not.toHaveClass('grow');
  });
});

describe('static reticles', () => {
  it('Crosshair and ShotReticle render their parts', () => {
    const { container } = render(
      <>
        <Crosshair />
        <ShotReticle />
      </>
    );
    expect(container.querySelector('.crosshairVertical')).toBeInTheDocument();
    expect(container.querySelector('.crosshairHorizontal')).toBeInTheDocument();
    expect(container.querySelector('.reticleCircle')).toBeInTheDocument();
  });
});

describe('DynamicCrosshair', () => {
  const crosshair = (c) => c.querySelector('.crosshair');

  it.each([
    ['spread', 'spreadCrosshair', false],
    ['laser', 'laserCrosshair', false],
    ['explosive', 'explosiveCrosshair', true],
    ['aa', 'aaCrosshair', false],
    ['plasma', 'plasmaCrosshair', true],
    ['unknown', 'spreadCrosshair', false],
  ])('%s uses %s (outer ring: %s)', (weapon, cls, ring) => {
    const { container } = render(<DynamicCrosshair weapon={weapon} />);
    expect(crosshair(container)).toHaveClass(cls);
    expect(!!container.querySelector('.outerRing')).toBe(ring);
  });

  it('is unscaled at rest and expands with velocity (capped)', () => {
    const { container, rerender } = render(<DynamicCrosshair velocity={0} />);
    expect(crosshair(container).style.transform).toBe('translate(-50%, -50%) scale(1)');
    rerender(<DynamicCrosshair velocity={10} />);
    // base capped at 1.3, acceleration bonus capped at 0.2
    expect(crosshair(container).style.transform).toBe('translate(-50%, -50%) scale(1.5)');
    rerender(<DynamicCrosshair velocity={10} />);
    expect(crosshair(container).style.transform).toBe('translate(-50%, -50%) scale(1.5)');
  });

  it('pulses on hit', () => {
    const { container, rerender } = render(<DynamicCrosshair onHit={false} />);
    rerender(<DynamicCrosshair onHit />);
    expect(crosshair(container)).toHaveClass('hitPulse');
    act(() => jest.advanceTimersByTime(200));
    expect(crosshair(container)).not.toHaveClass('hitPulse');
  });
});

describe('HealthBar', () => {
  const bar = (c) => c.querySelector('.bar');

  it.each([
    [100, '#00ff00', false],
    [61, '#00ff00', false],
    [60, '#ffaa00', false],
    [31, '#ffaa00', false],
    [30, '#ff0000', true],
  ])('%i health -> %s (critical: %s)', (health, color, critical) => {
    const { container } = render(<HealthBar health={health} />);
    expect(bar(container)).toHaveStyle({ backgroundColor: color });
    expect(bar(container).classList.contains('critical')).toBe(critical);
  });

  it('clamps the bar between 0 and 100% and rounds the label', () => {
    const { container, rerender } = render(<HealthBar health={150.4} />);
    expect(bar(container).style.transform).toBe('scaleX(1)');
    expect(screen.getByText('150 / 100')).toBeInTheDocument();
    rerender(<HealthBar health={-10} />);
    expect(bar(container).style.transform).toBe('scaleX(0)');
  });

  it('supports a custom max', () => {
    const { container } = render(<HealthBar health={25} maxHealth={50} />);
    expect(bar(container).style.transform).toBe('scaleX(0.5)');
  });

  it('pulses only when taking damage', () => {
    const { container, rerender } = render(<HealthBar health={80} />);
    const barContainer = () => container.querySelector('.barContainer');
    rerender(<HealthBar health={90} />);
    expect(barContainer()).not.toHaveClass('damagePulse');
    rerender(<HealthBar health={70} />);
    expect(barContainer()).toHaveClass('damagePulse');
    act(() => jest.advanceTimersByTime(500));
    expect(barContainer()).not.toHaveClass('damagePulse');
  });
});

describe('ScoreDisplay', () => {
  it('highlights for 500ms whenever the score changes', () => {
    const { container, rerender } = render(<ScoreDisplay score={0} />);
    const text = () => container.querySelector('.scoreText');
    expect(text()).toHaveTextContent('Score: 0');
    act(() => jest.advanceTimersByTime(500));
    expect(text()).not.toHaveClass('scoreUpdated');
    rerender(<ScoreDisplay score={10} />);
    expect(text()).toHaveClass('scoreUpdated');
    act(() => jest.advanceTimersByTime(500));
    expect(text()).not.toHaveClass('scoreUpdated');
  });
});

describe('WeaponDisplay', () => {
  it('shows name, ammo and a ready reload bar', () => {
    const { container } = render(<WeaponDisplay weapon="spread" ammo={{ spread: 4 }} cooldowns={{ spread: 0 }} />);
    expect(screen.getByText('Spread Shot')).toBeInTheDocument();
    expect(container.querySelector('.ammoSection')).toHaveTextContent('4 / 10');
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(container.querySelector('.cooldownBar')).toHaveClass('ready');
    expect(container.querySelector('.cooldownBar').style.transform).toBe('scaleX(1)');
  });

  it('shows remaining reload time and progress', () => {
    const { container } = render(<WeaponDisplay weapon="explosive" ammo={{ explosive: 1 }} cooldowns={{ explosive: 0.75 }} />);
    expect(screen.getByText('0.8s')).toBeInTheDocument();
    expect(container.querySelector('.cooldownBar').style.transform).toBe('scaleX(0.5)');
  });

  it('clamps progress when the cooldown exceeds the weapon max', () => {
    const { container } = render(<WeaponDisplay weapon="spread" cooldowns={{ spread: 5 }} />);
    expect(container.querySelector('.cooldownBar').style.transform).toBe('scaleX(0)');
  });

  it('hides the reload bar for weapons without a cooldown', () => {
    const { container } = render(<WeaponDisplay weapon="laser" ammo={{ laser: 3 }} />);
    expect(container.querySelector('.cooldownSection')).not.toBeInTheDocument();
  });

  it('falls back safely for unknown weapons and malformed props', () => {
    const { container } = render(<WeaponDisplay weapon="nope" ammo={null} cooldowns={{ nope: 'soon' }} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(container.querySelector('.ammoSection')).toHaveTextContent('0 / 0');
    render(<WeaponDisplay />);
    expect(screen.getAllByText('Unknown')).toHaveLength(2);
  });
});

describe('PowerUpIndicator', () => {
  it('renders nothing with no active power-ups', () => {
    const { container } = render(<PowerUpIndicator shieldActive={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists every active power-up, with shield hit counts', () => {
    render(
      <PowerUpIndicator shieldActive={3} rapidFireActive slowMotionActive invincibilityActive speedBoostActive />
    );
    ['Shield (3 hits)', 'Rapid Fire', 'Slow Motion', 'Invincibility', 'Speed Boost'].forEach((t) =>
      expect(screen.getByText(t)).toBeInTheDocument()
    );
  });

  it('shows an infinite shield for a boolean shield', () => {
    render(<PowerUpIndicator shieldActive />);
    expect(screen.getByText('Shield (∞ hits)')).toBeInTheDocument();
  });
});

describe('PowerUpPopup', () => {
  it('renders nothing when hidden or untyped', () => {
    const { container, rerender } = render(<PowerUpPopup type="shield" visible={false} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<PowerUpPopup visible />);
    expect(container).toBeEmptyDOMElement();
  });

  it('labels known and unknown power-ups', () => {
    const { rerender } = render(<PowerUpPopup type="rapidFire" visible />);
    expect(screen.getByText('Rapid Fire!')).toBeInTheDocument();
    rerender(<PowerUpPopup type="mega" visible />);
    expect(screen.getByText('Power Up!')).toBeInTheDocument();
  });
});

describe('FPSCounter', () => {
  let frames;
  let now;

  beforeEach(() => {
    frames = [];
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    global.requestAnimationFrame = jest.fn((cb) => frames.push(cb));
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    global.requestAnimationFrame = jest.fn((cb) => {
      cb(0);
      return 0;
    });
  });

  const tick = (count, msEach) => {
    for (let i = 0; i < count; i++) {
      now += msEach;
      act(() => frames.shift()());
    }
  };

  it.each([
    [60, 1000 / 60, '#00ff00'],
    [40, 25, '#ffaa00'],
    [20, 50, '#ff0000'],
  ])('reports %i fps once a second has elapsed', (fps, msEach, color) => {
    render(<FPSCounter />);
    expect(screen.getByText('60')).toBeInTheDocument();
    tick(fps, msEach);
    const value = screen.getByText(String(fps));
    expect(value).toHaveStyle({ color });
  });

  it('cancels its animation frame on unmount', () => {
    const { unmount } = render(<FPSCounter />);
    unmount();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });
});
