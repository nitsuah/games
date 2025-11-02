/**
 * KeyboardManager - Centralized keyboard input handling
 * Manages key bindings, key state tracking, and input callbacks
 */

class KeyboardManager {
  constructor() {
    this.keys = new Map(); // key -> boolean (pressed state)
    this.bindings = new Map(); // key -> callback function
    this.enabled = true;
    this.initialized = false;
  }

  /**
   * Initialize keyboard event listeners
   */
  initialize() {
    if (this.initialized || typeof window === 'undefined') return;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.initialized = true;
    console.log('✅ KeyboardManager initialized');
  }

  /**
   * Handle keydown events
   * @private
   */
  handleKeyDown(event) {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    this.keys.set(key, true);

    // Execute bound callback if exists
    const callback = this.bindings.get(key);
    if (callback && typeof callback === 'function') {
      callback(event);
    }

    // Execute wildcard callback for all keys
    const wildcardCallback = this.bindings.get('*');
    if (wildcardCallback && typeof wildcardCallback === 'function') {
      wildcardCallback(event, key);
    }
  }

  /**
   * Handle keyup events
   * @private
   */
  handleKeyUp(event) {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    this.keys.set(key, false);
  }

  /**
   * Bind a callback to a specific key
   * @param {string} key - Key identifier (e.g., 'w', 'escape', 'arrowup')
   * @param {Function} callback - Function to call when key is pressed
   */
  bindKey(key, callback) {
    if (!this.initialized) this.initialize();
    this.bindings.set(key.toLowerCase(), callback);
  }

  /**
   * Bind multiple keys at once
   * @param {Object} keyBindings - Map of key -> callback
   */
  bindKeys(keyBindings) {
    if (!this.initialized) this.initialize();
    Object.entries(keyBindings).forEach(([key, callback]) => {
      this.bindings.set(key.toLowerCase(), callback);
    });
  }

  /**
   * Unbind a key callback
   * @param {string} key - Key identifier
   */
  unbindKey(key) {
    this.bindings.delete(key.toLowerCase());
  }

  /**
   * Unbind all key callbacks
   */
  unbindAll() {
    this.bindings.clear();
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key - Key identifier
   * @returns {boolean}
   */
  isKeyPressed(key) {
    return this.keys.get(key.toLowerCase()) || false;
  }

  /**
   * Check if multiple keys are pressed (AND logic)
   * @param {string[]} keys - Array of key identifiers
   * @returns {boolean}
   */
  areKeysPressed(keys) {
    return keys.every(key => this.isKeyPressed(key));
  }

  /**
   * Check if any of multiple keys are pressed (OR logic)
   * @param {string[]} keys - Array of key identifiers
   * @returns {boolean}
   */
  isAnyKeyPressed(keys) {
    return keys.some(key => this.isKeyPressed(key));
  }

  /**
   * Get all currently pressed keys
   * @returns {string[]}
   */
  getPressedKeys() {
    const pressed = [];
    this.keys.forEach((isPressed, key) => {
      if (isPressed) pressed.push(key);
    });
    return pressed;
  }

  /**
   * Enable/disable keyboard input
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      // Clear all pressed key states when disabling
      this.keys.forEach((_, key) => {
        this.keys.set(key, false);
      });
    }
  }

  /**
   * Reset all key states
   */
  reset() {
    this.keys.clear();
  }

  /**
   * Clean up event listeners
   */
  cleanup() {
    if (!this.initialized) return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.keys.clear();
    this.bindings.clear();
    this.initialized = false;

    console.log('✅ KeyboardManager cleaned up');
  }
}

// Create singleton instance
const keyboardManager = new KeyboardManager();
export default keyboardManager;
