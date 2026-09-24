import { Profiler } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';

jest.mock('@/utils/audio/SoundManager', () => ({
  __esModule: true,
  default: { playKillStreak: jest.fn(), playWaveClear: jest.fn() },
}));

import soundManager from '@/utils/audio/SoundManager';
import FlashOverlays from '@/lib/asteroid/_comp/UI/FlashOverlays';
import MuzzleFlashOverlay from '@/lib/asteroid/_comp/UI/MuzzleFlashOverlay';
import OnboardingOverlay from '@/lib/asteroid/_comp/UI/OnboardingOverlay';
import SlowMotionOverlay from '@/lib/asteroid/_comp/UI/SlowMotionOverlay';
import KillStreakAnnouncement from '@/lib/asteroid/_comp/UI/KillStreakAnnouncement';
import ProximityWarning from '@/lib/asteroid/_comp/UI/ProximityWarning';
import WaveIndicator from '@/lib/asteroid/_comp/UI/WaveIndicator';
import WaveTransition from '@/lib/asteroid/_comp/UI/WaveTransition';
import DebugMenu from '@/lib/asteroid/_comp/UI/DebugMenu';

const flushDynamicImports = () => act(async () => {
  await Promise.resolve();
  await Promise.resolve();
});

beforeEach(() => jest.clearAllMocks());

describe('FlashOverlays', () => {
  it('renders one overlay per queued flash with a known or default colour', () => {
    const { container } = render(
      <FlashOverlays
        flashQueue={[
          { id: 1, type: 'red' },
          { id: 2, type: 'unknown' },
        ]}
      />
    );
    const [red, other] = container.children;
    expect(container.children).toHaveLength(2);
    expect(red).toHaveStyle({ background: 'rgba(255,0,0,0.3)' });
    expect(other).toHaveStyle({ background: 'rgba(255,255,255,0.3)' });
  });

  it('tolerates a missing or null queue', () => {
    expect(render(<FlashOverlays />).container).toBeEmptyDOMElement();
    expect(render(<FlashOverlays flashQueue={null} />).container).toBeEmptyDOMElement();
  });
});

describe('MuzzleFlashOverlay', () => {
  it('renders nothing when inactive', () => {
    expect(render(<MuzzleFlashOverlay active={false} weapon="plasma" />).container).toBeEmptyDOMElement();
  });

  it.each([
    ['explosive', 'rgba(255, 150, 0, 0.3)'],
    ['plasma', 'rgba(255, 0, 255, 0.5)'],
    ['aa', 'rgba(255, 255, 100, 0.25)'],
    ['laser', 'rgba(255, 255, 255, 0.2)'],
  ])('%s flashes with %s', (weapon, rgba) => {
    const { container } = render(<MuzzleFlashOverlay active weapon={weapon} />);
    expect(container.firstChild.getAttribute('style')).toContain(rgba);
  });
});

describe('OnboardingOverlay', () => {
  it('starts the game from the button', () => {
    const onStart = jest.fn();
    render(<OnboardingOverlay onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));
    expect(onStart).toHaveBeenCalled();
  });
});

describe('SlowMotionOverlay', () => {
  it('only renders while active', () => {
    expect(render(<SlowMotionOverlay active={false} />).container).toBeEmptyDOMElement();
    const { container } = render(<SlowMotionOverlay active />);
    expect(container.querySelector('.vignette')).toBeInTheDocument();
  });
});

