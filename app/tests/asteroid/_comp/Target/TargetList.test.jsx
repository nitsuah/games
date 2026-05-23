import { render, screen } from '@testing-library/react';
import TargetList from '@/lib/asteroid/_comp/Target/TargetList';
import { DEFAULT_TARGET_COLOR } from '@/lib/asteroid/_comp/config';
import Target from '@/lib/asteroid/_comp/Target/Target';

jest.mock('@/lib/asteroid/_comp/Target/Target', () => {
  const React = require('react');

  return {
    __esModule: true,
    default: jest.fn((props) => React.createElement('div', {
      'data-testid': 'target',
      'data-target-id': props.targetId,
    })),
  };
});

describe('TargetList', () => {
  const handleTargetHit = jest.fn();
  const handleRefCallback = jest.fn();
  const setTargets = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders one Target per target and forwards target props', () => {
    const targets = [
      { id: 'alpha', x: 1, y: 2, z: 3, isHit: false, size: 5, vx: 4, vy: 5, vz: 6, color: '#ff0' },
      { id: 'beta', x: -1, y: -2, z: -3, isHit: true, size: 2 },
    ];

    render(
      <TargetList
        targets={targets}
        handleTargetHit={handleTargetHit}
        handleRefCallback={handleRefCallback}
        setTargets={setTargets}
        isGameOver
        isPaused
      />
    );

    expect(screen.getAllByTestId('target')).toHaveLength(2);

    const firstProps = Target.mock.calls[0][0];
    expect(firstProps).toMatchObject({
      position: [1, 2, 3],
      targetId: 'alpha',
      isHit: false,
      onHit: handleTargetHit,
      size: 5,
      velocity: { x: 4, y: 5, z: 6 },
      color: '#ff0',
      refCallback: handleRefCallback,
      setTargets,
      isGameOver: true,
      isPaused: true,
    });

    const secondProps = Target.mock.calls[1][0];
    expect(secondProps).toMatchObject({
      position: [-1, -2, -3],
      targetId: 'beta',
      isHit: true,
      onHit: handleTargetHit,
      size: 2,
      velocity: { x: 0, y: 0, z: 0 },
      color: DEFAULT_TARGET_COLOR,
      refCallback: handleRefCallback,
      setTargets,
      isGameOver: true,
      isPaused: true,
    });
  });

  it('defaults game state flags to false when omitted', () => {
    render(
      <TargetList
        targets={[{ id: 1, x: 0, y: 0, z: 0, isHit: false, size: 1 }]}
        handleTargetHit={handleTargetHit}
        handleRefCallback={handleRefCallback}
        setTargets={setTargets}
      />
    );

    expect(Target.mock.calls[0][0]).toMatchObject({
      isGameOver: false,
      isPaused: false,
    });
  });
});