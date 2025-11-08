/**
 * MouseManager - Centralized mouse input handling
 * Manages mouse position, clicks, pointer lock, and mouse callbacks
 */

class MouseManager {
  constructor() {
    this.position = { x: 0, y: 0 }; // Screen coordinates
    this.normalizedPosition = { x: 0, y: 0 }; // Normalized (-1 to 1)
    this.movement = { x: 0, y: 0 }; // Delta movement
    this.buttons = new Map(); // button -> boolean (pressed state)
    this.clickCallbacks = [];
    this.moveCallbacks = [];
    this.pointerLocked = false;
    this.enabled = true;
    this.initialized = false;
    this.sensitivity = 1.0;
  }

  /**
   * Initialize mouse event listeners
   */
  initialize() {
    if (this.initialized || typeof window === 'undefined') return;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handlePointerLockChange = this.handlePointerLockChange.bind(this);

    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);

    this.initialized = true;
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      console.log('✅ MouseManager initialized');
    }
  }

  /**
   * Handle mousedown events
   * @private
   */
  handleMouseDown(event) {
    if (!this.enabled) return;
    this.buttons.set(event.button, true);
  }

  /**
   * Handle mouseup events
   * @private
   */
  handleMouseUp(event) {
    if (!this.enabled) return;
    this.buttons.set(event.button, false);
  }

  /**
   * Handle mousemove events
   * @private
   */
  handleMouseMove(event) {
    if (!this.enabled) return;

    // Update absolute position
    this.position.x = event.clientX;
    this.position.y = event.clientY;

    // Update normalized position (-1 to 1)
    this.normalizedPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.normalizedPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update movement delta (for pointer lock)
    if (this.pointerLocked) {
      this.movement.x = event.movementX * this.sensitivity;
      this.movement.y = event.movementY * this.sensitivity;
    }

    // Execute move callbacks
    this.moveCallbacks.forEach(callback => {
      callback({
        position: { ...this.position },
        normalized: { ...this.normalizedPosition },
        movement: { ...this.movement },
        pointerLocked: this.pointerLocked,
      });
    });
  }

  /**
   * Handle click events
   * @private
   */
  handleClick(event) {
    if (!this.enabled) return;

    this.clickCallbacks.forEach(callback => {
      callback({
        button: event.button,
        position: { x: event.clientX, y: event.clientY },
        target: event.target,
      });
    });
  }

  /**
   * Handle pointer lock state changes
   * @private
   */
  handlePointerLockChange() {
    this.pointerLocked = document.pointerLockElement !== null;
  }

  /**
   * Request pointer lock on an element
   * @param {HTMLElement} element - Element to lock pointer to (default: document.body)
   */
  async requestPointerLock(element = document.body) {
    if (!this.initialized) this.initialize();

    try {
      await element.requestPointerLock();
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        console.log('✅ Pointer lock requested');
      }
    } catch (error) {
      console.error('❌ Failed to request pointer lock:', error);
    }
  }

  /**
   * Exit pointer lock
   */
  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        console.log('✅ Pointer lock exited');
      }
    }
  }

  /**
   * Register a callback for mouse click events
   * @param {Function} callback - Function to call on click
   */
  onMouseClick(callback) {
    if (!this.initialized) this.initialize();
    this.clickCallbacks.push(callback);
  }

  /**
   * Register a callback for mouse move events
   * @param {Function} callback - Function to call on move
   */
  onMouseMove(callback) {
    if (!this.initialized) this.initialize();
    this.moveCallbacks.push(callback);
  }

  /**
   * Remove a click callback
   * @param {Function} callback - Callback to remove
   */
  removeClickCallback(callback) {
    const index = this.clickCallbacks.indexOf(callback);
    if (index > -1) {
      this.clickCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove a move callback
   * @param {Function} callback - Callback to remove
   */
  removeMoveCallback(callback) {
    const index = this.moveCallbacks.indexOf(callback);
    if (index > -1) {
      this.moveCallbacks.splice(index, 1);
    }
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks() {
    this.clickCallbacks = [];
    this.moveCallbacks = [];
  }

  /**
   * Check if a mouse button is currently pressed
   * @param {number} button - Button index (0: left, 1: middle, 2: right)
   * @returns {boolean}
   */
  isButtonPressed(button) {
    return this.buttons.get(button) || false;
  }

  /**
   * Get current mouse position
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    return { ...this.position };
  }

  /**
   * Get normalized mouse position (-1 to 1)
   * @returns {{x: number, y: number}}
   */
  getNormalizedPosition() {
    return { ...this.normalizedPosition };
  }

  /**
   * Get mouse movement delta (only meaningful with pointer lock)
   * @returns {{x: number, y: number}}
   */
  getMovement() {
    return { ...this.movement };
  }

  /**
   * Check if pointer is locked
   * @returns {boolean}
   */
  isPointerLocked() {
    return this.pointerLocked;
  }

  /**
   * Set mouse sensitivity for pointer lock movement
   * @param {number} sensitivity - Sensitivity multiplier (default: 1.0)
   */
  setSensitivity(sensitivity) {
    this.sensitivity = Math.max(0.1, Math.min(10, sensitivity));
  }

  /**
   * Enable/disable mouse input
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      // Clear all button states when disabling
      this.buttons.clear();
      this.movement.x = 0;
      this.movement.y = 0;
    }
  }

  /**
   * Reset mouse state
   */
  reset() {
    this.buttons.clear();
    this.movement.x = 0;
    this.movement.y = 0;
  }

  /**
   * Clean up event listeners
   */
  cleanup() {
    if (!this.initialized) return;

    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);

    this.clearCallbacks();
    this.buttons.clear();
    this.exitPointerLock();
    this.initialized = false;

    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      console.log('✅ MouseManager cleaned up');
    }
  }
}

// Create singleton instance
const mouseManager = new MouseManager();
export default mouseManager;
