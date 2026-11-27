import { createCanvasTouchTracker } from '../../lib/tank/touchAim';

describe('createCanvasTouchTracker', () => {
  const touch = (identifier, clientX, clientY) => ({
    identifier,
    clientX,
    clientY,
  });

  it('keeps aiming on the canvas contact while another finger holds the joystick', () => {
    const tracker = createCanvasTouchTracker();
    const canvasTouch = touch(2, 220, 140);
    const joystickTouch = touch(1, 40, 520);

    expect(
      tracker.start({
        changedTouches: [canvasTouch],
      }),
    ).toBe(canvasTouch);

    expect(
      tracker.move({
        touches: [joystickTouch, touch(2, 250, 160)],
      }),
    ).toEqual(touch(2, 250, 160));
  });

  it('switches to another canvas contact when the active one ends', () => {
    const tracker = createCanvasTouchTracker();
    tracker.start({ changedTouches: [touch(2, 220, 140)] });

    const nextCanvasTouch = touch(3, 300, 180);
    expect(
      tracker.end({
        changedTouches: [touch(2, 250, 160)],
        targetTouches: [nextCanvasTouch],
      }),
    ).toBe(nextCanvasTouch);

    expect(
      tracker.move({
        touches: [touch(1, 40, 520), touch(3, 320, 190)],
      }),
    ).toEqual(touch(3, 320, 190));
  });

  it('ignores non-canvas contacts and returns null after the canvas contact ends', () => {
    const tracker = createCanvasTouchTracker();
    expect(tracker.move({ touches: [touch(1, 40, 520)] })).toBeNull();

    tracker.start({ changedTouches: [touch(2, 220, 140)] });
    tracker.end({
      changedTouches: [touch(2, 220, 140)],
      targetTouches: [],
    });

    expect(tracker.move({ touches: [touch(1, 40, 520)] })).toBeNull();
  });
});
