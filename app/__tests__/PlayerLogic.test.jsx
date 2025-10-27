import React, { createRef } from 'react';
import { render, act } from '@testing-library/react';

// Mock @react-three/fiber to provide useFrame and useThree hooks
jest.mock('@react-three/fiber', () => {
  return {
    useFrame: (cb) => {
      // expose a method to trigger the callback from the test via global
      global.__triggerUseFrame = cb;
    },
    useThree: () => ({
      camera: {
        position: { x: 1, y: 2, z: 3, toArray() { return [this.x, this.y, this.z]; } },
        quaternion: { x: 0, y: 0, z: 0, w: 1, copy() {} },
      },
    }),
  };
});

import PlayerLogic from '@/lib/fps/_comps/PlayerLogic';

describe('PlayerLogic', () => {
  beforeEach(() => {
    // ensure we start with a clean trigger
    delete global.__triggerUseFrame;
  });

  test('forwards ref and calls onPositionChange during frame', () => {
    const ref = createRef();
    const onPositionChange = jest.fn();

    render(<PlayerLogic ref={ref} onPositionChange={onPositionChange} />);

    // At this point useFrame should have registered a callback
    expect(typeof global.__triggerUseFrame).toBe('function');

    // Trigger the frame callback once (simulate one frame)
    act(() => {
      global.__triggerUseFrame();
    });

    // onPositionChange should have been called with camera position array
    expect(onPositionChange).toHaveBeenCalledTimes(1);
    expect(onPositionChange.mock.calls[0][0]).toEqual([1, 2, 3]);
  });
});
