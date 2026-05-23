/**
 * @jest-environment jsdom
 */

// KeyboardManager exports a singleton; re-import a fresh class instance each test
// by importing the module and accessing the underlying class via the singleton prototype.
import keyboardManager from '@/lib/shared/input/KeyboardManager';

// Helper to grab a fresh KeyboardManager instance for isolation
function makeManager() {
  // Access the constructor via the singleton's prototype chain
  const KBM = keyboardManager.constructor;
  return new KBM();
}

describe('KeyboardManager', () => {
  let km;

  beforeEach(() => {
    km = makeManager();
    // Ensure window event listeners are cleaned up between tests
    if (km.initialized) km.cleanup();
  });

  afterEach(() => {
    km.cleanup();
  });

  // ─── Constructor ──────────────────────────────────────────────────────────
  describe('constructor', () => {
    it('starts not initialized', () => {
      expect(km.initialized).toBe(false);
    });

    it('starts enabled', () => {
      expect(km.enabled).toBe(true);
    });

    it('has empty keys and bindings maps', () => {
      expect(km.keys.size).toBe(0);
      expect(km.bindings.size).toBe(0);
    });
  });

  // ─── initialize() ─────────────────────────────────────────────────────────
  describe('initialize()', () => {
    it('sets initialized to true', () => {
      km.initialize();
      expect(km.initialized).toBe(true);
    });

    it('is idempotent – calling twice does not double-bind listeners', () => {
      km.initialize();
      km.initialize();
      expect(km.initialized).toBe(true);
      // Verify by checking no duplicate events fire
      const cb = jest.fn();
      km.bindKey('a', cb);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });

  // ─── bindKey() / handleKeyDown ────────────────────────────────────────────
  describe('bindKey()', () => {
    it('triggers callback when matching key is pressed', () => {
      const cb = jest.fn();
      km.bindKey('w', cb);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('is case-insensitive (key is lowercased)', () => {
      const cb = jest.fn();
      km.bindKey('W', cb);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('passes the original event to the callback', () => {
      const cb = jest.fn();
      km.bindKey('space', cb);
      const event = new KeyboardEvent('keydown', { key: 'space' });
      window.dispatchEvent(event);
      expect(cb).toHaveBeenCalledWith(event);
    });

    it('overwrites an existing binding for the same key', () => {
      const first = jest.fn();
      const second = jest.fn();
      km.bindKey('x', first);
      km.bindKey('x', second);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });
  });

  // ─── bindKeys() ───────────────────────────────────────────────────────────
  describe('bindKeys()', () => {
    it('binds multiple keys at once', () => {
      const cbA = jest.fn();
      const cbB = jest.fn();
      km.bindKeys({ a: cbA, b: cbB });
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      expect(cbA).toHaveBeenCalledTimes(1);
      expect(cbB).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Wildcard binding ─────────────────────────────────────────────────────
  describe('wildcard binding (*)', () => {
    it('fires for every key press', () => {
      const cb = jest.fn();
      km.bindKey('*', cb);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(cb).toHaveBeenCalledTimes(2);
    });

    it('passes (event, key) to the wildcard callback', () => {
      const cb = jest.fn();
      km.bindKey('*', cb);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Z' }));
      expect(cb).toHaveBeenCalledWith(expect.any(KeyboardEvent), 'z');
    });
  });

  // ─── unbindKey() / unbindAll() ────────────────────────────────────────────
  describe('unbindKey()', () => {
    it('removes the specified key binding', () => {
      const cb = jest.fn();
      km.bindKey('escape', cb);
      km.unbindKey('escape');
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('unbindAll()', () => {
    it('removes all key bindings', () => {
      const cb = jest.fn();
      km.bindKey('a', cb);
      km.bindKey('b', cb);
      km.unbindAll();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      expect(cb).not.toHaveBeenCalled();
    });
  });

  // ─── isKeyPressed() ───────────────────────────────────────────────────────
  describe('isKeyPressed()', () => {
    it('returns false initially', () => {
      expect(km.isKeyPressed('a')).toBe(false);
    });

    it('returns true while key is held down', () => {
      km.initialize();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(km.isKeyPressed('a')).toBe(true);
    });

    it('returns false after keyup', () => {
      km.initialize();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
      expect(km.isKeyPressed('a')).toBe(false);
    });

    it('is case-insensitive', () => {
      km.initialize();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }));
      expect(km.isKeyPressed('a')).toBe(true);
    });
  });

  // ─── areKeysPressed() ─────────────────────────────────────────────────────
  describe('areKeysPressed()', () => {
    beforeEach(() => km.initialize());

    it('returns true when all listed keys are pressed', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      expect(km.areKeysPressed(['a', 'b'])).toBe(true);
    });

    it('returns false when some keys are not pressed', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(km.areKeysPressed(['a', 'b'])).toBe(false);
    });
  });

  // ─── isAnyKeyPressed() ────────────────────────────────────────────────────
  describe('isAnyKeyPressed()', () => {
    beforeEach(() => km.initialize());

    it('returns true when at least one key is pressed', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      expect(km.isAnyKeyPressed(['a', 'b'])).toBe(true);
    });

    it('returns false when none of the keys are pressed', () => {
      expect(km.isAnyKeyPressed(['a', 'b'])).toBe(false);
    });
  });

  // ─── getPressedKeys() ─────────────────────────────────────────────────────
  describe('getPressedKeys()', () => {
    beforeEach(() => km.initialize());

    it('returns empty array when nothing is pressed', () => {
      expect(km.getPressedKeys()).toEqual([]);
    });

    it('returns currently pressed keys', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      expect(km.getPressedKeys()).toEqual(expect.arrayContaining(['w', 's']));
    });

    it('excludes released keys', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
      expect(km.getPressedKeys()).not.toContain('w');
    });
  });

  // ─── setEnabled() ─────────────────────────────────────────────────────────
  describe('setEnabled()', () => {
    beforeEach(() => km.initialize());

    it('prevents key events from firing when disabled', () => {
      const cb = jest.fn();
      km.bindKey('a', cb);
      km.setEnabled(false);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(cb).not.toHaveBeenCalled();
    });

    it('clears all pressed key states when disabled', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      km.setEnabled(false);
      expect(km.isKeyPressed('w')).toBe(false);
    });

    it('allows events again after re-enabling', () => {
      const cb = jest.fn();
      km.bindKey('a', cb);
      km.setEnabled(false);
      km.setEnabled(true);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });

  // ─── reset() ──────────────────────────────────────────────────────────────
  describe('reset()', () => {
    it('clears all key states', () => {
      km.initialize();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      km.reset();
      expect(km.getPressedKeys()).toEqual([]);
    });
  });

  // ─── cleanup() ────────────────────────────────────────────────────────────
  describe('cleanup()', () => {
    it('removes event listeners so keys no longer register', () => {
      km.initialize();
      const cb = jest.fn();
      km.bindKey('q', cb);
      km.cleanup();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
      expect(cb).not.toHaveBeenCalled();
    });

    it('sets initialized to false', () => {
      km.initialize();
      km.cleanup();
      expect(km.initialized).toBe(false);
    });

    it('is safe to call when not initialized', () => {
      expect(() => km.cleanup()).not.toThrow();
    });
  });
});
