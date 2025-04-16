import { generateThrusterSound } from './generateThrusterSound';

class SoundManager {
  constructor() {
    this.thrusterSound = null;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    
    try {
      this.thrusterSound = generateThrusterSound();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize sound manager:', error);
    }
  }

  startThruster() {
    if (!this.isInitialized) this.initialize();
    this.thrusterSound?.start();
  }

  stopThruster() {
    if (this.isInitialized) {
      this.thrusterSound?.stop();
    }
  }

  cleanup() {
    if (this.isInitialized) {
      this.thrusterSound?.cleanup();
      this.isInitialized = false;
    }
  }
}

// Create a singleton instance
const soundManager = new SoundManager();
export default soundManager; 