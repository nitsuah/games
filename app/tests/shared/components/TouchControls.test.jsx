import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { HowToPlay } from '@/_components/shared/HowToPlay';
import { ShootButton } from '@/_components/shared/gamepad/ShootButton';
import { VirtualJoystick } from '@/_components/shared/gamepad/VirtualJoystick';

const setPointer = (coarse) => {
  window.matchMedia = jest.fn((query) => ({ matches: coarse && query === '(pointer: coarse)' }));
};

describe('HowToPlay on touch devices', () => {
  const props = { title: 'T', instructions: ['keys'], touchInstructions: ['tap'], onStart: () => {} };

  it.each([[true, 'tap', 'keys'], [false, 'keys', 'tap']])('coarse=%p shows %s', (coarse, shown, hidden) => {
    setPointer(coarse);
    render(<HowToPlay {...props} />);
    expect(screen.getByText(shown)).toBeInTheDocument();
    expect(screen.queryByText(hidden)).not.toBeInTheDocument();
  });
});

describe('held touch controls', () => {
  it('FIRE reports press and release', () => {
    const onHold = jest.fn();
    render(<ShootButton onHold={onHold} />);
    const button = screen.getByRole('button', { name: 'FIRE' });
    fireEvent.pointerDown(button);
    fireEvent.pointerUp(button);
    expect(onHold.mock.calls).toEqual([[true], [false]]);
  });

  it('the joystick recentres on release', () => {
    const onMove = jest.fn();
    const { container } = render(<VirtualJoystick onMove={onMove} />);
    act(() => {
      fireEvent.pointerUp(container.firstChild);
    });
    expect(onMove).toHaveBeenLastCalledWith(0, 0);
  });
});