describe('KillStreakAnnouncement', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders nothing below a 10x combo', () => {
    expect(render(<KillStreakAnnouncement combo={9} />).container).toBeEmptyDOMElement();
    expect(soundManager.playKillStreak).not.toHaveBeenCalled();
  });

  it.each([
    [10, 'KILLING SPREE!'],
    [15, 'DOMINATING!'],
    [20, 'RAMPAGE!'],
    [25, 'LEGENDARY!'],
    [30, 'UNSTOPPABLE!'],
  ])('%ix shows %s', (combo, message) => {
    render(<KillStreakAnnouncement combo={combo} />);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText(`${combo}x COMBO`)).toBeInTheDocument();
  });

  it('plays the streak sound and auto-dismisses after 2s', async () => {
    const onComplete = jest.fn();
    render(<KillStreakAnnouncement combo={20} onComplete={onComplete} />);
    await flushDynamicImports();
    expect(soundManager.playKillStreak).toHaveBeenCalledWith(20);
    act(() => jest.advanceTimersByTime(1999));
    expect(onComplete).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onComplete).toHaveBeenCalled();
  });

  it('does not require onComplete and cancels its timer on unmount', () => {
    const onComplete = jest.fn();
    const { unmount } = render(<KillStreakAnnouncement combo={10} />);
    expect(() => act(() => jest.advanceTimersByTime(2000))).not.toThrow();
    const second = render(<KillStreakAnnouncement combo={10} onComplete={onComplete} />);
    second.unmount();
    unmount();
    act(() => jest.advanceTimersByTime(5000));
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('ProximityWarning', () => {
  const t = (id, x, y = 0, z = 0, isHit = false) => ({ id, x, y, z, isHit });

  it('renders nothing with no targets', () => {
    expect(render(<ProximityWarning targets={[]} />).container).toBeEmptyDOMElement();
    expect(render(<ProximityWarning targets={null} />).container).toBeEmptyDOMElement();
  });

  it('ignores distant and destroyed targets', () => {
    const { container } = render(<ProximityWarning targets={[t(1, 20), t(2, 3, 0, 0, true)]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows directional indicators, closest first, without an alert when not critical', () => {
    const { container } = render(<ProximityWarning targets={[t('far', 12), t('near', 0, 10)]} />);
    const indicators = container.querySelectorAll('.indicator');
    expect(indicators).toHaveLength(2);
    expect(indicators[0].style.transform).toBe('rotate(90deg)'); // 'near' is straight up
    expect(indicators[1].style.transform).toBe('rotate(0deg)');
    expect(screen.queryByText('PROXIMITY ALERT')).not.toBeInTheDocument();
  });

  it('raises a critical alert inside 8 units, relative to the player', () => {
    const { container } = render(<ProximityWarning targets={[t(1, 105, 0, 0)]} playerPosition={[100, 0, 0]} />);
    expect(container.querySelector('.indicator')).toHaveClass('critical');
    expect(screen.getByText('PROXIMITY ALERT')).toBeInTheDocument();
  });

  it('does not re-render endlessly when using the default player position', () => {
    // Profiler counts every commit in its subtree, including ones caused by
    // state updates inside ProximityWarning itself (where the old loop lived).
    // Throwing past a small cap turns a would-be hang into a fast failure.
    const onRender = jest.fn(() => {
      if (onRender.mock.calls.length > 10) throw new Error('ProximityWarning render loop');
    });
    const targets = [t(1, 3)];
    const tree = () => (
      <Profiler id="pw" onRender={onRender}>
        <ProximityWarning targets={targets} />
      </Profiler>
    );
    const { rerender } = render(tree());
    rerender(tree());
    expect(onRender).toHaveBeenCalledTimes(2); // one mount + one parent re-render
    expect(screen.getByText('PROXIMITY ALERT')).toBeInTheDocument();
  });

  it('caps indicators at 6', () => {
    const many = Array.from({ length: 10 }, (_, i) => t(i, 1 + i));
    const { container } = render(<ProximityWarning targets={many} />);
    expect(container.querySelectorAll('.indicator')).toHaveLength(6);
  });

  it('clears indicators when targets go away', () => {
    const { container, rerender } = render(<ProximityWarning targets={[t(1, 3)]} />);
    expect(container.querySelectorAll('.indicator')).toHaveLength(1);
    rerender(<ProximityWarning targets={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('WaveIndicator', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the current wave and best wave only when above 1', () => {
    const { rerender } = render(<WaveIndicator wave={2} highestWave={1} />);
    expect(screen.getByText('Wave 2')).toBeInTheDocument();
    expect(screen.queryByText(/Best/)).not.toBeInTheDocument();
    rerender(<WaveIndicator wave={2} highestWave={5} />);
    expect(screen.getByText('Best: 5')).toBeInTheDocument();
  });

  it('counts down 3-2-1-GO! during a transition', () => {
    render(<WaveIndicator wave={2} showTransition highestWave={2} />);
    expect(screen.getByText('Wave 3')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(666));
    expect(screen.getByText('2')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(667));
    expect(screen.getByText('1')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(667));
    expect(screen.getByText('GO!')).toBeInTheDocument();
  });

  it('hides the overlay and resets when the transition ends early', () => {
    const { rerender } = render(<WaveIndicator wave={2} showTransition />);
    rerender(<WaveIndicator wave={2} showTransition={false} />);
    expect(screen.queryByText('Wave 3')).not.toBeInTheDocument();
    act(() => jest.advanceTimersByTime(3000)); // cleared timers must not fire
    expect(screen.queryByText('GO!')).not.toBeInTheDocument();
  });
});

describe('WaveTransition', () => {
  it.each([
    [95, '🌟 PERFECT!'],
    [80, '⭐ EXCELLENT!'],
    [65, '✓ GOOD'],
    [10, '✓ COMPLETE'],
  ])('%i%% accuracy rates %s', (accuracy, rating) => {
    render(<WaveTransition accuracy={accuracy} />);
    expect(screen.getByText(rating)).toBeInTheDocument();
  });

  it('shows stats, the next wave and plays a performance-scaled sound', async () => {
    const { container } = render(<WaveTransition wave={3} score={1200} highScore={900} accuracy={85} />);
    expect(screen.getByText('WAVE 3 COMPLETE!')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
    expect(screen.getByText('High Score:')).toBeInTheDocument();
    expect(screen.getByText('Prepare for Wave 4...')).toBeInTheDocument();
    expect(container.querySelector('.container')).toHaveClass('perfect');
    await flushDynamicImports();
    expect(soundManager.playWaveClear).toHaveBeenCalledWith(0.85);
  });

  it('celebrates a new high score and handles missing accuracy', async () => {
    const { container } = render(<WaveTransition isNewHighScore highScore={5000} accuracy={null} />);
    expect(screen.getByText('🏆 NEW HIGH SCORE!')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(container.querySelector('.container')).not.toHaveClass('perfect');
    await flushDynamicImports();
    expect(soundManager.playWaveClear).toHaveBeenCalledWith(0);
  });

  it('caps the performance factor at 1', async () => {
    render(<WaveTransition accuracy={250} />);
    await flushDynamicImports();
    expect(soundManager.playWaveClear).toHaveBeenCalledWith(1);
  });
});

describe('DebugMenu', () => {
  beforeEach(() => localStorage.clear());

  it('toggles open and closed', () => {
    render(<DebugMenu trailQuality="low" setTrailQuality={jest.fn()} />);
    const toggle = screen.getByRole('button', { name: 'Toggle debug menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Trail quality low' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(toggle);
    expect(screen.queryByText('Debug Controls')).not.toBeInTheDocument();
  });

  it('sets and persists the trail quality', () => {
    const setTrailQuality = jest.fn();
    render(<DebugMenu trailQuality="low" setTrailQuality={setTrailQuality} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle debug menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trail quality high' }));
    expect(setTrailQuality).toHaveBeenCalledWith('high');
    expect(localStorage.getItem('trailQuality')).toBe('high');
    fireEvent.click(screen.getByRole('button', { name: 'Trail quality off' }));
    expect(setTrailQuality).toHaveBeenLastCalledWith('off');
  });

  it('still updates state when storage is unavailable', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setTrailQuality = jest.fn();
    render(<DebugMenu trailQuality="off" setTrailQuality={setTrailQuality} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle debug menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Trail quality low' }));
    expect(setTrailQuality).toHaveBeenCalledWith('low');
    jest.restoreAllMocks();
  });
});
