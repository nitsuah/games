/**
 * @jest-environment jsdom
 */

import mouseManager from '@/lib/shared/input/MouseManager';

// Helper to create a fresh MouseManager instance per test
function makeManager() {
  const MM = mouseManager.constructor;
  return new MM();
}

// Helper to build a fake MouseEvent with relevant fields
// Note: jsdom does not populate movementX/Y from MouseEvent init options;
// use dispatchFakeMove() instead when movement delta matters.
function fakeMouseEvent(type, overrides = {}) {
  const { movementX: _mx, movementY: _my, ...rest } = overrides;
  return new MouseEvent(type, {
    clientX: 400,
    clientY: 300,
    button: 0,
    bubbles: true,
    ...rest,
  });
}

// Dispatch a mousemove event and manually inject movementX/Y since jsdom
// does not support these properties from MouseEventInit.
function dispatchMoveWithDelta(mm_instance, movementX, movementY, clientX = 400, clientY = 300) {
  mm_instance.handleMouseMove({
    clientX,
    clientY,
    movementX,
    movementY,
  });
}

describe('MouseManager', () => {
  let mm;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mm = makeManager();
    // Set up predictable window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });
    // Ensure document.exitPointerLock is always available
    if (!document.exitPointerLock) {
      document.exitPointerLock = jest.fn();
    }
    // Ensure pointerLockElement starts as null
    Object.defineProperty(document, 'pointerLockElement', {
      writable: true,
      configurable: true,
      value: null,
    });
  });

  afterEach(() => {
    mm.cleanup();
    process.env.NODE_ENV = originalNodeEnv;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  // ─── Constructor ──────────────────────────────────────────────────────────
  describe('constructor', () => {
    it('starts not initialized', () => expect(mm.initialized).toBe(false));
    it('starts enabled', () => expect(mm.enabled).toBe(true));
    it('defaults sensitivity to 1.0', () => expect(mm.sensitivity).toBe(1.0));
    it('starts with position { x:0, y:0 }', () => expect(mm.position).toEqual({ x: 0, y: 0 }));
    it('starts with normalizedPosition { x:0, y:0 }', () =>
      expect(mm.normalizedPosition).toEqual({ x: 0, y: 0 }));
    it('starts with movement { x:0, y:0 }', () => expect(mm.movement).toEqual({ x: 0, y: 0 }));
    it('starts with pointerLocked false', () => expect(mm.pointerLocked).toBe(false));
  });

  // ─── initialize() ─────────────────────────────────────────────────────────
  describe('initialize()', () => {
    it('sets initialized to true', () => {
      mm.initialize();
      expect(mm.initialized).toBe(true);
    });

    it('is idempotent', () => {
      mm.initialize();
      mm.initialize();
      expect(mm.initialized).toBe(true);
    });

    it('logs initialization in development mode', () => {
      process.env.NODE_ENV = 'development';
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      mm.initialize();

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });

  // ─── requestPointerLock() ────────────────────────────────────────────────
  describe('requestPointerLock()', () => {
    it('initializes and requests pointer lock successfully', async () => {
      const requestPointerLock = jest.fn().mockResolvedValue(undefined);
      const element = { requestPointerLock };

      await mm.requestPointerLock(element);

      expect(mm.initialized).toBe(true);
      expect(requestPointerLock).toHaveBeenCalled();
    });

    it('logs pointer lock request in development mode', async () => {
      process.env.NODE_ENV = 'development';
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const requestPointerLock = jest.fn().mockResolvedValue(undefined);

      await mm.requestPointerLock({ requestPointerLock });

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('logs an error when pointer lock request fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const requestPointerLock = jest.fn().mockRejectedValue(new Error('Pointer lock denied'));

      await mm.requestPointerLock({ requestPointerLock });

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  // ─── handleMouseDown / handleMouseUp ──────────────────────────────────────
  describe('button state (mousedown / mouseup)', () => {
    beforeEach(() => mm.initialize());

    it('marks button as pressed on mousedown', () => {
      window.dispatchEvent(fakeMouseEvent('mousedown', { button: 0 }));
      expect(mm.isButtonPressed(0)).toBe(true);
    });

    it('marks button as released on mouseup', () => {
      window.dispatchEvent(fakeMouseEvent('mousedown', { button: 0 }));
      window.dispatchEvent(fakeMouseEvent('mouseup', { button: 0 }));
      expect(mm.isButtonPressed(0)).toBe(false);
    });

    it('tracks right-click (button 2) independently', () => {
      window.dispatchEvent(fakeMouseEvent('mousedown', { button: 2 }));
      expect(mm.isButtonPressed(2)).toBe(true);
      expect(mm.isButtonPressed(0)).toBe(false);
    });

    it('returns false for un-pressed button', () => {
      expect(mm.isButtonPressed(0)).toBe(false);
    });

    it('ignores events when disabled', () => {
      mm.setEnabled(false);
      window.dispatchEvent(fakeMouseEvent('mousedown', { button: 0 }));
      expect(mm.isButtonPressed(0)).toBe(false);
    });
  });

  // ─── handleMouseMove ──────────────────────────────────────────────────────
  describe('handleMouseMove', () => {
    beforeEach(() => mm.initialize());

    it('updates absolute position', () => {
      window.dispatchEvent(fakeMouseEvent('mousemove', { clientX: 200, clientY: 150 }));
      expect(mm.getPosition()).toEqual({ x: 200, y: 150 });
    });

    it('calculates normalised position correctly', () => {
      // clientX=400 → (400/800)*2 -1 = 0
      // clientY=300 → -(300/600)*2 +1 = 0
      window.dispatchEvent(fakeMouseEvent('mousemove', { clientX: 400, clientY: 300 }));
      expect(mm.getNormalizedPosition().x).toBeCloseTo(0);
      expect(mm.getNormalizedPosition().y).toBeCloseTo(0);
    });

    it('normalised x is -1 at left edge', () => {
      window.dispatchEvent(fakeMouseEvent('mousemove', { clientX: 0, clientY: 300 }));
      expect(mm.getNormalizedPosition().x).toBeCloseTo(-1);
    });

    it('normalised x is +1 at right edge', () => {
      window.dispatchEvent(fakeMouseEvent('mousemove', { clientX: 800, clientY: 300 }));
      expect(mm.getNormalizedPosition().x).toBeCloseTo(1);
    });

    it('does not update movement when pointer is not locked', () => {
      mm.initialize();
      // Call handleMouseMove directly so movementX/Y are well-defined
      dispatchMoveWithDelta(mm, 50, 50);
      expect(mm.getMovement()).toEqual({ x: 0, y: 0 });
    });

    it('updates movement delta when pointer is locked', () => {
      mm.initialize();
      mm.pointerLocked = true;
      mm.sensitivity = 1.0;
      dispatchMoveWithDelta(mm, 10, -5);
      expect(mm.getMovement()).toEqual({ x: 10, y: -5 });
    });

    it('scales movement by sensitivity', () => {
      mm.initialize();
      mm.pointerLocked = true;
      mm.sensitivity = 2.0;
      dispatchMoveWithDelta(mm, 5, 5);
      expect(mm.getMovement()).toEqual({ x: 10, y: 10 });
    });

    it('calls registered move callbacks', () => {
      const cb = jest.fn();
      mm.onMouseMove(cb);
      window.dispatchEvent(fakeMouseEvent('mousemove', { clientX: 100, clientY: 50 }));
      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({
          position: { x: 100, y: 50 },
        })
      );
    });

    it('ignores move events when disabled', () => {
      mm.setEnabled(false);
      window.dispatchEvent(fakeMouseEvent('mousemove', { clientX: 999, clientY: 999 }));
      expect(mm.getPosition()).toEqual({ x: 0, y: 0 });
    });
  });

  // ─── handleClick ──────────────────────────────────────────────────────────
  describe('handleClick / onMouseClick', () => {
    beforeEach(() => mm.initialize());

    it('calls registered click callbacks', () => {
      const cb = jest.fn();
      mm.onMouseClick(cb);
      window.dispatchEvent(fakeMouseEvent('click', { clientX: 50, clientY: 60, button: 0 }));
      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({
          button: 0,
          position: { x: 50, y: 60 },
        })
      );
    });

    it('does not call callbacks when disabled', () => {
      const cb = jest.fn();
      mm.onMouseClick(cb);
      mm.setEnabled(false);
      window.dispatchEvent(fakeMouseEvent('click'));
      expect(cb).not.toHaveBeenCalled();
    });
  });

  // ─── removeClickCallback / removeMoveCallback ─────────────────────────────
  describe('removeClickCallback()', () => {
    beforeEach(() => mm.initialize());

    it('removes the specified click callback', () => {
      const cb = jest.fn();
      mm.onMouseClick(cb);
      mm.removeClickCallback(cb);
      window.dispatchEvent(fakeMouseEvent('click'));
      expect(cb).not.toHaveBeenCalled();
    });

    it('is safe to remove a callback not in the list', () => {
      expect(() => mm.removeClickCallback(jest.fn())).not.toThrow();
    });
  });

  describe('removeMoveCallback()', () => {
    beforeEach(() => mm.initialize());

    it('removes the specified move callback', () => {
      const cb = jest.fn();
      mm.onMouseMove(cb);
      mm.removeMoveCallback(cb);
      window.dispatchEvent(fakeMouseEvent('mousemove'));
      expect(cb).not.toHaveBeenCalled();
    });
  });

  // ─── clearCallbacks() ─────────────────────────────────────────────────────
  describe('clearCallbacks()', () => {
    it('removes all click and move callbacks', () => {
      const click = jest.fn();
      const move = jest.fn();
      mm.onMouseClick(click);
      mm.onMouseMove(move);
      mm.clearCallbacks();
      mm.initialize();
      window.dispatchEvent(fakeMouseEvent('click'));
      window.dispatchEvent(fakeMouseEvent('mousemove'));
      expect(click).not.toHaveBeenCalled();
      expect(move).not.toHaveBeenCalled();
    });
  });

  // ─── setSensitivity() ─────────────────────────────────────────────────────
  describe('setSensitivity()', () => {
    it('sets sensitivity within bounds', () => {
      mm.setSensitivity(3.5);
      expect(mm.sensitivity).toBe(3.5);
    });

    it('clamps below 0.1 to 0.1', () => {
      mm.setSensitivity(0.0);
      expect(mm.sensitivity).toBe(0.1);
    });

    it('clamps above 10 to 10', () => {
      mm.setSensitivity(99);
      expect(mm.sensitivity).toBe(10);
    });
  });

  // ─── setEnabled() ─────────────────────────────────────────────────────────
  describe('setEnabled()', () => {
    beforeEach(() => mm.initialize());

    it('clears button states when disabled', () => {
      window.dispatchEvent(fakeMouseEvent('mousedown', { button: 0 }));
      mm.setEnabled(false);
      expect(mm.isButtonPressed(0)).toBe(false);
    });

    it('resets movement when disabled', () => {
      mm.pointerLocked = true;
      window.dispatchEvent(fakeMouseEvent('mousemove', { movementX: 10, movementY: 10 }));
      mm.setEnabled(false);
      expect(mm.getMovement()).toEqual({ x: 0, y: 0 });
    });
  });

  // ─── reset() ──────────────────────────────────────────────────────────────
  describe('reset()', () => {
    beforeEach(() => mm.initialize());

    it('clears buttons and movement', () => {
      window.dispatchEvent(fakeMouseEvent('mousedown', { button: 0 }));
      mm.pointerLocked = true;
      window.dispatchEvent(fakeMouseEvent('mousemove', { movementX: 5, movementY: 5 }));
      mm.reset();
      expect(mm.isButtonPressed(0)).toBe(false);
      expect(mm.getMovement()).toEqual({ x: 0, y: 0 });
    });
  });

  // ─── handlePointerLockChange ──────────────────────────────────────────────
  describe('handlePointerLockChange()', () => {
    beforeEach(() => {
      mm.initialize();
      document.exitPointerLock = jest.fn();
    });

    it('sets pointerLocked to true when pointer lock element exists', () => {
      Object.defineProperty(document, 'pointerLockElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });
      document.dispatchEvent(new Event('pointerlockchange'));
      expect(mm.isPointerLocked()).toBe(true);
      // Reset so afterEach cleanup doesn't call exitPointerLock on a locked element
      Object.defineProperty(document, 'pointerLockElement', {
        writable: true,
        configurable: true,
        value: null,
      });
    });

    it('sets pointerLocked to false when pointer lock element is null', () => {
      mm.pointerLocked = true;
      Object.defineProperty(document, 'pointerLockElement', {
        writable: true,
        configurable: true,
        value: null,
      });
      document.dispatchEvent(new Event('pointerlockchange'));
      expect(mm.isPointerLocked()).toBe(false);
    });
  });

  // ─── exitPointerLock() ────────────────────────────────────────────────────
  describe('exitPointerLock()', () => {
    it('calls document.exitPointerLock when pointer is locked', () => {
      Object.defineProperty(document, 'pointerLockElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });
      document.exitPointerLock = jest.fn();
      mm.exitPointerLock();
      expect(document.exitPointerLock).toHaveBeenCalled();
    });

    it('logs pointer lock exit in development mode', () => {
      process.env.NODE_ENV = 'development';
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      Object.defineProperty(document, 'pointerLockElement', {
        writable: true,
        configurable: true,
        value: document.body,
      });
      document.exitPointerLock = jest.fn();

      mm.exitPointerLock();

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });

    it('does not throw when pointer is not locked', () => {
      Object.defineProperty(document, 'pointerLockElement', {
        writable: true,
        configurable: true,
        value: null,
      });
      expect(() => mm.exitPointerLock()).not.toThrow();
    });
  });

  // ─── cleanup() ────────────────────────────────────────────────────────────
  describe('cleanup()', () => {
    it('stops responding to mouse events after cleanup', () => {
      mm.initialize();
      const cb = jest.fn();
      mm.onMouseClick(cb);
      mm.cleanup();
      window.dispatchEvent(fakeMouseEvent('click'));
      expect(cb).not.toHaveBeenCalled();
    });

    it('sets initialized to false', () => {
      mm.initialize();
      mm.cleanup();
      expect(mm.initialized).toBe(false);
    });

    it('is safe to call when not initialized', () => {
      expect(() => mm.cleanup()).not.toThrow();
    });

    it('logs cleanup in development mode', () => {
      process.env.NODE_ENV = 'development';
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      mm.initialize();
      mm.cleanup();

      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });

  // ─── getters return copies ────────────────────────────────────────────────
  describe('getters return independent copies', () => {
    beforeEach(() => mm.initialize());

    it('getPosition returns a copy (mutation safe)', () => {
      const pos = mm.getPosition();
      pos.x = 9999;
      expect(mm.getPosition().x).toBe(0);
    });

    it('getNormalizedPosition returns a copy', () => {
      const norm = mm.getNormalizedPosition();
      norm.x = 9999;
      expect(mm.getNormalizedPosition().x).toBe(0);
    });

    it('getMovement returns a copy', () => {
      const mov = mm.getMovement();
      mov.x = 9999;
      expect(mm.getMovement().x).toBe(0);
    });
  });
});
