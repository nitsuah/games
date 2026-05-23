import { act, renderHook } from '@testing-library/react';
import { useScreenShake } from '@/lib/shared/ui/useScreenShake';

describe('useScreenShake', () => {
  const originalRequestAnimationFrame = global.requestAnimationFrame;
  const originalCancelAnimationFrame = global.cancelAnimationFrame;
  let frameQueue;
  let nextFrameId;

  const flushNextFrame = () => {
    const frame = frameQueue.shift();
    if (!frame) {
      throw new Error('No queued animation frame to flush');
    }
    frame.callback();
  };

  const flushFrames = (count) => {
    for (let index = 0; index < count; index++) {
      flushNextFrame();
    }
  };

  beforeEach(() => {
    frameQueue = [];
    nextFrameId = 1;

    global.requestAnimationFrame = jest.fn((callback) => {
      const id = nextFrameId++;
      frameQueue.push({ id, callback });
      return id;
    });

    global.cancelAnimationFrame = jest.fn((id) => {
      frameQueue = frameQueue.filter((frame) => frame.id !== id);
    });

    jest.spyOn(Math, 'random').mockReturnValue(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('returns the default idle transform and trigger function', () => {
    const { result } = renderHook(() => useScreenShake());

    expect(result.current[0]).toEqual({
      transform: 'translate(0px, 0px)',
      transition: 'transform 0.016s ease-out',
    });
    expect(typeof result.current[1]).toBe('function');
  });

  it('disables shaking when reduce motion is enabled', () => {
    const { result } = renderHook(() => useScreenShake(true));

    act(() => {
      result.current[1](20);
    });

    expect(global.requestAnimationFrame).not.toHaveBeenCalled();
    expect(result.current[0]).toEqual({
      transform: 'none',
      transition: 'transform 0.016s ease-out',
    });
  });

  it('animates shake frames and resets back to idle', () => {
    const { result, unmount } = renderHook(() => useScreenShake());

    act(() => {
      result.current[1](8);
    });

    expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);

    act(() => {
      flushNextFrame();
    });

    expect(result.current[0].transform).toBe('translate(4px, 4px)');
    expect(global.cancelAnimationFrame).toHaveBeenCalled();

    act(() => {
      flushFrames(16);
    });

    expect(result.current[0]).toEqual({
      transform: 'translate(0px, 0px)',
      transition: 'transform 0.016s ease-out',
    });

    unmount();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });
});