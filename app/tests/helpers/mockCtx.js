/**
 * Minimal CanvasRenderingContext2D double for testing draw() methods.
 * Every method is a jest.fn(); every assignment to fillStyle is recorded
 * in `fillStyles` so tests can assert on colour choices in draw order.
 */
export function createMockCtx() {
  const fillStyles = [];
  const ctx = {
    fillStyles,
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    rect: jest.fn(),
    fill: jest.fn(),
    fillText: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
  };
  Object.defineProperty(ctx, 'fillStyle', {
    set: (v) => {
      fillStyles.push(v);
    },
    get: () => fillStyles[fillStyles.length - 1],
  });
  return ctx;
}
