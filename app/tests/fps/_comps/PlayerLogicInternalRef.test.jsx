import React from 'react';
import { render, act } from '@testing-library/react';

jest.mock('@react-three/fiber', () => {
  return {
    useFrame: (cb) => {
      global.__triggerUseFrame = cb;
    },
    useThree: () => ({
      camera: {
        position: { x: 4, y: 5, z: 6, toArray() { return [this.x, this.y, this.z]; } },
        quaternion: { x: 0, y: 0, z: 0, w: 1, copy() {} },
      },
    }),
  };
});

import PlayerLogic from '@/lib/fps/_comps/PlayerLogic';

test('uses internal ref if none provided and notifies position', () => {
  const onPositionChange = jest.fn();
  const ref = React.createRef();
  ref.current = { position: { copy: jest.fn().mockReturnThis(), add: jest.fn() }, quaternion: { copy: jest.fn() } };

  render(<PlayerLogic ref={ref} onPositionChange={onPositionChange} />);

  // Set internal ref object now that render completed
  ref.current = { position: { copy: jest.fn().mockReturnThis(), add: jest.fn() }, quaternion: { copy: jest.fn() } };

  expect(typeof global.__triggerUseFrame).toBe('function');

  act(() => {
    global.__triggerUseFrame();
  });

  expect(onPositionChange).toHaveBeenCalledTimes(1);
  expect(onPositionChange.mock.calls[0][0]).toEqual([4, 5, 6]);
});
