import { act, fireEvent, render } from '@testing-library/react';
import * as THREE from 'three';

const mockCamera = {
  position: {
    x: 0,
    y: 0,
    z: 0,
    clone() {
      return { x: 0, y: 0, z: 0 };
    },
  },
  getWorldDirection: (vector) => vector,
};
const mockScene = { children: [] };

jest.mock('@react-three/fiber', () => ({
  useThree: () => ({ camera: mockCamera, scene: mockScene }),
}));

import ShootingHandler from '@/lib/fps/_comps/ShootingHandler';

describe('ShootingHandler', () => {
  let setBullets;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    jest
      .spyOn(THREE.Raycaster.prototype, 'intersectObjects')
      .mockReturnValue([{ point: { x: 1, y: 2, z: 3 } }]);
    setBullets = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const renderHandler = (rapidFire = false) =>
    render(<ShootingHandler setBullets={setBullets} rapidFire={rapidFire} />);

  it('fires one bullet on Space and removes it on completion', () => {
    renderHandler();
    fireEvent.keyDown(window, { code: 'Space' });

    expect(setBullets).toHaveBeenCalledTimes(1);
    const addBullet = setBullets.mock.calls[0][0];
    const [bullet] = addBullet([]);
    expect(bullet).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        start: { x: 0, y: 0, z: 0 },
        end: { x: 1, y: 2, z: 3 },
        onComplete: expect.any(Function),
      }),
    );

    bullet.onComplete();
    expect(setBullets).toHaveBeenCalledTimes(2);
    expect(setBullets.mock.calls[1][0]([bullet])).toEqual([]);
  });

  it('ignores other keys and misses', () => {
    renderHandler();
    fireEvent.keyDown(window, { code: 'Enter' });
    expect(setBullets).not.toHaveBeenCalled();

    jest
      .spyOn(THREE.Raycaster.prototype, 'intersectObjects')
      .mockReturnValueOnce([]);
    fireEvent.keyDown(window, { code: 'Space' });
    expect(setBullets).not.toHaveBeenCalled();
  });

  it('enforces the 3000ms normal-fire cooldown', () => {
    renderHandler();
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'Space' });
    expect(setBullets).toHaveBeenCalledTimes(1);

    act(() => jest.advanceTimersByTime(3000));
    fireEvent.keyDown(window, { code: 'Space' });
    expect(setBullets).toHaveBeenCalledTimes(2);
  });

  it('fires three rapid-fire bullets and uses a 1500ms cooldown', () => {
    renderHandler(true);
    fireEvent.keyDown(window, { code: 'Space' });
    expect(setBullets).toHaveBeenCalledTimes(1);

    act(() => jest.advanceTimersByTime(200));
    expect(setBullets).toHaveBeenCalledTimes(3);

    act(() => jest.advanceTimersByTime(1500));
    fireEvent.keyDown(window, { code: 'Space' });
    expect(setBullets).toHaveBeenCalledTimes(4);
  });

  it('removes the keyboard listener on unmount', () => {
    const view = renderHandler();
    view.unmount();
    fireEvent.keyDown(window, { code: 'Space' });
    expect(setBullets).not.toHaveBeenCalled();
  });
});
