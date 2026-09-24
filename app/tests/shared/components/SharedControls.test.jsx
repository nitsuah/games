import { render, screen, fireEvent, act } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/router', () => ({ useRouter: () => ({ push: mockPush }) }));

import { GameControls } from '@/_components/shared/GameControls';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { OrientationLock } from '@/_components/shared/OrientationLock';
import { ShootButton } from '@/_components/shared/gamepad/ShootButton';
import { VirtualJoystick } from '@/_components/shared/gamepad/VirtualJoystick';

beforeEach(() => jest.clearAllMocks());

describe('GameControls', () => {
  it('shows only a pause button while playing', () => {
    const onPause = jest.fn();
    render(<GameControls onPause={onPause} onRestart={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause Game' }));
    expect(onPause).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument();
  });

  it('shows resume / restart / home while paused', () => {
    const onPause = jest.fn();
    const onRestart = jest.fn();
    render(<GameControls paused onPause={onPause} onRestart={onRestart} />);
    expect(screen.queryByRole('button', { name: 'Pause Game' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(onPause).toHaveBeenCalled();
    expect(onRestart).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

describe('HowToPlay', () => {
  const renderDialog = (onStart = jest.fn(), extra = null) =>
    render(
      <>
        <HowToPlay title="SNAKE" instructions={['Eat food', 'Avoid walls']} onStart={onStart} />
        {extra}
      </>
    );

  it('renders an accessible modal with instructions and focuses the start button', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog', { name: 'HOW TO PLAY: SNAKE' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Eat food', 'Avoid walls']);
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('starts the game', () => {
    const onStart = jest.fn();
    renderDialog(onStart);
    fireEvent.click(screen.getByRole('button'));
    expect(onStart).toHaveBeenCalled();
  });

  it('traps Tab and Shift+Tab focus inside the dialog', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog');
    const btn = screen.getByRole('button');

    const tab = fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(tab).toBe(false); // default prevented: wrapped to first
    expect(btn).toHaveFocus();

    const shiftTab = fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(shiftTab).toBe(false);
    expect(btn).toHaveFocus();
  });

  it('lets Tab through when focus is not on a boundary element, and ignores other keys', () => {
    renderDialog();
    const dialog = screen.getByRole('dialog');
    screen.getByRole('button').blur();
    expect(fireEvent.keyDown(dialog, { key: 'Tab' })).toBe(true);
    expect(fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })).toBe(true);
    expect(fireEvent.keyDown(dialog, { key: 'Enter' })).toBe(true);
  });

  it('highlights the button on hover', () => {
    renderDialog();
    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    expect(btn.style.background).toBe('rgba(0, 255, 255, 0.25)');
    fireEvent.mouseLeave(btn);
    expect(btn.style.background).toBe('rgba(0, 255, 255, 0.12)');
  });

  it('stops trapping focus after unmount', () => {
    const { unmount } = renderDialog();
    const dialog = screen.getByRole('dialog');
    const remove = jest.spyOn(dialog, 'removeEventListener');
    unmount();
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('OrientationLock', () => {
  const setViewport = (width, height) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
  };

  afterEach(() => setViewport(1024, 768));

  it('renders nothing in landscape', () => {
    setViewport(1024, 768);
    const { container } = render(<OrientationLock />);
    expect(container).toBeEmptyDOMElement();
  });

  it('asks to rotate in portrait and reacts to resizes', () => {
    setViewport(375, 812);
    render(<OrientationLock />);
    expect(screen.getByText(/rotate your device/)).toBeInTheDocument();
    setViewport(812, 375);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.queryByText(/rotate your device/)).not.toBeInTheDocument();
  });

  it('treats a square viewport as landscape', () => {
    setViewport(500, 500);
    expect(render(<OrientationLock />).container).toBeEmptyDOMElement();
  });

  it('removes its resize listener on unmount', () => {
    const remove = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<OrientationLock />);
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
    remove.mockRestore();
  });
});

describe('ShootButton', () => {
  it('fires on click', () => {
    const onShoot = jest.fn();
    render(<ShootButton onShoot={onShoot} />);
    fireEvent.click(screen.getByRole('button', { name: 'FIRE' }));
    expect(onShoot).toHaveBeenCalledTimes(1);
  });
});

describe('VirtualJoystick', () => {
  const setup = () => {
    const onMove = jest.fn();
    const { container } = render(<VirtualJoystick onMove={onMove} />);
    const pad = container.firstChild;
    pad.getBoundingClientRect = () => ({ left: 100, top: 200, width: 120, height: 120 });
    return { onMove, pad };
  };

  // jsdom lacks PointerEvent, so build a MouseEvent carrying the pointer type.
  const pointer = (el, type, clientX, clientY) =>
    act(() => {
      el.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX, clientY }));
    });

  it('reports the centre as (0, 0) on press', () => {
    const { onMove, pad } = setup();
    pointer(pad, 'pointerdown', 160, 260);
    expect(onMove).toHaveBeenCalledWith(0, 0);
  });

  it('normalises drag positions to [-1, 1] on each axis', () => {
    const { onMove, pad } = setup();
    pointer(pad, 'pointermove', 220, 200); // right edge, top edge
    expect(onMove).toHaveBeenLastCalledWith(1, -1);
    pointer(pad, 'pointermove', 100, 290); // left edge, halfway down
    expect(onMove).toHaveBeenLastCalledWith(-1, 0.5);
  });
});
